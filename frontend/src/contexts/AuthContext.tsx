import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async (savedToken: string) => {
    try {
      const userData = await authApi.me();
      setUser(userData);
      localStorage.setItem('autoworth_user', JSON.stringify(userData));
    } catch {
      localStorage.removeItem('autoworth_token');
      localStorage.removeItem('autoworth_user');
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('autoworth_token');
    if (savedToken) {
      setToken(savedToken);
      loadUser(savedToken).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [loadUser]);

  const login = async (email: string, password: string, rememberMe = false) => {
    const data = await authApi.login({ email, password, remember_me: rememberMe });
    setToken(data.access_token);
    localStorage.setItem('autoworth_token', data.access_token);
    const userData = await authApi.me();
    setUser(userData);
    localStorage.setItem('autoworth_user', JSON.stringify(userData));
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('autoworth_token');
    localStorage.removeItem('autoworth_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) await loadUser(token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
