"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, Award, Crown } from "lucide-react";

export function PricingPackages() {
  const packages = [
    {
      tier: "Bronze",
      icon: Zap,
      price: "$2,500",
      period: "/mes",
      description: "Perfecto para testear conversational marketing",
      highlight: false,
      features: [
        "1 personaje menciona tu brand",
        "4-6 mentions orgánicas por mes",
        "Product placement en conversaciones relevantes",
        "Imágenes generadas con tu producto (si aplica)",
        "Disclosure claro en cada mention",
        "Reporting mensual básico",
        "Impressions & engagement tracking",
      ],
      idealFor: "Brands testeando el canal, presupuestos limitados, productos nicho",
      commitment: "3 meses mínimo",
    },
    {
      tier: "Silver",
      icon: Award,
      price: "$7,500",
      period: "/mes",
      description: "Para brands serios sobre conversational commerce",
      highlight: true,
      features: [
        "3 personajes diferentes",
        "12-15 mentions por mes total",
        "Custom imagery con productos (AI-generated)",
        "Analytics dashboard en tiempo real",
        "A/B testing de messaging",
        "Reporting semanal detallado",
        "Campaign manager dedicado",
        "Optimización continua",
      ],
      idealFor: "Lanzamiento de productos nuevos, building brand awareness, testing scale",
      commitment: "3 meses mínimo",
    },
    {
      tier: "Gold",
      icon: Crown,
      price: "$20,000",
      period: "/mes",
      description: "Enterprise solution con resultados garantizados",
      highlight: false,
      features: [
        "10 personajes o personaje CUSTOM creado",
        "40+ mentions por mes",
        "Campaigns coordinadas (lanzamientos, promos)",
        "Video content (si aplicable)",
        "Analytics avanzados + BI dashboard",
        "Reporting semanal + monthly business review",
        "Exclusividad de categoría",
        "Campaign manager senior dedicado",
        "Co-marketing opportunities",
      ],
      idealFor: "Enterprise brands, major product launches, long-term brand building",
      commitment: "6 meses mínimo",
    },
  ];

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Planes & Pricing{" "}
            <span className="text-muted-foreground">Transparentes</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Desde brands testeando el canal hasta enterprise campaigns de largo plazo
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => {
              const Icon = pkg.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={pkg.highlight ? "lg:scale-105" : ""}
                >
                  <Card
                    className={`p-8 h-full flex flex-col border ${
                      pkg.highlight
                        ? "border-foreground/40 shadow-2xl bg-card"
                        : "border-border hover:border-foreground/20 bg-card/50"
                    } backdrop-blur-sm transition-all duration-300 relative`}
                  >
                    {/* Popular badge for Silver */}
                    {pkg.highlight && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <div className="bg-foreground text-background px-4 py-1.5 rounded-full text-xs font-semibold">
                          MÁS POPULAR
                        </div>
                      </div>
                    )}

                    {/* Header */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-10 h-10 rounded-2xl ${
                            pkg.highlight ? "bg-foreground text-background" : "bg-muted"
                          } flex items-center justify-center`}
                        >
                          <Icon className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{pkg.tier}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{pkg.description}</p>
                    </div>

                    {/* Pricing */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">{pkg.price}</span>
                        <span className="text-lg text-muted-foreground">{pkg.period}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Commitment: {pkg.commitment}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex-1 mb-6">
                      <ul className="space-y-3">
                        {pkg.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start gap-2">
                            <Check
                              className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                pkg.highlight ? "text-foreground" : "text-emerald-600"
                              }`}
                              strokeWidth={2.5}
                            />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Ideal for */}
                    <div className="mb-6 p-4 rounded-xl bg-muted/50">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Ideal para:
                      </div>
                      <div className="text-sm">{pkg.idealFor}</div>
                    </div>

                    {/* CTA */}
                    <Button
                      size="lg"
                      className={`w-full ${
                        pkg.highlight
                          ? "bg-foreground text-background hover:bg-foreground/90"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      onClick={() => window.open("mailto:sponsors@blaniel.com", "_blank")}
                    >
                      Empezar con {pkg.tier}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Add-ons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-4xl mx-auto mt-16"
        >
          <Card className="p-8 border border-border bg-card/50 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-4">Add-ons Disponibles</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="text-lg font-semibold mb-1">
                  Influencer Amplification - $5,000/mes
                </div>
                <p className="text-sm text-muted-foreground">
                  Personajes con &gt;50K conversations/mes. Higher visibility y engagement
                  garantizado.
                </p>
              </div>
              <div>
                <div className="text-lg font-semibold mb-1">
                  Custom Character Creation - $15,000 one-time
                </div>
                <p className="text-sm text-muted-foreground">
                  Creamos personaje branded específico para tu marca. Ejemplo: "Nike Running
                  Coach".
                </p>
              </div>
              <div>
                <div className="text-lg font-semibold mb-1">
                  Performance Guarantee - +20% fee
                </div>
                <p className="text-sm text-muted-foreground">
                  Garantía de X conversions o refund parcial. Requires tracking pixel
                  integration.
                </p>
              </div>
              <div>
                <div className="text-lg font-semibold mb-1">
                  Exclusividad de Categoría - Custom pricing
                </div>
                <p className="text-sm text-muted-foreground">
                  Bloquea competidores de tu vertical. Pricing depende de categoría y
                  duración.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-4">
            Todos los planes incluyen transparencia total, disclosure FTC-compliant, y
            derecho a pausar/cancelar con 30 días notice.
          </p>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.open("mailto:sponsors@blaniel.com", "_blank")}
          >
            Hablemos sobre tu caso específico
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
