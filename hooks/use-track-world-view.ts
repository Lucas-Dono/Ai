import { useEffect, useRef } from "react";

/**
 * Hook para trackear automáticamente las visitas a mundos
 * Registra una vista cuando el usuario entra y trackea el tiempo cuando sale
 */
export function useTrackWorldView(worldId: string | null) {
  const startTime = useRef<number | null>(null);
  const viewTracked = useRef(false);

  useEffect(() => {
    if (!worldId) return;

    // Trackear vista inicial (solo una vez)
    const trackView = async () => {
      if (viewTracked.current) return;

      try {
        await fetch(`/api/worlds/${worldId}/track-view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        viewTracked.current = true;
        startTime.current = Date.now();
      } catch (error) {
        console.error("Error tracking world view:", error);
      }
    };

    trackView();

    // Trackear tiempo al salir
    const handleBeforeUnload = async () => {
      if (!startTime.current) return;

      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000); // en segundos

      // Usar sendBeacon para enviar datos antes de salir (más confiable)
      const data = JSON.stringify({ timeSpent });
      const blob = new Blob([data], { type: "application/json" });

      navigator.sendBeacon(`/api/worlds/${worldId}/track-view`, blob);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // También trackear al desmontar el componente
      if (startTime.current) {
        const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);

        // Intentar enviar con fetch (si aún está montado)
        fetch(`/api/worlds/${worldId}/track-view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timeSpent }),
          keepalive: true, // Importante para que funcione al cerrar
        }).catch(() => {
          // Ignorar errores silenciosamente
        });
      }
    };
  }, [worldId]);
}
