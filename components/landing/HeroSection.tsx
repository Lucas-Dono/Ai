"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LandingDemoChat } from "./LandingDemoChat";
import { trackEvent } from "@/lib/analytics/track-client";
import { LandingEventType } from "@/lib/analytics/types";

export function HeroSection() {
  const t = useTranslations("landing.hero");
  const router = useRouter();

  const handleCtaPrimary = async () => {
    // Track event first
    trackEvent({
      eventType: LandingEventType.CTA_PRIMARY,
      metadata: {
        ctaText: t('ctaPrimary'),
        position: 'hero',
        section: 'top',
      },
    }).catch(() => {});

    // Then navigate
    router.push('/dashboard');
  };

  return (
    <section className="relative min-h-[70vh] md:min-h-screen flex items-start md:items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/20">
      {/* Subtle grid background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Spotlight effect - Mobile only */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[60%] lg:hidden pointer-events-none -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-30%,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.03)_40%,rgba(0,0,0,0)_70%)]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 pt-12 pb-0 sm:pt-12 sm:pb-12 md:py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-10 lg:space-y-8 lg:pr-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 lg:px-3 lg:py-1.5 rounded-full border border-border/50 bg-muted/50">
              <div className="w-2 h-2 lg:w-1.5 lg:h-1.5 rounded-full bg-emerald-500" />
              <span className="text-base lg:text-sm font-medium text-foreground">
                {t("badge")}
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-5 lg:space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                <span className="text-foreground/60">
                  {t("title")}{" "}
                </span>
                <span className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {t("titleHighlight")}
                </span>
              </h1>

              <p className="text-xl sm:text-xl md:text-xl lg:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                {t("subtitle")}
              </p>
            </div>

            {/* CTAs - UN SOLO CTA */}
            <div className="flex flex-col gap-4 lg:gap-3 pt-2">
              <Button
                size="lg"
                onClick={handleCtaPrimary}
                className="h-16 lg:h-14 px-8 text-xl lg:text-lg font-semibold bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                {t("ctaPrimary")}
                <ArrowRight className="ml-2 h-6 w-6 lg:h-5 lg:w-5" />
              </Button>

              <p className="text-base lg:text-sm text-muted-foreground">
                {t("trustLine")}
              </p>
            </div>
          </motion.div>

          {/* Right Column - Live Demo Chat - DESKTOP ONLY */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative hidden lg:block lg:ml-8"
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
    </section>
  );
}
