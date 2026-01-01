"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { Carousel } from "@/components/ui/carousel";
import { CompanionCard } from "@/components/companions/CompanionCard";
import { CompanionCardSkeleton } from "@/components/companions/CompanionCardSkeleton";
import { getAllCategories, type Category, type CategoryKey } from "@/lib/categories";
import type { FilterState } from "@/components/dashboard/FilterBar";

interface Agent {
  id: string;
  name: string;
  description?: string;
  avatar?: string | null;
  tags?: string[];
  featured?: boolean;
  generationTier?: 'free' | 'plus' | 'ultra' | null;
  categories?: CategoryKey[];
  gender?: string | null;
  userId?: string | null;
  visibility?: string;
}

interface CategoryGroup {
  category: Category;
  agents: Agent[];
}

interface Props {
  filters?: FilterState;
  onAgentClick?: (agentId: string) => void;
  agents?: Agent[]; // Permitir pasar agentes desde el padre para evitar fetch
}

export function CategoryBasedRecommendations({ filters, onAgentClick, agents: providedAgents }: Props) {
  const locale = useLocale() as 'en' | 'es';
  const [loading, setLoading] = useState(!providedAgents); // No loading si ya hay agentes
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);

  useEffect(() => {
    if (providedAgents) {
      // Usar agentes proporcionados
      groupAgents(providedAgents);
    } else {
      // Fetch solo si no se proporcionaron
      fetchAndGroupAgents();
    }
  }, [providedAgents]);

  const groupAgents = (agents: Agent[]) => {
    try {
      // Filtrar solo agentes públicos con categorías
      const publicAgents = agents.filter(
        (agent) =>
          agent.userId === null &&
          agent.visibility === "public" &&
          agent.categories &&
          agent.categories.length > 0
      );

      // Agrupar por categorías
      const allCategories = getAllCategories();
      const groups: CategoryGroup[] = [];

      for (const category of allCategories) {
        const categoryAgents = publicAgents.filter((agent) =>
          agent.categories?.includes(category.key)
        );

        if (categoryAgents.length > 0) {
          groups.push({
            category,
            agents: categoryAgents.slice(0, 12), // Max 12 por categoría
          });
        }
      }

      // Ordenar grupos por cantidad de agentes (más populares primero)
      groups.sort((a, b) => b.agents.length - a.agents.length);

      setCategoryGroups(groups.slice(0, 8)); // Mostrar máximo 8 categorías
    } catch (error) {
      console.error("Error grouping agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAndGroupAgents = async () => {
    setLoading(true);
    try {
      // Fetch agentes públicos
      const res = await fetch("/api/agents");
      if (!res.ok) {
        console.error("Error fetching agents");
        setLoading(false);
        return;
      }

      const agents: Agent[] = await res.json();
      groupAgents(agents);
    } catch (error) {
      console.error("Error fetching and grouping agents:", error);
      setLoading(false);
    }
  };

  const applyFilters = (agent: Agent): boolean => {
    if (!filters) return true;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        agent.name.toLowerCase().includes(searchLower) ||
        agent.description?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Gender filter
    if (filters.gender !== "all" && agent.gender !== filters.gender) {
      return false;
    }

    // Tier filter
    if (filters.tier !== "all" && agent.generationTier !== filters.tier) {
      return false;
    }

    // NSFW filter
    if (filters.nsfw === "sfw" && agent.tags?.includes("nsfw")) {
      return false;
    }
    if (filters.nsfw === "nsfw" && !agent.tags?.includes("nsfw")) {
      return false;
    }

    return true;
  };

  if (loading) {
    return (
      <div className="space-y-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded animate-pulse" />
              <div className="h-6 w-48 bg-purple-500/20 rounded animate-pulse" />
            </div>
            <Carousel itemWidth={280} gap={24}>
              {Array.from({ length: 8 }).map((_, idx) => (
                <CompanionCardSkeleton key={idx} />
              ))}
            </Carousel>
          </div>
        ))}
      </div>
    );
  }

  if (categoryGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-400 text-lg">
          {locale === 'es' ? 'No hay personajes disponibles' : 'No agents available'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {categoryGroups.map(({ category, agents }, index) => {
        const filteredAgents = agents.filter(applyFilters);

        if (filteredAgents.length === 0) return null;

        return (
          <motion.section
            key={category.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="space-y-6"
          >
            {/* Category Header */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-xl ${category.color.bg} ${category.color.border} border-2`}
              >
                <category.icon className={`w-5 h-5 ${category.color.text}`} />
              </div>
              <h2
                className={`text-2xl md:text-3xl font-bold ${category.color.text}`}
              >
                {category.label[locale]}
              </h2>
              <span className="text-sm text-gray-500 ml-2">
                ({filteredAgents.length})
              </span>
            </div>

            {/* Category Agents Carousel */}
            <Carousel itemWidth={280} gap={24}>
              {filteredAgents.map((agent) => (
                <CompanionCard
                  key={agent.id}
                  id={agent.id}
                  name={agent.name}
                  description={agent.description}
                  avatar={agent.avatar}
                  categories={agent.categories}
                  generationTier={agent.generationTier}
                />
              ))}
            </Carousel>
          </motion.section>
        );
      })}
    </div>
  );
}
