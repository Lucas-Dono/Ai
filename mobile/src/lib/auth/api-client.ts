/**
 * API Client con autenticación JWT automática
 *
 * Features:
 * - Auto-attach JWT tokens a requests
 * - Auto-refresh de tokens cuando expiran
 * - Race condition protection durante refresh
 * - Retry automático después de refresh exitoso
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { JWTManager } from './jwt-manager';
import type { AuthResponse } from './types';

export interface AuthApiClientConfig {
  baseURL: string;
  onUnauthorized?: () => void;
  refreshEndpoint?: string;
}

export class AuthApiClient {
  private client: AxiosInstance;
  private config: AuthApiClientConfig;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(config: AuthApiClientConfig) {
    this.config = {
      refreshEndpoint: '/api/auth/refresh',
      ...config,
    };

    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Origin': config.baseURL, // Requerido por el servidor
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor: Auto-attach token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        console.log('[AuthApiClient] 🌐 Outgoing request:', config.method?.toUpperCase(), config.url);
        console.log('[AuthApiClient] 📦 Request data:', JSON.stringify(config.data, null, 2));
        console.log('[AuthApiClient] 📋 Request headers (before):', JSON.stringify(config.headers, null, 2));

        const token = await JWTManager.getAccessToken();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('[AuthApiClient] 🔑 Token attached to request');
        } else {
          console.log('[AuthApiClient] ⚠️ No valid token found');
        }

        console.log('[AuthApiClient] 📋 Request headers (after):', JSON.stringify(config.headers, null, 2));

        return config;
      },
      (error) => {
        console.error('[AuthApiClient] ❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor: Handle 401 and auto-refresh
    this.client.interceptors.response.use(
      (response) => {
        console.log('[AuthApiClient] ✅ Response received:', response.status, response.config.url);
        console.log('[AuthApiClient] 📥 Response data:', JSON.stringify(response.data, null, 2));
        return response;
      },
      async (error: AxiosError) => {
        console.log('[AuthApiClient] ❌ Response error:', error.response?.status, error.config?.url);
        console.log('[AuthApiClient] ❌ Error data:', JSON.stringify(error.response?.data, null, 2));
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Endpoints que NO deben intentar refresh cuando reciben 401
        const authEndpoints = ['/login', '/register', '/refresh', '/sign-in', '/sign-up'];
        const isAuthEndpoint = authEndpoints.some(endpoint =>
          originalRequest.url?.includes(endpoint)
        );

        // Si es 401 y no es un endpoint de autenticación
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !isAuthEndpoint
        ) {
          console.log('[AuthApiClient] 🔄 401 detected, attempting token refresh');

          // Marcar request como retry para evitar loops infinitos
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();

            if (newToken) {
              // Actualizar token en el request original
              originalRequest.headers.Authorization = `Bearer ${newToken}`;

              // Reintentar request original
              console.log('[AuthApiClient] ✅ Retrying original request with new token');
              return this.client(originalRequest);
            } else {
              // Refresh falló, notificar logout
              console.log('[AuthApiClient] 🔒 Refresh failed, logging out');
              if (this.config.onUnauthorized) {
                this.config.onUnauthorized();
              }
              return Promise.reject(error);
            }
          } catch (refreshError) {
            console.error('[AuthApiClient] ❌ Token refresh error:', refreshError);
            if (this.config.onUnauthorized) {
              this.config.onUnauthorized();
            }
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Refresh token con protección contra race conditions
   */
  private async refreshToken(): Promise<string | null> {
    // Si ya hay un refresh en progreso, esperar a que termine
    if (this.isRefreshing && this.refreshPromise) {
      console.log('[AuthApiClient] ⏳ Refresh already in progress, waiting...');
      return this.refreshPromise;
    }

    // Marcar que estamos refreshing
    this.isRefreshing = true;

    this.refreshPromise = (async () => {
      try {
        const refreshToken = await JWTManager.getRefreshToken();

        if (!refreshToken) {
          console.error('[AuthApiClient] ❌ No refresh token available');
          return null;
        }

        console.log('[AuthApiClient] 🔄 Calling refresh endpoint');

        // Llamar endpoint de refresh (sin interceptores para evitar loops)
        const response = await axios.post<AuthResponse>(
          `${this.config.baseURL}${this.config.refreshEndpoint}`,
          { refreshToken },
          { timeout: 10000 }
        );

        const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // Guardar nuevos tokens
        await JWTManager.saveTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken || refreshToken,
        });

        console.log('[AuthApiClient] ✅ Token refreshed successfully');

        return newAccessToken;
      } catch (error) {
        console.error('[AuthApiClient] ❌ Refresh token failed:', error);
        await JWTManager.clearTokens();
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Set authentication tokens manually (after login/register)
   */
  async setAuthTokens(accessToken: string, refreshToken?: string): Promise<void> {
    console.log('[AuthApiClient] 💾 setAuthTokens called');
    console.log('[AuthApiClient] 🎟️ Access token present:', !!accessToken);
    console.log('[AuthApiClient] 🎟️ Access token length:', accessToken?.length);
    console.log('[AuthApiClient] 🎟️ Refresh token present:', !!refreshToken);
    console.log('[AuthApiClient] 🎟️ Refresh token length:', refreshToken?.length);

    await JWTManager.saveTokens({ accessToken, refreshToken });

    console.log('[AuthApiClient] ✅ Tokens saved via JWTManager');
    console.log('[AuthApiClient] 🔐 Tokens saved');
  }

  /**
   * Clear all authentication data (logout)
   */
  async clearAuth(): Promise<void> {
    await JWTManager.clearTokens();
    console.log('[AuthApiClient] 🔓 Auth cleared');
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return await JWTManager.hasValidSession();
  }

  // ===== HTTP Methods =====

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Upload file con FormData
   */
  async uploadFile<T>(
    url: string,
    file: Blob,
    fieldName = 'file',
    additionalData?: Record<string, string>
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Obtener la instancia de Axios directamente (para casos avanzados)
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}
