/**
 * Script para monitorear el uso diario de emails
 *
 * Ejecutar manualmente:
 * npx tsx scripts/monitor-email-usage.ts
 *
 * O configurar como cron job:
 * 0 22 * * * cd /path/to/app && npm run monitor:emails >> /var/log/email-usage.log
 */

import { emailLogger as log } from "@/lib/logging/loggers";

interface EmailUsageStats {
  date: string;
  emailsSent: number;
  limit: number;
  usagePercent: number;
  provider: string;
  shouldScaleUp: boolean;
}

async function getEmailUsageFromLogs(): Promise<number> {
  // En producción, esto debería consultar tus logs
  // Por ahora, retornamos un valor de ejemplo

  // Opción 1: Leer de archivo de logs
  // const logs = await fs.readFile('/var/log/app.log', 'utf-8');
  // const emailCount = (logs.match(/Email sent successfully/g) || []).length;

  // Opción 2: Consultar base de datos de logs si usas una
  // const emailCount = await prisma.log.count({
  //   where: {
  //     level: 'info',
  //     message: { contains: 'Email sent successfully' },
  //     timestamp: { gte: startOfToday },
  //   },
  // });

  // Por ahora retornamos 0 para testing
  return 0;
}

async function monitorEmailUsage(): Promise<EmailUsageStats> {
  const provider = process.env.EMAIL_PROVIDER || "smtp";
  const limit = provider === "api" ? 24000 : 2400;

  log.info({ provider, limit }, "Starting email usage monitoring");

  // Obtener emails enviados hoy
  const emailsSent = await getEmailUsageFromLogs();

  // Calcular porcentaje de uso
  const usagePercent = (emailsSent / limit) * 100;

  // Determinar si se debe escalar
  const shouldScaleUp = provider === "smtp" && usagePercent > 80;

  const stats: EmailUsageStats = {
    date: new Date().toISOString().split("T")[0],
    emailsSent,
    limit,
    usagePercent: parseFloat(usagePercent.toFixed(2)),
    provider,
    shouldScaleUp,
  };

  // Log results
  log.info(stats, "Email usage statistics");

  // Console output para cron logs
  console.log("\n" + "=".repeat(60));
  console.log("📧 EMAIL USAGE REPORT");
  console.log("=".repeat(60));
  console.log(`📅 Date: ${stats.date}`);
  console.log(`📨 Provider: ${stats.provider.toUpperCase()}`);
  console.log(`📊 Emails sent: ${stats.emailsSent}/${stats.limit}`);
  console.log(`📈 Usage: ${stats.usagePercent}%`);
  console.log("=".repeat(60));

  // Alertas
  if (shouldScaleUp) {
    console.log("\n⚠️  ALERTA: USO SUPERIOR AL 80%");
    console.log("🔄 ACCIÓN RECOMENDADA: Migrar a API (EnvíaloSimple Transaccional)");
    console.log("\n📝 Pasos para migrar:");
    console.log("1. Contratar EnvíaloSimple Transaccional en DonWeb");
    console.log("2. Generar API Key en el panel");
    console.log("3. Cambiar EMAIL_PROVIDER=\"api\" en .env");
    console.log("4. Agregar ENVIALOSIMPLE_API_KEY en .env");
    console.log("5. Reiniciar la aplicación");
    console.log("\n💰 Costo adicional: $19 USD/mes (~$23,000 ARS)");
    console.log("✨ Beneficio: 10x más límite (24,000 emails/día)\n");

    // Enviar alerta por email al admin (opcional)
    // await sendAdminAlert(stats);
  } else if (usagePercent > 60) {
    console.log("\n📊 INFO: Uso moderado (>60%)");
    console.log("👀 Seguir monitoreando. Considerar escalamiento si sigue creciendo.");
  } else {
    console.log("\n✅ Uso normal. Todo funcionando correctamente.");
  }

  console.log("\n");

  return stats;
}

// Ejecutar monitoreo
if (require.main === module) {
  monitorEmailUsage()
    .then((stats) => {
      process.exit(0);
    })
    .catch((error) => {
      log.error({ err: error }, "Error monitoring email usage");
      console.error("❌ Error:", error.message);
      process.exit(1);
    });
}

export { monitorEmailUsage };
