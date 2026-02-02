'use client';

import { AlertCircle, Zap, Heart, ShieldAlert, Users, Target } from 'lucide-react';
import type { BehaviorPrediction } from '@/lib/psychological-analysis';

interface BehaviorPredictionCardProps {
  prediction: BehaviorPrediction;
}

/**
 * Card que muestra una predicción de comportamiento con likelihood.
 */
export function BehaviorPredictionCard({ prediction }: BehaviorPredictionCardProps) {
  const likelihoodPercent = Math.round(prediction.likelihood * 100);

  // Configuración según likelihood
  const getLikelihoodConfig = (likelihood: number) => {
    if (likelihood >= 0.7) {
      return {
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        barColor: 'bg-red-500',
        label: 'Muy probable',
      };
    }
    if (likelihood >= 0.5) {
      return {
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
        barColor: 'bg-orange-500',
        label: 'Probable',
      };
    }
    if (likelihood >= 0.3) {
      return {
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        barColor: 'bg-yellow-500',
        label: 'Posible',
      };
    }
    return {
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      barColor: 'bg-blue-500',
      label: 'Poco probable',
    };
  };

  const config = getLikelihoodConfig(prediction.likelihood);

  // Nombres amigables para comportamientos
  const behaviorNames: Record<string, string> = {
    YANDERE_OBSESSIVE: 'Yandere Obsesivo',
    BPD_SPLITTING: 'Splitting (BPD)',
    NPD_GRANDIOSE: 'Narcisismo Grandioso',
    ANXIOUS_ATTACHMENT: 'Apego Ansioso',
    CODEPENDENCY: 'Codependencia',
    AVOIDANT_DISMISSIVE: 'Evitación Desdeñosa',
    MANIPULATIVE: 'Manipulación',
    IMPULSIVE: 'Impulsividad',
    PERFECTIONIST: 'Perfeccionismo',
    PEOPLE_PLEASER: 'Complacencia',
  };

  const behaviorName = behaviorNames[prediction.behaviorType] || prediction.behaviorType;

  return (
    <div className="rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">{behaviorName}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color} font-medium`}>{config.label}</span>
            <span className="text-xs text-slate-400">{likelihoodPercent}%</span>
          </div>
        </div>
        <Target className={`w-5 h-5 ${config.color}`} />
      </div>

      {/* Likelihood bar */}
      <div className="mb-3">
        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className={`h-full ${config.barColor} transition-all duration-500 ease-out`}
            style={{ width: `${likelihoodPercent}%` }}
          />
        </div>
      </div>

      {/* Triggering factors */}
      {prediction.triggeringFactors.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            Factores Desencadenantes:
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {prediction.triggeringFactors.map((factor, idx) => (
              <span key={idx} className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded border border-slate-600/50">
                {factor}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Early warnings */}
      {prediction.earlyWarnings.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-orange-400" />
            Señales de Advertencia:
          </h4>
          <ul className="space-y-1">
            {prediction.earlyWarnings.slice(0, 3).map((warning, idx) => (
              <li key={idx} className="text-xs text-slate-400 flex items-start gap-1.5">
                <span className="text-orange-400 mt-0.5">⚠</span>
                <span className="flex-1">{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Lista de predicciones de comportamiento.
 */
export function BehaviorPredictionList({ predictions }: { predictions: BehaviorPrediction[] }) {
  if (predictions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No se detectaron comportamientos significativos</p>
        <p className="text-xs mt-1 opacity-70">El perfil sugiere patrones equilibrados</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {predictions.map((prediction, idx) => (
        <BehaviorPredictionCard key={`${prediction.behaviorType}-${idx}`} prediction={prediction} />
      ))}
    </div>
  );
}
