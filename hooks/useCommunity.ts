/**
 * Hook para gestionar una comunidad específica
 */

import { useState, useEffect, useCallback } from 'react';

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  rules?: string;
  icon?: string;
  banner?: string;
  primaryColor: string;
  type: 'public' | 'private' | 'restricted';
  category: string;
  isOfficial: boolean;
  isFeatured: boolean;
  memberCount: number;
  postCount: number;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    image?: string;
  };
  isMember: boolean;
  memberRole?: 'owner' | 'moderator' | 'member' | null;
}

interface TopContributor {
  id: string;
  name: string;
  image?: string;
  postCount: number;
  commentCount: number;
}

export function useCommunity(slug: string) {
  const [community, setCommunity] = useState<Community | null>(null);
  const [topContributors, setTopContributors] = useState<TopContributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCommunity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/community/communities/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Comunidad no encontrada');
        }
        throw new Error('Error al cargar la comunidad');
      }

      const data = await response.json();

      if (!data || !data.community) {
        throw new Error('Datos de comunidad inválidos');
      }

      setCommunity(data.community);

      // Cargar top contributors
      const contributorsResponse = await fetch(`/api/community/communities/${data.community.id}/members?limit=5&sort=contributions`);
      if (contributorsResponse.ok) {
        const contributorsData = await contributorsResponse.json();
        setTopContributors(contributorsData.members || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error loading community:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadCommunity();
  }, [loadCommunity]);

  const joinCommunity = useCallback(async () => {
    if (!community) return;

    try {
      const response = await fetch(`/api/community/communities/${community.id}/join`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al unirse a la comunidad');
      }

      setCommunity(prev => prev ? {
        ...prev,
        isMember: true,
        memberRole: 'member',
        memberCount: prev.memberCount + 1,
      } : null);
    } catch (err) {
      console.error('Error joining community:', err);
      alert(err instanceof Error ? err.message : 'Error al unirse');
    }
  }, [community]);

  const leaveCommunity = useCallback(async () => {
    if (!community) return;

    const confirmed = confirm('¿Estás seguro de que quieres salir de esta comunidad?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/community/communities/${community.id}/leave`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al salir de la comunidad');
      }

      setCommunity(prev => prev ? {
        ...prev,
        isMember: false,
        memberRole: null,
        memberCount: Math.max(0, prev.memberCount - 1),
      } : null);
    } catch (err) {
      console.error('Error leaving community:', err);
      alert(err instanceof Error ? err.message : 'Error al salir');
    }
  }, [community]);

  const refresh = useCallback(() => {
    loadCommunity();
  }, [loadCommunity]);

  return {
    community,
    topContributors,
    loading,
    error,
    joinCommunity,
    leaveCommunity,
    refresh,
  };
}
