/**
 * TOKEN USAGE WARNING
 *
 * Professional warning system that only appears when approaching daily limit.
 * Similar to industry leaders (OpenAI, Anthropic) - subtle and non-intrusive.
 *
 * Warning Levels:
 * - 70-89%: Soft warning (yellow)
 * - 90-99%: Critical warning (red)
 * - 100%: Limit reached (red, blocking)
 * - <70%: Nothing shown (clean UX)
 */

'use client';

import { useTokenUsage, getUsagePercentage } from '@/hooks/useTokenUsage';
import { AlertTriangle, XCircle, Zap } from 'lucide-react';
import Link from 'next/link';

interface TokenUsageDisplayProps {
  /**
   * Show upgrade button in warnings
   */
  showUpgradeHint?: boolean;
  /**
   * Callback when upgrade button is clicked
   */
  onUpgradeClick?: () => void;
}

export function TokenUsageDisplay({
  showUpgradeHint = true,
  onUpgradeClick,
}: TokenUsageDisplayProps) {
  const { data, isLoading, error } = useTokenUsage();

  // Don't show anything while loading or on error
  if (isLoading || error || !data) return null;

  const { messages, tokens, tier } = data;

  // Don't show for unlimited plans
  if (messages.limit === -1) return null;

  const percentage = getUsagePercentage(messages.used, messages.limit);
  const remaining = messages.remaining;

  // Only show warnings when approaching limit (70%+)
  if (percentage < 70) return null;

  // Critical warning (90%+)
  if (percentage >= 90) {
    return (
      <div className="border-b border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                {percentage >= 100 ? 'Límite diario alcanzado' : 'Casi sin mensajes disponibles'}
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                {percentage >= 100
                  ? 'Has usado todos tus mensajes de hoy. Vuelve mañana o actualiza tu plan.'
                  : `Solo quedan ~${remaining} mensajes hoy. Actualiza para continuar sin límites.`
                }
              </p>
              {showUpgradeHint && (
                <button
                  onClick={onUpgradeClick}
                  className="mt-2 text-xs font-medium text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  Ver planes Plus →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Soft warning (70-89%)
  return (
    <div className="border-b border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
              Acercándote al límite diario
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Te quedan ~{remaining} mensajes hoy. Con Plus tendrías ~5,000 mensajes/día.
            </p>
            {showUpgradeHint && (
              <button
                onClick={onUpgradeClick}
                className="mt-2 text-xs font-medium text-yellow-600 dark:text-yellow-400 hover:underline flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                Actualizar a Plus →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Optional: Badge for settings/dashboard pages
 * Shows subtle indicator only when approaching limit
 */
export function TokenUsageBadge() {
  const { data, isLoading } = useTokenUsage();

  if (isLoading || !data) return null;

  const { messages } = data;
  const percentage = getUsagePercentage(messages.used, messages.limit);

  // Don't show for unlimited
  if (messages.limit === -1) return null;

  // Only show when approaching limit (70%+)
  if (percentage < 70) return null;

  const isCritical = percentage >= 90;

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
      <span>
        ~{messages.remaining} restantes hoy
      </span>
    </div>
  );
}
