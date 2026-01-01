/**
 * API Client
 *
 * Base HTTP client configuration for all API services
 */

import { API_BASE_URL } from '../../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Get auth token from AsyncStorage
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem('@auth_token');
    return token;
  } catch (error) {
    console.error('[API Client] Error getting auth token:', error);
    return null;
  }
}

/**
 * Create default headers
 */
export async function createHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Default API client instance
 */
export const apiClient = {
  baseURL: API_BASE_URL,

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const headers = await createHeaders();
    let url = `${this.baseURL}${endpoint}`;

    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await createHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await createHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await createHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await createHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },
};
