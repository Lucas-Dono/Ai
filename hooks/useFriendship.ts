"use client";

import { useState, useCallback, useEffect } from "react";
import { FriendshipStatus } from "@/components/social/UserCard";
import { friendshipEvents } from "@/lib/events/friendship-events";

interface FriendshipState {
  status: FriendshipStatus;
  friendshipId: string | null;
  isFollowing: boolean;
}

interface UseFriendshipProps {
  userId: string;
  initialStatus?: FriendshipStatus;
  initialFriendshipId?: string | null;
  initialIsFollowing?: boolean;
  onStatusChange?: (newStatus: FriendshipStatus) => void;
}

export function useFriendship({
  userId,
  initialStatus = "none",
  initialFriendshipId = null,
  initialIsFollowing = false,
  onStatusChange,
}: UseFriendshipProps) {
  const [state, setState] = useState<FriendshipState>({
    status: initialStatus,
    friendshipId: initialFriendshipId,
    isFollowing: initialIsFollowing,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función de refresh para actualizar estado desde el servidor
  const refreshStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/friends/status/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const newStatus = data.friendship.status;
        setState((prev) => {
          // Solo actualizar si el estado cambió
          if (prev.status !== newStatus || prev.friendshipId !== data.friendship.friendshipId) {
            onStatusChange?.(newStatus);
            return {
              status: newStatus,
              friendshipId: data.friendship.friendshipId,
              isFollowing: data.isFollowing,
            };
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Error refreshing status:", err);
    }
  }, [userId, onStatusChange]);

  // Escuchar eventos de amistad para actualizar estado en tiempo real
  useEffect(() => {
    const unsubscribe = friendshipEvents.subscribe((event) => {
      // Solo procesar eventos que nos afectan
      if (event.targetId === userId || event.userId === userId) {
        // Refrescar el estado cuando hay un cambio que nos afecta
        refreshStatus();
      }
    });

    return () => unsubscribe();
  }, [userId, refreshStatus]);

  const sendFriendRequest = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al enviar solicitud");
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        status: "pending_sent",
        friendshipId: data.friendship.id,
      }));
      onStatusChange?.("pending_sent");

      // Emitir evento para sincronización
      friendshipEvents.emitRequestSent(data.friendship.requesterId, userId, data.friendship.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, onStatusChange]);

  const cancelFriendRequest = useCallback(async () => {
    if (!state.friendshipId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/friends/${state.friendshipId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al cancelar solicitud");
      }

      setState((prev) => ({
        ...prev,
        status: "none",
        friendshipId: null,
      }));
      onStatusChange?.("none");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.friendshipId, onStatusChange]);

  const acceptFriendRequest = useCallback(async () => {
    if (!state.friendshipId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/friends/requests/${state.friendshipId}/accept`,
        { method: "POST" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al aceptar solicitud");
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        status: "friends",
      }));
      onStatusChange?.("friends");

      // Emitir evento para sincronización - notificar al que envió la solicitud
      friendshipEvents.emitRequestAccepted(
        data.friendship.addresseeId,
        data.friendship.requesterId,
        state.friendshipId
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.friendshipId, onStatusChange]);

  const declineFriendRequest = useCallback(async () => {
    if (!state.friendshipId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/friends/requests/${state.friendshipId}/decline`,
        { method: "POST" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al rechazar solicitud");
      }

      setState((prev) => ({
        ...prev,
        status: "none",
        friendshipId: null,
      }));
      onStatusChange?.("none");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.friendshipId, onStatusChange]);

  const removeFriend = useCallback(async () => {
    if (!state.friendshipId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/friends/${state.friendshipId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar amigo");
      }

      setState((prev) => ({
        ...prev,
        status: "none",
        friendshipId: null,
      }));
      onStatusChange?.("none");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.friendshipId, onStatusChange]);

  const blockUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/friends/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al bloquear usuario");
      }

      setState((prev) => ({
        ...prev,
        status: "blocked",
      }));
      onStatusChange?.("blocked");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, onStatusChange]);

  const follow = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/users/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al seguir");
      }

      setState((prev) => ({
        ...prev,
        isFollowing: true,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const unfollow = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/follow?userId=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al dejar de seguir");
      }

      setState((prev) => ({
        ...prev,
        isFollowing: false,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    ...state,
    isLoading,
    error,
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    blockUser,
    follow,
    unfollow,
    refreshStatus,
  };
}
