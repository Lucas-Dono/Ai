import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/middleware/auth-helper';
import { AutoModService } from '@/lib/services/automod.service';
import { ReportService } from '@/lib/services/report.service';

/**
 * GET /api/community/communities/[id]/automod - Obtener reglas de AutoMod
 * Solo para moderadores y owners
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar permisos de moderación
    const canModerate = await ReportService.canModerate(
      session.user.id,
      params.id
    );

    if (!canModerate) {
      return NextResponse.json(
        { error: 'No tienes permisos de moderación en esta comunidad' },
        { status: 403 }
      );
    }

    // Obtener reglas y estadísticas
    const rules = await AutoModService.getRules(params.id);
    const stats = await AutoModService.getStats(params.id);

    return NextResponse.json({ rules, stats });
  } catch (error: any) {
    console.error('Error fetching automod rules:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener reglas' },
      { status: 400 }
    );
  }
}

/**
 * POST /api/community/communities/[id]/automod - Crear regla de AutoMod
 * Solo para owners y co-owners
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar que es owner o co-owner (solo ellos pueden crear reglas)
    const { prisma } = await import('@/lib/prisma');
    const community = await prisma.community.findUnique({
      where: { id: params.id },
      select: {
        ownerId: true,
        coOwnerIds: true,
      },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Comunidad no encontrada' },
        { status: 404 }
      );
    }

    const coOwnerIds = Array.isArray(community.coOwnerIds)
      ? community.coOwnerIds
      : [];

    const isOwnerOrCoOwner =
      community.ownerId === session.user.id ||
      coOwnerIds.includes(session.user.id);

    if (!isOwnerOrCoOwner) {
      return NextResponse.json(
        { error: 'Solo owners y co-owners pueden crear reglas de AutoMod' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, type, config, action, applyTo } = body;

    if (!name || !type || !config) {
      return NextResponse.json(
        { error: 'Nombre, tipo y configuración requeridos' },
        { status: 400 }
      );
    }

    // Validar tipo de regla
    const validTypes = [
      'banned_words',
      'spam_filter',
      'karma_minimum',
      'account_age',
      'link_filter',
      'caps_filter',
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de regla inválido' },
        { status: 400 }
      );
    }

    // Validar acción
    const validActions = ['remove', 'flag', 'auto_report', 'mute', 'ban'];
    if (action && !validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Acción inválida' },
        { status: 400 }
      );
    }

    const rule = await AutoModService.createRule({
      communityId: params.id,
      name,
      description,
      type,
      config,
      action,
      applyTo,
    });

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating automod rule:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear regla' },
      { status: 400 }
    );
  }
}
