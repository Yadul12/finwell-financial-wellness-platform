import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';
import { apiClient } from '../api/client.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  demoLogin: (email?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initAuth() {
      try {
        const token = apiClient.getToken();
        if (token) {
          const profile = await apiClient.getProfile();
          setUser(profile);
        } else {
          // Auto-login with default demo account (Alex Chen) for seamless first-load review
          const res = await apiClient.demoLogin('alex.chen@finwell.corp');
          setUser(res.user);
        }
      } catch (err: any) {
        console.warn('Initial session check failed, falling back to demo account:', err);
        try {
          const res = await apiClient.demoLogin('alex.chen@finwell.corp');
          setUser(res.user);
        } catch (demoErr: any) {
          setError(demoErr.message || 'Authentication initialization failed.');
        }
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await apiClient.login(email, password);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      throw err;
    }
  };

  const register = async (payload: any) => {
    setError(null);
    try {
      const res = await apiClient.register(payload);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    }
  };

  const demoLogin = async (email: string = 'alex.chen@finwell.corp') => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.demoLogin(email);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiClient.removeToken();
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      const updated = await apiClient.updateProfile(updates);
      setUser(updated);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await apiClient.getProfile();
      setUser(profile);
    } catch (err: any) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        demoLogin,
        logout,
        updateUser,
        refreshUser,
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
