/**
 * useGroupSocket Hook
 * React hook for managing Socket.IO connection for group chats
 * Uses a singleton pattern to share connection across components
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  ConnectionState,
  GroupMessageEvent,
  GroupTypingEvent,
  GroupMemberEvent,
} from "@/lib/socket/events";

type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseGroupSocketOptions {
  token?: string;
  userName?: string;
}

interface UseGroupSocketReturn {
  isConnected: boolean;
  connectionState: ConnectionState;
  // Actions
  sendTyping: (isTyping: boolean) => void;
  // Event handlers
  onMessage: (handler: (message: GroupMessageEvent) => void) => () => void;
  onTyping: (handler: (event: GroupTypingEvent) => void) => () => void;
  onMemberJoined: (handler: (member: GroupMemberEvent) => void) => () => void;
  onMemberLeft: (handler: (data: { groupId: string; memberId: string; memberType: 'user' | 'agent' }) => void) => () => void;
  onAIResponding: (handler: (data: { groupId: string; agentId: string; agentName: string }) => void) => () => void;
  onAIStopped: (handler: (data: { groupId: string; agentId: string }) => void) => () => void;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SOCKET_PATH = "/api/socketio";

// Singleton socket instance shared across all hook instances
let globalSocket: SocketClient | null = null;
let globalSocketToken: string | null = null;
let connectionCount = 0;
const joinedRooms = new Set<string>();

/**
 * Custom hook for group Socket.IO connection management
 * Uses singleton pattern - multiple components share the same connection
 */
export function useGroupSocket(
  groupId: string,
  userId: string,
  options: UseGroupSocketOptions = {}
): UseGroupSocketReturn {
  const { token, userName = "Usuario" } = options;

  const [isConnected, setIsConnected] = useState(globalSocket?.connected ?? false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    globalSocket?.connected ? ConnectionState.CONNECTED : ConnectionState.DISCONNECTED
  );

  const hasJoinedRef = useRef(false);

  // Initialize socket connection and join group room
  useEffect(() => {
    if (!token || !groupId || !userId) {
      console.warn("[GroupSocket] Missing required params, NOT connecting to socket");
      return;
    }

    connectionCount++;
    const roomKey = `${groupId}:${userId}`;

    // Create socket only if it doesn't exist or token changed
    if (!globalSocket || globalSocketToken !== token) {
      if (globalSocket) {
        console.log("[GroupSocket] Token changed, reconnecting...");
        globalSocket.disconnect();
      }

      console.log("[GroupSocket] Creating singleton socket connection to:", SOCKET_URL + SOCKET_PATH);
      globalSocketToken = token;

      globalSocket = io(SOCKET_URL, {
        path: SOCKET_PATH,
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      globalSocket.on("connect", () => {
        console.log("[GroupSocket] Connected (singleton)");
        setIsConnected(true);
        setConnectionState(ConnectionState.CONNECTED);

        // Rejoin all rooms after reconnection
        joinedRooms.forEach((key) => {
          const [gId, uId] = key.split(":");
          globalSocket?.emit("group:join", { groupId: gId, userId: uId });
        });
      });

      globalSocket.on("disconnect", (reason) => {
        console.log("[GroupSocket] Disconnected:", reason);
        setIsConnected(false);
        setConnectionState(ConnectionState.DISCONNECTED);
      });

      globalSocket.on("connect_error", (error) => {
        console.error("[GroupSocket] Connection error:", error.message);
        setConnectionState(ConnectionState.ERROR);
      });

      globalSocket.io.on("reconnect", (attempt) => {
        console.log("[GroupSocket] Reconnected after", attempt, "attempts");
        setConnectionState(ConnectionState.CONNECTED);
      });

      globalSocket.io.on("reconnect_attempt", (attempt) => {
        console.log("[GroupSocket] Reconnection attempt", attempt);
        setConnectionState(ConnectionState.RECONNECTING);
      });
    } else {
      // Sync state with existing connection
      setIsConnected(globalSocket.connected);
      setConnectionState(globalSocket.connected ? ConnectionState.CONNECTED : ConnectionState.DISCONNECTED);
    }

    // Join room if not already joined
    if (!joinedRooms.has(roomKey)) {
      if (globalSocket.connected) {
        globalSocket.emit("group:join", { groupId, userId });
        console.log("[GroupSocket] Joined room:", roomKey);
      }
      joinedRooms.add(roomKey);
      hasJoinedRef.current = true;
    }

    return () => {
      connectionCount--;

      // Leave room
      if (hasJoinedRef.current && joinedRooms.has(roomKey)) {
        globalSocket?.emit("group:leave", { groupId, userId });
        joinedRooms.delete(roomKey);
        hasJoinedRef.current = false;
        console.log("[GroupSocket] Left room:", roomKey);
      }

      // Disconnect only when no more components are using the socket
      if (connectionCount === 0 && globalSocket) {
        console.log("[GroupSocket] No more users, disconnecting singleton");
        globalSocket.disconnect();
        globalSocket = null;
        globalSocketToken = null;
        joinedRooms.clear();
      }
    };
  }, [token, groupId, userId]);

  // Send typing indicator
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (globalSocket?.connected) {
        globalSocket.emit("group:typing", {
          groupId,
          userId,
          userName,
          isTyping,
        });
      }
    },
    [groupId, userId, userName]
  );

  // Subscribe to messages
  const onMessage = useCallback(
    (handler: (message: GroupMessageEvent) => void) => {
      const wrappedHandler = (message: GroupMessageEvent) => {
        // Only handle messages for this group
        if (message.groupId === groupId) {
          handler(message);
        }
      };

      globalSocket?.on("group:message", wrappedHandler);

      return () => {
        globalSocket?.off("group:message", wrappedHandler);
      };
    },
    [groupId]
  );

  // Subscribe to typing events
  const onTyping = useCallback(
    (handler: (event: GroupTypingEvent) => void) => {
      const wrappedHandler = (event: GroupTypingEvent) => {
        // Only handle typing for this group and not from current user
        if (event.groupId === groupId && event.userId !== userId) {
          handler(event);
        }
      };

      globalSocket?.on("group:typing", wrappedHandler);

      return () => {
        globalSocket?.off("group:typing", wrappedHandler);
      };
    },
    [groupId, userId]
  );

  // Subscribe to member joined events
  const onMemberJoined = useCallback(
    (handler: (member: GroupMemberEvent) => void) => {
      const wrappedHandler = (member: GroupMemberEvent) => {
        if (member.groupId === groupId) {
          handler(member);
        }
      };

      globalSocket?.on("group:member:joined", wrappedHandler);

      return () => {
        globalSocket?.off("group:member:joined", wrappedHandler);
      };
    },
    [groupId]
  );

  // Subscribe to member left events
  const onMemberLeft = useCallback(
    (handler: (data: { groupId: string; memberId: string; memberType: 'user' | 'agent' }) => void) => {
      const wrappedHandler = (data: { groupId: string; memberId: string; memberType: 'user' | 'agent' }) => {
        if (data.groupId === groupId) {
          handler(data);
        }
      };

      globalSocket?.on("group:member:left", wrappedHandler);

      return () => {
        globalSocket?.off("group:member:left", wrappedHandler);
      };
    },
    [groupId]
  );

  // Subscribe to AI responding events
  const onAIResponding = useCallback(
    (handler: (data: { groupId: string; agentId: string; agentName: string }) => void) => {
      const wrappedHandler = (data: { groupId: string; agentId: string; agentName: string }) => {
        if (data.groupId === groupId) {
          handler(data);
        }
      };

      globalSocket?.on("group:ai:responding", wrappedHandler);

      return () => {
        globalSocket?.off("group:ai:responding", wrappedHandler);
      };
    },
    [groupId]
  );

  // Subscribe to AI stopped events
  const onAIStopped = useCallback(
    (handler: (data: { groupId: string; agentId: string }) => void) => {
      const wrappedHandler = (data: { groupId: string; agentId: string }) => {
        if (data.groupId === groupId) {
          handler(data);
        }
      };

      globalSocket?.on("group:ai:stopped", wrappedHandler);

      return () => {
        globalSocket?.off("group:ai:stopped", wrappedHandler);
      };
    },
    [groupId]
  );

  return {
    isConnected,
    connectionState,
    sendTyping,
    onMessage,
    onTyping,
    onMemberJoined,
    onMemberLeft,
    onAIResponding,
    onAIStopped,
  };
}
