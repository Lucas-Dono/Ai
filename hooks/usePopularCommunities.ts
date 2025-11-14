/**
 * Hook para obtener las comunidades populares
 */

import { useState, useEffect } from 'react';

interface PopularCommunity {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  primaryColor: string;
  memberCount: number;
  postCount: number;
  category: string;
  isFeatured: boolean;
}

interface UsePopularCommunitiesOptions {
  limit?: number;
  featured?: boolean;
}

export function usePopularCommunities(options: UsePopularCommunitiesOptions = {}) {
  const { limit = 5, featured = false } = options;
  const [communities, setCommunities] = useState<PopularCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCommunities() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          sort: 'popular',
          limit: limit.toString(),
        });

        if (featured) {
          params.append('featured', 'true');
        }

        const response = await fetch(`/api/community/communities?${params}`);

        if (!response.ok) {
          throw new Error('Error al cargar comunidades');
        }

        const data = await response.json();
        setCommunities(data.communities || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error loading popular communities:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCommunities();
  }, [limit, featured]);

  return {
    communities,
    loading,
    error,
  };
}
