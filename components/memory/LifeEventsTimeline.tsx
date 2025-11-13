"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  TrendingUp,
  Heart,
  Briefcase,
  GraduationCap,
  Dumbbell,
  Folder,
  Users,
  Circle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Edit2,
  X,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

interface NarrativeArcEvent {
  id: string;
  eventDate: string;
  description: string;
  narrativeState?: string;
  detectionConfidence?: number;
  detectedKeywords?: string[];
}

interface NarrativeArc {
  id: string;
  category: string;
  theme: string;
  title?: string;
  description?: string;
  status: string;
  currentState?: string;
  startedAt: string;
  lastEventAt: string;
  completedAt?: string;
  totalEvents: number;
  outcome?: string;
  confidence: number;
  events: NarrativeArcEvent[];
}

interface LifeEventsTimelineProps {
  agentId: string;
}

const categoryIcons: Record<string, any> = {
  work_career: Briefcase,
  relationships_love: Heart,
  education_learning: GraduationCap,
  health_fitness: Dumbbell,
  personal_projects: Folder,
  family: Users,
  other: Circle,
};

const categoryColors: Record<string, string> = {
  work_career: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  relationships_love: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  education_learning: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  health_fitness: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  personal_projects: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  family: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

const categoryLabels: Record<string, string> = {
  work_career: "Trabajo/Carrera",
  relationships_love: "Relaciones/Amor",
  education_learning: "Educación/Aprendizaje",
  health_fitness: "Salud/Fitness",
  personal_projects: "Proyectos Personales",
  family: "Familia",
  other: "Otro",
};

const stateLabels: Record<string, string> = {
  seeking: "Buscando",
  progress: "En progreso",
  conclusion: "Conclusión",
  ongoing: "Continuando",
};

const stateIcons: Record<string, any> = {
  seeking: Circle,
  progress: TrendingUp,
  conclusion: CheckCircle2,
  ongoing: Clock,
};

const stateColors: Record<string, string> = {
  seeking: "text-yellow-500",
  progress: "text-blue-500",
  conclusion: "text-green-500",
  ongoing: "text-gray-500",
};

export function LifeEventsTimeline({ agentId }: LifeEventsTimelineProps) {
  const [arcs, setArcs] = useState<NarrativeArc[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedArcId, setExpandedArcId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchArcs();
  }, [agentId, filterCategory, filterStatus]);

  const fetchArcs = async () => {
    try {
      setLoading(true);
      let url = `/api/agents/${agentId}/narrative-arcs?timeline=true`;
      if (filterCategory !== "all") url += `&categories=${filterCategory}`;
      if (filterStatus !== "all") url += `&status=${filterStatus}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch arcs");
      const data = await res.json();
      setArcs(data.arcs || []);
    } catch (error) {
      console.error("Error fetching arcs:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleArc = (arcId: string) => {
    setExpandedArcId(expandedArcId === arcId ? null : arcId);
  };

  const getStatusIcon = (status: string, outcome?: string) => {
    if (status === "completed") {
      return outcome === "positive" ? (
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      ) : outcome === "negative" ? (
        <XCircle className="w-5 h-5 text-red-500" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-gray-500" />
      );
    } else if (status === "active") {
      return <TrendingUp className="w-5 h-5 text-blue-500" />;
    } else {
      return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getDuration = (startedAt: string, lastEventAt: string) => {
    const start = new Date(startedAt);
    const end = new Date(lastEventAt);
    const days = differenceInDays(end, start);

    if (days === 0) return "mismo día";
    if (days === 1) return "1 día";
    if (days < 30) return `${days} días`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} ${months === 1 ? "mes" : "meses"}`;
    }
    const years = Math.floor(days / 365);
    return `${years} ${years === 1 ? "año" : "años"}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Timeline de Vida
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Arcos narrativos detectados automáticamente en tus conversaciones
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Categoría
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-sm"
          >
            <option value="all">Todas las categorías</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Estado
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="completed">Completado</option>
            <option value="abandoned">Abandonado</option>
          </select>
        </div>
      </div>

      {/* Arcs List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : arcs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            No hay arcos narrativos detectados todavía
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Los arcos se detectarán automáticamente mientras conversas
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {arcs.map((arc) => {
            const CategoryIcon = categoryIcons[arc.category] || Circle;
            const isExpanded = expandedArcId === arc.id;

            return (
              <div
                key={arc.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md"
              >
                {/* Arc Header */}
                <div
                  onClick={() => toggleArc(arc.id)}
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`p-2 rounded-2xl ${
                            categoryColors[arc.category]
                          }`}
                        >
                          <CategoryIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {arc.title || categoryLabels[arc.category]}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {categoryLabels[arc.category]}
                          </p>
                        </div>
                        {getStatusIcon(arc.status, arc.outcome)}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(arc.startedAt), "d MMM yyyy", {
                            locale: es,
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getDuration(arc.startedAt, arc.lastEventAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Circle className="w-3 h-3 fill-current" />
                          {arc.totalEvents}{" "}
                          {arc.totalEvents === 1 ? "evento" : "eventos"}
                        </span>
                        {arc.currentState && (
                          <span
                            className={`flex items-center gap-1 ${
                              stateColors[arc.currentState]
                            }`}
                          >
                            {stateLabels[arc.currentState]}
                          </span>
                        )}
                      </div>

                      {arc.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                          {arc.description}
                        </p>
                      )}
                    </div>

                    <button className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Arc Events (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Línea de tiempo
                    </h4>
                    <div className="space-y-3">
                      {arc.events.map((event, index) => {
                        const StateIcon =
                          event.narrativeState
                            ? stateIcons[event.narrativeState]
                            : Circle;
                        const stateColor = event.narrativeState
                          ? stateColors[event.narrativeState]
                          : "text-gray-400";

                        return (
                          <div
                            key={event.id}
                            className="relative pl-8 pb-3 last:pb-0"
                          >
                            {/* Timeline line */}
                            {index < arc.events.length - 1 && (
                              <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" />
                            )}

                            {/* Timeline dot */}
                            <div
                              className={`absolute left-0 top-1 p-1 bg-white dark:bg-gray-800 rounded-full ${stateColor}`}
                            >
                              <StateIcon className="w-4 h-4" />
                            </div>

                            {/* Event content */}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  {format(
                                    new Date(event.eventDate),
                                    "d MMM yyyy",
                                    { locale: es }
                                  )}
                                </span>
                                {event.narrativeState && (
                                  <span
                                    className={`text-xs font-medium ${stateColor}`}
                                  >
                                    {stateLabels[event.narrativeState]}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {event.description}
                              </p>
                              {event.detectedKeywords &&
                                event.detectedKeywords.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {event.detectedKeywords
                                      .slice(0, 3)
                                      .map((keyword, i) => (
                                        <span
                                          key={i}
                                          className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded-full text-gray-600 dark:text-gray-400"
                                        >
                                          {keyword}
                                        </span>
                                      ))}
                                  </div>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
