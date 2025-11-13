/**
 * INTELLIGENT MEMORY STORAGE SYSTEM
 *
 * Sistema multi-factor que decide qué memorias guardar basándose en:
 * 1. Factor emocional: Arousal/intensidad emocional alta
 * 2. Factor informativo: Nueva información sobre el usuario
 * 3. Factor de eventos: Eventos significativos detectados
 * 4. Factor temporal: Consistencia/repetición (consolidación)
 *
 * SCORING SYSTEM:
 * - Arousal > 0.6: +30 puntos
 * - Nueva información personal: +40 puntos
 * - Evento significativo: +50 puntos
 * - Mencionado 2+ veces: +20 puntos
 * - Threshold para guardar: 50 puntos
 *
 * INTEGRACIÓN:
 * - Se integra con Important Events/People services
 * - Reemplaza el sistema simple de importance
 * - Evita false positives con múltiples factores
 */

import { createLogger } from "@/lib/logger";
import type { EmotionState } from "../../types";
import { ImportantEventsService } from "@/lib/services/important-events.service";
import { ImportantPeopleService } from "@/lib/services/important-people.service";

const log = createLogger("IntelligentStorage");

// Temporary type until Appraisal is properly defined
type Appraisal = any;

// Tipos para el sistema
export interface StorageDecision {
  shouldStore: boolean;
  finalScore: number;
  factors: {
    emotional: number;
    informative: number;
    eventBased: number;
    temporal: number;
  };
  detectedEntities: {
    personalInfo?: PersonalInfoDetection;
    significantEvent?: SignificantEventDetection;
    importantPerson?: ImportantPersonDetection;
  };
  importance: number; // 0-1 para compatibility con sistema actual
}

export interface PersonalInfoDetection {
  type: 'name' | 'age' | 'location' | 'occupation' | 'preference' | 'relationship' | 'health' | 'goal';
  value: string;
  confidence: number; // 0-1
}

export interface SignificantEventDetection {
  type: 'birthday' | 'medical' | 'exam' | 'special' | 'anniversary' | 'job_change' | 'relationship_change' | 'achievement' | 'loss';
  description: string;
  confidence: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  date?: Date;
}

export interface ImportantPersonDetection {
  name: string;
  relationship?: string;
  mentionContext: string;
  confidence: number;
}

export class IntelligentStorageSystem {
  private readonly STORAGE_THRESHOLD = 50; // Puntos mínimos para guardar
  private readonly WEIGHTS = {
    emotional: 30,     // Arousal alto
    informative: 40,   // Nueva info personal
    eventBased: 50,    // Evento significativo
    temporal: 20,      // Repetición/consolidación
  };

  /**
   * Decide si una memoria debe guardarse usando scoring multi-factor
   */
  async decideStorage(params: {
    agentId: string;
    userId: string;
    userMessage: string;
    characterResponse: string;
    emotions: EmotionState;
    appraisal: Appraisal;
    conversationHistory?: Array<{ userMessage: string; timestamp: Date }>;
  }): Promise<StorageDecision> {
    log.info({ agentId: params.agentId }, "Analyzing storage decision...");

    const factors = {
      emotional: 0,
      informative: 0,
      eventBased: 0,
      temporal: 0,
    };

    const detectedEntities: StorageDecision['detectedEntities'] = {};

    // ============================================
    // FACTOR 1: EMOCIONAL (Arousal alto)
    // ============================================
    const emotionalScore = this.calculateEmotionalFactor(params.emotions, params.appraisal);
    factors.emotional = emotionalScore;

    log.debug({ score: emotionalScore }, "Emotional factor calculated");

    // ============================================
    // FACTOR 2: INFORMATIVO (Nueva info personal)
    // ============================================
    const personalInfo = this.detectPersonalInformation(params.userMessage);
    if (personalInfo) {
      factors.informative = this.WEIGHTS.informative * personalInfo.confidence;
      detectedEntities.personalInfo = personalInfo;
      log.debug({ type: personalInfo.type, value: personalInfo.value }, "Personal info detected");
    }

    // ============================================
    // FACTOR 3: EVENTOS SIGNIFICATIVOS
    // ============================================
    const significantEvent = this.detectSignificantEvent(params.userMessage, params.appraisal);
    if (significantEvent) {
      factors.eventBased = this.WEIGHTS.eventBased * significantEvent.confidence;
      detectedEntities.significantEvent = significantEvent;
      log.debug({ type: significantEvent.type }, "Significant event detected");
    }

    // ============================================
    // FACTOR 4: TEMPORAL (Consolidación)
    // ============================================
    if (params.conversationHistory) {
      const temporalScore = this.calculateTemporalFactor(
        params.userMessage,
        params.conversationHistory
      );
      factors.temporal = temporalScore;
      log.debug({ score: temporalScore }, "Temporal factor calculated");
    }

    // ============================================
    // DETECCIÓN DE PERSONAS IMPORTANTES
    // ============================================
    const importantPerson = this.detectImportantPerson(params.userMessage);
    if (importantPerson) {
      detectedEntities.importantPerson = importantPerson;
      // Las personas importantes aumentan el factor informativo
      factors.informative += 15 * importantPerson.confidence;
      log.debug({ name: importantPerson.name }, "Important person detected");
    }

    // ============================================
    // SCORING FINAL
    // ============================================
    const finalScore = Object.values(factors).reduce((sum, score) => sum + score, 0);
    const shouldStore = finalScore >= this.STORAGE_THRESHOLD;

    // Calcular importance normalizada (0-1) para compatibility
    const importance = Math.min(1, finalScore / 100);

    log.info(
      {
        shouldStore,
        finalScore,
        factors,
        importance,
        threshold: this.STORAGE_THRESHOLD,
      },
      "Storage decision made"
    );

    return {
      shouldStore,
      finalScore,
      factors,
      detectedEntities,
      importance,
    };
  }

  /**
   * FACTOR 1: Calcula score emocional basado en arousal
   *
   * Arousal alto indica intensidad emocional → memoria más importante
   */
  private calculateEmotionalFactor(emotions: EmotionState, appraisal: Appraisal): number {
    // Calcular arousal promedio de emociones activas
    const emotionValues = Object.entries(emotions)
      .filter(([key]) => key !== 'lastUpdated')
      .map(([_, value]) => value as number);

    const averageIntensity = emotionValues.reduce((sum, val) => sum + val, 0) / emotionValues.length;

    // También considerar desirability extrema (muy positiva o muy negativa)
    const extremeDesirability = Math.abs(appraisal.desirability);

    // Arousal = intensidad emocional + extremidad
    const arousal = (averageIntensity + extremeDesirability) / 2;

    // Si arousal > 0.6, dar puntos (escalado)
    if (arousal > 0.6) {
      const scaleFactor = (arousal - 0.6) / 0.4; // 0.6-1.0 → 0-1
      return this.WEIGHTS.emotional * scaleFactor;
    }

    return 0;
  }

  /**
   * FACTOR 2: Detecta información personal nueva
   *
   * Busca patrones de información personal:
   * - Nombre: "me llamo X", "mi nombre es X", "soy X"
   * - Edad: "tengo X años", "soy de X años"
   * - Ubicación: "vivo en X", "soy de X"
   * - Ocupación: "trabajo en X", "soy X (profesión)"
   * - Preferencias: "me gusta X", "odio X", "prefiero X"
   * - Relaciones: "mi X (pareja/hermano/madre)", "tengo un X"
   * - Salud: "estoy enfermo", "tengo X", "me diagnosticaron X"
   * - Metas: "quiero X", "mi objetivo es X", "planeo X"
   */
  private detectPersonalInformation(message: string): PersonalInfoDetection | null {
    const lowerMessage = message.toLowerCase();

    // NOMBRE
    const namePatterns = [
      /(?:me llamo|mi nombre es|soy|pueden llamarme)\s+([a-záéíóúñ]+)/i,
    ];
    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match) {
        return {
          type: 'name',
          value: match[1],
          confidence: 0.9,
        };
      }
    }

    // EDAD
    const agePatterns = [
      /tengo\s+(\d+)\s+años/i,
      /soy\s+de\s+(\d+)\s+años/i,
      /tengo\s+(\d+)/i,
    ];
    for (const pattern of agePatterns) {
      const match = message.match(pattern);
      if (match) {
        const age = parseInt(match[1]);
        if (age >= 10 && age <= 120) {
          return {
            type: 'age',
            value: match[1],
            confidence: 0.85,
          };
        }
      }
    }

    // UBICACIÓN
    if (lowerMessage.includes('vivo en') || lowerMessage.includes('soy de')) {
      const locationMatch = message.match(/(?:vivo en|soy de)\s+([a-záéíóúñ\s]+?)(?:\.|,|$)/i);
      if (locationMatch) {
        return {
          type: 'location',
          value: locationMatch[1].trim(),
          confidence: 0.8,
        };
      }
    }

    // OCUPACIÓN
    const occupationPatterns = [
      /trabajo (?:en|como|de)\s+([a-záéíóúñ\s]+?)(?:\.|,|$)/i,
      /soy\s+(doctor|ingeniero|profesor|estudiante|programador|desarrollador|diseñador|artista|músico|escritor|chef|abogado|enfermero)/i,
    ];
    for (const pattern of occupationPatterns) {
      const match = message.match(pattern);
      if (match) {
        return {
          type: 'occupation',
          value: match[1].trim(),
          confidence: 0.85,
        };
      }
    }

    // PREFERENCIAS
    if (lowerMessage.includes('me gusta') || lowerMessage.includes('me encanta') ||
        lowerMessage.includes('odio') || lowerMessage.includes('prefiero')) {
      const prefMatch = message.match(/(?:me gusta|me encanta|odio|prefiero)\s+([a-záéíóúñ\s]+?)(?:\.|,|$)/i);
      if (prefMatch) {
        return {
          type: 'preference',
          value: prefMatch[1].trim(),
          confidence: 0.7,
        };
      }
    }

    // RELACIONES
    const relationshipPatterns = [
      /mi\s+(novio|novia|pareja|esposo|esposa|hermano|hermana|madre|padre|hijo|hija|amigo|amiga|mascota|perro|gato)/i,
      /tengo\s+(?:un|una)\s+(novio|novia|pareja|esposo|esposa|hermano|hermana|hijo|hija|mascota|perro|gato)/i,
    ];
    for (const pattern of relationshipPatterns) {
      const match = message.match(pattern);
      if (match) {
        return {
          type: 'relationship',
          value: match[1],
          confidence: 0.85,
        };
      }
    }

    // SALUD
    const healthPatterns = [
      /(?:estoy|me siento)\s+(enfermo|enferma|mal|deprimido|deprimida|ansioso|ansiosa)/i,
      /tengo\s+(ansiedad|depresión|diabetes|cáncer|asma)/i,
      /me diagnosticaron\s+([a-záéíóúñ\s]+?)(?:\.|,|$)/i,
    ];
    for (const pattern of healthPatterns) {
      const match = message.match(pattern);
      if (match) {
        return {
          type: 'health',
          value: match[1].trim(),
          confidence: 0.9,
        };
      }
    }

    // METAS
    const goalPatterns = [
      /(?:quiero|deseo|planeo|mi objetivo es)\s+([a-záéíóúñ\s]+?)(?:\.|,|$)/i,
    ];
    for (const pattern of goalPatterns) {
      const match = message.match(pattern);
      if (match) {
        return {
          type: 'goal',
          value: match[1].trim(),
          confidence: 0.75,
        };
      }
    }

    return null;
  }

  /**
   * FACTOR 3: Detecta eventos significativos
   *
   * Eventos que deben recordarse:
   * - Cumpleaños (propio o de alguien importante)
   * - Citas médicas
   * - Exámenes/entrevistas
   * - Cambios de trabajo
   * - Cambios en relaciones
   * - Logros importantes
   * - Pérdidas/duelos
   */
  private detectSignificantEvent(message: string, appraisal: Appraisal): SignificantEventDetection | null {
    const lowerMessage = message.toLowerCase();

    // CUMPLEAÑOS
    if (lowerMessage.includes('cumpleaños') || lowerMessage.includes('mi cumple')) {
      const dateMatch = this.extractDate(message);
      return {
        type: 'birthday',
        description: message,
        confidence: 0.9,
        priority: 'high',
        date: dateMatch || undefined,
      };
    }

    // MÉDICO
    const medicalKeywords = ['doctor', 'médico', 'consulta', 'cita médica', 'hospital', 'operación', 'cirugía'];
    if (medicalKeywords.some(kw => lowerMessage.includes(kw))) {
      const dateMatch = this.extractDate(message);
      return {
        type: 'medical',
        description: message,
        confidence: 0.85,
        priority: 'high',
        date: dateMatch || undefined,
      };
    }

    // EXÁMENES/ENTREVISTAS
    const examKeywords = ['examen', 'prueba', 'entrevista', 'presentación importante'];
    if (examKeywords.some(kw => lowerMessage.includes(kw))) {
      const dateMatch = this.extractDate(message);
      return {
        type: 'exam',
        description: message,
        confidence: 0.8,
        priority: 'medium',
        date: dateMatch || undefined,
      };
    }

    // CAMBIO DE TRABAJO
    const jobChangeKeywords = ['nuevo trabajo', 'cambié de trabajo', 'renuncié', 'me despidieron', 'nuevo empleo'];
    if (jobChangeKeywords.some(kw => lowerMessage.includes(kw))) {
      return {
        type: 'job_change',
        description: message,
        confidence: 0.9,
        priority: 'high',
      };
    }

    // CAMBIOS EN RELACIONES
    const relationshipKeywords = ['terminamos', 'cortamos', 'me casé', 'me casé', 'me divorcié', 'me separé', 'nuevo novio', 'nueva novia'];
    if (relationshipKeywords.some(kw => lowerMessage.includes(kw))) {
      return {
        type: 'relationship_change',
        description: message,
        confidence: 0.9,
        priority: 'critical',
      };
    }

    // LOGROS
    const achievementKeywords = ['logré', 'conseguí', 'gané', 'terminé', 'completé', 'me gradué'];
    if (achievementKeywords.some(kw => lowerMessage.includes(kw)) && appraisal.desirability > 0.5) {
      return {
        type: 'achievement',
        description: message,
        confidence: 0.75,
        priority: 'medium',
      };
    }

    // PÉRDIDAS
    const lossKeywords = ['murió', 'falleció', 'perdí', 'se fue'];
    if (lossKeywords.some(kw => lowerMessage.includes(kw)) && appraisal.desirability < -0.5) {
      return {
        type: 'loss',
        description: message,
        confidence: 0.85,
        priority: 'critical',
      };
    }

    // ANIVERSARIOS
    if (lowerMessage.includes('aniversario')) {
      const dateMatch = this.extractDate(message);
      return {
        type: 'anniversary',
        description: message,
        confidence: 0.8,
        priority: 'medium',
        date: dateMatch || undefined,
      };
    }

    return null;
  }

  /**
   * FACTOR 4: Calcula factor temporal (repetición/consolidación)
   *
   * Si el usuario ha mencionado algo 2+ veces, probablemente es importante
   */
  private calculateTemporalFactor(
    currentMessage: string,
    conversationHistory: Array<{ userMessage: string; timestamp: Date }>
  ): number {
    // Buscar mensajes similares en el historial (últimos 20)
    const recentHistory = conversationHistory.slice(-20);

    // Extraer palabras clave del mensaje actual
    const keywords = this.extractKeywords(currentMessage);

    if (keywords.length === 0) return 0;

    // Contar menciones de keywords en historial
    let mentionCount = 0;
    for (const past of recentHistory) {
      const pastKeywords = this.extractKeywords(past.userMessage);
      const overlap = keywords.filter(kw => pastKeywords.includes(kw)).length;
      if (overlap >= 2) {
        mentionCount++;
      }
    }

    // Si se mencionó 2+ veces, dar puntos
    if (mentionCount >= 2) {
      return this.WEIGHTS.temporal;
    }

    return 0;
  }

  /**
   * Detecta personas importantes mencionadas
   */
  private detectImportantPerson(message: string): ImportantPersonDetection | null {
    const lowerMessage = message.toLowerCase();

    // Buscar patrones de mención de personas
    const relationshipPattern = /(?:mi|el|la)\s+(novio|novia|pareja|esposo|esposa|hermano|hermana|madre|padre|hijo|hija|amigo|amiga|jefe|colega|mascota)\s+([a-záéíóúñ]+)?/gi;

    const matches = [...message.matchAll(relationshipPattern)];

    if (matches.length > 0) {
      const match = matches[0];
      const relationship = match[1];
      const name = match[2] || relationship; // Si no hay nombre, usar relación

      return {
        name,
        relationship,
        mentionContext: message,
        confidence: match[2] ? 0.9 : 0.7, // Mayor confidence si hay nombre
      };
    }

    // Buscar nombres propios después de ciertos verbos
    const nameIntroPattern = /(?:te presento a|conocí a|vi a|hablé con)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/g;
    const nameMatches = [...message.matchAll(nameIntroPattern)];

    if (nameMatches.length > 0) {
      const name = nameMatches[0][1];
      return {
        name,
        mentionContext: message,
        confidence: 0.85,
      };
    }

    return null;
  }

  /**
   * Extrae keywords significativas de un mensaje
   */
  private extractKeywords(message: string): string[] {
    const lowerMessage = message.toLowerCase();

    // Remover stopwords comunes
    const stopwords = ['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'por', 'para', 'con', 'sin', 'sobre', 'entre', 'que', 'es', 'son', 'fue', 'ser', 'estar', 'he', 'ha', 'hay', 'a', 'y', 'o', 'pero', 'si', 'no', 'me', 'te', 'se', 'mi', 'tu', 'su'];

    const words = lowerMessage
      .replace(/[.,;:!?¿¡()]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopwords.includes(w));

    return words;
  }

  /**
   * Intenta extraer una fecha del mensaje
   */
  private extractDate(message: string): Date | null {
    // Patrones de fecha comunes
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // DD/MM/YYYY
      /(\d{1,2})-(\d{1,2})-(\d{4})/,    // DD-MM-YYYY
      /(\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i,
    ];

    for (const pattern of datePatterns) {
      const match = message.match(pattern);
      if (match) {
        try {
          if (match[3]) {
            // Formato DD/MM/YYYY o DD-MM-YYYY
            return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
          } else {
            // Formato "DD de mes"
            const monthMap: Record<string, number> = {
              enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
              julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
            };
            const month = monthMap[match[2].toLowerCase()];
            const day = parseInt(match[1]);
            const year = new Date().getFullYear();
            return new Date(year, month, day);
          }
        } catch {
          continue;
        }
      }
    }

    return null;
  }

  /**
   * Persiste entidades detectadas en los servicios correspondientes
   */
  async persistDetectedEntities(params: {
    agentId: string;
    userId: string;
    detectedEntities: StorageDecision['detectedEntities'];
  }): Promise<void> {
    const { agentId, userId, detectedEntities } = params;

    // Persistir evento significativo
    if (detectedEntities.significantEvent) {
      const event = detectedEntities.significantEvent;
      try {
        await ImportantEventsService.createEvent(agentId, userId, {
          eventDate: event.date || new Date(),
          type: this.mapEventTypeToSchema(event.type),
          description: event.description,
          priority: event.priority || 'medium',
          emotionalTone: 'neutral',
        });
        log.info({ type: event.type }, "Significant event persisted to ImportantEvents");
      } catch (error) {
        log.error({ error }, "Failed to persist significant event");
      }
    }

    // Persistir persona importante
    if (detectedEntities.importantPerson) {
      const person = detectedEntities.importantPerson;
      try {
        // Verificar si ya existe
        const existing = await ImportantPeopleService.findPersonByName(agentId, userId, person.name);

        if (existing) {
          // Incrementar contador de menciones
          await ImportantPeopleService.incrementMentionCount(existing.id, userId);
          log.info({ name: person.name }, "Important person mention count incremented");
        } else {
          // Crear nuevo
          await ImportantPeopleService.addPerson(agentId, userId, {
            name: person.name,
            relationship: person.relationship || 'unknown',
            importance: 'medium',
          });
          log.info({ name: person.name }, "New important person persisted");
        }
      } catch (error) {
        log.error({ error }, "Failed to persist important person");
      }
    }
  }

  /**
   * Mapea tipos de evento a schema de DB
   */
  private mapEventTypeToSchema(
    type: SignificantEventDetection['type']
  ): 'birthday' | 'medical' | 'exam' | 'special' | 'anniversary' | 'other' {
    const mapping: Record<string, 'birthday' | 'medical' | 'exam' | 'special' | 'anniversary' | 'other'> = {
      birthday: 'birthday',
      medical: 'medical',
      exam: 'exam',
      anniversary: 'anniversary',
      job_change: 'special',
      relationship_change: 'special',
      achievement: 'special',
      loss: 'special',
    };

    return mapping[type] || 'other';
  }
}

/**
 * Singleton instance
 */
export const intelligentStorageSystem = new IntelligentStorageSystem();
