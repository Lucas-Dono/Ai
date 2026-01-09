"use client";

import { motion } from "framer-motion";
import { Brain, Clock, Globe, MessageSquare, Palette, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function FeaturesGrid() {
  const t = useTranslations("landing.features");

  const features = [
    {
      icon: Clock,
      title: t("list.memory.title"),
      description: t("list.memory.description"),
      tier: t("list.memory.tier"),
    },
    {
      icon: Brain,
      title: t("list.emotions.title"),
      description: t("list.emotions.description"),
      tier: t("list.emotions.tier"),
    },
    {
      icon: Palette,
      title: t("list.personalities.title"),
      description: t("list.personalities.description"),
      tier: t("list.personalities.tier"),
    },
    {
      icon: Heart,
      title: t("list.relationships.title"),
      description: t("list.relationships.description"),
      tier: t("list.relationships.tier"),
    },
    {
      icon: MessageSquare,
      title: t("list.proactive.title"),
      description: t("list.proactive.description"),
      tier: t("list.proactive.tier"),
    },
    {
      icon: Globe,
      title: t("list.worlds.title"),
      description: t("list.worlds.description"),
      tier: t("list.worlds.tier"),
    },
  ];

  const [featured, ...rest] = features;

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
            {t("title")}{" "}
            <span className="text-muted-foreground">
              {t("titleHighlight")}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          {/* Featured card (mobile-first) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="group relative overflow-hidden rounded-[28px] border border-border bg-card/50 backdrop-blur-sm p-7 sm:p-8 transition-all duration-300 hover:border-foreground/20">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center transition-colors duration-300 group-hover:bg-foreground">
                  <featured.icon className="w-6 h-6 text-foreground transition-colors duration-300 group-hover:text-background" />
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">
                    {featured.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {featured.description}
                  </p>

                  <div className="mt-4">
                    <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                      {featured.tier}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Compact grid */}
          <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card className="group h-full bg-card/50 backdrop-blur-sm border border-border hover:border-foreground/20 transition-all duration-300 p-4">
                    <div className="flex flex-col gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center transition-colors duration-300 group-hover:bg-foreground">
                        <Icon className="w-5 h-5 text-foreground transition-colors duration-300 group-hover:text-background" />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {feature.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {feature.description}
                        </p>

                        <div className="pt-3">
                          <span className="text-[11px] px-2 py-1 rounded-md bg-muted text-muted-foreground">
                            {feature.tier}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
