/**
 * Servicio API para Marketplace de Temas (Mobile)
 */

import { apiClient } from './api';

export interface MarketplaceTheme {
  id: string;
  name: string;
  description?: string;
  userBubbleColor: string;
  agentBubbleColor: string;
  backgroundColor: string;
  backgroundGradient?: string[];
  accentColor: string;
  textColor?: string;
  backgroundImage?: string;
  category: string;
  tags: string[];
  status: string;
  downloadCount: number;
  viewCount: number;
  rating: number;
  ratingCount: number;
  previewImages: string[];
  author: {
    id: string;
    name: string;
    image?: string;
  };
  createdAt: string;
  publishedAt: string;
}

export interface SearchFilters {
  category?: string;
  tags?: string[];
  minRating?: number;
  sortBy?: 'downloads' | 'rating' | 'recent' | 'featured';
  isFeatured?: boolean;
  isPremium?: boolean;
}

export interface SearchResult {
  themes: MarketplaceTheme[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ThemeRating {
  id: string;
  rating: number;
  review?: string;
  createdAt: string;
}

export const MarketplaceAPI = {
  /**
   * Buscar temas en el marketplace
   */
  async searchThemes(filters: SearchFilters = {}, page = 1, limit = 20): Promise<SearchResult> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters.category) params.append('category', filters.category);
    if (filters.tags) params.append('tags', filters.tags.join(','));
    if (filters.minRating) params.append('minRating', filters.minRating.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.isFeatured !== undefined) params.append('isFeatured', filters.isFeatured.toString());
    if (filters.isPremium !== undefined) params.append('isPremium', filters.isPremium.toString());

    const response: any = await apiClient.get(`/marketplace/themes?${params.toString()}`) as any;
    return response.data as any;
  },

  /**
   * Obtener tema por ID
   */
  async getTheme(themeId: string): Promise<MarketplaceTheme> {
    const response: any = await apiClient.get(`/marketplace/themes/${themeId}`) as any;
    return response.data as any;
  },

  /**
   * Obtener temas destacados
   */
  async getFeaturedThemes(limit = 10): Promise<MarketplaceTheme[]> {
    const response: any = await apiClient.get(`/marketplace/themes/featured?limit=${limit}`) as any;
    return response.data as any;
  },

  /**
   * Obtener temas trending
   */
  async getTrendingThemes(limit = 10): Promise<MarketplaceTheme[]> {
    const response: any = await apiClient.get(`/marketplace/themes/trending?limit=${limit}`) as any;
    return response.data as any;
  },

  /**
   * Obtener categorías y tags
   */
  async getCategoriesAndTags(): Promise<{ categories: string[]; tags: { tag: string; count: number }[] }> {
    const response: any = await apiClient.get('/marketplace/themes/categories') as any;
    return response.data as any;
  },

  /**
   * Descargar tema
   */
  async downloadTheme(themeId: string): Promise<{ exportData: any; name: string }> {
    const response: any = await apiClient.post(`/marketplace/themes/${themeId}/download`, {
      platform: 'mobile',
    });
    return response.data as any;
  },

  /**
   * Publicar tema
   */
  async publishTheme(themeData: {
    name: string;
    description?: string;
    userBubbleColor: string;
    agentBubbleColor: string;
    backgroundColor: string;
    backgroundGradient?: string[];
    accentColor: string;
    textColor?: string;
    backgroundImage?: string;
    category: string;
    tags: string[];
    previewImages?: string[];
  }): Promise<MarketplaceTheme> {
    const response: any = await apiClient.post('/marketplace/themes', themeData) as any;
    return response.data as any;
  },

  /**
   * Actualizar tema
   */
  async updateTheme(themeId: string, updates: Partial<{
    name: string;
    description?: string;
    category: string;
    tags: string[];
  }>): Promise<MarketplaceTheme> {
    const response: any = await apiClient.put(`/marketplace/themes/${themeId}`, updates) as any;
    return response.data as any;
  },

  /**
   * Eliminar tema
   */
  async deleteTheme(themeId: string): Promise<{ success: boolean }> {
    const response: any = await apiClient.delete(`/marketplace/themes/${themeId}`) as any;
    return response.data as any;
  },

  /**
   * Dejar rating
   */
  async rateTheme(themeId: string, rating: number, review?: string): Promise<ThemeRating> {
    const response: any = await apiClient.post(`/marketplace/themes/${themeId}/rating`, {
      rating,
      review,
    });
    return response.data as any;
  },

  /**
   * Reportar tema
   */
  async reportTheme(
    themeId: string,
    reason: 'inappropriate' | 'spam' | 'copyright' | 'broken' | 'other',
    description?: string
  ): Promise<{ id: string }> {
    const response: any = await apiClient.post(`/marketplace/themes/${themeId}/report`, {
      reason,
      description,
    });
    return response.data as any;
  },

  /**
   * Obtener mis temas publicados
   */
  async getMyThemes(): Promise<MarketplaceTheme[]> {
    const response: any = await apiClient.get('/marketplace/themes/my-themes') as any;
    return response.data as any;
  },
};
