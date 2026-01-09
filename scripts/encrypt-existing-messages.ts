/**
 * SCRIPT DE MIGRACIÓN: Encriptar Mensajes Existentes
 *
 * Este script encripta todos los mensajes que actualmente están en texto plano
 * en la base de datos.
 *
 * IMPORTANTE:
 * - Crear un backup ANTES de ejecutar
 * - Verificar que MESSAGE_ENCRYPTION_KEY está en .env
 * - Ejecutar en horas de poco tráfico
 * - El proceso es reversible (los mensajes se pueden desencriptar)
 *
 * USO:
 *   npm run encrypt-messages
 *   # O directamente:
 *   npx tsx scripts/encrypt-existing-messages.ts
 *
 * OPCIONES:
 *   --dry-run       Solo mostrar cuántos mensajes se encriptarían (sin modificar)
 *   --batch-size=N  Procesar N mensajes a la vez (default: 100)
 *   --limit=N       Procesar solo los primeros N mensajes (para testing)
 */

import { prisma } from '../lib/prisma';
import { encryptMessage } from '../lib/encryption/message-encryption';

// Configuración
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '100');
const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT = process.argv.find(arg => arg.startsWith('--limit='))
  ?.split('=')[1];

interface EncryptionStats {
  total: number;
  encrypted: number;
  failed: number;
  skipped: number;
  startTime: Date;
  endTime?: Date;
}

/**
 * Encriptar mensajes en lotes
 */
async function encryptMessages() {
  console.log('🔐 Iniciando encriptación de mensajes...\n');

  // Verificar que la clave de encriptación está configurada
  if (!process.env.MESSAGE_ENCRYPTION_KEY) {
    console.error('❌ ERROR: MESSAGE_ENCRYPTION_KEY no está configurada en .env');
    console.error('   Genera una clave con:');
    console.error('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('🧪 MODO DRY-RUN: No se modificará la base de datos\n');
  }

  const stats: EncryptionStats = {
    total: 0,
    encrypted: 0,
    failed: 0,
    skipped: 0,
    startTime: new Date(),
  };

  try {
    // 1. Contar mensajes sin encriptar
    const totalUnencrypted = await prisma.message.count({
      where: {
        OR: [
          { iv: null },
          { authTag: null },
        ],
      },
    });

    console.log(`📊 Total de mensajes sin encriptar: ${totalUnencrypted}`);

    if (totalUnencrypted === 0) {
      console.log('✅ Todos los mensajes ya están encriptados. Nada que hacer.');
      return stats;
    }

    if (DRY_RUN) {
      console.log(`\n🧪 DRY-RUN: Se encriptarían ${totalUnencrypted} mensajes`);
      return stats;
    }

    stats.total = totalUnencrypted;

    // 2. Procesar en lotes
    let processedCount = 0;
    const limitNumber = LIMIT ? parseInt(LIMIT) : Infinity;

    while (processedCount < Math.min(totalUnencrypted, limitNumber)) {
      // Obtener lote de mensajes sin encriptar
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { iv: null },
            { authTag: null },
          ],
        },
        take: BATCH_SIZE,
        select: {
          id: true,
          content: true,
          iv: true,
          authTag: true,
        },
      });

      if (messages.length === 0) break;

      console.log(`\n📦 Procesando lote ${Math.floor(processedCount / BATCH_SIZE) + 1} (${messages.length} mensajes)...`);

      // Encriptar cada mensaje del lote
      for (const message of messages) {
        try {
          // Si ya tiene iv y authTag, skip (ya está encriptado)
          if (message.iv && message.authTag) {
            stats.skipped++;
            continue;
          }

          // Encriptar el contenido
          const { encrypted, iv, authTag } = encryptMessage(message.content);

          // Actualizar en la base de datos
          await prisma.message.update({
            where: { id: message.id },
            data: {
              content: encrypted,
              iv,
              authTag,
            },
          });

          stats.encrypted++;
          processedCount++;

          // Progress bar
          if (stats.encrypted % 10 === 0) {
            const progress = ((processedCount / Math.min(totalUnencrypted, limitNumber)) * 100).toFixed(1);
            process.stdout.write(`   Progreso: ${stats.encrypted}/${Math.min(totalUnencrypted, limitNumber)} (${progress}%)\r`);
          }

        } catch (error) {
          console.error(`\n❌ Error encriptando mensaje ${message.id}:`, error);
          stats.failed++;
        }
      }

      console.log(`   ✅ Lote completado: ${stats.encrypted} encriptados, ${stats.failed} fallidos`);
    }

    stats.endTime = new Date();

    // 3. Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ENCRIPTACIÓN COMPLETADA');
    console.log('='.repeat(60));
    console.log(`📊 Estadísticas:`);
    console.log(`   Total procesados:  ${stats.encrypted + stats.failed + stats.skipped}`);
    console.log(`   ✅ Encriptados:    ${stats.encrypted}`);
    console.log(`   ⏭️  Saltados:       ${stats.skipped} (ya estaban encriptados)`);
    console.log(`   ❌ Fallidos:       ${stats.failed}`);
    console.log(`   ⏱️  Duración:       ${((stats.endTime.getTime() - stats.startTime.getTime()) / 1000).toFixed(2)}s`);

    // 4. Verificar que todos los mensajes están encriptados
    const remainingUnencrypted = await prisma.message.count({
      where: {
        OR: [
          { iv: null },
          { authTag: null },
        ],
      },
    });

    if (remainingUnencrypted > 0) {
      console.log(`\n⚠️  ADVERTENCIA: Todavía hay ${remainingUnencrypted} mensajes sin encriptar`);
      console.log('   Ejecuta el script nuevamente para encriptarlos');
    } else {
      console.log('\n✅ ÉXITO: Todos los mensajes están ahora encriptados');
    }

  } catch (error) {
    console.error('\n❌ ERROR FATAL durante la encriptación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }

  return stats;
}

/**
 * Verificar que la encriptación funciona correctamente
 */
async function verifyEncryption() {
  console.log('\n🔍 Verificando encriptación...');

  try {
    // Obtener un mensaje encriptado al azar
    const encryptedMessage = await prisma.message.findFirst({
      where: {
        AND: [
          { iv: { not: null } },
          { authTag: { not: null } },
        ],
      },
    });

    if (!encryptedMessage) {
      console.log('⚠️  No hay mensajes encriptados para verificar');
      return;
    }

    // Intentar desencriptar
    const { decryptMessage } = await import('../lib/encryption/message-encryption');

    const decrypted = decryptMessage(
      encryptedMessage.content,
      encryptedMessage.iv!,
      encryptedMessage.authTag!
    );

    console.log('✅ Verificación exitosa: Los mensajes se pueden desencriptar correctamente');
    console.log(`   Mensaje de prueba ID: ${encryptedMessage.id}`);
    console.log(`   Longitud del contenido desencriptado: ${decrypted.length} caracteres`);

  } catch (error) {
    console.error('❌ ERROR: La verificación falló. Los mensajes NO se pueden desencriptar');
    console.error(error);
    throw error;
  }
}

/**
 * Main
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   MIGRACIÓN: ENCRIPTACIÓN DE MENSAJES                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Advertencia de seguridad
  if (!DRY_RUN) {
    console.log('⚠️  ADVERTENCIA: Este script modificará la base de datos');
    console.log('   Asegúrate de tener un backup antes de continuar\n');
    console.log('   Presiona Ctrl+C para cancelar, o espera 5 segundos...\n');

    // Esperar 5 segundos antes de continuar
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Ejecutar encriptación
  const stats = await encryptMessages();

  // Verificar que funciona
  if (!DRY_RUN && stats.encrypted > 0) {
    await verifyEncryption();
  }

  console.log('\n✅ Script completado\n');
}

// Ejecutar
main().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
