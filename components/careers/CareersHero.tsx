"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function CareersHero() {
  const t = useTranslations("careers.hero");

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/20 py-20 sm:py-32">
      {/* Subtle grid background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8 max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-muted/50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-foreground">
              {t("badge")}
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              {t("title")} <span className="text-muted-foreground">{t("titleHighlight")}</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {t("subtitle")}
            </p>
          </div>

          {/* Accent glow */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-foreground/5 to-transparent blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
