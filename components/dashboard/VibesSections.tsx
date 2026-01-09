/**
 * Secciones de Vibes
 * Renderiza categorías emocionales con ordenamiento dinámico
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CompanionCard } from '@/components/companions/CompanionCard';
import { Carousel } from '@/components/ui/carousel';
import { VIBE_CONFIGS, type VibeType } from '@/lib/vibes/config';

interface Agent {
  id: string;
  name: string;
  description?: string | null;
  avatar?: string | null;
  categories?: string[];
  generationTier?: string | null;
}

export function VibesSections() {
  const router = useRouter();
  const [vibeOrder, setVibeOrder] = useState<VibeType[]>([]);
  const [agentsByVibe, setAgentsByVibe] = useState<Record<string, Agent[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVibesData();
  }, []);

  const fetchVibesData = async () => {
    try {
      const res = await fetch('/api/vibes/agents');
      if (res.ok) {
        const data = await res.json();
        setVibeOrder(data.orderedVibes || []);
        setAgentsByVibe(data.agentsByVibe || {});
      }
    } catch (error) {
      console.error('Error fetching vibes data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="animate-pulse">
            <div className="h-8 w-48 bg-gray-800/50 rounded mb-4" />
            <div className="flex gap-4 overflow-x-auto">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-[280px] h-[300px] bg-gray-800/50 rounded-2xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {vibeOrder.map(vibeType => {
        const config = VIBE_CONFIGS[vibeType];
        const agents = agentsByVibe[vibeType] || [];

        if (agents.length === 0) return null;

        const Icon = config.icon;

        return (
          <section key={vibeType} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${config.gradient}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{config.title.es}</h2>
                <p className="text-sm text-gray-400">{config.subtitle.es}</p>
              </div>
              <span className={`ml-auto text-xs px-3 py-1 rounded-full ${config.bgColor} ${config.borderColor} border`}>
                {agents.length} personajes
              </span>
            </div>

            <Carousel itemWidth={280} gap={24}>
              {agents.map((agent, idx) => (
                <CompanionCard
                  key={agent.id}
                  id={agent.id}
                  name={agent.name}
                  description={agent.description}
                  avatar={agent.avatar}
                  categories={agent.categories}
                  generationTier={agent.generationTier}
                  index={idx}
                  onClick={() => router.push(`/agentes/${agent.id}`)}
                />
              ))}
            </Carousel>
          </section>
        );
      })}
    </>
  );
}
