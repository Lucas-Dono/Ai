/**
 * Narrative Analyzer - Sistema de análisis narrativo en tiempo real
 *
 * Analiza las interacciones para detectar:
 * - Patrones conversacionales repetitivos
 * - Tensión dramática
 * - Progreso de relaciones
 * - Momentos clave narrativos
 * - Estancamiento narrativo
 */

import { createLogger } from '@/lib/logger';

const log = createLogger('NarrativeAnalyzer');

// ========================================
// TIPOS
// ========================================

export interface InteractionForAnalysis {
  id: string;
  speakerId: string;
  speakerName: string;
  content: string;
  sentiment?: string;
  turn: number;
  emotionalState?: any;
}

export interface NarrativeMetrics {
  // Repetición
  repetitionScore: number; // 0-1, mayor = más repetitivo
  uniqueTopics: string[];
  topicFrequency: Map<string, number>;

  // Tensión dramática
  dramaticTension: number; // 0-1, mayor = más tensión
  emotionalVariance: number; // Qué tan variadas son las emociones

  // Progreso
  relationshipMomentDetected: boolean;
  keyMomentType?: 'confession' | 'conflict' | 'bonding' | 'revelation' | 'comedy';

  // Engagement
  engagementScore: number; // 0-1, qué tan interesante está la conversación
  dialogueQuality: number; // 0-1, calidad del diálogo

  // Balance
  speakerBalance: number; // 0-1, qué tan balanceado está el diálogo
  dominantSpeaker?: string;
}

export interface NarrativeWarning {
  type: 'repetition' | 'stagnation' | 'imbalance' | 'low_tension' | 'poor_quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion: string;
}

// ========================================
// NARRATIVE ANALYZER
// ========================================

export class NarrativeAnalyzer {
  private worldId: string;

  constructor(worldId: string) {
    this.worldId = worldId;
  }

  /**
   * Analiza las últimas interacciones y genera métricas
   */
  async analyze(interactions: InteractionForAnalysis[]): Promise<{
    metrics: NarrativeMetrics;
    warnings: NarrativeWarning[];
  }> {
    if (interactions.length === 0) {
      return {
        metrics: this.getDefaultMetrics(),
        warnings: [],
      };
    }

    // Analizar diferentes aspectos
    const repetitionAnalysis = this.analyzeRepetition(interactions);
    const tensionAnalysis = this.analyzeTension(interactions);
    const progressAnalysis = this.analyzeProgress(interactions);
    const engagementAnalysis = this.analyzeEngagement(interactions);
    const balanceAnalysis = this.analyzeBalance(interactions);

    // Combinar métricas
    const metrics = {
      ...repetitionAnalysis,
      ...tensionAnalysis,
      ...progressAnalysis,
      ...engagementAnalysis,
      ...balanceAnalysis,
    } as NarrativeMetrics;

    // Generar warnings basados en métricas
    const warnings = this.generateWarnings(metrics);

    log.debug(
      {
        worldId: this.worldId,
        metrics: {
          repetition: metrics.repetitionScore.toFixed(2),
          tension: metrics.dramaticTension.toFixed(2),
          engagement: metrics.engagementScore.toFixed(2),
          quality: metrics.dialogueQuality.toFixed(2),
        },
        warningsCount: warnings.length,
      },
      '📊 Narrative analysis complete'
    );

    return { metrics, warnings };
  }

  /**
   * Analiza repetición y variedad temática
   */
  private analyzeRepetition(interactions: InteractionForAnalysis[]): Partial<NarrativeMetrics> {
    const recentInteractions = interactions.slice(-10);

    // Extraer "topics" simples (palabras clave frecuentes)
    const topicFrequency = new Map<string, number>();
    const stopWords = new Set(['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'para', 'por', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'fue', 'este', 'ha', 'sí', 'porque', 'esta', 'son', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'del', 'time', 'would', 'make', 'than', 'first', 'been', 'its', 'who', 'oil', 'sit', 'now', 'find', 'long', 'down', 'day', 'get', 'come', 'made', 'may', 'part', 'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'this', 'have', 'has', 'will', 'what', 'if', 'so', 'up', 'said', 'about', 'into', 'them', 'some', 'could', 'him', 'see', 'then', 'now', 'only', 'its', 'my', 'over', 'such', 'our', 'even', 'most', 'me', 'state', 'just', 'year', 'or']);

    for (const interaction of recentInteractions) {
      const words = interaction.content
        .toLowerCase()
        .replace(/[^\w\sáéíóúñü]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w));

      for (const word of words) {
        topicFrequency.set(word, (topicFrequency.get(word) || 0) + 1);
      }
    }

    // Tomar los top topics
    const sortedTopics = Array.from(topicFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const uniqueTopics = sortedTopics.map(t => t[0]);
    const maxFrequency = sortedTopics[0]?.[1] || 1;
    const avgFrequency = sortedTopics.reduce((sum, t) => sum + t[1], 0) / sortedTopics.length || 1;

    // Score de repetición: mayor frecuencia promedio = más repetitivo
    const repetitionScore = Math.min(1, avgFrequency / (recentInteractions.length * 0.3));

    return {
      repetitionScore,
      uniqueTopics,
      topicFrequency,
    };
  }

  /**
   * Analiza tensión dramática y variación emocional
   */
  private analyzeTension(interactions: InteractionForAnalysis[]): Partial<NarrativeMetrics> {
    const recentInteractions = interactions.slice(-10);

    // Mapear sentimientos a valores numéricos
    const sentimentValues: Record<string, number> = {
      very_negative: -1,
      negative: -0.5,
      neutral: 0,
      positive: 0.5,
      very_positive: 1,
    };

    const sentiments = recentInteractions
      .map(i => sentimentValues[i.sentiment || 'neutral'] || 0);

    // Calcular varianza emocional
    const avgSentiment = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
    const variance = sentiments.reduce((sum, s) => sum + Math.pow(s - avgSentiment, 2), 0) / sentiments.length;
    const emotionalVariance = Math.sqrt(variance);

    // Tensión dramática: combinación de emociones negativas y varianza
    const negativeCount = sentiments.filter(s => s < 0).length;
    const tensionFromNegativity = negativeCount / sentiments.length;
    const tensionFromVariance = Math.min(1, emotionalVariance);
    const dramaticTension = (tensionFromNegativity * 0.4 + tensionFromVariance * 0.6);

    return {
      dramaticTension,
      emotionalVariance,
    };
  }

  /**
   * Analiza progreso narrativo y momentos clave
   */
  private analyzeProgress(interactions: InteractionForAnalysis[]): Partial<NarrativeMetrics> {
    const recentInteractions = interactions.slice(-5);

    // Buscar palabras clave que indiquen momentos importantes
    const keywordPatterns = {
      confession: /\b(me gustas|te amo|te quiero|amo|amor|sentimientos|confesar)\b/i,
      conflict: /\b(enojad|molest|pelea|discusión|problema|mal|enfadar|furioso)\b/i,
      bonding: /\b(amigos|amistad|confiar|confianza|apoyo|ayudar|juntos)\b/i,
      revelation: /\b(secreto|revelar|verdad|descubr|sorpresa|nunca supiste)\b/i,
      comedy: /\b(jaja|risa|gracioso|chistoso|divertido|broma|bromear)\b/i,
    };

    let relationshipMomentDetected = false;
    let keyMomentType: NarrativeMetrics['keyMomentType'] = undefined;

    for (const interaction of recentInteractions) {
      for (const [type, pattern] of Object.entries(keywordPatterns)) {
        if (pattern.test(interaction.content)) {
          relationshipMomentDetected = true;
          keyMomentType = type as NarrativeMetrics['keyMomentType'];
          break;
        }
      }
      if (relationshipMomentDetected) break;
    }

    return {
      relationshipMomentDetected,
      keyMomentType,
    };
  }

  /**
   * Analiza engagement y calidad del diálogo
   */
  private analyzeEngagement(interactions: InteractionForAnalysis[]): Partial<NarrativeMetrics> {
    const recentInteractions = interactions.slice(-10);

    // Calcular longitud promedio (más largo generalmente = más engagement)
    const avgLength = recentInteractions.reduce((sum, i) => sum + i.content.length, 0) / recentInteractions.length;
    const lengthScore = Math.min(1, avgLength / 200); // 200 chars = score 1

    // Calcular variedad de longitudes (más variedad = mejor ritmo)
    const lengths = recentInteractions.map(i => i.content.length);
    const avgLengthVariance = lengths.reduce((sum, l) => sum + Math.abs(l - avgLength), 0) / lengths.length;
    const varietyScore = Math.min(1, avgLengthVariance / 50);

    // Detectar diálogos muy cortos repetitivos (malo)
    const shortReplies = recentInteractions.filter(i => i.content.length < 30).length;
    const shortReplyPenalty = shortReplies / recentInteractions.length;

    const engagementScore = Math.max(0, lengthScore * 0.5 + varietyScore * 0.3 - shortReplyPenalty * 0.2);
    const dialogueQuality = Math.max(0, lengthScore * 0.6 + varietyScore * 0.4);

    return {
      engagementScore,
      dialogueQuality,
    };
  }

  /**
   * Analiza balance entre speakers
   */
  private analyzeBalance(interactions: InteractionForAnalysis[]): Partial<NarrativeMetrics> {
    const recentInteractions = interactions.slice(-10);

    // Contar participación por speaker
    const speakerCounts = new Map<string, number>();
    for (const interaction of recentInteractions) {
      speakerCounts.set(
        interaction.speakerName,
        (speakerCounts.get(interaction.speakerName) || 0) + 1
      );
    }

    // Encontrar dominante
    const sortedSpeakers = Array.from(speakerCounts.entries()).sort((a, b) => b[1] - a[1]);
    const dominantSpeaker = sortedSpeakers[0]?.[0];
    const maxCount = sortedSpeakers[0]?.[1] || 1;

    // Balance: qué tan igualitaria es la distribución
    const totalSpeakers = speakerCounts.size;
    const idealCount = recentInteractions.length / totalSpeakers;
    const deviations = Array.from(speakerCounts.values()).map(count => Math.abs(count - idealCount));
    const avgDeviation = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;
    const speakerBalance = Math.max(0, 1 - (avgDeviation / idealCount));

    return {
      speakerBalance,
      dominantSpeaker: speakerBalance < 0.5 ? dominantSpeaker : undefined,
    };
  }

  /**
   * Genera warnings basados en métricas
   */
  private generateWarnings(metrics: NarrativeMetrics): NarrativeWarning[] {
    const warnings: NarrativeWarning[] = [];

    // Warning: Repetición alta
    if (metrics.repetitionScore > 0.7) {
      warnings.push({
        type: 'repetition',
        severity: metrics.repetitionScore > 0.85 ? 'critical' : 'high',
        message: 'Conversación muy repetitiva detectada',
        suggestion: 'El Director debería activar un evento o cambiar el foco de conversación',
      });
    }

    // Warning: Estancamiento narrativo
    if (metrics.engagementScore < 0.3 && metrics.dialogueQuality < 0.4) {
      warnings.push({
        type: 'stagnation',
        severity: 'high',
        message: 'Estancamiento narrativo detectado',
        suggestion: 'Introducir un evento sorpresa o forzar un momento clave',
      });
    }

    // Warning: Desbalance de speakers
    if (metrics.speakerBalance < 0.4) {
      warnings.push({
        type: 'imbalance',
        severity: 'medium',
        message: `Desbalance de participación (${metrics.dominantSpeaker} domina)`,
        suggestion: 'Forzar participación de personajes callados',
      });
    }

    // Warning: Tensión muy baja por mucho tiempo
    if (metrics.dramaticTension < 0.2 && metrics.emotionalVariance < 0.3) {
      warnings.push({
        type: 'low_tension',
        severity: 'medium',
        message: 'Tensión dramática muy baja',
        suggestion: 'Introducir conflicto o momento emocional',
      });
    }

    // Warning: Calidad de diálogo pobre
    if (metrics.dialogueQuality < 0.3) {
      warnings.push({
        type: 'poor_quality',
        severity: 'high',
        message: 'Calidad de diálogo muy baja',
        suggestion: 'Revisar prompts de personajes o ajustar dirección de escena',
      });
    }

    return warnings;
  }

  /**
   * Métricas por defecto
   */
  private getDefaultMetrics(): NarrativeMetrics {
    return {
      repetitionScore: 0,
      uniqueTopics: [],
      topicFrequency: new Map(),
      dramaticTension: 0.5,
      emotionalVariance: 0.5,
      relationshipMomentDetected: false,
      engagementScore: 0.5,
      dialogueQuality: 0.5,
      speakerBalance: 1,
    };
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

export function getNarrativeAnalyzer(worldId: string): NarrativeAnalyzer {
  return new NarrativeAnalyzer(worldId);
}
