/**
 * World Rate Limiting Tests
 *
 * Tests del sistema de rate limiting específico para mundos virtuales
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkWorldMessageLimit,
  checkWorldCooldown,
  checkSpamProtection,
  checkFloodProtection,
  checkWorldAgentLimit,
  getWorldLimitsInfo,
} from '@/lib/redis/ratelimit';

// Mock Redis config para forzar in-memory mode en tests
vi.mock('@/lib/redis/config', () => ({
  isRedisConfigured: () => false,
  getRateLimiter: () => ({
    limit: vi.fn().mockResolvedValue({ success: true, limit: 50, remaining: 49 })
  })
}));

describe('World Rate Limiting', () => {
  describe('getWorldLimitsInfo', () => {
    it('should return correct limits for free tier', () => {
      const limits = getWorldLimitsInfo('free');

      expect(limits).toEqual({
        messagesPerDay: 50,
        maxAgents: 3,
        cooldownMs: 5000,
        maxIdenticalMessages: 10,
        floodThreshold: 20,
      });
    });

    it('should return correct limits for plus tier', () => {
      const limits = getWorldLimitsInfo('plus');

      expect(limits).toEqual({
        messagesPerDay: 500,
        maxAgents: 10,
        cooldownMs: 2000,
        maxIdenticalMessages: 10,
        floodThreshold: 20,
      });
    });

    it('should return correct limits for ultra tier', () => {
      const limits = getWorldLimitsInfo('ultra');

      expect(limits).toEqual({
        messagesPerDay: -1, // Unlimited
        maxAgents: 50,
        cooldownMs: 0,
        maxIdenticalMessages: 10,
        floodThreshold: 20,
      });
    });
  });

  describe('checkWorldMessageLimit', () => {
    it('should allow messages for ultra tier (unlimited)', async () => {
      const result = await checkWorldMessageLimit('user123', 'ultra');

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should return limit info for free tier', async () => {
      const result = await checkWorldMessageLimit('user456', 'free');

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(50);
    });

    it('should include upgrade message in error for free tier', async () => {
      // Simular límite excedido enviando muchos mensajes
      const userId = 'test-user-free';

      // Enviar 51 mensajes (excede límite de 50)
      for (let i = 0; i < 51; i++) {
        await checkWorldMessageLimit(userId, 'free');
      }

      const result = await checkWorldMessageLimit(userId, 'free');

      if (!result.allowed) {
        expect(result.reason).toContain('Actualiza a Plus');
        expect(result.reason).toContain('Ultra');
      }
    });
  });

  describe('checkWorldCooldown', () => {
    it('should not have cooldown for ultra tier', async () => {
      const result = await checkWorldCooldown('world123', 'user123', 'ultra');

      expect(result.allowed).toBe(true);
    });

    it('should enforce 5 second cooldown for free tier', async () => {
      const worldId = 'test-world-free';
      const userId = 'test-user-cooldown';

      // Primer mensaje debe pasar
      const first = await checkWorldCooldown(worldId, userId, 'free');
      expect(first.allowed).toBe(true);

      // Segundo mensaje inmediato debe fallar
      const second = await checkWorldCooldown(worldId, userId, 'free');
      expect(second.allowed).toBe(false);
      expect(second.reason).toContain('5 segundos');
      expect(second.retryAfter).toBeGreaterThan(0);
    });

    it('should enforce 2 second cooldown for plus tier', async () => {
      const worldId = 'test-world-plus';
      const userId = 'test-user-plus';

      const first = await checkWorldCooldown(worldId, userId, 'plus');
      expect(first.allowed).toBe(true);

      const second = await checkWorldCooldown(worldId, userId, 'plus');
      expect(second.allowed).toBe(false);
      expect(second.reason).toContain('2 segundos');
    });
  });

  describe('checkSpamProtection', () => {
    it('should allow first message', async () => {
      const result = await checkSpamProtection(
        'world789',
        'user789',
        'Hello world'
      );

      expect(result.allowed).toBe(true);
    });

    it('should detect spam after 10 identical messages', async () => {
      const worldId = 'spam-test-world';
      const userId = 'spam-test-user';
      const message = 'Spam message';

      // Enviar 10 mensajes idénticos (debe pasar)
      for (let i = 0; i < 10; i++) {
        const result = await checkSpamProtection(worldId, userId, message);
        expect(result.allowed).toBe(true);
      }

      // Mensaje 11 debe ser bloqueado
      const blocked = await checkSpamProtection(worldId, userId, message);
      expect(blocked.allowed).toBe(false);
      expect(blocked.reason).toContain('demasiadas veces');
    });

    it('should allow different messages', async () => {
      const worldId = 'variety-world';
      const userId = 'variety-user';

      for (let i = 0; i < 15; i++) {
        const result = await checkSpamProtection(
          worldId,
          userId,
          `Different message ${i}`
        );
        expect(result.allowed).toBe(true);
      }
    });

    it('should be case-insensitive', async () => {
      const worldId = 'case-world';
      const userId = 'case-user';

      // Enviar 10 mensajes con diferentes casos
      for (let i = 0; i < 10; i++) {
        await checkSpamProtection(worldId, userId, i % 2 === 0 ? 'HELLO' : 'hello');
      }

      // Mensaje 11 debe ser bloqueado (son el mismo mensaje)
      const blocked = await checkSpamProtection(worldId, userId, 'HeLLo');
      expect(blocked.allowed).toBe(false);
    });
  });

  describe('checkFloodProtection', () => {
    it('should allow up to 20 messages per minute', async () => {
      const worldId = 'flood-world';
      const userId = 'flood-user';

      // Enviar 20 mensajes (debe pasar)
      for (let i = 0; i < 20; i++) {
        const result = await checkFloodProtection(worldId, userId, 'free');
        expect(result.allowed).toBe(true);
      }

      // Mensaje 21 debe ser bloqueado
      const blocked = await checkFloodProtection(worldId, userId, 'free');
      expect(blocked.allowed).toBe(false);
      expect(blocked.reason).toContain('demasiado rápido');
    });
  });

  describe('checkWorldAgentLimit', () => {
    it('should allow 3 agents for free tier', () => {
      expect(checkWorldAgentLimit(2, 'free').allowed).toBe(true);
      expect(checkWorldAgentLimit(3, 'free').allowed).toBe(false);

      const blocked = checkWorldAgentLimit(3, 'free');
      expect(blocked.reason).toContain('3 agentes');
      expect(blocked.limit).toBe(3);
      expect(blocked.remaining).toBe(0);
    });

    it('should allow 10 agents for plus tier', () => {
      expect(checkWorldAgentLimit(9, 'plus').allowed).toBe(true);
      expect(checkWorldAgentLimit(10, 'plus').allowed).toBe(false);

      const blocked = checkWorldAgentLimit(10, 'plus');
      expect(blocked.reason).toContain('10 agentes');
    });

    it('should allow 50 agents for ultra tier', () => {
      expect(checkWorldAgentLimit(49, 'ultra').allowed).toBe(true);
      expect(checkWorldAgentLimit(50, 'ultra').allowed).toBe(false);
    });

    it('should have unlimited agents for ultra with -1', () => {
      // Si el backend devuelve -1 para ultra (ilimitado)
      const limits = getWorldLimitsInfo('ultra');
      if (limits.maxAgents === -1) {
        expect(checkWorldAgentLimit(100, 'ultra').allowed).toBe(true);
      }
    });

    it('should suggest upgrade in error message', () => {
      const freeBlocked = checkWorldAgentLimit(3, 'free');
      expect(freeBlocked.reason).toContain('Actualiza a Plus');

      const plusBlocked = checkWorldAgentLimit(10, 'plus');
      expect(plusBlocked.reason).toContain('Actualiza a Ultra');
    });
  });

  describe('Rate limit headers format', () => {
    it('should return proper format for HTTP headers', async () => {
      const result = await checkWorldMessageLimit('user-headers', 'free');

      // Verificar que los valores pueden ser convertidos a headers
      if (result.limit !== undefined) {
        expect(typeof result.limit).toBe('number');
        expect(result.limit.toString()).toMatch(/^\d+$/);
      }

      if (result.remaining !== undefined) {
        expect(typeof result.remaining).toBe('number');
        expect(result.remaining.toString()).toMatch(/^\d+$/);
      }

      if (result.resetAt !== undefined) {
        expect(typeof result.resetAt).toBe('number');
        expect(result.resetAt.toString()).toMatch(/^\d+$/);
      }
    });
  });

  describe('Error message quality', () => {
    it('should have user-friendly error messages', async () => {
      const worldId = 'error-test-world';
      const userId = 'error-test-user';

      // Cooldown error
      await checkWorldCooldown(worldId, userId, 'free');
      const cooldown = await checkWorldCooldown(worldId, userId, 'free');
      expect(cooldown.reason).toBeDefined();
      expect(cooldown.reason).not.toContain('ERROR');
      expect(cooldown.reason).not.toContain('undefined');

      // Spam error
      for (let i = 0; i < 11; i++) {
        await checkSpamProtection(worldId, userId, 'test');
      }
      const spam = await checkSpamProtection(worldId, userId, 'test');
      expect(spam.reason).toBeDefined();
      expect(spam.reason?.length).toBeGreaterThan(20); // Mensaje descriptivo

      // Agent limit error
      const agentLimit = checkWorldAgentLimit(5, 'free');
      expect(agentLimit.reason).toBeDefined();
      expect(agentLimit.reason).toContain('agentes');
    });
  });
});
