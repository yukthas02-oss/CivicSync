import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('civicsync_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('civicsync_access_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login/', { username, password });
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('civicsync_access_token', access);
      localStorage.setItem('civicsync_refresh_token', refresh);
      localStorage.setItem('civicsync_user', JSON.stringify(userData));

      setToken(access);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.detail || error.response?.data?.error || 'Invalid credentials.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register/', userData);
      // Auto login after registration
      return await login(userData.username, userData.password);
    } catch (error) {
      const errors = error.response?.data || {};
      const firstError = Object.values(errors).flat()[0] || 'Registration failed.';
      return { success: false, message: firstError };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('civicsync_access_token');
    localStorage.removeItem('civicsync_refresh_token');
    localStorage.removeItem('civicsync_user');
    setUser(null);
    setToken(null);
  };

  const isRole = (role) => user?.role === role;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        logout,
        isRole,
        isCitizen: isRole('CITIZEN'),
        isAdmin: isRole('ADMIN') || user?.is_staff,
        isUniversity: isRole('UNIVERSITY'),
        isIndustry: isRole('INDUSTRY'),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
