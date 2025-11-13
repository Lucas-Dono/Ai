/**
 * USAGE INDICATOR
 *
 * Muestra progreso de uso de mensajes de forma NO intrusiva.
 * Aparece en la parte superior del chat, siempre visible pero sutil.
 *
 * Diseño:
 * - Verde: 0-69% (todo bien)
 * - Amarillo: 70-89% (advertencia)
 * - Rojo: 90-100% (crítico)
 */

'use client';

import { getUsageProgress, getUsageText } from '@/lib/usage/upgrade-prompts';

interface Props {
  current: number;
  limit: number;
  resource?: 'messages' | 'images' | 'voice';
  showUpgradeHint?: boolean;
  onUpgradeClick?: () => void;
}

export function UsageIndicator({
  current,
  limit,
  resource = 'messages',
  showUpgradeHint = false,
  onUpgradeClick,
}: Props) {

  const { percentage, color, shouldWarn } = getUsageProgress(current, limit);
  const usageText = getUsageText(current, limit, resource);

  // Si es unlimited, mostrar solo el contador
  if (limit === -1) {
    return (
      <div className="flex items-center justify-center px-4 py-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {usageText} • Ilimitado ✨
        </span>
      </div>
    );
  }

  const colorClasses = {
    green: {
      bar: 'bg-green-500',
      text: 'text-green-700',
      bg: 'bg-green-50',
    },
    yellow: {
      bar: 'bg-yellow-500',
      text: 'text-yellow-700',
      bg: 'bg-yellow-50',
    },
    red: {
      bar: 'bg-red-500',
      text: 'text-red-700',
      bg: 'bg-red-50',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`px-4 py-2 ${shouldWarn ? colors.bg : 'bg-gray-50'} border-b`}>
      <div className="max-w-4xl mx-auto">
        {/* Barra de progreso */}
        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="flex-1">
            <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 ${colors.bar} transition-all duration-300 ease-out`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Texto de uso */}
          <span className={`text-xs font-medium ${colors.text} min-w-[120px] text-right`}>
            {usageText}
          </span>
        </div>

        {/* Hint de upgrade (solo si shouldWarn) */}
        {shouldWarn && showUpgradeHint && onUpgradeClick && (
          <button
            onClick={onUpgradeClick}
            className="
              mt-2 w-full text-xs text-left
              text-gray-600 hover:text-gray-900
              flex items-center justify-between
              group
            "
          >
            <span>
              {percentage >= 90
                ? '⚠️ Casi sin mensajes. Upgrade para continuar'
                : '💡 Con Plus tendrías 100 mensajes/día'}
            </span>
            <span className="text-blue-600 group-hover:underline">
              Ver planes →
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Versión compacta para sidebar
 */
export function UsageIndicatorCompact({
  current,
  limit,
  resource = 'messages',
}: Omit<Props, 'showUpgradeHint' | 'onUpgradeClick'>) {

  const { percentage, color } = getUsageProgress(current, limit);

  if (limit === -1) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span>Ilimitado</span>
      </div>
    );
  }

  const colorClasses = {
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color === 'green' ? 'bg-green-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`font-medium ${colorClasses[color]} min-w-[60px] text-right`}>
        {current}/{limit}
      </span>
    </div>
  );
}
