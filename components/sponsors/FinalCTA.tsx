"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Calendar, Download, ArrowRight } from "lucide-react";

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
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                    ¿Listo para Revolucionar{" "}
                    <span className="text-muted-foreground">
                      tu Estrategia de Marketing?
                    </span>
                  </h2>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                    Dejá atrás los display ads que nadie mira. Empezá a conectar con usuarios
                    durante las conversaciones que realmente importan.
                  </p>
                </motion.div>

                {/* Stats highlight */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-12 p-6 rounded-2xl bg-muted/50"
                >
                  <div>
                    <div className="text-3xl font-bold text-emerald-600">10-50x</div>
                    <div className="text-xs text-muted-foreground">Mayor engagement</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">71%</div>
                    <div className="text-xs text-muted-foreground">Sentiment positivo</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600">3-4x</div>
                    <div className="text-xs text-muted-foreground">ROI vs display</div>
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
                  className="h-14 px-8 text-lg font-semibold bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all"
                  onClick={() => window.open("mailto:sponsors@blaniel.com", "_blank")}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Agendar Demo de 30 min
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg font-semibold border-border hover:bg-muted"
                  onClick={() => alert("Media Kit descarga próximamente")}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Descargar Media Kit
                </Button>
              </motion.div>

              {/* Quick FAQ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="pt-8 border-t border-border"
              >
                <h3 className="text-sm font-semibold text-center mb-6 text-muted-foreground uppercase tracking-wide">
                  FAQ Rápido
                </h3>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 max-w-3xl mx-auto text-sm">
                  <div>
                    <p className="font-semibold mb-1">¿Cuánto cuesta?</p>
                    <p className="text-muted-foreground">
                      Desde $2,500/mes (Bronze) hasta $20K/mes (Gold)
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">¿Cómo miden ROI?</p>
                    <p className="text-muted-foreground">
                      Dashboard con impressions, engagement, sentiment, conversions
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">¿Puedo elegir personajes?</p>
                    <p className="text-muted-foreground">
                      Sí, juntos seleccionamos los de mejor fit
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">¿Hay mínimo de duración?</p>
                    <p className="text-muted-foreground">
                      3 meses recomendado para resultados óptimos
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">¿Exclusividad?</p>
                    <p className="text-muted-foreground">
                      Gold package incluye exclusividad de categoría
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">¿Cómo funciona disclosure?</p>
                    <p className="text-muted-foreground">
                      Badge claro "[Ad]" antes de cada mention, FTC-compliant
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Bottom trust line */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-center mt-12 pt-8 border-t border-border"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  Brands líderes ya están usando Blaniel para conectar con audiencias de alto
                  valor
                </p>
                <div className="flex justify-center items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>FTC Compliant</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Transparencia Total</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>ROI Medible</span>
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
          <p className="text-lg font-medium">
            No interrumpas.{" "}
            <span className="text-foreground font-bold">Recomienda.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
