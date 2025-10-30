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
      const response = await apiClient.get('/api/community/marketplace/prompts', { params }) as any;
      return response.data;
    },

    /**
     * Obtener prompt por ID
     */
    async getById(id: string) {
      const response = await apiClient.get(`/community/marketplace/prompts/${id}`) as any;
      return response.data;
    },

    /**
     * Crear prompt
     */
    async create(data: any) {
      const response = await apiClient.post('/api/community/marketplace/prompts', data) as any;
      return response.data;
    },

    /**
     * Actualizar prompt
     */
    async update(id: string, data: any) {
      const response = await apiClient.patch(`/community/marketplace/prompts/${id}`, data) as any;
      return response.data;
    },

    /**
     * Eliminar prompt
     */
    async delete(id: string) {
      const response = await apiClient.delete(`/community/marketplace/prompts/${id}`) as any;
      return response.data;
    },

    /**
     * Descargar prompt
     */
    async download(id: string) {
      const response = await apiClient.post(`/community/marketplace/prompts/${id}/download`) as any;
      return response.data;
    },

    /**
     * Calificar prompt
     */
    async rate(id: string, rating: number, review?: string) {
      const response = await apiClient.post(`/community/marketplace/prompts/${id}/rate`, {
        rating,
        review,
      });
      return response.data;
    },

    /**
     * Obtener categorías populares
     */
    async getCategories(limit?: number) {
      const response = await apiClient.get('/api/community/marketplace/prompts/categories', {
        params: { limit },
      });
      return response.data;
    },

    /**
     * Obtener tags populares
     */
    async getTags(limit?: number) {
      const response = await apiClient.get('/api/community/marketplace/prompts/tags', {
        params: { limit },
      });
      return response.data;
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
      const response = await apiClient.get('/api/community/marketplace/characters', { params }) as any;
      return response.data;
    },

    /**
     * Obtener personaje por ID
     */
    async getById(id: string) {
      const response = await apiClient.get(`/community/marketplace/characters/${id}`) as any;
      return response.data;
    },

    /**
     * Crear personaje
     */
    async create(data: any) {
      const response = await apiClient.post('/api/community/marketplace/characters', data) as any;
      return response.data;
    },

    /**
     * Actualizar personaje
     */
    async update(id: string, data: any) {
      const response = await apiClient.patch(`/community/marketplace/characters/${id}`, data) as any;
      return response.data;
    },

    /**
     * Eliminar personaje
     */
    async delete(id: string) {
      const response = await apiClient.delete(`/community/marketplace/characters/${id}`) as any;
      return response.data;
    },

    /**
     * Descargar personaje
     */
    async download(id: string) {
      const response = await apiClient.post(`/community/marketplace/characters/${id}/download`) as any;
      return response.data;
    },

    /**
     * Calificar personaje
     */
    async rate(id: string, rating: number, review?: string) {
      const response = await apiClient.post(`/community/marketplace/characters/${id}/rate`, {
        rating,
        review,
      });
      return response.data;
    },

    /**
     * Importar personaje a agente personal
     */
    async import(id: string, agentName?: string) {
      const response = await apiClient.post(`/community/marketplace/characters/${id}/import`, {
        agentName,
      });
      return response.data;
    },

    /**
     * Obtener categorías populares
     */
    async getCategories(limit?: number) {
      const response = await apiClient.get('/api/community/marketplace/characters/categories', {
        params: { limit },
      });
      return response.data;
    },

    /**
     * Obtener tags populares
     */
    async getTags(limit?: number) {
      const response = await apiClient.get('/api/community/marketplace/characters/tags', {
        params: { limit },
      });
      return response.data;
    },
  },
};
