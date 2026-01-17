/**
 * Sección de Historias
 * Nichos de personajes históricos con diseño diferenciado
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CompanionCard } from '@/components/companions/CompanionCard';
import { Carousel } from '@/components/ui/carousel';
import { STORY_NICHE_CONFIGS, type StoryNicheType } from '@/lib/stories/config';
import type { CategoryKey } from '@/lib/categories';
import { useIsDesktop } from '@/lib/hooks/use-media-query';
import { MobileAgentCard, MobileSectionHeader } from '@/components/mobile';

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
  const isDesktop = useIsDesktop();
  const router = useRouter();

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
            {isDesktop ? (
              <div className="flex gap-4 overflow-x-auto">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-[280px] h-[280px] bg-gray-800/50 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-[150px] h-[200px] bg-gray-800/50 rounded-2xl flex-shrink-0" />
                  ))}
                </div>
              </div>
            )}
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
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center gap-3 mb-4">
              <Icon className="w-6 h-6 text-amber-400" />
              <div>
                <h2 className="text-2xl font-bold">{config.title.es}</h2>
                <p className="text-sm text-gray-400">{config.subtitle.es}</p>
              </div>
              <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${config.badgeColor} border`}>
                {config.badge.es}
              </span>
            </div>

            {/* Mobile Header - Con badge sincronizado */}
            <div className="lg:hidden mb-4">
              <MobileSectionHeader
                badge={{
                  text: config.badge.es,
                  className: config.badgeColor
                }}
                title={config.title.es}
                subtitle={config.subtitle.es}
              />
            </div>

            {isDesktop ? (
              <Carousel itemWidth={280} gap={24}>
                {agents.map((agent, idx) => {
                  const aiFields = agent.aiGeneratedFields as any;
                  const storyNicheType = aiFields?.storyNiche?.type as StoryNicheType;

                  return (
                    <CompanionCard
                      key={agent.id}
                      id={agent.id}
                      name={agent.name}
                      description={agent.description}
                      avatar={agent.avatar}
                      categories={agent.categories as CategoryKey[]}
                      generationTier={agent.generationTier}
                      storyNiche={storyNicheType || (nicheId as StoryNicheType)}
                      index={idx}
                      width={280}
                    />
                  );
                })}
              </Carousel>
            ) : (
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-3" style={{ paddingRight: '16px' }}>
                  {agents.map((agent) => {
                    const isFeatured = agent.generationTier === 'premium' || agent.generationTier === 'flagship';

                    return (
                      <MobileAgentCard
                        key={agent.id}
                        id={agent.id}
                        name={agent.name}
                        description={agent.description || undefined}
                        avatar={agent.avatar || undefined}
                        generationTier={agent.generationTier}
                        featured={isFeatured}
                        variant="carousel"
                        onPress={() => router.push(`/agentes/${agent.id}`)}
                        onChatPress={() => router.push(`/agentes/${agent.id}`)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
