"use client";

import { Sparkles, TrendingUp, Scale, BookOpen, Lightbulb, Target } from "lucide-react";
import type { PhilosophicalFramework } from "@prisma/client";

interface PhilosophicalFrameworkCardProps {
  framework: PhilosophicalFramework;
}

export default function PhilosophicalFrameworkCard({ framework }: PhilosophicalFrameworkCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <Sparkles className="w-8 h-8 text-blue-600" />
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Framework Filosófico</h3>
          <p className="text-sm text-gray-500">Cosmovisión y filosofía de vida</p>
        </div>
      </div>

      {/* Worldview */}
      <Section title="Visión del Mundo" icon={<TrendingUp className="w-5 h-5" />}>
        <div className="space-y-3">
          <MetricBar label="Optimismo" value={framework.optimismLevel} color="blue" />

          {framework.worldviewType && (
            <div>
              <span className="text-sm text-gray-600">Tipo de cosmovisión: </span>
              <Pill color="blue">{framework.worldviewType}</Pill>
            </div>
          )}

          {framework.existentialStance && (
            <div>
              <span className="text-sm text-gray-600">Postura existencial: </span>
              <Pill color="purple">{framework.existentialStance}</Pill>
            </div>
          )}

          {framework.meaningSource && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
              <div className="text-xs font-semibold text-blue-700 mb-1">FUENTE DE SIGNIFICADO</div>
              <p className="text-sm text-blue-900 leading-relaxed">{framework.meaningSource}</p>
            </div>
          )}
        </div>
      </Section>

      {/* Politics & Social Justice */}
      <Section title="Política & Justicia Social" icon={<Scale className="w-5 h-5" />}>
        <div className="space-y-3">
          {framework.politicalLeanings && (
            <div className="bg-gray-50 border-l-4 border-gray-400 p-3 rounded">
              <div className="text-xs font-semibold text-gray-700 mb-1">POSICIONES POLÍTICAS</div>
              <p className="text-sm text-gray-800 leading-relaxed">{framework.politicalLeanings}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <MetricBar label="Compromiso político" value={framework.politicalEngagement} color="purple" />
            <MetricBar label="Nivel de activismo" value={framework.activismLevel} color="green" />
          </div>

          {framework.socialJusticeStance && (
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">JUSTICIA SOCIAL</div>
              <p className="text-sm text-gray-700">{framework.socialJusticeStance}</p>
            </div>
          )}
        </div>
      </Section>

      {/* Ethics & Morality */}
      <Section title="Ética & Moralidad" icon={<Scale className="w-5 h-5" />}>
        <div className="space-y-3">
          {framework.ethicalFramework && (
            <div>
              <span className="text-sm text-gray-600">Framework ético: </span>
              <Pill color="green">{framework.ethicalFramework}</Pill>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <MetricBar label="Complejidad moral" value={framework.moralComplexity} color="purple" />
            <MetricBar label="Rigidez moral" value={framework.moralRigidity} color="orange" />
          </div>

          {framework.moralDilemmas && (framework.moralDilemmas as any[]).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-purple-700 mb-2">🤔 DILEMAS MORALES</div>
              <div className="space-y-2">
                {(framework.moralDilemmas as any[]).map((dilemma, idx) => (
                  <div key={idx} className="bg-purple-50 p-3 rounded">
                    <div className="text-sm font-semibold text-purple-900 mb-1">
                      {dilemma.situación}
                    </div>
                    <div className="text-xs text-purple-700">
                      <strong>Postura:</strong> {dilemma.stance}
                    </div>
                    {dilemma.reasoning && (
                      <div className="text-xs text-purple-600 mt-1 italic">
                        {dilemma.reasoning}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Religion & Spirituality */}
      <Section title="Religión & Espiritualidad" icon={<BookOpen className="w-5 h-5" />}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {framework.religiousBackground && (
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Background</div>
                <Pill color="blue">{framework.religiousBackground}</Pill>
              </div>
            )}

            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Importancia</div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${framework.faithImportance}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">{framework.faithImportance}/100</span>
              </div>
            </div>
          </div>

          {framework.currentBeliefs && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
              <div className="text-xs font-semibold text-blue-700 mb-1">CREENCIAS ACTUALES</div>
              <p className="text-sm text-blue-900 leading-relaxed">{framework.currentBeliefs}</p>
            </div>
          )}

          {(framework.spiritualPractices as string[]).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-purple-600 mb-1">🧘 PRÁCTICAS ESPIRITUALES</div>
              <div className="flex flex-wrap gap-2">
                {(framework.spiritualPractices as string[]).map((practice, idx) => (
                  <Pill key={idx} color="purple">{practice}</Pill>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Life Philosophy */}
      <Section title="Filosofía de Vida" icon={<Lightbulb className="w-5 h-5" />}>
        <div className="space-y-3">
          {framework.lifePhilosophy && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="text-xs font-semibold text-yellow-700 mb-2">💡 FILOSOFÍA PERSONAL</div>
              <p className="text-sm text-yellow-900 leading-relaxed">{framework.lifePhilosophy}</p>
            </div>
          )}

          {(framework.coreBeliefs as string[]).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-green-600 mb-2">✓ CREENCIAS FUNDAMENTALES</div>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {(framework.coreBeliefs as string[]).map((belief, idx) => (
                  <li key={idx}>{belief}</li>
                ))}
              </ul>
            </div>
          )}

          {(framework.dealbreakers as string[]).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-red-600 mb-2">🚫 DEALBREAKERS</div>
              <div className="flex flex-wrap gap-2">
                {(framework.dealbreakers as string[]).map((db, idx) => (
                  <Pill key={idx} color="red">{db}</Pill>
                ))}
              </div>
            </div>
          )}

          {framework.personalMotto && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-4 rounded-lg text-center">
              <div className="text-xs font-semibold text-purple-600 mb-2">🎯 LEMA DE VIDA</div>
              <p className="text-lg font-bold text-purple-900 italic">"{framework.personalMotto}"</p>
            </div>
          )}
        </div>
      </Section>

      {/* Knowledge & Truth */}
      <Section title="Conocimiento & Verdad" icon={<Target className="w-5 h-5" />}>
        <div className="space-y-3">
          {framework.epistomologyStance && (
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">EPISTEMOLOGÍA</div>
              <p className="text-sm text-gray-700">{framework.epistomologyStance}</p>
            </div>
          )}

          <div className="space-y-2">
            <MetricBar label="Confianza en la ciencia" value={framework.scienceTrustLevel} color="blue" />
            <MetricBar
              label="Intuición vs Lógica"
              value={framework.intuitionVsLogic}
              color={framework.intuitionVsLogic > 50 ? "purple" : "blue"}
            />
            <div className="text-xs text-gray-500 text-center">
              {framework.intuitionVsLogic < 30 && "Muy lógico/a"}
              {framework.intuitionVsLogic >= 30 && framework.intuitionVsLogic <= 70 && "Balance entre lógica e intuición"}
              {framework.intuitionVsLogic > 70 && "Muy intuitivo/a"}
            </div>
          </div>
        </div>
      </Section>

      {/* Growth & Change */}
      <Section title="Crecimiento & Cambio" icon={<TrendingUp className="w-5 h-5" />}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <MetricBar label="Growth mindset" value={framework.growthMindset} color="green" />
            <MetricBar label="Apertura al cambio" value={framework.opennessToChange} color="blue" />
          </div>

          {framework.philosophicalEvolution && (
            <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
              <div className="text-xs font-semibold text-green-700 mb-1">🌱 EVOLUCIÓN FILOSÓFICA</div>
              <p className="text-sm text-green-900 leading-relaxed">{framework.philosophicalEvolution}</p>
            </div>
          )}
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

function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  const colors = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    purple: "bg-purple-100 text-purple-700",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors[color as keyof typeof colors]}`}>
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
