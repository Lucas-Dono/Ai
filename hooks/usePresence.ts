/**
 * usePresence Hook
 * React hook for tracking online/offline presence of users
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./useSocket";
import { PRESENCE_HEARTBEAT } from "@/lib/socket/events";

export type PresenceStatus = "online" | "offline" | "away";

interface PresenceState {
  [userId: string]: {
    status: PresenceStatus;
    lastSeen: number;
  };
}

interface UsePresenceOptions {
  userId?: string;
  token?: string;
  heartbeatInterval?: number;
}

interface UsePresenceReturn {
  presence: PresenceState;
  isUserOnline: (userId: string) => boolean;
  getUserStatus: (userId: string) => PresenceStatus;
  getLastSeen: (userId: string) => number | null;
  setOnline: () => void;
  setOffline: () => void;
}

/**
 * Hook for managing user presence tracking
 */
export function usePresence(options: UsePresenceOptions = {}): UsePresenceReturn {
  const {
    userId,
    token,
    heartbeatInterval = PRESENCE_HEARTBEAT,
  } = options;

  const [presence, setPresence] = useState<PresenceState>({});
  const { socket, isConnected, on, off } = useSocket({ token, autoConnect: !!token });

  // Listen for presence updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleUserOnline = (data: { userId: string; timestamp: number }) => {
      setPresence((prev) => ({
        ...prev,
        [data.userId]: {
          status: "online",
          lastSeen: data.timestamp,
        },
      }));
    };

    const handleUserOffline = (data: { userId: string; timestamp: number }) => {
      setPresence((prev) => ({
        ...prev,
        [data.userId]: {
          status: "offline",
          lastSeen: data.timestamp,
        },
      }));
    };

    on("presence:user:online", handleUserOnline);
    on("presence:user:offline", handleUserOffline);

    return () => {
      off("presence:user:online", handleUserOnline);
      off("presence:user:offline", handleUserOffline);
    };
  }, [socket, isConnected, on, off]);

  // Send heartbeat to maintain online status
  useEffect(() => {
    if (!socket || !isConnected || !userId) return;

    // Send initial online status
    socket.emit("presence:online", { userId });

    // Send periodic heartbeats
    const interval = setInterval(() => {
      if (socket.connected) {
        socket.emit("presence:online", { userId });
      }
    }, heartbeatInterval);

    return () => {
      clearInterval(interval);
    };
  }, [socket, isConnected, userId, heartbeatInterval]);

  // Auto-detect away status based on user activity
  useEffect(() => {
    if (!userId) return;

    let activityTimer: NodeJS.Timeout;
    let isAway = false;

    const resetActivityTimer = () => {
      if (isAway) {
        isAway = false;
        setPresence((prev) => ({
          ...prev,
          [userId]: {
            status: "online",
            lastSeen: Date.now(),
          },
        }));
      }

      clearTimeout(activityTimer);
      activityTimer = setTimeout(() => {
        isAway = true;
        setPresence((prev) => ({
          ...prev,
          [userId]: {
            status: "away",
            lastSeen: Date.now(),
          },
        }));
      }, 300000); // 5 minutes of inactivity
    };

    // Listen for user activity
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, resetActivityTimer);
    });

    // Initialize timer
    resetActivityTimer();

    return () => {
      clearTimeout(activityTimer);
      events.forEach((event) => {
        window.removeEventListener(event, resetActivityTimer);
      });
    };
  }, [userId]);

  const isUserOnline = useCallback(
    (checkUserId: string): boolean => {
      return presence[checkUserId]?.status === "online";
    },
    [presence]
  );

  const getUserStatus = useCallback(
    (checkUserId: string): PresenceStatus => {
      return presence[checkUserId]?.status || "offline";
    },
    [presence]
  );

  const getLastSeen = useCallback(
    (checkUserId: string): number | null => {
      return presence[checkUserId]?.lastSeen || null;
    },
    [presence]
  );

  const setOnline = useCallback(() => {
    if (socket && userId) {
      socket.emit("presence:online", { userId });
    }
  }, [socket, userId]);

  const setOffline = useCallback(() => {
    if (socket && userId) {
      socket.emit("presence:offline", { userId });
    }
  }, [socket, userId]);

  return {
    presence,
    isUserOnline,
    getUserStatus,
    getLastSeen,
    setOnline,
    setOffline,
  };
}

/**
 * Format last seen timestamp to human-readable string
 */
export function formatLastSeen(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}
