"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  SparklesIcon,
  TrophyIcon,
  MessageCircleIcon,
  HeartIcon,
  BookOpenIcon,
  ClockIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
} from "lucide-react";

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

const EVENT_ICONS: Record<string, any> = {
  bond_established: HeartIcon,
  milestone_reached: TrophyIcon,
  narrative_unlocked: BookOpenIcon,
  affinity_increase: TrendingUpIcon,
  decay_warning: AlertTriangleIcon,
  major_interaction: MessageCircleIcon,
  rarity_updated: SparklesIcon,
};

const EVENT_COLORS: Record<string, string> = {
  bond_established: "text-pink-400 bg-pink-500/10 border-pink-500/50",
  milestone_reached: "text-amber-400 bg-amber-500/10 border-amber-500/50",
  narrative_unlocked: "text-purple-400 bg-purple-500/10 border-purple-500/50",
  affinity_increase: "text-green-400 bg-green-500/10 border-green-500/50",
  decay_warning: "text-orange-400 bg-orange-500/10 border-orange-500/50",
  major_interaction: "text-blue-400 bg-blue-500/10 border-blue-500/50",
  rarity_updated: "text-indigo-400 bg-indigo-500/10 border-indigo-500/50",
};

export default function BondTimeline({ bondId }: { bondId: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [bondId]);

  const fetchTimeline = async () => {
    try {
      const res = await fetch(`/api/bonds/${bondId}/timeline`);
      if (res.ok) {
        const timeline = await res.json();
        setEvents(timeline);
      }
    } catch (error) {
      console.error("Error fetching timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Línea de Tiempo</CardTitle>
          <CardDescription>
            Historia de tu vínculo con momentos importantes
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-gray-500">
          <ClockIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>La línea de tiempo comenzará a llenarse con tus interacciones</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Línea de Tiempo</CardTitle>
        <CardDescription>
          {events.length} eventos registrados en tu historia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-transparent"></div>

          {/* Events */}
          <div className="space-y-6">
            {events.map((event, index) => {
              const Icon =
                EVENT_ICONS[event.type] || MessageCircleIcon;
              const colorClass =
                EVENT_COLORS[event.type] ||
                "text-gray-400 bg-gray-500/10 border-gray-500/50";

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex gap-4 pl-12"
                >
                  {/* Icon */}
                  <div
                    className={`absolute left-0 w-12 h-12 rounded-full border-2 ${colorClass} flex items-center justify-center z-10`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8 pt-1">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white">
                          {event.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className="text-xs text-gray-400"
                        >
                          {formatDate(event.timestamp)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">
                        {event.description}
                      </p>

                      {/* Metadata badges */}
                      {event.metadata && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {event.metadata.affinityGain && (
                            <Badge variant="secondary" className="text-xs">
                              +{event.metadata.affinityGain} afinidad
                            </Badge>
                          )}
                          {event.metadata.milestoneName && (
                            <Badge variant="secondary" className="text-xs">
                              {event.metadata.milestoneName}
                            </Badge>
                          )}
                          {event.metadata.narrativeName && (
                            <Badge variant="secondary" className="text-xs">
                              {event.metadata.narrativeName}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* End marker */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: events.length * 0.1 }}
            className="relative flex gap-4 pl-12"
          >
            <div className="absolute left-3 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
            <div className="flex-1 pt-1">
              <p className="text-sm text-gray-500 italic">
                Tu historia continúa...
              </p>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;

  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
