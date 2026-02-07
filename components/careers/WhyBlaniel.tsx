"use client";

import { motion } from "framer-motion";
import {
  Cpu,
  Package,
  Target,
  TrendingUp,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function WhyBlaniel() {
  const t = useTranslations("careers.why");

  const benefits = [
    {
      icon: Cpu,
      title: t("technology.title"),
      description: t("technology.description"),
    },
    {
      icon: Package,
      title: t("product.title"),
      description: t("product.description"),
    },
    {
      icon: Target,
      title: t("impact.title"),
      description: t("impact.description"),
    },
    {
      icon: TrendingUp,
      title: t("growth.title"),
      description: t("growth.description"),
    },
    {
      icon: MapPin,
      title: t("remote.title"),
      description: t("remote.description"),
    },
    {
      icon: Sparkles,
      title: t("innovation.title"),
      description: t("innovation.description"),
    },
  ];

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            <span className="text-muted-foreground">{t("title")}</span> {t("titleHighlight")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

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
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                      <Icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {benefit.description}
                      </p>
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
