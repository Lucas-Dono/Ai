"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { LandingDemoChat } from "./LandingDemoChat";

export function HeroSection() {
  const [videoOpen, setVideoOpen] = useState(false);
  const t = useTranslations("landing.hero");
  const tModal = useTranslations("landing.hero.videoModal");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/20">
      {/* Subtle grid background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-7 sm:space-y-8 lg:pr-8"
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
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                {t("title")}{" "}
                <span className="text-muted-foreground">
                  {t("titleHighlight")}
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Compañeros virtuales con{" "}
                <span className="text-foreground font-medium">{t("emotionsStrong")}</span>, memoria
                de largo plazo y mundos interactivos. Sin censura, sin límites.
              </p>
            </div>

            {/* CTAs - UN SOLO CTA */}
            <div className="flex flex-col gap-3 pt-2">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                >
                  {t("ctaPrimary")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              {/* Trust chips (mobile-first) */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs px-3 py-1 rounded-full bg-muted/60 border border-border/60 text-muted-foreground">
                  Sin tarjeta
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-muted/60 border border-border/60 text-muted-foreground">
                  3 mensajes gratis
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-muted/60 border border-border/60 text-muted-foreground">
                  Memoria real
                </span>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("trustLine")}
              </p>
            </div>
          </motion.div>

          {/* Right Column - Live Demo Chat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative w-full max-w-none mt-8 lg:mt-0 lg:ml-8"
          >
            <LandingDemoChat />

            {/* Floating badges - Professional style */}
            <div className="absolute -top-2 -right-2 backdrop-blur-xl bg-primary/10 border border-primary/20 rounded-2xl px-3 py-1.5 text-xs font-medium shadow-lg text-primary">
              ✨ Chat real con IA
            </div>

            {/* Subtle accent glow */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary/5 to-transparent blur-3xl" />
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      {videoOpen && (
        <div
          className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          onClick={() => setVideoOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-4xl aspect-video bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-xl mb-4 text-muted-foreground">{tModal("comingSoon")}</p>
                <Button variant="outline" onClick={() => setVideoOpen(false)}>
                  {tModal("close")}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
