import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { orderApi } from '../api';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<AdminUser>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    isCustomer?: boolean;
    customerId?: string;
  }) => Promise<void>;
  linkCustomerId: (customerId: string) => Promise<{ user: AdminUser; customer: any }>;
  unlinkCustomerId: () => Promise<void>;
  updateCurrentUser: (user: AdminUser, token?: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    
    // Select appropriate storage keys so public customer sessions don't overwrite Admin Dashboard sessions
    let savedToken = isAdminRoute
      ? localStorage.getItem('ordercenter_admin_token')
      : (localStorage.getItem('ordercenter_user_token') || localStorage.getItem('ordercenter_admin_token'));
    let savedUser = isAdminRoute
      ? localStorage.getItem('ordercenter_admin_user')
      : (localStorage.getItem('ordercenter_user_user') || localStorage.getItem('ordercenter_admin_user'));

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        if (isAdminRoute) {
          localStorage.removeItem('ordercenter_admin_token');
          localStorage.removeItem('ordercenter_admin_user');
        } else {
          localStorage.removeItem('ordercenter_user_token');
          localStorage.removeItem('ordercenter_user_user');
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await orderApi.login(email, pass);
    setToken(data.token);
    setUser(data.user);
    if (data.user.role === 'admin') {
      localStorage.setItem('ordercenter_admin_token', data.token);
      localStorage.setItem('ordercenter_admin_user', JSON.stringify(data.user));
    } else {
      localStorage.setItem('ordercenter_user_token', data.token);
      localStorage.setItem('ordercenter_user_user', JSON.stringify(data.user));
    }
    return data.user;
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    isCustomer?: boolean;
    customerId?: string;
  }) => {
    const res = await orderApi.register(data);
    setToken(res.token);
    setUser(res.user);
    // Public registration saves client user keys so Admin dashboard sessions are preserved
    localStorage.setItem('ordercenter_user_token', res.token);
    localStorage.setItem('ordercenter_user_user', JSON.stringify(res.user));
  };

  const updateCurrentUser = (newUser: AdminUser, newToken?: string) => {
    setUser(newUser);
    if (newUser.role === 'admin') {
      localStorage.setItem('ordercenter_admin_user', JSON.stringify(newUser));
      if (newToken) {
        setToken(newToken);
        localStorage.setItem('ordercenter_admin_token', newToken);
      }
    } else {
      localStorage.setItem('ordercenter_user_user', JSON.stringify(newUser));
      if (newToken) {
        setToken(newToken);
        localStorage.setItem('ordercenter_user_token', newToken);
      }
    }
  };

  const linkCustomerId = async (custId: string) => {
    const res = await orderApi.linkCustomerId(custId);
    setToken(res.token);
    setUser(res.user);
    if (res.user.role === 'admin') {
      localStorage.setItem('ordercenter_admin_token', res.token);
      localStorage.setItem('ordercenter_admin_user', JSON.stringify(res.user));
    } else {
      localStorage.setItem('ordercenter_user_token', res.token);
      localStorage.setItem('ordercenter_user_user', JSON.stringify(res.user));
    }
    return res;
  };

  const unlinkCustomerId = async () => {
    const res = await orderApi.unlinkCustomerId();
    setToken(res.token);
    setUser(res.user);
    if (res.user.role === 'admin') {
      localStorage.setItem('ordercenter_admin_token', res.token);
      localStorage.setItem('ordercenter_admin_user', JSON.stringify(res.user));
    } else {
      localStorage.setItem('ordercenter_user_token', res.token);
      localStorage.setItem('ordercenter_user_user', JSON.stringify(res.user));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    if (isAdminRoute) {
      localStorage.removeItem('ordercenter_admin_token');
      localStorage.removeItem('ordercenter_admin_user');
    } else {
      localStorage.removeItem('ordercenter_user_token');
      localStorage.removeItem('ordercenter_user_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        register,
        linkCustomerId,
        unlinkCustomerId,
        updateCurrentUser,
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
