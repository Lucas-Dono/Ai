"use client";

import { Calendar, CheckCircle, XCircle, Clock, Zap, TrendingUp, AlertCircle } from "lucide-react";
import type { ScheduledEvent } from "@prisma/client";

interface EventsTimelineProps {
  events: ScheduledEvent[];
}

export default function EventsTimeline({ events }: EventsTimelineProps) {
  const now = new Date();

  // Separate events
  const upcomingEvents = events
    .filter((e) => !e.resolved && new Date(e.scheduledFor) > now)
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());

  const recentEvents = events
    .filter((e) => e.resolved && e.resolvedAt)
    .sort((a, b) => new Date(b.resolvedAt!).getTime() - new Date(a.resolvedAt!).getTime())
    .slice(0, 10);

  const overdueEvents = events.filter((e) => !e.resolved && new Date(e.scheduledFor) <= now);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Eventos & Acontecimiento</h3>
            <p className="text-sm text-gray-500">
              {upcomingEvents.length} próximo{upcomingEvents.length !== 1 ? "s" : ""} · {recentEvents.length}{" "}
              reciente{recentEvents.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <StatBadge
            icon={<Clock />}
            label="Próximos"
            value={upcomingEvents.length}
            color="blue"
          />
          <StatBadge
            icon={<CheckCircle />}
            label="Resueltos"
            value={recentEvents.filter((e) => e.wasSuccess).length}
            color="green"
          />
          <StatBadge
            icon={<XCircle />}
            label="Fallidos"
            value={recentEvents.filter((e) => e.wasSuccess === false).length}
            color="red"
          />
        </div>
      </div>

      {/* Overdue Events Warning */}
      {overdueEvents.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            <div>
              <h4 className="font-bold text-amber-900">Eventos Pendientes de Resolución</h4>
              <p className="text-sm text-amber-700">
                {overdueEvents.length} evento{overdueEvents.length !== 1 ? "s" : ""} necesita
                {overdueEvents.length !== 1 ? "n" : ""} ser resuelto{overdueEvents.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <Section title="Eventos Próximos" count={upcomingEvents.length}>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} type="upcoming" />
            ))}
          </div>
        </Section>
      )}

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <Section title="Eventos Recientes" count={recentEvents.length}>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <EventCard key={event.id} event={event} type="recent" />
            ))}
          </div>
        </Section>
      )}

      {events.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay eventos programados</p>
        </div>
      )}
    </div>
  );
}

// Event Card Component
function EventCard({ event, type }: { event: ScheduledEvent; type: "upcoming" | "recent" }) {
  const categoryConfig: Record<string, { color: string; emoji: string; label: string }> = {
    external_random: { color: "purple", emoji: "🎲", label: "Aleatorio" },
    skill_based: { color: "blue", emoji: "🎯", label: "Basado en habilidad" },
    social: { color: "pink", emoji: "👥", label: "Social" },
    routine_based: { color: "green", emoji: "⏰", label: "Rutina" },
    goal_related: { color: "orange", emoji: "🎯", label: "Meta" },
  };

  const category = categoryConfig[event.category] || categoryConfig.external_random;

  const timeString =
    type === "upcoming"
      ? getTimeUntil(new Date(event.scheduledFor))
      : event.resolvedAt
      ? getTimeAgo(new Date(event.resolvedAt))
      : "Pendiente";

  const outcome = event.actualOutcome as any;

  return (
    <div
      className={`border-2 rounded-xl p-4 space-y-3 ${
        type === "upcoming"
          ? "bg-blue-50 border-blue-200"
          : event.wasSuccess
          ? "bg-green-50 border-green-200"
          : "bg-red-50 border-red-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{category.emoji}</span>
            <h4 className="text-lg font-bold text-gray-900">{event.title}</h4>
          </div>
          <p className="text-sm text-gray-700">{event.description}</p>
        </div>

        <div className="flex flex-col items-end gap-1">
          {type === "upcoming" ? (
            <Clock className="w-5 h-5 text-blue-600" />
          ) : event.wasSuccess ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
        </div>
      </div>

      {/* Category & Time */}
      <div className="flex flex-wrap gap-3 text-sm">
        <div className={`px-3 py-1 rounded-full bg-${category.color}-100 text-${category.color}-700 font-medium`}>
          {category.label}
        </div>

        <div className="flex items-center gap-1 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{timeString}</span>
        </div>

        {event.successProbability !== null && (
          <div className="flex items-center gap-1 text-purple-600">
            <Zap className="w-4 h-4" />
            <span className="font-semibold">
              {type === "upcoming" ? "Prob. éxito:" : "Probabilidad era:"} {event.successProbability}%
            </span>
          </div>
        )}
      </div>

      {/* Outcome (for resolved events) */}
      {type === "recent" && outcome && (
        <div className={`bg-white border-2 p-3 rounded ${event.wasSuccess ? "border-green-300" : "border-red-300"}`}>
          <div className="flex items-center gap-2 mb-2">
            {event.wasSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold text-green-900">ÉXITO</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-bold text-red-900">FRACASO</span>
              </>
            )}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{outcome.description}</p>

          {/* Consequences */}
          {outcome.consequences && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-1">CONSECUENCIAS</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {outcome.consequences.goalProgressChange && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <TrendingUp className="w-3 h-3" />
                    <span>Meta: {outcome.consequences.goalProgressChange > 0 ? "+" : ""}
                      {outcome.consequences.goalProgressChange}%</span>
                  </div>
                )}
                {outcome.consequences.stressChange && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <Zap className="w-3 h-3" />
                    <span>Estrés: {outcome.consequences.stressChange > 0 ? "+" : ""}
                      {outcome.consequences.stressChange}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Possible Outcomes (for upcoming events) */}
      {type === "upcoming" && (event.possibleOutcomes as any[]).length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-600">POSIBLES RESULTADOS</div>
          <div className="space-y-1">
            {(event.possibleOutcomes as any[]).slice(0, 2).map((outcome: any, idx: number) => (
              <div
                key={idx}
                className={`text-xs p-2 rounded ${
                  outcome.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                <strong className="capitalize">{outcome.type}:</strong> {outcome.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Goal */}
      {event.relatedGoalId && (
        <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-100 px-3 py-1 rounded">
          <span>🎯</span>
          <span className="font-medium">Relacionado con una meta</span>
        </div>
      )}
    </div>
  );
}

// Section Component
function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        {title}
        <span className="text-sm font-normal text-gray-500">({count})</span>
      </h4>
      {children}
    </div>
  );
}

// Stat Badge Component
function StatBadge({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className={`${colors[color as keyof typeof colors]} px-4 py-2 rounded-lg flex items-center gap-2`}>
      <div className="w-4 h-4">{icon}</div>
      <div>
        <div className="text-xs font-medium">{label}</div>
        <div className="text-lg font-bold">{value}</div>
      </div>
    </div>
  );
}

// Helper functions
function getTimeUntil(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 1) {
    return `en ${diffDays} días`;
  } else if (diffDays === 1) {
    return "mañana";
  } else if (diffHours > 0) {
    return `en ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  } else {
    return "muy pronto";
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
  } else if (diffHours > 0) {
    return `hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  } else {
    return "hace poco";
  }
}
