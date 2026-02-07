/**
 * useMyStats Hook
 * Fetches and manages personal analytics data
 */

import useSWR from "swr";

export interface PersonalStats {
  overview: {
    totalAIsCreated: number;
    totalMessagesSent: number;
    totalTimeSpentHours: number;
    favoriteAI: {
      id: string;
      name: string;
      messageCount: number;
    } | null;
    currentStreak: number;
    longestStreak: number;
  };
  messagesPerDay: Array<{ date: string; count: number }>;
  mostUsedAIs: Array<{
    id: string;
    name: string;
    messageCount: number;
    lastUsed: Date;
  }>;
  emotional: {
    emotionFrequency: Record<string, number>;
    emotionalJourney: Array<{
      timestamp: Date;
      event: string;
      emotion: string;
      intensity: number;
    }>;
    moodTrends: {
      valence: Array<{ date: string; value: number }>;
      arousal: Array<{ date: string; value: number }>;
      dominance: Array<{ date: string; value: number }>;
    };
    happiestAI: {
      id: string;
      name: string;
      avgValence: number;
    } | null;
    mostComfortingAI: {
      id: string;
      name: string;
      comfortScore: number;
    } | null;
  };
  relationships: {
    relationships: Array<{
      agentId: string;
      agentName: string;
      currentStage: string;
      trust: number;
      affinity: number;
      respect: number;
      progressToNext: number;
      daysSinceCreation: number;
      milestones: string[];
    }>;
  };
  insights: {
    insights: string[];
    patterns: {
      mostActiveDay: string;
      mostActiveHour: number;
      avgSessionDuration: number;
      preferredConversationType: string;
      emotionalTendency: string;
    };
    comparisons: {
      vsAverage: {
        messagesPerDay: number;
        emotionalIntensity: number;
        sessionDuration: number;
      };
      percentile: number;
    };
  };
  community: {
    postKarma: number;
    commentKarma: number;
    aisShared: number;
    aisImported: number;
    helpfulAnswers: number;
    followersThisMonth: number;
  };
  generatedAt: string;
}

export function useMyStats(section: string = "all", days: number = 30) {
  const { data, error, isLoading, mutate } = useSWR<PersonalStats>(
    `/api/analytics/me?section=${section}&days=${days}`,
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  return {
    data,
    error,
    isLoading,
    refetch: mutate,
  };
}
