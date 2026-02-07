"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Quote, TrendingUp, Target, Users } from "lucide-react";

export function CaseStudies() {
  const placeholderStudies = [
    {
      brand: "Major Sportswear Brand",
      industry: "Sportswear & Fitness",
      quote:
        "Nuestro partnership con Blaniel generó 23% más consideration entre millennials en 3 meses. El engagement supera cualquier display ad que hayamos hecho.",
      role: "Marketing Director",
      metrics: [
        { label: "Brand Consideration", value: "+23%" },
        { label: "Engagement Rate", value: "1.4%" },
        { label: "Sentiment Score", value: "87% positivo" },
      ],
      logo: "placeholder", // Placeholder para logo
    },
    {
      brand: "Beverage Company",
      industry: "Food & Beverage",
      quote:
        "Por primera vez vimos users discutiendo orgánicamente nuestro producto en chats. El ROI fue 4.2x vs Instagram ads.",
      role: "CMO",
      metrics: [
        { label: "ROI vs Instagram Ads", value: "4.2x" },
        { label: "Organic Mentions", value: "+156%" },
        { label: "CTR", value: "0.9%" },
      ],
      logo: "placeholder",
    },
    {
      brand: "Tech Company",
      industry: "Technology & SaaS",
      quote:
        "El nivel de contexto y relevancia es imposible de lograr con publicidad tradicional. Esto es el futuro del marketing conversacional.",
      role: "Brand Manager",
      metrics: [
        { label: "Engagement", value: "+91%" },
        { label: "Quality Score", value: "9.2/10" },
        { label: "Conversions", value: "+34%" },
      ],
      logo: "placeholder",
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
            Case Studies{" "}
            <span className="text-muted-foreground">& Resultados Reales</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Brands líderes ya están viendo resultados extraordinarios
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-8">
          {placeholderStudies.map((study, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-8 border border-border hover:border-foreground/20 transition-all duration-300 bg-card/50 backdrop-blur-sm">
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Left: Logo & Brand info */}
                  <div className="flex flex-col justify-between">
                    {/* Placeholder logo */}
                    <div>
                      <div className="w-full h-20 rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 flex items-center justify-center mb-4">
                        <div className="text-xs text-muted-foreground text-center px-4">
                          Brand Logo<br />Placeholder
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-1">{study.brand}</h3>
                      <p className="text-sm text-muted-foreground">{study.industry}</p>
                    </div>

                    {/* Coming soon badge */}
                    <div className="mt-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-500/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          Case study detallado próximamente
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Quote */}
                  <div className="md:col-span-2">
                    <div className="mb-6">
                      <Quote className="w-8 h-8 text-muted-foreground/30 mb-3" />
                      <blockquote className="text-lg leading-relaxed italic">
                        "{study.quote}"
                      </blockquote>
                      <div className="mt-4 text-sm text-muted-foreground">
                        — {study.role}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                      {study.metrics.map((metric, mIndex) => (
                        <div key={mIndex}>
                          <div className="text-2xl font-bold text-emerald-600">
                            {metric.value}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Success Metrics Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-4xl mx-auto mt-16"
        >
          <Card className="p-8 border border-border bg-gradient-to-br from-emerald-500/5 to-blue-500/5 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-6 text-center">
              Promedios Across All Campaigns
            </h3>
            <div className="grid sm:grid-cols-4 gap-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <div className="text-3xl font-bold mb-1">+87%</div>
                <div className="text-xs text-muted-foreground">Engagement promedio</div>
              </div>
              <div className="text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-3xl font-bold mb-1">0.9%</div>
                <div className="text-xs text-muted-foreground">CTR promedio</div>
              </div>
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-3xl font-bold mb-1">94%</div>
                <div className="text-xs text-muted-foreground">
                  Continúan conversando
                </div>
              </div>
              <div className="text-center">
                <Quote className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-3xl font-bold mb-1">85%</div>
                <div className="text-xs text-muted-foreground">Sentiment positivo</div>
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
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Case studies detallados con nombres de brands, creative samples, y analytics
            completos estarán disponibles para prospects calificados bajo NDA.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
