/**
 * Sección de Historias
 * Nichos de personajes históricos con diseño diferenciado
 */

'use client';

import { useState, useEffect } from 'react';
import { StoryCompanionCard } from './StoryCompanionCard';
import { Carousel } from '@/components/ui/carousel';
import { STORY_NICHE_CONFIGS, type StoryNicheType } from '@/lib/stories/config';

interface Agent {
  id: string;
  name: string;
  description?: string | null;
  avatar?: string | null;
  categories?: string[];
  generationTier?: string | null;
  aiGeneratedFields?: any;
}

export function StoriesSection() {
  const [agentsByStory, setAgentsByStory] = useState<Record<string, Agent[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoriesData();
  }, []);

  const fetchStoriesData = async () => {
    try {
      const res = await fetch('/api/stories/agents');
      if (res.ok) {
        const data = await res.json();
        setAgentsByStory(data.agentsByStory || {});
      }
    } catch (error) {
      console.error('Error fetching stories data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="animate-pulse">
            <div className="h-8 w-64 bg-gray-800/50 rounded mb-4" />
            <div className="flex gap-4 overflow-x-auto">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-[280px] h-[280px] bg-gray-800/50 rounded-2xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {Object.entries(STORY_NICHE_CONFIGS).map(([nicheId, config]) => {
        const agents = agentsByStory[nicheId] || [];

        if (agents.length === 0) return null;

        const Icon = config.icon;

        return (
          <section key={nicheId} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Icon className="w-6 h-6 text-amber-400" />
              <div>
                <h2 className="text-2xl font-bold">{config.title.es}</h2>
                <p className="text-sm text-gray-400">{config.subtitle.es}</p>
              </div>
              <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${config.badgeColor} border`}>
                {config.badge.es}
              </span>
            </div>

            <Carousel itemWidth={280} gap={24}>
              {agents.map((agent, idx) => {
                const aiFields = agent.aiGeneratedFields as any;
                const storyNicheType = aiFields?.storyNiche?.type as StoryNicheType;

                return (
                  <StoryCompanionCard
                    key={agent.id}
                    id={agent.id}
                    name={agent.name}
                    description={agent.description}
                    avatar={agent.avatar}
                    categories={agent.categories}
                    generationTier={agent.generationTier}
                    storyNiche={storyNicheType}
                    index={idx}
                  />
                );
              })}
            </Carousel>
          </section>
        );
      })}
    </>
  );
}
