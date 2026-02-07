/**
 * LLM PROVIDER TESTS
 *
 * Tests para el proveedor de LLM (Gemini 2.5)
 * Coverage objetivo: 80%+
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LLMProvider } from '@/lib/llm/provider';
import { mockFetch, mockFetchError, resetAllMocks } from '../../setup';

// Mock character-research to prevent extra API calls during profile generation
vi.mock('@/lib/profile/character-research', () => ({
  researchCharacter: vi.fn().mockResolvedValue({
    detection: {
      isPublicFigure: false,
      confidence: 0,
    },
    biography: null,
    enhancedPrompt: null,
  }),
}));

// Mock environment variables
const originalEnv = process.env;

describe('LLMProvider', () => {
  beforeEach(() => {
    resetAllMocks();
    // Reset environment
    process.env = { ...originalEnv };
    process.env.GOOGLE_AI_API_KEY = 'test-api-key-123';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('debería inicializar con una API key', () => {
      // Act & Assert: No debería lanzar error
      expect(() => new LLMProvider()).not.toThrow();
    });

    it('debería cargar múltiples API keys si están disponibles', () => {
      // Arrange: Configurar múltiples keys
      process.env.GOOGLE_AI_API_KEY_1 = 'key-1';
      process.env.GOOGLE_AI_API_KEY_2 = 'key-2';
      process.env.GOOGLE_AI_API_KEY_3 = 'key-3';

      // Act & Assert
      expect(() => new LLMProvider()).not.toThrow();
    });

    it('debería lanzar error si no hay API keys', () => {
      // Arrange: Sin keys
      delete process.env.GOOGLE_AI_API_KEY;

      // Act & Assert
      expect(() => new LLMProvider()).toThrow('No se encontraron API keys');
    });
  });

  describe('generate', () => {
    let provider: LLMProvider;

    beforeEach(() => {
      provider = new LLMProvider();
    });

    it('debería generar texto exitosamente', async () => {
      // Arrange: Mock respuesta exitosa
      mockFetch({
        candidates: [{
          content: {
            parts: [{
              text: 'This is a generated response',
            }],
          },
        }],
      });

      // Act
      const result = await provider.generate({
        systemPrompt: 'You are a helpful assistant',
        messages: [{ role: 'user', content: 'Hello!' }],
      });

      // Assert
      expect(result).toBe('This is a generated response');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('gemini-2.5-flash-lite'),
        expect.any(Object)
      );
    });

    it('debería usar temperatura personalizada', async () => {
      // Arrange
      mockFetch({
        candidates: [{
          content: {
            parts: [{ text: 'Response' }],
          },
        }],
      });

      // Act
      await provider.generate({
        systemPrompt: 'Test',
        messages: [{ role: 'user', content: 'Test' }],
        temperature: 0.5,
      });

      // Assert: Verificar que se llamó con temperatura correcta
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"temperature":0.5'),
        })
      );
    });

    it('debería usar maxTokens personalizado', async () => {
      // Arrange
      mockFetch({
        candidates: [{
          content: {
            parts: [{ text: 'Response' }],
          },
        }],
      });

      // Act
      await provider.generate({
        systemPrompt: 'Test',
        messages: [{ role: 'user', content: 'Test' }],
        maxTokens: 2000,
      });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"maxOutputTokens":2000'),
        })
      );
    });

    it('debería rotar API key en caso de error de cuota', async () => {
      // Arrange: Configurar múltiples keys
      process.env.GOOGLE_AI_API_KEY_1 = 'key-1';
      process.env.GOOGLE_AI_API_KEY_2 = 'key-2';
      const provider = new LLMProvider();

      // Primera llamada: error de cuota
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Quota exceeded',
      });

      // Segunda llamada: éxito
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{ text: 'Success with key 2' }],
            },
          }],
        }),
      });

      // Act
      const result = await provider.generate({
        systemPrompt: 'Test',
        messages: [{ role: 'user', content: 'Test' }],
      });

      // Assert: Debería haber rotado y tenido éxito
      expect(result).toBe('Success with key 2');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('debería lanzar error si todas las API keys fallan', async () => {
      // Arrange: Solo una key que falla
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => 'Quota exceeded',
      });

      // Act & Assert
      await expect(
        provider.generate({
          systemPrompt: 'Test',
          messages: [{ role: 'user', content: 'Test' }],
        })
      ).rejects.toThrow('Todas las API keys de Gemini han agotado su cuota');
    });

    it('debería manejar errores de red', async () => {
      // Arrange: Error de red
      mockFetchError(new Error('Network error'));

      // Act & Assert
      await expect(
        provider.generate({
          systemPrompt: 'Test',
          messages: [{ role: 'user', content: 'Test' }],
        })
      ).rejects.toThrow('No se pudo generar una respuesta de la IA');
    });

    it('debería manejar respuesta bloqueada por safety filters', async () => {
      // Arrange: Respuesta bloqueada
      mockFetch({
        candidates: [{
          finishReason: 'SAFETY',
          safetyRatings: [
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', probability: 'HIGH' },
          ],
        }],
      });

      // Act & Assert
      await expect(
        provider.generate({
          systemPrompt: 'Test',
          messages: [{ role: 'user', content: 'Test' }],
        })
      ).rejects.toThrow('bloqueó la respuesta por filtros de seguridad');
    });

    it('debería combinar múltiples mensajes correctamente', async () => {
      // Arrange
      mockFetch({
        candidates: [{
          content: {
            parts: [{ text: 'Response' }],
          },
        }],
      });

      // Act
      await provider.generate({
        systemPrompt: 'You are helpful',
        messages: [
          { role: 'user', content: 'First message' },
          { role: 'assistant', content: 'First response' },
          { role: 'user', content: 'Second message' },
        ],
      });

      // Assert: Verificar estructura de mensajes
      const fetchCall = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.contents).toHaveLength(3);
    });

    it('debería usar safety settings permisivos para NSFW', async () => {
      // Arrange
      mockFetch({
        candidates: [{
          content: {
            parts: [{ text: 'Response' }],
          },
        }],
      });

      // Act
      await provider.generate({
        systemPrompt: 'Test',
        messages: [{ role: 'user', content: 'Test' }],
      });

      // Assert: Verificar safety settings
      const fetchCall = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.safetySettings).toBeDefined();
      expect(body.safetySettings.some((s: any) =>
        s.category === 'HARM_CATEGORY_SEXUALLY_EXPLICIT' && s.threshold === 'BLOCK_NONE'
      )).toBe(true);
    });
  });

  describe('generateProfile', () => {
    let provider: LLMProvider;

    beforeEach(() => {
      provider = new LLMProvider();
    });

    it('debería generar perfil completo exitosamente', async () => {
      // Arrange: Mock respuesta con JSON válido
      const profileData = {
        profile: {
          basicIdentity: {
            fullName: 'Test Character',
            age: 25,
            city: 'Buenos Aires',
          },
          personality: {
            traits: ['friendly', 'curious'],
            bigFive: {
              openness: 70,
              conscientiousness: 60,
              extraversion: 50,
              agreeableness: 80,
              neuroticism: 30,
            },
          },
        },
        systemPrompt: 'Character description...',
      };

      mockFetch({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify(profileData),
            }],
          },
        }],
      });

      // Act
      const result = await provider.generateProfile({
        name: 'Test Character',
        personality: 'friendly and curious',
        purpose: 'companion',
      });

      // Assert
      expect(result.profile).toBeDefined();
      expect(result.systemPrompt).toBeDefined();
      expect(result.profile.basicIdentity).toBeDefined();
    });

    it('debería extraer JSON de markdown code blocks', async () => {
      // Arrange: Respuesta con markdown
      const profileData = {
        profile: { basicIdentity: { fullName: 'Test' } },
        systemPrompt: 'Test',
      };

      mockFetch({
        candidates: [{
          content: {
            parts: [{
              text: '```json\n' + JSON.stringify(profileData) + '\n```',
            }],
          },
        }],
      });

      // Act
      const result = await provider.generateProfile({
        name: 'Test',
      });

      // Assert
      expect(result.profile).toBeDefined();
    });

    it('debería usar fallback si el LLM falla', async () => {
      // Arrange: Error de API
      mockFetchError(new Error('API error'));

      // Act
      const result = await provider.generateProfile({
        name: 'Test Character',
        personality: 'friendly',
      });

      // Assert: Debería retornar fallback en vez de fallar
      expect(result.profile).toBeDefined();
      expect(result.profile.basicIdentity?.fullName).toBe('Test Character');
      expect(result.systemPrompt).toContain('Test Character');
    });

    it('debería usar Gemini 2.5 Flash (modelo completo) para ULTRA tier profiles', async () => {
      // Arrange
      mockFetch({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                profile: {},
                systemPrompt: 'Test',
              }),
            }],
          },
        }],
      });

      // Act - Pass ULTRA tier to use full model
      await provider.generateProfile({ name: 'Test' }, 'ultra');

      // Assert: ULTRA tier debería usar el modelo completo (no lite)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('gemini-2.5-flash'),
        expect.any(Object)
      );
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('flash-lite'),
        expect.any(Object)
      );
    });

    it('debería rotar API keys en generateProfile si hay error de cuota', async () => {
      // Arrange: Múltiples keys
      process.env.GOOGLE_AI_API_KEY_1 = 'key-1';
      process.env.GOOGLE_AI_API_KEY_2 = 'key-2';
      const provider = new LLMProvider();

      // Primera llamada: error de cuota
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Quota exceeded',
      });

      // Segunda llamada: éxito
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  profile: { basicIdentity: { fullName: 'Test' } },
                  systemPrompt: 'Test',
                }),
              }],
            },
          }],
        }),
      });

      // Act
      const result = await provider.generateProfile({ name: 'Test' });

      // Assert
      expect(result.profile).toBeDefined();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('debería usar fallback si todas las keys fallan en generateProfile', async () => {
      // Arrange: Error permanente
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => 'Quota exceeded',
      });

      // Act: No debería lanzar error, sino usar fallback
      const result = await provider.generateProfile({
        name: 'Test Character',
        personality: 'friendly',
      });

      // Assert: Fallback
      expect(result.profile).toBeDefined();
      expect(result.profile.basicIdentity?.fullName).toBe('Test Character');
    });
  });

  describe('API key rotation', () => {
    it('debería volver al inicio después de probar todas las keys', async () => {
      // Arrange: 2 keys, ambas fallan
      delete process.env.GOOGLE_AI_API_KEY; // Remove default key
      process.env.GOOGLE_AI_API_KEY_1 = 'key-1';
      process.env.GOOGLE_AI_API_KEY_2 = 'key-2';
      const provider = new LLMProvider();

      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => 'Quota exceeded',
      });

      // Act & Assert
      await expect(
        provider.generate({
          systemPrompt: 'Test',
          messages: [{ role: 'user', content: 'Test' }],
        })
      ).rejects.toThrow('han agotado su cuota');

      // Debería haber intentado con ambas keys
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
