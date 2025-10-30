"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Sparkles, Sliders, ArrowLeft, Zap, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WorldCreatorSelectionPage() {
  const router = useRouter();

  const modes = [
    {
      id: "simple",
      name: "Modo Simple",
      icon: Sparkles,
      description: "Asistido por IA - Perfecto para comenzar",
      features: [
        "Generación automática con IA",
        "Templates predefinidos",
        "Proceso guiado paso a paso",
        "Ideal para principiantes",
      ],
      color: "from-primary to-secondary",
      route: "/dashboard/mundos/crear/simple",
      recommended: true,
    },
    {
      id: "advanced",
      name: "Modo Avanzado",
      icon: Sliders,
      description: "Control total - Para usuarios experimentados",
      features: [
        "Configuración manual completa",
        "Sin límites de IA",
        "Control total sobre prompts",
        "Máxima personalización",
      ],
      color: "from-purple-500 to-pink-500",
      route: "/dashboard/mundos/crear/avanzado",
      recommended: false,
    },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/dashboard/mundos">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a mundos
          </Button>
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold md-text-primary">Crear Nuevo Mundo</h1>
            <p className="text-lg md-text-secondary">
              Elige el modo que mejor se adapte a tu experiencia
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="max-w-5xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
          {modes.map((mode) => {
            const Icon = mode.icon;

            return (
              <motion.div
                key={mode.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="p-6 h-full cursor-pointer hover:border-primary/50 transition-all relative overflow-hidden group"
                  onClick={() => router.push(mode.route)}
                >
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold md-text-primary">
                            {mode.name}
                          </h3>
                          {mode.recommended && (
                            <Badge variant="default" className="text-xs mt-1">
                              Recomendado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm md-text-secondary mb-4">
                      {mode.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {mode.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <span className="text-primary">✓</span>
                          <span className="md-text-secondary">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button className="w-full" variant={mode.recommended ? "default" : "outline"}>
                      {mode.recommended ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Empezar con IA
                        </>
                      ) : (
                        <>
                          <Wrench className="h-4 w-4 mr-2" />
                          Modo Experto
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-8 max-w-3xl mx-auto p-6 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div className="flex-1">
              <h3 className="font-semibold md-text-primary mb-2">
                ¿Cuál modo elegir?
              </h3>
              <div className="space-y-2 text-sm md-text-secondary">
                <p>
                  <strong className="text-primary">Modo Simple:</strong> Si es tu primera vez creando mundos o prefieres que la IA te ayude con sugerencias inteligentes. Perfecto para explorar rápidamente ideas.
                </p>
                <p>
                  <strong className="text-purple-500">Modo Avanzado:</strong> Si tienes experiencia y quieres escribir tus propios system prompts, configurar cada detalle manualmente y tener control total sobre cada aspecto del mundo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
