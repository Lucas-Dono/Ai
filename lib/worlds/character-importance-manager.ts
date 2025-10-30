/**
 * Character Importance Manager
 * Gestiona la promoción y degradación dinámica de personajes
 * entre niveles: main, secondary, filler
 */

import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const log = createLogger('CharacterImportance');

// ========================================
// CONFIGURACIÓN
// ========================================

const IMPORTANCE_CONFIG = {
  MAX_MAIN_CHARACTERS: 4,
  MAX_SECONDARY_CHARACTERS: 6,

  // Pesos para calcular el promotion score
  WEIGHTS: {
    screenTime: 0.3,
    relationshipDevelopment: 0.25,
    arcProgress: 0.25,
    recentActivity: 0.2,
  },

  // Umbrales para promoción/degradación
  PROMOTION_THRESHOLD: 0.75,
  DEMOTION_THRESHOLD: 0.3,

  // Bonus por completar hitos
  MILESTONE_BONUS: 0.15,
  EVENT_PARTICIPATION_BONUS: 0.1,
};

// ========================================
// TIPOS
// ========================================

export type ImportanceLevel = 'main' | 'secondary' | 'filler';

export interface CharacterImportanceMetrics {
  agentId: string;
  currentLevel: ImportanceLevel;
  promotionScore: number;
  screenTime: number;
  relationshipScore: number;
  arcProgress: number;
  recentActivity: number;
  recommendation: 'promote' | 'demote' | 'maintain';
}

// ========================================
// CHARACTER IMPORTANCE MANAGER
// ========================================

export class CharacterImportanceManager {
  private worldId: string;

  constructor(worldId: string) {
    this.worldId = worldId;
  }

  /**
   * Calcula las métricas de importancia para todos los personajes
   */
  async calculateImportanceMetrics(): Promise<CharacterImportanceMetrics[]> {
    const worldAgents = await prisma.worldAgent.findMany({
      where: { worldId: this.worldId, isActive: true },
      include: {
        agent: true,
        world: {
          include: {
            agentRelations: true,
            characterArcs: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    const metrics: CharacterImportanceMetrics[] = [];

    for (const wa of worldAgents) {
      // 1. Screen Time Score (normalizado por máximo)
      const maxScreenTime = Math.max(...worldAgents.map(w => w.screenTime), 1);
      const screenTimeScore = wa.screenTime / maxScreenTime;

      // 2. Relationship Development Score
      const relations = wa.world.agentRelations.filter(r => r.subjectId === wa.agentId);
      const avgTrust = relations.length > 0
        ? relations.reduce((sum, r) => sum + r.trust, 0) / relations.length
        : 0.5;
      const relationshipScore = avgTrust;

      // 3. Arc Progress Score
      const characterArcs = wa.world.characterArcs.filter(arc => arc.agentId === wa.agentId);
      const arcProgress = characterArcs.length > 0
        ? characterArcs.reduce((sum, arc) => sum + arc.progress, 0) / characterArcs.length
        : 0;

      // 4. Recent Activity Score (últimas 10 interacciones)
      const recentInteractions = await prisma.worldInteraction.count({
        where: {
          worldId: this.worldId,
          speakerId: wa.agentId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24 horas
          },
        },
      });
      const recentActivity = Math.min(recentInteractions / 10, 1);

      // Calcular promotion score ponderado
      const promotionScore =
        screenTimeScore * IMPORTANCE_CONFIG.WEIGHTS.screenTime +
        relationshipScore * IMPORTANCE_CONFIG.WEIGHTS.relationshipDevelopment +
        arcProgress * IMPORTANCE_CONFIG.WEIGHTS.arcProgress +
        recentActivity * IMPORTANCE_CONFIG.WEIGHTS.recentActivity;

      // Determinar recomendación
      let recommendation: 'promote' | 'demote' | 'maintain' = 'maintain';
      if (promotionScore >= IMPORTANCE_CONFIG.PROMOTION_THRESHOLD) {
        recommendation = 'promote';
      } else if (promotionScore <= IMPORTANCE_CONFIG.DEMOTION_THRESHOLD) {
        recommendation = 'demote';
      }

      metrics.push({
        agentId: wa.agentId,
        currentLevel: wa.importanceLevel as ImportanceLevel,
        promotionScore,
        screenTime: screenTimeScore,
        relationshipScore,
        arcProgress,
        recentActivity,
        recommendation,
      });

      // Actualizar en la base de datos
      await prisma.worldAgent.update({
        where: {
          worldId_agentId: {
            worldId: this.worldId,
            agentId: wa.agentId,
          },
        },
        data: { promotionScore },
      });
    }

    return metrics.sort((a, b) => b.promotionScore - a.promotionScore);
  }

  /**
   * Ejecuta la promoción/degradación automática de personajes
   */
  async processCharacterPromotions() {
    log.info({ worldId: this.worldId }, 'Processing character promotions/demotions');

    const metrics = await this.calculateImportanceMetrics();

    // Contar personajes por nivel
    const counts = {
      main: metrics.filter(m => m.currentLevel === 'main').length,
      secondary: metrics.filter(m => m.currentLevel === 'secondary').length,
      filler: metrics.filter(m => m.currentLevel === 'filler').length,
    };

    log.debug({ worldId: this.worldId, counts }, 'Current character distribution');

    // Procesar promociones y degradaciones
    for (const metric of metrics) {
      const { agentId, currentLevel, recommendation, promotionScore } = metric;

      // PROMOCIÓN
      if (recommendation === 'promote') {
        if (currentLevel === 'filler' && counts.secondary < IMPORTANCE_CONFIG.MAX_SECONDARY_CHARACTERS) {
          await this.promoteCharacter(agentId, 'secondary');
          counts.filler--;
          counts.secondary++;
          log.info({ worldId: this.worldId, agentId, from: 'filler', to: 'secondary' }, 'Character promoted');
        } else if (currentLevel === 'secondary' && counts.main < IMPORTANCE_CONFIG.MAX_MAIN_CHARACTERS) {
          await this.promoteCharacter(agentId, 'main');
          counts.secondary--;
          counts.main++;
          log.info({ worldId: this.worldId, agentId, from: 'secondary', to: 'main' }, 'Character promoted');
        } else if (currentLevel === 'secondary' && counts.main >= IMPORTANCE_CONFIG.MAX_MAIN_CHARACTERS) {
          // Intentar degradar al main con menor score para hacer espacio
          await this.attemptMainDemotion(agentId, promotionScore);
        }
      }

      // DEGRADACIÓN
      if (recommendation === 'demote') {
        if (currentLevel === 'main') {
          await this.demoteCharacter(agentId, 'secondary');
          counts.main--;
          counts.secondary++;
          log.info({ worldId: this.worldId, agentId, from: 'main', to: 'secondary' }, 'Character demoted');
        } else if (currentLevel === 'secondary') {
          await this.demoteCharacter(agentId, 'filler');
          counts.secondary--;
          counts.filler++;
          log.info({ worldId: this.worldId, agentId, from: 'secondary', to: 'filler' }, 'Character demoted');
        }
      }
    }

    log.info({ worldId: this.worldId, finalCounts: counts }, 'Character promotions/demotions completed');
  }

  /**
   * Intenta degradar un personaje main para hacer espacio a uno nuevo
   */
  private async attemptMainDemotion(candidateAgentId: string, candidateScore: number) {
    // Obtener todos los mains ordenados por score
    const mainCharacters = await prisma.worldAgent.findMany({
      where: {
        worldId: this.worldId,
        importanceLevel: 'main',
      },
      orderBy: { promotionScore: 'asc' },
    });

    // Si el candidato tiene mejor score que el peor main, hacer el swap
    const worstMain = mainCharacters[0];
    if (worstMain && candidateScore > worstMain.promotionScore + 0.1) {
      // Degradar el peor main
      await this.demoteCharacter(worstMain.agentId, 'secondary');
      // Promover el candidato
      await this.promoteCharacter(candidateAgentId, 'main');

      log.info(
        {
          worldId: this.worldId,
          demoted: worstMain.agentId,
          promoted: candidateAgentId,
          scoreDiff: candidateScore - worstMain.promotionScore,
        },
        'Main character swapped'
      );
    }
  }

  /**
   * Promueve un personaje a un nuevo nivel
   */
  private async promoteCharacter(agentId: string, newLevel: ImportanceLevel) {
    await prisma.worldAgent.update({
      where: {
        worldId_agentId: {
          worldId: this.worldId,
          agentId,
        },
      },
      data: {
        importanceLevel: newLevel,
        // Reset arc stage cuando se promueve
        characterArcStage: newLevel === 'main' ? 'introduction' : undefined,
      },
    });

    // Si se promueve a main, crear un arco de personaje si no existe
    if (newLevel === 'main') {
      const existingArc = await prisma.characterArc.findFirst({
        where: {
          worldId: this.worldId,
          agentId,
          isActive: true,
        },
      });

      if (!existingArc) {
        // El director AI creará el arco apropiado
        log.debug({ worldId: this.worldId, agentId }, 'Main character needs character arc');
      }
    }
  }

  /**
   * Degrada un personaje a un nuevo nivel
   */
  private async demoteCharacter(agentId: string, newLevel: ImportanceLevel) {
    await prisma.worldAgent.update({
      where: {
        worldId_agentId: {
          worldId: this.worldId,
          agentId,
        },
      },
      data: {
        importanceLevel: newLevel,
        characterArcStage: null,
      },
    });

    // Si se degrada desde main, completar o pausar su arco
    if (newLevel !== 'main') {
      await prisma.characterArc.updateMany({
        where: {
          worldId: this.worldId,
          agentId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }
  }

  /**
   * Obtiene el reporte de importancia de todos los personajes
   */
  async getImportanceReport() {
    const metrics = await this.calculateImportanceMetrics();

    const report = {
      main: metrics.filter(m => m.currentLevel === 'main'),
      secondary: metrics.filter(m => m.currentLevel === 'secondary'),
      filler: metrics.filter(m => m.currentLevel === 'filler'),
      recommendations: {
        promote: metrics.filter(m => m.recommendation === 'promote'),
        demote: metrics.filter(m => m.recommendation === 'demote'),
      },
    };

    return report;
  }

  /**
   * Fuerza la promoción de un personaje (override manual)
   */
  async forcePromote(agentId: string) {
    const wa = await prisma.worldAgent.findUnique({
      where: {
        worldId_agentId: {
          worldId: this.worldId,
          agentId,
        },
      },
    });

    if (!wa) return;

    const newLevel: ImportanceLevel =
      wa.importanceLevel === 'filler' ? 'secondary' :
      wa.importanceLevel === 'secondary' ? 'main' :
      'main';

    if (newLevel === wa.importanceLevel) return;

    await this.promoteCharacter(agentId, newLevel);

    log.info({ worldId: this.worldId, agentId, from: wa.importanceLevel, to: newLevel }, 'Character force-promoted');
  }

  /**
   * Fuerza la degradación de un personaje (override manual)
   */
  async forceDemote(agentId: string) {
    const wa = await prisma.worldAgent.findUnique({
      where: {
        worldId_agentId: {
          worldId: this.worldId,
          agentId,
        },
      },
    });

    if (!wa) return;

    const newLevel: ImportanceLevel =
      wa.importanceLevel === 'main' ? 'secondary' :
      wa.importanceLevel === 'secondary' ? 'filler' :
      'filler';

    if (newLevel === wa.importanceLevel) return;

    await this.demoteCharacter(agentId, newLevel);

    log.info({ worldId: this.worldId, agentId, from: wa.importanceLevel, to: newLevel }, 'Character force-demoted');
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Obtiene el gestor de importancia para un mundo
 */
export function getCharacterImportanceManager(worldId: string): CharacterImportanceManager {
  return new CharacterImportanceManager(worldId);
}
