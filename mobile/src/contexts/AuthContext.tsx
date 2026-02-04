/**
 * Contexto de autenticación para la aplicación móvil
 * Using custom JWT authentication system
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '../lib/auth';
import { AuthApiClient } from '../lib/auth/api-client';
import { StorageService } from '../services/storage';
import { API_BASE_URL } from '../config/api.config';

// Crear instancia única del API client para auth
const authApiClient = new AuthApiClient({
  baseURL: API_BASE_URL,
  onUnauthorized: () => {
    console.log('[AuthManager] Handling unauthorized - clearing auth');
    // El logout se manejará desde el contexto
  },
});

// Crear instancia del servicio de autenticación
const authService = new AuthService(authApiClient);

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

      const restoredUser = await authService.restoreSession();

      if (restoredUser) {
        console.log('[Auth] Session restored:', restoredUser.email);
        console.log('[Auth] User plan from storage:', restoredUser.plan);

        // HOTFIX: Verificar si el plan en storage está desactualizado
        // Si es 'free', intentar obtener el plan real del servidor
        if (restoredUser.plan === 'free') {
          console.log('[Auth] Plan is "free", checking server for updated plan...');
          try {
            const freshUser = await authService.getMe();
            console.log('[Auth] Fresh user data from server:', freshUser.plan);
            if (freshUser.plan !== 'free') {
              console.log('[Auth] ✅ Updated plan from free to', freshUser.plan);
              setUser(freshUser);
              return;
            }
          } catch (error) {
            console.log('[Auth] Could not fetch fresh user data, using cached');
          }
        }

        setUser(restoredUser);
      } else {
        console.log('[Auth] No active session');
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

      const userData = await authService.login({
        email,
        password,
      });

      console.log('[Auth] Login successful:', userData.email);
      setUser(userData);
    } catch (error: any) {
      console.error('[Auth] Login exception:', error);
      throw new Error(error?.message || 'Error al iniciar sesión');
    }
  }

  async function register(email: string, password: string, name: string) {
    try {
      console.log('[Auth] Registering:', email);

      const userData = await authService.register({
        email,
        password,
        name,
      });

      console.log('[Auth] Registration successful:', userData.email);
      setUser(userData);
    } catch (error: any) {
      console.error('[Auth] Registration exception:', error);
      throw new Error(error?.message || 'Error al registrarse');
    }
  }

  async function logout() {
    try {
      console.log('[Auth] Logging out...');

      await authService.logout();
      setUser(null);

      console.log('[Auth] Logged out successfully');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
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
