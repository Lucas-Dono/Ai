/**
 * Reputation API Client - Wrapper para endpoints de reputación
 */

import { apiClient } from './client';

export interface UserReputation {
  userId: string;
  points: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export const reputationApi = {
  /**
   * Obtener perfil de reputación
   */
  async getProfile(userId?: string) {
    const response: any = await apiClient.get('/api/community/reputation/profile', {
      params: userId ? { userId } : undefined,
    });
    return response.data as any;
  },

  /**
   * Obtener leaderboard
   */
  async getLeaderboard(params?: {
    timeRange?: 'day' | 'week' | 'month' | 'all';
    limit?: number;
  }) {
    const response: any = await apiClient.get('/api/community/reputation/leaderboard', { params });
    return response.data as any;
  },

  /**
   * Obtener lista de badges disponibles
   */
  async getBadges() {
    const response: any = await apiClient.get('/api/community/reputation/badges');
    return response.data as any;
  },
};
