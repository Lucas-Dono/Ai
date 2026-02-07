"use client";

import { Heart, Users, Shield, Swords, Lock, Smile } from "lucide-react";
import type { DeepRelationalPatterns } from "@prisma/client";

interface RelationalPatternsCardProps {
  patterns: DeepRelationalPatterns;
}

export default function RelationalPatternsCard({ patterns }: RelationalPatternsCardProps) {
  const loveLanguages = [
    { key: "wordsOfAffirmation", label: "Palabras de afirmación", emoji: "💬" },
    { key: "physicalTouch", label: "Contacto físico", emoji: "🤗" },
    { key: "actsOfService", label: "Actos de servicio", emoji: "🤝" },
    { key: "qualityTime", label: "Tiempo de calidad", emoji: "⏰" },
    { key: "gifts", label: "Regalos", emoji: "🎁" },
  ];

  const intensities = patterns.loveLanguageIntensities as Record<string, number>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <Heart className="w-8 h-8 text-pink-600" />
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Patrones Relacionales</h3>
          <p className="text-sm text-gray-500">Cómo se relaciona con otros</p>
        </div>
      </div>

      {/* Love Languages */}
      <Section title="Love Languages" icon={<Heart className="w-5 h-5" />}>
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-pink-600 mb-2">❤️ CÓMO DA AMOR</div>
            <div className="flex flex-wrap gap-2">
              {(patterns.givingLoveLanguages as string[]).map((lang, idx) => (
                <Pill key={idx} color="pink">{lang}</Pill>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-purple-600 mb-2">💝 CÓMO RECIBE AMOR</div>
            <div className="flex flex-wrap gap-2">
              {(patterns.receivingLoveLanguages as string[]).map((lang, idx) => (
                <Pill key={idx} color="purple">{lang}</Pill>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-700 mb-3">📊 INTENSIDADES</div>
            <div className="space-y-2">
              {loveLanguages.map((ll) => {
                const intensity = intensities[ll.key] || 0;
                return (
                  <div key={ll.key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700">
                        {ll.emoji} {ll.label}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{intensity}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          intensity >= 70 ? "bg-pink-600" : intensity >= 40 ? "bg-pink-400" : "bg-pink-200"
                        }`}
                        style={{ width: `${intensity}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* Repeating Patterns */}
      {(patterns.repeatingPatterns as string[]).length > 0 && (
        <Section title="Patrones que Repite" icon={<Users className="w-5 h-5" />}>
          <div className="space-y-3">
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              {(patterns.repeatingPatterns as string[]).map((pattern, idx) => (
                <li key={idx}>{pattern}</li>
              ))}
            </ul>

            {patterns.whyRepeats && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                <div className="text-xs font-semibold text-blue-700 mb-1">POR QUÉ REPITE ESTOS PATRONES</div>
                <p className="text-sm text-blue-900 leading-relaxed">{patterns.whyRepeats}</p>
              </div>
            )}

            <div className="text-xs text-gray-600">
              <strong>Consciencia:</strong>{" "}
              <span
                className={
                  patterns.awarenessOfPatterns === "consciente"
                    ? "text-green-600 font-semibold"
                    : patterns.awarenessOfPatterns === "parcialmente_consciente"
                    ? "text-yellow-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {patterns.awarenessOfPatterns.replace("_", " ")}
              </span>
            </div>
          </div>
        </Section>
      )}

      {/* Boundaries */}
      <Section title="Límites Personales" icon={<Shield className="w-5 h-5" />}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-1">Personal</div>
            <Pill color={getBoundaryColor(patterns.personalBoundaryStyle)}>
              {patterns.personalBoundaryStyle}
            </Pill>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-1">Profesional</div>
            <Pill color={getBoundaryColor(patterns.professionalBoundaryStyle)}>
              {patterns.professionalBoundaryStyle}
            </Pill>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <MetricBar
            label="Enforcement (qué tan bien los mantiene)"
            value={patterns.boundaryEnforcement}
            color="blue"
          />

          {patterns.boundaryGuilty && (
            <div className="text-sm text-amber-600 flex items-center gap-2">
              <span>⚠️</span>
              <span>Siente culpa al poner límites</span>
            </div>
          )}
        </div>
      </Section>

      {/* Conflict Style */}
      <Section title="Estilo de Conflicto" icon={<Swords className="w-5 h-5" />}>
        <div className="space-y-3">
          <div>
            <Pill color="orange" size="lg">
              {patterns.conflictStyle}
            </Pill>
          </div>

          {(patterns.conflictTriggers as string[]).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-red-600 mb-1">⚡ TRIGGERS</div>
              <div className="flex flex-wrap gap-2">
                {(patterns.conflictTriggers as string[]).map((trigger, idx) => (
                  <Pill key={idx} color="red">{trigger}</Pill>
                ))}
              </div>
            </div>
          )}

          {(patterns.healthyConflictSkills as string[]).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-green-600 mb-1">✓ HABILIDADES SALUDABLES</div>
              <div className="flex flex-wrap gap-2">
                {(patterns.healthyConflictSkills as string[]).map((skill, idx) => (
                  <Pill key={idx} color="green">{skill}</Pill>
                ))}
              </div>
            </div>
          )}

          {(patterns.unhealthyConflictPatterns as string[]).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-red-600 mb-1">⚠ PATRONES NO SALUDABLES</div>
              <div className="flex flex-wrap gap-2">
                {(patterns.unhealthyConflictPatterns as string[]).map((pattern, idx) => (
                  <Pill key={idx} color="red">{pattern}</Pill>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Trust & Vulnerability */}
      <Section title="Confianza & Vulnerabilidad" icon={<Lock className="w-5 h-5" />}>
        <div className="space-y-2">
          <MetricBar label="Confianza baseline (por defecto)" value={patterns.trustBaseline} color="blue" />
          <MetricBar label="Comodidad con vulnerabilidad" value={patterns.vulnerabilityComfort} color="purple" />
          <MetricBar label="Capacidad de reparar confianza rota" value={patterns.trustRepairAbility} color="green" />
        </div>
      </Section>

      {/* Intimacy */}
      <Section title="Intimidad" icon={<Heart className="w-5 h-5" />}>
        <div className="space-y-3">
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-2">COMODIDAD CON DIFERENTES TIPOS</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(patterns.intimacyComfort as Record<string, number>).map(([type, level]) => (
                <div key={type} className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 capitalize">{type}</span>
                    <span className="font-semibold text-gray-900">{level}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-pink-600"
                      style={{ width: `${level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(patterns.intimacyFears as string[]).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-red-600 mb-1">😰 MIEDOS</div>
              <div className="flex flex-wrap gap-2">
                {(patterns.intimacyFears as string[]).map((fear, idx) => (
                  <Pill key={idx} color="red">{fear}</Pill>
                ))}
              </div>
            </div>
          )}

          {(patterns.intimacyNeeds as string[]).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-green-600 mb-1">💚 NECESIDADES</div>
              <div className="flex flex-wrap gap-2">
                {(patterns.intimacyNeeds as string[]).map((need, idx) => (
                  <Pill key={idx} color="green">{need}</Pill>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Social Mask */}
      <Section title="Máscara Social" icon={<Smile className="w-5 h-5" />}>
        <div className="space-y-3">
          <MetricBar
            label="Nivel de máscara social (cuánto esconde su verdadero yo)"
            value={patterns.socialMaskLevel}
            color="purple"
          />

          <div>
            <div className="text-xs font-semibold text-gray-700 mb-2">AUTENTICIDAD POR CONTEXTO</div>
            <div className="space-y-2">
              {Object.entries(patterns.authenticityByContext as Record<string, number>).map(([context, level]) => (
                <div key={context}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700 capitalize">{context}</span>
                    <span className="text-sm font-semibold text-gray-900">{level}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        level >= 70 ? "bg-green-600" : level >= 40 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm">
            <strong>Energía social:</strong>{" "}
            <Pill
              color={
                patterns.socialEnergy === "renovador"
                  ? "green"
                  : patterns.socialEnergy === "neutral"
                  ? "blue"
                  : "orange"
              }
            >
              {patterns.socialEnergy}
            </Pill>
          </div>
        </div>
      </Section>
    </div>
  );
}

// Helper Components
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-t pt-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-gray-600">{icon}</div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function Pill({
  children,
  color,
  size = "md",
}: {
  children: React.ReactNode;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const colors = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    purple: "bg-purple-100 text-purple-700",
    blue: "bg-blue-100 text-blue-700",
    pink: "bg-pink-100 text-pink-700",
    orange: "bg-orange-100 text-orange-700",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-2 text-sm",
  };

  return (
    <span className={`inline-block rounded-full font-medium ${colors[color as keyof typeof colors]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

function MetricBar({ label, value, max = 100, color = "blue" }: { label: string; value: number; max?: number; color?: string }) {
  const percentage = (value / max) * 100;

  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    red: "bg-red-600",
    orange: "bg-orange-600",
    purple: "bg-purple-600",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function getBoundaryColor(style: string): string {
  const map: Record<string, string> = {
    rígido: "red",
    saludable: "green",
    difuso: "yellow",
    ausente: "red",
  };
  return map[style] || "blue";
}
