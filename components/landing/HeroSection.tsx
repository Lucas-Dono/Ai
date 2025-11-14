"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function HeroSection() {
  const [videoOpen, setVideoOpen] = useState(false);
  const t = useTranslations("landing.hero");
  const tChat = useTranslations("landing.hero.chatPreview");
  const tModal = useTranslations("landing.hero.videoModal");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/20">
      {/* Subtle grid background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 py-20 sm:py-32">
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
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-foreground">
                {t("badge")}
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                {t("title")}{" "}
                <span className="text-muted-foreground">
                  {t("titleHighlight")}
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
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

              <p className="text-sm text-muted-foreground">
                {t("trustLine")}
              </p>
            </div>
          </motion.div>

          {/* Right Column - Product Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative lg:ml-8"
          >
            {/* Main product shot */}
            <div className="relative rounded-2xl border border-border shadow-2xl overflow-hidden bg-card">
              <div className="aspect-[4/3] bg-muted/30 p-6">
                <div className="h-full rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 flex flex-col">
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/40" />
                    <div>
                      <div className="font-semibold text-foreground">{tChat("aiName")}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {tChat("status")}
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 space-y-3 py-4 overflow-hidden">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[75%]">
                        <p className="text-foreground text-sm leading-relaxed">
                          {tChat("message1")}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <div className="bg-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%]">
                        <p className="text-background text-sm leading-relaxed">
                          {tChat("message2")}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[75%]">
                        <p className="text-foreground text-sm leading-relaxed">
                          {tChat("message3")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                      <span>Emotional state: Joy (0.85) + Anticipation (0.72)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges - Professional style */}
              <div className="absolute top-4 right-4 backdrop-blur-xl bg-background/80 border border-border rounded-2xl px-3 py-1.5 text-xs font-medium shadow-lg">
                {tChat("memoryIndicator")}
              </div>
              <div className="absolute bottom-20 left-4 backdrop-blur-xl bg-background/80 border border-border rounded-2xl px-3 py-1.5 text-xs font-medium shadow-lg">
                {tChat("emotionIndicator")}
              </div>
            </div>

            {/* Subtle accent glow */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-foreground/5 to-transparent blur-3xl" />
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
