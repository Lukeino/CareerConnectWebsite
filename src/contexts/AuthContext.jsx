import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_BASE_URL = 'http://localhost:3001/api';

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
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        console.log('👤 User restored from localStorage:', parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('careerconnect_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔄 Attempting login via API...');
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Login successful:', data.user);
        setUser(data.user);
        localStorage.setItem('careerconnect_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        console.error('❌ Login failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: 'Connection error' };
    }
  };

  const register = async (userData) => {
    try {
      console.log('🔄 Starting registration via API...', userData);
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Registration successful:', data.user);
        setUser(data.user);
        localStorage.setItem('careerconnect_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        console.error('❌ Registration failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      return { success: false, error: 'Connection error' };
    }
  };

  const logout = () => {
    console.log('👋 Logging out user');
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
    isCandidate: user?.user_type === 'candidate',
    isAdmin: user?.user_type === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
