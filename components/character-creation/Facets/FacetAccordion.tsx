'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, HelpCircle, Palette, ClipboardCheck, Users, Handshake, Zap } from 'lucide-react';
import type { BigFiveFacets } from '@/lib/psychological-analysis';

interface FacetAccordionProps {
  dimension: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';
  facets: Record<string, number>;
  onChange: (facetName: string, value: number) => void;
  onReinfer: () => void;
}

// Configuración por dimensión
const DIMENSION_CONFIG = {
  openness: {
    label: 'Apertura a la Experiencia',
    color: 'purple',
    icon: Palette,
    facets: {
      imagination: 'Imaginación',
      artisticInterests: 'Intereses Artísticos',
      emotionality: 'Emocionalidad',
      adventurousness: 'Aventurosidad',
      intellect: 'Intelecto',
      liberalism: 'Liberalismo',
    },
    descriptions: {
      imagination: 'Capacidad imaginativa y fantasía',
      artisticInterests: 'Apreciación por el arte, música y literatura',
      emotionality: 'Profundidad de emociones',
      adventurousness: 'Búsqueda de aventura y nuevas experiencias',
      intellect: 'Curiosidad intelectual y amor por ideas abstractas',
      liberalism: 'Apertura a valores no tradicionales',
    },
  },
  conscientiousness: {
    label: 'Responsabilidad',
    color: 'blue',
    icon: ClipboardCheck,
    facets: {
      selfEfficacy: 'Autoeficacia',
      orderliness: 'Orden',
      dutifulness: 'Sentido del Deber',
      achievementStriving: 'Aspiración de Logro',
      selfDiscipline: 'Autodisciplina',
      cautiousness: 'Cautela',
    },
    descriptions: {
      selfEfficacy: 'Confianza en la propia capacidad',
      orderliness: 'Deseo de orden y organización',
      dutifulness: 'Sentido del deber y adherencia a obligaciones',
      achievementStriving: 'Motivación para lograr objetivos',
      selfDiscipline: 'Capacidad de autodisciplina',
      cautiousness: 'Tendencia a pensar antes de actuar',
    },
  },
  extraversion: {
    label: 'Extraversión',
    color: 'orange',
    icon: Users,
    facets: {
      friendliness: 'Cordialidad',
      gregariousness: 'Gregarismo',
      assertiveness: 'Asertividad',
      activityLevel: 'Nivel de Actividad',
      excitementSeeking: 'Búsqueda de Excitación',
      cheerfulness: 'Alegría',
    },
    descriptions: {
      friendliness: 'Cordialidad y calidez hacia otros',
      gregariousness: 'Preferencia por compañía de otros',
      assertiveness: 'Tendencia a tomar control y liderar',
      activityLevel: 'Nivel de energía y ritmo de actividad',
      excitementSeeking: 'Búsqueda de excitación y estimulación',
      cheerfulness: 'Nivel de entusiasmo y emociones positivas',
    },
  },
  agreeableness: {
    label: 'Amabilidad',
    color: 'green',
    icon: Handshake,
    facets: {
      trust: 'Confianza',
      morality: 'Moralidad',
      altruism: 'Altruismo',
      cooperation: 'Cooperación',
      modesty: 'Modestia',
      sympathy: 'Simpatía',
    },
    descriptions: {
      trust: 'Confianza en las intenciones de otros',
      morality: 'Honestidad y franqueza',
      altruism: 'Preocupación por el bienestar de otros',
      cooperation: 'Preferencia por cooperación sobre competencia',
      modesty: 'Humildad y modestia',
      sympathy: 'Capacidad de empatía y compasión',
    },
  },
  neuroticism: {
    label: 'Neuroticismo',
    color: 'red',
    icon: Zap,
    facets: {
      anxiety: 'Ansiedad',
      anger: 'Ira',
      depression: 'Depresión',
      selfConsciousness: 'Autoconsciencia',
      immoderation: 'Inmoderación',
      vulnerability: 'Vulnerabilidad',
    },
    descriptions: {
      anxiety: 'Nivel de ansiedad y preocupación',
      anger: 'Tendencia a experimentar enojo',
      depression: 'Susceptibilidad a la depresión',
      selfConsciousness: 'Timidez social y autoconsciencia',
      immoderation: 'Dificultad para resistir impulsos',
      vulnerability: 'Vulnerabilidad al estrés',
    },
  },
};

// Colores por dimensión
const COLOR_CLASSES = {
  purple: {
    bg: 'from-purple-500/10 to-purple-600/10',
    border: 'border-purple-500/30',
    text: 'text-purple-300',
    slider: 'accent-purple-500',
  },
  blue: {
    bg: 'from-blue-500/10 to-blue-600/10',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    slider: 'accent-blue-500',
  },
  orange: {
    bg: 'from-orange-500/10 to-orange-600/10',
    border: 'border-orange-500/30',
    text: 'text-orange-300',
    slider: 'accent-orange-500',
  },
  green: {
    bg: 'from-green-500/10 to-green-600/10',
    border: 'border-green-500/30',
    text: 'text-green-300',
    slider: 'accent-green-500',
  },
  red: {
    bg: 'from-red-500/10 to-red-600/10',
    border: 'border-red-500/30',
    text: 'text-red-300',
    slider: 'accent-red-500',
  },
};

export function FacetAccordion({ dimension, facets, onChange, onReinfer }: FacetAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const config = DIMENSION_CONFIG[dimension];
  const colors = COLOR_CLASSES[config.color as keyof typeof COLOR_CLASSES];

  return (
    <div className={`rounded-lg bg-gradient-to-br ${colors.bg} border ${colors.border} backdrop-blur-sm overflow-hidden`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`${colors.bg} p-2 rounded-lg`}>
            <config.icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          <span className={`text-sm font-semibold ${colors.text}`}>{config.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">6 facetas</span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-white/5">
          {/* Reinfer button */}
          <div className="pt-3 pb-2">
            <button
              onClick={onReinfer}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reinferir desde Big Five
            </button>
          </div>

          {/* Facet sliders */}
          <div className="space-y-4">
            {Object.entries(config.facets).map(([key, label]) => {
              const value = facets[key] || 50;
              const description = config.descriptions[key as keyof typeof config.descriptions];

              return (
                <div key={key} className="relative">
                  {/* Label and value */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-medium text-slate-300">{label}</label>
                      <button
                        onMouseEnter={() => setShowTooltip(key)}
                        onMouseLeave={() => setShowTooltip(null)}
                        className="relative text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <HelpCircle className="w-3 h-3" />
                        {showTooltip === key && (
                          <div className="absolute left-0 top-full mt-1 z-10 w-64 p-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 shadow-lg">
                            {description}
                          </div>
                        )}
                      </button>
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{value}</span>
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => onChange(key, parseInt(e.target.value))}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700/50 ${colors.slider}`}
                    style={{
                      background: `linear-gradient(to right, rgb(${
                        config.color === 'purple'
                          ? '168 85 247'
                          : config.color === 'blue'
                            ? '59 130 246'
                            : config.color === 'orange'
                              ? '249 115 22'
                              : config.color === 'green'
                                ? '34 197 94'
                                : '239 68 68'
                      }) ${value}%, rgb(51 65 85 / 0.5) ${value}%)`,
                    }}
                  />

                  {/* Value markers */}
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Bajo</span>
                    <span>Medio</span>
                    <span>Alto</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
