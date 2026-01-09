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
      question: "¿Cuándo lanza el programa y cómo funciona el early access?",
      answer:
        "Lanzamiento oficial está planeado para Q2 2026. Sin embargo, estamos aceptando un número limitado de early access sponsors (5-10 brands) para fase beta. Los early adopters obtienen precios beta significativamente más bajos que se mantendrán aunque los precios públicos aumenten después del lanzamiento. También reciben soporte dedicado, input directo en el roadmap del producto, y la oportunidad de ser parte de nuestros case studies de lanzamiento.",
    },
    {
      question: "¿Los usuarios se molestan con las menciones patrocinadas?",
      answer:
        "Todo lo contrario. Cuando la publicidad es contextual y transparente, los usuarios la valoran. Imaginate: un usuario pregunta sobre botellas de agua y el personaje responde 'Te recomiendo BlueX, tienen excelente capacidad térmica [🏷️ Recomendación patrocinada]'. El usuario YA está buscando exactamente esa recomendación. No es interrupción — es valor agregado. Benchmarks de industria (Character.AI, Replika) muestran que 70-75% de usuarios aprueban publicidad contextual, y 85%+ continúan la conversación normalmente. El disclosure transparente genera confianza, no rechazo.",
    },
    {
      question: "¿Cómo funciona el pricing? ¿Hay mínimos?",
      answer:
        "El pricing es flexible y basado en impresiones (CPM), similar a Facebook/Google Ads. Podés empezar desde $100/mes durante la fase beta. Usá la calculadora en esta página para ver exactamente cuántas impresiones obtenés según tu presupuesto y tipo de publicidad (texto, imagen, o ambos). No hay mínimos estrictos de duración - recomendamos al menos 2-3 meses para optimization, pero podés pausar o ajustar tu presupuesto mensualmente.",
    },
    {
      question: "¿Cómo miden el ROI de las campañas?",
      answer:
        "Proveemos un dashboard en tiempo real con métricas completas: impresiones totales, impresiones efectivas (vistas por usuarios activos), engagement rate (usuarios que continúan conversación), sentiment analysis (positivo/neutral/negativo), y CPM real. Durante la fase beta, trabajamos mano a mano con cada sponsor para optimizar el rendimiento. Si integrás nuestro tracking pixel, también podés trackear conversiones directas y calcular ROAS (Return on Ad Spend) exacto.",
    },
    {
      question: "¿Puedo elegir qué personajes mencionan mi marca?",
      answer:
        "Absolutamente. El proceso de onboarding incluye una sesión de character matching donde revisamos juntos qué personajes tienen mejor fit con tu brand. Consideramos personalidad, audiencia, contextos naturales de uso, y alignment con valores de marca. Tenés veto power sobre cualquier personaje, y podés solicitar agregar/remover personajes durante la campaña. Para presupuestos enterprise ($5k+/mes), también discutimos la posibilidad de crear personajes custom.",
    },
    {
      question: "¿Qué incluye el programa beta?",
      answer:
        "Los early access sponsors reciben: (1) Precios beta bloqueados - aunque los precios suban después del lanzamiento, tu pricing se mantiene, (2) Soporte dedicado con respuesta en <24hs, (3) Input directo en features y roadmap, (4) Prioridad en selección de personajes populares, (5) Oportunidad de aparecer en case studies y marketing de lanzamiento (opcional), (6) Analytics avanzados y optimization continua. Básicamente, sos partner estratégico, no solo cliente.",
    },
    {
      question: "¿Cómo funciona el disclosure y compliance legal?",
      answer:
        "Somos ultra-transparentes y FTC-compliant. Cada product mention incluye un badge claro '[🏷️ Recomendación patrocinada]' ANTES del endorsement (no después). El badge es visible, no requiere scrolling, y funciona perfecto en mobile. Tendremos una página pública listando todos nuestros sponsor partners. Los usuarios podrán opt-out de product placement en Settings. Todo el sistema está diseñado siguiendo guidelines de FTC y regulaciones de publicidad digital.",
    },
    {
      question: "¿Qué diferencia esto de influencer marketing tradicional?",
      answer:
        "Influencer marketing depende de que el influencer mencione tu producto en un post/story que sus followers tal vez vean (o tal vez no). Blaniel es diferente: las menciones ocurren DENTRO de conversaciones 1-on-1 donde el usuario está 100% engaged. No compite con otros 50 posts en un feed. Además, nuestros 'influencers' (los personajes AI) están disponibles 24/7, nunca tienen drama personal, y su messaging es consistente. Y el costo es fracción de influencer campaigns tradicionales (1 macro influencer cuesta $10K-50K por un solo post que dura 24 horas).",
    },
    {
      question: "¿Qué pasa si quiero pausar o cancelar durante el beta?",
      answer:
        "Tenés total flexibilidad durante fase beta. Podés ajustar tu presupuesto mes a mes, pausar temporalmente, o cancelar con 30 días notice. No hay penalidades. Si no estás viendo los resultados esperados, trabajamos juntos para optimizar (cambiar personajes, ajustar messaging, probar diferentes contextos). El objetivo del beta es probar qué funciona - necesitamos feedback honesto, no clientes atrapados en contratos largos.",
    },
    {
      question: "¿Necesito proveer assets creativos?",
      answer:
        "Para campañas de texto básicas, solo necesitamos descripción de tu producto/servicio y key messaging points. Para campañas con imágenes, recomendamos proveer product shots de alta calidad (o URLs de productos) que podemos integrar en las imágenes generadas por IA. Para presupuestos más grandes, trabajamos juntos en un creative brief - pero en todos los casos, nosotros nos encargamos de la ejecución. Vos solo aprobás el output final antes de que salga live.",
    },
    {
      question: "¿Cuántos sponsors van a aceptar en el beta?",
      answer:
        "Limitamos el beta a 5-10 brands cuidadosamente seleccionadas. La razón: queremos dar soporte dedicado a cada uno y asegurar resultados óptimos. Priorizamos brands con productos relevantes para audiencia tech/early-adopter, con presupuesto mínimo de $100-500/mes, y con disposición a dar feedback constructivo. Si tu marca califica y aplicás temprano, tenés muy buenas chances de entrar. Los slots se asignan por orden de aplicación y fit estratégico.",
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
            <span className="text-blue-600">de Brands</span>
          </h2>
          <p className="text-lg text-foreground/80">
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
                    <div className="text-sm text-foreground/70 leading-relaxed pt-2">
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
          <p className="text-sm text-foreground/70 max-w-2xl mx-auto">
            ¿Tenés otras preguntas? Envianos un email a{" "}
            <a
              href="mailto:sponsors@blaniel.com?subject=Consulta Programa Beta"
              className="text-blue-600 font-semibold hover:underline"
            >
              sponsors@blaniel.com
            </a>{" "}
            para discutir tu caso específico y ver si calificas para early access.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
