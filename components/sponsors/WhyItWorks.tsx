"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Brain, Heart, Users, TrendingUp, MessageSquare, Shield, ThumbsUp } from "lucide-react";

export function WhyItWorks() {
  const reasons = [
    {
      icon: Brain,
      title: "Contexto Perfecto",
      description:
        "Las recomendaciones se procesan 5x mejor cuando vienen integradas en conversaciones relevantes. Tu marca aparece cuando el usuario está receptivo.",
      stat: "5x mejor procesamiento",
      color: "blue",
    },
    {
      icon: Heart,
      title: "Trust por Asociación",
      description:
        "Los usuarios confían en el personaje AI con quien conversan. Esa confianza se transfiere naturalmente a tu marca cuando la menciona.",
      stat: "70-80% sentiment positivo",
      color: "purple",
    },
    {
      icon: MessageSquare,
      title: "Zero Ad Blindness",
      description:
        "No es un banner ignorado. Es parte de la conversación que están activamente leyendo. Visibilidad garantizada en cada mención.",
      stat: "100% visto",
      color: "emerald",
    },
    {
      icon: Users,
      title: "Audiencia Comprometida",
      description:
        "Usuarios con 28 min promedio de sesión están altamente comprometidos, buscando activamente soluciones y recomendaciones.",
      stat: "28 min engagement",
      color: "orange",
    },
    {
      icon: TrendingUp,
      title: "Post-Engagement Tracking",
      description:
        "85%+ de usuarios continúan la conversación después de ver una mención patrocinada. No abandonan. No se molestan. Simplemente absorben la info y siguen.",
      stat: "85%+ continúan",
      color: "pink",
    },
    {
      icon: Shield,
      title: "Transparencia Total",
      description:
        "Cada mención tiene disclosure claro. Los usuarios saben que es sponsored pero lo valoran porque es genuinamente útil y contextual. La transparencia genera más confianza, no menos.",
      stat: "FTC compliant",
      color: "cyan",
    },
    {
      icon: ThumbsUp,
      title: "Los Usuarios lo Aprueban",
      description:
        "Cuando un usuario pregunta por botellas de agua y el personaje recomienda 'BlueX, marca que patrocina este mensaje', el usuario no se molesta — está buscando exactamente esa recomendación. El contexto lo cambia todo.",
      stat: "70-75% aprueban ads contextual",
      color: "indigo",
    },
  ];

  const colorClasses = {
    blue: {
      icon: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-200 dark:border-blue-800",
      stat: "text-blue-600",
    },
    purple: {
      icon: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/20",
      border: "border-purple-200 dark:border-purple-800",
      stat: "text-purple-600",
    },
    emerald: {
      icon: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      border: "border-emerald-200 dark:border-emerald-800",
      stat: "text-emerald-600",
    },
    orange: {
      icon: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/20",
      border: "border-orange-200 dark:border-orange-800",
      stat: "text-orange-600",
    },
    pink: {
      icon: "text-pink-600",
      bg: "bg-pink-50 dark:bg-pink-950/20",
      border: "border-pink-200 dark:border-pink-800",
      stat: "text-pink-600",
    },
    cyan: {
      icon: "text-cyan-600",
      bg: "bg-cyan-50 dark:bg-cyan-950/20",
      border: "border-cyan-200 dark:border-cyan-800",
      stat: "text-cyan-600",
    },
    indigo: {
      icon: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-950/20",
      border: "border-indigo-200 dark:border-indigo-800",
      stat: "text-indigo-600",
    },
  };

  return (
    <section className="py-12 md:py-24 sm:md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Por Qué{" "}
            <span className="text-blue-600">
              Funciona Realmente
            </span>
          </h2>
          <p className="text-lg text-foreground/80">
            La ciencia y psicología detrás del conversational marketing efectivo
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              const colors = colorClasses[reason.color as keyof typeof colorClasses];
              // Ocultar tarjetas 5, 6, 7 (índices 4, 5, 6) en mobile
              const isHiddenInMobile = index >= 4;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={isHiddenInMobile ? "hidden lg:block" : ""}
                >
                  <Card className="p-5 md:p-6 h-full border border-border hover:border-foreground/20 transition-all duration-300 bg-card/50 backdrop-blur-sm group">
                    <div className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${colors.icon}`} strokeWidth={2} />
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2.5 md:mb-3">
                      {reason.title}
                    </h3>

                    <p className="text-sm text-foreground/70 leading-relaxed mb-4">
                      {reason.description}
                    </p>

                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${colors.bg} border ${colors.border}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${colors.icon}`} />
                      <span className={`text-xs font-bold ${colors.stat}`}>
                        {reason.stat}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Research Note - oculta en mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="hidden md:block text-center mt-12 max-w-3xl mx-auto"
        >
          <Card className="p-6 border border-border bg-muted/50">
            <p className="text-sm text-foreground/70">
              Estas métricas están basadas en promedios de plataformas de conversational AI similares
              y estudios de psicología del consumidor sobre context-aware advertising. Cada campaña
              incluye tracking detallado para validar resultados específicos de tu marca.
            </p>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
