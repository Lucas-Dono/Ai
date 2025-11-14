/**
 * useClientLocale Hook
 * Detecta el idioma actual desde la cookie y devuelve las traducciones correspondientes
 */

import { useState, useEffect } from "react";
import { LOCALE_COOKIE_NAME, type Locale } from "@/i18n/config";
import esMessages from "@/messages/es.json";
import enMessages from "@/messages/en.json";

const messages = {
  es: esMessages,
  en: enMessages,
};

export function useClientLocale() {
  const [locale, setLocale] = useState<Locale>("es");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Leer la cookie del idioma
    const savedLocale = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${LOCALE_COOKIE_NAME}=`))
      ?.split("=")[1];

    if (savedLocale && (savedLocale === "es" || savedLocale === "en")) {
      setLocale(savedLocale as Locale);
    } else {
      // Si no hay cookie, detectar del navegador
      const browserLang = navigator.language.split("-")[0];
      setLocale(browserLang === "en" ? "en" : "es");
    }

    setIsLoading(false);
  }, []);

  // Función para obtener una traducción anidada
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = messages[locale];

    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k];
      } else {
        return key; // Retornar la key si no se encuentra la traducción
      }
    }

    return typeof value === "string" ? value : key;
  };

  return { locale, t, isLoading };
}
