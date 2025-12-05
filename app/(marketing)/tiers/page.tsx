"use client";

import Link from "next/link";
import { Check, X, Sparkles, Brain, Heart } from "lucide-react";

export default function TiersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl font-extrabold mb-6">
            Niveles de Generación de Personajes
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Diferentes niveles de profundidad psicológica y complejidad para cada tipo de usuario
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <TierCard
            name="Free"
            price="Gratis"
            description="Perfecto para empezar"
            icon={<Sparkles className="w-8 h-8" />}
            color="gray"
            features={[
              { text: "~60 campos de perfil", included: true },
              { text: "7 secciones básicas", included: true },
              { text: "System prompt: 150-200 palabras", included: true },
              { text: "Modelo: Gemini Flash Lite", included: true },
              { text: "Generación: ~5-7 segundos", included: true },
              { text: "Personalidad coherente", included: true },
              { text: "Big Five personality", included: true },
              { text: "Rutinas dinámicas", included: false },
              { text: "Análisis psicológico profundo", included: false },
              { text: "Patrones relacionales", included: false },
              { text: "Framework filosófico", included: false },
            ]}
            limits="1 personaje Plus/mes + 2 personajes Free/semana"
            cta={{
              text: "Empezar Gratis",
              href: "/signup",
            }}
          />

          {/* Plus Tier */}
          <TierCard
            name="Plus"
            price="$9.99/mes"
            description="Para usuarios serios"
            icon={<Heart className="w-8 h-8" />}
            color="blue"
            highlighted={true}
            features={[
              { text: "~160 campos de perfil", included: true },
              { text: "13 secciones completas", included: true },
              { text: "System prompt: 300-400 palabras", included: true },
              { text: "Modelo: Gemini Flash Lite", included: true },
              { text: "Generación: ~10-15 segundos", included: true },
              { text: "Familia, amigos, ex-parejas", included: true },
              { text: "Experiencias de vida detalladas", included: true },
              { text: "Detalles mundanos realistas", included: true },
              { text: "Rutinas dinámicas ✨", included: true },
              { text: "Metas y eventos (Living AI) ✨", included: true },
              { text: "Análisis psicológico profundo", included: false },
              { text: "Patrones relacionales", included: false },
              { text: "Framework filosófico", included: false },
            ]}
            limits="Personajes Plus ilimitados"
            cta={{
              text: "Actualizar a Plus",
              href: "/upgrade?tier=plus",
            }}
          />

          {/* Ultra Tier */}
          <TierCard
            name="Ultra"
            price="$29.99/mes"
            description="Máxima calidad posible"
            icon={<Brain className="w-8 h-8" />}
            color="purple"
            features={[
              { text: "~240+ campos de perfil", included: true },
              { text: "16 secciones (13 + 3 Ultra)", included: true },
              { text: "System prompt: 400-500 palabras", included: true },
              { text: "Modelo: Gemini Flash Full 🚀", included: true },
              { text: "Generación: ~20-30 segundos", included: true },
              { text: "Todo lo de Plus +", included: true },
              { text: "Perfil Psicológico Completo 🧠", included: true, highlight: true },
              { text: "Patrones Relacionales Profundos ❤️", included: true, highlight: true },
              { text: "Framework Filosófico 🌟", included: true, highlight: true },
              { text: "Attachment style analysis", included: true },
              { text: "Love languages detallados", included: true },
              { text: "Worldview & política", included: true },
              { text: "Sin límites de costo", included: true },
            ]}
            limits="Personajes Ultra ilimitados"
            cta={{
              text: "Actualizar a Ultra",
              href: "/upgrade?tier=ultra",
            }}
          />
        </div>

        {/* Ultra Exclusive Features Detail */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Características Exclusivas de Ultra Tier
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureDetail
              icon={<Brain className="w-12 h-12 text-purple-600" />}
              title="Perfil Psicológico"
              description="Análisis profundo con 25+ campos incluyendo:"
              features={[
                "Attachment style (seguro, ansioso, evitativo)",
                "Mecanismos de afrontamiento primarios y no saludables",
                "Regulación emocional y explosividad",
                "Historial de trauma y factores de resiliencia",
                "Nivel de auto-consciencia y blind spots",
                "Mecanismos de defensa psicológica",
              ]}
            />

            <FeatureDetail
              icon={<Heart className="w-12 h-12 text-pink-600" />}
              title="Patrones Relacionales"
              description="Profundidad en relaciones con 20+ campos:"
              features={[
                "Love languages (dar y recibir con intensidades)",
                "Patrones relacionales que repite + análisis de por qué",
                "Estilo de límites personales y profesionales",
                "Estilo de conflicto y triggers emocionales",
                "Comodidad con intimidad (emocional, física, intelectual)",
                "Nivel de máscara social por contexto",
              ]}
            />

            <FeatureDetail
              icon={<Sparkles className="w-12 h-12 text-blue-600" />}
              title="Framework Filosófico"
              description="Cosmovisión completa con 20+ campos:"
              features={[
                "Nivel de optimismo y tipo de worldview",
                "Posiciones políticas matizadas",
                "Framework ético (utilitarista, deontológico, etc.)",
                "Background religioso y creencias actuales",
                "Filosofía de vida y creencias fundamentales",
                "Epistemología: cómo determina la verdad",
              ]}
            />
          </div>
        </div>

        {/* Technical Comparison */}
        <div className="mt-20 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Comparación Técnica
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">
                    Característica
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600">
                    Free
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-blue-600">
                    Plus
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-purple-600">
                    Ultra
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <TechRow label="Modelo IA" free="Flash Lite" plus="Flash Lite" ultra="Flash Full" />
                <TechRow label="Tokens máximos" free="2,000" plus="8,000" ultra="20,000" />
                <TechRow label="Campos totales" free="~60" plus="~160" ultra="~240+" />
                <TechRow label="Secciones" free="7 básicas" plus="13 completas" ultra="16 (13 + 3 Ultra)" />
                <TechRow label="System Prompt" free="150-200 palabras" plus="300-400 palabras" ultra="400-500 palabras" />
                <TechRow label="Tiempo de generación" free="~5-7s" plus="~10-15s" ultra="~20-30s" />
                <TechRow label="Costo por personaje" free="$0.0008" plus="$0.0032" ultra="$0.05" />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component: Tier Card
function TierCard({
  name,
  price,
  description,
  icon,
  color,
  highlighted,
  features,
  limits,
  cta,
}: {
  name: string;
  price: string;
  description: string;
  icon: React.ReactNode;
  color: "gray" | "blue" | "purple";
  highlighted?: boolean;
  features: { text: string; included: boolean; highlight?: boolean }[];
  limits: string;
  cta: { text: string; href: string };
}) {
  const colorClasses = {
    gray: "from-gray-50 to-gray-100 border-gray-200",
    blue: "from-blue-50 to-blue-100 border-blue-200",
    purple: "from-purple-50 to-purple-100 border-purple-200",
  };

  const buttonClasses = {
    gray: "bg-gray-600 hover:bg-gray-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    purple: "bg-purple-600 hover:bg-purple-700",
  };

  return (
    <div
      className={`bg-gradient-to-b ${colorClasses[color]} border-2 rounded-2xl p-8 ${
        highlighted ? "ring-4 ring-blue-400 relative" : ""
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Más Popular
        </div>
      )}

      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-white rounded-xl shadow-md mb-4">{icon}</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="text-4xl font-extrabold text-gray-900 mb-2">{price}</div>
        <p className="text-sm text-gray-500">{limits}</p>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            {feature.included ? (
              <Check className={`w-5 h-5 ${feature.highlight ? "text-purple-600" : "text-green-600"} flex-shrink-0 mt-0.5`} />
            ) : (
              <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
            )}
            <span className={`text-sm ${feature.included ? "text-gray-700" : "text-gray-400"} ${feature.highlight ? "font-semibold" : ""}`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={cta.href}
        className={`block w-full text-center ${buttonClasses[color]} text-white font-semibold py-3 px-6 rounded-lg transition-colors`}
      >
        {cta.text}
      </Link>
    </div>
  );
}

// Component: Feature Detail
function FeatureDetail({
  icon,
  title,
  description,
  features,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        {icon}
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Component: Tech Row
function TechRow({
  label,
  free,
  plus,
  ultra,
}: {
  label: string;
  free: string;
  plus: string;
  ultra: string;
}) {
  return (
    <tr>
      <td className="py-4 px-6 text-sm font-medium text-gray-900">{label}</td>
      <td className="py-4 px-6 text-sm text-center text-gray-600">{free}</td>
      <td className="py-4 px-6 text-sm text-center text-blue-600 font-semibold">{plus}</td>
      <td className="py-4 px-6 text-sm text-center text-purple-600 font-bold">{ultra}</td>
    </tr>
  );
}
