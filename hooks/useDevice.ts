/**
 * useDevice - Hook unificado para detección de dispositivo
 *
 * Proporciona información sobre el tipo de dispositivo y características
 * para adaptar la UI de manera responsive.
 */

"use client";

import { useState, useEffect, useMemo } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";
export type Orientation = "portrait" | "landscape";

interface DeviceInfo {
  /** Tipo de dispositivo: mobile, tablet, desktop */
  type: DeviceType;
  /** Si es un dispositivo móvil (mobile o tablet) */
  isMobile: boolean;
  /** Si es específicamente un teléfono */
  isPhone: boolean;
  /** Si es una tablet */
  isTablet: boolean;
  /** Si es desktop */
  isDesktop: boolean;
  /** Si es un dispositivo touch */
  isTouch: boolean;
  /** Si es iOS */
  isIOS: boolean;
  /** Si es Android */
  isAndroid: boolean;
  /** Orientación actual */
  orientation: Orientation;
  /** Ancho de la ventana */
  width: number;
  /** Alto de la ventana */
  height: number;
  /** Si la app está en modo PWA/standalone */
  isStandalone: boolean;
  /** Si el dispositivo tiene notch (iPhone X+) */
  hasNotch: boolean;
}

// Breakpoints sincronizados con Tailwind
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// User agent patterns
const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
const IOS_UA = /iPhone|iPad|iPod/i;
const ANDROID_UA = /Android/i;
const TABLET_UA = /iPad|Android(?!.*Mobile)|Tablet/i;

/**
 * Detecta el tipo de dispositivo basado en el user agent y el ancho de pantalla
 */
function detectDeviceType(userAgent: string, width: number): DeviceType {
  // Si es un user agent de tablet
  if (TABLET_UA.test(userAgent)) {
    return "tablet";
  }

  // Si es un user agent de móvil
  if (MOBILE_UA.test(userAgent)) {
    // Diferenciar entre phone y tablet por tamaño
    return width >= BREAKPOINTS.md ? "tablet" : "mobile";
  }

  // Basado solo en el ancho de pantalla
  if (width < BREAKPOINTS.md) {
    return "mobile";
  } else if (width < BREAKPOINTS.lg) {
    return "tablet";
  }

  return "desktop";
}

/**
 * Detecta si el dispositivo tiene notch (iPhone X y posteriores)
 */
function detectNotch(): boolean {
  if (typeof window === "undefined") return false;

  // Verificar CSS env() para safe-area-inset
  const hasEnvSupport = CSS.supports("padding-top: env(safe-area-inset-top)");

  if (!hasEnvSupport) return false;

  // Crear elemento temporal para medir
  const div = document.createElement("div");
  div.style.paddingTop = "env(safe-area-inset-top)";
  document.body.appendChild(div);
  const paddingTop = parseInt(getComputedStyle(div).paddingTop) || 0;
  document.body.removeChild(div);

  return paddingTop > 20; // Los dispositivos con notch tienen > 20px
}

/**
 * Detecta si está en modo PWA/standalone
 */
function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Hook principal para detección de dispositivo
 */
export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    // Valores por defecto para SSR
    if (typeof window === "undefined") {
      return {
        type: "desktop",
        isMobile: false,
        isPhone: false,
        isTablet: false,
        isDesktop: true,
        isTouch: false,
        isIOS: false,
        isAndroid: false,
        orientation: "landscape",
        width: 1920,
        height: 1080,
        isStandalone: false,
        hasNotch: false,
      };
    }

    const userAgent = navigator.userAgent;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const type = detectDeviceType(userAgent, width);

    return {
      type,
      isMobile: type === "mobile" || type === "tablet",
      isPhone: type === "mobile",
      isTablet: type === "tablet",
      isDesktop: type === "desktop",
      isTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
      isIOS: IOS_UA.test(userAgent),
      isAndroid: ANDROID_UA.test(userAgent),
      orientation: width > height ? "landscape" : "portrait",
      width,
      height,
      isStandalone: detectStandalone(),
      hasNotch: false, // Se detecta después del mount
    };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateDeviceInfo = () => {
      const userAgent = navigator.userAgent;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const type = detectDeviceType(userAgent, width);

      setDeviceInfo({
        type,
        isMobile: type === "mobile" || type === "tablet",
        isPhone: type === "mobile",
        isTablet: type === "tablet",
        isDesktop: type === "desktop",
        isTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
        isIOS: IOS_UA.test(userAgent),
        isAndroid: ANDROID_UA.test(userAgent),
        orientation: width > height ? "landscape" : "portrait",
        width,
        height,
        isStandalone: detectStandalone(),
        hasNotch: detectNotch(),
      });
    };

    // Actualizar al montar
    updateDeviceInfo();

    // Actualizar en resize
    window.addEventListener("resize", updateDeviceInfo);

    // Actualizar en cambio de orientación
    window.addEventListener("orientationchange", updateDeviceInfo);

    return () => {
      window.removeEventListener("resize", updateDeviceInfo);
      window.removeEventListener("orientationchange", updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

/**
 * Hook simplificado que solo retorna si es móvil o no
 */
export function useIsMobile(): boolean {
  const { isMobile } = useDevice();
  return isMobile;
}

/**
 * Hook para obtener el breakpoint actual de Tailwind
 */
export function useBreakpoint(): "xs" | "sm" | "md" | "lg" | "xl" | "2xl" {
  const { width } = useDevice();

  if (width >= BREAKPOINTS["2xl"]) return "2xl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
}

/**
 * Hook para media queries programáticas
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Usar el método moderno si está disponible
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}

export default useDevice;
