"use client";

import React from "react";
import type { CurrentActivity, NextActivity, ActivityType } from "@/types/routine";

interface CurrentActivityDisplayProps {
  currentActivity?: CurrentActivity | null;
  nextActivity?: NextActivity | null;
  className?: string;
}

/**
 * Activity icons mapping
 */
const activityIcons: Record<ActivityType, string> = {
  sleep: "😴",
  work: "💼",
  meal: "🍽️",
  exercise: "🏃",
  social: "👥",
  personal: "🧘",
  hobby: "🎨",
  commute: "🚗",
  other: "📅",
};

/**
 * Activity status colors
 */
const activityColors: Record<ActivityType, string> = {
  sleep: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  work: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  meal: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  exercise: "bg-green-500/10 text-green-700 dark:text-green-300",
  social: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  personal: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
  hobby: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  commute: "bg-gray-500/10 text-gray-700 dark:text-gray-300",
  other: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

/**
 * Format time for display
 */
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Current Activity Display Component
 *
 * Shows what the character is currently doing and what's next
 */
export function CurrentActivityDisplay({
  currentActivity,
  nextActivity,
  className = "",
}: CurrentActivityDisplayProps) {
  if (!currentActivity && !nextActivity) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Current Activity */}
      {currentActivity && (
        <div
          className={`flex items-center gap-3 rounded-lg border p-3 ${
            activityColors[currentActivity.type]
          } border-current/20`}
        >
          <span className="text-2xl" role="img" aria-label={currentActivity.type}>
            {activityIcons[currentActivity.type]}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold truncate">
                {currentActivity.name}
              </h3>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-current/10">
                Now
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs opacity-75">
              {currentActivity.location && (
                <>
                  <span>📍 {currentActivity.location}</span>
                  <span>•</span>
                </>
              )}
              <span>Until {formatTime(currentActivity.expectedEnd)}</span>
            </div>

            {currentActivity.notes && (
              <p className="mt-1 text-xs opacity-60 truncate">
                {currentActivity.notes}
              </p>
            )}
          </div>

          {/* Response style indicator */}
          {currentActivity.responseStyle &&
            currentActivity.responseStyle !== "normal" && (
              <div className="flex-shrink-0">
                <ResponseStyleBadge style={currentActivity.responseStyle} />
              </div>
            )}
        </div>
      )}

      {/* Next Activity */}
      {nextActivity && (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-3 opacity-60">
          <span className="text-xl opacity-50" role="img" aria-label={nextActivity.type}>
            {activityIcons[nextActivity.type]}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Next:
              </span>
              <h4 className="text-sm font-semibold truncate">{nextActivity.name}</h4>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
              {formatTime(nextActivity.scheduledStart)}
              {nextActivity.durationMinutes && (
                <span> • {nextActivity.durationMinutes} min</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Response Style Badge
 */
function ResponseStyleBadge({ style }: { style: string }) {
  const badges: Record<string, { label: string; icon: string; color: string }> = {
    brief_professional: {
      label: "Brief",
      icon: "💼",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    brief_casual: {
      label: "Busy",
      icon: "⏱️",
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    },
    energetic: {
      label: "Energetic",
      icon: "⚡",
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
    relaxed: {
      label: "Relaxed",
      icon: "😌",
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
    distracted: {
      label: "Distracted",
      icon: "🚗",
      color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
    },
    drowsy: {
      label: "Sleepy",
      icon: "😴",
      color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    },
    unavailable: {
      label: "Unavailable",
      icon: "🌙",
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
  };

  const badge = badges[style] || {
    label: style,
    icon: "ℹ️",
    color: "bg-gray-100 text-gray-700",
  };

  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
      title={`Response style: ${badge.label}`}
    >
      <span role="img" aria-label={badge.label}>
        {badge.icon}
      </span>
      <span className="hidden sm:inline">{badge.label}</span>
    </div>
  );
}

/**
 * Compact version for inline display
 */
export function CurrentActivityBadge({
  currentActivity,
}: {
  currentActivity: CurrentActivity | null;
}) {
  if (!currentActivity) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
        activityColors[currentActivity.type]
      }`}
      title={`Currently: ${currentActivity.name}`}
    >
      <span className="text-sm" role="img" aria-label={currentActivity.type}>
        {activityIcons[currentActivity.type]}
      </span>
      <span className="hidden sm:inline truncate max-w-[120px]">
        {currentActivity.name}
      </span>
    </div>
  );
}

/**
 * Hook to fetch routine context
 */
export function useRoutineContext(agentId: string) {
  const [currentActivity, setCurrentActivity] = React.useState<CurrentActivity | null>(
    null
  );
  const [nextActivity, setNextActivity] = React.useState<NextActivity | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchRoutine() {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/agents/${agentId}/routine`);

        if (!res.ok) {
          if (res.status === 404) {
            // No routine exists
            setCurrentActivity(null);
            setNextActivity(null);
            setLoading(false);
            return;
          }
          throw new Error("Failed to fetch routine");
        }

        const data = await res.json();
        setCurrentActivity(data.currentState?.currentActivity || null);
        setNextActivity(data.currentState?.nextActivity || null);
        setError(null);
      } catch (err) {
        console.error("Error fetching routine:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    if (agentId) {
      fetchRoutine();

      // Refresh every minute
      const interval = setInterval(fetchRoutine, 60000);
      return () => clearInterval(interval);
    }
  }, [agentId]);

  return { currentActivity, nextActivity, loading, error };
}
