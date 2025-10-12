/**
 * useTyping Hook
 * React hook for managing typing indicators
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { TYPING_TIMEOUT } from "@/lib/socket/events";

interface UseTypingOptions {
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  timeout?: number;
}

interface UseTypingReturn {
  isTyping: boolean;
  startTyping: () => void;
  stopTyping: () => void;
  resetTyping: () => void;
}

/**
 * Hook for managing local typing state with auto-timeout
 */
export function useTyping(options: UseTypingOptions = {}): UseTypingReturn {
  const {
    onTypingStart,
    onTypingStop,
    timeout = TYPING_TIMEOUT,
  } = options;

  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      onTypingStart?.();
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingStop?.();
      timeoutRef.current = null;
    }, timeout);
  }, [isTyping, timeout, onTypingStart, onTypingStop]);

  const stopTyping = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsTyping(false);
    onTypingStop?.();
  }, [onTypingStop]);

  const resetTyping = useCallback(() => {
    stopTyping();
  }, [stopTyping]);

  return {
    isTyping,
    startTyping,
    stopTyping,
    resetTyping,
  };
}

/**
 * Hook for tracking remote typing indicators
 */
export function useRemoteTyping() {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    // Clear all timeouts on unmount
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  const setUserTyping = useCallback((userId: string, isTyping: boolean) => {
    if (isTyping) {
      setTypingUsers((prev) => new Set(prev).add(userId));

      // Clear existing timeout
      const existingTimeout = timeoutsRef.current.get(userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set auto-clear timeout
      const timeout = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        timeoutsRef.current.delete(userId);
      }, TYPING_TIMEOUT);

      timeoutsRef.current.set(userId, timeout);
    } else {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });

      // Clear timeout
      const timeout = timeoutsRef.current.get(userId);
      if (timeout) {
        clearTimeout(timeout);
        timeoutsRef.current.delete(userId);
      }
    }
  }, []);

  const clearAllTyping = useCallback(() => {
    setTypingUsers(new Set());
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current.clear();
  }, []);

  return {
    typingUsers: Array.from(typingUsers),
    isAnyoneTyping: typingUsers.size > 0,
    setUserTyping,
    clearAllTyping,
  };
}
