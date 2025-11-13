/**
 * Marketplace API Client - Wrapper para endpoints de marketplace
 */

import { apiClient } from './client';

export interface MarketplacePrompt {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  promptText: string;
  variables?: any;
  examples?: any;
  price: number;
  downloadCount: number;
  averageRating: number;
  ratingCount: number;
  status: string;
  authorId: string;
  createdAt: string;
}

export interface MarketplaceCharacter {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  personality: string;
  backstory: string;
  avatarUrl?: string;
  voiceSettings?: any;
  systemPrompt: string;
  exampleDialogues?: any;
  price: number;
  downloadCount: number;
  averageRating: number;
  ratingCount: number;
  status: string;
  authorId: string;
  createdAt: string;
}

export const marketplaceApi = {
  prompts: {
    /**
     * Listar prompts
     */
    async list(params?: {
      category?: string;
      tags?: string;
      authorId?: string;
      search?: string;
      minRating?: number;
      sort?: 'popular' | 'recent' | 'top_rated' | 'most_downloaded';
      page?: number;
      limit?: number;
    }) {
      const response: any = await apiClient.get('/api/community/marketplace/prompts', { params });
      return response.data as any;
    },

    /**
     * Obtener prompt por ID
     */
    async getById(id: string) {
      const response: any = await apiClient.get(`/community/marketplace/prompts/${id}`);
      return response.data as any;
    },

    /**
     * Crear prompt
     */
    async create(data: any) {
      const response: any = await apiClient.post('/api/community/marketplace/prompts', data);
      return response.data as any;
    },

    /**
     * Actualizar prompt
     */
    async update(id: string, data: any) {
      const response: any = await apiClient.patch(`/community/marketplace/prompts/${id}`, data);
      return response.data as any;
    },

    /**
     * Eliminar prompt
     */
    async delete(id: string) {
      const response: any = await apiClient.delete(`/community/marketplace/prompts/${id}`);
      return response.data as any;
    },

    /**
     * Descargar prompt
     */
    async download(id: string) {
      const response: any = await apiClient.post(`/community/marketplace/prompts/${id}/download`);
      return response.data as any;
    },

    /**
     * Calificar prompt
     */
    async rate(id: string, rating: number, review?: string) {
      const response: any = await apiClient.post(`/community/marketplace/prompts/${id}/rate`, {
        rating,
        review,
      });
      return response.data as any;
    },

    /**
     * Obtener categorías populares
     */
    async getCategories(limit?: number) {
      const response: any = await apiClient.get('/api/community/marketplace/prompts/categories', {
        params: { limit },
      });
      return response.data as any;
    },

    /**
     * Obtener tags populares
     */
    async getTags(limit?: number) {
      const response: any = await apiClient.get('/api/community/marketplace/prompts/tags', {
        params: { limit },
      });
      return response.data as any;
    },
  },

  characters: {
    /**
     * Listar personajes
     */
    async list(params?: {
      category?: string;
      tags?: string;
      authorId?: string;
      search?: string;
      minRating?: number;
      sort?: 'popular' | 'recent' | 'top_rated' | 'most_downloaded';
      page?: number;
      limit?: number;
    }) {
      const response: any = await apiClient.get('/api/community/marketplace/characters', { params });
      return response.data as any;
    },

    /**
     * Obtener personaje por ID
     */
    async getById(id: string) {
      const response: any = await apiClient.get(`/community/marketplace/characters/${id}`);
      return response.data as any;
    },

    /**
     * Crear personaje
     */
    async create(data: any) {
      const response: any = await apiClient.post('/api/community/marketplace/characters', data);
      return response.data as any;
    },

    /**
     * Actualizar personaje
     */
    async update(id: string, data: any) {
      const response: any = await apiClient.patch(`/community/marketplace/characters/${id}`, data);
      return response.data as any;
    },

    /**
     * Eliminar personaje
     */
    async delete(id: string) {
      const response: any = await apiClient.delete(`/community/marketplace/characters/${id}`);
      return response.data as any;
    },

    /**
     * Descargar personaje
     */
    async download(id: string) {
      const response: any = await apiClient.post(`/community/marketplace/characters/${id}/download`);
      return response.data as any;
    },

    /**
     * Calificar personaje
     */
    async rate(id: string, rating: number, review?: string) {
      const response: any = await apiClient.post(`/community/marketplace/characters/${id}/rate`, {
        rating,
        review,
      });
      return response.data as any;
    },

    /**
     * Importar personaje a agente personal
     */
    async import(id: string, agentName?: string) {
      const response: any = await apiClient.post(`/community/marketplace/characters/${id}/import`, {
        agentName,
      });
      return response.data as any;
    },

    /**
     * Obtener categorías populares
     */
    async getCategories(limit?: number) {
      const response: any = await apiClient.get('/api/community/marketplace/characters/categories', {
        params: { limit },
      });
      return response.data as any;
    },

    /**
     * Obtener tags populares
     */
    async getTags(limit?: number) {
      const response: any = await apiClient.get('/api/community/marketplace/characters/tags', {
        params: { limit },
      });
      return response.data as any;
    },
  },
};
