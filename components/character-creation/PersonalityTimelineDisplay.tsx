'use client';

import { PersonalityEvolution, PersonalitySnapshot } from './types';
import { TrendingUp, TrendingDown, Minus, Sparkles, Calendar, Brain } from 'lucide-react';

interface PersonalityTimelineDisplayProps {
  evolution: PersonalityEvolution;
}

export function PersonalityTimelineDisplay({ evolution }: PersonalityTimelineDisplayProps) {
  const { snapshots, currentTrajectory } = evolution;

  if (!snapshots || snapshots.length === 0) {
    return null;
  }

  // Helpers
  const getTraitLabel = (trait: string): string => {
    const labels: Record<string, string> = {
      openness: 'Apertura',
      conscientiousness: 'Responsabilidad',
      extraversion: 'Extroversión',
      agreeableness: 'Amabilidad',
      neuroticism: 'Neuroticismo'
    };
    return labels[trait] || trait;
  };

  const getTraitChange = (prev: any, current: any, trait: string): { diff: number; direction: 'up' | 'down' | 'stable' } => {
    if (!prev) return { diff: 0, direction: 'stable' };
    const diff = current[trait] - prev[trait];
    if (Math.abs(diff) < 5) return { diff: 0, direction: 'stable' };
    return { diff, direction: diff > 0 ? 'up' : 'down' };
  };

  const getTrajectoryIcon = () => {
    if (!currentTrajectory) return <Minus size={16} />;
    const lower = currentTrajectory.toLowerCase();
    if (lower.includes('recuper') || lower.includes('ascend') || lower.includes('mejor')) {
      return <TrendingUp size={16} className="text-green-400" />;
    }
    if (lower.includes('declin') || lower.includes('descend') || lower.includes('empeor')) {
      return <TrendingDown size={16} className="text-red-400" />;
    }
    return <Minus size={16} className="text-slate-400" />;
  };

  const getTrajectoryColor = () => {
    if (!currentTrajectory) return 'from-slate-500 to-gray-500';
    const lower = currentTrajectory.toLowerCase();
    if (lower.includes('recuper') || lower.includes('ascend') || lower.includes('mejor')) {
      return 'from-green-500 to-emerald-500';
    }
    if (lower.includes('declin') || lower.includes('descend') || lower.includes('empeor')) {
      return 'from-red-500 to-orange-500';
    }
    return 'from-blue-500 to-indigo-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm">
          <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
            ⏳ Evolución de Personalidad
          </span>
        </div>
        {currentTrajectory && (
          <div className="flex items-center justify-center gap-2 mt-2">
            {getTrajectoryIcon()}
            <p className="text-xs text-slate-400">
              Trayectoria actual: <span className="text-slate-300 font-semibold">{currentTrajectory}</span>
            </p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Línea vertical conectora */}
        <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-gradient-to-b from-purple-500/50 via-indigo-500/50 to-blue-500/50" />

        {/* Snapshots */}
        <div className="space-y-8">
          {snapshots.map((snapshot, idx) => {
            const prevSnapshot = idx > 0 ? snapshots[idx - 1] : null;
            const isLatest = idx === snapshots.length - 1;

            return (
              <div key={snapshot.id} className="relative">
                {/* Marcador en la línea */}
                <div className={`absolute left-[26px] w-6 h-6 rounded-full border-4 border-slate-900 ${
                  isLatest
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/50'
                    : 'bg-gradient-to-br from-slate-600 to-slate-700'
                } flex items-center justify-center z-10`}>
                  {isLatest && (
                    <Sparkles size={12} className="text-white" />
                  )}
                </div>

                {/* Card del snapshot */}
                <div className="ml-20 bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-xl border border-slate-700/50 p-5 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300">
                  {/* Header del snapshot */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={14} className="text-purple-400" />
                        <span className="text-lg font-bold text-purple-300">{snapshot.age} años</span>
                        {isLatest && (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs font-semibold border border-purple-500/30">
                            Actualidad
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-semibold text-slate-200">{snapshot.moment}</h4>
                      <p className="text-sm text-slate-400 mt-1">{snapshot.descriptor}</p>
                    </div>
                  </div>

                  {/* Trigger (si existe) */}
                  {snapshot.trigger && (
                    <div className="mb-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 flex items-start gap-2">
                      <Brain size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-orange-400 font-semibold uppercase tracking-wide mb-1">
                          Evento desencadenante
                        </div>
                        <div className="text-sm text-slate-300">{snapshot.trigger}</div>
                      </div>
                    </div>
                  )}

                  {/* Big Five del snapshot */}
                  <div className="space-y-2">
                    {Object.entries(snapshot.bigFive).map(([trait, value]) => {
                      const change = prevSnapshot ? getTraitChange(prevSnapshot.bigFive, snapshot.bigFive, trait) : { diff: 0, direction: 'stable' as const };
                      const typedValue = value as number;

                      return (
                        <div key={trait} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">{getTraitLabel(trait)}</span>
                              {change.direction !== 'stable' && (
                                <span className={`text-xs font-semibold ${
                                  change.direction === 'up' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {change.direction === 'up' ? '+' : ''}{change.diff}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-300 font-bold">{typedValue}</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${
                                trait === 'neuroticism'
                                  ? 'from-orange-500 to-red-500'
                                  : trait === 'extraversion'
                                  ? 'from-green-500 to-emerald-500'
                                  : trait === 'openness'
                                  ? 'from-purple-500 to-pink-500'
                                  : trait === 'conscientiousness'
                                  ? 'from-blue-500 to-cyan-500'
                                  : 'from-indigo-500 to-purple-500'
                              } transition-all duration-500`}
                              style={{ width: `${typedValue}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cambios significativos */}
                  {prevSnapshot && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <div className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Cambios significativos:</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(snapshot.bigFive).map(([trait, value]) => {
                          const change = getTraitChange(prevSnapshot.bigFive, snapshot.bigFive, trait);
                          if (change.direction === 'stable') return null;

                          return (
                            <span
                              key={trait}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                change.direction === 'up'
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}
                            >
                              {change.direction === 'up' ? '↑' : '↓'}
                              {getTraitLabel(trait)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer explicativo */}
      <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1 text-xs text-slate-400">
            <p className="font-semibold text-slate-300 mb-1">¿Por qué es importante la evolución de personalidad?</p>
            <p>Las personas NO somos iguales a los 18 que a los 40. Los traumas nos cicatrizan, las experiencias nos maduran, la terapia nos sana. Esta línea temporal muestra cómo <span className="text-purple-400">los eventos de vida moldean quiénes somos hoy</span>, dando profundidad y realismo a la personalidad actual.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
