/**
 * Contexto de autenticación para la aplicación móvil
 * FIXED: Manejo robusto de sesiones sin race conditions
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StorageService } from '../services/storage';
import { AuthService, apiClient, initializeApiClient, authManager } from '../services/api';

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
    // Registrar callback para manejar unauthorized
    authManager.setUnauthorizedCallback(() => {
      console.log('[AuthContext] Session expired, clearing user');
      setUser(null);
    });

    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      console.log('[Auth] Loading stored session...');

      // Initialize API client with stored token
      const hasToken = await initializeApiClient();

      if (!hasToken) {
        console.log('[Auth] No token found, skipping validation');
        setLoading(false);
        return;
      }

      // Load stored user data
      const userData = await StorageService.getUserData<User>();

      if (!userData) {
        console.log('[Auth] No user data found, clearing token');
        apiClient.clearAuthToken();
        await StorageService.clearAll();
        setLoading(false);
        return;
      }

      // Set user immediately (optimistic)
      setUser(userData);
      console.log('[Auth] Session restored:', userData.email);

      // Validate token in background (don't block UI)
      validateTokenInBackground(userData);
      setLoading(false);
    } catch (error) {
      console.error('[Auth] Error loading session:', error);
      await StorageService.clearAll();
      apiClient.clearAuthToken();
      setUser(null);
      setLoading(false);
    }
  }

  /**
   * Validar token en segundo plano
   * Si falla, el interceptor de Axios llamará a onUnauthorized
   */
  async function validateTokenInBackground(userData: User) {
    try {
      const response: any = await AuthService.getMe();
      const freshUser = response.user || response;

      // Actualizar datos si cambiaron
      if (JSON.stringify(freshUser) !== JSON.stringify(userData)) {
        console.log('[Auth] User data updated from server');
        setUser(freshUser);
        await StorageService.setUserData(freshUser);
      } else {
        console.log('[Auth] Token validated successfully');
      }
    } catch (error: any) {
      // Si es 401, onUnauthorized ya se encargó
      if (error?.response?.status === 401) {
        console.log('[Auth] Token invalid, onUnauthorized will handle it');
        return;
      }

      // Otros errores (red, etc) - mantener sesión offline
      console.warn('[Auth] Token validation failed (network?), keeping session:', error.message);
    }
  }

  async function login(email: string, password: string) {
    try {
      console.log('[Auth] Logging in:', email);

      // Marcar que estamos autenticando para ignorar 401s transitorios
      authManager.startAuthenticating();

      const response: any = await AuthService.login(email, password);

      if (!response.token || !response.user) {
        throw new Error('Invalid login response from server');
      }

      console.log('[Auth] Login successful:', response.user.email);

      // CRITICAL: Set token on API client FIRST (in-memory)
      apiClient.setAuthToken(response.token);

      // Then persist to storage (can fail without breaking session)
      await Promise.all([
        StorageService.setToken(response.token),
        StorageService.setUserData(response.user),
      ]);

      // Finally update state
      setUser(response.user);

      // Marcar autenticación como completa
      authManager.finishAuthenticating();
    } catch (error: any) {
      console.error('[Auth] Login failed:', error);

      // Limpiar en caso de error
      apiClient.clearAuthToken();
      await StorageService.clearAll();
      authManager.reset();

      throw new Error(
        error?.response?.data?.message ||
        error?.message ||
        'Error al iniciar sesión'
      );
    }
  }

  async function register(email: string, password: string, name: string) {
    try {
      console.log('[Auth] Registering:', email);

      // Marcar que estamos autenticando para ignorar 401s transitorios
      authManager.startAuthenticating();

      const response: any = await AuthService.register(email, password, name);

      if (!response.token || !response.user) {
        throw new Error('Invalid register response from server');
      }

      console.log('[Auth] Registration successful:', response.user.email);

      // CRITICAL: Set token on API client FIRST (in-memory)
      apiClient.setAuthToken(response.token);

      // Then persist to storage (can fail without breaking session)
      await Promise.all([
        StorageService.setToken(response.token),
        StorageService.setUserData(response.user),
      ]);

      // Finally update state
      setUser(response.user);

      // Marcar autenticación como completa
      authManager.finishAuthenticating();
    } catch (error: any) {
      console.error('[Auth] Registration failed:', error);

      // Limpiar en caso de error
      apiClient.clearAuthToken();
      await StorageService.clearAll();
      authManager.reset();

      throw new Error(
        error?.response?.data?.message ||
        error?.message ||
        'Error al registrarse'
      );
    }
  }

  async function logout() {
    try {
      console.log('[Auth] Logging out...');

      // AuthService.logout ya limpia todo
      await AuthService.logout();

      // Reset auth manager
      authManager.reset();

      // Clear state
      setUser(null);

      console.log('[Auth] Logged out successfully');
    } catch (error) {
      console.error('[Auth] Logout error:', error);

      // Asegurar que todo se limpió
      await StorageService.clearAll();
      apiClient.clearAuthToken();
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
