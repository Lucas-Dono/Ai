'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { BarChart3, Gem } from 'lucide-react';

interface PersonalityRadarChartProps {
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  values?: string[];
}

export function PersonalityRadarChart({ bigFive, values }: PersonalityRadarChartProps) {
  // Preparar datos para el radar chart
  const data = [
    {
      trait: 'Apertura',
      value: bigFive.openness,
      fullMark: 100,
    },
    {
      trait: 'Responsabilidad',
      value: bigFive.conscientiousness,
      fullMark: 100,
    },
    {
      trait: 'Extroversión',
      value: bigFive.extraversion,
      fullMark: 100,
    },
    {
      trait: 'Amabilidad',
      value: bigFive.agreeableness,
      fullMark: 100,
    },
    {
      trait: 'Neuroticismo',
      value: bigFive.neuroticism,
      fullMark: 100,
    },
  ];

  // Calcular perfil dominante
  const profiles = [
    { name: 'Explorador', score: bigFive.openness + bigFive.extraversion },
    { name: 'Guardián', score: bigFive.conscientiousness + (100 - bigFive.openness) },
    { name: 'Diplomático', score: bigFive.agreeableness + bigFive.conscientiousness },
    { name: 'Analista', score: bigFive.openness + (100 - bigFive.agreeableness) },
  ];
  const dominantProfile = profiles.reduce((prev, current) =>
    current.score > prev.score ? current : prev
  );

  // Determinar nivel de estabilidad emocional
  const emotionalStability = 100 - bigFive.neuroticism;
  const stabilityLevel =
    emotionalStability >= 70 ? 'Alta' :
    emotionalStability >= 40 ? 'Media' :
    'Baja';

  return (
    <div className="relative">
      {/* Header con perfil dominante */}
      <div className="mb-6 text-center">
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full border border-indigo-500/30 backdrop-blur-sm">
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
            Perfil Psicológico: {dominantProfile.name}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Estabilidad Emocional: <span className={`font-semibold ${
            stabilityLevel === 'Alta' ? 'text-green-400' :
            stabilityLevel === 'Media' ? 'text-yellow-400' :
            'text-red-400'
          }`}>{stabilityLevel}</span>
        </p>
      </div>

      {/* Radar Chart */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={data}>
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <PolarGrid
              stroke="#475569"
              strokeWidth={1}
              strokeOpacity={0.3}
            />

            <PolarAngleAxis
              dataKey="trait"
              tick={{
                fill: '#cbd5e1',
                fontSize: 13,
                fontWeight: 600
              }}
            />

            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{
                fill: '#64748b',
                fontSize: 11
              }}
            />

            <Radar
              name="Personalidad"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#radarGradient)"
              fillOpacity={0.6}
              animationDuration={1000}
              animationEasing="ease-out"
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{
                color: '#e2e8f0',
                fontWeight: 600,
                marginBottom: '4px'
              }}
              itemStyle={{
                color: '#cbd5e1',
                fontSize: '12px'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda de interpretación */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
          <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 inline-block" />
            Interpretación
          </h4>
          <ul className="space-y-1 text-xs text-slate-400">
            <li><span className="text-indigo-400">0-30:</span> Bajo</li>
            <li><span className="text-purple-400">30-70:</span> Moderado</li>
            <li><span className="text-pink-400">70-100:</span> Alto</li>
          </ul>
        </div>

        {values && values.length > 0 && (
          <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
            <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Gem className="w-3.5 h-3.5 inline-block" />
              Valores Centrales
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {values.slice(0, 5).map((value, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs font-medium border border-indigo-500/30"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Indicadores de rasgos extremos */}
      <div className="mt-4 space-y-2">
        {bigFive.openness >= 75 && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
            <span>✨</span>
            <span>Alta apertura a nuevas experiencias</span>
          </div>
        )}
        {bigFive.conscientiousness >= 75 && (
          <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20">
            <span>🎯</span>
            <span>Muy organizado y responsable</span>
          </div>
        )}
        {bigFive.extraversion >= 75 && (
          <div className="flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 px-3 py-2 rounded-lg border border-orange-500/20">
            <span>🌟</span>
            <span>Altamente sociable y energético</span>
          </div>
        )}
        {bigFive.agreeableness >= 75 && (
          <div className="flex items-center gap-2 text-xs text-pink-400 bg-pink-500/10 px-3 py-2 rounded-lg border border-pink-500/20">
            <span>💝</span>
            <span>Muy empático y cooperativo</span>
          </div>
        )}
        {bigFive.neuroticism <= 25 && (
          <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
            <span>🧘</span>
            <span>Emocionalmente muy estable</span>
          </div>
        )}
      </div>
    </div>
  );
}
