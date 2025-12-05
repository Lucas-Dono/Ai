/**
 * Hook para conectar al WebSocket de bonds y escuchar eventos en tiempo real
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { BondEventType } from "@/lib/websocket/bond-event-types";
import { BondEvent } from "@/lib/websocket/bonds-events";

export function useBondSocket() {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<BondEvent[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Conectar al socket
    const socketUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const newSocket = io(socketUrl, {
      path: "/api/socketio",
      auth: { session },
      autoConnect: true,
    });

    newSocket.on("connect", () => {
      console.log("[Socket] Connected");
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("[Socket] Disconnected");
      setConnected(false);
    });

    newSocket.on("error", (error) => {
      console.error("[Socket] Error:", error);
    });

    // Escuchar todos los eventos de bonds
    Object.values(BondEventType).forEach((eventType) => {
      newSocket.on(eventType, (event: BondEvent) => {
        console.log(`[Socket] Event received:`, eventType, event);
        setEvents((prev) => [...prev.slice(-49), event]); // Mantener últimos 50
      });
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [session?.user?.id]);

  // Subscribe a un bond específico
  const subscribeToBond = useCallback(
    (bondId: string) => {
      if (socket) {
        socket.emit("subscribe_bond", bondId);
      }
    },
    [socket]
  );

  // Unsubscribe de un bond
  const unsubscribeFromBond = useCallback(
    (bondId: string) => {
      if (socket) {
        socket.emit("unsubscribe_bond", bondId);
      }
    },
    [socket]
  );

  // Subscribe a leaderboard
  const subscribeToLeaderboard = useCallback(
    (tier: string) => {
      if (socket) {
        socket.emit("subscribe_leaderboard", tier);
      }
    },
    [socket]
  );

  const unsubscribeFromLeaderboard = useCallback(
    (tier: string) => {
      if (socket) {
        socket.emit("unsubscribe_leaderboard", tier);
      }
    },
    [socket]
  );

  // Escuchar evento específico
  const on = useCallback(
    (eventType: BondEventType, callback: (event: BondEvent) => void) => {
      if (socket) {
        socket.on(eventType, callback);
      }
    },
    [socket]
  );

  // Dejar de escuchar evento
  const off = useCallback(
    (eventType: BondEventType, callback?: (event: BondEvent) => void) => {
      if (socket) {
        if (callback) {
          socket.off(eventType, callback);
        } else {
          socket.off(eventType);
        }
      }
    },
    [socket]
  );

  // Clear events history
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    socket,
    connected,
    events,
    subscribeToBond,
    unsubscribeFromBond,
    subscribeToLeaderboard,
    unsubscribeFromLeaderboard,
    on,
    off,
    clearEvents,
  };
}

export default useBondSocket;
