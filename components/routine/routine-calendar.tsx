"use client";

import { useState, useEffect } from "react";
import type {
  CurrentActivity,
  RoutineTemplate,
  ActivityType,
  DayOfWeek
} from "@/types/routine";

interface RoutineCalendarProps {
  agentId: string;
  className?: string;
}

interface RoutineData {
  id: string;
  agentId: string;
  timezone: string;
  enabled: boolean;
  realismLevel: string;
  templates: RoutineTemplate[];
  currentActivity: CurrentActivity | null;
}

const DAYS: { label: string; value: DayOfWeek }[] = [
  { label: "Lun", value: 1 },
  { label: "Mar", value: 2 },
  { label: "Mié", value: 3 },
  { label: "Jue", value: 4 },
  { label: "Vie", value: 5 },
  { label: "Sáb", value: 6 },
  { label: "Dom", value: 0 },
];

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  sleep: "bg-indigo-100 border-indigo-300 text-indigo-900",
  work: "bg-blue-100 border-blue-300 text-blue-900",
  meal: "bg-amber-100 border-amber-300 text-amber-900",
  exercise: "bg-green-100 border-green-300 text-green-900",
  social: "bg-pink-100 border-pink-300 text-pink-900",
  personal: "bg-purple-100 border-purple-300 text-purple-900",
  hobby: "bg-cyan-100 border-cyan-300 text-cyan-900",
  commute: "bg-gray-100 border-gray-300 text-gray-900",
  other: "bg-slate-100 border-slate-300 text-slate-900",
};

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  sleep: "😴",
  work: "💼",
  meal: "🍽️",
  exercise: "🏃",
  social: "👥",
  personal: "🧘",
  hobby: "🎨",
  commute: "🚗",
  other: "📋",
};

export function RoutineCalendar({ agentId, className = "" }: RoutineCalendarProps) {
  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(
    new Date().getDay() as DayOfWeek
  );

  useEffect(() => {
    fetchRoutine();
  }, [agentId]);

  async function fetchRoutine() {
    try {
      const response = await fetch(`/api/v1/agents/${agentId}/routine`);
      if (response.ok) {
        const data = await response.json();
        setRoutine(data);
      }
    } catch (error) {
      console.error("Error fetching routine:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!routine) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center py-8 text-gray-500">
          <p>Este personaje no tiene una rutina configurada.</p>
        </div>
      </div>
    );
  }

  // Filter templates for selected day
  const todayTemplates = routine.templates
    .filter((t) => t.daysOfWeek.includes(selectedDay))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className={`${className}`}>
      {/* Header with current activity */}
      {routine.currentActivity && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {ACTIVITY_ICONS[routine.currentActivity.type]}
            </span>
            <div>
              <div className="text-sm font-medium text-gray-600">
                Ahora mismo:
              </div>
              <div className="text-lg font-bold text-gray-900">
                {routine.currentActivity.name}
              </div>
              <div className="text-sm text-gray-600">
                {routine.currentActivity.timeRange}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day selector */}
      <div className="mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {DAYS.map((day) => (
            <button
              key={day.value}
              onClick={() => setSelectedDay(day.value)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap
                transition-colors
                ${
                  selectedDay === day.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {todayTemplates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay actividades programadas para este día.</p>
          </div>
        ) : (
          todayTemplates.map((template) => (
            <div
              key={template.id}
              className={`
                p-4 rounded-lg border-l-4
                ${ACTIVITY_COLORS[template.type]}
                hover:shadow-md transition-shadow
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {ACTIVITY_ICONS[template.type]}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{template.name}</h3>
                    {template.isFlexible && (
                      <span className="text-xs px-2 py-0.5 rounded bg-white/50">
                        Flexible
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium mb-1">
                    {template.startTime} - {template.endTime}
                  </div>
                  {template.description && (
                    <p className="text-sm opacity-80">
                      {template.description}
                    </p>
                  )}
                  {template.location && (
                    <div className="text-xs mt-2 opacity-70">
                      📍 {template.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Zona horaria:</span> {routine.timezone}
          </div>
          <div>
            <span className="font-medium">Realismo:</span>{" "}
            <span className="capitalize">{routine.realismLevel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
