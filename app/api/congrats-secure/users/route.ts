/**
 * API Admin - Gestión de Usuarios
 * Lista y búsqueda de usuarios
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/admin/middleware';
import { logAuditAction, AuditAction, AuditTargetType } from '@/lib/admin/audit-logger';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin-secure/users
 * Lista usuarios con filtros y búsqueda
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
    const plan = url.searchParams.get('plan') || undefined;
    const verified = url.searchParams.get('verified');
    const adult = url.searchParams.get('adult');

    // Construir where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { id: { contains: search } }
      ];
    }

    if (plan) where.plan = plan;
    if (verified === 'true') where.emailVerified = true;
    if (verified === 'false') where.emailVerified = false;
    if (adult === 'true') where.isAdult = true;
    if (adult === 'false') where.isAdult = false;

    // Ejecutar queries en paralelo
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          plan: true,
          emailVerified: true,
          isAdult: true,
          ageVerified: true,
          nsfwConsent: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              Agent: true,
              CommunityPost: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.user.count({ where })
    ]);

    // Log audit
    await logAuditAction(admin, {
      action: AuditAction.USER_VIEW,
      targetType: AuditTargetType.SYSTEM,
      details: {
        search,
        plan,
        page,
        limit,
        resultsCount: users.length
      }
    });

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
});
