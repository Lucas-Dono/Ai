"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

export function CareersCTA() {
  const t = useTranslations("careers.finalCta");

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="relative overflow-hidden border-border shadow-xl bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm">
            <div className="p-8 md:p-12 lg:p-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-8"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 mx-auto">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium">{t("badge")}</span>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                    {t("title")}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                    {t("subtitle")}
                  </p>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <a href="mailto:jobs@blaniel.com">
                    <Button className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 text-base font-medium gap-2">
                      <Mail className="h-4 w-4" />
                      {t("emailButton")}
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    className="h-12 px-8 border-border hover:bg-muted text-base font-medium gap-2"
                  >
                    {t("learnMore")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Support text */}
                <div className="pt-8 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    {t("supportText")}{" "}
                    <span className="font-medium text-foreground">
                      jobs@blaniel.com
                    </span>
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Accent glow */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-foreground/5 to-transparent blur-3xl" />
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
