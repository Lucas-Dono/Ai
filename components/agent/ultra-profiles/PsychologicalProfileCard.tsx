"use client";

import { Brain, Heart, Shield, Zap, TrendingUp, Eye } from "lucide-react";
import type { PsychologicalProfile } from "@prisma/client";

interface PsychologicalProfileCardProps {
  profile: PsychologicalProfile;
}

export default function PsychologicalProfileCard({ profile }: PsychologicalProfileCardProps) {
  const attachmentStyles = {
    secure: { label: "Seguro", color: "green", emoji: "💚" },
    anxious: { label: "Ansioso", color: "yellow", emoji: "💛" },
    avoidant: { label: "Evitativo", color: "blue", emoji: "💙" },
    "fearful-avoidant": { label: "Temeroso-Evitativo", color: "purple", emoji: "💜" },
  };

  const attachment = attachmentStyles[profile.attachmentStyle as keyof typeof attachmentStyles] || attachmentStyles.secure;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <Brain className="w-8 h-8 text-purple-600" />
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Perfil Psicológico</h3>
          <p className="text-sm text-gray-500">Análisis profundo de personalidad</p>
        </div>
      </div>

      {/* Attachment Style */}
      <Section title="Estilo de Apego" icon={<Heart className="w-5 h-5" />}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{attachment.emoji}</span>
          <div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold bg-${attachment.color}-100 text-${attachment.color}-700`}>
              {attachment.label}
            </div>
          </div>
        </div>
        {profile.attachmentDescription && (
          <p className="text-sm text-gray-600 leading-relaxed">{profile.attachmentDescription}</p>
        )}
      </Section>

      {/* Emotional Regulation */}
      <Section title="Regulación Emocional" icon={<Zap className="w-5 h-5" />}>
        <div className="space-y-3">
          <MetricBar
            label="Baseline"
            value={profile.emotionalRegulationBaseline}
            colors={{
              estable: "green",
              volátil: "red",
              reprimido: "blue",
            }}
          />
          <MetricBar
            label="Explosividad"
            value={profile.emotionalExplosiveness}
            max={100}
            color="orange"
          />
          <div className="text-sm text-gray-600">
            <strong>Recuperación:</strong> {profile.emotionalRecoverySpeed}
          </div>
        </div>
      </Section>

      {/* Coping Mechanisms */}
      <Section title="Mecanismos de Afrontamiento" icon={<Shield className="w-5 h-5" />}>
        <div className="space-y-3">
          <div>
            <div className="text-xs font-semibold text-green-600 mb-1">✓ SALUDABLES</div>
            <div className="flex flex-wrap gap-2">
              {(profile.primaryCopingMechanisms as string[]).map((mechanism, idx) => (
                <Pill key={idx} color="green">{mechanism}</Pill>
              ))}
            </div>
          </div>

          {(profile.unhealthyCopingMechanisms as string[]).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-red-600 mb-1">⚠ NO SALUDABLES</div>
              <div className="flex flex-wrap gap-2">
                {(profile.unhealthyCopingMechanisms as string[]).map((mechanism, idx) => (
                  <Pill key={idx} color="red">{mechanism}</Pill>
                ))}
              </div>
            </div>
          )}

          {(profile.copingTriggers as string[]).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-yellow-600 mb-1">⚡ TRIGGERS</div>
              <div className="flex flex-wrap gap-2">
                {(profile.copingTriggers as string[]).map((trigger, idx) => (
                  <Pill key={idx} color="yellow">{trigger}</Pill>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Mental Health */}
      {(profile.mentalHealthConditions as string[]).length > 0 && (
        <Section title="Salud Mental" icon={<Heart className="w-5 h-5" />}>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {(profile.mentalHealthConditions as string[]).map((condition, idx) => (
                <Pill key={idx} color="purple">{condition}</Pill>
              ))}
            </div>

            {profile.therapyStatus && (
              <div className="text-sm text-gray-600">
                <strong>Terapia:</strong> {profile.therapyStatus}
              </div>
            )}

            {profile.medicationUse && (
              <div className="text-sm text-gray-600">
                <strong>Medicación:</strong> Sí
              </div>
            )}

            {profile.mentalHealthStigma && (
              <div className="text-sm text-gray-600 italic mt-2">
                "{profile.mentalHealthStigma}"
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Self-Awareness */}
      <Section title="Auto-Consciencia" icon={<Eye className="w-5 h-5" />}>
        <div className="space-y-3">
          <MetricBar
            label="Nivel de auto-consciencia"
            value={profile.selfAwarenessLevel}
            max={100}
            color="blue"
          />

          {(profile.blindSpots as string[]).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-red-600 mb-1">🙈 BLIND SPOTS</div>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {(profile.blindSpots as string[]).map((spot, idx) => (
                  <li key={idx}>{spot}</li>
                ))}
              </ul>
            </div>
          )}

          {(profile.insightAreas as string[]).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-green-600 mb-1">👁 ÁREAS DE INSIGHT</div>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {(profile.insightAreas as string[]).map((area, idx) => (
                  <li key={idx}>{area}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {/* Resilience Factors */}
      {(profile.resilienceFactors as string[]).length > 0 && (
        <Section title="Factores de Resiliencia" icon={<TrendingUp className="w-5 h-5" />}>
          <div className="flex flex-wrap gap-2">
            {(profile.resilienceFactors as string[]).map((factor, idx) => (
              <Pill key={idx} color="green">{factor}</Pill>
            ))}
          </div>
        </Section>
      )}
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

function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  const colors = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    purple: "bg-purple-100 text-purple-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors[color as keyof typeof colors]}`}>
      {children}
    </span>
  );
}

function MetricBar({
  label,
  value,
  max = 100,
  color = "blue",
  colors,
}: {
  label: string;
  value: string | number;
  max?: number;
  color?: string;
  colors?: Record<string, string>;
}) {
  // If value is a string with predefined colors
  if (typeof value === "string" && colors) {
    const colorClass = colors[value] || "gray";
    return (
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className={`text-xs font-semibold text-${colorClass}-600`}>{value}</span>
        </div>
      </div>
    );
  }

  // If value is a number
  const numValue = typeof value === "number" ? value : 0;
  const percentage = (numValue / max) * 100;

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
        <span className="text-sm font-semibold text-gray-900">{numValue}/{max}</span>
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
