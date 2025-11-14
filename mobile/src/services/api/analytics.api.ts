import { apiClient } from './client';

export interface PersonalStats {
  totalMessages: number;
  totalAgents: number;
  totalWorlds: number;
  totalTimeSpent: number; // minutes
  favoriteAgent?: {
    id: string;
    name: string;
    messageCount: number;
  };
  emotionalProfile: {
    dominantEmotion: string;
    valence: number; // -1 to 1
    emotionDistribution: {
      emotion: string;
      percentage: number;
    }[];
  };
  relationshipStats: {
    totalRelationships: number;
    strongestRelationship?: {
      agentId: string;
      agentName: string;
      affinityScore: number;
      stage: string;
    };
    relationships: Array<{
      agentId: string;
      agentName: string;
      affinityScore: number;
      stage: string;
      messagesExchanged: number;
    }>;
  };
  activityOverTime: Array<{
    date: string;
    messageCount: number;
    timeSpent: number;
  }>;
}

const analyticsApi = {
  // Obtener estadísticas personales
  async getMyStats() {
    const data = await apiClient.get<PersonalStats>('/api/analytics/me');
    return data;
  },

  // Exportar datos (Ultra tier only)
  async exportData(format: 'csv' | 'json' = 'json') {
    const data = await apiClient.get<{ url: string }>('/api/analytics/me/export', {
      params: { format },
    });
    return data;
  },

  // Obtener análisis de relaciones
  async getRelationshipAnalysis(agentId?: string) {
    const data = await apiClient.get('/api/analytics/me/relationships', {
      params: agentId ? { agentId } : undefined,
    });
    return data;
  },

  // Obtener análisis emocional
  async getEmotionalAnalysis(period: 'week' | 'month' | 'all' = 'month') {
    const data = await apiClient.get('/api/analytics/me/emotions', {
      params: { period },
    });
    return data;
  },
};

export default analyticsApi;
