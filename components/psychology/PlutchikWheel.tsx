/**
 * Rueda de Plutchik - Visualización de Emociones
 *
 * Representa las 8 emociones básicas de Plutchik en una rueda circular:
 * - Joy (Alegría) - Amarillo
 * - Trust (Confianza) - Verde claro
 * - Fear (Miedo) - Verde oscuro
 * - Surprise (Sorpresa) - Azul claro
 * - Sadness (Tristeza) - Azul oscuro
 * - Disgust (Disgusto) - Morado
 * - Anger (Ira) - Rojo
 * - Anticipation (Anticipación) - Naranja
 */

"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface PlutchikWheelProps {
  emotions: Record<string, number>; // { joy: 0.75, trust: 0.6, ... }
  size?: number; // Tamaño del canvas (default: 400)
}

// Mapeo de emociones de Plutchik con colores
const PLUTCHIK_EMOTIONS = [
  { key: "joy", label: "Alegría", color: "#FFD700", angle: 0 },
  { key: "trust", label: "Confianza", color: "#90EE90", angle: 45 },
  { key: "fear", label: "Miedo", color: "#228B22", angle: 90 },
  { key: "surprise", label: "Sorpresa", color: "#87CEEB", angle: 135 },
  { key: "sadness", label: "Tristeza", color: "#4169E1", angle: 180 },
  { key: "disgust", label: "Disgusto", color: "#9370DB", angle: 225 },
  { key: "anger", label: "Ira", color: "#DC143C", angle: 270 },
  { key: "anticipation", label: "Anticipación", color: "#FF8C00", angle: 315 },
] as const;

export function PlutchikWheel({ emotions, size = 400 }: PlutchikWheelProps) {
  // Calcular el centro y radio
  const center = size / 2;
  const maxRadius = (size / 2) * 0.85;
  const minRadius = (size / 2) * 0.2;

  // Normalizar emociones a valores 0-1
  const normalizedEmotions = useMemo(() => {
    const result: Record<string, number> = {};
    PLUTCHIK_EMOTIONS.forEach(({ key }) => {
      result[key] = Math.max(0, Math.min(1, emotions[key] || 0));
    });
    return result;
  }, [emotions]);

  // Generar paths SVG para cada pétalo
  const petalPaths = useMemo(() => {
    return PLUTCHIK_EMOTIONS.map(({ key, label, color, angle }) => {
      const intensity = normalizedEmotions[key];
      const radius = minRadius + (maxRadius - minRadius) * intensity;

      // Calcular puntos del pétalo (sector circular)
      const angleRad = (angle * Math.PI) / 180;
      const angleSpan = (40 * Math.PI) / 180; // 40 grados de ancho
      const startAngle = angleRad - angleSpan / 2;
      const endAngle = angleRad + angleSpan / 2;

      // Puntos del arco exterior
      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      // Puntos del arco interior (círculo central)
      const x3 = center + minRadius * Math.cos(endAngle);
      const y3 = center + minRadius * Math.sin(endAngle);
      const x4 = center + minRadius * Math.cos(startAngle);
      const y4 = center + minRadius * Math.sin(startAngle);

      // Path SVG: mover al punto inicial, arco exterior, línea, arco interior, cerrar
      const path = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 0 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${minRadius} ${minRadius} 0 0 0 ${x4} ${y4}
        Z
      `;

      // Posición del texto (en el medio del pétalo)
      const textRadius = minRadius + ((radius - minRadius) / 2);
      const textX = center + textRadius * Math.cos(angleRad);
      const textY = center + textRadius * Math.sin(angleRad);

      return {
        key,
        label,
        color,
        path,
        textX,
        textY,
        intensity,
        angle,
      };
    });
  }, [normalizedEmotions, center, maxRadius, minRadius]);

  // Encontrar emoción dominante
  const dominantEmotion = useMemo(() => {
    let max = 0;
    let dominant = petalPaths[0];
    petalPaths.forEach((petal) => {
      if (petal.intensity > max) {
        max = petal.intensity;
        dominant = petal;
      }
    });
    return dominant;
  }, [petalPaths]);

  return (
    <Card className="md-card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🌸 Rueda de Plutchik
        </CardTitle>
        <CardDescription>
          Visualización de las 8 emociones básicas
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {/* SVG Canvas */}
        <div className="relative">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="drop-shadow-2xl"
          >
            {/* Gradiente de fondo radial - Dark mode */}
            <defs>
              <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(48,48,48,0.6)" className="dark:stop-color-[rgba(48,48,48,0.6)] stop-color-[rgba(245,245,245,0.9)]" />
                <stop offset="100%" stopColor="rgba(32,32,32,0.3)" className="dark:stop-color-[rgba(32,32,32,0.3)] stop-color-[rgba(230,230,230,0.5)]" />
              </radialGradient>
              {/* Filtro de sombra suave */}
              <filter id="softShadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                <feOffset dx="0" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.4"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Círculo de fondo con gradiente */}
            <circle
              cx={center}
              cy={center}
              r={maxRadius + 5}
              fill="url(#bgGradient)"
              stroke="rgba(70,70,70,0.5)"
              strokeWidth="2"
              className="dark:stroke-[rgba(70,70,70,0.5)] stroke-[rgba(210,210,210,0.8)]"
            />

            {/* Líneas radiales decorativas */}
            {PLUTCHIK_EMOTIONS.map(({ angle }, idx) => {
              const angleRad = (angle * Math.PI) / 180;
              const x1 = center + minRadius * Math.cos(angleRad);
              const y1 = center + minRadius * Math.sin(angleRad);
              const x2 = center + maxRadius * Math.cos(angleRad);
              const y2 = center + maxRadius * Math.sin(angleRad);
              return (
                <line
                  key={`divider-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(70,70,70,0.3)"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                  className="dark:stroke-[rgba(70,70,70,0.3)] stroke-[rgba(210,210,210,0.5)]"
                />
              );
            })}

            {/* Pétalos de emociones con sombra */}
            {petalPaths.map((petal) => (
              <g key={petal.key} className="group cursor-pointer" filter="url(#softShadow)">
                {/* Pétalo con gradiente */}
                <path
                  d={petal.path}
                  fill={petal.color}
                  opacity={petal.intensity > 0.1 ? 0.75 : 0.25}
                  stroke="rgba(40,40,40,0.8)"
                  strokeWidth="2"
                  className="transition-all duration-300 hover:opacity-90 dark:stroke-[rgba(40,40,40,0.8)] stroke-white"
                  style={{
                    filter: `brightness(${petal.intensity > 0.1 ? 1 : 0.7})`,
                  }}
                />

                {/* Etiqueta con mejor contraste en dark mode */}
                <text
                  x={petal.textX}
                  y={petal.textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm font-bold pointer-events-none select-none fill-foreground"
                  style={{
                    textShadow: "0 0 8px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,1)",
                  }}
                >
                  {petal.label}
                </text>

                {/* Tooltip con porcentaje (aparece en hover) */}
                <text
                  x={petal.textX}
                  y={petal.textY + 18}
                  textAnchor="middle"
                  className="text-sm font-extrabold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none fill-foreground"
                  style={{
                    textShadow: "0 0 10px rgba(0,0,0,1), 0 0 6px rgba(0,0,0,1)",
                  }}
                >
                  {(petal.intensity * 100).toFixed(0)}%
                </text>
              </g>
            ))}

            {/* Círculo central con emoción dominante - diseño mejorado para dark mode */}
            <circle
              cx={center}
              cy={center}
              r={minRadius + 5}
              fill="rgba(32,32,32,0.95)"
              stroke={dominantEmotion.color}
              strokeWidth="4"
              className="drop-shadow-xl dark:fill-[rgba(32,32,32,0.95)] fill-white"
            />
            <circle
              cx={center}
              cy={center}
              r={minRadius}
              fill={dominantEmotion.color}
              opacity="0.2"
            />
            <text
              x={center}
              y={center - 12}
              textAnchor="middle"
              className="text-xs font-semibold fill-muted-foreground"
            >
              Dominante
            </text>
            <text
              x={center}
              y={center + 5}
              textAnchor="middle"
              className="text-base font-bold"
              fill={dominantEmotion.color}
              style={{
                filter: "brightness(1.2)",
              }}
            >
              {dominantEmotion.label}
            </text>
            <text
              x={center}
              y={center + 22}
              textAnchor="middle"
              className="text-lg font-extrabold fill-foreground"
            >
              {(dominantEmotion.intensity * 100).toFixed(0)}%
            </text>
          </svg>
        </div>

        {/* Leyenda mejorada con mejor visualización */}
        <div className="mt-8 grid grid-cols-2 gap-3 w-full">
          {petalPaths.map((petal) => (
            <div
              key={petal.key}
              className="flex items-center gap-3 bg-muted/30 rounded-2xl p-2.5 border border-border hover:border-border/60 hover:bg-muted/50 transition-all"
            >
              <div
                className="w-5 h-5 rounded-full border-2 border-background shadow-md flex-shrink-0"
                style={{
                  backgroundColor: petal.color,
                  boxShadow: `0 0 0 1px ${petal.color}60`,
                }}
              />
              <span className="font-semibold text-foreground text-sm">{petal.label}</span>
              <span className="ml-auto font-bold text-foreground tabular-nums">
                {(petal.intensity * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
