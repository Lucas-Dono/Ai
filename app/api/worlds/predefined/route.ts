/**
 * Predefined Worlds API
 * GET /api/worlds/predefined - Lista todos los mundos predefinidos disponibles
 *
 * OPTIMIZACIÓN: Agregado caché Redis con TTL de 1 hora
 * Impacto estimado: Reduce carga en DB de ~200-400ms a ~5-10ms (hit de caché)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';
import { Redis } from '@upstash/redis';

const log = createLogger('API/Worlds/Predefined');

// Initialize Redis client (using Upstash for serverless compatibility)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const CACHE_TTL = 3600; // 1 hora en segundos
const CACHE_KEY_PREFIX = 'predefined_worlds';

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get('category');
    const difficulty = req.nextUrl.searchParams.get('difficulty');
    const featured = req.nextUrl.searchParams.get('featured');

    log.info({ category, difficulty, featured }, 'Listing predefined worlds');

    // Construir cache key basado en filtros
    const cacheKey = `${CACHE_KEY_PREFIX}:${category || 'all'}:${difficulty || 'all'}:${featured || 'all'}`;

    // Try to get from cache first
    if (redis) {
      const perfStart = Date.now();
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const perfEnd = Date.now();
          log.info({ duration: perfEnd - perfStart, cacheKey }, '[CACHE HIT] Serving from Redis');
          return NextResponse.json(cached);
        }
        log.info('[CACHE MISS] Fetching from database');
      } catch (redisError) {
        log.warn({ error: redisError }, 'Redis error, falling back to database');
      }
    }

    // Construir filtros
    const where: any = { isPredefined: true };
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (featured === 'true') where.featured = true;

    const dbPerfStart = Date.now();
    const worlds = await prisma.world.findMany({
      where,
      include: {
        worldAgents: {
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                description: true,
                avatar: true,
                kind: true,
                gender: true,
              },
            },
          },
        },
        simulationState: true,
        _count: {
          select: {
            messages: true,
            interactions: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    const dbPerfEnd = Date.now();
    log.info({ duration: dbPerfEnd - dbPerfStart }, '[PERF] Database query completed');

    const response = {
      worlds: worlds.map(world => ({
        id: world.id,
        name: world.name,
        description: world.description,
        scenario: world.scenario,
        category: world.category,
        difficulty: world.difficulty,
        featured: world.featured,
        isPredefined: world.isPredefined,
        agentCount: world.worldAgents.length,
        agents: world.worldAgents.map(wa => ({
          id: wa.agent.id,
          name: wa.agent.name,
          description: wa.agent.description,
          avatar: wa.agent.avatar,
          kind: wa.agent.kind,
          gender: wa.agent.gender,
          role: wa.role,
        })),
        messageCount: world._count.messages,
        interactionCount: world._count.interactions,
        createdAt: world.createdAt,
      })),
      categories: await getCategories(),
      difficulties: ['beginner', 'intermediate', 'advanced'],
    };

    // Store in cache for next request
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(response), { ex: CACHE_TTL });
        log.info({ cacheKey, ttl: CACHE_TTL }, '[CACHE SET] Stored in Redis');
      } catch (redisError) {
        log.warn({ error: redisError }, 'Failed to cache in Redis');
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    log.error({ error }, 'Error listing predefined worlds');
    return NextResponse.json(
      { error: 'Failed to list predefined worlds' },
      { status: 500 }
    );
  }
}

async function getCategories() {
  const result = await prisma.world.findMany({
    where: { isPredefined: true },
    select: { category: true },
    distinct: ['category'],
  });

  return result
    .map(r => r.category)
    .filter(Boolean) as string[];
}
