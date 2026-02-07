/**
 * Cliente API compartido para web y mobile
 * REFACTORED: Token management con soporte automático para JWTManager
 */

import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  onUnauthorized?: () => void;
  /**
   * Función opcional para obtener el token dinámicamente
   * En mobile: usar JWTManager.getAccessToken()
   * En web: usar getSession() o similar
   */
  getToken?: () => Promise<string | null>;
}

export class ApiClient {
  private client: AxiosInstance;
  private config: ApiClientConfig;
  private authToken: string | null = null;

  constructor(config: ApiClientConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token de autenticación
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        console.log(`[ApiClient] 🔵 REQUEST: ${config.method?.toUpperCase()} ${config.url}`);

        // Intentar obtener token dinámicamente si está disponible el getter
        let token = this.authToken;
        if (this.config.getToken) {
          try {
            const dynamicToken = await this.config.getToken();
            if (dynamicToken) {
              token = dynamicToken;
              console.log(`[ApiClient] 🔑 Token obtained from getToken()`);
            }
          } catch (error) {
            console.error(`[ApiClient] ❌ Error getting dynamic token:`, error);
          }
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`[ApiClient] 🔑 Auth token attached:`, token.substring(0, 30) + '...');
        } else {
          console.log(`[ApiClient] ⚠️  No auth token available`);
        }
        return config;
      },
      (error) => {
        console.error('[ApiClient] ❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar errores de autenticación
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[ApiClient] ✅ RESPONSE: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        const status = error.response?.status;
        const url = error.config?.url;
        console.error(`[ApiClient] ❌ RESPONSE ERROR: ${status} ${url}`);

        if (status === 401) {
          console.error('[ApiClient] 🔒 UNAUTHORIZED - Token might be invalid or expired');
          if (this.config.onUnauthorized) {
            this.config.onUnauthorized();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authentication token manually
   * Call this after login or when restoring session
   * @deprecated Usar getToken en config para obtención dinámica
   */
  setAuthToken(token: string | null): void {
    if (token) {
      console.log('[ApiClient] 🔐 Setting auth token:', token.substring(0, 30) + '...');
    } else {
      console.log('[ApiClient] 🔓 Clearing auth token');
    }
    this.authToken = token;
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Clear authentication token
   * Call this on logout
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Método especial para subir archivos
  async uploadFile<T>(
    url: string,
    file: File | Blob,
    fieldName = 'file',
    additionalData?: Record<string, string>
  ) {
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
}

// Tipos para las respuestas del API
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
