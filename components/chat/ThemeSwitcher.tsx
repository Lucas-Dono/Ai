"use client";

/**
 * Theme Switcher Component
 *
 * Permite al usuario cambiar el tema del chat
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, type ThemeName } from "@/contexts/ThemeContext";

interface ThemeSwitcherProps {
  className?: string;
}

const themeOptions: { name: ThemeName; label: string; preview: string }[] = [
  { name: "dark", label: "Oscuro", preview: "#0a0a0a" },
  { name: "light", label: "Claro", preview: "#ffffff" },
  { name: "ocean", label: "Océano", preview: "#0c1e2e" },
  { name: "forest", label: "Bosque", preview: "#0f1f0f" },
  { name: "sunset", label: "Atardecer", preview: "#1f0f1f" },
  { name: "custom", label: "Personalizado", preview: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
];

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { themeName, setTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowMenu(!showMenu)}
        className="text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
      >
        <Palette className="h-5 w-5" />
      </Button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg shadow-xl z-50 p-3 min-w-[200px]">
            <h3 className="text-sm font-semibold text-white mb-3">
              Temas
            </h3>

            <div className="space-y-2">
              {themeOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => {
                    setTheme(option.name);
                    setShowMenu(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    themeName === option.name
                      ? "bg-[#2a2a2a] text-white"
                      : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
                  )}
                >
                  {/* Preview color */}
                  <div
                    className="h-6 w-6 rounded-md border border-[#3a3a3a]"
                    style={{
                      background: option.preview,
                    }}
                  />

                  {/* Label */}
                  <span className="flex-1 text-left text-sm">
                    {option.label}
                  </span>

                  {/* Check icon */}
                  {themeName === option.name && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Custom theme notice */}
            {themeName === "custom" && (
              <p className="text-xs text-gray-500 mt-3 px-2">
                Tip: Puedes personalizar los colores en la configuración
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
