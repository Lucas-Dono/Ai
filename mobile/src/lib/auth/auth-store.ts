/**
 * Zustand Auth Store - State management para autenticación
 *
 * Reemplaza AuthContext con mejor performance y menos boilerplate
 */

import { create } from 'zustand';
import { AuthService } from './auth-service';
import { AuthApiClient } from './api-client';
import { API_BASE_URL } from '../../config/api.config';
import type { AuthUser, LoginCredentials, RegisterCredentials } from './types';

interface AuthState {
  // Estado
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Acciones
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
  clearError: () => void;
}

// Crear instancia del API Client y Service
const apiClient = new AuthApiClient({
  baseURL: API_BASE_URL,
  onUnauthorized: () => {
    // Auto-logout cuando el token es inválido
    useAuthStore.getState().logout();
  },
});

const authService = new AuthService(apiClient);

/**
 * Auth Store - Zustand
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // Estado inicial
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  /**
   * Login
   */
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const user = await authService.login(credentials);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Error al iniciar sesión',
      });

      throw error;
    }
  },

  /**
   * Register
   */
  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const user = await authService.register(credentials);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Error al registrar usuario',
      });

      throw error;
    }
  },

  /**
   * Logout
   */
  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      await authService.logout();

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      // Siempre limpiar el estado local aunque falle el logout en servidor
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Error al cerrar sesión',
      });
    }
  },

  /**
   * Restaurar sesión desde tokens guardados
   */
  restoreSession: async () => {
    set({ isLoading: true, error: null });

    try {
      const user = await authService.restoreSession();

      if (user) {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Error al restaurar sesión',
      });
    }
  },

  /**
   * Actualizar información del usuario
   */
  updateUser: async (updates: Partial<AuthUser>) => {
    set({ isLoading: true, error: null });

    try {
      const updatedUser = await authService.updateUser(updates);

      set({
        user: updatedUser,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al actualizar usuario',
      });

      throw error;
    }
  },

  /**
   * Limpiar error
   */
  clearError: () => {
    set({ error: null });
  },
}));

/**
 * Hook para obtener solo el usuario (evita re-renders innecesarios)
 */
export const useAuthUser = () => useAuthStore((state) => state.user);

/**
 * Hook para obtener solo el estado de autenticación
 */
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);

/**
 * Hook para obtener solo el estado de carga
 */
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);

/**
 * Hook para obtener solo las acciones (nunca cambia, no causa re-renders)
 */
export const useAuthActions = () =>
  useAuthStore((state) => ({
    login: state.login,
    register: state.register,
    logout: state.logout,
    restoreSession: state.restoreSession,
    updateUser: state.updateUser,
    clearError: state.clearError,
  }));

/**
 * Exportar el API Client para uso directo en services
 */
export { apiClient as authApiClient, authService };
