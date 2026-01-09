"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Calendar, TrendingUp, Sparkles } from "lucide-react";
import Image from "next/image";

export function SponsorsHero() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/20 py-12 lg:py-16 max-h-[700px]:py-8 max-h-[700px]:lg:py-10">
      {/* Subtle grid background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-h-[700px]:gap-6 max-h-[700px]:lg:gap-8 items-center max-w-7xl mx-auto">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 max-h-[700px]:space-y-3 lg:pr-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                🚧 Programa Beta - Lanzamiento Q2 2026
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-2 max-h-[700px]:space-y-1.5">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl max-h-[700px]:text-4xl max-h-[700px]:sm:text-5xl max-h-[700px]:lg:text-6xl font-bold tracking-tight leading-[1.05]" style={{ textWrap: 'balance' } as React.CSSProperties}>
                Publicidad Nativa en Conversaciones de IA
              </h1>

              {/* Sub-headline */}
              <p className="text-2xl sm:text-3xl max-h-[700px]:text-xl max-h-[700px]:sm:text-2xl font-semibold text-foreground/90 leading-snug max-w-2xl">
                Integrada de forma orgánica cuando el usuario ya está comprometido.
              </p>

              {/* Párrafo descriptivo */}
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl pt-0.5">
                Un formato de publicidad contextual que se integra de manera natural en conversaciones activas de IA emocional.{" "}
                <span className="text-foreground font-medium">Sin banners ignorados.</span>{" "}
                <span className="text-foreground font-medium">Sin interrupciones.</span>{" "}
                <span className="text-foreground font-medium">Solo relevancia en el momento correcto.</span>
              </p>

              {/* Highlight box */}
              <div className="p-3.5 max-h-[700px]:p-3 rounded-xl border border-border bg-muted/50 max-w-2xl mt-1.5 max-h-[700px]:mt-1">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">Los usuarios no odian la publicidad.</span>{" "}
                  Odian las interrupciones. Nuestra publicidad agrega valor cuando el usuario ya está buscando soluciones —{" "}
                  <span className="font-semibold text-foreground">por eso funciona.</span>
                </p>
              </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-3 gap-6 max-h-[700px]:gap-4 pt-0">
              <div className="space-y-1 max-h-[700px]:space-y-0.5">
                <div className="text-4xl max-h-[700px]:text-3xl font-bold text-blue-600">25-35 min</div>
                <div className="text-sm max-h-[700px]:text-xs text-muted-foreground">Sesión promedio (ref: Character.AI)</div>
              </div>
              <div className="space-y-1 max-h-[700px]:space-y-0.5">
                <div className="text-4xl max-h-[700px]:text-3xl font-bold text-blue-600">85%+</div>
                <div className="text-sm max-h-[700px]:text-xs text-muted-foreground">Continúan conversando (benchmark industria)</div>
              </div>
              <div className="space-y-1 max-h-[700px]:space-y-0.5">
                <div className="text-4xl max-h-[700px]:text-3xl font-bold text-blue-600">3–5×</div>
                <div className="text-sm max-h-[700px]:text-xs text-muted-foreground">ROI proyectado vs display ads</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 max-h-[700px]:gap-2 pt-0">
              <Button
                size="lg"
                className="h-14 max-h-[700px]:h-12 px-8 max-h-[700px]:px-6 text-lg max-h-[700px]:text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
                onClick={() => window.open("mailto:sponsors@blaniel.com?subject=Solicitud Early Access - Programa de Sponsors", "_blank")}
              >
                <Sparkles className="mr-2 h-5 w-5 max-h-[700px]:h-4 max-h-[700px]:w-4" />
                Solicitar Early Access
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 max-h-[700px]:h-12 px-8 max-h-[700px]:px-6 text-lg max-h-[700px]:text-base font-semibold border-2 hover:bg-muted transition-all"
                onClick={() => {
                  const calculator = document.getElementById("investment-calculator");
                  calculator?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                <TrendingUp className="mr-2 h-5 w-5 max-h-[700px]:h-4 max-h-[700px]:w-4" />
                Ver Precios
              </Button>
            </div>
          </motion.div>

          {/* Right Column - Visual Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative lg:ml-8 max-h-[700px]:hidden lg:max-h-[700px]:block"
          >
            {/* Main conversation mockup */}
            <div className="relative rounded-2xl border border-border shadow-2xl overflow-hidden bg-card max-h-[700px]:scale-95">
              <div className="aspect-[4/3] bg-gradient-to-br from-muted/30 to-muted/10 p-6 max-h-[700px]:p-4">
                <div className="h-full rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 max-h-[700px]:p-4 flex flex-col">
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src="/personajes/marcus/cara.webp"
                        alt="Marcus Washington"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Marcus Washington</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Activo ahora
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 space-y-3 py-4 overflow-hidden">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src="/personajes/marcus/cara.webp"
                          alt="Marcus"
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                        <p className="text-foreground text-sm leading-relaxed">
                          Mirá, yo tuve el mismo problema cuando empecé a correr. Dos cosas me salvaron: técnica correcta y zapatillas con buena amortiguación.
                        </p>
                      </div>
                    </div>

                    {/* Sponsored mention */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src="/personajes/marcus/cara.webp"
                          alt="Marcus"
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%] border-2 border-blue-500/30">
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-full">
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
                        <TrendingUp className="w-3 h-3 text-blue-600" />
                        <span className="font-medium">Engagement elevado (benchmark)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="font-medium">85%+ continúan conversando</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute top-4 right-4 backdrop-blur-xl bg-background/95 border-2 border-foreground/20 rounded-2xl px-4 py-2 text-xs font-semibold shadow-lg">
                <span className="text-foreground">Contextual & Orgánico</span>
              </div>
            </div>

            {/* Subtle accent glow */}
            <div className="absolute inset-0 -z-10 bg-blue-500/5 blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
