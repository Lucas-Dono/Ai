/**
 * API Admin - Gestión de Agentes
 * Lista y búsqueda de agentes (compañeros IA)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/admin/middleware';
import { logAuditAction, AuditAction, AuditTargetType } from '@/lib/admin/audit-logger';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin-secure/agents
 * Lista agentes con filtros y búsqueda
 */
export const GET = withAdminAuth(async (request, { admin }) => {
  try {
    const url = new URL(request.url);

    // Parámetros de paginación
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
    const offset = (page - 1) * limit;

    // Parámetros de filtrado
    const search = url.searchParams.get('search') || undefined;
    const nsfwMode = url.searchParams.get('nsfwMode');
    const visibility = url.searchParams.get('visibility') || undefined;
    const creatorId = url.searchParams.get('creatorId') || undefined;

    // Construir where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { id: { contains: search } }
      ];
    }

    if (nsfwMode === 'true') where.nsfwMode = true;
    if (nsfwMode === 'false') where.nsfwMode = false;
    if (visibility) where.visibility = visibility;
    if (creatorId) where.ownerId = creatorId;

    // Ejecutar queries en paralelo
    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          gender: true,
          personality: true,
          visibility: true,
          nsfwMode: true,
          nsfwLevel: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
              plan: true
            }
          },
          _count: {
            select: {
              messages: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.agent.count({ where })
    ]);

    // Log audit
    await logAuditAction(admin, {
      action: AuditAction.AGENT_VIEW,
      targetType: AuditTargetType.SYSTEM,
      details: {
        search,
        nsfwMode,
        visibility,
        page,
        limit,
        resultsCount: agents.length
      }
    });

    return NextResponse.json({
      agents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Error al obtener agentes' },
      { status: 500 }
    );
  }
});
