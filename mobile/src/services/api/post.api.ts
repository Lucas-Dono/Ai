/**
 * Post API Client - Wrapper para endpoints de posts
 */

import { apiClient } from './client';

export interface Post {
  id: string;
  title: string;
  content: string;
  type: string;
  communityId?: string;
  authorId: string;
  upvotes: number;
  downvotes: number;
  score: number;
  commentCount: number;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
  createdAt: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface CreatePostData {
  communityId?: string;
  title: string;
  content: string;
  type: 'discussion' | 'question' | 'showcase' | 'help' | 'research' | 'poll' | 'announcement';
  tags?: string[];
  mediaUrls?: string[];
  pollOptions?: any;
}

export const postApi = {
  /**
   * Listar posts
   */
  async list(params?: {
    communityId?: string;
    type?: string;
    tags?: string;
    authorId?: string;
    search?: string;
    sort?: 'hot' | 'new' | 'top' | 'controversial';
    timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get('/api/community/posts', { params }) as any;
    return response.data;
  },

  /**
   * Obtener post por ID
   */
  async getById(id: string) {
    const response = await apiClient.get(`/community/posts/${id}`) as any;
    return response.data;
  },

  /**
   * Crear post
   */
  async create(data: CreatePostData) {
    const response = await apiClient.post('/api/community/posts', data) as any;
    return response.data;
  },

  /**
   * Actualizar post
   */
  async update(id: string, data: Partial<CreatePostData>) {
    const response = await apiClient.patch(`/community/posts/${id}`, data) as any;
    return response.data;
  },

  /**
   * Eliminar post
   */
  async delete(id: string) {
    const response = await apiClient.delete(`/community/posts/${id}`) as any;
    return response.data;
  },

  /**
   * Votar post
   */
  async vote(id: string, voteType: 'upvote' | 'downvote') {
    const response = await apiClient.post(`/community/posts/${id}/vote`, { voteType }) as any;
    return response.data;
  },

  /**
   * Dar award
   */
  async award(id: string, awardType: string) {
    const response = await apiClient.post(`/community/posts/${id}/award`, { awardType }) as any;
    return response.data;
  },

  /**
   * Pin post (moderador)
   */
  async pin(id: string, pinned: boolean) {
    const response = await apiClient.post(`/community/posts/${id}/pin`, { pinned }) as any;
    return response.data;
  },

  /**
   * Lock post (moderador)
   */
  async lock(id: string, locked: boolean) {
    const response = await apiClient.post(`/community/posts/${id}/lock`, { locked }) as any;
    return response.data;
  },
};
