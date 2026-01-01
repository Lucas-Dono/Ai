/**
 * UpgradeModal - Modal moderno para upgrade con MD3
 *
 * Features:
 * - Material Design 3 styling
 * - Sparkles effect en plan recomendado
 * - Animaciones suaves con framer-motion
 * - Glassmorphism y elevación
 * - Responsive design
 *
 * PHASE 5: Monetization
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Sparkles as SparklesIcon,
  Zap,
  Crown,
  X,
  ArrowRight,
  Infinity,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Sparkles, useEmotionalSparkles } from "@/components/effects/Sparkles";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: "free" | "plus" | "ultra";
  onUpgrade: (planId: "plus" | "ultra") => Promise<void>;
  /** Contexto opcional de por qué se muestra el modal */
  context?: {
    type: "limit_reached" | "feature_locked" | "voluntary";
    message?: string;
    limitType?: "messages" | "agents" | "worlds" | "images";
  };
}

// PHASE 5: Quick Win #4 - Feature tooltips for better understanding
const featureTooltips: Record<string, string> = {
  "100 mensajes/día": "Envía hasta 100 mensajes cada día. El límite se resetea a medianoche.",
  "Mensajes ilimitados": "Sin límites en tus conversaciones. Chatea todo lo que quieras, cuando quieras.",
  "10 agentes personalizados": "Crea y gestiona hasta 10 personajes con personalidades únicas.",
  "Agentes ilimitados": "Crea tantos personajes como necesites sin restricciones.",
  "5 mundos simultáneos": "Administra hasta 5 escenarios o historias activas al mismo tiempo.",
  "Mundos ilimitados": "Crea tantos mundos y escenarios como tu imaginación permita.",
  "Análisis de imágenes": "El agente puede ver y analizar imágenes que le envíes (hasta 10/mes).",
  "Imágenes ilimitadas": "Análisis ilimitado de imágenes sin restricciones mensuales.",
  "Voz en mensajes": "Envía hasta 20 mensajes de voz al mes. El agente responderá con texto.",
  "Voz premium": "Mensajes de voz ilimitados con respuestas de voz del agente (próximamente).",
  "Sin anuncios": "Experiencia limpia sin publicidad ni interrupciones.",
  "Prioridad en respuestas": "Tus mensajes se procesan primero en momentos de alta demanda.",
  "Memoria extendida": "El agente recuerda más contexto de conversaciones anteriores (hasta 10,000 tokens).",
  "Memoria máxima": "Memoria completa del agente con contexto extendido (hasta 50,000 tokens).",
  "API access": "Integra tus agentes en aplicaciones externas usando nuestra REST API.",
  "Soporte prioritario": "Respuesta en menos de 24h por email. Atención preferencial.",
  "Acceso anticipado": "Prueba nuevas funcionalidades antes que nadie.",
};

const plans = [
  {
    id: "plus" as const,
    name: "Plus",
    tagline: "Para creadores activos",
    priceMonthly: 5,
    priceYearly: 50, // $4.17/mes
    icon: SparklesIcon,
    gradient: "from-blue-500 via-purple-500 to-pink-500",
    glowColor: "rgba(139, 92, 246, 0.3)",
    features: [
      { text: "100 mensajes/día", icon: Infinity, highlight: true },
      { text: "10 agentes personalizados", icon: Crown },
      { text: "5 mundos simultáneos", icon: SparklesIcon },
      { text: "Análisis de imágenes", icon: Zap },
      { text: "Voz en mensajes", icon: Zap },
      { text: "Sin anuncios", icon: Check },
      { text: "Prioridad en respuestas", icon: Check },
      { text: "Memoria extendida", icon: Check },
    ],
    isRecommended: true,
  },
  {
    id: "ultra" as const,
    name: "Ultra",
    tagline: "Sin límites para profesionales",
    priceMonthly: 15,
    priceYearly: 150, // $12.50/mes
    icon: Crown,
    gradient: "from-purple-500 via-pink-500 to-red-500",
    glowColor: "rgba(236, 72, 153, 0.3)",
    features: [
      { text: "Mensajes ilimitados", icon: Infinity, highlight: true },
      { text: "Agentes ilimitados", icon: Crown, highlight: true },
      { text: "Mundos ilimitados", icon: Crown, highlight: true },
      { text: "Imágenes ilimitadas", icon: Infinity },
      { text: "Voz premium", icon: Zap },
      { text: "API access", icon: Zap },
      { text: "Soporte prioritario", icon: Crown },
      { text: "Memoria máxima", icon: Infinity },
      { text: "Acceso anticipado", icon: SparklesIcon },
    ],
    isRecommended: false,
  },
];

export function UpgradeModal({
  open,
  onOpenChange,
  currentPlan,
  onUpgrade,
  context,
}: UpgradeModalProps) {
  const t = useTranslations("billing.components.upgradeModal");
  const [loading, setLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const { showSparkles, sparklesConfig, triggerSparkles } = useEmotionalSparkles();

  const handleUpgrade = async (planId: "plus" | "ultra") => {
    setLoading(planId);
    try {
      // Trigger sparkles en upgrade exitoso
      triggerSparkles({ emotion: "achievement", intensity: 9, duration: 3 });
      await onUpgrade(planId);
    } finally {
      setLoading(null);
    }
  };

  const getContextMessage = (): string | null => {
    if (!context) return null;

    const messages = {
      limit_reached: {
        messages: "Has alcanzado tu límite diario de mensajes",
        agents: "Has alcanzado el límite de agentes para tu plan",
        worlds: "Has alcanzado el límite de mundos simultáneos",
        images: "Has alcanzado el límite de análisis de imágenes",
      },
      feature_locked: "Esta característica requiere un plan superior",
      voluntary: "Desbloquea todo el potencial de tu creatividad",
    };

    if (context.type === "limit_reached" && context.limitType) {
      const msg = messages.limit_reached[context.limitType];
      return typeof msg === 'string' ? msg : "Has alcanzado un límite de tu plan";
    }

    const msg = context.message || messages[context.type];
    return typeof msg === 'string' ? msg : null;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-2 border-primary/20">
          {/* Header con glassmorphism */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/50 p-6">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Potencia tu creatividad
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    {getContextMessage() || "Elige el plan perfecto para ti"}
                  </DialogDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Billing interval toggle */}
              <div className="flex items-center justify-center gap-2 mt-6 p-1 bg-muted rounded-2xl w-fit mx-auto">
                <button
                  onClick={() => setBillingInterval("monthly")}
                  className={cn(
                    "px-6 py-2 rounded-xl font-medium transition-all",
                    billingInterval === "monthly"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setBillingInterval("yearly")}
                  className={cn(
                    "px-6 py-2 rounded-xl font-medium transition-all relative",
                    billingInterval === "yearly"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Anual
                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs px-2 py-0.5">
                    -17%
                  </Badge>
                </button>
              </div>
            </DialogHeader>
          </div>

          {/* Plans grid */}
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              const isCurrentPlan = currentPlan === plan.id;
              const price = billingInterval === "monthly" ? plan.priceMonthly : plan.priceYearly;
              const savings = billingInterval === "yearly" ? Math.round(((plan.priceMonthly * 12 - plan.priceYearly) / (plan.priceMonthly * 12)) * 100) : 0;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "relative rounded-3xl p-6 border-2 transition-all hover-lift-glow",
                    plan.isRecommended
                      ? "border-primary shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5"
                      : "border-border/50 bg-card/50 backdrop-blur-sm",
                    isCurrentPlan && "opacity-60"
                  )}
                  style={{
                    boxShadow: plan.isRecommended
                      ? `0 20px 60px -12px ${plan.glowColor}`
                      : undefined,
                  }}
                >
                  {/* Recommended badge */}
                  {plan.isRecommended && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0 px-4 py-1 text-sm font-semibold">
                      <SparklesIcon className="w-3.5 h-3.5 mr-1" />
                      Recomendado
                    </Badge>
                  )}

                  {/* Plan header */}
                  <div className="mb-6">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg",
                        plan.gradient
                      )}
                      style={{
                        boxShadow: `0 8px 24px -4px ${plan.glowColor}`,
                      }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.tagline}
                    </p>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-5xl font-bold">${price}</span>
                      <span className="text-muted-foreground">
                        /{billingInterval === "monthly" ? "mes" : "año"}
                      </span>
                    </div>
                    {billingInterval === "yearly" && (
                      <p className="text-sm text-green-600 font-medium">
                        Ahorras ${plan.priceMonthly * 12 - plan.priceYearly} al año ({savings}%)
                      </p>
                    )}
                  </div>

                  {/* Features - PHASE 5: Quick Win #4 - With tooltips */}
                  <TooltipProvider>
                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => {
                        const FeatureIcon = feature.icon;
                        const tooltip = featureTooltips[feature.text];

                        const featureContent = (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + i * 0.05 }}
                            className="flex items-start gap-3"
                          >
                            <div
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                                feature.highlight
                                  ? `bg-gradient-to-br ${plan.gradient}`
                                  : "bg-muted"
                              )}
                            >
                              <FeatureIcon
                                className={cn(
                                  "w-3.5 h-3.5",
                                  feature.highlight ? "text-white" : "text-muted-foreground"
                                )}
                              />
                            </div>
                            <span
                              className={cn(
                                "text-sm cursor-help",
                                feature.highlight && "font-semibold"
                              )}
                            >
                              {feature.text}
                            </span>
                          </motion.div>
                        );

                        // Wrap with tooltip if description exists
                        if (tooltip) {
                          return (
                            <Tooltip key={i}>
                              <TooltipTrigger asChild>
                                {featureContent}
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-xs">
                                <p className="text-xs">{tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        }

                        return featureContent;
                      })}
                    </div>
                  </TooltipProvider>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading !== null || isCurrentPlan}
                    className={cn(
                      "w-full h-12 rounded-2xl font-semibold text-base transition-all",
                      plan.isRecommended &&
                        `bg-gradient-to-r ${plan.gradient} hover:shadow-lg text-white border-0`,
                      !plan.isRecommended && "border-2"
                    )}
                    style={
                      plan.isRecommended
                        ? {
                            boxShadow: `0 8px 24px -4px ${plan.glowColor}`,
                          }
                        : undefined
                    }
                  >
                    {isCurrentPlan ? (
                      "Plan actual"
                    ) : loading === plan.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Procesando...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        Actualizar a {plan.name}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Footer - HONEST refund policy */}
          <div className="border-t border-border/50 p-6 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2 text-foreground">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">Reembolso proporcional (14 días)</div>
                  <div className="text-xs text-muted-foreground">Te devolvemos lo pagado menos costos de uso</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">Cancela cuando quieras</div>
                  <div className="text-xs text-muted-foreground">Sin compromisos ni cargos ocultos</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold">Pago seguro</div>
                  <div className="text-xs text-muted-foreground">Encriptación SSL de nivel bancario</div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sparkles effect */}
      <Sparkles show={showSparkles} {...sparklesConfig} />
    </>
  );
}
