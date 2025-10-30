/**
 * Comment API Client - Wrapper para endpoints de comentarios
 */

import { apiClient } from './client';

export interface Comment {
  id: string;
  postId: string;
  parentId?: string;
  authorId: string;
  content: string;
  upvotes: number;
  downvotes: number;
  replyCount: number;
  isAcceptedAnswer: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface CreateCommentData {
  postId: string;
  parentId?: string;
  content: string;
}

export const commentApi = {
  /**
   * Obtener comentarios de un post
   */
  async getByPostId(postId: string) {
    const response = await apiClient.get('/api/community/comments', {
      params: { postId },
    });
    return response.data;
  },

  /**
   * Obtener respuestas de un comentario
   */
  async getReplies(commentId: string) {
    const response = await apiClient.get(`/community/comments/${commentId}`) as any;
    return response.data;
  },

  /**
   * Crear comentario
   */
  async create(data: CreateCommentData) {
    const response = await apiClient.post('/api/community/comments', data) as any;
    return response.data;
  },

  /**
   * Actualizar comentario
   */
  async update(id: string, content: string) {
    const response = await apiClient.patch(`/community/comments/${id}`, { content }) as any;
    return response.data;
  },

  /**
   * Eliminar comentario
   */
  async delete(id: string) {
    const response = await apiClient.delete(`/community/comments/${id}`) as any;
    return response.data;
  },

  /**
   * Votar comentario
   */
  async vote(id: string, voteType: 'upvote' | 'downvote') {
    const response = await apiClient.post(`/community/comments/${id}/vote`, { voteType }) as any;
    return response.data;
  },

  /**
   * Marcar como respuesta aceptada
   */
  async markAsAccepted(id: string) {
    const response = await apiClient.post(`/community/comments/${id}/accept`) as any;
    return response.data;
  },
};
