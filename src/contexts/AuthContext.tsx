import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  phone?: string;
  role: 'USER' | 'ADMIN' | 'ARTIST' | 'BRAND_PARTNER';
  profilePicture?: string;
  bio?: string;
  points: number;
  totalWasteRecycled: number;
  co2Saved: number;
  createdAt: string;
  isArtist?: boolean;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    username?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and user data on app start
    const savedToken = localStorage.getItem('reloop_token');
    const savedUser = localStorage.getItem('reloop_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Refresh user data from server
        refreshUser();
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(email, password);
      
      const { access_token, user: userData } = response;
      
      setToken(access_token);
      setUser(userData);
      
      localStorage.setItem('reloop_token', access_token);
      localStorage.setItem('reloop_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    username?: string;
    phone?: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await apiClient.register(userData);
      
      const { access_token, user: newUser } = response;
      
      setToken(access_token);
      setUser(newUser);
      
      localStorage.setItem('reloop_token', access_token);
      localStorage.setItem('reloop_user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('reloop_token');
    localStorage.removeItem('reloop_user');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await apiClient.updateProfile(data);
      setUser(updatedUser);
      localStorage.setItem('reloop_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await apiClient.getProfile();
      setUser(userData);
      localStorage.setItem('reloop_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // If refresh fails, logout the user
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
