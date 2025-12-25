"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Calendar, TrendingUp, Sparkles } from "lucide-react";

export function SponsorsHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/20">
      {/* Subtle grid background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 lg:pr-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-muted/50">
              <Sparkles className="w-4 h-4 text-foreground" />
              <span className="text-sm font-medium text-foreground">
                Publicidad Nativa que Convierte
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                Conectá con Usuarios{" "}
                <span className="text-muted-foreground">
                  Durante las Conversaciones que Más Importan
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Llega a miles de usuarios comprometidos a través de{" "}
                <span className="text-foreground font-medium">product placement orgánico</span>{" "}
                en conversaciones de IA. Engagement{" "}
                <span className="text-foreground font-medium">10-50x mayor</span> que display ads.
              </p>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <div className="text-3xl font-bold">10-50x</div>
                <div className="text-sm text-muted-foreground">Mayor engagement</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">100%</div>
                <div className="text-sm text-muted-foreground">Visto en conversación</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">71%</div>
                <div className="text-sm text-muted-foreground">Sentiment positivo</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">$0.01-0.05</div>
                <div className="text-sm text-muted-foreground">Revenue/impression</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                className="h-14 px-8 text-lg font-semibold bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all"
                onClick={() => window.open("mailto:sponsors@blaniel.com", "_blank")}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Demo
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
            </div>

            <p className="text-sm text-muted-foreground">
              No interrumpas. <span className="text-foreground font-medium">Recomienda.</span>
            </p>
          </motion.div>

          {/* Right Column - Visual Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative lg:ml-8"
          >
            {/* Main conversation mockup */}
            <div className="relative rounded-2xl border border-border shadow-2xl overflow-hidden bg-card">
              <div className="aspect-[4/3] bg-gradient-to-br from-muted/30 to-muted/10 p-6">
                <div className="h-full rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 flex flex-col">
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                    <div>
                      <div className="font-semibold text-foreground">Marcus Washington</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Activo ahora
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 space-y-3 py-4 overflow-hidden">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex-shrink-0" />
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                        <p className="text-foreground text-sm leading-relaxed">
                          Mirá, yo tuve el mismo problema cuando empecé a correr. Dos cosas me salvaron: técnica correcta y zapatillas con buena amortiguación.
                        </p>
                      </div>
                    </div>

                    {/* Sponsored mention */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex-shrink-0" />
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%] border-2 border-blue-500/20">
                        <div className="mb-2">
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
                            🏷️ Recomendación patrocinada
                          </span>
                        </div>
                        <p className="text-foreground text-sm leading-relaxed">
                          Yo uso <span className="font-semibold">Nike Pegasus</span> - tienen excelente cushioning para principiantes. El Zoom Air en el talón hace diferencia real.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <div className="bg-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%]">
                        <p className="text-background text-sm leading-relaxed">
                          ¿Dónde las compraste?
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>+87% engagement</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>94% continúan conversando</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute top-4 right-4 backdrop-blur-xl bg-background/90 border border-border rounded-2xl px-3 py-1.5 text-xs font-medium shadow-lg">
                Contextual & Orgánico
              </div>
            </div>

            {/* Subtle accent glow */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
