/**
 * Post Follow API Client - Wrapper para endpoints de seguimiento de posts
 */

import { apiClient } from './client';

export interface PostFollow {
  id: string;
  userId: string;
  postId: string;
  notificationsEnabled: boolean;
  createdAt: string;
}

export interface FollowResponse {
  success: boolean;
  follow?: PostFollow;
  message: string;
}

export const postFollowApi = {
  /**
   * Seguir un post
   */
  async followPost(postId: string): Promise<FollowResponse> {
    const response = await apiClient.post<FollowResponse>(
      `/api/community/posts/${postId}/follow`
    );
    return response;
  },

  /**
   * Dejar de seguir un post
   */
  async unfollowPost(postId: string): Promise<FollowResponse> {
    const response = await apiClient.delete<FollowResponse>(
      `/api/community/posts/${postId}/follow`
    );
    return response;
  },

  /**
   * Verificar si estoy siguiendo un post
   */
  async isFollowing(postId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ isFollowing: boolean }>(
        `/api/community/posts/${postId}/follow/status`
      );
      return response.isFollowing;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  },

  /**
   * Alternar notificaciones para un post seguido
   */
  async toggleNotifications(postId: string): Promise<PostFollow> {
    const response = await apiClient.patch<{ follow: PostFollow }>(
      `/api/community/posts/${postId}/follow/notifications`
    );
    return response.follow;
  },

  /**
   * Obtener conteo de seguidores de un post
   */
  async getFollowerCount(postId: string): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>(
        `/api/community/posts/${postId}/followers/count`
      );
      return response.count;
    } catch (error) {
      console.error('Error getting follower count:', error);
      return 0;
    }
  },
};
