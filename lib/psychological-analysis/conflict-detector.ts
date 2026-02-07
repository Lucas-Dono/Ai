/**
 * Conflict Detector
 *
 * Detecta conflictos psicológicos en perfiles enriquecidos usando las reglas definidas.
 * Filtra, ordena y categoriza conflictos por severidad y categoría.
 *
 * @version 1.0.0
 */

import type { EnrichedPersonalityProfile, ConflictWarning, ConflictSeverity } from './types';
import { CONFLICT_RULES, RULES_BY_CATEGORY, RULES_BY_SEVERITY } from './conflict-rules';

/**
 * Orden de severidad (de menos a más grave).
 */
const SEVERITY_ORDER: ConflictSeverity[] = ['info', 'warning', 'danger', 'critical'];

/**
 * Compara dos severidades.
 * @returns número negativo si a < b, positivo si a > b, 0 si iguales
 */
function compareSeverity(a: ConflictSeverity, b: ConflictSeverity): number {
  return SEVERITY_ORDER.indexOf(a) - SEVERITY_ORDER.indexOf(b);
}

/**
 * Detector de conflictos psicológicos.
 */
export class ConflictDetector {
  /**
   * Detecta todos los conflictos en un perfil.
   *
   * @param profile - Perfil psicológico enriquecido
   * @returns Lista de conflictos detectados, ordenados por severidad (críticos primero)
   */
  detectConflicts(profile: EnrichedPersonalityProfile): ConflictWarning[] {
    const detectedConflicts: ConflictWarning[] = [];

    for (const rule of CONFLICT_RULES) {
      try {
        if (rule.detect(profile)) {
          detectedConflicts.push({
            id: rule.id,
            severity: rule.severity,
            title: rule.title,
            description: rule.description,
            implications: rule.implications,
            mitigations: rule.mitigations,
            metadata: {
              category: rule.category,
            },
          });
        }
      } catch (error) {
        // Si hay error en la detección, skip silently
        console.warn(`Error detecting conflict for rule ${rule.id}:`, error);
      }
    }

    // Ordenar por severidad (críticos primero)
    return detectedConflicts.sort((a, b) => compareSeverity(b.severity, a.severity));
  }

  /**
   * Detecta conflictos y filtra por severidad mínima.
   *
   * @param profile - Perfil psicológico
   * @param minSeverity - Severidad mínima a incluir (default: 'info')
   * @returns Conflictos filtrados
   */
  detectConflictsWithMinSeverity(profile: EnrichedPersonalityProfile, minSeverity: ConflictSeverity = 'info'): ConflictWarning[] {
    const allConflicts = this.detectConflicts(profile);
    const minIndex = SEVERITY_ORDER.indexOf(minSeverity);

    return allConflicts.filter((conflict) => {
      const conflictIndex = SEVERITY_ORDER.indexOf(conflict.severity);
      return conflictIndex >= minIndex;
    });
  }

  /**
   * Detecta solo conflictos críticos.
   */
  detectCriticalConflicts(profile: EnrichedPersonalityProfile): ConflictWarning[] {
    return this.detectConflicts(profile).filter((c) => c.severity === 'critical');
  }

  /**
   * Detecta conflictos y agrupa por categoría.
   *
   * @param profile - Perfil psicológico
   * @returns Conflictos agrupados por categoría
   */
  detectConflictsByCategory(
    profile: EnrichedPersonalityProfile
  ): Record<string, ConflictWarning[]> {
    const conflicts = this.detectConflicts(profile);
    const grouped: Record<string, ConflictWarning[]> = {
      'big-five': [],
      facets: [],
      'dark-triad': [],
      attachment: [],
      'cross-dimensional': [],
    };

    for (const conflict of conflicts) {
      const category = conflict.metadata?.category as string | undefined;
      if (category && grouped[category]) {
        grouped[category].push(conflict);
      }
    }

    return grouped;
  }

  /**
   * Detecta conflictos y agrupa por severidad.
   *
   * @param profile - Perfil psicológico
   * @returns Conflictos agrupados por severidad
   */
  detectConflictsBySeverity(
    profile: EnrichedPersonalityProfile
  ): Record<ConflictSeverity, ConflictWarning[]> {
    const conflicts = this.detectConflicts(profile);
    const grouped: Record<ConflictSeverity, ConflictWarning[]> = {
      info: [],
      warning: [],
      danger: [],
      critical: [],
    };

    for (const conflict of conflicts) {
      grouped[conflict.severity].push(conflict);
    }

    return grouped;
  }

  /**
   * Calcula un score de conflicto general (0-100).
   * 0 = sin conflictos, 100 = muchos conflictos graves.
   *
   * @param profile - Perfil psicológico
   * @returns Score de conflicto 0-100
   */
  calculateConflictScore(profile: EnrichedPersonalityProfile): number {
    const conflicts = this.detectConflicts(profile);

    // Pesos por severidad
    const weights = {
      info: 5,
      warning: 15,
      danger: 30,
      critical: 50,
    };

    let totalScore = 0;
    for (const conflict of conflicts) {
      totalScore += weights[conflict.severity];
    }

    // Clamp a 100
    return Math.min(100, totalScore);
  }

  /**
   * Verifica si un perfil tiene conflictos críticos.
   *
   * @param profile - Perfil psicológico
   * @returns true si hay al menos un conflicto crítico
   */
  hasCriticalConflicts(profile: EnrichedPersonalityProfile): boolean {
    return this.detectCriticalConflicts(profile).length > 0;
  }

  /**
   * Obtiene un resumen de conflictos.
   *
   * @param profile - Perfil psicológico
   * @returns Resumen con counts por severidad
   */
  getConflictSummary(profile: EnrichedPersonalityProfile): {
    total: number;
    bySeverity: Record<ConflictSeverity, number>;
    score: number;
    hasCritical: boolean;
  } {
    const conflicts = this.detectConflicts(profile);
    const bySeverity = this.detectConflictsBySeverity(profile);

    return {
      total: conflicts.length,
      bySeverity: {
        info: bySeverity.info.length,
        warning: bySeverity.warning.length,
        danger: bySeverity.danger.length,
        critical: bySeverity.critical.length,
      },
      score: this.calculateConflictScore(profile),
      hasCritical: this.hasCriticalConflicts(profile),
    };
  }
}

/**
 * Función de conveniencia para detectar conflictos.
 * Equivalente a `new ConflictDetector().detectConflicts(profile)`.
 */
export function detectConflicts(profile: EnrichedPersonalityProfile): ConflictWarning[] {
  return new ConflictDetector().detectConflicts(profile);
}

/**
 * Función de conveniencia para detectar solo conflictos críticos.
 */
export function detectCriticalConflicts(profile: EnrichedPersonalityProfile): ConflictWarning[] {
  return new ConflictDetector().detectCriticalConflicts(profile);
}

/**
 * Función de conveniencia para calcular score de conflicto.
 */
export function calculateConflictScore(profile: EnrichedPersonalityProfile): number {
  return new ConflictDetector().calculateConflictScore(profile);
}
