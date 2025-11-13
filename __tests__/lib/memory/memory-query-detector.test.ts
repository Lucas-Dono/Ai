/**
 * Tests for Memory Query Detector
 *
 * Verifica que el detector identifique correctamente:
 * - Queries de tipo RECALL
 * - Queries de tipo VERIFICATION
 * - Queries de tipo RETRIEVAL
 * - Referencias al pasado
 * - Falsos positivos (mensajes normales)
 */

import { describe, it, expect } from 'vitest';
import { memoryQueryDetector, MemoryQueryDetection } from '@/lib/memory/memory-query-detector';

describe('MemoryQueryDetector', () => {
  describe('RECALL queries', () => {
    it('should detect "¿recuerdas cuando...?"', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Recuerdas cuando te conté sobre mi perro?');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.queryType).toBe('recall');
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
      expect(result.keywords).toContain('perro');
    });

    it('should detect "¿te acuerdas de...?"', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Te acuerdas de mi cumpleaños?');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.queryType).toBe('recall');
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
      expect(result.keywords).toContain('cumpleaños');
    });

    it('should detect "¿sabes lo que...?"', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Sabes lo que me pasó ayer?');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.queryType).toBe('recall');
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });
  });

  describe('VERIFICATION queries', () => {
    it('should detect "¿te dije que...?"', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Te dije que me mudé a Madrid?');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.queryType).toBe('verification');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      expect(result.keywords).toContain('mudé');
      expect(result.keywords).toContain('madrid');
    });

    it('should detect "¿te conté que...?"', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Te conté que tengo un gato?');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.queryType).toBe('verification');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      expect(result.keywords).toContain('gato');
    });

    it('should detect "¿te mencioné...?"', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Te mencioné mi trabajo nuevo?');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.queryType).toBe('verification');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      expect(result.keywords).toContain('trabajo');
      expect(result.keywords).toContain('nuevo');
    });
  });

  describe('RETRIEVAL queries', () => {
    it('should detect "¿qué te dije sobre...?"', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Qué te dije sobre mi familia?');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.queryType).toBe('retrieval');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
      expect(result.keywords).toContain('familia');
    });

    it('should detect "¿cuál era... que te dije?"', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Cuál era el nombre que te mencioné?');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.queryType).toBe('retrieval');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
      expect(result.keywords).toContain('nombre');
    });

    it('should detect "¿de qué hablamos...?"', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿De qué hablamos la última vez?');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.queryType).toBe('retrieval');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });
  });

  describe('PAST REFERENCE queries', () => {
    it('should detect "la última vez que..."', () => {
      const result = memoryQueryDetector.detectMemoryQuery('La última vez que hablamos de esto');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.queryType).toBe('recall');
      expect(result.temporalContext).toBe('past');
    });

    it('should detect "dijiste que..."', () => {
      const result = memoryQueryDetector.detectMemoryQuery('Dijiste que te gustaba el chocolate');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.queryType).toBe('recall');
      expect(result.keywords).toContain('chocolate');
    });

    it('should detect "hablamos de..."', () => {
      const result = memoryQueryDetector.detectMemoryQuery('Hablamos de mi proyecto ayer');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.queryType).toBe('recall');
      expect(result.keywords).toContain('proyecto');
    });

    it('should detect "cuando te dije..."', () => {
      const result = memoryQueryDetector.detectMemoryQuery('Cuando te dije mi nombre');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.queryType).toBe('recall');
      expect(result.keywords).toContain('nombre');
    });
  });

  describe('TEMPORAL CONTEXT detection', () => {
    it('should detect "recent" temporal context', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Recuerdas lo que pasó hace poco?');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.temporalContext).toBe('recent');
    });

    it('should detect "specific" temporal context', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Recuerdas lo que pasó ayer?');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.temporalContext).toBe('specific');
    });

    it('should detect "past" temporal context', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Recuerdas lo que pasó antes?');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.temporalContext).toBe('past');
    });
  });

  describe('FALSE POSITIVES (normal messages)', () => {
    it('should NOT detect normal questions', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Cómo estás hoy?');

      expect(result.isMemoryQuery).toBe(false);
      expect(result.queryType).toBe('none');
    });

    it('should NOT detect statements without memory context', () => {
      const result = memoryQueryDetector.detectMemoryQuery('Me gusta el café');

      expect(result.isMemoryQuery).toBe(false);
      expect(result.queryType).toBe('none');
    });

    it('should NOT detect future-oriented questions', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Qué vas a hacer mañana?');

      expect(result.isMemoryQuery).toBe(false);
      expect(result.queryType).toBe('none');
    });

    it('should NOT detect present-tense statements', () => {
      const result = memoryQueryDetector.detectMemoryQuery('Estoy cansado ahora');

      expect(result.isMemoryQuery).toBe(false);
      expect(result.queryType).toBe('none');
    });
  });

  describe('KEYWORD EXTRACTION', () => {
    it('should extract relevant keywords', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Recuerdas mi cumpleaños en diciembre?');

      expect(result.keywords).toContain('cumpleaños');
      expect(result.keywords).toContain('diciembre');
    });

    it('should filter out stop words', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Te dije que me gusta el chocolate?');

      // Should include important words
      expect(result.keywords).toContain('chocolate');

      // Should NOT include stop words
      expect(result.keywords).not.toContain('el');
      expect(result.keywords).not.toContain('que');
      expect(result.keywords).not.toContain('me');
    });

    it('should limit keywords to 10', () => {
      const longMessage = '¿Recuerdas cuando te conté sobre mi viaje increíble a España donde visité Madrid Barcelona Valencia Sevilla Granada Bilbao Málaga Córdoba Toledo y muchas otras ciudades?';
      const result = memoryQueryDetector.detectMemoryQuery(longMessage);

      expect(result.keywords.length).toBeLessThanOrEqual(10);
    });
  });

  describe('TOPIC EXTRACTION', () => {
    it('should extract topic from recall query', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Recuerdas cuando te hablé de mi perro?');
      const topic = memoryQueryDetector.extractTopic('¿Recuerdas cuando te hablé de mi perro?', result);

      expect(topic).toContain('perro');
    });

    it('should extract topic from retrieval query', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Qué te dije sobre mi familia?');
      const topic = memoryQueryDetector.extractTopic('¿Qué te dije sobre mi familia?', result);

      expect(topic).toContain('familia');
    });

    it('should extract topic from verification query', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Te conté que me mudé a Madrid?');
      const topic = memoryQueryDetector.extractTopic('¿Te conté que me mudé a Madrid?', result);

      expect(topic.toLowerCase()).toContain('madrid');
    });
  });

  describe('EDGE CASES', () => {
    it('should handle empty string', () => {
      const result = memoryQueryDetector.detectMemoryQuery('');

      expect(result.isMemoryQuery).toBe(false);
      expect(result.queryType).toBe('none');
    });

    it('should handle very short messages', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿?');

      expect(result.isMemoryQuery).toBe(false);
    });

    it('should handle messages with only punctuation', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿¡!?');

      expect(result.isMemoryQuery).toBe(false);
    });

    it('should be case-insensitive', () => {
      const result1 = memoryQueryDetector.detectMemoryQuery('¿RECUERDAS MI NOMBRE?');
      const result2 = memoryQueryDetector.detectMemoryQuery('¿recuerdas mi nombre?');

      expect(result1.isMemoryQuery).toBe(true);
      expect(result2.isMemoryQuery).toBe(true);
      expect(result1.queryType).toBe(result2.queryType);
    });
  });

  describe('PERFORMANCE', () => {
    it('should detect in under 10ms', () => {
      const start = Date.now();

      memoryQueryDetector.detectMemoryQuery('¿Recuerdas cuando te hablé de mi familia?');

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(10);
    });

    it('should handle 100 detections in under 100ms', () => {
      const start = Date.now();

      for (let i = 0; i < 100; i++) {
        memoryQueryDetector.detectMemoryQuery('¿Recuerdas mi cumpleaños?');
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });

  describe('REAL-WORLD EXAMPLES', () => {
    it('should detect birthday memory query', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Recuerdas cuándo es mi cumpleaños?');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.keywords).toContain('cumpleaños');
    });

    it('should detect name memory query', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Cómo te dije que se llamaba mi hermano?');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.keywords).toContain('hermano');
    });

    it('should detect job memory query', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Te conté en qué trabajo?');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.keywords).toContain('trabajo');
    });

    it('should detect preference memory query', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Recuerdas cuál es mi comida favorita?');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.keywords).toContain('comida');
      expect(result.keywords).toContain('favorita');
    });

    it('should detect location memory query', () => {
      const result = memoryQueryDetector.detectMemoryQuery('¿Te mencioné dónde vivo?');

      expect(result.isMemoryQuery).toBe(true);
      expect(result.keywords).toContain('vivo');
    });
  });
});
