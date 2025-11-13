import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/middleware/auth-helper';
import { ReportService } from '@/lib/services/report.service';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/community/reports/[id]/resolve - Resolver un reporte
 * Solo para moderadores y owners
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

    const body = await request.json();
    const { action, type, resolution } = body;

    if (!action || !type) {
      return NextResponse.json(
        { error: 'Acción y tipo requeridos' },
        { status: 400 }
      );
    }

    // Validar acciones permitidas
    const validActions = ['dismiss', 'remove', 'warn', 'ban'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Acción inválida' },
        { status: 400 }
      );
    }

    // Obtener reporte y verificar permisos
    let communityId: string | null = null;

    if (type === 'post') {
      const report = await prisma.postReport.findUnique({
        where: { id: params.id },
        include: {
          post: {
            select: { communityId: true },
          },
        },
      });

      if (!report) {
        return NextResponse.json(
          { error: 'Reporte no encontrado' },
          { status: 404 }
        );
      }

      communityId = report.post.communityId;
    } else if (type === 'comment') {
      const report = await prisma.commentReport.findUnique({
        where: { id: params.id },
        include: {
          comment: {
            select: {
              post: {
                select: { communityId: true },
              },
            },
          },
        },
      });

      if (!report) {
        return NextResponse.json(
          { error: 'Reporte no encontrado' },
          { status: 404 }
        );
      }

      communityId = report.comment.post.communityId;
    } else {
      return NextResponse.json(
        { error: 'Tipo inválido' },
        { status: 400 }
      );
    }

    if (!communityId) {
      return NextResponse.json(
        { error: 'Comunidad no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos de moderación
    const canModerate = await ReportService.canModerate(
      session.user.id,
      communityId
    );

    if (!canModerate) {
      return NextResponse.json(
        { error: 'No tienes permisos de moderación en esta comunidad' },
        { status: 403 }
      );
    }

    // Resolver reporte
    let result;
    if (type === 'post') {
      result = await ReportService.resolvePostReport({
        reportId: params.id,
        reviewerId: session.user.id,
        action,
        resolution,
      });
    } else {
      result = await ReportService.resolveCommentReport({
        reportId: params.id,
        reviewerId: session.user.id,
        action,
        resolution,
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error resolving report:', error);
    return NextResponse.json(
      { error: error.message || 'Error al resolver reporte' },
      { status: 400 }
    );
  }
}
