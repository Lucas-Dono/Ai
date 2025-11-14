"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  locales,
  type Locale,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
} from "@/i18n/config";

interface Language {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
  },
];

interface LanguageSwitcherProps {
  variant?: "default" | "compact";
  className?: string;
}

export function LanguageSwitcher({
  variant = "default",
  className
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<Locale>("es");
  const [isPending, setIsPending] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Detectar idioma actual desde la URL o cookie
  useEffect(() => {
    // Intentar obtener el locale de la URL primero
    const pathSegments = pathname.split("/").filter(Boolean);
    const possibleLocale = pathSegments[0];

    if (locales.includes(possibleLocale as Locale)) {
      setCurrentLocale(possibleLocale as Locale);
    } else {
      // Si no hay locale en la URL, usar cookie o navegador
      const savedLocale = document.cookie
        .split("; ")
        .find(row => row.startsWith(`${LOCALE_COOKIE_NAME}=`))
        ?.split("=")[1];

      if (savedLocale && locales.includes(savedLocale as Locale)) {
        setCurrentLocale(savedLocale as Locale);
      } else {
        // Detectar idioma del navegador
        const browserLang = navigator.language.split("-")[0];
        const matchedLang = languages.find(lang => lang.code === browserLang);
        setCurrentLocale(matchedLang?.code || "es");
      }
    }
  }, [pathname]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  const handleLanguageChange = async (newLocale: Locale) => {
    if (newLocale === currentLocale || isPending) return;

    setIsPending(true);
    setIsOpen(false);

    try {
      // Guardar preferencia en cookie
      const expires = new Date();
      expires.setTime(expires.getTime() + LOCALE_COOKIE_MAX_AGE * 1000);
      document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

      // NO cambiamos la URL, solo refrescamos para aplicar el nuevo idioma
      // El middleware detectará el cookie y los componentes mostrarán el idioma correcto
      setCurrentLocale(newLocale);
      router.refresh();
    } catch (error) {
      console.error("Error changing language:", error);
    } finally {
      setIsPending(false);
    }
  };

  if (variant === "compact") {
    return (
      <div className={cn("relative", className)} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isPending}
          className={cn(
            "flex items-center justify-center h-9 w-9 rounded-2xl",
            "bg-background/50 hover:bg-accent",
            "border border-border hover:border-primary/50",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          )}
          aria-label="Change language"
          aria-expanded={isOpen}
        >
          <span className="text-xl" role="img" aria-label={currentLanguage.name}>
            {currentLanguage.flag}
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute right-0 bottom-full mb-2 w-48 z-50",
                "bg-card/95 backdrop-blur-lg rounded-xl",
                "border border-border shadow-lg",
                "overflow-hidden"
              )}
            >
              <div className="py-1">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    disabled={isPending}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5",
                      "text-sm font-medium transition-colors",
                      "hover:bg-accent",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      currentLocale === language.code && "bg-primary/10 text-primary"
                    )}
                  >
                    <span className="text-lg" role="img" aria-label={language.name}>
                      {language.flag}
                    </span>
                    <span className="flex-1 text-left">{language.nativeName}</span>
                    {currentLocale === language.code && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Variant "default" - más elaborado
  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-2xl",
          "bg-background/50 hover:bg-accent",
          "border border-border hover:border-primary/50",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "group"
        )}
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="text-lg" role="img" aria-label={currentLanguage.name}>
          {currentLanguage.flag}
        </span>
        <span className="text-sm font-medium hidden sm:inline">
          {currentLanguage.nativeName}
        </span>
        <svg
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute right-0 bottom-full mb-2 w-56 z-50",
              "bg-card/95 backdrop-blur-lg rounded-xl",
              "border border-border shadow-xl",
              "overflow-hidden"
            )}
          >
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select Language
              </p>
            </div>
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  disabled={isPending}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3",
                    "text-sm font-medium transition-all duration-200",
                    "hover:bg-accent hover:translate-x-1",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    currentLocale === language.code && "bg-primary/10 text-primary"
                  )}
                >
                  <span className="text-xl" role="img" aria-label={language.name}>
                    {language.flag}
                  </span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{language.nativeName}</div>
                    <div className="text-xs text-muted-foreground">{language.name}</div>
                  </div>
                  {currentLocale === language.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Check className="h-5 w-5 text-primary" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
            <div className="px-3 py-2 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                {isPending ? "Changing language..." : "Language preference saved"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
