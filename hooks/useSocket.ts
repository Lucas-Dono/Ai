/**
 * useSocket Hook
 * React hook for managing Socket.IO connection with auto-reconnection
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  ConnectionState,
} from "@/lib/socket/events";

type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseSocketOptions {
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  token?: string;
}

interface UseSocketReturn {
  socket: SocketClient | null;
  isConnected: boolean;
  connectionState: ConnectionState;
  connect: () => void;
  disconnect: () => void;
  emit: <K extends keyof ClientToServerEvents>(
    event: K,
    ...args: Parameters<ClientToServerEvents[K]>
  ) => void;
  on: <K extends keyof ServerToClientEvents>(
    event: K,
    handler: ServerToClientEvents[K]
  ) => void;
  off: <K extends keyof ServerToClientEvents>(
    event: K,
    handler: ServerToClientEvents[K]
  ) => void;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SOCKET_PATH = "/api/socketio";

/**
 * Custom hook for Socket.IO connection management
 */
export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const {
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
    token,
  } = options;

  const [socket, setSocket] = useState<SocketClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.DISCONNECTED
  );

  const socketRef = useRef<SocketClient | null>(null);
  const eventHandlersRef = useRef<Map<string, Function>>(new Map());

  // Initialize socket connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    if (!token) {
      console.error("[Socket] No authentication token provided");
      return;
    }

    setConnectionState(ConnectionState.CONNECTING);

    const newSocket = io(SOCKET_URL, {
      path: SOCKET_PATH,
      auth: { token },
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
      autoConnect: false,
    });

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("[Socket] Connected");
      setIsConnected(true);
      setConnectionState(ConnectionState.CONNECTED);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      setIsConnected(false);
      setConnectionState(ConnectionState.DISCONNECTED);
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error);
      setConnectionState(ConnectionState.ERROR);
    });

    newSocket.io.on("reconnect", (attempt) => {
      console.log("[Socket] Reconnected after", attempt, "attempts");
      setConnectionState(ConnectionState.CONNECTED);
    });

    newSocket.io.on("reconnect_attempt", (attempt) => {
      console.log("[Socket] Reconnection attempt", attempt);
      setConnectionState(ConnectionState.RECONNECTING);
    });

    newSocket.io.on("reconnect_error", (error) => {
      console.error("[Socket] Reconnection error:", error);
    });

    newSocket.io.on("reconnect_failed", () => {
      console.error("[Socket] Reconnection failed");
      setConnectionState(ConnectionState.ERROR);
    });

    // Re-attach event handlers
    eventHandlersRef.current.forEach((handler, event) => {
      newSocket.on(event as keyof ServerToClientEvents, handler as any);
    });

    newSocket.connect();
    socketRef.current = newSocket;
    setSocket(newSocket);
  }, [token, reconnection, reconnectionAttempts, reconnectionDelay]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      setConnectionState(ConnectionState.DISCONNECTING);
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
  }, []);

  // Emit event
  const emit = useCallback(
    <K extends keyof ClientToServerEvents>(
      event: K,
      ...args: Parameters<ClientToServerEvents[K]>
    ) => {
      if (socketRef.current?.connected) {
        // @ts-ignore - Type complexity with variadic parameters
        socketRef.current.emit(event, ...args);
      } else {
        console.warn("[Socket] Cannot emit - not connected:", event);
      }
    },
    []
  );

  // Subscribe to event
  const on = useCallback(
    <K extends keyof ServerToClientEvents>(
      event: K,
      handler: ServerToClientEvents[K]
    ) => {
      if (socketRef.current) {
        socketRef.current.on(event, handler as any);
        eventHandlersRef.current.set(event, handler);
      }
    },
    []
  );

  // Unsubscribe from event
  const off = useCallback(
    <K extends keyof ServerToClientEvents>(
      event: K,
      handler: ServerToClientEvents[K]
    ) => {
      if (socketRef.current) {
        socketRef.current.off(event, handler as any);
        eventHandlersRef.current.delete(event);
      }
    },
    []
  );

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, token, connect, disconnect]);

  return {
    socket,
    isConnected,
    connectionState,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}

/**
 * Hook for chat-specific socket operations
 */
export function useChatSocket(agentId: string, userId: string, token?: string) {
  const { socket, isConnected, emit, on, off } = useSocket({ token });
  const [isInRoom, setIsInRoom] = useState(false);

  // Join chat room on connect
  useEffect(() => {
    if (isConnected && socket && !isInRoom) {
      emit("chat:join", { agentId, userId });
      setIsInRoom(true);
    }
  }, [isConnected, socket, agentId, userId, isInRoom, emit]);

  // Leave room on unmount
  useEffect(() => {
    return () => {
      if (isInRoom && socket) {
        emit("chat:leave", { agentId, userId });
      }
    };
  }, [isInRoom, socket, agentId, userId, emit]);

  // Send message
  const sendMessage = useCallback(
    (message: string) => {
      emit("chat:message", { agentId, message, userId });
    },
    [agentId, userId, emit]
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      emit("chat:typing", { agentId, userId, isTyping });
    },
    [agentId, userId, emit]
  );

  return {
    socket,
    isConnected,
    sendMessage,
    sendTyping,
    on,
    off,
  };
}
