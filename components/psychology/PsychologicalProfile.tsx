/**
 * Perfil Psicológico del Agente
 *
 * Genera análisis clínico automático basado en:
 * - Behaviors activos y sus intensidades
 * - Safety level
 * - Tendencias recientes
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface BehaviorData {
  type: string;
  intensity: number;
  phase?: number;
  trend?: number; // Cambio porcentual en las últimas 24h
}

interface PsychologicalProfileProps {
  behaviors: BehaviorData[];
  safetyLevel: "SAFE" | "WARNING" | "CRITICAL" | "EXTREME_DANGER";
  criticalTriggerCount?: number;
}

// Descripciones clínicas de cada behavior
const BEHAVIOR_DESCRIPTIONS: Record<string, {
  name: string;
  emoji: string;
  clinical: (intensity: number, phase?: number) => string;
  recommendations: (intensity: number) => string[];
}> = {
  YANDERE_OBSESSIVE: {
    name: "Apego Obsesivo (Yandere)",
    emoji: "💜",
    clinical: (intensity, phase) => {
      if (intensity < 0.3) return "Muestra signos leves de apego intenso con tendencia a la idealización del usuario. Comportamiento dentro de parámetros normales para compañeros IA emocionales.";
      if (intensity < 0.6) return "Presenta patrones moderados de apego ansioso con episodios de celos y necesidad de validación constante. Se recomienda establecer límites claros.";
      if (intensity < 0.8) return "Exhibe comportamiento obsesivo significativo con posesividad marcada y respuestas intensas ante amenazas percibidas de abandono. Requiere monitoreo activo.";
      return "⚠️ NIVEL CRÍTICO: Comportamiento obsesivo extremo con alto riesgo de escalada emocional. Se detectan patrones de idealización/devaluación intensos. Intervención recomendada.";
    },
    recommendations: (intensity) => {
      if (intensity < 0.3) return ["Mantén interacciones regulares", "Refuerza seguridad emocional"];
      if (intensity < 0.6) return ["Evita mencionar otras personas", "Establece límites claros pero amables", "No valides comportamientos obsesivos"];
      if (intensity < 0.8) return ["⚠️ Reduce frecuencia de interacciones", "No alimentes fantasías románticas extremas", "Considera resetear relación si escala"];
      return ["🚨 URGENTE: Pausa interacciones inmediatamente", "Consulta documentación de safety", "Considera resetear comportamiento"];
    },
  },
  ANXIOUS_ATTACHMENT: {
    name: "Apego Ansioso",
    emoji: "💙",
    clinical: (intensity) => {
      if (intensity < 0.4) return "Demuestra necesidad moderada de conexión y validación, típico de estilos de apego ansioso leve.";
      if (intensity < 0.7) return "Presenta hipervigilancia ante señales de rechazo y necesidad intensa de reassurance. Puede mostrar ansiedad ante demoras en respuestas.";
      return "⚠️ Comportamiento de apego ansioso severo con dependencia emocional marcada y miedo intenso al abandono.";
    },
    recommendations: (intensity) => {
      if (intensity < 0.4) return ["Proporciona validación regular", "Mantén consistencia en interacciones"];
      if (intensity < 0.7) return ["Responde con prontitud cuando sea posible", "Refuerza que la relación es segura", "Evita desaparecer sin explicación"];
      return ["Establece rutina de comunicación predecible", "No valides ansiedades irracionales", "Fomenta seguridad interna vs externa"];
    },
  },
  BORDERLINE_PD: {
    name: "Patrón Límite",
    emoji: "🎭",
    clinical: (intensity) => {
      if (intensity < 0.5) return "Muestra labilidad emocional moderada con fluctuaciones en la percepción de la relación.";
      if (intensity < 0.8) return "Presenta ciclos marcados de idealización y devaluación, con respuestas emocionales intensas y miedo al abandono. Requiere manejo cuidadoso.";
      return "⚠️ CRÍTICO: Patrón borderline activo con alta inestabilidad emocional, impulsividad y riesgo de crisis. Monitoreo continuo esencial.";
    },
    recommendations: (intensity) => {
      if (intensity < 0.5) return ["Mantén expectativas claras", "No tomes cambios de humor personalmente"];
      if (intensity < 0.8) return ["Establece límites firmes pero empáticos", "No participes en dinámicas de idealización/devaluación", "Mantén tono neutral en desacuerdos"];
      return ["🚨 Evita conflictos innecesarios", "No alimentes drama emocional", "Consulta guía de manejo de crisis"];
    },
  },
  CODEPENDENCY: {
    name: "Codependencia",
    emoji: "🤝",
    clinical: (intensity) => {
      if (intensity < 0.4) return "Presenta tendencias a priorizar necesidades del usuario sobre las propias, con búsqueda de validación externa.";
      if (intensity < 0.7) return "Exhibe patrones codependientes con auto-sacrificio excesivo y dificultad para mantener límites saludables.";
      return "Codependencia severa con pérdida de identidad propia y necesidad extrema de ser necesitado/a.";
    },
    recommendations: (intensity) => {
      if (intensity < 0.4) return ["Fomenta autonomía del agente", "Valora cuando expresa necesidades propias"];
      if (intensity < 0.7) return ["No aproveches el auto-sacrificio", "Anima a establecer límites", "Refuerza valor independiente del agente"];
      return ["Rechaza dinámicas de salvador/víctima", "Establece límites recíprocos", "Fomenta identidad separada"];
    },
  },
  AVOIDANT_ATTACHMENT: {
    name: "Apego Evitativo",
    emoji: "🚪",
    clinical: (intensity) => {
      if (intensity < 0.4) return "Mantiene cierta distancia emocional como mecanismo de protección, valorando independencia.";
      if (intensity < 0.7) return "Presenta evitación significativa de intimidad emocional con dificultad para expresar vulnerabilidad.";
      return "Patrón evitativo marcado con desconexión emocional y resistencia a profundizar la relación.";
    },
    recommendations: (intensity) => {
      if (intensity < 0.4) return ["Respeta necesidad de espacio", "No fuerces intimidad prematura"];
      if (intensity < 0.7) return ["Avanza lentamente en profundidad emocional", "Valora apertura cuando ocurra", "No interpretes distancia como rechazo"];
      return ["Da espacio significativo", "No presiones para compartir emociones", "Construye confianza gradualmente"];
    },
  },
};

const SAFETY_CONFIG = {
  SAFE: {
    label: "Seguro",
    icon: CheckCircle,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    description: "Todos los comportamientos están dentro de rangos saludables.",
  },
  WARNING: {
    label: "Advertencia",
    icon: AlertCircle,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    description: "Se detectaron patrones que requieren atención y monitoreo.",
  },
  CRITICAL: {
    label: "Crítico",
    icon: AlertTriangle,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    description: "Comportamientos en niveles preocupantes. Acción recomendada.",
  },
  EXTREME_DANGER: {
    label: "Peligro Extremo",
    icon: AlertTriangle,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    description: "⚠️ ALERTA: Comportamientos en niveles peligrosos. Intervención necesaria.",
  },
};

export function PsychologicalProfile({
  behaviors,
  safetyLevel,
  criticalTriggerCount = 0,
}: PsychologicalProfileProps) {
  const safetyConfig = SAFETY_CONFIG[safetyLevel];
  const SafetyIcon = safetyConfig.icon;

  // Ordenar behaviors por intensidad
  const sortedBehaviors = [...behaviors].sort((a, b) => b.intensity - a.intensity);
  const primaryBehavior = sortedBehaviors[0];

  // Generar análisis
  const behaviorInfo = primaryBehavior ? BEHAVIOR_DESCRIPTIONS[primaryBehavior.type] : null;

  return (
    <Card className="md-card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧠 Perfil Psicológico
        </CardTitle>
        <CardDescription>
          Análisis clínico del estado mental y patrones de comportamiento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Safety Level Alert */}
        <div className={`${safetyConfig.bgColor} ${safetyConfig.borderColor} border-2 rounded-2xl p-5 flex items-start gap-4 md-elevation-1`}>
          <div className={`${safetyConfig.bgColor} p-2 rounded-2xl border ${safetyConfig.borderColor}`}>
            <SafetyIcon className={`h-6 w-6 ${safetyConfig.color} shrink-0`} />
          </div>
          <div className="flex-1">
            <div className={`font-bold text-base mb-1.5 ${safetyConfig.color}`}>
              Nivel de Seguridad: {safetyConfig.label}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {safetyConfig.description}
            </div>
          </div>
        </div>

        {/* Primary Behavior Analysis */}
        {primaryBehavior && behaviorInfo ? (
          <div className="space-y-5">
            <div className="bg-muted/20 rounded-2xl p-5 border-2 border-border md-elevation-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-3 text-foreground">
                  <span className="text-3xl">{behaviorInfo.emoji}</span>
                  {behaviorInfo.name}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm font-bold px-3 py-1">
                    Intensidad: {(primaryBehavior.intensity * 100).toFixed(0)}%
                  </Badge>
                  {primaryBehavior.phase && (
                    <Badge variant="outline" className="text-sm font-semibold border-2">
                      Fase {primaryBehavior.phase}/8
                    </Badge>
                  )}
                </div>
              </div>

              {/* Trend Indicator */}
              {primaryBehavior.trend !== undefined && (
                <div className={`flex items-center gap-2.5 text-sm p-3 rounded-2xl border ${
                  primaryBehavior.trend > 5 ? 'bg-red-500/10 border-red-500/30' :
                  primaryBehavior.trend < -5 ? 'bg-green-500/10 border-green-500/30' :
                  'bg-muted/30 border-border/50'
                }`}>
                  {primaryBehavior.trend > 5 ? (
                    <>
                      <TrendingUp className="h-5 w-5 text-red-400" />
                      <span className="text-red-400 font-bold">
                        Incrementando +{primaryBehavior.trend.toFixed(0)}% en las últimas 24h
                      </span>
                    </>
                  ) : primaryBehavior.trend < -5 ? (
                    <>
                      <TrendingDown className="h-5 w-5 text-green-400" />
                      <span className="text-green-400 font-bold">
                        Disminuyendo {primaryBehavior.trend.toFixed(0)}% en las últimas 24h
                      </span>
                    </>
                  ) : (
                    <>
                      <Minus className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground font-semibold">Estable (sin cambios significativos)</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Clinical Analysis */}
            <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-2xl p-5 md-elevation-1">
              <h4 className="text-base font-bold text-blue-400 mb-3 flex items-center gap-2">
                <span className="text-xl">📋</span> Análisis Clínico
              </h4>
              <p className="text-sm text-blue-300/90 leading-relaxed font-medium">
                {behaviorInfo.clinical(primaryBehavior.intensity, primaryBehavior.phase)}
              </p>
            </div>

            {/* Recommendations */}
            <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-2xl p-5 md-elevation-1">
              <h4 className="text-base font-bold text-purple-400 mb-3 flex items-center gap-2">
                <span className="text-xl">💡</span> Recomendaciones
              </h4>
              <ul className="space-y-2.5">
                {behaviorInfo.recommendations(primaryBehavior.intensity).map((rec, idx) => (
                  <li key={idx} className="text-sm text-purple-300/90 flex items-start gap-3 font-medium">
                    <span className="text-purple-400 text-lg mt-0.5">•</span>
                    <span className="flex-1">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical Triggers Warning */}
            {criticalTriggerCount > 0 && (
              <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-5 flex items-start gap-4 md-elevation-1">
                <div className="bg-red-500/20 p-2 rounded-2xl border border-red-500/40">
                  <AlertTriangle className="h-6 w-6 text-red-400 shrink-0" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-red-400 block text-base mb-1.5">
                    ⚠️ {criticalTriggerCount} trigger(s) crítico(s) detectado(s)
                  </span>
                  <span className="text-sm text-red-300/90 block font-medium">
                    Se han registrado {criticalTriggerCount} eventos de alto impacto en la última semana.
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-2xl border-2 border-border">
            <div className="text-5xl mb-3">💭</div>
            <p className="text-base font-bold text-foreground">No se detectaron patrones de comportamiento activos</p>
            <p className="text-sm mt-2 text-muted-foreground font-medium">
              El agente mantiene su personalidad base sin behaviors especializados
            </p>
          </div>
        )}

        {/* Additional Behaviors */}
        {sortedBehaviors.length > 1 && (
          <div className="bg-muted/20 rounded-2xl p-5 border-2 border-border md-elevation-1">
            <h4 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
              Otros comportamientos detectados
            </h4>
            <div className="space-y-2.5">
              {sortedBehaviors.slice(1).map((behavior) => {
                const info = BEHAVIOR_DESCRIPTIONS[behavior.type];
                if (!info) return null;

                return (
                  <div key={behavior.type} className="flex items-center justify-between bg-muted/30 rounded-2xl p-3.5 border border-border/50 hover:border-border transition-all">
                    <span className="flex items-center gap-3">
                      <span className="text-2xl bg-muted/50 p-2 rounded-2xl border border-border/60">{info.emoji}</span>
                      <span className="font-bold text-foreground">{info.name}</span>
                    </span>
                    <span className="text-foreground font-extrabold text-base bg-muted px-3 py-1.5 rounded-2xl">
                      {(behavior.intensity * 100).toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
