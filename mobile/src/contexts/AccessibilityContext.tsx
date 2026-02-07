import React, { createContext, useContext, ReactNode } from 'react';
import { useAccessibility as useAccessibilityHook } from '../hooks/useAccessibility';
import type { AccessibilitySettings, ColorBlindMode } from '../hooks/useAccessibility';

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoaded: boolean;
  fontSizeMultiplier: number;
  lineHeightMultiplier: number;
  getAdjustedColor: (color: string) => string;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const accessibility = useAccessibilityHook();

  /**
   * Ajusta un color según el modo de daltonismo activo
   * Usa matrices de transformación simplificadas para simular diferentes tipos de daltonismo
   */
  const getAdjustedColor = (color: string): string => {
    if (accessibility.settings.colorBlindMode === 'none') {
      return color;
    }

    // Si el color no está en formato hex, retornarlo sin cambios
    if (!color.startsWith('#')) {
      return color;
    }

    try {
      // Extraer RGB del color hex
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;

      let newR = r;
      let newG = g;
      let newB = b;

      // Aplicar transformación según el tipo de daltonismo
      switch (accessibility.settings.colorBlindMode) {
        case 'protanopia': // Deficiencia de rojo
          newR = 0.567 * r + 0.433 * g;
          newG = 0.558 * r + 0.442 * g;
          newB = 0.242 * g + 0.758 * b;
          break;

        case 'deuteranopia': // Deficiencia de verde
          newR = 0.625 * r + 0.375 * g;
          newG = 0.7 * r + 0.3 * g;
          newB = 0.3 * g + 0.7 * b;
          break;

        case 'tritanopia': // Deficiencia de azul
          newR = 0.95 * r + 0.05 * g;
          newG = 0.433 * g + 0.567 * b;
          newB = 0.475 * g + 0.525 * b;
          break;

        case 'achromatopsia': // Sin color (escala de grises)
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          newR = gray;
          newG = gray;
          newB = gray;
          break;
      }

      // Convertir de vuelta a hex
      const toHex = (value: number) => {
        const int = Math.round(Math.max(0, Math.min(1, value)) * 255);
        return int.toString(16).padStart(2, '0');
      };

      return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
    } catch (error) {
      console.error('Error adjusting color:', error);
      return color;
    }
  };

  const contextValue: AccessibilityContextType = {
    ...accessibility,
    getAdjustedColor,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibilityContext() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within AccessibilityProvider');
  }
  return context;
}
