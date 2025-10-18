/**
 * Socket.io TypeScript Definitions
 *
 * Properly typed socket events for client and server
 * Eliminates need for @ts-expect-error throughout codebase
 */

import type { Reaction } from "@/components/chat/WhatsAppChat";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLIENT TO SERVER EVENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ClientToServerEvents {
  // Room management
  'join:agent:room': (data: { agentId: string }) => void;
  'leave:agent:room': (data: { agentId: string }) => void;

  // Messaging
  'user:message': (data: {
    agentId: string;
    userId: string;
    message: string;
    metadata?: {
      type?: 'text' | 'audio' | 'gif' | 'image';
      emotion?: string;
      intensity?: number;
      tone?: string;
      duration?: number;
      [key: string]: unknown;
    };
  }) => void;

  // Reactions
  'message:react': (data: {
    messageId: string;
    emoji: string;
    userId: string;
  }) => void;

  // Typing indicators
  'user:typing:start': (data: { agentId: string; userId: string }) => void;
  'user:typing:stop': (data: { agentId: string; userId: string }) => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVER TO CLIENT EVENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ServerToClientEvents {
  // Agent messages
  'agent:message': (data: {
    messageId: string;
    agentId: string;
    content: {
      text?: string;
      audioUrl?: string;
      imageUrl?: string;
      emotion?: string;
    };
    // Behavior system metadata
    behaviors?: {
      active: string[];
      phase?: number;
      safetyLevel: 'SAFE' | 'WARNING' | 'CRITICAL' | 'EXTREME_DANGER';
      triggers: string[];
      intensity?: number;
    };
    // Emotional state
    emotional?: {
      state: {
        trust: number;
        affinity: number;
        respect: number;
      };
      emotions: string[];
      relationLevel: number;
    };
  }) => void;

  // Typing indicators
  'agent:typing': (data: {
    agentId: string;
    isTyping: boolean;
  }) => void;

  // Message reactions
  'message:reactions:updated': (data: {
    messageId: string;
    reactions: Reaction[];
  }) => void;

  // Errors
  'error': (data: {
    code: string;
    message: string;
    details?: unknown;
  }) => void;

  // Connection status
  'connected': (data: { socketId: string }) => void;
  'disconnected': (data: { reason: string }) => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTER-SERVER EVENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface InterServerEvents {
  'ping': () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SOCKET DATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SocketData {
  userId?: string;
  agentId?: string;
  sessionId?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPED SOCKET EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import type { NextApiResponse } from 'next';
import type { Server as SocketIOServer } from 'socket.io';
import type { Socket as SocketIOSocket } from 'socket.io';
import type { Socket as ClientSocket } from 'socket.io-client';

// Server-side typed socket
export type TypedServerSocket = SocketIOSocket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

// Server instance
export type TypedSocketServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

// Client-side typed socket
export type TypedClientSocket = ClientSocket<
  ServerToClientEvents,
  ClientToServerEvents
>;

// Next.js API Response with Socket.io
export type NextApiResponseWithSocket = NextApiResponse & {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: TypedSocketServer;
    };
  };
};
