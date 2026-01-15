/**
 * Feed de Descubrimiento
 * Scroll infinito con mix aleatorio de vibes, historias y nuevos
 *
 * UPDATED: Vista móvil con grid de 2 columnas y MobileAgentCard
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CompanionCard } from '@/components/companions/CompanionCard';
import { MobileAgentCard } from '@/components/mobile';
import type { CategoryKey } from '@/lib/categories';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { Compass } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description?: string | null;
  avatar?: string | null;
  categories?: string[];
  generationTier?: string | null;
}

export function DiscoveryFeed() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/discovery/feed?page=${page}`);
      if (res.ok) {
        const data = await res.json();

        if (data.agents.length === 0) {
          setHasMore(false);
          return;
        }

        setAgents(prev => [...prev, ...data.agents]);
        setPage(prev => prev + 1);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error loading more agents:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  // Intersection Observer para scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, loading]);

  // Cargar inicial
  useEffect(() => {
    loadMore();
  }, []); // Solo al montar

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Compass className="w-6 h-6 text-indigo-400" />
        <div>
          <h2 className="text-2xl font-bold">Descubre Más</h2>
          <p className="text-sm text-gray-400">Explora sin rumbo fijo y encuentra nuevos compañeros</p>
        </div>
      </div>

      {/* Mobile Carousel */}
      <div className="lg:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-3" style={{ paddingRight: '16px' }}>
          {agents.map((agent, idx) => (
            <MobileAgentCard
              key={`mobile-${agent.id}-${idx}`}
              id={agent.id}
              name={agent.name}
              description={agent.description || undefined}
              avatar={agent.avatar || undefined}
              featured={agent.generationTier === 'premium' || agent.generationTier === 'flagship'}
              variant="carousel"
              onPress={() => router.push(`/agentes/${agent.id}`)}
              onChatPress={() => router.push(`/agentes/${agent.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Desktop Grid - Mantiene el diseño original */}
      <div className="hidden lg:grid gap-6 grid-cols-3 xl:grid-cols-4">
        {agents.map((agent, idx) => (
          <CompanionCard
            key={`desktop-${agent.id}-${idx}`}
            id={agent.id}
            name={agent.name}
            description={agent.description || undefined}
            avatar={agent.avatar}
            categories={agent.categories?.map(c => c as CategoryKey)}
            generationTier={agent.generationTier}
            index={idx}
            onClick={() => router.push(`/agentes/${agent.id}`)}
          />
        ))}
      </div>

      {/* Loading Indicator + Observer Target */}
      {hasMore && (
        <div ref={observerRef} className="h-20 flex items-center justify-center mt-8">
          {loading && <LoadingIndicator variant="spinner" size="md" />}
        </div>
      )}

      {/* End of Feed */}
      {!hasMore && agents.length > 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">Has llegado al final del feed</p>
          <p className="text-xs text-gray-500 mt-1">Vuelve más tarde para ver más personajes</p>
        </div>
      )}
    </section>
  );
}
