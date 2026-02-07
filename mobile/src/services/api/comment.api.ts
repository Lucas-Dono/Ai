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
    const response: any = await apiClient.get('/api/community/comments', {
      params: { postId },
    });
    return response.data as any;
  },

  /**
   * Obtener respuestas de un comentario
   */
  async getReplies(commentId: string) {
    const response: any = await apiClient.get(`/community/comments/${commentId}`);
    return response.data as any;
  },

  /**
   * Crear comentario
   */
  async create(data: CreateCommentData) {
    const response: any = await apiClient.post('/api/community/comments', data);
    return response.data as any;
  },

  /**
   * Actualizar comentario
   */
  async update(id: string, content: string) {
    const response: any = await apiClient.patch(`/community/comments/${id}`, { content });
    return response.data as any;
  },

  /**
   * Eliminar comentario
   */
  async delete(id: string) {
    const response: any = await apiClient.delete(`/community/comments/${id}`);
    return response.data as any;
  },

  /**
   * Votar comentario
   */
  async vote(id: string, voteType: 'upvote' | 'downvote') {
    const response: any = await apiClient.post(`/community/comments/${id}/vote`, { voteType });
    return response.data as any;
  },

  /**
   * Marcar como respuesta aceptada
   */
  async markAsAccepted(id: string) {
    const response: any = await apiClient.post(`/community/comments/${id}/accept`);
    return response.data as any;
  },
};
