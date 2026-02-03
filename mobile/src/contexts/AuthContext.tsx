/**
 * Contexto de autenticación para la aplicación móvil
 * Using Better Auth for authentication
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authClient } from '../lib/auth-client';

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
  // Use Better Auth's session hook
  const { data: session, isPending: sessionLoading, error } = authClient.useSession();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mark as loaded once session check completes
    if (!sessionLoading) {
      setLoading(false);
    }

    if (error) {
      console.error('[Auth] Session error:', error);
      setLoading(false);
    }
  }, [sessionLoading, error]);

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

      console.log('[Auth] Login successful:', data?.user?.email);
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

      console.log('[Auth] Registration successful:', data?.user?.email);
    } catch (error: any) {
      console.error('[Auth] Registration exception:', error);
      throw new Error(error?.message || 'Error al registrarse');
    }
  }

  async function logout() {
    try {
      console.log('[Auth] Logging out...');

      await authClient.signOut();

      console.log('[Auth] Logged out successfully');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    }
  }

  function updateUser(_userData: User) {
    // With better-auth, we don't manually update user
    // The session hook will automatically update
    console.log('[Auth] User update requested - will sync via session');
  }

  // Extract user from session
  const user = session?.user as User | null;

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
