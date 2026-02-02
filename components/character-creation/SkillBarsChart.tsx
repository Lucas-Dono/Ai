'use client';

import { Skill } from './types';

interface SkillBarsChartProps {
  skills: Skill[];
}

export function SkillBarsChart({ skills }: SkillBarsChartProps) {
  // Helpers para niveles
  const getLevelLabel = (level: number): string => {
    if (level <= 20) return 'Novato';
    if (level <= 40) return 'Principiante';
    if (level <= 60) return 'Intermedio';
    if (level <= 80) return 'Avanzado';
    return 'Experto';
  };

  const getLevelColor = (level: number): string => {
    if (level <= 20) return 'from-slate-500 to-slate-600';
    if (level <= 40) return 'from-blue-500 to-blue-600';
    if (level <= 60) return 'from-indigo-500 to-indigo-600';
    if (level <= 80) return 'from-purple-500 to-purple-600';
    return 'from-pink-500 to-rose-500';
  };

  const getLevelIcon = (level: number): string => {
    if (level <= 20) return '🌱';
    if (level <= 40) return '📘';
    if (level <= 60) return '⚡';
    if (level <= 80) return '🔥';
    return '👑';
  };

  // Agrupar skills por nivel
  const skillsByLevel = {
    expert: skills.filter(s => s.level > 80),
    advanced: skills.filter(s => s.level > 60 && s.level <= 80),
    intermediate: skills.filter(s => s.level > 40 && s.level <= 60),
    beginner: skills.filter(s => s.level > 20 && s.level <= 40),
    novice: skills.filter(s => s.level <= 20),
  };

  // Calcular nivel promedio
  const averageLevel = skills.length > 0
    ? Math.round(skills.reduce((sum, s) => sum + s.level, 0) / skills.length)
    : 0;

  const averageLabel = getLevelLabel(averageLevel);

  if (skills.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl border border-slate-700/50 p-8 backdrop-blur-sm text-center">
        <div className="text-slate-400 text-sm">
          <div className="text-3xl mb-2">📚</div>
          No hay habilidades definidas aún
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full border border-indigo-500/30 backdrop-blur-sm">
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
            Habilidades Profesionales
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Nivel promedio: <span className={`font-semibold ${
            averageLevel <= 20 ? 'text-slate-400' :
            averageLevel <= 40 ? 'text-blue-400' :
            averageLevel <= 60 ? 'text-indigo-400' :
            averageLevel <= 80 ? 'text-purple-400' :
            'text-pink-400'
          }`}>{averageLabel} ({averageLevel})</span>
        </p>
      </div>

      {/* Main Chart */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
        <div className="space-y-4">
          {skills.map((skill, idx) => {
            const levelColor = getLevelColor(skill.level);
            const levelLabel = getLevelLabel(skill.level);
            const levelIcon = getLevelIcon(skill.level);

            return (
              <div key={idx} className="group">
                {/* Skill header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{levelIcon}</span>
                    <span className="text-sm font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
                      {skill.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{levelLabel}</span>
                    <span className="text-sm font-bold text-slate-300">{skill.level}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative h-3 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/30">
                  {/* Background grid pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="h-full grid grid-cols-10">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="border-r border-slate-600" />
                      ))}
                    </div>
                  </div>

                  {/* Progress fill */}
                  <div
                    className={`relative h-full bg-gradient-to-r ${levelColor} transition-all duration-700 ease-out`}
                    style={{ width: `${skill.level}%` }}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

                    {/* Level markers */}
                    <div className="absolute inset-0 flex items-center justify-end pr-2">
                      {skill.level >= 80 && (
                        <span className="text-[10px] font-bold text-white drop-shadow-lg">
                          EXPERTO
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${levelColor} opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300`} style={{ width: `${skill.level}%` }} />
                </div>

                {/* Milestones */}
                {skill.level >= 80 && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-pink-400">
                    <span>✨</span>
                    <span>Dominio excepcional</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-2">
        <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-lg p-3 border border-pink-500/20 text-center">
          <div className="text-xl font-bold text-pink-400">{skillsByLevel.expert.length}</div>
          <div className="text-[10px] text-pink-300/80 uppercase tracking-wide">Experto</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg p-3 border border-purple-500/20 text-center">
          <div className="text-xl font-bold text-purple-400">{skillsByLevel.advanced.length}</div>
          <div className="text-[10px] text-purple-300/80 uppercase tracking-wide">Avanzado</div>
        </div>
        <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 rounded-lg p-3 border border-indigo-500/20 text-center">
          <div className="text-xl font-bold text-indigo-400">{skillsByLevel.intermediate.length}</div>
          <div className="text-[10px] text-indigo-300/80 uppercase tracking-wide">Intermedio</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg p-3 border border-blue-500/20 text-center">
          <div className="text-xl font-bold text-blue-400">{skillsByLevel.beginner.length}</div>
          <div className="text-[10px] text-blue-300/80 uppercase tracking-wide">Principiante</div>
        </div>
        <div className="bg-gradient-to-br from-slate-500/10 to-slate-600/10 rounded-lg p-3 border border-slate-500/20 text-center">
          <div className="text-xl font-bold text-slate-400">{skillsByLevel.novice.length}</div>
          <div className="text-[10px] text-slate-300/80 uppercase tracking-wide">Novato</div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-4 bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
        <h4 className="text-xs font-semibold text-slate-300 mb-3">📊 Escala de Proficiencia</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-slate-500 to-slate-600" />
            <span className="text-slate-400">0-20: Novato</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-blue-600" />
            <span className="text-slate-400">21-40: Principiante</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-indigo-500 to-indigo-600" />
            <span className="text-slate-400">41-60: Intermedio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-purple-500 to-purple-600" />
            <span className="text-slate-400">61-80: Avanzado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-pink-500 to-rose-500" />
            <span className="text-slate-400">81-100: Experto</span>
          </div>
        </div>
      </div>
    </div>
  );
}
