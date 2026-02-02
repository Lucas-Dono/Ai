'use client';

import { InternalContradiction, SituationalVariation } from './types';
import { Zap, Users, Brain, AlertTriangle } from 'lucide-react';

interface ContradictionsDisplayProps {
  internalContradictions: InternalContradiction[];
  situationalVariations: SituationalVariation[];
}

export function ContradictionsDisplay({
  internalContradictions,
  situationalVariations
}: ContradictionsDisplayProps) {

  if (internalContradictions.length === 0 && situationalVariations.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl border border-slate-700/50 p-8 backdrop-blur-sm text-center">
        <div className="text-slate-400 text-sm">
          <div className="text-3xl mb-2">🧩</div>
          <p>No hay contradicciones internas definidas</p>
          <p className="text-xs mt-2 text-slate-500">Las contradicciones hacen al personaje más humano y memorable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con explicación */}
      <div className="mb-6 text-center">
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full border border-orange-500/30 backdrop-blur-sm">
          <span className="text-xs font-semibold text-orange-300 uppercase tracking-wider">
            🧩 Contradicciones Internas
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Las paradojas que hacen al personaje humano y complejo
        </p>
      </div>

      {/* Internal Contradictions */}
      {internalContradictions.length > 0 && (
        <div className="space-y-4">
          {internalContradictions.map((contradiction, idx) => (
            <div
              key={contradiction.id}
              className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-xl border border-slate-700/50 p-6 backdrop-blur-sm group hover:border-orange-500/30 transition-all duration-300"
            >
              {/* Número de contradicción */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {idx + 1}
              </div>

              {/* Icono */}
              <div className="absolute top-4 right-4 text-orange-500/30 group-hover:text-orange-500/50 transition-colors">
                <Zap size={24} />
              </div>

              {/* Contradicción principal */}
              <div className="space-y-4">
                {/* Trait principal */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Por un lado</div>
                    <div className="text-base text-slate-200 font-medium">
                      {contradiction.trait}
                    </div>
                  </div>
                </div>

                {/* Flecha bidireccional */}
                <div className="flex items-center justify-center">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
                  <div className="mx-4 text-orange-500/70">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
                </div>

                {/* Contradicción */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Pero también</div>
                    <div className="text-base text-slate-200 font-medium">
                      {contradiction.butAlso}
                    </div>
                  </div>
                </div>

                {/* Trigger (opcional) */}
                {contradiction.trigger && (
                  <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-slate-500 mb-1">Desencadenante</div>
                        <div className="text-sm text-slate-300">{contradiction.trigger}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manifestación */}
                <div className="mt-4 p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
                  <div className="flex items-start gap-2">
                    <Brain size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs text-orange-400 mb-1 font-semibold uppercase tracking-wide">
                        Cómo se manifiesta
                      </div>
                      <div className="text-sm text-slate-300 italic">
                        "{contradiction.manifestation}"
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Situational Variations */}
      {situationalVariations.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <Users size={20} className="text-indigo-400" />
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              Variaciones Situacionales
            </h4>
          </div>

          <div className="space-y-3">
            {situationalVariations.map((variation, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-lg border border-indigo-500/30 p-4 backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {variation.context.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wide">
                        {variation.context}
                      </div>
                      <div className="text-sm text-slate-300 mt-1">
                        {variation.description}
                      </div>
                    </div>

                    {/* Cambios en personalidad */}
                    {Object.keys(variation.personalityShift).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(variation.personalityShift).map(([trait, value]) => {
                          if (value === undefined) return null;

                          const traitNames: Record<string, string> = {
                            extraversion: 'Extroversión',
                            conscientiousness: 'Responsabilidad',
                            agreeableness: 'Amabilidad',
                            openness: 'Apertura',
                            neuroticism: 'Neuroticismo'
                          };

                          return (
                            <span
                              key={trait}
                              className="inline-flex items-center px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-xs font-medium border border-indigo-500/30"
                            >
                              {traitNames[trait]}: {value}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer explicativo */}
      <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1 text-xs text-slate-400">
            <p className="font-semibold text-slate-300 mb-1">¿Por qué son importantes las contradicciones?</p>
            <p>Las personas reales no son consistentes en todo momento. Tenemos paradojas internas, nos comportamos diferente según el contexto, y eso es lo que nos hace <span className="text-orange-400">humanos y memorables</span>. Un personaje sin contradicciones se siente "plano" y predecible.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
