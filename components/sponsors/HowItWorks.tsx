"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { MessageSquare, Sparkles, BarChart3, ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: MessageSquare,
      title: "Contexto Natural",
      description:
        "Tu marca aparece cuando es orgánicamente relevante a la conversación. No hay interrupciones forzadas - el personaje AI decide el momento perfecto basándose en relevancia contextual.",
      highlight: "100% visto en conversación",
    },
    {
      number: "02",
      icon: Sparkles,
      title: "Endorsement Auténtico",
      description:
        "Personajes AI comparten experiencias genuinas con tu producto usando su voz única. Se siente como consejo de un amigo, no como publicidad.",
      highlight: "70-80% sentiment positivo",
    },
    {
      number: "03",
      icon: BarChart3,
      title: "Resultados Medibles",
      description:
        "Dashboard completo con analytics en tiempo real: impressions, engagement, sentiment, CTR y conversiones. Optimización basada en data.",
      highlight: "ROI 3-5x proyectado",
    },
  ];

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-muted/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Cómo Funciona{" "}
            <span className="text-blue-600">
              el Product Placement Inteligente
            </span>
          </h2>
          <p className="text-lg text-foreground/80">
            Un proceso simple de 3 pasos que genera resultados extraordinarios
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2" />

          <div className="grid lg:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className="p-6 h-full border border-border hover:border-foreground/20 transition-all duration-300 group bg-card/50 backdrop-blur-sm">
                    {/* Step number */}
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-muted mb-6">
                      <span className="text-base font-bold">{step.number}</span>
                    </div>

                    {/* Icon */}
                    <div className="mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                        <Icon className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="text-sm text-foreground/70 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Highlight stat */}
                      <div className="pt-4 border-t border-border">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{step.highlight}</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Arrow between steps */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-30">
                      <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <Card className="p-8 border border-border bg-card/50 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Display Ads */}
              <div>
                <h4 className="text-sm font-bold text-foreground/60 mb-4 uppercase tracking-wide">
                  TUS ADS ACTUALES
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-red-600 mt-0.5 font-bold">✗</span>
                    <span className="text-foreground/70">
                      86% ignorados (ad blindness)
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-red-600 mt-0.5 font-bold">✗</span>
                    <span className="text-foreground/70">
                      Click-through rate: &lt;0.1%
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-red-600 mt-0.5 font-bold">✗</span>
                    <span className="text-foreground/70">
                      Bloquean la experiencia
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-red-600 mt-0.5 font-bold">✗</span>
                    <span className="text-foreground/70">
                      No generan confianza
                    </span>
                  </li>
                </ul>
              </div>

              {/* Blaniel */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
                  PRODUCT PLACEMENT EN BLANIEL
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-600 mt-0.5 font-bold">✓</span>
                    <span className="text-foreground font-medium">
                      100% visto (parte de conversación)
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-600 mt-0.5 font-bold">✓</span>
                    <span className="text-foreground font-medium">
                      Engagement significativamente mayor (vs display ads)
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-600 mt-0.5 font-bold">✓</span>
                    <span className="text-foreground font-medium">
                      Mejora la experiencia
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-600 mt-0.5 font-bold">✓</span>
                    <span className="text-foreground font-medium">
                      Genera confianza real
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
