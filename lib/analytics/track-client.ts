/**
 * Client-Side Analytics Tracking
 *
 * Utilidad para tracking de eventos desde el navegador.
 * Features:
 * - Auto-captura de sessionId, URL, referrer, userAgent
 * - Persistencia de UTM params en localStorage
 * - Device detection automática
 * - Fire-and-forget (no bloquea UX)
 * - Error handling silencioso
 */

import type {
  TrackEventParams,
  EventType,
  EventMetadata,
  UTMParams,
  DeviceInfo,
  SessionInfo,
} from "./types";

// ============================================================================
// CONSTANTS
// ============================================================================

const SESSION_STORAGE_KEY = "analytics_session";
const UTM_STORAGE_KEY = "analytics_utm";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Genera un ID de sesión único
 */
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Obtiene o crea una sesión persistente
 *
 * La sesión se almacena en localStorage y se mantiene activa mientras
 * el usuario interactúe dentro del timeout (30 min).
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    return generateSessionId(); // SSR fallback
  }

  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);

    if (stored) {
      const session: SessionInfo = JSON.parse(stored);
      const lastActivity = new Date(session.lastActivityAt).getTime();
      const now = Date.now();

      // Sesión válida si la última actividad fue hace menos de 30 min
      if (now - lastActivity < SESSION_TIMEOUT) {
        // Actualizar última actividad
        session.lastActivityAt = new Date().toISOString();
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        return session.sessionId;
      }
    }

    // Crear nueva sesión
    const newSession: SessionInfo = {
      sessionId: generateSessionId(),
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      utm: getUTMParams(), // Capturar UTMs si existen
    };

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
    return newSession.sessionId;
  } catch (error) {
    // En caso de error (localStorage bloqueado, etc.), generar ID temporal
    console.warn("[Analytics] Error managing session:", error);
    return generateSessionId();
  }
}

/**
 * Obtiene la sesión actual (si existe)
 */
export function getCurrentSession(): SessionInfo | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;

    const session: SessionInfo = JSON.parse(stored);
    const lastActivity = new Date(session.lastActivityAt).getTime();
    const now = Date.now();

    // Validar que la sesión no haya expirado
    if (now - lastActivity >= SESSION_TIMEOUT) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return session;
  } catch (error) {
    console.warn("[Analytics] Error reading session:", error);
    return null;
  }
}

// ============================================================================
// UTM TRACKING
// ============================================================================

/**
 * Extrae parámetros UTM de la URL actual
 *
 * Los UTM params se capturan al primer visit y se persisten en localStorage
 * para asociarlos a toda la sesión (attribution marketing).
 */
export function getUTMParams(): UTMParams | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    // Primero intentar obtener de localStorage (persistidos)
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      const utms: UTMParams = JSON.parse(stored);
      // Si existen UTMs guardados y no hay nuevos en URL, usar los guardados
      const urlParams = new URLSearchParams(window.location.search);
      const hasUrlUtms = ["utm_source", "utm_medium", "utm_campaign"].some((key) =>
        urlParams.has(key)
      );

      if (!hasUrlUtms && utms) {
        return utms;
      }
    }

    // Extraer de URL actual
    const params = new URLSearchParams(window.location.search);
    const utms: UTMParams = {};

    // Extraer todos los parámetros UTM
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(
      (key) => {
        const value = params.get(key);
        if (value) {
          utms[key as keyof UTMParams] = value;
        }
      }
    );

    // Si encontramos UTMs nuevos, persistirlos
    if (Object.keys(utms).length > 0) {
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utms));
      return utms;
    }

    // Si había guardados, retornarlos
    if (stored) {
      return JSON.parse(stored);
    }

    return undefined;
  } catch (error) {
    console.warn("[Analytics] Error extracting UTM params:", error);
    return undefined;
  }
}

/**
 * Limpia los UTM params guardados (útil para testing)
 */
export function clearUTMParams(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(UTM_STORAGE_KEY);
  } catch (error) {
    console.warn("[Analytics] Error clearing UTM params:", error);
  }
}

// ============================================================================
// DEVICE DETECTION
// ============================================================================

/**
 * Detecta el tipo de dispositivo basado en userAgent y viewport
 */
export function detectDeviceType(): "mobile" | "desktop" | "tablet" {
  if (typeof window === "undefined") return "desktop";

  const userAgent = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;

  // Tablet detection
  if (
    (userAgent.includes("ipad") ||
      (userAgent.includes("android") && !userAgent.includes("mobile")) ||
      userAgent.includes("tablet")) &&
    width >= 768
  ) {
    return "tablet";
  }

  // Mobile detection
  if (
    userAgent.includes("mobile") ||
    userAgent.includes("iphone") ||
    userAgent.includes("android") ||
    width < 768
  ) {
    return "mobile";
  }

  return "desktop";
}

/**
 * Detecta el navegador
 */
export function detectBrowser(): string {
  if (typeof window === "undefined") return "unknown";

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("edg")) return "edge";
  if (userAgent.includes("chrome")) return "chrome";
  if (userAgent.includes("safari")) return "safari";
  if (userAgent.includes("firefox")) return "firefox";
  if (userAgent.includes("opera") || userAgent.includes("opr")) return "opera";

  return "other";
}

/**
 * Detecta el sistema operativo
 */
export function detectOS(): string {
  if (typeof window === "undefined") return "unknown";

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("win")) return "windows";
  if (userAgent.includes("mac")) return "macos";
  if (userAgent.includes("iphone") || userAgent.includes("ipad")) return "ios";
  if (userAgent.includes("android")) return "android";
  if (userAgent.includes("linux")) return "linux";

  return "other";
}

/**
 * Obtiene información completa del dispositivo
 */
export function getDeviceInfo(): DeviceInfo {
  return {
    deviceType: detectDeviceType(),
    browser: detectBrowser(),
    os: detectOS(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
  };
}

// ============================================================================
// BROWSER CONTEXT
// ============================================================================

/**
 * Captura el contexto del navegador (URL, referrer, etc.)
 */
function getBrowserContext(): Partial<EventMetadata> {
  if (typeof window === "undefined") return {};

  return {
    url: window.location.href,
    referrer: document.referrer || undefined,
    userAgent: navigator.userAgent,
  };
}

// ============================================================================
// EVENT TRACKING
// ============================================================================

/**
 * Trackea un evento de analytics
 *
 * Esta función:
 * 1. Auto-captura sessionId, UTM params, device info, browser context
 * 2. Envía el evento al endpoint /api/analytics/track
 * 3. Es no-bloqueante (async, fire-and-forget)
 * 4. Maneja errores de forma silenciosa (no rompe UX)
 *
 * @example
 * ```ts
 * import { trackEvent, LandingEventType } from '@/lib/analytics/track-client';
 *
 * // Evento simple
 * trackEvent({ eventType: LandingEventType.PAGE_VIEW });
 *
 * // Evento con metadata
 * trackEvent({
 *   eventType: LandingEventType.DEMO_MESSAGE,
 *   metadata: { messageCount: 1, messageLength: 42 }
 * });
 * ```
 */
export async function trackEvent({
  eventType,
  metadata = {},
  sessionId,
}: TrackEventParams): Promise<void> {
  // No hacer nada en SSR
  if (typeof window === "undefined") return;

  try {
    // Auto-captura de datos
    const finalSessionId = sessionId || getOrCreateSessionId();
    const utmParams = getUTMParams();
    const deviceInfo = getDeviceInfo();
    const browserContext = getBrowserContext();

    // Combinar toda la metadata
    const enrichedMetadata: EventMetadata = {
      ...metadata,
      sessionId: finalSessionId,
      timestamp: new Date().toISOString(),

      // UTM params
      ...(utmParams && {
        utmSource: utmParams.utm_source,
        utmMedium: utmParams.utm_medium,
        utmCampaign: utmParams.utm_campaign,
      }),

      // Device info
      ...deviceInfo,

      // Browser context
      ...browserContext,
    };

    // Enviar al endpoint (fire-and-forget)
    // No usar await para no bloquear la UI
    fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventType,
        metadata: enrichedMetadata,
      }),
      // keepalive: true permite que el request se complete aunque el usuario navegue
      keepalive: true,
    }).catch((error) => {
      // Error silencioso - no queremos romper la UX por un error de tracking
      console.warn("[Analytics] Failed to track event:", error);
    });
  } catch (error) {
    // Error silencioso en caso de que algo falle
    console.warn("[Analytics] Error in trackEvent:", error);
  }
}

/**
 * Trackea múltiples eventos en batch (más eficiente)
 *
 * @example
 * ```ts
 * trackEventsBatch([
 *   { eventType: LandingEventType.PAGE_VIEW },
 *   { eventType: LandingEventType.DEMO_START, metadata: { ... } }
 * ]);
 * ```
 */
export async function trackEventsBatch(events: TrackEventParams[]): Promise<void> {
  // Trackear cada evento individualmente
  // En el futuro podríamos crear un endpoint batch para optimizar
  events.forEach((event) => trackEvent(event));
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Limpia todos los datos de analytics del cliente
 * (útil para testing y debugging)
 */
export function clearAnalyticsData(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(UTM_STORAGE_KEY);
  } catch (error) {
    console.warn("[Analytics] Error clearing analytics data:", error);
  }
}

/**
 * Obtiene información de debugging del estado actual de analytics
 */
export function getAnalyticsDebugInfo() {
  if (typeof window === "undefined") {
    return { error: "Not running in browser" };
  }

  return {
    session: getCurrentSession(),
    utm: getUTMParams(),
    device: getDeviceInfo(),
    browserContext: getBrowserContext(),
  };
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Track page view with automatic metadata
 */
export async function trackPageView(additionalMetadata?: Record<string, any>): Promise<void> {
  return trackEvent({
    eventType: "landing.page_view" as EventType,
    metadata: {
      ...additionalMetadata,
    } as any,
  });
}

/**
 * Track scroll depth
 */
export function createScrollDepthTracker(onDepthReached?: (depth: number) => void) {
  if (typeof window === "undefined") return { cleanup: () => {} };

  const trackedDepths = new Set<number>();
  const depthThresholds = [25, 50, 75, 100];

  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;

    depthThresholds.forEach((threshold) => {
      if (scrollPercent >= threshold && !trackedDepths.has(threshold)) {
        trackedDepths.add(threshold);

        trackEvent({
          eventType: "landing.scroll_depth" as EventType,
          metadata: {
            scrollDepth: threshold as 25 | 50 | 75 | 100,
          } as any,
        }).catch(() => {});

        onDepthReached?.(threshold);
      }
    });
  };

  // Throttle scroll events
  let ticking = false;
  const throttledScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", throttledScroll, { passive: true });

  return {
    cleanup: () => {
      window.removeEventListener("scroll", throttledScroll);
    },
  };
}
