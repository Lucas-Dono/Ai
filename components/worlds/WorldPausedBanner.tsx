/**
 * World Paused Banner
 *
 * Banner que indica que un mundo está pausado por inactividad
 * y ofrece reactivarlo con un botón.
 */

'use client';

import { useState } from 'react';
import { Clock, Play, Info } from 'lucide-react';

interface WorldPausedBannerProps {
  worldId: string;
  worldName: string;
  pauseReason: string;
  pausedAt: string;
  onResume?: () => void;
}

export function WorldPausedBanner({
  worldId,
  worldName,
  pauseReason,
  pausedAt,
  onResume,
}: WorldPausedBannerProps) {
  const [isResuming, setIsResuming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasonLabels: Record<string, { title: string; description: string }> = {
    inactivity_24h: {
      title: 'Pausado por inactividad',
      description: 'Este mundo fue pausado automáticamente después de 24 horas sin actividad.',
    },
    inactivity_7d: {
      title: 'Archivado por inactividad',
      description: 'Este mundo fue archivado después de 7 días sin actividad.',
    },
    inactivity_30d: {
      title: 'Programado para eliminación',
      description:
        'Este mundo ha estado inactivo por 30 días y será eliminado pronto si no se reactiva.',
    },
    manual: {
      title: 'Pausado manualmente',
      description: 'Este mundo fue pausado manualmente.',
    },
    system: {
      title: 'Pausado por el sistema',
      description: 'Este mundo fue pausado temporalmente por mantenimiento del sistema.',
    },
  };

  const reasonInfo = reasonLabels[pauseReason] || {
    title: 'Mundo pausado',
    description: 'Este mundo está actualmente pausado.',
  };

  const handleResume = async () => {
    setIsResuming(true);
    setError(null);

    try {
      // El endpoint de mensaje ya maneja el auto-resume
      // Solo necesitamos notificar al componente padre
      if (onResume) {
        onResume();
      } else {
        // Si no hay callback, recargar la página
        window.location.reload();
      }
    } catch (err) {
      setError('Error al reactivar el mundo. Por favor, intenta de nuevo.');
      setIsResuming(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
      return 'hace unos minutos';
    }
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
            {reasonInfo.title}
          </h3>

          <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
            {reasonInfo.description}
          </p>

          <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
            <Info className="w-3.5 h-3.5" />
            <span>Pausado {formatDate(pausedAt)}</span>
          </div>

          {pauseReason === 'inactivity_30d' && (
            <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
              <p className="text-xs text-red-800 dark:text-red-200 font-medium">
                ⚠️ Este mundo será eliminado permanentemente en 7 días si no se reactiva.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
              <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleResume}
          disabled={isResuming}
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white text-sm font-medium rounded-2xl transition-colors disabled:cursor-not-allowed"
        >
          {isResuming ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Reactivando...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Reactivar</span>
            </>
          )}
        </button>
      </div>

      {/* Info adicional sobre el ahorro de costos */}
      <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>Ahorro de costos:</strong> Los mundos pausados no consumen recursos de
            procesamiento ni generan eventos emergentes, ayudando a reducir costos operacionales.
            Puedes reactivar este mundo en cualquier momento con el botón de arriba.
          </p>
        </div>
      </div>
    </div>
  );
}
