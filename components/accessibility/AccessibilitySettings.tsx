"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import {
  Eye,
  Type,
  Sparkles,
  RotateCcw,
  Check,
  AlignLeft,
} from "lucide-react";
import {
  useAccessibility,
  ColorBlindMode,
  FontSize,
  LineSpacing,
} from "@/hooks/useAccessibility";

export function AccessibilitySettings() {
  const t = useTranslations("settings.accessibility");
  const { settings, updateSettings, resetSettings } = useAccessibility();

  const colorBlindModes: { value: ColorBlindMode; translationKey: string }[] = [
    { value: "none", translationKey: "none" },
    { value: "protanopia", translationKey: "protanopia" },
    { value: "deuteranopia", translationKey: "deuteranopia" },
    { value: "tritanopia", translationKey: "tritanopia" },
    { value: "achromatopsia", translationKey: "achromatopsia" },
  ];

  const fontSizes: { value: FontSize; translationKey: string }[] = [
    { value: "normal", translationKey: "normal" },
    { value: "large", translationKey: "large" },
    { value: "extra-large", translationKey: "extraLarge" },
  ];

  const lineSpacings: { value: LineSpacing; translationKey: string }[] = [
    { value: "normal", translationKey: "normal" },
    { value: "comfortable", translationKey: "comfortable" },
    { value: "spacious", translationKey: "spacious" },
  ];

  return (
    <div className="space-y-6">
      {/* Filtros de Daltonismo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {t("colorBlindness.title")}
          </CardTitle>
          <CardDescription>
            {t("colorBlindness.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {colorBlindModes.map((mode) => (
            <div
              key={mode.value}
              className="flex items-center justify-between p-4 rounded-2xl border hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => updateSettings({ colorBlindMode: mode.value })}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">
                    {t(`colorBlindness.modes.${mode.translationKey}.label`)}
                  </p>
                  {mode.value !== "none" && (
                    <Badge variant="secondary" className="text-xs">
                      {t("colorBlindness.badgeFilter")}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t(`colorBlindness.modes.${mode.translationKey}.description`)}
                </p>
              </div>
              {settings.colorBlindMode === mode.value && (
                <Check className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Alto Contraste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t("contrast.title")}
          </CardTitle>
          <CardDescription>
            {t("contrast.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-between p-4 rounded-2xl border hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => updateSettings({ highContrast: !settings.highContrast })}
          >
            <div>
              <p className="font-medium text-sm">{t("contrast.highContrast.label")}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("contrast.highContrast.description")}
              </p>
            </div>
            <Button
              variant={settings.highContrast ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                updateSettings({ highContrast: !settings.highContrast });
              }}
            >
              {settings.highContrast ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  {t("contrast.highContrast.enabled")}
                </>
              ) : (
                t("contrast.highContrast.disabled")
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tamaño de fuente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            {t("fontSize.title")}
          </CardTitle>
          <CardDescription>
            {t("fontSize.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {fontSizes.map((size) => (
            <div
              key={size.value}
              className="flex items-center justify-between p-4 rounded-2xl border hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => updateSettings({ fontSize: size.value })}
            >
              <div>
                <p className="font-medium text-sm">
                  {t(`fontSize.sizes.${size.translationKey}.label`)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t(`fontSize.sizes.${size.translationKey}.example`)}
                </p>
              </div>
              {settings.fontSize === size.value && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Espaciado de líneas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlignLeft className="h-5 w-5" />
            {t("lineSpacing.title")}
          </CardTitle>
          <CardDescription>
            {t("lineSpacing.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {lineSpacings.map((spacing) => (
            <div
              key={spacing.value}
              className="flex items-center justify-between p-4 rounded-2xl border hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => updateSettings({ lineSpacing: spacing.value })}
            >
              <div>
                <p className="font-medium text-sm">
                  {t(`lineSpacing.spacings.${spacing.translationKey}.label`)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t(`lineSpacing.spacings.${spacing.translationKey}.description`)}
                </p>
              </div>
              {settings.lineSpacing === spacing.value && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reducción de movimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t("motion.title")}
          </CardTitle>
          <CardDescription>
            {t("motion.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-between p-4 rounded-2xl border hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => updateSettings({ reduceMotion: !settings.reduceMotion })}
          >
            <div>
              <p className="font-medium text-sm">{t("motion.reduceMotion.label")}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("motion.reduceMotion.description")}
              </p>
            </div>
            <Button
              variant={settings.reduceMotion ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                updateSettings({ reduceMotion: !settings.reduceMotion });
              }}
            >
              {settings.reduceMotion ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  {t("motion.reduceMotion.enabled")}
                </>
              ) : (
                t("motion.reduceMotion.disabled")
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Restablecer configuración */}
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{t("reset.title")}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("reset.description")}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={resetSettings}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {t("reset.button")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
