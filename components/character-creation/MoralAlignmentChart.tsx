'use client';

interface MoralAlignmentChartProps {
  moralAlignment: {
    lawfulness: number; // 0-100: 0=Chaotic, 50=Neutral, 100=Lawful
    morality: number;   // 0-100: 0=Evil, 50=Neutral, 100=Good
  };
}

export function MoralAlignmentChart({ moralAlignment }: MoralAlignmentChartProps) {
  // Calcular posición en el grid (0-100 → 0-200px)
  const x = (moralAlignment.lawfulness / 100) * 200;
  const y = ((100 - moralAlignment.morality) / 100) * 200; // Invertir Y para que Good esté arriba

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
          <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
            Alineamiento Moral: {alignmentName}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {getAlignmentDescription()}
        </p>
      </div>

      {/* Grid Container */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm">
        <div className="relative w-full" style={{ paddingBottom: '100%' }}>
          {/* SVG Grid */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 220 220"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Grid pattern */}
              <pattern id="grid" width="66.66" height="66.66" patternUnits="userSpaceOnUse">
                <path
                  d="M 66.66 0 L 0 0 0 66.66"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="1"
                  opacity="0.3"
                />
              </pattern>

              {/* Gradient para el marcador */}
              <linearGradient id="markerGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" className={`${alignmentColor.split(' ')[0].replace('from-', '')}`} stopOpacity={0.9} />
                <stop offset="100%" className={`${alignmentColor.split(' ')[1].replace('to-', '')}`} stopOpacity={0.9} />
              </linearGradient>

              {/* Sombra del marcador */}
              <filter id="markerShadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                <feOffset dx="0" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.5"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Background grid */}
            <rect x="10" y="10" width="200" height="200" fill="url(#grid)" />

            {/* Border */}
            <rect
              x="10"
              y="10"
              width="200"
              height="200"
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              opacity="0.5"
            />

            {/* Divisiones principales (3x3) */}
            <line x1="76.66" y1="10" x2="76.66" y2="210" stroke="#64748b" strokeWidth="1.5" opacity="0.6" />
            <line x1="143.33" y1="10" x2="143.33" y2="210" stroke="#64748b" strokeWidth="1.5" opacity="0.6" />
            <line x1="10" y1="76.66" x2="210" y2="76.66" stroke="#64748b" strokeWidth="1.5" opacity="0.6" />
            <line x1="10" y1="143.33" x2="210" y2="143.33" stroke="#64748b" strokeWidth="1.5" opacity="0.6" />

            {/* Labels de los ejes */}
            <text x="110" y="230" fontSize="11" fill="#cbd5e1" textAnchor="middle" fontWeight="600">
              Lawfulness →
            </text>
            <text x="0" y="110" fontSize="11" fill="#cbd5e1" textAnchor="middle" fontWeight="600" transform="rotate(-90, 0, 110)">
              Morality →
            </text>

            {/* Marcador de posición */}
            <g filter="url(#markerShadow)">
              {/* Círculo exterior pulsante */}
              <circle
                cx={x + 10}
                cy={y + 10}
                r="16"
                fill="none"
                stroke={`url(#markerGradient)`}
                strokeWidth="2"
                opacity="0.4"
              >
                <animate
                  attributeName="r"
                  values="16;20;16"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.4;0.1;0.4"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Círculo principal */}
              <circle
                cx={x + 10}
                cy={y + 10}
                r="12"
                fill={`url(#markerGradient)`}
                stroke="#1e293b"
                strokeWidth="3"
              />

              {/* Punto central */}
              <circle
                cx={x + 10}
                cy={y + 10}
                r="4"
                fill="#1e293b"
                opacity="0.6"
              />
            </g>

            {/* Líneas de crosshair */}
            <line
              x1={x + 10}
              y1="10"
              x2={x + 10}
              y2="210"
              stroke={`url(#markerGradient)`}
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.3"
            />
            <line
              x1="10"
              y1={y + 10}
              x2="210"
              y2={y + 10}
              stroke={`url(#markerGradient)`}
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.3"
            />
          </svg>
        </div>

        {/* Leyenda de regiones */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-[10px]">
          {/* Row 1: Good */}
          <div className="text-center p-2 bg-blue-500/10 rounded border border-blue-500/20">
            <span className="text-blue-300 font-semibold">Legal Bueno</span>
          </div>
          <div className="text-center p-2 bg-sky-500/10 rounded border border-sky-500/20">
            <span className="text-sky-300 font-semibold">Neutral Bueno</span>
          </div>
          <div className="text-center p-2 bg-green-500/10 rounded border border-green-500/20">
            <span className="text-green-300 font-semibold">Caótico Bueno</span>
          </div>

          {/* Row 2: Neutral */}
          <div className="text-center p-2 bg-indigo-500/10 rounded border border-indigo-500/20">
            <span className="text-indigo-300 font-semibold">Legal Neutral</span>
          </div>
          <div className="text-center p-2 bg-slate-500/10 rounded border border-slate-500/20">
            <span className="text-slate-300 font-semibold">Neutral</span>
          </div>
          <div className="text-center p-2 bg-purple-500/10 rounded border border-purple-500/20">
            <span className="text-purple-300 font-semibold">Caótico Neutral</span>
          </div>

          {/* Row 3: Evil */}
          <div className="text-center p-2 bg-red-600/10 rounded border border-red-600/20">
            <span className="text-red-300 font-semibold">Legal Malvado</span>
          </div>
          <div className="text-center p-2 bg-orange-500/10 rounded border border-orange-500/20">
            <span className="text-orange-300 font-semibold">Neutral Malvado</span>
          </div>
          <div className="text-center p-2 bg-red-500/10 rounded border border-red-500/20">
            <span className="text-red-300 font-semibold">Caótico Malvado</span>
          </div>
        </div>
      </div>

      {/* Stats numéricos */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Lawfulness</span>
            <span className="text-sm font-semibold text-slate-200">{moralAlignment.lawfulness}</span>
          </div>
          <div className="mt-2 h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${alignmentColor} transition-all duration-500`}
              style={{ width: `${moralAlignment.lawfulness}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Morality</span>
            <span className="text-sm font-semibold text-slate-200">{moralAlignment.morality}</span>
          </div>
          <div className="mt-2 h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${alignmentColor} transition-all duration-500`}
              style={{ width: `${moralAlignment.morality}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
