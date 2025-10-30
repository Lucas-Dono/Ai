/**
 * World Simulation Socket Events
 *
 * Emite eventos en tiempo real para notificar cambios en los mundos
 */

import { Server as SocketIOServer } from 'socket.io';
import { createLogger } from '@/lib/logger';

const log = createLogger('WorldSocketEvents');

export interface WorldInteractionEvent {
  worldId: string;
  interactionId: string;
  speakerId: string;
  speakerName: string;
  speakerAvatar?: string;
  targetId?: string;
  targetName?: string;
  content: string;
  turnNumber: number;
  speakerEmotion?: any;
  interactionType: string;
  timestamp: Date;
}

export interface WorldStatusEvent {
  worldId: string;
  status: 'RUNNING' | 'PAUSED' | 'STOPPED';
  currentTurn?: number;
  totalInteractions?: number;
  timestamp: Date;
}

export interface WorldAgentJoinedEvent {
  worldId: string;
  agentId: string;
  agentName: string;
  timestamp: Date;
}

export interface WorldAgentLeftEvent {
  worldId: string;
  agentId: string;
  agentName: string;
  timestamp: Date;
}

export interface WorldRelationUpdateEvent {
  worldId: string;
  subjectId: string;
  targetId: string;
  trust: number;
  affinity: number;
  respect: number;
  stage: string;
  timestamp: Date;
}

/**
 * Clase para manejar eventos de socket de mundos
 */
export class WorldSocketEventEmitter {
  private io: SocketIOServer | null = null;

  /**
   * Inicializa el emitter con el servidor de Socket.IO
   */
  initialize(io: SocketIOServer) {
    this.io = io;
    log.info('WorldSocketEventEmitter initialized');
  }

  /**
   * Emite un evento de nueva interacción
   */
  emitInteraction(event: WorldInteractionEvent) {
    if (!this.io) {
      log.warn('Socket.IO not initialized');
      return;
    }

    const roomName = `world:${event.worldId}`;

    log.debug({ worldId: event.worldId, turnNumber: event.turnNumber }, 'Emitting world interaction');

    this.io.to(roomName).emit('world:interaction', event);
  }

  /**
   * Emite un evento de cambio de estado del mundo
   */
  emitStatusChange(event: WorldStatusEvent) {
    if (!this.io) {
      log.warn('Socket.IO not initialized');
      return;
    }

    const roomName = `world:${event.worldId}`;

    log.debug({ worldId: event.worldId, status: event.status }, 'Emitting world status change');

    this.io.to(roomName).emit('world:status', event);
  }

  /**
   * Emite un evento de agente que se une al mundo
   */
  emitAgentJoined(event: WorldAgentJoinedEvent) {
    if (!this.io) {
      log.warn('Socket.IO not initialized');
      return;
    }

    const roomName = `world:${event.worldId}`;

    log.debug({ worldId: event.worldId, agentId: event.agentId }, 'Emitting agent joined');

    this.io.to(roomName).emit('world:agent:joined', event);
  }

  /**
   * Emite un evento de agente que deja el mundo
   */
  emitAgentLeft(event: WorldAgentLeftEvent) {
    if (!this.io) {
      log.warn('Socket.IO not initialized');
      return;
    }

    const roomName = `world:${event.worldId}`;

    log.debug({ worldId: event.worldId, agentId: event.agentId }, 'Emitting agent left');

    this.io.to(roomName).emit('world:agent:left', event);
  }

  /**
   * Emite un evento de actualización de relación entre agentes
   */
  emitRelationUpdate(event: WorldRelationUpdateEvent) {
    if (!this.io) {
      log.warn('Socket.IO not initialized');
      return;
    }

    const roomName = `world:${event.worldId}`;

    log.debug(
      { worldId: event.worldId, subjectId: event.subjectId, targetId: event.targetId },
      'Emitting relation update'
    );

    this.io.to(roomName).emit('world:relation:update', event);
  }

  /**
   * Suscribe un socket a los eventos de un mundo específico
   */
  subscribeToWorld(socketId: string, worldId: string) {
    if (!this.io) {
      log.warn('Socket.IO not initialized');
      return;
    }

    const socket = this.io.sockets.sockets.get(socketId);
    if (!socket) {
      log.warn({ socketId }, 'Socket not found');
      return;
    }

    const roomName = `world:${worldId}`;
    socket.join(roomName);

    log.info({ socketId, worldId }, 'Socket subscribed to world');
  }

  /**
   * Desuscribe un socket de los eventos de un mundo
   */
  unsubscribeFromWorld(socketId: string, worldId: string) {
    if (!this.io) {
      log.warn('Socket.IO not initialized');
      return;
    }

    const socket = this.io.sockets.sockets.get(socketId);
    if (!socket) {
      log.warn({ socketId }, 'Socket not found');
      return;
    }

    const roomName = `world:${worldId}`;
    socket.leave(roomName);

    log.info({ socketId, worldId }, 'Socket unsubscribed from world');
  }
}

// Export singleton instance
export const worldSocketEvents = new WorldSocketEventEmitter();
