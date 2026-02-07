'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, X, AlertCircle, AlertTriangle, Flame, Skull } from 'lucide-react';
import type { ConflictWarning } from '@/lib/psychological-analysis';

interface ConflictCardProps {
  conflict: ConflictWarning;
  onDismiss?: () => void;
}

/**
 * Card que muestra un conflicto psicológico detectado.
 * Variantes según severidad: info, warning, danger, critical.
 */
export function ConflictCard({ conflict, onDismiss }: ConflictCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Configuración según severidad
  const severityConfig = {
    info: {
      icon: AlertCircle,
      bgColor: 'from-blue-500/10 to-blue-600/10',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      textColor: 'text-blue-300',
      badgeColor: 'bg-blue-500/20 text-blue-300',
      pulse: false,
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'from-yellow-500/10 to-yellow-600/10',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-yellow-400',
      textColor: 'text-yellow-300',
      badgeColor: 'bg-yellow-500/20 text-yellow-300',
      pulse: false,
    },
    danger: {
      icon: Flame,
      bgColor: 'from-orange-500/10 to-orange-600/10',
      borderColor: 'border-orange-500/30',
      iconColor: 'text-orange-400',
      textColor: 'text-orange-300',
      badgeColor: 'bg-orange-500/20 text-orange-300',
      pulse: false,
    },
    critical: {
      icon: Skull,
      bgColor: 'from-red-500/10 to-red-600/10',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-400',
      textColor: 'text-red-300',
      badgeColor: 'bg-red-500/20 text-red-300',
      pulse: true,
    },
  };

  const config = severityConfig[conflict.severity];
  const Icon = config.icon;

  return (
    <div
      className={`relative rounded-lg bg-gradient-to-br ${config.bgColor} border ${config.borderColor} backdrop-blur-sm overflow-hidden transition-all duration-300 ${
        config.pulse ? 'animate-pulse' : ''
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          <Icon className={`w-5 h-5 ${config.pulse ? 'animate-pulse' : ''}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title + Badge */}
          <div className="flex items-start gap-2 mb-1">
            <h3 className={`text-sm font-semibold ${config.textColor} flex-1`}>{conflict.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${config.badgeColor} uppercase tracking-wide font-medium flex-shrink-0`}>
              {conflict.severity}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-400 leading-relaxed">{conflict.description}</p>

          {/* Expand/Collapse button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`mt-2 text-xs font-medium ${config.textColor} hover:underline flex items-center gap-1`}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Ocultar detalles
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Ver detalles
              </>
            )}
          </button>
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          {/* Implications */}
          {conflict.implications.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Implicaciones:</h4>
              <ul className="space-y-1.5">
                {conflict.implications.map((implication, idx) => (
                  <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className={`${config.iconColor} mt-0.5`}>•</span>
                    <span className="flex-1">{implication}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mitigations */}
          {conflict.mitigations.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Mitigaciones sugeridas:</h4>
              <ul className="space-y-1.5">
                {conflict.mitigations.map((mitigation, idx) => (
                  <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span className="flex-1">{mitigation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Lista de conflict cards agrupadas.
 */
export function ConflictCardList({ conflicts, onDismiss }: { conflicts: ConflictWarning[]; onDismiss?: (id: string) => void }) {
  if (conflicts.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No se detectaron conflictos psicológicos</p>
        <p className="text-xs mt-1 opacity-70">El perfil es coherente y consistente</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conflicts.map((conflict) => (
        <ConflictCard key={conflict.id} conflict={conflict} onDismiss={onDismiss ? () => onDismiss(conflict.id) : undefined} />
      ))}
    </div>
  );
}
