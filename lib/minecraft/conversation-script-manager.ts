/**
 * Gestor de Progreso de Conversaciones
 *
 * Controla el avance de guiones conversacionales en tiempo real
 */

import { createLogger } from "@/lib/logger";
import {
  ConversationScript,
  ConversationProgress,
  ScriptTiming,
  DialogueLine,
  ConversationPhase,
} from "./conversation-script-types";
import { ConversationScriptGenerator } from "./conversation-script-generator";

const log = createLogger({ module: "ConversationScriptManager" });

/**
 * Configuración por defecto de timing
 */
const DEFAULT_TIMING: ScriptTiming = {
  minDelayBetweenLines: 3, // 3 segundos mínimo entre líneas
  maxDelayBetweenLines: 6, // 6 segundos máximo
  pauseAtPhaseChange: 2, // 2 segundos extra al cambiar de fase
  loopAfterCompletion: true, // Reiniciar después de completar
  loopDelay: 120, // 2 minutos antes de reiniciar
};

export class ConversationScriptManager {
  /**
   * Conversaciones activas
   * Key: groupHash
   */
  private static activeConversations = new Map<string, ConversationProgress>();

  /**
   * Scripts cargados
   * Key: scriptId
   */
  private static loadedScripts = new Map<string, ConversationScript>();

  /**
   * Timers para avance automático
   * Key: groupHash
   */
  private static advanceTimers = new Map<string, NodeJS.Timeout>();

  /**
   * Configuraciones de timing
   * Key: groupHash
   */
  private static timingConfigs = new Map<string, ScriptTiming>();

  /**
   * Iniciar conversación con un grupo
   */
  static async startConversation(
    groupHash: string,
    script: ConversationScript,
    timing?: Partial<ScriptTiming>
  ): Promise<ConversationProgress> {
    // Detener conversación existente si la hay
    this.stopConversation(groupHash);

    // Crear progreso inicial
    const progress: ConversationProgress = {
      scriptId: script.scriptId,
      groupHash,
      currentLineIndex: 0,
      currentPhase: ConversationPhase.GREETING,
      startedAt: new Date(),
      lastAdvanceAt: new Date(),
      completed: false,
      listeners: [],
    };

    // Guardar script y progreso
    this.loadedScripts.set(script.scriptId, script);
    this.activeConversations.set(groupHash, progress);

    // Configurar timing
    const finalTiming = { ...DEFAULT_TIMING, ...timing };
    this.timingConfigs.set(groupHash, finalTiming);

    log.info("Conversation started", {
      groupHash,
      scriptId: script.scriptId,
      topic: script.topic,
      totalLines: script.lines.length,
    });

    // Programar primer avance
    this.scheduleNextAdvance(groupHash);

    return progress;
  }

  /**
   * Detener conversación
   */
  static stopConversation(groupHash: string): void {
    // Cancelar timer
    const timer = this.advanceTimers.get(groupHash);
    if (timer) {
      clearTimeout(timer);
      this.advanceTimers.delete(groupHash);
    }

    // Limpiar progreso
    this.activeConversations.delete(groupHash);
    this.timingConfigs.delete(groupHash);

    log.info("Conversation stopped", { groupHash });
  }

  /**
   * Avanzar conversación a la siguiente línea
   */
  static advanceConversation(groupHash: string): DialogueLine | null {
    const progress = this.activeConversations.get(groupHash);
    if (!progress || progress.completed) {
      return null;
    }

    const script = this.loadedScripts.get(progress.scriptId);
    if (!script) {
      log.error("Script not found", { scriptId: progress.scriptId });
      return null;
    }

    // Obtener línea actual
    const currentLine = script.lines[progress.currentLineIndex];

    if (!currentLine) {
      // Conversación completada
      this.handleConversationCompletion(groupHash);
      return null;
    }

    // Actualizar progreso
    progress.currentLineIndex++;
    progress.currentPhase = currentLine.phase;
    progress.lastAdvanceAt = new Date();

    // Verificar si completó
    if (progress.currentLineIndex >= script.lines.length) {
      this.handleConversationCompletion(groupHash);
    } else {
      // Programar siguiente avance
      this.scheduleNextAdvance(groupHash);
    }

    log.debug("Conversation advanced", {
      groupHash,
      lineIndex: progress.currentLineIndex - 1,
      phase: currentLine.phase,
      speaker: currentLine.agentName,
    });

    return currentLine;
  }

  /**
   * Manejar finalización de conversación
   */
  private static handleConversationCompletion(groupHash: string): void {
    const progress = this.activeConversations.get(groupHash);
    if (!progress) return;

    progress.completed = true;

    const timing = this.timingConfigs.get(groupHash) || DEFAULT_TIMING;

    log.info("Conversation completed", {
      groupHash,
      scriptId: progress.scriptId,
      duration: Date.now() - progress.startedAt.getTime(),
    });

    // Si se debe reiniciar, programar loop
    if (timing.loopAfterCompletion) {
      const loopTimer = setTimeout(() => {
        this.restartConversation(groupHash);
      }, timing.loopDelay * 1000);

      this.advanceTimers.set(groupHash, loopTimer);

      log.info("Conversation will loop", {
        groupHash,
        delaySeconds: timing.loopDelay,
      });
    } else {
      // Limpiar
      this.stopConversation(groupHash);
    }
  }

  /**
   * Reiniciar conversación (loop)
   */
  private static async restartConversation(groupHash: string): Promise<void> {
    const progress = this.activeConversations.get(groupHash);
    if (!progress) return;

    const script = this.loadedScripts.get(progress.scriptId);
    if (!script) return;

    log.info("Restarting conversation (loop)", { groupHash, scriptId: script.scriptId });

    // Reiniciar progreso
    progress.currentLineIndex = 0;
    progress.currentPhase = ConversationPhase.GREETING;
    progress.startedAt = new Date();
    progress.lastAdvanceAt = new Date();
    progress.completed = false;
    progress.listeners = []; // Limpiar listeners

    // Programar primer avance
    this.scheduleNextAdvance(groupHash);
  }

  /**
   * Programar siguiente avance
   */
  private static scheduleNextAdvance(groupHash: string): void {
    const progress = this.activeConversations.get(groupHash);
    const timing = this.timingConfigs.get(groupHash) || DEFAULT_TIMING;

    if (!progress || progress.completed) return;

    const script = this.loadedScripts.get(progress.scriptId);
    if (!script) return;

    // Calcular delay
    let delay =
      timing.minDelayBetweenLines +
      Math.random() * (timing.maxDelayBetweenLines - timing.minDelayBetweenLines);

    // Si es cambio de fase, agregar pausa extra
    const nextLine = script.lines[progress.currentLineIndex];
    if (nextLine && nextLine.phase !== progress.currentPhase) {
      delay += timing.pauseAtPhaseChange;
    }

    // Programar avance
    const timer = setTimeout(() => {
      this.advanceConversation(groupHash);
    }, delay * 1000);

    this.advanceTimers.set(groupHash, timer);

    log.debug("Next advance scheduled", {
      groupHash,
      delaySeconds: delay.toFixed(1),
      nextLineIndex: progress.currentLineIndex,
    });
  }

  /**
   * Obtener línea actual sin avanzar
   */
  static getCurrentLine(groupHash: string): DialogueLine | null {
    const progress = this.activeConversations.get(groupHash);
    if (!progress) return null;

    const script = this.loadedScripts.get(progress.scriptId);
    if (!script) return null;

    // Línea actual es la anterior (ya avanzada)
    const lineIndex = Math.max(0, progress.currentLineIndex - 1);
    return script.lines[lineIndex] || null;
  }

  /**
   * Obtener próximas N líneas (sin avanzar)
   */
  static getUpcomingLines(groupHash: string, count: number = 3): DialogueLine[] {
    const progress = this.activeConversations.get(groupHash);
    if (!progress) return [];

    const script = this.loadedScripts.get(progress.scriptId);
    if (!script) return [];

    const upcomingLines: DialogueLine[] = [];
    for (let i = 0; i < count && progress.currentLineIndex + i < script.lines.length; i++) {
      upcomingLines.push(script.lines[progress.currentLineIndex + i]);
    }

    return upcomingLines;
  }

  /**
   * Registrar jugador como listener
   */
  static addListener(groupHash: string, playerId: string): void {
    const progress = this.activeConversations.get(groupHash);
    if (!progress) return;

    if (!progress.listeners.includes(playerId)) {
      progress.listeners.push(playerId);
      log.debug("Listener added", { groupHash, playerId, totalListeners: progress.listeners.length });
    }
  }

  /**
   * Remover jugador como listener
   */
  static removeListener(groupHash: string, playerId: string): void {
    const progress = this.activeConversations.get(groupHash);
    if (!progress) return;

    progress.listeners = progress.listeners.filter((id) => id !== playerId);
    log.debug("Listener removed", { groupHash, playerId, totalListeners: progress.listeners.length });
  }

  /**
   * Obtener progreso de conversación
   */
  static getProgress(groupHash: string): ConversationProgress | null {
    return this.activeConversations.get(groupHash) || null;
  }

  /**
   * Obtener todas las conversaciones activas
   */
  static getActiveConversations(): Map<string, ConversationProgress> {
    return new Map(this.activeConversations);
  }

  /**
   * Obtener script de una conversación
   */
  static getScript(scriptId: string): ConversationScript | null {
    return this.loadedScripts.get(scriptId) || null;
  }

  /**
   * Limpiar conversaciones inactivas (sin listeners por más de X tiempo)
   */
  static cleanupInactiveConversations(inactiveThresholdMinutes: number = 10): number {
    const now = Date.now();
    const threshold = inactiveThresholdMinutes * 60 * 1000;
    let cleaned = 0;

    for (const [groupHash, progress] of this.activeConversations.entries()) {
      const inactive = now - progress.lastAdvanceAt.getTime() > threshold;
      const noListeners = progress.listeners.length === 0;

      if (inactive && noListeners) {
        this.stopConversation(groupHash);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      log.info("Cleaned up inactive conversations", { count: cleaned });
    }

    return cleaned;
  }

  /**
   * Obtener estadísticas
   */
  static getStats() {
    return {
      activeConversations: this.activeConversations.size,
      loadedScripts: this.loadedScripts.size,
      totalListeners: Array.from(this.activeConversations.values()).reduce(
        (sum, p) => sum + p.listeners.length,
        0
      ),
    };
  }

  /**
   * Limpiar todo (útil para tests)
   */
  static clearAll(): void {
    // Detener todos los timers
    for (const groupHash of this.activeConversations.keys()) {
      this.stopConversation(groupHash);
    }

    this.activeConversations.clear();
    this.loadedScripts.clear();
    this.advanceTimers.clear();
    this.timingConfigs.clear();

    log.info("All conversations cleared");
  }
}
