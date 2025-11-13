"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Sparkles, Sliders, ArrowLeft, Zap, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function WorldCreatorSelectionPage() {
  const router = useRouter();
  const t = useTranslations("worlds.creator");

  const modes = [
    {
      id: "simple",
      name: t("modes.simple.name"),
      icon: Sparkles,
      description: t("modes.simple.description"),
      features: [
        t("modes.simple.features.0"),
        t("modes.simple.features.1"),
        t("modes.simple.features.2"),
        t("modes.simple.features.3"),
      ],
      color: "from-primary to-secondary",
      route: "/dashboard/mundos/crear/simple",
      recommended: true,
    },
    {
      id: "advanced",
      name: t("modes.advanced.name"),
      icon: Sliders,
      description: t("modes.advanced.description"),
      features: [
        t("modes.advanced.features.0"),
        t("modes.advanced.features.1"),
        t("modes.advanced.features.2"),
        t("modes.advanced.features.3"),
      ],
      color: "from-purple-500 to-pink-500",
      route: "/dashboard/mundos/crear/avanzado",
      recommended: false,
    },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/dashboard/mundos">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToWorlds")}
          </Button>
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold md-text-primary">{t("title")}</h1>
            <p className="text-lg md-text-secondary">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="max-w-5xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
          {modes.map((mode) => {
            const Icon = mode.icon;

            return (
              <motion.div
                key={mode.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="p-6 h-full cursor-pointer hover:border-primary/50 transition-all relative overflow-hidden group"
                  onClick={() => router.push(mode.route)}
                >
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold md-text-primary">
                            {mode.name}
                          </h3>
                          {mode.recommended && (
                            <Badge variant="default" className="text-xs mt-1">
                              {t("recommended")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm md-text-secondary mb-4">
                      {mode.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {mode.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <span className="text-primary">✓</span>
                          <span className="md-text-secondary">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button className="w-full" variant={mode.recommended ? "default" : "outline"}>
                      {mode.recommended ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          {t("cta.simple")}
                        </>
                      ) : (
                        <>
                          <Wrench className="h-4 w-4 mr-2" />
                          {t("cta.advanced")}
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-8 max-w-3xl mx-auto p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div className="flex-1">
              <h3 className="font-semibold md-text-primary mb-2">
                {t("help.title")}
              </h3>
              <div className="space-y-2 text-sm md-text-secondary">
                <p>
                  <strong className="text-primary">{t("help.simple.title")}</strong> {t("help.simple.description")}
                </p>
                <p>
                  <strong className="text-purple-500">{t("help.advanced.title")}</strong> {t("help.advanced.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
