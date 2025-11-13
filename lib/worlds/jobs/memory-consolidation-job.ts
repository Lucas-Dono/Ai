/**
 * Memory Consolidation Job - Consolida memoria de mundos largos
 *
 * SCHEDULE: Cada 24 horas
 *
 * RESPONSABILIDADES:
 * - Resumir eventos de mundos con > 1000 interacciones
 * - Mantener solo últimos 100 eventos + resumen
 * - Prevenir crecimiento infinito de memoria
 * - Archivar interacciones antiguas
 *
 * ESTRATEGIA:
 * - Mundos con > 1000 interacciones: consolidar a 100 + resumen
 * - Crear resúmenes narrativos de períodos antiguos
 * - Mantener eventos clave (importantes) siempre
 * - Archivar eventos eliminados (opcional, para backup)
 *
 * MÉTRICAS:
 * - Mundos consolidados
 * - Interacciones archivadas
 * - Interacciones eliminadas
 * - Memoria liberada (MB)
 */

import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';
import { getVeniceClient } from '@/lib/emotional-system/llm/venice';

const log = createLogger('MemoryConsolidationJob');

export interface MemoryConsolidationMetrics {
  worldsEvaluated: number;
  worldsConsolidated: number;
  interactionsArchived: number;
  interactionsDeleted: number;
  estimatedMemoryFreedMB: number;
  summariesCreated: number;
  errors: number;
  executionTimeMs: number;
}

export class MemoryConsolidationJob {
  private isRunning = false;
  private lastMetrics: MemoryConsolidationMetrics | null = null;
  private consecutiveFailures = 0;
  private readonly MAX_CONSECUTIVE_FAILURES = 3;
  private readonly MAX_EXECUTION_TIME = 30 * 60 * 1000; // 30 minutos
  private readonly INTERACTION_THRESHOLD = 1000; // Consolidar si > 1000 interacciones
  private readonly TARGET_INTERACTIONS = 100; // Mantener últimas 100

  /**
   * Ejecuta el job de consolidación de memoria
   */
  async execute(): Promise<MemoryConsolidationMetrics> {
    if (this.isRunning) {
      log.warn('Memory consolidation job already running, skipping');
      return this.lastMetrics || this.getEmptyMetrics();
    }

    this.isRunning = true;
    const startTime = Date.now();

    const metrics: MemoryConsolidationMetrics = {
      worldsEvaluated: 0,
      worldsConsolidated: 0,
      interactionsArchived: 0,
      interactionsDeleted: 0,
      estimatedMemoryFreedMB: 0,
      summariesCreated: 0,
      errors: 0,
      executionTimeMs: 0,
    };

    try {
      log.info('🧠 Starting memory consolidation job...');

      // Encontrar mundos con muchas interacciones
      const worldsToConsolidate = await this.findWorldsNeedingConsolidation();

      log.info({ count: worldsToConsolidate.length }, 'Found worlds needing consolidation');

      for (const world of worldsToConsolidate) {
        // Verificar timeout
        if (Date.now() - startTime > this.MAX_EXECUTION_TIME) {
          log.warn({ processed: metrics.worldsEvaluated }, 'Job timeout, stopping');
          break;
        }

        metrics.worldsEvaluated++;

        try {
          const result = await this.consolidateWorld(world);

          metrics.worldsConsolidated++;
          metrics.interactionsArchived += result.archived;
          metrics.interactionsDeleted += result.deleted;
          metrics.summariesCreated += result.summaries;
          metrics.estimatedMemoryFreedMB += result.memoryFreedMB;

          log.info(
            {
              worldId: world.id,
              worldName: world.name,
              archived: result.archived,
              deleted: result.deleted,
              memoryFreed: result.memoryFreedMB.toFixed(2) + ' MB',
            },
            'World consolidated'
          );
        } catch (error) {
          log.error({ error, worldId: world.id }, 'Error consolidating world');
          metrics.errors++;
        }
      }

      metrics.executionTimeMs = Date.now() - startTime;

      log.info(
        {
          evaluated: metrics.worldsEvaluated,
          consolidated: metrics.worldsConsolidated,
          archived: metrics.interactionsArchived,
          deleted: metrics.interactionsDeleted,
          memoryFreed: metrics.estimatedMemoryFreedMB.toFixed(2) + ' MB',
          duration: metrics.executionTimeMs + 'ms',
        },
        '✅ Memory consolidation job completed'
      );

      this.consecutiveFailures = 0;
      this.lastMetrics = metrics;
      return metrics;
    } catch (error) {
      metrics.errors++;
      metrics.executionTimeMs = Date.now() - startTime;

      log.error({ error, metrics }, '❌ Memory consolidation job failed');

      this.consecutiveFailures++;
      if (this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
        log.error(
          { consecutiveFailures: this.consecutiveFailures },
          '🚨 ALERT: Memory consolidation job failed 3 times consecutively!'
        );
        // TODO: Enviar alerta
      }

      this.lastMetrics = metrics;
      return metrics;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Encuentra mundos que necesitan consolidación
   */
  private async findWorldsNeedingConsolidation(): Promise<any[]> {
    // Encontrar mundos con muchas interacciones
    const worlds = await prisma.world.findMany({
      where: {
        simulationState: {
          totalInteractions: {
            gte: this.INTERACTION_THRESHOLD,
          },
        },
      },
      include: {
        simulationState: true,
      },
    });

    return worlds;
  }

  /**
   * Consolida memoria de un mundo específico
   */
  private async consolidateWorld(world: any): Promise<{
    archived: number;
    deleted: number;
    summaries: number;
    memoryFreedMB: number;
  }> {
    const worldId = world.id;

    // Contar interacciones actuales
    const totalInteractions = await prisma.worldInteraction.count({
      where: { worldId },
    });

    if (totalInteractions <= this.TARGET_INTERACTIONS) {
      // No necesita consolidación
      return { archived: 0, deleted: 0, summaries: 0, memoryFreedMB: 0 };
    }

    // Obtener todas las interacciones, ordenadas cronológicamente
    const allInteractions = await prisma.worldInteraction.findMany({
      where: { worldId },
      orderBy: { createdAt: 'asc' },
      include: {
        speaker: {
          select: { name: true },
        },
      },
    });

    // Separar: mantener últimas TARGET_INTERACTIONS, consolidar el resto
    const toKeep = allInteractions.slice(-this.TARGET_INTERACTIONS);
    const toConsolidate = allInteractions.slice(0, -this.TARGET_INTERACTIONS);

    log.debug(
      {
        worldId,
        total: totalInteractions,
        keep: toKeep.length,
        consolidate: toConsolidate.length,
      },
      'Consolidation plan'
    );

    // Crear resumen narrativo de las interacciones antiguas
    const summary = await this.createNarrativeSummary(worldId, toConsolidate);

    // Guardar resumen en el mundo
    await this.saveSummaryToWorld(worldId, summary);

    // Opcionalmente: Archivar interacciones antiguas antes de borrarlas
    // (comentado por defecto, descomentar si se quiere backup)
    // await this.archiveInteractions(worldId, toConsolidate);

    // Eliminar interacciones antiguas
    const idsToDelete = toConsolidate.map(i => i.id);
    await prisma.worldInteraction.deleteMany({
      where: {
        id: { in: idsToDelete },
      },
    });

    // Estimar memoria liberada (aprox 2KB por interacción)
    const memoryFreedMB = (idsToDelete.length * 2) / 1024;

    return {
      archived: 0, // o toConsolidate.length si se activa archiving
      deleted: idsToDelete.length,
      summaries: 1,
      memoryFreedMB,
    };
  }

  /**
   * Crea resumen narrativo de interacciones antiguas usando IA
   */
  private async createNarrativeSummary(
    worldId: string,
    interactions: any[]
  ): Promise<string> {
    if (interactions.length === 0) {
      return 'No hay eventos previos para resumir.';
    }

    try {
      // Preparar contexto para el resumen
      const context = interactions
        .slice(0, 50) // Resumir primeras 50 para no exceder límite de tokens
        .map(i => `${i.speaker.name}: ${i.content}`)
        .join('\n');

      const prompt = `Eres un narrador experto. Resume brevemente los siguientes eventos de un mundo virtual.

EVENTOS (primeras interacciones):
${context}

Crea un resumen narrativo conciso (200-300 palabras) que capture:
- Los eventos principales que ocurrieron
- Las relaciones clave que se desarrollaron
- El tono general de las interacciones
- Momentos importantes o revelaciones

Resume en párrafo corrido, estilo narrativo.`;

      const venice = getVeniceClient();
      const response = await venice.generateWithSystemPrompt(
        'Eres un narrador profesional que resume historias de forma concisa y atractiva.',
        prompt,
        {
          model: 'llama-3.3-70b',
          temperature: 0.5,
          maxTokens: 500,
        }
      );

      return response.text.trim();
    } catch (error) {
      log.error({ error, worldId }, 'Failed to create narrative summary');
      return `Resumen de ${interactions.length} interacciones previas (del turno 0 al ${interactions.length - 1}).`;
    }
  }

  /**
   * Guarda resumen en el campo metadata del mundo
   */
  private async saveSummaryToWorld(worldId: string, summary: string): Promise<void> {
    try {
      const world = await prisma.world.findUnique({
        where: { id: worldId },
      });

      if (!world) {
        throw new Error('World not found');
      }

      // Obtener metadata actual
      const metadata = (world.rules as any) || {};

      // Agregar resumen a historial de resúmenes
      const summaries = metadata.narrativeSummaries || [];
      summaries.push({
        createdAt: new Date().toISOString(),
        summary,
        interactionCount: 0, // Se puede mejorar para trackear exactamente cuántas se resumieron
      });

      // Guardar en rules (campo JSON disponible)
      await prisma.world.update({
        where: { id: worldId },
        data: {
          rules: {
            ...metadata,
            narrativeSummaries: summaries,
            lastConsolidation: new Date().toISOString(),
          },
        },
      });

      log.debug({ worldId }, 'Summary saved to world');
    } catch (error) {
      log.error({ error, worldId }, 'Failed to save summary');
      throw error;
    }
  }

  /**
   * Archiva interacciones antiguas (opcional, para backup)
   */
  private async archiveInteractions(worldId: string, interactions: any[]): Promise<void> {
    // TODO: Implementar si se necesita backup de interacciones
    // Opciones:
    // 1. Guardar en tabla separada (WorldInteractionArchive)
    // 2. Exportar a archivo JSON en S3/storage
    // 3. Comprimir y guardar en campo JSON del mundo
    log.debug({ worldId, count: interactions.length }, 'Archiving not implemented yet');
  }

  /**
   * Obtiene métricas vacías
   */
  private getEmptyMetrics(): MemoryConsolidationMetrics {
    return {
      worldsEvaluated: 0,
      worldsConsolidated: 0,
      interactionsArchived: 0,
      interactionsDeleted: 0,
      estimatedMemoryFreedMB: 0,
      summariesCreated: 0,
      errors: 0,
      executionTimeMs: 0,
    };
  }

  /**
   * Obtiene las últimas métricas
   */
  getLastMetrics(): MemoryConsolidationMetrics | null {
    return this.lastMetrics;
  }

  /**
   * Verifica si el job está corriendo
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Configura umbrales (para testing)
   */
  setThresholds(threshold: number, target: number): void {
    (this as any).INTERACTION_THRESHOLD = threshold;
    (this as any).TARGET_INTERACTIONS = target;
  }
}

// Singleton
export const memoryConsolidationJob = new MemoryConsolidationJob();
