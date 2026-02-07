"use client";

import { motion } from "framer-motion";
import { LandingDemoChat } from "./LandingDemoChat";
import { useTranslations } from "next-intl";

export function InteractiveDemoSection() {
  const t = useTranslations("landing.demoSection");

  return (
    <section className="py-12 sm:py-16 md:py-24 lg:hidden relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm font-medium text-primary">
              ✨ Prueba en vivo
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            Conversa con{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Luna 🌙
            </span>
          </h2>

          <p className="text-lg text-muted-foreground">
            Experimenta la diferencia. Interactúa con una IA que realmente entiende emociones.
          </p>
        </motion.div>

        {/* Demo Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto relative"
        >
          <LandingDemoChat />

          {/* Floating badge */}
          <div className="absolute -top-2 -right-2 backdrop-blur-xl bg-primary/10 border border-primary/20 rounded-2xl px-3 py-1.5 text-xs font-medium shadow-lg text-primary hidden sm:block">
            💬 Chat real con IA
          </div>

          {/* Subtle accent glow */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary/5 to-transparent blur-3xl" />
        </motion.div>

        {/* Bottom hint */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-muted-foreground">
            👆 Escribe un mensaje para expandir el chat y ver la magia en acción
          </p>
        </motion.div>
      </div>
    </section>
  );
}
