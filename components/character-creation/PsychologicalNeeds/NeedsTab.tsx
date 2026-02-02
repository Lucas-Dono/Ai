'use client';

import { Brain, Lightbulb, Users, Zap, Target, Sparkles } from 'lucide-react';
import type { PsychologicalNeeds } from '@/types/character-creation';

interface NeedsTabProps {
  needs: PsychologicalNeeds | undefined;
  onChange: (needs: PsychologicalNeeds) => void;
}

// Valores por defecto
const DEFAULT_NEEDS: PsychologicalNeeds = {
  connection: 0.5,
  autonomy: 0.5,
  competence: 0.5,
  novelty: 0.5,
};

// Configuración de cada necesidad
const NEEDS_CONFIG = [
  {
    key: 'connection' as const,
    icon: Users,
    label: 'Conexión',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    sliderColor: 'rgb(244 114 182)',
    description: 'Necesidad de relaciones significativas y sentido de pertenencia',
    lowDescription: 'Prefiere soledad y autonomía emocional',
    highDescription: 'Necesita conexiones profundas y cercanas constantemente',
  },
  {
    key: 'autonomy' as const,
    icon: Zap,
    label: 'Autonomía',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    sliderColor: 'rgb(59 130 246)',
    description: 'Necesidad de independencia, autodirección y control sobre la propia vida',
    lowDescription: 'Prefiere estructura y guía externa',
    highDescription: 'Necesita libertad total para tomar decisiones',
  },
  {
    key: 'competence' as const,
    icon: Target,
    label: 'Competencia',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    sliderColor: 'rgb(34 197 94)',
    description: 'Necesidad de sentirse capaz, efectivo y competente',
    lowDescription: 'Conforme con habilidades básicas',
    highDescription: 'Necesita maestría y excelencia continua',
  },
  {
    key: 'novelty' as const,
    icon: Sparkles,
    label: 'Novedad',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    sliderColor: 'rgb(168 85 247)',
    description: 'Necesidad de nuevas experiencias, estimulación y variedad',
    lowDescription: 'Prefiere rutina y familiaridad',
    highDescription: 'Necesita estímulos nuevos constantemente',
  },
];

export function NeedsTab({ needs, onChange }: NeedsTabProps) {
  const current = needs || DEFAULT_NEEDS;

  const handleChange = (key: keyof PsychologicalNeeds, value: number) => {
    onChange({
      ...current,
      [key]: value,
    });
  };

  // Convertir 0-1 a 0-100 para display
  const toPercent = (value: number) => Math.round(value * 100);
  const fromPercent = (percent: number) => percent / 100;

  // Determinar nivel de necesidad
  const getNeedLevel = (value: number) => {
    if (value < 0.3) return { label: 'Baja', color: 'text-slate-400' };
    if (value < 0.7) return { label: 'Media', color: 'text-yellow-400' };
    return { label: 'Alta', color: 'text-green-400' };
  };

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-indigo-300 mb-1">Necesidades Psicológicas Básicas (SDT)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Basado en la Teoría de Autodeterminación (Self-Determination Theory). Estas cuatro necesidades fundamentales impulsan la
              motivación y el bienestar psicológico. Los niveles altos indican que el personaje priorizará satisfacer esa necesidad en su
              comportamiento y decisiones.
            </p>
          </div>
        </div>
      </div>

      {/* Needs sliders */}
      <div className="space-y-5">
        {NEEDS_CONFIG.map((config) => {
          const value = current[config.key];
          const percent = toPercent(value);
          const level = getNeedLevel(value);
          const Icon = config.icon;

          return (
            <div key={config.key} className={`rounded-lg ${config.bgColor} border ${config.borderColor} p-4`}>
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`flex-shrink-0 ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-semibold ${config.color}`}>{config.label}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${level.color}`}>{level.label}</span>
                      <span className="text-sm font-bold text-slate-200">{percent}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{config.description}</p>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={percent}
                onChange={(e) => handleChange(config.key, fromPercent(parseInt(e.target.value)))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${config.sliderColor} ${percent}%, rgb(51 65 85 / 0.5) ${percent}%)`,
                }}
              />

              {/* Labels */}
              <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                <span className="max-w-[45%] text-left">{config.lowDescription}</span>
                <span className="max-w-[45%] text-right">{config.highDescription}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Balance indicator */}
      <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-4">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Balance de Necesidades</h4>
            <div className="grid grid-cols-2 gap-2">
              {NEEDS_CONFIG.map((config) => {
                const value = current[config.key];
                const percent = toPercent(value);
                return (
                  <div key={config.key} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 flex-1">{config.label}:</span>
                    <div className="w-16 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{ width: `${percent}%`, backgroundColor: config.sliderColor }}
                      />
                    </div>
                    <span className="text-xs text-slate-300 w-8 text-right">{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Impact note */}
      <div className="rounded-lg bg-gradient-to-r from-slate-700/30 to-slate-800/30 border border-slate-600/50 p-4">
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="font-medium text-slate-300">Nota:</span> Estas necesidades influyen en la motivación del personaje. Por ejemplo,
          alta necesidad de conexión puede llevar a comportamientos de búsqueda de aprobación, mientras que alta autonomía puede generar
          resistencia a la autoridad. El sistema de comportamientos usará estos valores para predecir patrones conductuales.
        </p>
      </div>
    </div>
  );
}
