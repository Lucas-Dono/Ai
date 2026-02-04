/**
 * Instancia del cliente API para la aplicación móvil
 * FIXED: Sistema de autenticación robusto sin race conditions
 */

import { ApiClient, API_ENDPOINTS } from '@creador-ia/shared';
import { StorageService } from './storage';
import { API_BASE_URL, buildAvatarUrl as buildAvatarUrlHelper } from '../config/api.config';
import { JWTManager } from '../lib/auth/jwt-manager';

/**
 * Sistema de autenticación global para evitar race conditions
 * Usa un flag para evitar que onUnauthorized se ejecute múltiples veces
 * MEJORADO: Ignora 401s transitorios durante login/registro
 */
class AuthManager {
  private isHandlingUnauthorized = false;
  private unauthorizedCallback: (() => void) | null = null;
  private isAuthenticating = false; // Flag para login/register en progreso
  private lastAuthTime = 0; // Timestamp del último login exitoso

  setUnauthorizedCallback(callback: () => void) {
    this.unauthorizedCallback = callback;
  }

  /**
   * Marcar que estamos en proceso de autenticación
   * Esto previene que 401s transitorios cierren la sesión
   */
  startAuthenticating() {
    this.isAuthenticating = true;
    console.log('[AuthManager] Authentication started, ignoring 401s temporarily');
  }

  /**
   * Marcar que la autenticación completó exitosamente
   */
  finishAuthenticating() {
    this.isAuthenticating = false;
    this.lastAuthTime = Date.now();
    console.log('[AuthManager] Authentication completed successfully');
  }

  async handleUnauthorized(): Promise<void> {
    // Ignorar 401s durante el proceso de autenticación
    if (this.isAuthenticating) {
      console.log('[AuthManager] Ignoring 401 during authentication flow');
      return;
    }

    // Ignorar 401s en los primeros 2 segundos después de login
    // Esto previene race conditions donde el token aún no se propagó
    const timeSinceAuth = Date.now() - this.lastAuthTime;
    if (timeSinceAuth < 2000) {
      console.log('[AuthManager] Ignoring 401 shortly after login (race condition)');
      return;
    }

    // Evitar race conditions - solo ejecutar una vez
    if (this.isHandlingUnauthorized) {
      console.log('[AuthManager] Already handling unauthorized, skipping');
      return;
    }

    this.isHandlingUnauthorized = true;
    console.log('[AuthManager] Handling unauthorized - clearing auth');

    try {
      // Limpiar todo
      await StorageService.clearAll();
      apiClient.clearAuthToken();

      // Notificar al AuthContext
      if (this.unauthorizedCallback) {
        this.unauthorizedCallback();
      }
    } finally {
      // Reset flag después de un delay
      setTimeout(() => {
        this.isHandlingUnauthorized = false;
      }, 1000);
    }
  }

  reset() {
    this.isHandlingUnauthorized = false;
    this.isAuthenticating = false;
  }
}

export const authManager = new AuthManager();

// Create API client instance
export const apiClient = new ApiClient({
  baseURL: API_BASE_URL,
  onUnauthorized: () => {
    authManager.handleUnauthorized();
  },
});

// Agregar interceptor para inyectar JWT tokens automáticamente
if (apiClient['client']) {
  const axiosInstance = apiClient['client'];

  axiosInstance.interceptors.request.use(
    async (config: any) => {
      // Agregar Origin header (requerido por el servidor)
      if (!config.headers.Origin) {
        config.headers.Origin = API_BASE_URL;
      }

      const token = await JWTManager.getAccessToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[ApiClient] 🔑 JWT token attached to request');
      } else {
        console.log('[ApiClient] ⚠️  No auth token available');
      }

      return config;
    },
    (error: any) => {
      console.error('[ApiClient] ❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  console.log('[ApiClient] ✅ JWT interceptor installed');
}

// Re-exportar helper desde configuración centralizada
export const buildAvatarUrl = buildAvatarUrlHelper;

// Exportar endpoints para fácil acceso
export { API_ENDPOINTS };

// Servicios específicos del API
export const AgentsService = {
  async list(params?: { page?: number; limit?: number }) {
    return await apiClient.get(API_ENDPOINTS.AGENTS.LIST, { params });
  },

  async get(id: string) {
    return await apiClient.get(API_ENDPOINTS.AGENTS.GET(id));
  },

  async getById(id: string) {
    return await apiClient.get(API_ENDPOINTS.AGENTS.GET(id));
  },

  async create(data: any) {
    return await apiClient.post(API_ENDPOINTS.AGENTS.CREATE, data);
  },

  async update(id: string, data: any) {
    return await apiClient.put(API_ENDPOINTS.AGENTS.UPDATE(id), data);
  },

  async delete(id: string) {
    return await apiClient.delete(API_ENDPOINTS.AGENTS.DELETE(id));
  },
};

export const WorldsService = {
  async list(params?: { page?: number; limit?: number }) {
    return await apiClient.get(API_ENDPOINTS.WORLDS.LIST, { params });
  },

  async get(id: string) {
    return await apiClient.get(API_ENDPOINTS.WORLDS.GET(id));
  },

  async create(data: any) {
    return await apiClient.post(API_ENDPOINTS.WORLDS.CREATE, data);
  },

  async sendMessage(worldId: string, content: string, messageType?: string) {
    return await apiClient.post(API_ENDPOINTS.WORLDS.MESSAGE(worldId), {
      content,
      messageType,
    });
  },

  async start(worldId: string) {
    return await apiClient.post(API_ENDPOINTS.WORLDS.START(worldId));
  },

  async stop(worldId: string) {
    return await apiClient.post(API_ENDPOINTS.WORLDS.STOP(worldId));
  },

  async trending() {
    return await apiClient.get(API_ENDPOINTS.WORLDS.TRENDING);
  },

  async predefined() {
    return await apiClient.get(API_ENDPOINTS.WORLDS.PREDEFINED);
  },
};

export const RatingsService = {
  async rateAgent(agentId: string, rating: number, review?: string) {
    return await apiClient.post(`/api/agents/${agentId}/rating`, {
      rating,
      review,
    });
  },

  async getAgentRating(agentId: string) {
    return await apiClient.get(`/api/agents/${agentId}/rating`);
  },

  async getAgentReviews(agentId: string, params?: { page?: number; limit?: number }) {
    return await apiClient.get(`/api/agents/${agentId}/reviews`, { params });
  },

  async updateRating(agentId: string, rating: number, review?: string) {
    return await apiClient.put(`/api/agents/${agentId}/rating`, {
      rating,
      review,
    });
  },

  async deleteRating(agentId: string) {
    return await apiClient.delete(`/api/agents/${agentId}/rating`);
  },
};

// Re-export all API clients from the api/ folder
export * from './api/community.api';
export * from './api/post.api';
export * from './api/comment.api';
export * from './api/feed.api';
export * from './api/reputation.api';
export * from './api/event.api';
export * from './api/marketplace.api';
export * from './api/research.api';
export * from './api/notification.api';
export * from './api/messaging.api';
