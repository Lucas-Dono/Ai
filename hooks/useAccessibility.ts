"use client";

import { useEffect, useState } from "react";

export type ColorBlindMode = "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";
export type FontSize = "normal" | "large" | "extra-large";
export type LineSpacing = "normal" | "comfortable" | "spacious";

export interface AccessibilitySettings {
  colorBlindMode: ColorBlindMode;
  highContrast: boolean;
  fontSize: FontSize;
  lineSpacing: LineSpacing;
  reduceMotion: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  colorBlindMode: "none",
  highContrast: false,
  fontSize: "normal",
  lineSpacing: "normal",
  reduceMotion: false,
};

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar configuración desde localStorage o detectar preferencias del sistema
  useEffect(() => {
    const stored = localStorage.getItem("accessibility-settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error("Error loading accessibility settings:", e);
      }
    } else {
      // Detectar preferencias del sistema si no hay configuración guardada
      const systemPreferences: Partial<AccessibilitySettings> = {};

      // Detectar prefers-reduced-motion
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        systemPreferences.reduceMotion = true;
      }

      // Detectar prefers-contrast (experimental)
      if (window.matchMedia("(prefers-contrast: more)").matches) {
        systemPreferences.highContrast = true;
      }

      // Si hay preferencias del sistema, aplicarlas
      if (Object.keys(systemPreferences).length > 0) {
        setSettings(prev => ({ ...prev, ...systemPreferences }));
      }
    }
    setIsLoaded(true);
  }, []);

  // Aplicar configuración al documento
  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;

    // Aplicar filtro de daltonismo
    root.setAttribute("data-colorblind-mode", settings.colorBlindMode);

    // Aplicar alto contraste
    if (settings.highContrast) {
      root.setAttribute("data-high-contrast", "true");
    } else {
      root.removeAttribute("data-high-contrast");
    }

    // Aplicar tamaño de fuente
    root.setAttribute("data-font-size", settings.fontSize);

    // Aplicar espaciado de líneas
    root.setAttribute("data-line-spacing", settings.lineSpacing);

    // Aplicar reducción de movimiento
    if (settings.reduceMotion) {
      root.setAttribute("data-reduce-motion", "true");
    } else {
      root.removeAttribute("data-reduce-motion");
    }

    // Guardar en localStorage
    localStorage.setItem("accessibility-settings", JSON.stringify(settings));
  }, [settings, isLoaded]);

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoaded,
  };
}
