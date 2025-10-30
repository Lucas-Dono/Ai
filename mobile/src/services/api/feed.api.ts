/**
 * Feed API Client - Wrapper para endpoints de feed
 */

import { apiClient } from './client';

export const feedApi = {
  /**
   * Feed personalizado
   */
  async getPersonalized(params?: { page?: number; limit?: number }) {
    return await apiClient.get('/api/community/feed', { params });
  },

  /**
   * Feed Hot
   */
  async getHot(params?: { page?: number; limit?: number }) {
    return await apiClient.get('/api/community/feed/hot', { params });
  },

  /**
   * Feed New
   */
  async getNew(params?: { page?: number; limit?: number }) {
    return await apiClient.get('/api/community/feed/new', { params });
  },

  /**
   * Feed Top
   */
  async getTop(params?: {
    timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
    page?: number;
    limit?: number;
  }) {
    return await apiClient.get('/api/community/feed/top', { params });
  },

  /**
   * Feed Following
   */
  async getFollowing(params?: { page?: number; limit?: number }) {
    return await apiClient.get('/api/community/feed/following', { params });
  },
};
