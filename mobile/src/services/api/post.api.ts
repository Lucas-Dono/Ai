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
    const response: any = await apiClient.get('/api/community/posts', { params });
    return response.data as any;
  },

  /**
   * Obtener post por ID
   */
  async getById(id: string) {
    const response: any = await apiClient.get(`/community/posts/${id}`);
    return response.data as any;
  },

  /**
   * Crear post
   */
  async create(data: CreatePostData) {
    const response: any = await apiClient.post('/api/community/posts', data);
    return response.data as any;
  },

  /**
   * Actualizar post
   */
  async update(id: string, data: Partial<CreatePostData>) {
    const response: any = await apiClient.patch(`/community/posts/${id}`, data);
    return response.data as any;
  },

  /**
   * Eliminar post
   */
  async delete(id: string) {
    const response: any = await apiClient.delete(`/community/posts/${id}`);
    return response.data as any;
  },

  /**
   * Votar post
   */
  async vote(id: string, voteType: 'upvote' | 'downvote') {
    const response: any = await apiClient.post(`/community/posts/${id}/vote`, { voteType });
    return response.data as any;
  },

  /**
   * Dar award
   */
  async award(id: string, awardType: string) {
    const response: any = await apiClient.post(`/community/posts/${id}/award`, { awardType });
    return response.data as any;
  },

  /**
   * Pin post (moderador)
   */
  async pin(id: string, pinned: boolean) {
    const response: any = await apiClient.post(`/community/posts/${id}/pin`, { pinned });
    return response.data as any;
  },

  /**
   * Lock post (moderador)
   */
  async lock(id: string, locked: boolean) {
    const response: any = await apiClient.post(`/community/posts/${id}/lock`, { locked });
    return response.data as any;
  },

  /**
   * Obtener posts seguidos por el usuario actual
   */
  async getFollowedPosts() {
    const response: any = await apiClient.get('/api/community/posts/following');
    return response.posts as any[];
  },
};
