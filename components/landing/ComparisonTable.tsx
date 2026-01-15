"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Check, X, AlertTriangle, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics/track-client";
import { LandingEventType } from "@/lib/analytics/types";
import Image from "next/image";

type Status = boolean | "partial";

interface Comparison {
  us: Status;
  others: Status;
}

function StatusIcon({ status }: { status: Status }) {
  if (status === true) {
    return (
      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
      </div>
    );
  }
  if (status === "partial") {
    return (
      <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
      <X className="w-4 h-4 text-red-600 dark:text-red-400" />
    </div>
  );
}

export function ComparisonTable() {
  const t = useTranslations("landing.comparison");
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Track when table comes into view
  useEffect(() => {
    if (!sectionRef.current || hasTrackedView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView) {
            trackEvent({
              eventType: LandingEventType.PLAN_VIEW,
              metadata: {
                section: 'comparison_table',
              },
            }).catch(() => {});
            setHasTrackedView(true);
          }
        });
      },
      { threshold: 0.3 } // Trigger when 30% visible
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [hasTrackedView]);

  const handlePlanSelect = (plan: string) => {
    trackEvent({
      eventType: LandingEventType.PLAN_SELECT,
      metadata: {
        plan,
        section: 'comparison_table',
      },
    }).catch(() => {});

    router.push('/dashboard');
  };

  const comparisons: Comparison[] = [
    {
      us: true,
      others: "partial",
    },
    {
      us: true,
      others: false,
    },
    {
      us: true,
      others: "partial",
    },
    {
      us: true,
      others: false,
    },
    {
      us: true,
      others: "partial",
    },
    {
      us: true,
      others: "partial",
    },
    {
      us: true,
      others: false,
    },
    {
      us: true,
      others: false,
    },
  ];

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-24 lg:py-32 relative overflow-hidden bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            {t("title")}{" "}
            <span className="text-muted-foreground">
              {t("titleHighlight")}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          {/* Desktop Table */}
          <Card className="hidden md:block overflow-hidden border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b border-border">
                    <th className="text-left p-5 font-semibold text-base w-2/5">
                      {t("table.feature")}
                    </th>
                    <th className="p-5 text-center">
                      <div className="inline-flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center p-2">
                          <Image
                            src="/logo.png"
                            alt="Blaniel"
                            width={32}
                            height={32}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="font-semibold text-sm">{t("table.us")}</span>
                      </div>
                    </th>
                    <th className="p-5 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center">
                          <Users className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
                        </div>
                        <span className="font-medium text-xs text-muted-foreground">
                          {t("table.others")}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((comparison, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-5 text-sm font-medium">{t(`features.feature${index + 1}`)}</td>
                      <td className="p-5">
                        <div className="flex justify-center">
                          <StatusIcon status={comparison.us} />
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center">
                          <StatusIcon status={comparison.others} />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="p-5 bg-muted/30 border-t border-border">
              <div className="flex flex-wrap justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <StatusIcon status={true} />
                  <span className="text-muted-foreground font-medium">{t("legend.complete")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon status="partial" />
                  <span className="text-muted-foreground font-medium">{t("legend.partial")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon status={false} />
                  <span className="text-muted-foreground font-medium">{t("legend.unavailable")}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {comparisons.map((comparison, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="p-4 border border-border bg-card/50 backdrop-blur-sm">
                  {/* Feature name */}
                  <h3 className="text-sm font-semibold mb-3">
                    {t(`features.feature${index + 1}`)}
                  </h3>

                  {/* Comparison */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Blaniel */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-muted/50">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center p-1.5 mb-2">
                        <Image
                          src="/logo.png"
                          alt="Blaniel"
                          width={32}
                          height={32}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-xs font-medium mb-2">{t("table.us")}</span>
                      <StatusIcon status={comparison.us} />
                    </div>

                    {/* Others */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-muted/30">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mb-2">
                        <Users className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                      </div>
                      <span className="text-xs text-muted-foreground mb-2">{t("table.others")}</span>
                      <StatusIcon status={comparison.others} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {/* Legend for mobile */}
            <Card className="p-4 border border-border bg-muted/30">
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <StatusIcon status={true} />
                  <span className="text-muted-foreground font-medium">{t("legend.complete")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon status="partial" />
                  <span className="text-muted-foreground font-medium">{t("legend.partial")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon status={false} />
                  <span className="text-muted-foreground font-medium">{t("legend.unavailable")}</span>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-16"
        >
          <Card className="max-w-2xl mx-auto p-8 border border-border bg-card/50 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-2">
              {t("cta.title")}
            </h3>
            <p className="text-muted-foreground mb-6 text-sm">
              {t("cta.subtitle")}
            </p>
            <button
              onClick={() => handlePlanSelect('comparison_cta')}
              className="px-6 py-2.5 bg-foreground hover:bg-foreground/90 text-background font-medium rounded-2xl transition-colors duration-200"
            >
              {t("cta.button")}
            </button>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
