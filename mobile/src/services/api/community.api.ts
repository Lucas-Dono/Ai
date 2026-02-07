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
    const response: any = await apiClient.get('/api/community/communities', { params });
    return response.data as any;
  },

  /**
   * Obtener comunidad por ID
   */
  async getById(id: string) {
    const response: any = await apiClient.get(`/community/communities/${id}`);
    return response.data as any;
  },

  /**
   * Crear comunidad
   */
  async create(data: CreateCommunityData) {
    const response: any = await apiClient.post('/api/community/communities', data);
    return response.data as any;
  },

  /**
   * Actualizar comunidad
   */
  async update(id: string, data: Partial<CreateCommunityData>) {
    const response: any = await apiClient.patch(`/community/communities/${id}`, data);
    return response.data as any;
  },

  /**
   * Eliminar comunidad
   */
  async delete(id: string) {
    const response: any = await apiClient.delete(`/community/communities/${id}`);
    return response.data as any;
  },

  /**
   * Unirse a comunidad
   */
  async join(id: string) {
    const response: any = await apiClient.post(`/community/communities/${id}/join`);
    return response.data as any;
  },

  /**
   * Salir de comunidad
   */
  async leave(id: string) {
    const response: any = await apiClient.post(`/community/communities/${id}/leave`);
    return response.data as any;
  },

  /**
   * Obtener miembros
   */
  async getMembers(id: string) {
    const response: any = await apiClient.get(`/community/communities/${id}/members`);
    return response.data as any;
  },

  /**
   * Banear usuario (moderador)
   */
  async banUser(communityId: string, userId: string, reason?: string) {
    const response: any = await apiClient.post(`/community/communities/${communityId}/ban`, {
      userId,
      reason,
    });
    return response.data as any;
  },
};
