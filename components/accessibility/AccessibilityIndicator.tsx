"use client";

import { useAccessibility } from "@/hooks/useAccessibility";
import { Badge } from "@/components/ui/badge";
import { Eye, Type, Zap, Contrast } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Indicador visual discreto que muestra cuando hay filtros de accesibilidad activos
 */
export function AccessibilityIndicator() {
  const { settings, isLoaded } = useAccessibility();
  const t = useTranslations("settings.accessibility");

  if (!isLoaded) return null;

  // Verificar si hay alguna configuración activa
  const hasActiveSettings =
    settings.colorBlindMode !== "none" ||
    settings.highContrast ||
    settings.fontSize !== "normal" ||
    settings.lineSpacing !== "normal" ||
    settings.reduceMotion;

  if (!hasActiveSettings) return null;

  const activeFeatures: { icon: React.ReactNode; label: string }[] = [];

  if (settings.colorBlindMode !== "none") {
    activeFeatures.push({
      icon: <Eye className="h-3 w-3" />,
      label: t(`colorBlindness.modes.${settings.colorBlindMode}.label`),
    });
  }

  if (settings.highContrast) {
    activeFeatures.push({
      icon: <Contrast className="h-3 w-3" />,
      label: t("contrast.highContrast.label"),
    });
  }

  if (settings.fontSize !== "normal") {
    activeFeatures.push({
      icon: <Type className="h-3 w-3" />,
      label: t(`fontSize.sizes.${settings.fontSize === "large" ? "large" : "extraLarge"}.label`),
    });
  }

  if (settings.reduceMotion) {
    activeFeatures.push({
      icon: <Zap className="h-3 w-3" />,
      label: t("motion.reduceMotion.label"),
    });
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs">
      <div className="bg-card/95 backdrop-blur-sm border rounded-2xl shadow-lg p-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {t("activeIndicator.title")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {activeFeatures.map((feature, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-[10px] flex items-center gap-1 py-0.5 px-2"
            >
              {feature.icon}
              {feature.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
