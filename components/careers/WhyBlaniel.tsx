"use client";

import { motion } from "framer-motion";
import {
  Rocket,
  Brain,
  Lightbulb,
  DollarSign,
  Globe,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function WhyBlaniel() {
  const t = useTranslations("careers.why");

  const benefits = [
    {
      icon: Rocket,
      title: t("realImpact.title"),
      description: t("realImpact.description"),
    },
    {
      icon: Brain,
      title: t("cutting-edge.title"),
      description: t("cutting-edge.description"),
    },
    {
      icon: Lightbulb,
      title: t("autonomy.title"),
      description: t("autonomy.description"),
    },
    {
      icon: DollarSign,
      title: t("compensation.title"),
      description: t("compensation.description"),
    },
    {
      icon: Globe,
      title: t("global.title"),
      description: t("global.description"),
    },
    {
      icon: Users,
      title: t("community.title"),
      description: t("community.description"),
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
            {t("title")} <span className="text-muted-foreground">{t("titleHighlight")}</span>
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
