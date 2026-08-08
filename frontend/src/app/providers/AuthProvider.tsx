import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, LoginCredentials } from '../../types/api.types';
import { authService } from '../../services/auth';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: ('Admin' | 'Sales Manager' | 'Sales Representative')[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('erp_token');
      const storedUser = localStorage.getItem('erp_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Optionally verify session on boot
        try {
          const res = await authService.me();
          setUser(res.data);
          localStorage.setItem('erp_user', JSON.stringify(res.data));
        } catch (error) {
          // Token is invalid/expired (handled by axios interceptor too)
          handleLogoutLocal();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      const { token: receivedToken, user: receivedUser } = res.data;
      
      setToken(receivedToken);
      setUser(receivedUser);
      
      localStorage.setItem('erp_token', receivedToken);
      localStorage.setItem('erp_user', JSON.stringify(receivedUser));
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutLocal = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      handleLogoutLocal();
      setLoading(false);
    }
  };

  const hasRole = (roles: ('Admin' | 'Sales Manager' | 'Sales Representative')[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
