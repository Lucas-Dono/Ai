/**
 * World Paused Badge
 *
 * Badge pequeño que indica que un mundo está pausado.
 * Útil para listas y cards de mundos.
 */

'use client';

import { Clock } from 'lucide-react';

interface WorldPausedBadgeProps {
  pauseReason?: string;
  className?: string;
}

export function WorldPausedBadge({ pauseReason, className = '' }: WorldPausedBadgeProps) {
  const getLabel = () => {
    switch (pauseReason) {
      case 'inactivity_24h':
        return 'Pausado (24h)';
      case 'inactivity_7d':
        return 'Archivado (7d)';
      case 'inactivity_30d':
        return 'Por eliminar';
      case 'manual':
        return 'Pausado';
      case 'system':
        return 'Mantenimiento';
      default:
        return 'Pausado';
    }
  };

  const getColor = () => {
    if (pauseReason === 'inactivity_30d') {
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
    }
    return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${getColor()} ${className}`}
    >
      <Clock className="w-3 h-3" />
      <span>{getLabel()}</span>
    </div>
  );
}
