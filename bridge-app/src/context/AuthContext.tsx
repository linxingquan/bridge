import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Record<string, unknown>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      console.log('[Auth] Found token:', !!storedToken);
      if (storedToken) {
        try {
          const userData = await api.getMe();
          console.log('[Auth] Got user:', userData?._id);
          setUser(userData);
          setToken(storedToken);
        } catch {
          console.log('[Auth] Token invalid, clearing...');
          await AsyncStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('[Auth] Login started');
    const { token, user } = await api.login(email, password);
    console.log('[Auth] Got token:', !!token);
    await AsyncStorage.setItem('token', token);
    setToken(token);
    const fullUser = await api.getMe();
    console.log('[Auth] Got user:', fullUser?._id, fullUser?.profile?.name);
    setUser(fullUser);
  };

  const register = async (email: string, password: string) => {
    const { token, user } = await api.register(email, password);
    await AsyncStorage.setItem('token', token);
    setToken(token);
    const fullUser = await api.getMe();
    setUser(fullUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (updates: Record<string, unknown>) => {
    const updatedUser = await api.updateProfile(updates);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};