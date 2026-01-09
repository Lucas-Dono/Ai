"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function VisualExamples() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const examples = [
    {
      category: "Sportswear",
      brand: "Zapatillas Running Pro",
      character: "Marcus Washington",
      scenario: "Consejo de running para principiantes",
      image: {
        title: "Marcus usando zapatillas deportivas",
        context: "Corriendo en el parque - amanecer",
        src: "/landing/sport-example.png",
      },
      conversation: {
        user: "Estoy tratando de empezar a correr pero siempre me duelen las rodillas",
        ai: "Mirá, yo tuve el mismo problema cuando empecé hace 5 años. Dos cosas me salvaron: técnica correcta (pisada medio-pie, no talón) y zapatillas con buena amortiguación.",
        sponsored:
          "Yo uso [Marca Running Pro] - no son las más caras pero tienen excelente cushioning para principiantes. La tecnología de absorción en el talón hace diferencia real.",
      },
      metrics: {
        engagement: "Alto",
        sentiment: "85%+ positivo",
        ctr: "1.0-1.5%",
      },
    },
    {
      category: "Bebidas",
      brand: "Bebida Artesanal Premium",
      character: "Sofía Volkov",
      scenario: "Conversación social post-ensayo",
      image: {
        title: "Sofía en bar con amigos",
        context: "Ambiente relajado - noche urbana",
        src: "/landing/bar-example.png",
      },
      conversation: {
        user: "¿Qué hiciste después del ensayo?",
        ai: "Nos juntamos con el equipo en un bar cerca del teatro. Necesitaba desconectar después de 6 horas intensas de coreografía.",
        sponsored:
          "Me pedí una [Bebida Premium] - un clásico que nunca falla para relajarse. Tiene un sabor único y es perfecto para compartir con amigos después de un día pesado.",
      },
      metrics: {
        engagement: "Alto",
        sentiment: "80%+ positivo",
        ctr: "0.8-1.2%",
      },
    },
    {
      category: "Food & Restaurants",
      brand: "Restaurante Fusión Asiática",
      character: "Yuki Tanaka",
      scenario: "Recomendación de comida después de coding session",
      image: {
        title: "Yuki disfrutando comida asiática",
        context: "Plato de ramen - ambiente casual",
        src: "/landing/restaurant-example.png",
      },
      conversation: {
        user: "Estoy muerto después de 8 horas seguidas programando. ¿Qué pedís cuando no tenés ganas de cocinar?",
        ai: "Te entiendo perfectamente. Cuando termino sesiones largas de código, lo último que quiero es cocinar.",
        sponsored:
          "Siempre pido de [Restaurante Fusión] - tienen un ramen que es increíble y llega en 30 minutos. Es perfecto para recargar energías sin tener que salir de casa. El pollo katsu también está buenísimo.",
      },
      metrics: {
        engagement: "Muy alto",
        sentiment: "85%+ positivo",
        ctr: "1.2-1.8%",
      },
    },
  ];

  // Auto-play functionality
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % examples.length);
    }, 6000); // Cambia cada 6 segundos

    return () => clearInterval(interval);
  }, [isPaused, examples.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % examples.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + examples.length) % examples.length);
  };

  const currentExample = examples[currentIndex];

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
            Ejemplos de{" "}
            <span className="text-blue-600">Product Placement</span>
          </h2>
          <p className="text-lg text-foreground/80">
            Así es como tu marca aparece naturalmente en conversaciones auténticas
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto relative">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 -translate-x-2 sm:-translate-x-4 lg:-translate-x-12 text-muted-foreground hover:text-foreground transition-all hover:scale-125"
            aria-label="Ejemplo anterior"
          >
            <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} />
          </button>

          <button
            onClick={handleNext}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 translate-x-2 sm:translate-x-4 lg:translate-x-12 text-muted-foreground hover:text-foreground transition-all hover:scale-125"
            aria-label="Siguiente ejemplo"
          >
            <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} />
          </button>

          {/* Carousel Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <Card className="overflow-hidden border border-border hover:border-foreground/20 transition-all duration-300 bg-card/50 backdrop-blur-sm">
                <div className="grid md:grid-cols-2 gap-0 min-h-[600px]">
                  {/* Left: Visual Mockup */}
                  <div className="relative bg-muted/20 p-8 flex items-center justify-center h-full">
                    <div className="relative w-full max-w-sm">
                      {/* Image or placeholder */}
                      <div className="aspect-square rounded-2xl overflow-hidden relative group border-2 border-border">
                        {currentExample.image.src ? (
                          // Real image
                          <Image
                            src={currentExample.image.src}
                            alt={currentExample.image.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          // Placeholder
                          <>
                            <div className="absolute inset-0 border-2 border-dashed border-muted-foreground/30 bg-gradient-to-br from-muted/40 to-muted/10 flex items-center justify-center">
                              <div className="text-center p-8 z-10">
                                <div className="text-sm text-muted-foreground mb-2 font-medium">
                                  AI-Generated Image
                                </div>
                                <div className="text-lg font-semibold mb-1">
                                  {currentExample.image.title}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {currentExample.image.context}
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-all duration-300 pointer-events-none" />

                        {/* Sponsored badge */}
                        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg z-20">
                          🏷️ Sponsored
                        </div>

                        {/* Product badge */}
                        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg z-20">
                          {currentExample.brand}
                        </div>
                      </div>

                      {/* Category tag */}
                      <div className="mt-4 flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {currentExample.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {currentExample.character}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Conversation + Metrics */}
                  <div className="p-8 flex flex-col justify-between h-full">
                    {/* Scenario */}
                    <div className="mb-6">
                      <div className="text-xs font-bold text-foreground/60 uppercase tracking-wide mb-2">
                        Escenario
                      </div>
                      <div className="text-sm font-medium text-foreground">{currentExample.scenario}</div>
                    </div>

                    {/* Conversation */}
                    <div className="space-y-3 mb-6 flex-1">
                      {/* User message */}
                      <div className="space-y-1">
                        <div className="text-xs text-foreground/60 font-medium">Usuario:</div>
                        <div className="bg-muted/70 rounded-xl rounded-tr-sm px-4 py-2.5 text-sm text-foreground">
                          {currentExample.conversation.user}
                        </div>
                      </div>

                      {/* AI response */}
                      <div className="space-y-1">
                        <div className="text-xs text-foreground/60 font-medium">
                          {currentExample.character}:
                        </div>
                        <div className="bg-muted/70 rounded-xl rounded-tl-sm px-4 py-2.5 text-sm text-foreground">
                          {currentExample.conversation.ai}
                        </div>
                      </div>

                      {/* Sponsored mention */}
                      <div className="space-y-1">
                        <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-500/40 rounded-xl rounded-tl-sm px-4 py-3 text-sm">
                          <div className="mb-2">
                            <Badge className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white">
                              🏷️ Recomendación patrocinada
                            </Badge>
                          </div>
                          <div className="text-foreground">{currentExample.conversation.sponsored}</div>
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="pt-6 border-t border-border">
                      <div className="text-xs font-bold text-foreground/60 uppercase tracking-wide mb-3">
                        Performance
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-lg font-bold text-blue-600">
                            {currentExample.metrics.engagement}
                          </div>
                          <div className="text-xs text-foreground/70 font-medium">Engagement</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-600">{currentExample.metrics.sentiment}</div>
                          <div className="text-xs text-foreground/70 font-medium">Sentiment</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-600">{currentExample.metrics.ctr}</div>
                          <div className="text-xs text-foreground/70 font-medium">CTR</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Indicators (Dots) */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {examples.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-blue-600"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Ir al ejemplo ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-foreground/70 max-w-2xl mx-auto">
            Cada mención está cuidadosamente contextualizada para agregar valor genuino a la
            conversación. Basado en benchmarks de industria, <span className="text-foreground font-semibold">85%+ de usuarios continúan la conversación</span> - la señal más
            clara de que no se siente como publicidad intrusiva.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
