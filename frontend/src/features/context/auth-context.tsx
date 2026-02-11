'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/src/shared/api/base';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar: string;
    rating: number;
    reviews_count: number;
    city: string;
  };
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (token: string, refresh: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();
  const clearAuth = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setAccessToken(null);
    setUser(null);
  };
  const [isInitialized, setIsInitialized] = useState(false);

  
  function safeParseUser(data: string | null): User | null {
    if (!data) return null;
    try {
      return JSON.parse(data) as User;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setAccessToken(token);
      setUser(safeParseUser(userData));
      setIsInitialized(true);
      return;
    }

    if (refresh) {
      fetch(`${API_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.access) {
            localStorage.setItem('access_token', data.access);
            setAccessToken(data.access);
            setUser(safeParseUser(userData));
          } else {
            clearAuth();
          }
        })
        .catch(clearAuth)
        .finally(() => {
          setIsInitialized(true);
        });
    } else {
      setIsInitialized(true);
    }
  }, []);

  const login = (token: string, refresh: string, userData: User) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    setAccessToken(token);
    setUser(userData);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
    setAccessToken(null);
    setUser(null);
    // router.push можно дергать только на клиенте
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
  };

  const updateUser = (userData: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setUser(userData);
  };

  const logout = () => {
    handleLogout();
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, logout, updateUser, isInitialized }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
