/**
 * Contexto de autenticación para la aplicación móvil
 * Using Better Auth API client (no hooks to avoid React Native issues)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authClient } from '../lib/auth-client';
import { StorageService } from '../services/storage';

interface User {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  plan?: string;
  createdAt?: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  async function loadStoredSession() {
    try {
      console.log('[Auth] Loading stored session...');

      // Try to get session from better-auth
      const response = await authClient.$fetch('/session');

      if (response?.user) {
        console.log('[Auth] Session restored:', response.user.email);
        setUser(response.user as User);
        await StorageService.setUserData(response.user);
      } else {
        console.log('[Auth] No active session');
        await StorageService.clearAll();
      }
    } catch (error) {
      console.log('[Auth] No stored session:', error);
      await StorageService.clearAll();
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      console.log('[Auth] Logging in:', email);

      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        console.error('[Auth] Login failed:', error);
        throw new Error(error.message || 'Error al iniciar sesión');
      }

      if (!data?.user) {
        throw new Error('No user data received');
      }

      console.log('[Auth] Login successful:', data.user.email);
      setUser(data.user as User);
      await StorageService.setUserData(data.user);
    } catch (error: any) {
      console.error('[Auth] Login exception:', error);
      throw new Error(error?.message || 'Error al iniciar sesión');
    }
  }

  async function register(email: string, password: string, name: string) {
    try {
      console.log('[Auth] Registering:', email);

      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        console.error('[Auth] Registration failed:', error);
        throw new Error(error.message || 'Error al registrarse');
      }

      if (!data?.user) {
        throw new Error('No user data received');
      }

      console.log('[Auth] Registration successful:', data.user.email);
      setUser(data.user as User);
      await StorageService.setUserData(data.user);
    } catch (error: any) {
      console.error('[Auth] Registration exception:', error);
      throw new Error(error?.message || 'Error al registrarse');
    }
  }

  async function logout() {
    try {
      console.log('[Auth] Logging out...');

      await authClient.signOut();
      await StorageService.clearAll();
      setUser(null);

      console.log('[Auth] Logged out successfully');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      await StorageService.clearAll();
      setUser(null);
    }
  }

  function updateUser(userData: User) {
    setUser(userData);
    StorageService.setUserData(userData).catch((error) => {
      console.error('[Auth] Error saving user data:', error);
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
