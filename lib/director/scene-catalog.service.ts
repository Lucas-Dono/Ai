/**
 * Scene Catalog Service
 *
 * Gestiona el acceso al catálogo de escenas con cache en memoria
 * para búsquedas rápidas.
 */

import { prisma } from "@/lib/prisma";
import { SceneCategory } from "@prisma/client";
import type { Scene, SceneCandidateFilter } from "./types";

class SceneCatalogService {
  private cache: Map<string, Scene> = new Map();
  private cacheByCategory: Map<SceneCategory, Scene[]> = new Map();
  private cacheLoaded = false;
  private loadPromise: Promise<void> | null = null;

  /**
   * Carga todas las escenas en memoria al inicio
   */
  async loadCache(): Promise<void> {
    // Si ya hay una carga en progreso, esperar a que termine
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Si ya está cargado, no hacer nada
    if (this.cacheLoaded) {
      return;
    }

    this.loadPromise = (async () => {
      try {
        console.log("[SceneCatalog] Cargando catálogo de escenas...");

        const scenes = await prisma.scene.findMany({
          where: { isActive: true },
        });

        // Limpiar cache anterior
        this.cache.clear();
        this.cacheByCategory.clear();

        // Cargar en cache
        for (const scene of scenes) {
          const typedScene = this.parseScene(scene);
          this.cache.set(scene.code, typedScene);

          // Agregar a cache por categoría
          if (!this.cacheByCategory.has(scene.category)) {
            this.cacheByCategory.set(scene.category, []);
          }
          this.cacheByCategory.get(scene.category)!.push(typedScene);
        }

        this.cacheLoaded = true;
        console.log(
          `[SceneCatalog] Catálogo cargado: ${scenes.length} escenas`
        );
      } catch (error) {
        console.error("[SceneCatalog] Error cargando catálogo:", error);
        throw error;
      } finally {
        this.loadPromise = null;
      }
    })();

    return this.loadPromise;
  }

  /**
   * Parsea una escena de la DB al tipo Scene
   */
  private parseScene(dbScene: any): Scene {
    return {
      ...dbScene,
      interventionSequence: Array.isArray(dbScene.interventionSequence)
        ? dbScene.interventionSequence
        : JSON.parse(dbScene.interventionSequence as string),
      consequences: typeof dbScene.consequences === "object"
        ? dbScene.consequences
        : JSON.parse(dbScene.consequences as string),
      variations: dbScene.variations
        ? typeof dbScene.variations === "object"
          ? dbScene.variations
          : JSON.parse(dbScene.variations as string)
        : null,
    };
  }

  /**
   * Invalida el cache y recarga las escenas
   */
  async invalidateCache(): Promise<void> {
    this.cacheLoaded = false;
    this.loadPromise = null;
    await this.loadCache();
  }

  /**
   * Obtiene una escena por su código
   */
  async getByCode(code: string): Promise<Scene | null> {
    await this.loadCache();

    if (this.cache.has(code)) {
      return this.cache.get(code)!;
    }

    // Si no está en cache, buscar en DB (por si es nueva)
    const dbScene = await prisma.scene.findUnique({
      where: { code, isActive: true },
    });

    if (!dbScene) {
      return null;
    }

    const scene = this.parseScene(dbScene);
    this.cache.set(code, scene);
    return scene;
  }

  /**
   * Obtiene escenas por categoría
   */
  async getByCategory(category: SceneCategory): Promise<Scene[]> {
    await this.loadCache();

    if (this.cacheByCategory.has(category)) {
      return this.cacheByCategory.get(category)!;
    }

    return [];
  }

  /**
   * Busca escenas candidatas según filtros
   */
  async findCandidates(
    filter: SceneCandidateFilter
  ): Promise<Scene[]> {
    await this.loadCache();

    let candidates = Array.from(this.cache.values());

    // Filtro 1: Excluir categorías
    if (filter.excludeCategories && filter.excludeCategories.length > 0) {
      candidates = candidates.filter(
        (scene) => !filter.excludeCategories!.includes(scene.category)
      );
    }

    // Filtro 2: Excluir códigos específicos
    if (filter.excludeCodes && filter.excludeCodes.length > 0) {
      const excludeSet = new Set(filter.excludeCodes);
      candidates = candidates.filter((scene) => !excludeSet.has(scene.code));
    }

    // Filtro 3: Rango de energía
    if (filter.energyRange) {
      candidates = candidates.filter((scene) => {
        // Si la escena no tiene restricciones de energía, aceptar
        if (
          scene.triggerMinEnergy === null &&
          scene.triggerMaxEnergy === null
        ) {
          return true;
        }

        const min = scene.triggerMinEnergy ?? 0;
        const max = scene.triggerMaxEnergy ?? 1;

        return (
          filter.energyRange!.min >= min && filter.energyRange!.max <= max
        );
      });
    }

    // Filtro 4: Rango de tensión
    if (filter.tensionRange) {
      candidates = candidates.filter((scene) => {
        // Si la escena no tiene restricciones de tensión, aceptar
        if (
          scene.triggerMinTension === null &&
          scene.triggerMaxTension === null
        ) {
          return true;
        }

        const min = scene.triggerMinTension ?? 0;
        const max = scene.triggerMaxTension ?? 1;

        return (
          filter.tensionRange!.min >= min && filter.tensionRange!.max <= max
        );
      });
    }

    // Filtro 5: Número de IAs
    if (filter.minAIs !== undefined) {
      candidates = candidates.filter((scene) => scene.maxAIs >= filter.minAIs!);
    }

    if (filter.maxAIs !== undefined) {
      candidates = candidates.filter((scene) => scene.minAIs <= filter.maxAIs!);
    }

    // Filtro 6: No crear semillas si ya hay muchas
    if (filter.canCreateSeeds === false) {
      candidates = candidates.filter((scene) => {
        const consequences = scene.consequences;
        return !consequences.seeds || consequences.seeds.length === 0;
      });
    }

    // Filtro 7: Roles requeridos
    if (filter.requireRoles && filter.requireRoles.length > 0) {
      candidates = candidates.filter((scene) => {
        return filter.requireRoles!.every((role) =>
          scene.participantRoles.includes(role)
        );
      });
    }

    // Filtro 8: Categorías preferidas (dar prioridad pero no excluir otras)
    if (filter.preferredCategories && filter.preferredCategories.length > 0) {
      const preferred = candidates.filter((scene) =>
        filter.preferredCategories!.includes(scene.category)
      );
      const others = candidates.filter(
        (scene) => !filter.preferredCategories!.includes(scene.category)
      );

      // Retornar preferidas primero
      candidates = [...preferred, ...others];
    }

    // Ordenar por balance de uso (menos usadas primero) y engagement
    candidates.sort((a, b) => {
      // Prioridad 1: Menos usadas
      const usageDiff = a.usageCount - b.usageCount;
      if (usageDiff !== 0) return usageDiff;

      // Prioridad 2: Mayor engagement
      return b.avgEngagement - a.avgEngagement;
    });

    return candidates;
  }

  /**
   * Busca escenas por tipo de trigger
   */
  async getByTriggerType(triggerType: string): Promise<Scene[]> {
    await this.loadCache();

    return Array.from(this.cache.values()).filter(
      (scene) => scene.triggerType === triggerType
    );
  }

  /**
   * Incrementa el contador de uso de una escena
   */
  async incrementUsage(
    sceneCode: string,
    success: boolean,
    engagementScore?: number
  ): Promise<void> {
    const scene = await prisma.scene.findUnique({
      where: { code: sceneCode },
    });

    if (!scene) return;

    // Calcular nuevo success rate y engagement
    const totalExecutions = scene.usageCount + 1;
    const newSuccessRate =
      (scene.successRate * scene.usageCount + (success ? 1 : 0)) /
      totalExecutions;

    let newAvgEngagement = scene.avgEngagement;
    if (engagementScore !== undefined) {
      newAvgEngagement =
        (scene.avgEngagement * scene.usageCount + engagementScore) /
        totalExecutions;
    }

    await prisma.scene.update({
      where: { code: sceneCode },
      data: {
        usageCount: { increment: 1 },
        successRate: newSuccessRate,
        avgEngagement: newAvgEngagement,
      },
    });

    // Actualizar cache
    if (this.cache.has(sceneCode)) {
      const cachedScene = this.cache.get(sceneCode)!;
      cachedScene.usageCount = totalExecutions;
      cachedScene.successRate = newSuccessRate;
      cachedScene.avgEngagement = newAvgEngagement;
    }
  }

  /**
   * Obtiene estadísticas del catálogo
   */
  async getStats(): Promise<{
    total: number;
    byCategory: Record<SceneCategory, number>;
    avgUsage: number;
    avgEngagement: number;
  }> {
    await this.loadCache();

    const byCategory: Record<SceneCategory, number> = {} as any;
    let totalUsage = 0;
    let totalEngagement = 0;
    const total = this.cache.size;

    for (const scene of this.cache.values()) {
      // Contar por categoría
      byCategory[scene.category] = (byCategory[scene.category] || 0) + 1;

      // Sumar métricas
      totalUsage += scene.usageCount;
      totalEngagement += scene.avgEngagement;
    }

    return {
      total,
      byCategory,
      avgUsage: total > 0 ? totalUsage / total : 0,
      avgEngagement: total > 0 ? totalEngagement / total : 0,
    };
  }

  /**
   * Busca escenas que mencionen un agente específico
   */
  async findScenesForAgent(
    agentId: string,
    category?: SceneCategory
  ): Promise<Scene[]> {
    await this.loadCache();

    let scenes = Array.from(this.cache.values());

    if (category) {
      scenes = scenes.filter((scene) => scene.category === category);
    }

    // Todas las escenas son válidas para cualquier agente
    // (los roles se asignan dinámicamente)
    return scenes;
  }
}

// Singleton
export const sceneCatalogService = new SceneCatalogService();
