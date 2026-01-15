"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Calendar, Download, ArrowRight, Sparkles } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-b from-muted/10 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <Card className="relative overflow-hidden border border-border shadow-2xl bg-card">
            <div className="p-8 md:p-12 lg:p-16">
              {/* Main content */}
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="mb-8"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 mb-4">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      Disponibilidad Limitada - Q2 2026
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                    Sé de los Primeros en{" "}
                    <span className="text-blue-600">
                      Acceder a Esta Tecnología
                    </span>
                  </h2>
                  <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
                    Únete al programa beta con precios exclusivos. Solo aceptamos sponsors de manera selectiva
                    para garantizar resultados óptimos para cada marca.
                  </p>
                </motion.div>

                {/* Stats highlight */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="grid grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto mb-12 p-4 sm:p-6 rounded-2xl bg-muted/50"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-xl sm:text-3xl md:text-3xl font-bold text-blue-600 whitespace-nowrap">25-35 min</div>
                    <div className="text-[9px] sm:text-xs text-muted-foreground mt-2 whitespace-nowrap">Sesión promedio</div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-xl sm:text-3xl md:text-3xl font-bold text-blue-600 whitespace-nowrap">70-80%</div>
                    <div className="text-[9px] sm:text-xs text-muted-foreground mt-2 whitespace-nowrap">Sentiment positivo</div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-xl sm:text-3xl md:text-3xl font-bold text-blue-600 whitespace-nowrap">3-5x</div>
                    <div className="text-[9px] sm:text-xs text-muted-foreground mt-2 whitespace-nowrap">ROI proyectado</div>
                  </div>
                </motion.div>
              </div>

              {/* Contact options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8"
              >
                {/* Email */}
                <Card className="p-6 border border-border hover:border-foreground/20 transition-all duration-300 bg-card/50 cursor-pointer group">
                  <div
                    onClick={() => window.open("mailto:sponsors@blaniel.com", "_blank")}
                    className="space-y-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Envianos un email y respondemos en 24 horas
                      </p>
                      <p className="text-sm font-mono text-blue-600">
                        sponsors@blaniel.com
                      </p>
                    </div>
                  </div>
                </Card>

                {/* WhatsApp */}
                <Card className="p-6 border border-border hover:border-foreground/20 transition-all duration-300 bg-card/50 cursor-pointer group">
                  <div
                    onClick={() =>
                      alert("WhatsApp business próximamente - por ahora usa email")
                    }
                    className="space-y-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">WhatsApp Business</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Chateá con nuestro equipo en tiempo real
                      </p>
                      <p className="text-sm text-muted-foreground italic">
                        Próximamente disponible
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Primary CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              >
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
                  onClick={() => window.open("mailto:sponsors@blaniel.com?subject=Solicitud Early Access - Programa de Sponsors", "_blank")}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Solicitar Early Access
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg font-semibold border-2 border-border hover:bg-muted"
                  onClick={() => window.open("mailto:sponsors@blaniel.com?subject=Solicitud Media Kit", "_blank")}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Solicitar Media Kit
                </Button>
              </motion.div>


              {/* Bottom trust line */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-center mt-12 pt-8 border-t border-border"
              >
                <p className="text-sm text-foreground/70 mb-4 font-medium">
                  Programa exclusivo para marcas que quieren liderar la próxima generación de publicidad digital
                </p>
                <div className="flex justify-center items-center gap-4 text-xs text-foreground/70">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="font-semibold">Disponibilidad Limitada</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="font-semibold">Precios Beta</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="font-semibold">Soporte Dedicado</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-blue-500/5 to-transparent" />
          </Card>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-lg font-medium text-foreground/70">
            Los slots se llenan rápido.{" "}
            <span className="text-blue-600 font-bold">No te quedes afuera.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
