'use client';

interface MoralAlignmentChartProps {
  moralAlignment: {
    lawfulness: number; // 0-100: 0=Chaotic, 50=Neutral, 100=Lawful
    morality: number;   // 0-100: 0=Evil, 50=Neutral, 100=Good
  };
}

export function MoralAlignmentChart({ moralAlignment }: MoralAlignmentChartProps) {
  // Determinar alineamiento categórico
  const getLawfulnessCategory = (value: number) => {
    if (value < 33) return 'Caótico';
    if (value > 66) return 'Legal';
    return 'Neutral';
  };

  const getMoralityCategory = (value: number) => {
    if (value < 33) return 'Malvado';
    if (value > 66) return 'Bueno';
    return 'Neutral';
  };

  const lawfulnessLabel = getLawfulnessCategory(moralAlignment.lawfulness);
  const moralityLabel = getMoralityCategory(moralAlignment.morality);

  // Combinación de alineamiento
  const alignmentName = lawfulnessLabel === 'Neutral' && moralityLabel === 'Neutral'
    ? 'Neutral Verdadero'
    : `${lawfulnessLabel} ${moralityLabel}`;

  // Color del marcador según alineamiento
  const getAlignmentColor = () => {
    if (moralAlignment.morality > 66) {
      if (moralAlignment.lawfulness > 66) return 'from-blue-400 to-cyan-400'; // Lawful Good
      if (moralAlignment.lawfulness < 33) return 'from-green-400 to-emerald-400'; // Chaotic Good
      return 'from-sky-400 to-blue-400'; // Neutral Good
    }
    if (moralAlignment.morality < 33) {
      if (moralAlignment.lawfulness > 66) return 'from-red-600 to-rose-600'; // Lawful Evil
      if (moralAlignment.lawfulness < 33) return 'from-orange-600 to-red-600'; // Chaotic Evil
      return 'from-red-500 to-orange-500'; // Neutral Evil
    }
    // Neutral
    if (moralAlignment.lawfulness > 66) return 'from-indigo-400 to-purple-400'; // Lawful Neutral
    if (moralAlignment.lawfulness < 33) return 'from-purple-400 to-pink-400'; // Chaotic Neutral
    return 'from-slate-400 to-gray-400'; // True Neutral
  };

  const alignmentColor = getAlignmentColor();

  // Descripción del alineamiento
  const getAlignmentDescription = () => {
    if (moralAlignment.morality > 66) {
      if (moralAlignment.lawfulness > 66) return 'Respeta reglas y ayuda a los demás';
      if (moralAlignment.lawfulness < 33) return 'Hace el bien sin restricciones';
      return 'Altruista pero flexible';
    }
    if (moralAlignment.morality < 33) {
      if (moralAlignment.lawfulness > 66) return 'Usa las reglas para beneficio propio';
      if (moralAlignment.lawfulness < 33) return 'Sin moral ni límites';
      return 'Egoísta y pragmático';
    }
    if (moralAlignment.lawfulness > 66) return 'Valora el orden sobre todo';
    if (moralAlignment.lawfulness < 33) return 'Valora la libertad sobre todo';
    return 'Equilibrado y pragmático';
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm">
          <span className="text-sm font-semibold text-purple-300 uppercase tracking-wider">
            {alignmentName}
          </span>
        </div>
        <p className="text-sm text-slate-300 mt-3 font-medium">
          {getAlignmentDescription()}
        </p>
      </div>

      {/* Descripción visual simple */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
        {/* Explicación de los ejes */}
        <div className="mb-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <div className="text-xs text-slate-300 space-y-2">
            <div>
              <span className="font-semibold text-slate-200">Lawfulness (Legal):</span> Valora el orden, las reglas, los códigos de honor y la estructura. Legal no significa necesariamente "bueno" - un tirano puede ser Legal Malvado.
            </div>
            <div>
              <span className="font-semibold text-slate-200">Morality (Moralidad):</span> Qué tan altruista o egoísta es el personaje. Bueno = ayuda a otros, Malvado = daña a otros para beneficio propio.
            </div>
          </div>
        </div>

        {/* Valores numéricos destacados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-xs text-slate-400 mb-2">
              Lawfulness
              <span className="text-slate-500 ml-1">(Orden vs Libertad)</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-200">{moralAlignment.lawfulness}</span>
              <span className="text-sm text-slate-500">/100</span>
            </div>
            <div className="mt-3 h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${alignmentColor} transition-all duration-500`}
                style={{ width: `${moralAlignment.lawfulness}%` }}
              />
            </div>
            <div className="mt-2 text-xs">
              {moralAlignment.lawfulness < 33 ? (
                <span className="text-purple-400">← Caótico: Valora la libertad y espontaneidad</span>
              ) : moralAlignment.lawfulness > 66 ? (
                <span className="text-indigo-400">Legal →: Valora el orden y las reglas</span>
              ) : (
                <span className="text-slate-400">Neutral: Equilibrio entre orden y libertad</span>
              )}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-xs text-slate-400 mb-2">
              Morality
              <span className="text-slate-500 ml-1">(Altruismo vs Egoísmo)</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-200">{moralAlignment.morality}</span>
              <span className="text-sm text-slate-500">/100</span>
            </div>
            <div className="mt-3 h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${alignmentColor} transition-all duration-500`}
                style={{ width: `${moralAlignment.morality}%` }}
              />
            </div>
            <div className="mt-2 text-xs">
              {moralAlignment.morality < 33 ? (
                <span className="text-red-400">Malvado: Egoísta, daña a otros sin remordimiento</span>
              ) : moralAlignment.morality > 66 ? (
                <span className="text-blue-400">Bueno: Altruista, ayuda a los demás</span>
              ) : (
                <span className="text-slate-400">Neutral: Ni especialmente bueno ni malvado</span>
              )}
            </div>
          </div>
        </div>

        {/* Leyenda de las 9 alineaciones */}
        <div>
          <div className="text-xs text-slate-400 mb-3 text-center">Referencia de alineamientos</div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            {/* Row 1: Good */}
            <div className={`text-center p-2 rounded transition-all ${
              alignmentName === 'Legal Bueno'
                ? 'bg-blue-500/30 border-2 border-blue-400 shadow-lg shadow-blue-500/20 scale-105'
                : 'bg-blue-500/10 border border-blue-500/20'
            }`}>
              <span className="text-blue-300 font-semibold">Legal Bueno</span>
              {alignmentName === 'Legal Bueno' && (
                <div className="text-[8px] text-blue-400 mt-1">✓ Tu personaje</div>
              )}
            </div>
            <div className={`text-center p-2 rounded transition-all ${
              alignmentName === 'Neutral Bueno'
                ? 'bg-sky-500/30 border-2 border-sky-400 shadow-lg shadow-sky-500/20 scale-105'
                : 'bg-sky-500/10 border border-sky-500/20'
            }`}>
              <span className="text-sky-300 font-semibold">Neutral Bueno</span>
              {alignmentName === 'Neutral Bueno' && (
                <div className="text-[8px] text-sky-400 mt-1">✓ Tu personaje</div>
              )}
            </div>
            <div className={`text-center p-2 rounded transition-all ${
              alignmentName === 'Caótico Bueno'
                ? 'bg-green-500/30 border-2 border-green-400 shadow-lg shadow-green-500/20 scale-105'
                : 'bg-green-500/10 border border-green-500/20'
            }`}>
              <span className="text-green-300 font-semibold">Caótico Bueno</span>
              {alignmentName === 'Caótico Bueno' && (
                <div className="text-[8px] text-green-400 mt-1">✓ Tu personaje</div>
              )}
            </div>

            {/* Row 2: Neutral */}
            <div className={`text-center p-2 rounded transition-all ${
              alignmentName === 'Legal Neutral'
                ? 'bg-indigo-500/30 border-2 border-indigo-400 shadow-lg shadow-indigo-500/20 scale-105'
                : 'bg-indigo-500/10 border border-indigo-500/20'
            }`}>
              <span className="text-indigo-300 font-semibold">Legal Neutral</span>
              {alignmentName === 'Legal Neutral' && (
                <div className="text-[8px] text-indigo-400 mt-1">✓ Tu personaje</div>
              )}
            </div>
            <div className={`text-center p-2 rounded transition-all ${
              alignmentName === 'Neutral Verdadero'
                ? 'bg-slate-500/30 border-2 border-slate-400 shadow-lg shadow-slate-500/20 scale-105'
                : 'bg-slate-500/10 border border-slate-500/20'
            }`}>
              <span className="text-slate-300 font-semibold">Neutral</span>
              {alignmentName === 'Neutral Verdadero' && (
                <div className="text-[8px] text-slate-400 mt-1">✓ Tu personaje</div>
              )}
            </div>
            <div className={`text-center p-2 rounded transition-all ${
              alignmentName === 'Caótico Neutral'
                ? 'bg-purple-500/30 border-2 border-purple-400 shadow-lg shadow-purple-500/20 scale-105'
                : 'bg-purple-500/10 border border-purple-500/20'
            }`}>
              <span className="text-purple-300 font-semibold">Caótico Neutral</span>
              {alignmentName === 'Caótico Neutral' && (
                <div className="text-[8px] text-purple-400 mt-1">✓ Tu personaje</div>
              )}
            </div>

            {/* Row 3: Evil */}
            <div className={`text-center p-2 rounded transition-all ${
              alignmentName === 'Legal Malvado'
                ? 'bg-red-600/30 border-2 border-red-400 shadow-lg shadow-red-600/20 scale-105'
                : 'bg-red-600/10 border border-red-600/20'
            }`}>
              <span className="text-red-300 font-semibold">Legal Malvado</span>
              {alignmentName === 'Legal Malvado' && (
                <div className="text-[8px] text-red-400 mt-1">✓ Tu personaje</div>
              )}
            </div>
            <div className={`text-center p-2 rounded transition-all ${
              alignmentName === 'Neutral Malvado'
                ? 'bg-orange-500/30 border-2 border-orange-400 shadow-lg shadow-orange-500/20 scale-105'
                : 'bg-orange-500/10 border border-orange-500/20'
            }`}>
              <span className="text-orange-300 font-semibold">Neutral Malvado</span>
              {alignmentName === 'Neutral Malvado' && (
                <div className="text-[8px] text-orange-400 mt-1">✓ Tu personaje</div>
              )}
            </div>
            <div className={`text-center p-2 rounded transition-all ${
              alignmentName === 'Caótico Malvado'
                ? 'bg-red-500/30 border-2 border-red-400 shadow-lg shadow-red-500/20 scale-105'
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <span className="text-red-300 font-semibold">Caótico Malvado</span>
              {alignmentName === 'Caótico Malvado' && (
                <div className="text-[8px] text-red-400 mt-1">✓ Tu personaje</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
