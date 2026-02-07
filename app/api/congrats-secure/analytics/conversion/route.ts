/**
 * API Admin - Analytics Conversion & Monetization
 * KPIs de conversión free→paid y monetización
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/admin/middleware';
import { calculateMonetizationKPIs, getTimeRange } from '@/lib/analytics/kpi-calculator';
import { logAuditAction, AuditAction, AuditTargetType } from '@/lib/admin/audit-logger';

/**
 * GET /api/congrats-secure/analytics/conversion
 * Obtiene KPIs de conversión y monetización
 */
export const GET = withAdminAuth(async (request, { admin }) => {
  try {
    // Obtener parámetros de tiempo (30 días por defecto)
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30', 10);

    // Validar días (máx 90)
    if (days < 1 || days > 90) {
      return NextResponse.json(
        { error: 'Parámetro days debe estar entre 1 y 90' },
        { status: 400 }
      );
    }

    // Calcular time range
    const timeRange = getTimeRange(days);

    // Calcular KPIs de monetización
    const monetizationData = await calculateMonetizationKPIs(timeRange);

    // Log audit
    await logAuditAction(admin, {
      action: AuditAction.ANALYTICS_VIEW,
      targetType: AuditTargetType.SYSTEM,
      details: { endpoint: 'analytics/conversion', days }
    });

    return NextResponse.json({
      timeRange: {
        start: timeRange.start,
        end: timeRange.end,
        days: timeRange.days
      },
      data: monetizationData
    });

  } catch (error) {
    console.error('Error fetching conversion analytics:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de conversión' },
      { status: 500 }
    );
  }
});
