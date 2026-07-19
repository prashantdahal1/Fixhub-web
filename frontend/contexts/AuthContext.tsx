"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  _id: string;
  email: string;
  role: string;
  profilePicture?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  country?: string;
  cityState?: string;
  username?: string;
  isVerified?: boolean;
  addresses?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/v1/auth/whoami', {
        headers,
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        // Express returns: { success: true, data: { ...userObject } }
        setUser(data.data || null);
      } else {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only intercept ?token= on the root path (Google OAuth redirect)
    // On /reset-password, the ?token= is a password reset token — don't touch it
    if (typeof window !== 'undefined') {
      const isRootPath = window.location.pathname === '/';
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      if (tokenFromUrl && isRootPath) {
        localStorage.setItem('token', tokenFromUrl);
        window.location.href = '/dashboard';
        return; // Stop execution, let the redirect happen
      }
    }
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, fetchUser }}>
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
