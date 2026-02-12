"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Smartphone, Gamepad2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { PlatformCard } from "./PlatformCard";
import { trackEvent } from "@/lib/analytics/track-client";
import { LandingEventType } from "@/lib/analytics/types";

export function DownloadsSection() {
  const t = useTranslations("landing.downloads");

  // Track section view
  useEffect(() => {
    trackEvent({
      eventType: LandingEventType.DOWNLOADS_SECTION_VIEWED,
      metadata: {
        timestamp: Date.now(),
      },
    }).catch(() => {});
  }, []);

  const handleDownload = (platform: "android" | "minecraft") => {
    trackEvent({
      eventType: LandingEventType.DOWNLOAD_CLICKED,
      metadata: {
        platform,
        source: "landing",
        timestamp: Date.now(),
      },
    }).catch(() => {});
  };

  const androidBenefits = [
    t("android.benefit1"),
    t("android.benefit2"),
    t("android.benefit3"),
  ];

  const minecraftBenefits = [
    t("minecraft.benefit1"),
    t("minecraft.benefit2"),
    t("minecraft.benefit3"),
  ];

  return (
    <section className="py-16 sm:py-20 relative overflow-hidden">
      {/* Background grid pattern - subtle */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        {/* Header - More compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-2 tracking-tight">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <PlatformCard
            platform="android"
            title={t("android.title")}
            description={t("android.description")}
            benefits={androidBenefits}
            downloadUrl={process.env.NEXT_PUBLIC_ANDROID_APK_URL || "#"}
            icon={<Smartphone className="w-full h-full" />}
            accentColor="#3DDC84"
            badge={t("android.badge")}
            onDownload={handleDownload}
          />

          <PlatformCard
            platform="minecraft"
            title={t("minecraft.title")}
            description={t("minecraft.description")}
            benefits={minecraftBenefits}
            downloadUrl="/api/v1/minecraft/mod/download/latest"
            icon={<Gamepad2 className="w-full h-full" />}
            accentColor="#62B47A"
            badge={t("minecraft.badge")}
            onDownload={handleDownload}
          />
        </div>
      </div>
    </section>
  );
}
