import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
// API URL - torna alla chiamata diretta a EC2 con HTTP
const API_BASE_URL = 'http://13.51.194.249/api';

// Debug: verifica che l'URL sia caricato correttamente
console.log('🔗 API_BASE_URL:', API_BASE_URL);

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

  const refreshUser = async () => {
    if (!user || !user.id) return;
    
    try {
      console.log('🔄 Refreshing user data for ID:', user.id);
      const response = await fetch(`${API_BASE_URL}/user/${user.id}`);
      
      if (response.ok) {
        const userData = await response.json();
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('careerconnect_user', JSON.stringify(updatedUser));
        console.log('✅ User data refreshed:', updatedUser);
      }
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
    }
  };
  
  const value = {
    user,
    login,
    register,
    logout,
    refreshUser,
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
