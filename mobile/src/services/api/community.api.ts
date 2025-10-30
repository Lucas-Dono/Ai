/**
 * Community API Client - Wrapper para endpoints de comunidades
 */

import { apiClient } from './client';

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  avatarUrl?: string;
  bannerUrl?: string;
  memberCount: number;
  postCount: number;
  isPrivate: boolean;
  createdAt: string;
}

export interface CreateCommunityData {
  name: string;
  slug: string;
  description: string;
  category: string;
  avatarUrl?: string;
  bannerUrl?: string;
  isPrivate?: boolean;
  rules?: string;
  tags?: string[];
}

export const communityApi = {
  /**
   * Listar comunidades
   */
  async list(params?: {
    search?: string;
    category?: string;
    sort?: 'popular' | 'recent' | 'members';
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get('/api/community/communities', { params }) as any;
    return response.data;
  },

  /**
   * Obtener comunidad por ID
   */
  async getById(id: string) {
    const response = await apiClient.get(`/community/communities/${id}`) as any;
    return response.data;
  },

  /**
   * Crear comunidad
   */
  async create(data: CreateCommunityData) {
    const response = await apiClient.post('/api/community/communities', data) as any;
    return response.data;
  },

  /**
   * Actualizar comunidad
   */
  async update(id: string, data: Partial<CreateCommunityData>) {
    const response = await apiClient.patch(`/community/communities/${id}`, data) as any;
    return response.data;
  },

  /**
   * Eliminar comunidad
   */
  async delete(id: string) {
    const response = await apiClient.delete(`/community/communities/${id}`) as any;
    return response.data;
  },

  /**
   * Unirse a comunidad
   */
  async join(id: string) {
    const response = await apiClient.post(`/community/communities/${id}/join`) as any;
    return response.data;
  },

  /**
   * Salir de comunidad
   */
  async leave(id: string) {
    const response = await apiClient.post(`/community/communities/${id}/leave`) as any;
    return response.data;
  },

  /**
   * Obtener miembros
   */
  async getMembers(id: string) {
    const response = await apiClient.get(`/community/communities/${id}/members`) as any;
    return response.data;
  },

  /**
   * Banear usuario (moderador)
   */
  async banUser(communityId: string, userId: string, reason?: string) {
    const response = await apiClient.post(`/community/communities/${communityId}/ban`, {
      userId,
      reason,
    });
    return response.data;
  },
};
