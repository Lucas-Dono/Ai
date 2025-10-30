import { useEffect, useRef } from "react";

interface TrackInteractionParams {
  userId: string | null;
  itemType: "agent" | "world";
  itemId: string;
  interactionType?: "view" | "chat";
}

/**
 * Hook para trackear interacciones automáticamente
 * Similar a useTrackWorldView pero más genérico
 */
export function useTrackInteraction({
  userId,
  itemType,
  itemId,
  interactionType = "view",
}: TrackInteractionParams) {
  const startTime = useRef<number | null>(null);
  const tracked = useRef(false);
  const messageCount = useRef(0);

  useEffect(() => {
    if (!userId || !itemId) return;

    // Track inicial
    const trackInitial = async () => {
      if (tracked.current) return;

      try {
        await fetch("/api/recommendations/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            itemType,
            itemId,
            interactionType,
          }),
        });

        tracked.current = true;
        startTime.current = Date.now();
      } catch (error) {
        console.error("Error tracking interaction:", error);
      }
    };

    trackInitial();

    // Track al salir
    const handleBeforeUnload = () => {
      if (!startTime.current) return;

      const duration = Math.floor((Date.now() - startTime.current) / 1000);

      const data = JSON.stringify({
        userId,
        itemType,
        itemId,
        interactionType: "finish",
        duration,
        messageCount: messageCount.current,
        completionRate: messageCount.current > 0 ? 1.0 : 0.5,
      });

      const blob = new Blob([data], { type: "application/json" });
      navigator.sendBeacon("/api/recommendations/track", blob);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Track al desmontar
      if (startTime.current) {
        const duration = Math.floor((Date.now() - startTime.current) / 1000);

        fetch("/api/recommendations/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            itemType,
            itemId,
            interactionType: "finish",
            duration,
            messageCount: messageCount.current,
          }),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, [userId, itemType, itemId, interactionType]);

  // Función para incrementar contador de mensajes
  const incrementMessageCount = () => {
    messageCount.current += 1;
  };

  return { incrementMessageCount };
}
