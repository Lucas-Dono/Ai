'use client';

import { AlertTriangle, Flame, Skull, HelpCircle } from 'lucide-react';
import type { DarkTriad } from '@/lib/psychological-analysis';
import { getDarkTriadWarningLevel, DEFAULT_DARK_TRIAD } from '@/lib/psychological-analysis';

interface DarkTriadTabProps {
  darkTriad: DarkTriad | undefined;
  onChange: (darkTriad: DarkTriad) => void;
}

// Presets
const PRESETS = [
  { name: 'Benevolente', values: { machiavellianism: 10, narcissism: 10, psychopathy: 5 } },
  { name: 'Maquiavélico', values: { machiavellianism: 75, narcissism: 40, psychopathy: 30 } },
  { name: 'Narcisista', values: { machiavellianism: 30, narcissism: 85, psychopathy: 20 } },
  { name: 'Psicópata', values: { machiavellianism: 40, narcissism: 30, psychopathy: 80 } },
];

/**
 * Tab de Dark Triad con 3 sliders y warnings dinámicos.
 */
export function DarkTriadTab({ darkTriad, onChange }: DarkTriadTabProps) {
  const current = darkTriad || DEFAULT_DARK_TRIAD;

  const handleChange = (dimension: keyof DarkTriad, value: number) => {
    onChange({
      ...current,
      [dimension]: value,
    });
  };

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    onChange(preset.values);
  };

  // Calcular warning general
  const avgDarkTriad = (current.machiavellianism + current.narcissism + current.psychopathy) / 3;
  const globalWarning = getDarkTriadWarningLevel(avgDarkTriad);

  // Warning config
  const warningConfig = {
    none: null,
    moderate: {
      icon: AlertTriangle,
      color: 'yellow',
      bg: 'from-yellow-500/10 to-yellow-600/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-300',
      title: 'Rasgos Moderados',
      message: 'Algunos rasgos oscuros presentes. Estos pueden influir en las relaciones interpersonales.',
      pulse: false,
    },
    high: {
      icon: Flame,
      color: 'orange',
      bg: 'from-orange-500/10 to-orange-600/10',
      border: 'border-orange-500/30',
      text: 'text-orange-300',
      title: 'Rasgos Altos',
      message:
        'Rasgos oscuros marcados que probablemente afecten las relaciones. Pueden generar conflictos interpersonales significativos.',
      pulse: false,
    },
    extreme: {
      icon: Skull,
      color: 'red',
      bg: 'from-red-500/10 to-red-600/10',
      border: 'border-red-500/30',
      text: 'text-red-300',
      title: 'Rasgos Extremos',
      message:
        'Rasgos oscuros extremos. Este perfil puede resultar en dinámicas relacionales muy problemáticas. Revisar análisis psicológico completo.',
      pulse: true,
    },
  };

  const currentWarning = globalWarning !== 'none' ? warningConfig[globalWarning] : null;

  return (
    <div className="space-y-6">
      {/* Warning banner */}
      {currentWarning && (
        <div
          className={`rounded-lg bg-gradient-to-br ${currentWarning.bg} border ${currentWarning.border} backdrop-blur-sm p-4 ${
            currentWarning.pulse ? 'animate-pulse' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <currentWarning.icon className={`w-5 h-5 ${currentWarning.text} flex-shrink-0 mt-0.5`} />
            <div>
              <h3 className={`text-sm font-semibold ${currentWarning.text} mb-1`}>{currentWarning.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{currentWarning.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info banner */}
      <div className="rounded-lg bg-gradient-to-r from-slate-700/30 to-slate-800/30 border border-slate-600/50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-300 mb-1">Dark Triad - Rasgos de Personalidad Oscuros</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              El Dark Triad comprende tres rasgos de personalidad: Maquiavelismo (manipulación estratégica), Narcisismo (grandiosidad y
              necesidad de admiración), y Psicopatía (impulsividad y falta de empatía). Valores altos pueden generar conflictos
              interpersonales. Usa con precaución.
            </p>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div>
        <label className="text-xs font-medium text-slate-300 mb-2 block">Presets Rápidos:</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-6">
        {/* Machiavellianism */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-slate-200">Maquiavelismo</label>
              <TooltipButton text="Manipulación estratégica y pragmática. Disposición a usar a otros para objetivos propios sin consideración moral." />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {current.machiavellianism <= 40
                  ? 'Bajo'
                  : current.machiavellianism <= 60
                    ? 'Moderado'
                    : current.machiavellianism <= 80
                      ? 'Alto'
                      : 'Extremo'}
              </span>
              <span className="text-sm font-bold text-slate-200 w-8 text-right">{current.machiavellianism}</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={current.machiavellianism}
            onChange={(e) => handleChange('machiavellianism', parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-500"
            style={{
              background: `linear-gradient(to right, rgb(168 85 247) ${current.machiavellianism}%, rgb(51 65 85 / 0.5) ${current.machiavellianism}%)`,
            }}
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Directo y honesto</span>
            <span>Manipulador estratégico</span>
          </div>
        </div>

        {/* Narcissism */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-slate-200">Narcisismo</label>
              <TooltipButton text="Grandiosidad, necesidad de admiración constante y falta de empatía. Sentido exagerado de importancia personal." />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {current.narcissism <= 40 ? 'Bajo' : current.narcissism <= 60 ? 'Moderado' : current.narcissism <= 80 ? 'Alto' : 'Extremo'}
              </span>
              <span className="text-sm font-bold text-slate-200 w-8 text-right">{current.narcissism}</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={current.narcissism}
            onChange={(e) => handleChange('narcissism', parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-pink-500"
            style={{
              background: `linear-gradient(to right, rgb(236 72 153) ${current.narcissism}%, rgb(51 65 85 / 0.5) ${current.narcissism}%)`,
            }}
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Humilde y empático</span>
            <span>Grandioso y egocéntrico</span>
          </div>
        </div>

        {/* Psychopathy */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-slate-200">Psicopatía</label>
              <TooltipButton text="Impulsividad, búsqueda de sensaciones, falta de remordimiento y empatía reducida. Comportamiento antisocial." />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {current.psychopathy <= 40
                  ? 'Bajo'
                  : current.psychopathy <= 60
                    ? 'Moderado'
                    : current.psychopathy <= 80
                      ? 'Alto'
                      : 'Extremo'}
              </span>
              <span className="text-sm font-bold text-slate-200 w-8 text-right">{current.psychopathy}</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={current.psychopathy}
            onChange={(e) => handleChange('psychopathy', parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-red-500"
            style={{
              background: `linear-gradient(to right, rgb(239 68 68) ${current.psychopathy}%, rgb(51 65 85 / 0.5) ${current.psychopathy}%)`,
            }}
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Empático y controlado</span>
            <span>Impulsivo y desconectado</span>
          </div>
        </div>
      </div>

      {/* Average score */}
      <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Promedio Dark Triad:</span>
          <span className="text-sm font-bold text-slate-200">{Math.round(avgDarkTriad)}</span>
        </div>
        <div className="mt-2 h-2 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              avgDarkTriad <= 40
                ? 'bg-green-500'
                : avgDarkTriad <= 60
                  ? 'bg-yellow-500'
                  : avgDarkTriad <= 80
                    ? 'bg-orange-500'
                    : 'bg-red-500'
            }`}
            style={{ width: `${avgDarkTriad}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function TooltipButton({ text }: { text: string }) {
  const [show, setShow] = React.useState(false);

  return (
    <button
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      className="relative text-slate-400 hover:text-slate-200 transition-colors"
    >
      <HelpCircle className="w-3.5 h-3.5" />
      {show && (
        <div className="absolute left-0 top-full mt-1 z-10 w-64 p-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 shadow-lg">
          {text}
        </div>
      )}
    </button>
  );
}

// Import React para el useState en TooltipButton
import React from 'react';
