import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo } from 'react-native';

export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
export type FontSize = 'normal' | 'large' | 'extra-large';
export type LineSpacing = 'normal' | 'comfortable' | 'spacious';

export interface AccessibilitySettings {
  colorBlindMode: ColorBlindMode;
  highContrast: boolean;
  fontSize: FontSize;
  lineSpacing: LineSpacing;
  reduceMotion: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  colorBlindMode: 'none',
  highContrast: false,
  fontSize: 'normal',
  lineSpacing: 'normal',
  reduceMotion: false,
};

const STORAGE_KEY = '@accessibility_settings';

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar configuración desde AsyncStorage o detectar preferencias del sistema
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        setSettings(JSON.parse(stored));
      } else {
        // Detectar preferencias del sistema
        const systemPreferences: Partial<AccessibilitySettings> = {};

        // Detectar si el usuario tiene reducción de movimiento activada
        const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        if (isReduceMotionEnabled) {
          systemPreferences.reduceMotion = true;
        }

        // Detectar si el usuario tiene alto contraste activado (solo iOS)
        try {
          const isHighContrastEnabled = await AccessibilityInfo.isHighTextContrastEnabled?.();
          if (isHighContrastEnabled) {
            systemPreferences.highContrast = true;
          }
        } catch (e) {
          // isHighTextContrastEnabled no está disponible en todas las plataformas
        }

        // Si hay preferencias del sistema, aplicarlas
        if (Object.keys(systemPreferences).length > 0) {
          const newSettings = { ...DEFAULT_SETTINGS, ...systemPreferences };
          setSettings(newSettings);
          await saveSettings(newSettings);
        }
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveSettings = async (newSettings: AccessibilitySettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  };

  const updateSettings = useCallback(async (updates: Partial<AccessibilitySettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, [settings]);

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    await saveSettings(DEFAULT_SETTINGS);
  }, []);

  // Calcular multiplicadores para estilos
  const fontSizeMultiplier =
    settings.fontSize === 'large' ? 1.125 :
    settings.fontSize === 'extra-large' ? 1.25 :
    1;

  const lineHeightMultiplier =
    settings.lineSpacing === 'comfortable' ? 1.17 :
    settings.lineSpacing === 'spacious' ? 1.33 :
    1;

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoaded,
    fontSizeMultiplier,
    lineHeightMultiplier,
  };
}
