'use client';

import { Heart, Lightbulb } from 'lucide-react';
import type { AttachmentProfile, AttachmentStyle } from '@/lib/psychological-analysis';
import { ATTACHMENT_DESCRIPTIONS, DEFAULT_ATTACHMENT_PROFILE } from '@/lib/psychological-analysis';

interface AttachmentTabProps {
  attachment: AttachmentProfile | undefined;
  onChange: (attachment: AttachmentProfile) => void;
}

// Configuración de estilos de apego
const ATTACHMENT_STYLES: Array<{
  style: AttachmentStyle;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  examples: string[];
}> = [
  {
    style: 'secure',
    emoji: '💚',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    examples: [
      'Se siente cómodo con intimidad y autonomía',
      'Confía en las relaciones',
      'Expresa necesidades claramente',
      'Maneja conflictos de forma constructiva',
    ],
  },
  {
    style: 'anxious',
    emoji: '💛',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    examples: [
      'Necesita reassurance constante',
      'Miedo al abandono',
      'Busca validación externa',
      'Hipervigilante a señales de rechazo',
    ],
  },
  {
    style: 'avoidant',
    emoji: '💙',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    examples: [
      'Valora independencia extrema',
      'Incómodo con cercanía emocional',
      'Minimiza necesidades emocionales',
      'Dificultad para expresar vulnerabilidad',
    ],
  },
  {
    style: 'fearful-avoidant',
    emoji: '🧡',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    examples: [
      'Desea intimidad pero la teme',
      'Patrones push-pull en relaciones',
      'Ambivalente sobre cercanía',
      'Conflicto interno entre necesidad y miedo',
    ],
  },
];

export function AttachmentTab({ attachment, onChange }: AttachmentTabProps) {
  const current = attachment || DEFAULT_ATTACHMENT_PROFILE;

  const handleStyleChange = (style: AttachmentStyle) => {
    onChange({
      ...current,
      primaryStyle: style,
    });
  };

  const handleIntensityChange = (intensity: number) => {
    onChange({
      ...current,
      intensity,
    });
  };

  const selectedConfig = ATTACHMENT_STYLES.find((s) => s.style === current.primaryStyle);

  // Determinar label de intensidad
  const getIntensityLabel = (intensity: number) => {
    if (intensity < 30) return 'Leve';
    if (intensity < 50) return 'Moderado';
    if (intensity < 70) return 'Marcado';
    return 'Muy Marcado';
  };

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-indigo-300 mb-1">Estilo de Apego</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Los estilos de apego, basados en la teoría de Bowlby y Ainsworth, describen cómo las personas se relacionan emocionalmente con
              otros. Se desarrollan en la infancia y tienden a persistir en la adultez, influyendo en las relaciones románticas y amistades
              cercanas.
            </p>
          </div>
        </div>
      </div>

      {/* Attachment style selector */}
      <div>
        <label className="text-sm font-semibold text-slate-200 mb-3 block">Estilo de Apego Primario:</label>
        <div className="space-y-2">
          {ATTACHMENT_STYLES.map((config) => {
            const isSelected = current.primaryStyle === config.style;
            const description = ATTACHMENT_DESCRIPTIONS[config.style];

            return (
              <button
                key={config.style}
                onClick={() => handleStyleChange(config.style)}
                className={`w-full rounded-lg border-2 transition-all p-4 text-left ${
                  isSelected
                    ? `${config.borderColor} ${config.bgColor} shadow-lg`
                    : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Radio indicator */}
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? config.borderColor : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <div className={`w-2.5 h-2.5 rounded-full ${config.bgColor.replace('/10', '')}`} />}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{config.emoji}</span>
                      <span className={`text-sm font-semibold capitalize ${isSelected ? config.color : 'text-slate-300'}`}>
                        {config.style === 'fearful-avoidant'
                          ? 'Temeroso-Evitativo'
                          : config.style === 'secure'
                            ? 'Seguro'
                            : config.style === 'anxious'
                              ? 'Ansioso'
                              : 'Evitativo'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{description}</p>

                    {/* Examples (only when selected) */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-xs font-medium text-slate-300 mb-1.5">Manifestaciones típicas:</p>
                        <ul className="space-y-1">
                          {config.examples.map((example, idx) => (
                            <li key={idx} className="text-xs text-slate-400 flex items-start gap-1.5">
                              <span className={`${config.color} mt-0.5`}>•</span>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Intensity slider */}
      <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-slate-200">Intensidad del Estilo:</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{getIntensityLabel(current.intensity)}</span>
            <span className="text-sm font-bold text-slate-200">{current.intensity}</span>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={current.intensity}
          onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          style={{
            background: `linear-gradient(to right, rgb(99 102 241) ${current.intensity}%, rgb(51 65 85 / 0.5) ${current.intensity}%)`,
          }}
        />

        <div className="flex justify-between text-[10px] text-slate-500 mt-2">
          <span>Leve</span>
          <span>Moderado</span>
          <span>Marcado</span>
          <span>Muy Marcado</span>
        </div>

        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
          La intensidad determina qué tan marcado es el estilo de apego. Una intensidad alta significa que las características del estilo se
          manifiestan de forma más pronunciada en las relaciones.
        </p>
      </div>

      {/* Impact note */}
      {selectedConfig && (
        <div className={`rounded-lg ${selectedConfig.bgColor} border ${selectedConfig.borderColor} p-4`}>
          <div className="flex items-start gap-3">
            <Heart className={`w-5 h-5 ${selectedConfig.color} flex-shrink-0 mt-0.5`} />
            <div>
              <h4 className={`text-xs font-semibold ${selectedConfig.color} mb-1`}>Impacto en Relaciones</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                El estilo de apego{' '}
                <span className="font-medium text-slate-300">
                  {current.primaryStyle === 'fearful-avoidant'
                    ? 'temeroso-evitativo'
                    : current.primaryStyle === 'secure'
                      ? 'seguro'
                      : current.primaryStyle === 'anxious'
                        ? 'ansioso'
                        : 'evitativo'}
                </span>{' '}
                con intensidad <span className="font-medium text-slate-300">{getIntensityLabel(current.intensity).toLowerCase()}</span>{' '}
                influirá significativamente en cómo el personaje establece vínculos emocionales, maneja la intimidad y responde a situaciones
                de separación o conflicto en las relaciones.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
