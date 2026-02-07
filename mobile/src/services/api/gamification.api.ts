import { apiClient } from './client';

export interface UserBadge {
  id: string;
  badgeId: string;
  userId: string;
  earnedAt: Date;
  badge: Badge;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'creator' | 'engagement' | 'community' | 'level' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: string;
}

export interface UserReputation {
  id: string;
  userId: string;
  level: number;
  points: number;
  karma: number;
  streak: number;
  lastCheckIn?: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar?: string;
  level: number;
  points: number;
  karma: number;
  badges: number;
  rank: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  total: number;
  completed: boolean;
  reward?: string;
}

const gamificationApi = {
  // Obtener reputación del usuario
  async getReputation() {
    const data = await apiClient.get<UserReputation>('/api/community/reputation/profile');
    return data;
  },

  // Obtener badges del usuario
  async getUserBadges() {
    const data = await apiClient.get<UserBadge[]>('/api/community/reputation/badges');
    return data;
  },

  // Obtener todos los badges disponibles
  async getAllBadges() {
    const data = await apiClient.get<Badge[]>('/api/community/reputation/badges/all');
    return data;
  },

  // Check-in diario
  async dailyCheckIn() {
    const data = await apiClient.post<{
      streak: number;
      pointsEarned: number;
      badgesEarned?: Badge[];
    }>('/api/daily-checkin');
    return data;
  },

  // Obtener leaderboard
  async getLeaderboard(period: 'week' | 'month' | 'all' = 'week', limit: number = 50) {
    const data = await apiClient.get<LeaderboardEntry[]>(
      `/api/community/reputation/leaderboard`,
      {
        params: { period, limit },
      }
    );
    return data;
  },

  // Obtener achievements
  async getAchievements() {
    const data = await apiClient.get<Achievement[]>('/api/achievements');
    return data;
  },

  // Obtener perfil público
  async getPublicProfile(userId: string) {
    const data = await apiClient.get<{
      user: any;
      reputation: UserReputation;
      badges: UserBadge[];
      stats: {
        agentsCreated: number;
        postsCreated: number;
        commentsCreated: number;
        helpfulVotes: number;
      };
    }>(`/api/users/${userId}`);
    return data;
  },
};

export default gamificationApi;
