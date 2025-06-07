import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('careerconnect_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('careerconnect_user');
      }
    }
    setLoading(false);
  }, []);  const login = async (email, password) => {
    try {
      const { userService } = await import('../services/hybridDatabase.js');
      const authenticatedUser = await userService.authenticateUser(email, password);
      
      setUser(authenticatedUser);
      localStorage.setItem('careerconnect_user', JSON.stringify(authenticatedUser));
      
      return { success: true, user: authenticatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };  const register = async (userData) => {
    try {
      const { userService } = await import('../services/hybridDatabase.js');
      const newUser = await userService.createUser(userData);
      
      setUser(newUser);
      localStorage.setItem('careerconnect_user', JSON.stringify(newUser));
      
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('careerconnect_user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isRecruiter: user?.user_type === 'recruiter',
    isCandidate: user?.user_type === 'candidate'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
