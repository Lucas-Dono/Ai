/**
 * User Preference API Client - Wrapper para endpoints de preferencias de usuario
 */

import { apiClient } from './client';

export interface UserPreferences {
  postTypes: Record<string, number>;
  tags: Record<string, number>;
  communities: Record<string, number>;
}

export interface PreferencesResponse {
  preferences: UserPreferences;
}

export const userPreferenceApi = {
  /**
   * Obtener preferencias del usuario actual
   */
  async getPreferences(): Promise<UserPreferences> {
    const response = await apiClient.get<PreferencesResponse>('/api/user/preferences');
    return response.preferences;
  },

  /**
   * Resetear preferencias del usuario
   */
  async resetPreferences(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      '/api/user/preferences'
    );
    return response;
  },

  /**
   * Obtener top preferencias por categoría
   */
  getTopPreferences(preferences: UserPreferences, limit: number = 5) {
    const sortByValue = (obj: Record<string, number>) => {
      return Object.entries(obj)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit);
    };

    return {
      topPostTypes: sortByValue(preferences.postTypes),
      topTags: sortByValue(preferences.tags),
      topCommunities: sortByValue(preferences.communities),
    };
  },
};
