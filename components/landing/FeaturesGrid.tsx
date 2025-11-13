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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="p-6 h-full border-border hover:border-foreground/20 transition-all duration-300 group bg-card/50 backdrop-blur-sm">
                  <div className="space-y-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                      <Icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                      {/* Tier badge */}
                      <div className="pt-2">
                        <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
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
    </section>
  );
}
