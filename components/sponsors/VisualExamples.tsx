"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function VisualExamples() {
  const examples = [
    {
      category: "Sportswear",
      brand: "Nike / Adidas",
      character: "Marcus Washington",
      scenario: "Consejo de running para principiantes",
      image: {
        title: "Marcus usando Nike Pegasus",
        context: "Corriendo en el parque - amanecer",
      },
      conversation: {
        user: "Estoy tratando de empezar a correr pero siempre me duelen las rodillas",
        ai: "Mirá, yo tuve el mismo problema cuando empecé hace 5 años. Dos cosas me salvaron: técnica correcta (pisada medio-pie, no talón) y zapatillas con buena amortiguación.",
        sponsored:
          "Yo uso Nike Pegasus - no son las más caras ($130 aprox) pero tienen excelente cushioning para principiantes. El Zoom Air en el talón hace diferencia real.",
      },
      metrics: {
        engagement: "+94%",
        sentiment: "89% positivo",
        ctr: "1.2%",
      },
    },
    {
      category: "Bebidas",
      brand: "Fernet Branca",
      character: "Sofía Volkov",
      scenario: "Conversación social post-ensayo",
      image: {
        title: "Sofía en bar con amigos",
        context: "Ambiente relajado - noche porteña",
      },
      conversation: {
        user: "¿Qué hiciste después del ensayo?",
        ai: "Nos juntamos con el equipo en un bar cerca del teatro. Necesitaba desconectar después de 6 horas intensas de coreografía.",
        sponsored:
          "Me pedí un Fernet Branca con coca - clásico argentino que nunca falla para relajarse. Es amargo pero perfecto para compartir con amigos después de un día pesado.",
      },
      metrics: {
        engagement: "+87%",
        sentiment: "82% positivo",
        ctr: "0.9%",
      },
    },
    {
      category: "Tech & Audio",
      brand: "Spotify Premium",
      character: "Yuki Tanaka",
      scenario: "Compartiendo playlist de trabajo",
      image: {
        title: "Yuki trabajando con auriculares",
        context: "Espacio de trabajo creativo - focus mode",
      },
      conversation: {
        user: "¿Cómo te concentrás cuando tenés que programar por horas?",
        ai: "Tengo un ritual muy específico: apago notificaciones, café recién hecho, y música ambiente que no distraiga.",
        sponsored:
          "Uso Spotify Premium para mis playlists de focus - tengo una con mucho lo-fi y synthwave. La calidad sin ads es clave cuando necesito entrar en flow state por 4-5 horas.",
      },
      metrics: {
        engagement: "+91%",
        sentiment: "86% positivo",
        ctr: "1.4%",
      },
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
            Ejemplos Reales{" "}
            <span className="text-muted-foreground">de Product Placement</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Así es como tu marca aparece naturalmente en conversaciones auténticas
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-12">
          {examples.map((example, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border border-border hover:border-foreground/20 transition-all duration-300 bg-card/50 backdrop-blur-sm">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Left: Visual Mockup */}
                  <div className="relative bg-muted/20 p-8 flex items-center justify-center">
                    <div className="relative w-full max-w-sm">
                      {/* Image placeholder */}
                      <div className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-gradient-to-br from-muted/40 to-muted/10 flex items-center justify-center overflow-hidden relative group">
                        {/* Placeholder content */}
                        <div className="text-center p-8 z-10">
                          <div className="text-sm text-muted-foreground mb-2 font-medium">
                            AI-Generated Image
                          </div>
                          <div className="text-lg font-semibold mb-1">
                            {example.image.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {example.image.context}
                          </div>
                        </div>

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300" />

                        {/* Sponsored badge */}
                        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg z-20">
                          🏷️ Sponsored
                        </div>

                        {/* Product badge */}
                        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg z-20">
                          {example.brand}
                        </div>
                      </div>

                      {/* Category tag */}
                      <div className="mt-4 flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {example.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {example.character}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Conversation + Metrics */}
                  <div className="p-8 flex flex-col justify-between">
                    {/* Scenario */}
                    <div className="mb-6">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Escenario
                      </div>
                      <div className="text-sm">{example.scenario}</div>
                    </div>

                    {/* Conversation */}
                    <div className="space-y-3 mb-6 flex-1">
                      {/* User message */}
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Usuario:</div>
                        <div className="bg-muted/50 rounded-xl rounded-tr-sm px-4 py-2.5 text-sm">
                          {example.conversation.user}
                        </div>
                      </div>

                      {/* AI response */}
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {example.character}:
                        </div>
                        <div className="bg-muted/50 rounded-xl rounded-tl-sm px-4 py-2.5 text-sm">
                          {example.conversation.ai}
                        </div>
                      </div>

                      {/* Sponsored mention */}
                      <div className="space-y-1">
                        <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-500/30 rounded-xl rounded-tl-sm px-4 py-3 text-sm">
                          <div className="mb-2">
                            <Badge className="text-xs bg-blue-600 hover:bg-blue-700">
                              🏷️ Recomendación patrocinada
                            </Badge>
                          </div>
                          <div>{example.conversation.sponsored}</div>
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="pt-6 border-t border-border">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Performance
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-lg font-bold text-emerald-600">
                            {example.metrics.engagement}
                          </div>
                          <div className="text-xs text-muted-foreground">Engagement</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{example.metrics.sentiment}</div>
                          <div className="text-xs text-muted-foreground">Sentiment</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{example.metrics.ctr}</div>
                          <div className="text-xs text-muted-foreground">CTR</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Cada mención está cuidadosamente contextualizada para agregar valor genuino a la
            conversación. Los usuarios continúan chateando en 94% de los casos - la señal más
            clara de que no se siente como publicidad intrusiva.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
