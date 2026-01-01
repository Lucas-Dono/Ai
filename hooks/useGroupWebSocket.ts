"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UseGroupWebSocketOptions {
  groupId: string;
  userId: string;
  userName: string;
  onNewMessage?: (message: any) => void;
  onMemberJoined?: (member: any) => void;
  onMemberLeft?: (data: { memberId: string }) => void;
  onSettingsUpdated?: (settings: any) => void;
  onAIResponding?: (data: { aiName: string; timestamp: number }) => void;
  onAIStoppedResponding?: () => void;
  onUserTyping?: (data: { userId: string; userName: string }) => void;
  onUserStoppedTyping?: (data: { userId: string }) => void;
}

export function useGroupWebSocket(options: UseGroupWebSocketOptions) {
  const {
    groupId,
    userId,
    userName,
    onNewMessage,
    onMemberJoined,
    onMemberLeft,
    onSettingsUpdated,
    onAIResponding,
    onAIStoppedResponding,
    onUserTyping,
    onUserStoppedTyping,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(window.location.origin, {
      path: "/api/socket/groups",
    });

    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      socket.emit("join-group", groupId);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    });

    // Group events
    if (onNewMessage) {
      socket.on("new-message", onNewMessage);
    }

    if (onMemberJoined) {
      socket.on("member-joined", onMemberJoined);
    }

    if (onMemberLeft) {
      socket.on("member-left", onMemberLeft);
    }

    if (onSettingsUpdated) {
      socket.on("settings-updated", onSettingsUpdated);
    }

    if (onAIResponding) {
      socket.on("ai-responding", onAIResponding);
    }

    if (onAIStoppedResponding) {
      socket.on("ai-stopped-responding", onAIStoppedResponding);
    }

    if (onUserTyping) {
      socket.on("user-typing", onUserTyping);
    }

    if (onUserStoppedTyping) {
      socket.on("user-stopped-typing", onUserStoppedTyping);
    }

    // Cleanup
    return () => {
      socket.emit("leave-group", groupId);
      socket.disconnect();
    };
  }, [groupId]);

  // Typing indicators
  const startTyping = () => {
    if (!socketRef.current || !isConnected) return;

    socketRef.current.emit("typing-start", {
      groupId,
      userId,
      userName,
    });

    // Auto-stop typing after 3 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000) as unknown as NodeJS.Timeout;
  };

  const stopTyping = () => {
    if (!socketRef.current || !isConnected) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    socketRef.current.emit("typing-stop", {
      groupId,
      userId,
    });
  };

  return {
    isConnected,
    startTyping,
    stopTyping,
  };
}
