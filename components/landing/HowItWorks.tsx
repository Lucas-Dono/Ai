"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, Globe2, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");

  const steps = [
    {
      number: "01",
      icon: Sparkles,
      title: t("steps.step1.title"),
      description: t("steps.step1.description"),
    },
    {
      number: "02",
      icon: MessageCircle,
      title: t("steps.step2.title"),
      description: t("steps.step2.description"),
    },
    {
      number: "03",
      icon: Globe2,
      title: t("steps.step3.title"),
      description: t("steps.step3.description"),
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

        <div className="max-w-6xl mx-auto relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2" />

          <div className="grid lg:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className="p-6 h-full border border-border hover:border-foreground/20 transition-all duration-300 group bg-card/50 backdrop-blur-sm">
                    {/* Step number */}
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-muted mb-6">
                      <span className="text-base font-bold">
                        {step.number}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                        <Icon className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </Card>

                  {/* Arrow between steps */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-30">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-base text-muted-foreground mb-6">
            {t("bottomCta.question")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              {t("bottomCta.ctaPrimary")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border hover:bg-muted"
            >
              {t("bottomCta.ctaSecondary")}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
