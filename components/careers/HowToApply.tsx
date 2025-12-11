"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export function HowToApply() {
  const t = useTranslations("careers.howToApply");

  const steps = [
    {
      number: "1",
      title: t("step1.title"),
      description: t("step1.description"),
    },
    {
      number: "2",
      title: t("step2.title"),
      description: t("step2.description"),
    },
    {
      number: "3",
      title: t("step3.title"),
      description: t("step3.description"),
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
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute top-12 left-[50%] w-[calc(100%-3rem)] h-0.5 bg-gradient-to-r from-border to-transparent hidden md:block" />
              )}

              <Card className="p-6 h-full border-border bg-card/50 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-lg">
                      {step.number}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="p-8 border-border bg-gradient-to-br from-muted/50 to-muted/20 backdrop-blur-sm">
            <p className="text-center text-muted-foreground mb-6">
              {t("noPosition")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:jobs@blaniel.com">
                <Button className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90">
                  {t("sendEmail")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <Button
                variant="outline"
                className="border-border hover:bg-muted"
              >
                {t("learnMore")}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
