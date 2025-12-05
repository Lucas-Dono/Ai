"use client";

import { Target, TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, Pause } from "lucide-react";
import type { PersonalGoal } from "@prisma/client";

interface GoalsTimelineProps {
  goals: PersonalGoal[];
}

export default function GoalsTimeline({ goals }: GoalsTimelineProps) {
  // Group goals by status
  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");
  const pausedGoals = goals.filter((g) => g.status === "paused");
  const failedGoals = goals.filter((g) => g.status === "failed" || g.status === "abandoned");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8 text-purple-600" />
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Metas & Objetivos</h3>
            <p className="text-sm text-gray-500">
              {activeGoals.length} activa{activeGoals.length !== 1 ? "s" : ""} · {completedGoals.length} completada
              {completedGoals.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex gap-4">
          <StatBadge icon={<Target />} label="Activas" value={activeGoals.length} color="blue" />
          <StatBadge icon={<CheckCircle2 />} label="Completadas" value={completedGoals.length} color="green" />
        </div>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <Section title="Metas Activas" count={activeGoals.length}>
          <div className="space-y-4">
            {activeGoals
              .sort((a, b) => b.importance - a.importance)
              .map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
          </div>
        </Section>
      )}

      {/* Paused Goals */}
      {pausedGoals.length > 0 && (
        <Section title="Metas Pausadas" count={pausedGoals.length}>
          <div className="space-y-4">
            {pausedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </Section>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <Section title="Metas Completadas" count={completedGoals.length} collapsible>
          <div className="space-y-4">
            {completedGoals
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
          </div>
        </Section>
      )}

      {/* Failed/Abandoned Goals */}
      {failedGoals.length > 0 && (
        <Section title="Metas Abandonadas/Fallidas" count={failedGoals.length} collapsible>
          <div className="space-y-4">
            {failedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </Section>
      )}

      {goals.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Este personaje no tiene metas definidas aún</p>
        </div>
      )}
    </div>
  );
}

// Goal Card Component
function GoalCard({ goal }: { goal: PersonalGoal }) {
  const categoryEmojis: Record<string, string> = {
    career: "💼",
    personal: "🌱",
    relationship: "❤️",
    health: "💪",
    creative: "🎨",
    financial: "💰",
    learning: "📚",
    social: "👥",
  };

  const statusConfig = {
    active: { icon: <Target className="w-5 h-5" />, color: "blue", bg: "bg-blue-50", border: "border-blue-200" },
    paused: { icon: <Pause className="w-5 h-5" />, color: "yellow", bg: "bg-yellow-50", border: "border-yellow-200" },
    completed: {
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "green",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    failed: { icon: <XCircle className="w-5 h-5" />, color: "red", bg: "bg-red-50", border: "border-red-200" },
    abandoned: { icon: <XCircle className="w-5 h-5" />, color: "gray", bg: "bg-gray-50", border: "border-gray-200" },
  };

  const status = statusConfig[goal.status as keyof typeof statusConfig] || statusConfig.active;

  const progressColor =
    goal.progress >= 75 ? "bg-green-600" : goal.progress >= 50 ? "bg-blue-600" : goal.progress >= 25 ? "bg-yellow-600" : "bg-gray-400";

  return (
    <div className={`${status.bg} ${status.border} border-2 rounded-xl p-5 space-y-3`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{categoryEmojis[goal.category]}</span>
            <h4 className="text-lg font-bold text-gray-900">{goal.title}</h4>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{goal.description}</p>
        </div>

        <div className={`text-${status.color}-600`}>{status.icon}</div>
      </div>

      {/* Progress Bar */}
      {goal.status !== "completed" && goal.status !== "failed" && goal.status !== "abandoned" && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Progreso</span>
            <span className="text-sm font-bold text-gray-900">{goal.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className={`h-3 rounded-full ${progressColor}`} style={{ width: `${goal.progress}%` }} />
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <Target className="w-4 h-4" />
          <span className="capitalize">{goal.timeScale}</span>
        </div>

        <div className="flex items-center gap-1 text-purple-600">
          <span className="font-semibold">Importancia:</span> {goal.importance}/100
        </div>

        <div className="flex items-center gap-1 text-pink-600">
          <span className="font-semibold">Inversión emocional:</span> {goal.emotionalInvestment}/100
        </div>

        {goal.stressLevel > 0 && (
          <div className="flex items-center gap-1 text-orange-600">
            <span className="font-semibold">Estrés:</span> {goal.stressLevel}/100
          </div>
        )}
      </div>

      {/* Days Since Progress Warning */}
      {goal.status === "active" && goal.daysSinceProgress > 7 && (
        <div className="flex items-center gap-2 text-amber-700 bg-amber-100 px-3 py-2 rounded">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Sin progreso desde hace {goal.daysSinceProgress} días</span>
        </div>
      )}

      {/* Next Milestone */}
      {goal.nextMilestone && (
        <div className="bg-white border border-gray-200 px-3 py-2 rounded">
          <div className="text-xs font-semibold text-gray-600 mb-1">PRÓXIMO HITO</div>
          <div className="text-sm text-gray-900">{goal.nextMilestone}</div>
        </div>
      )}

      {/* Obstacles */}
      {(goal.obstacles as any[]).length > 0 && (
        <div>
          <div className="text-xs font-semibold text-red-600 mb-1">OBSTÁCULOS</div>
          <div className="flex flex-wrap gap-2">
            {(goal.obstacles as any[]).map((obstacle: any, idx: number) => (
              <span
                key={idx}
                className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded"
              >
                {typeof obstacle === "string" ? obstacle : obstacle.obstacle}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Progress Trend */}
      {(goal.progressHistory as any[]).length > 1 && (
        <div className="pt-3 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-600 mb-2">HISTORIAL</div>
          <div className="flex items-center gap-2">
            {(goal.progressHistory as any[])
              .slice(-5)
              .map((entry: any, idx: number) => {
                const prev = idx > 0 ? (goal.progressHistory as any[])[idx - 1].progress : 0;
                const current = entry.progress;
                const trend = current > prev ? "up" : current < prev ? "down" : "flat";

                return (
                  <div key={idx} className="flex items-center gap-1 text-xs text-gray-600">
                    {trend === "up" && <TrendingUp className="w-3 h-3 text-green-600" />}
                    {trend === "down" && <TrendingDown className="w-3 h-3 text-red-600" />}
                    <span>{current}%</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

// Section Component
function Section({
  title,
  count,
  children,
  collapsible = false,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  collapsible?: boolean;
}) {
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
