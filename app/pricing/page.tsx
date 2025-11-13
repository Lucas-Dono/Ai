/**
 * Pricing Page - Public facing pricing with MD3
 *
 * Features:
 * - Material Design 3 styling
 * - Sparkles effect on card hover
 * - Glassmorphism and elevation
 * - Responsive design
 * - Monthly/Yearly toggle
 * - Detailed feature comparison
 *
 * PHASE 5: Monetization
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Sparkles as SparklesIcon,
  Zap,
  Crown,
  ArrowRight,
  Infinity,
  Shield,
  Rocket,
  Users,
  Heart,
  Star,
  MessageCircle,
  Image as ImageIcon,
  Mic,
  X,
  TrendingDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

const plans = [
  {
    id: "free" as const,
    name: "Free",
    tagline: "Para empezar y explorar",
    priceMonthly: 0,
    priceYearly: 0,
    icon: Heart,
    gradient: "from-gray-500 to-gray-600",
    glowColor: "rgba(107, 114, 128, 0.3)",
    features: [
      { text: "20 mensajes/día", icon: MessageCircle, highlight: false },
      { text: "3 agentes personalizados", icon: Users },
      { text: "1 mundo simultáneo", icon: SparklesIcon },
      { text: "Análisis de texto", icon: Check },
      { text: "Comunidad y marketplace", icon: Check },
      { text: "Con anuncios", icon: Check },
    ],
    isPopular: false,
    description: "Perfecto para probar la plataforma",
  },
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
      { text: "Análisis de imágenes", icon: ImageIcon, highlight: true },
      { text: "Voz en mensajes", icon: Mic, highlight: true },
      { text: "Sin anuncios", icon: Shield },
      { text: "Prioridad en respuestas", icon: Rocket },
      { text: "Memoria extendida", icon: Check },
    ],
    isPopular: true,
    description: "El favorito de la comunidad",
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
      { text: "Acceso anticipado a features", icon: SparklesIcon },
    ],
    isPopular: false,
    description: "Para uso profesional intensivo",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const handleSubscribe = async (planId: "plus" | "ultra") => {
    setLoading(planId);
    try {
      const response = await fetch("/api/billing/checkout-unified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          interval: billingInterval,
        }),
      });

      if (!response.ok) throw new Error("Failed to create checkout session");

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error:", error);
      alert("Error al iniciar el proceso de pago");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge
            variant="secondary"
            className="mb-4 bg-primary/10 text-primary border-primary/20"
          >
            <Star className="w-3 h-3 mr-1" />
            Pricing
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
            Potencia tu creatividad
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Empieza gratis y escala según creces. Todos los planes incluyen
            acceso a la comunidad y marketplace.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-2 mt-8 p-1 bg-muted rounded-2xl w-fit mx-auto">
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
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const price =
              billingInterval === "monthly"
                ? plan.priceMonthly
                : plan.priceYearly;
            const savings =
              billingInterval === "yearly" && plan.priceMonthly > 0
                ? Math.round(
                    ((plan.priceMonthly * 12 - plan.priceYearly) /
                      (plan.priceMonthly * 12)) *
                      100
                  )
                : 0;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Popular badge */}
                {plan.isPopular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                    <Badge className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0 px-4 py-1 text-sm font-semibold">
                      <SparklesIcon className="w-3.5 h-3.5 mr-1" />
                      Más Popular
                    </Badge>
                  </div>
                )}

                <Card
                  className={cn(
                    "p-8 h-full flex flex-col relative overflow-hidden transition-all hover-lift-glow",
                    plan.isPopular
                      ? "border-primary shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5"
                      : "border-border/50 bg-card/50 backdrop-blur-sm"
                  )}
                  style={{
                    boxShadow: plan.isPopular
                      ? `0 20px 60px -12px ${plan.glowColor}`
                      : undefined,
                  }}
                >
                  {/* Glass effect background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Header */}
                  <div className="mb-6 relative z-10">
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
                    <h3 className="text-3xl font-bold mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.tagline}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-6xl font-bold">
                        ${price === 0 ? "0" : price}
                      </span>
                      <span className="text-muted-foreground">
                        /{billingInterval === "monthly" ? "mes" : "año"}
                      </span>
                    </div>
                    {billingInterval === "yearly" && plan.priceMonthly > 0 && (
                      <p className="text-sm text-green-600 font-medium">
                        Ahorras ${plan.priceMonthly * 12 - plan.priceYearly} al
                        año ({savings}%)
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="mb-6 relative z-10">
                    {plan.id === "free" ? (
                      <Button
                        onClick={() => router.push("/dashboard")}
                        variant="outline"
                        className="w-full h-12 rounded-2xl font-semibold text-base"
                      >
                        Comenzar Gratis
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          handleSubscribe(plan.id as "plus" | "ultra")
                        }
                        disabled={loading !== null}
                        className={cn(
                          "w-full h-12 rounded-2xl font-semibold text-base transition-all",
                          plan.isPopular &&
                            `bg-gradient-to-r ${plan.gradient} hover:shadow-lg text-white border-0`
                        )}
                        style={
                          plan.isPopular
                            ? {
                                boxShadow: `0 8px 24px -4px ${plan.glowColor}`,
                              }
                            : undefined
                        }
                      >
                        {loading === plan.id ? (
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
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 flex-grow relative z-10">
                    {plan.features.map((feature, i) => {
                      const FeatureIcon = feature.icon;
                      return (
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
                                feature.highlight
                                  ? "text-white"
                                  : "text-muted-foreground"
                              )}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-sm",
                              feature.highlight && "font-semibold"
                            )}
                          >
                            {feature.text}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-muted-foreground mt-6 text-center relative z-10">
                    {plan.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Competitor Comparison - PHASE 5: Quick Win #2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-5xl mx-auto mb-20"
        >
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4 bg-blue-500/10 text-blue-600 border-blue-500/20">
              <TrendingDown className="w-3 h-3 mr-1" />
              Comparación de Precios
            </Badge>
            <h2 className="text-3xl font-bold mb-2">
              Mejor valor que la competencia
            </h2>
            <p className="text-muted-foreground">
              Compara nuestro Plan Plus con alternativas populares
            </p>
          </div>

          <Card className="overflow-hidden hover-lift-glow border-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 bg-primary/5 font-semibold">
                      <div className="flex flex-col items-center gap-1">
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                          Nosotros (Plus)
                        </Badge>
                        <span className="text-2xl font-bold text-primary">$5</span>
                        <span className="text-xs text-muted-foreground">/mes</span>
                      </div>
                    </th>
                    <th className="text-center p-4 font-semibold">
                      <div className="flex flex-col items-center gap-1">
                        <span>Replika</span>
                        <span className="text-2xl font-bold">$19.99</span>
                        <span className="text-xs text-muted-foreground">/mes</span>
                      </div>
                    </th>
                    <th className="text-center p-4 font-semibold">
                      <div className="flex flex-col items-center gap-1">
                        <span>Character.AI+</span>
                        <span className="text-2xl font-bold">$9.99</span>
                        <span className="text-xs text-muted-foreground">/mes</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 text-sm">Mensajes diarios</td>
                    <td className="text-center p-4 bg-primary/5">
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                        <Check className="w-3 h-3 mr-1" />
                        100/día
                      </Badge>
                    </td>
                    <td className="text-center p-4 text-muted-foreground text-sm">Limitados</td>
                    <td className="text-center p-4 text-muted-foreground text-sm">Ilimitados</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 text-sm">Agentes/Personajes</td>
                    <td className="text-center p-4 bg-primary/5">
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                        <Check className="w-3 h-3 mr-1" />
                        10 agentes
                      </Badge>
                    </td>
                    <td className="text-center p-4 text-muted-foreground text-sm">1 personaje</td>
                    <td className="text-center p-4 text-muted-foreground text-sm">Múltiples</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 text-sm">Análisis de imágenes</td>
                    <td className="text-center p-4 bg-primary/5">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 text-sm">Mensajes de voz</td>
                    <td className="text-center p-4 bg-primary/5">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 text-sm">Mundos/Escenarios</td>
                    <td className="text-center p-4 bg-primary/5">
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                        <Check className="w-3 h-3 mr-1" />
                        5 mundos
                      </Badge>
                    </td>
                    <td className="text-center p-4">
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    </td>
                    <td className="text-center p-4 text-muted-foreground text-sm">Limitados</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 text-sm">API Access</td>
                    <td className="text-center p-4 bg-primary/5 text-muted-foreground text-sm">
                      Plan Ultra
                    </td>
                    <td className="text-center p-4">
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    </td>
                    <td className="text-center p-4">
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b bg-green-500/5">
                    <td className="p-4 font-semibold">Ahorro vs competencia</td>
                    <td className="text-center p-4 bg-primary/5">
                      <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 text-sm px-3 py-1">
                        🎉 Base de comparación
                      </Badge>
                    </td>
                    <td className="text-center p-4">
                      <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        $14.99/mes más caro
                      </Badge>
                    </td>
                    <td className="text-center p-4">
                      <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        $4.99/mes más caro
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Precios actualizados al {new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' })}.
              Con nuestro Plan Plus ahorras hasta <span className="font-bold text-green-600">75% vs Replika</span> y obtienes más funcionalidades.
            </p>
          </div>
        </motion.div>

        {/* HONEST Refund Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <Card className="p-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 border-blue-500/30 hover-lift-glow">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2 text-blue-700 dark:text-blue-400">
                  Reembolso Proporcional de 14 Días
                </h3>
                <p className="text-muted-foreground mb-3">
                  Si cancelas en los primeros 14 días, te reembolsamos la diferencia entre lo que pagaste
                  y los costos reales de uso de IA. <strong>Política justa y transparente.</strong>
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Check className="w-4 h-4" />
                    <span className="font-medium">Reembolso Justo</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Check className="w-4 h-4" />
                    <span className="font-medium">Solo Pagas Uso Real</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Check className="w-4 h-4" />
                    <span className="font-medium">100% Transparente</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  Ejemplo: Plan Plus $5 - Si envías 100 mensajes en 5 días y cancelas, recuperas ~$4.90
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* HONEST Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-8 mb-20 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Pago seguro SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-600" />
            <span>Cancela cuando quieras</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-blue-600" />
            <span>Sin tarjeta para Free</span>
          </div>
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-blue-600" />
            <span>Lanzamiento 2025</span>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-4xl font-bold text-center mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Todo lo que necesitas saber sobre nuestros planes
          </p>
          <div className="space-y-4">
            <Card className="p-6 hover-lift-glow">
              <h3 className="font-semibold mb-2 text-lg">
                ¿Puedo cambiar de plan más adelante?
              </h3>
              <p className="text-sm text-muted-foreground">
                ¡Sí! Puedes actualizar, degradar o cancelar tu suscripción en
                cualquier momento desde tu dashboard de billing. Los cambios se
                aplican inmediatamente.
              </p>
            </Card>
            <Card className="p-6 hover-lift-glow">
              <h3 className="font-semibold mb-2 text-lg">
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="text-sm text-muted-foreground">
                Aceptamos tarjetas de crédito/débito, PayPal, y Mercado Pago
                (para LATAM). El pago es procesado de forma segura por nuestros
                proveedores de pago certificados.
              </p>
            </Card>
            <Card className="p-6 hover-lift-glow">
              <h3 className="font-semibold mb-2 text-lg">
                ¿Hay período de prueba gratuito?
              </h3>
              <p className="text-sm text-muted-foreground">
                El plan Free es completamente gratuito y puedes usarlo todo el
                tiempo que quieras. Los planes pagos (Plus y Ultra) requieren
                pago inmediato, pero ofrecemos garantía de devolución de 7 días
                sin preguntas.
              </p>
            </Card>
            <Card className="p-6 hover-lift-glow">
              <h3 className="font-semibold mb-2 text-lg">
                ¿Qué pasa si cancelo mi suscripción?
              </h3>
              <p className="text-sm text-muted-foreground">
                Tu plan pagado seguirá activo hasta el final del período de
                facturación actual. Después volverás automáticamente al plan
                Free, manteniendo todos tus agentes y mundos (pero con límites
                del plan Free).
              </p>
            </Card>
            <Card className="p-6 hover-lift-glow">
              <h3 className="font-semibold mb-2 text-lg">
                ¿Los límites se resetean diariamente?
              </h3>
              <p className="text-sm text-muted-foreground">
                Sí, los límites de mensajes se resetean cada 24 horas. Los
                límites de agentes y mundos son totales concurrentes (no por
                día). Por ejemplo, Plus te permite tener hasta 10 agentes
                activos al mismo tiempo.
              </p>
            </Card>
            <Card className="p-6 hover-lift-glow">
              <h3 className="font-semibold mb-2 text-lg">
                ¿Ofrecen descuentos para educación o empresas?
              </h3>
              <p className="text-sm text-muted-foreground">
                ¡Sí! Ofrecemos descuentos especiales para instituciones
                educativas y planes empresariales personalizados. Contáctanos en
                support@example.com para más información.
              </p>
            </Card>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <Card className="p-12 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20 hover-lift-glow">
            <SparklesIcon className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-4xl font-bold mb-4">
              ¿Listo para crear tus agentes de IA?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
              Únete a miles de creadores construyendo el futuro de las
              interacciones con IA. Comienza gratis, sin tarjeta de crédito.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white text-lg px-8 h-14"
              >
                Comenzar Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/marketplace">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 h-14"
                >
                  Explorar Marketplace
                  <Rocket className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
