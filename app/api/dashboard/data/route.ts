import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/dashboard/data
 *
 * Endpoint optimizado que devuelve todos los datos del dashboard en una sola llamada:
 * - Todos los agentes (públicos y del usuario)
 * - Agentes recientes del usuario
 * - Estadísticas básicas
 *
 * Esto reduce de ~5-10 llamadas a solo 1 llamada inicial.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    const userId = session?.user?.id;

    // Query paralelas para máxima velocidad
    const [
      allAgents,
      recentAgents,
      userStats
    ] = await Promise.all([
      // 1. Todos los agentes (públicos + del usuario si está autenticado)
      prisma.agent.findMany({
        where: {
          OR: [
            { visibility: "public" },
            ...(userId ? [{ userId }] : [])
          ]
        },
        select: {
          id: true,
          name: true,
          kind: true,
          description: true,
          userId: true,
          featured: true,
          cloneCount: true,
          avatar: true,
          createdAt: true,
          rating: true,
          visibility: true,
          nsfwMode: true,
          nsfwLevel: true,
          generationTier: true,
          tags: true,
          categories: true,
          gender: true,
          _count: {
            select: {
              Review: true
            }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        // Limitar a cantidad razonable para evitar overhead
        take: 200
      }),

      // 2. Agentes recientes (solo si está autenticado)
      userId ? prisma.agent.findMany({
        where: {
          userId,
          Message: {
            some: {
              userId
            }
          }
        },
        select: {
          id: true,
          name: true,
          description: true,
          avatar: true,
          categories: true,
          generationTier: true,
          kind: true,
        },
        orderBy: {
          Message: {
            _count: 'desc'
          }
        },
        take: 10
      }) : Promise.resolve([]),

      // 3. Stats del usuario (opcional)
      userId ? prisma.user.findUnique({
        where: { id: userId },
        select: {
          plan: true,
          _count: {
            select: {
              Agent: true
            }
          }
        }
      }) : Promise.resolve(null)
    ]);

    return NextResponse.json({
      agents: allAgents,
      recentAgents: recentAgents || [],
      stats: userStats ? {
        plan: userStats.plan,
        totalAgents: userStats._count.Agent
      } : null,
      timestamp: new Date().toISOString(),
      // Cache hint para el cliente
      cacheHint: {
        maxAge: 300, // 5 minutos
        staleWhileRevalidate: 600 // 10 minutos
      }
    });

  } catch (error) {
    console.error("[API] Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Error al cargar datos del dashboard" },
      { status: 500 }
    );
  }
}
