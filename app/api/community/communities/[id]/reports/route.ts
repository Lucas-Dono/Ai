import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/middleware/auth-helper';
import { ReportService } from '@/lib/services/report.service';

/**
 * GET /api/community/communities/[id]/reports - Ver queue de reportes
 * Solo para moderadores y owners de la comunidad
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

    // Obtener parámetros de query
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'pending';
    const type = (searchParams.get('type') || 'all') as 'post' | 'comment' | 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    // Obtener reportes
    const reports = await ReportService.getReportQueue(params.id, {
      status,
      type,
      page,
      limit,
    });

    // Obtener estadísticas
    const stats = await ReportService.getReportStats(params.id);

    return NextResponse.json({
      reports,
      stats,
      pagination: {
        page,
        limit,
        hasMore: reports.length === limit,
      },
    });
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener reportes' },
      { status: 400 }
    );
  }
}
