'use client';

import { useMemo } from 'react';
import { Brain, CheckCircle2, AlertCircle } from 'lucide-react';
import type { EnrichedPersonalityProfile } from '@/lib/psychological-analysis';
import { analyzePsychologicalProfile } from '@/lib/psychological-analysis';
import { ConflictCardList } from './ConflictCard';
import { BehaviorPredictionList } from './BehaviorPredictionCard';

interface AnalysisTabProps {
  profile: EnrichedPersonalityProfile;
  onConflictDismiss?: (conflictId: string) => void;
}

/**
 * Tab principal de análisis psicológico.
 * Muestra:
 * - Score de autenticidad
 * - Conflictos detectados
 * - Comportamientos predichos
 */
export function AnalysisTab({ profile, onConflictDismiss }: AnalysisTabProps) {
  // Ejecutar análisis completo (con memoization)
  const analysis = useMemo(() => {
    try {
      return analyzePsychologicalProfile(profile);
    } catch (error) {
      console.error('Error analyzing psychological profile:', error);
      return null;
    }
  }, [profile]);

  if (!analysis) {
    return (
      <div className="text-center py-12 text-slate-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Error al analizar el perfil psicológico</p>
        <p className="text-xs mt-1 opacity-70">Por favor, verifica los datos del perfil</p>
      </div>
    );
  }

  const { authenticityScore, detectedConflicts, predictedBehaviors } = analysis;

  // Configuración de color para authenticity level
  const getAuthenticityColor = (level: typeof authenticityScore.level) => {
    switch (level) {
      case 'highly-authentic':
        return 'text-green-400';
      case 'mostly-coherent':
        return 'text-blue-400';
      case 'some-inconsistencies':
        return 'text-yellow-400';
      case 'unrealistic':
        return 'text-orange-400';
      case 'highly-inconsistent':
        return 'text-red-400';
    }
  };

  const getAuthenticityLabel = (level: typeof authenticityScore.level) => {
    switch (level) {
      case 'highly-authentic':
        return 'Altamente Auténtico';
      case 'mostly-coherent':
        return 'Mayormente Coherente';
      case 'some-inconsistencies':
        return 'Algunas Inconsistencias';
      case 'unrealistic':
        return 'Poco Realista';
      case 'highly-inconsistent':
        return 'Altamente Inconsistente';
    }
  };

  const authenticityColor = getAuthenticityColor(authenticityScore.level);
  const authenticityLabel = getAuthenticityLabel(authenticityScore.level);

  return (
    <div className="space-y-6">
      {/* Authenticity Score */}
      <div className="rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 backdrop-blur-sm p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
              <Brain className="w-8 h-8 text-indigo-400" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-200 mb-2">Análisis de Autenticidad</h3>

            {/* Score bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-sm font-medium ${authenticityColor}`}>{authenticityLabel}</span>
                <span className="text-lg font-bold text-slate-200">{authenticityScore.score}%</span>
              </div>
              <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    authenticityScore.score >= 80
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : authenticityScore.score >= 60
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        : authenticityScore.score >= 40
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                          : 'bg-gradient-to-r from-orange-500 to-red-500'
                  } transition-all duration-500 ease-out`}
                  style={{ width: `${authenticityScore.score}%` }}
                />
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between px-2 py-1.5 bg-slate-800/50 rounded border border-slate-700/50">
                <span className="text-slate-400">Big Five ↔ Facetas:</span>
                <span className="text-slate-200 font-medium">{Math.round(authenticityScore.breakdown.bigFiveFacetsConsistency * 100)}%</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1.5 bg-slate-800/50 rounded border border-slate-700/50">
                <span className="text-slate-400">Valores ↔ Traits:</span>
                <span className="text-slate-200 font-medium">{Math.round(authenticityScore.breakdown.valuesTraitsAlignment * 100)}%</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1.5 bg-slate-800/50 rounded border border-slate-700/50">
                <span className="text-slate-400">Coherencia Emocional:</span>
                <span className="text-slate-200 font-medium">{Math.round(authenticityScore.breakdown.emotionalCoherence * 100)}%</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1.5 bg-slate-800/50 rounded border border-slate-700/50">
                <span className="text-slate-400">Dark Triad ↔ Amabilidad:</span>
                <span className="text-slate-200 font-medium">{Math.round(authenticityScore.breakdown.darkTriadCoherence * 100)}%</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1.5 bg-slate-800/50 rounded border border-slate-700/50">
                <span className="text-slate-400">Apego ↔ Extraversión:</span>
                <span className="text-slate-200 font-medium">{Math.round(authenticityScore.breakdown.attachmentCoherence * 100)}%</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1.5 bg-slate-800/50 rounded border border-slate-700/50">
                <span className="text-slate-400">Alineación Comportamiento:</span>
                <span className="text-slate-200 font-medium">{Math.round(authenticityScore.breakdown.behaviorAlignment * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conflicts */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-orange-400" />
          <h3 className="text-base font-semibold text-slate-200">
            Conflictos Detectados
            {detectedConflicts.length > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-400">({detectedConflicts.length})</span>
            )}
          </h3>
        </div>
        <ConflictCardList conflicts={detectedConflicts} onDismiss={onConflictDismiss} />
      </div>

      {/* Predicted Behaviors */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-slate-200">
            Comportamientos Predichos
            {predictedBehaviors.length > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-400">({predictedBehaviors.length})</span>
            )}
          </h3>
        </div>
        <BehaviorPredictionList predictions={predictedBehaviors} />
      </div>
    </div>
  );
}
