"use client";

/**
 * Theme Context
 *
 * Proporciona temas personalizables para el chat:
 * - Dark (default)
 * - Light
 * - Custom themes
 */

import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeName = "dark" | "light" | "ocean" | "forest" | "sunset" | "custom";

export interface Theme {
  name: ThemeName;
  colors: {
    // Backgrounds
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;

    // Messages
    userMessageBg: string;
    agentMessageBg: string;
    userMessageText: string;
    agentMessageText: string;

    // UI Elements
    borderColor: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;

    // Accent
    accentPrimary: string;
    accentSecondary: string;
  };
}

const themes: Record<ThemeName, Theme> = {
  dark: {
    name: "dark",
    colors: {
      bgPrimary: "#0a0a0a",
      bgSecondary: "#1f1f1f",
      bgTertiary: "#2a2a2a",
      userMessageBg: "#16a34a",
      agentMessageBg: "#1f1f1f",
      userMessageText: "#ffffff",
      agentMessageText: "#ffffff",
      borderColor: "#2a2a2a",
      textPrimary: "#ffffff",
      textSecondary: "#d1d5db",
      textMuted: "#9ca3af",
      accentPrimary: "#16a34a",
      accentSecondary: "#22c55e",
    },
  },
  light: {
    name: "light",
    colors: {
      bgPrimary: "#ffffff",
      bgSecondary: "#f3f4f6",
      bgTertiary: "#e5e7eb",
      userMessageBg: "#16a34a",
      agentMessageBg: "#f3f4f6",
      userMessageText: "#ffffff",
      agentMessageText: "#000000",
      borderColor: "#e5e7eb",
      textPrimary: "#000000",
      textSecondary: "#4b5563",
      textMuted: "#9ca3af",
      accentPrimary: "#16a34a",
      accentSecondary: "#22c55e",
    },
  },
  ocean: {
    name: "ocean",
    colors: {
      bgPrimary: "#0c1e2e",
      bgSecondary: "#1a3a52",
      bgTertiary: "#2a4a62",
      userMessageBg: "#0ea5e9",
      agentMessageBg: "#1a3a52",
      userMessageText: "#ffffff",
      agentMessageText: "#ffffff",
      borderColor: "#2a4a62",
      textPrimary: "#ffffff",
      textSecondary: "#bae6fd",
      textMuted: "#7dd3fc",
      accentPrimary: "#0ea5e9",
      accentSecondary: "#38bdf8",
    },
  },
  forest: {
    name: "forest",
    colors: {
      bgPrimary: "#0f1f0f",
      bgSecondary: "#1a3a1a",
      bgTertiary: "#2a4a2a",
      userMessageBg: "#22c55e",
      agentMessageBg: "#1a3a1a",
      userMessageText: "#ffffff",
      agentMessageText: "#ffffff",
      borderColor: "#2a4a2a",
      textPrimary: "#ffffff",
      textSecondary: "#bbf7d0",
      textMuted: "#86efac",
      accentPrimary: "#22c55e",
      accentSecondary: "#4ade80",
    },
  },
  sunset: {
    name: "sunset",
    colors: {
      bgPrimary: "#1f0f1f",
      bgSecondary: "#3a1a3a",
      bgTertiary: "#4a2a4a",
      userMessageBg: "#f97316",
      agentMessageBg: "#3a1a3a",
      userMessageText: "#ffffff",
      agentMessageText: "#ffffff",
      borderColor: "#4a2a4a",
      textPrimary: "#ffffff",
      textSecondary: "#fed7aa",
      textMuted: "#fdba74",
      accentPrimary: "#f97316",
      accentSecondary: "#fb923c",
    },
  },
  custom: {
    name: "custom",
    colors: {
      bgPrimary: "#0a0a0a",
      bgSecondary: "#1f1f1f",
      bgTertiary: "#2a2a2a",
      userMessageBg: "#8b5cf6",
      agentMessageBg: "#1f1f1f",
      userMessageText: "#ffffff",
      agentMessageText: "#ffffff",
      borderColor: "#2a2a2a",
      textPrimary: "#ffffff",
      textSecondary: "#d1d5db",
      textMuted: "#9ca3af",
      accentPrimary: "#8b5cf6",
      accentSecondary: "#a78bfa",
    },
  },
};

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
  setCustomTheme: (colors: Partial<Theme["colors"]>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("dark");
  const [customColors, setCustomColors] = useState<Partial<Theme["colors"]>>({});

  // Cargar tema guardado
  useEffect(() => {
    const savedTheme = localStorage.getItem("chat-theme") as ThemeName;
    const savedCustomColors = localStorage.getItem("chat-custom-colors");

    if (savedTheme) {
      setThemeName(savedTheme);
    }

    if (savedCustomColors) {
      try {
        setCustomColors(JSON.parse(savedCustomColors));
      } catch (error) {
        console.error("Error parsing custom colors:", error);
      }
    }
  }, []);

  // Aplicar tema al documento
  useEffect(() => {
    const theme = getTheme();
    const root = document.documentElement;

    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--chat-${key}`, value);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeName, customColors]);

  const getTheme = (): Theme => {
    const baseTheme = themes[themeName];

    if (themeName === "custom" && Object.keys(customColors).length > 0) {
      return {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          ...customColors,
        },
      };
    }

    return baseTheme;
  };

  const setTheme = (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
    localStorage.setItem("chat-theme", newThemeName);
  };

  const setCustomTheme = (colors: Partial<Theme["colors"]>) => {
    setCustomColors(colors);
    localStorage.setItem("chat-custom-colors", JSON.stringify(colors));
    setThemeName("custom");
    localStorage.setItem("chat-theme", "custom");
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: getTheme(),
        themeName,
        setTheme,
        setCustomTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
