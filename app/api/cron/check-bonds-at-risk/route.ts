import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logging/logger";
import { notifyBondAtRisk } from "@/lib/notifications/push";
import { PushNotificationServerService } from "@/lib/services/push-notification-server.service";
import {
  shouldSendNotificationNow,
  isBondMuted,
  shouldSendBasedOnFrequency,
} from "@/lib/notifications/smart-timing";

/**
 * GET /api/cron/check-bonds-at-risk
 * Cron job que verifica bonds en riesgo y envía notificaciones
 *
 * Query params:
 * - secret: Secret key para autenticar la llamada (debe coincidir con CRON_SECRET env var)
 *
 * Este endpoint debe ser llamado por un cron job externo (ej: cron-job.org, GitHub Actions, etc.)
 * Recomendado: ejecutar 1 vez al día
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación del cron
    const searchParams = request.nextUrl.searchParams;
    const secret = searchParams.get("secret");

    if (secret !== process.env.CRON_SECRET) {
      log.warn({ ip: request.ip }, "Unauthorized cron job attempt");
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    log.info("Starting bonds at risk check");

    // Obtener todos los bonds activos
    const bonds = await prisma.symbolicBond.findMany({
      where: {
        status: "active",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    log.info({ totalBonds: bonds.length }, "Checking bonds");

    // Calcular días desde última interacción
    const now = new Date();
    const bondsAtRisk = bonds
      .map((bond) => {
        const lastInteractionDate = bond.lastInteractionAt || bond.createdAt;
        const daysSinceInteraction = Math.floor(
          (now.getTime() - lastInteractionDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        let riskStatus: "warned" | "dormant" | "fragile" | null = null;

        if (daysSinceInteraction >= 90) {
          riskStatus = "fragile";
        } else if (daysSinceInteraction >= 60) {
          riskStatus = "dormant";
        } else if (daysSinceInteraction >= 30) {
          riskStatus = "warned";
        }

        return {
          bond,
          daysSinceInteraction,
          riskStatus,
        };
      })
      .filter((item) => item.riskStatus !== null);

    log.info(
      {
        bondsAtRisk: bondsAtRisk.length,
        warned: bondsAtRisk.filter((b) => b.riskStatus === "warned").length,
        dormant: bondsAtRisk.filter((b) => b.riskStatus === "dormant").length,
        fragile: bondsAtRisk.filter((b) => b.riskStatus === "fragile").length,
      },
      "Bonds at risk found"
    );

    // Enviar notificaciones
    const notificationResults = {
      sent: 0,
      failed: 0,
      skipped: 0,
    };

    for (const { bond, daysSinceInteraction, riskStatus } of bondsAtRisk) {
      if (!riskStatus) continue;

      try {
        // Verificar si el bond está silenciado
        const isMuted = await isBondMuted(bond.userId, bond.id);
        if (isMuted) {
          log.info(
            { bondId: bond.id, userId: bond.userId },
            "Bond is muted, skipping notification"
          );
          notificationResults.skipped++;
          continue;
        }

        // Verificar smart timing y preferencias
        const notificationTypeMap = {
          warned: "bond_warning" as const,
          dormant: "bond_dormant" as const,
          fragile: "bond_fragile" as const,
        };

        const timing = await shouldSendNotificationNow(
          bond.userId,
          notificationTypeMap[riskStatus]
        );

        if (!timing.shouldSendNow) {
          log.info(
            {
              bondId: bond.id,
              userId: bond.userId,
              riskStatus,
              reason: timing.reason,
              suggestedTime: timing.suggestedTime,
            },
            "Smart timing suggests waiting"
          );
          notificationResults.skipped++;
          continue;
        }

        // Verificar si ya se envió notificación recientemente para este bond y estado
        const recentNotification = await prisma.bondNotification.findFirst({
          where: {
            userId: bond.userId,
            bondId: bond.id,
            type: "bond_at_risk",
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // últimas 24 horas
            },
            message: {
              contains: riskStatus, // Contiene el estado actual
            },
          },
        });

        if (recentNotification) {
          log.info(
            {
              bondId: bond.id,
              userId: bond.userId,
              riskStatus,
            },
            "Notification already sent recently, skipping"
          );
          notificationResults.skipped++;
          continue;
        }

        // Intentar enviar push notification (web)
        try {
          await notifyBondAtRisk(
            bond.userId,
            bond.agent.name,
            riskStatus,
            daysSinceInteraction
          );
          log.info(
            { userId: bond.userId, agentName: bond.agent.name, riskStatus },
            "Web push notification sent"
          );
        } catch (error) {
          log.warn(
            { error, userId: bond.userId },
            "Failed to send web push notification"
          );
        }

        // Intentar enviar push notification (mobile)
        try {
          await PushNotificationServerService.sendBondAtRiskNotification(
            bond.userId,
            bond.agent.name,
            riskStatus,
            daysSinceInteraction
          );
          log.info(
            { userId: bond.userId, agentName: bond.agent.name, riskStatus },
            "Mobile push notification sent"
          );
        } catch (error) {
          log.warn(
            { error, userId: bond.userId },
            "Failed to send mobile push notification"
          );
        }

        // Crear notificación en base de datos
        await prisma.bondNotification.create({
          data: {
            userId: bond.userId,
            bondId: bond.id,
            type: "bond_at_risk",
            title: `Vínculo en estado: ${riskStatus}`,
            message: `Tu vínculo con ${bond.agent.name} necesita atención. ${daysSinceInteraction} días sin interactuar.`,
            metadata: {
              riskStatus,
              daysSinceInteraction,
              agentId: bond.agent.id,
              agentName: bond.agent.name,
            },
          },
        });

        notificationResults.sent++;
      } catch (error) {
        log.error(
          {
            error,
            bondId: bond.id,
            userId: bond.userId,
          },
          "Error sending bond at risk notification"
        );
        notificationResults.failed++;
      }
    }

    log.info(
      {
        totalChecked: bonds.length,
        bondsAtRisk: bondsAtRisk.length,
        notificationsSent: notificationResults.sent,
        notificationsFailed: notificationResults.failed,
        notificationsSkipped: notificationResults.skipped,
      },
      "Bonds at risk check completed"
    );

    return NextResponse.json({
      success: true,
      summary: {
        totalBonds: bonds.length,
        bondsAtRisk: bondsAtRisk.length,
        notifications: notificationResults,
        breakdown: {
          warned: bondsAtRisk.filter((b) => b.riskStatus === "warned").length,
          dormant: bondsAtRisk.filter((b) => b.riskStatus === "dormant").length,
          fragile: bondsAtRisk.filter((b) => b.riskStatus === "fragile").length,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log.error({ error }, "Error in check bonds at risk cron job");
    return NextResponse.json(
      { error: "Error al verificar bonds en riesgo" },
      { status: 500 }
    );
  }
}
