"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

export function FAQ() {
  const faqs = [
    {
      question: "¿Cómo miden el ROI de las campañas?",
      answer:
        "Proveemos un dashboard en tiempo real con métricas completas: impressions (cuántas veces se mostró tu producto), unique reach (usuarios únicos alcanzados), CTR (click-through rate), engagement (usuarios que continuaron la conversación), y sentiment analysis (positivo/neutral/negativo). Si integrás nuestro tracking pixel, también trackeas conversiones directas y podés calcular ROAS (Return on Ad Spend) exacto. Adicionalmente, enviamos reportes semanales con insights y recomendaciones de optimización.",
    },
    {
      question: "¿Puedo elegir qué personajes mencionan mi marca?",
      answer:
        "Absolutamente. El proceso de onboarding incluye una sesión de character matching donde revisamos juntos qué personajes tienen mejor fit con tu brand. Consideramos personalidad, audiencia, contextos naturales de uso, y alignment con valores de marca. Tenés veto power sobre cualquier personaje, y podés solicitar agregar/remover personajes durante la campaña. Para Gold packages, incluso podemos crear un personaje custom específico para tu brand.",
    },
    {
      question: "¿Cuánto dura el commitment mínimo?",
      answer:
        "Bronze y Silver requieren 3 meses mínimo. Gold requiere 6 meses. La razón: las primeras 4-6 semanas son de optimization - testeamos diferentes contextos, timing, y messaging para encontrar qué funciona mejor. Los resultados reales y sustained vienen después de este período de learning. Dicho esto, podés pausar o cancelar con 30 días notice si genuinamente no está funcionando, con refund pro-rated del tiempo no usado.",
    },
    {
      question: "¿Hay exclusividad de categoría?",
      answer:
        "El Gold package incluye exclusividad de categoría por defecto. Esto significa que bloqueamos competidores directos durante la duración de tu campaña (ejemplo: si sos Nike, bloqueamos Adidas, Puma, etc.). Bronze y Silver no incluyen exclusividad - puede haber otro brand de tu vertical, pero NUNCA dos brands aparecen en el mismo personaje. También ofrecemos exclusividad add-on para Bronze/Silver con pricing custom basado en categoría y duración.",
    },
    {
      question: "¿Qué pasa si los usuarios se quejan o el sentiment es negativo?",
      answer:
        "Monitoreamos sentiment 24/7. Si detectamos >30% sentiment negativo o >10 user complaints en una semana, pausamos automáticamente la campaña y hacemos review. Analizamos qué salió mal (timing? messaging? fit del personaje?) y proponemos adjustments. Tu brand está protegido - nunca dejamos correr una campaña que esté dañando tu reputación. Además, cada mention tiene un 'Report' button que usuarios pueden usar, y investigamos cada reporte en 24 horas.",
    },
    {
      question: "¿Cómo funciona el disclosure y compliance legal?",
      answer:
        "Somos ultra-transparentes y FTC-compliant. Cada product mention incluye un badge claro '[🏷️ Recomendación patrocinada]' o '[Ad]' ANTES del endorsement (no después). El badge es visible, no requiere scrolling, y funciona perfecto en mobile. Tenemos una página pública listando todos nuestros sponsor partners actuales. Usuarios pueden opt-out de product placement en Settings. Todo esto está revisado por abogados especializados en advertising compliance.",
    },
    {
      question: "¿Pueden los personajes ser críticos de mi producto?",
      answer:
        "Sí, a veces - y esto es positivo. La autenticidad requiere que personajes puedan decir cosas como 'es caro pero worth it' o 'no es para todos, pero a mí me funciona'. Este tipo de feedback honesto aumenta la credibilidad dramáticamente. Obviamente no van a demoler tu producto, pero tampoco van a sonar como infomercial. Reviewamos y aprobamos juntos el messaging antes de lanzar, así que sabés exactamente qué tipo de mentions esperar.",
    },
    {
      question: "¿Qué diferencia esto de influencer marketing tradicional?",
      answer:
        "Influencer marketing depende de que el influencer mencione tu producto en un post/story que sus followers tal vez vean (o tal vez no). Blaniel es diferente: las menciones ocurren DENTRO de conversaciones 1-on-1 donde el usuario está 100% engaged. No compite con otros 50 posts en un feed. Además, nuestros 'influencers' (los personajes AI) están disponibles 24/7, nunca tienen drama personal, y su messaging es consistente. Y el costo es fracción de influencer campaigns tradicionales (1 macro influencer cuesta $10K-50K por un solo post que dura 24 horas).",
    },
    {
      question: "¿Puedo pausar o cancelar mi campaña?",
      answer:
        "Sí, con 30 días notice. Si hay razones genuinas (performance no cumple expectativas, cambio de strategy interna, budget cuts), podemos cancelar antes del commitment period con refund pro-rated del tiempo no usado. Si simplemente querés pausar por 1-2 meses (ejemplo: seasonal business), podemos pausar y reactivar cuando estés listo, extendiendo el período total acordado.",
    },
    {
      question: "¿Necesito proveer assets creativos?",
      answer:
        "Depende del package. Bronze: no necesario, trabajamos con info básica de producto. Silver: recomendamos proveer product images de alta calidad que podemos integrar en imágenes generadas por IA. Gold: sí, trabajamos juntos en creative brief completo - product shots, brand guidelines, key messaging, etc. En todos los casos, nuestro equipo se encarga de la ejecución creativa - vos solo aprobás el output final.",
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
            Preguntas Frecuentes{" "}
            <span className="text-muted-foreground">de Brands</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Todo lo que necesitás saber antes de empezar
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="p-8 border border-border bg-card/50 backdrop-blur-sm">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-sm text-muted-foreground leading-relaxed pt-2">
                      {faq.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-4">
            ¿Tenés otras preguntas? Agenda una llamada de 30 minutos con nuestro equipo para
            discutir tu caso específico.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
