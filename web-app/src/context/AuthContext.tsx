import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const AUTH_TOKEN_KEY = 'neuro-recover-token';
const AUTH_USER_KEY = 'neuro-recover-user';

interface User {
  id: string;
  name: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USER = { id: 'demo', name: 'Demo User' };
const DEMO_PASS = 'demo';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem(AUTH_TOKEN_KEY);
    const u = localStorage.getItem(AUTH_USER_KEY);
    if (t && u) {
      try {
        setToken(t);
        setUser(JSON.parse(u));
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    if (username === 'demo' && password === DEMO_PASS) {
      const t = 'demo-jwt-' + Date.now();
      setToken(t);
      setUser(DEMO_USER);
      localStorage.setItem(AUTH_TOKEN_KEY, t);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(DEMO_USER));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useAuthOptional() {
  return useContext(AuthContext);
}
