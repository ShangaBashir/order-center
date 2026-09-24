import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { orderApi } from '../api';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('ordercenter_admin_token');
    const savedUser = localStorage.getItem('ordercenter_admin_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('ordercenter_admin_token');
        localStorage.removeItem('ordercenter_admin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await orderApi.login(email, pass);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('ordercenter_admin_token', data.token);
    localStorage.setItem('ordercenter_admin_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ordercenter_admin_token');
    localStorage.removeItem('ordercenter_admin_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        loading
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
