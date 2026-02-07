"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Heart, Sparkles } from "lucide-react";

/**
 * Sección de Contribuidores/Donantes
 *
 * Esta sección mostrará los principales donantes y contribuidores del proyecto.
 * Por ahora muestra "Próximamente" mientras se implementa el sistema de donaciones.
 */
export function SocialProof() {
  // Placeholders para futuros donantes (6 espacios)
  const contributorPlaceholders = Array(6).fill(null);

  return (
    <section className="py-12 sm:py-16 md:py-24 lg:py-32 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="hidden sm:block text-center mb-16 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Apoyando el proyecto
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            Principales{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Contribuidores
            </span>
          </h2>

          <p className="text-lg text-muted-foreground">
            Reconocemos y agradecemos a quienes hacen posible este proyecto
          </p>
        </motion.div>

        {/* Contributors Grid - Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-5xl mx-auto"
        >
          <Card className="relative overflow-hidden border-2 border-dashed border-border bg-muted/30 backdrop-blur-sm">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50" />

            <div className="p-6 sm:p-8 md:p-12 lg:p-16">
              {/* Main Coming Soon Message */}
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-6"
                >
                  <Heart className="w-10 h-10 text-primary fill-primary/20" />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
                >
                  Sé parte de la historia
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8"
                >
                  Acá aparecerán los principales donadores de nuestra aplicación.
                  Si querés aparecer acá y recibir{" "}
                  <span className="text-foreground font-semibold">otros beneficios exclusivos</span>,
                  apoyá el proyecto:
                </motion.p>

                {/* Donation Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <a
                    href={process.env.NEXT_PUBLIC_DONATION_URL || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                    Apoyar el proyecto
                    <Sparkles className="w-5 h-5" />
                  </a>

                  <p className="text-xs text-muted-foreground mt-4">
                    {/* Descomenta la plataforma que elijas */}
                    {/* Buy Me a Coffee • Patreon */}
                    Proximamente disponible
                  </p>
                </motion.div>
              </div>

              {/* Placeholder Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {contributorPlaceholders.map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  >
                    <div className="aspect-square rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Info Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="mt-12 text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Los primeros 20 donadores tendrán un lugar destacado permanente
                  </span>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Bottom Text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground">
            Los donadores recibirán reconocimiento público, acceso anticipado a funciones y{" "}
            <span className="text-foreground font-medium">beneficios exclusivos</span> dentro de la plataforma
          </p>
        </motion.div>
      </div>
    </section>
  );
}
