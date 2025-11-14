/**
 * Script de Migración: Local Storage → Cloud Storage (S3/R2)
 *
 * Este script migra todas las imágenes existentes en public/uploads/
 * hacia Cloudflare R2 o AWS S3.
 *
 * USO:
 *   npx tsx scripts/migrate-to-cloud-storage.ts
 *
 * REQUISITOS:
 *   1. Configurar variables de entorno (STORAGE_PROVIDER, S3_*, etc.)
 *   2. Hacer backup de la base de datos antes de ejecutar
 */

import { PrismaClient } from '@prisma/client';
import { readFile } from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

async function migrate() {
  console.log('🚀 Iniciando migración a cloud storage...\n');

  // Verificar configuración
  const provider = process.env.STORAGE_PROVIDER;
  if (provider !== 's3' && provider !== 'r2') {
    console.error('❌ ERROR: STORAGE_PROVIDER debe ser "s3" o "r2"');
    console.error('   Configura las variables de entorno en .env');
    process.exit(1);
  }

  console.log(`✅ Proveedor configurado: ${provider.toUpperCase()}\n`);

  // Importar el servicio dinámicamente (después de verificar env)
  const { storageService } = await import('@/lib/storage/cloud-storage');

  // 1. Obtener todos los agentes con avatares locales
  const agentsWithLocalAvatars = await prisma.agent.findMany({
    where: {
      OR: [
        { avatar: { startsWith: '/uploads/' } },
        { referenceImageUrl: { startsWith: '/uploads/' } },
      ],
    },
    select: {
      id: true,
      name: true,
      userId: true,
      avatar: true,
      referenceImageUrl: true,
    },
  });

  console.log(`📊 Encontrados ${agentsWithLocalAvatars.length} agentes con imágenes locales\n`);

  if (agentsWithLocalAvatars.length === 0) {
    console.log('✅ No hay imágenes para migrar. ¡Todo listo!');
    return;
  }

  // 2. Migrar cada imagen
  let successCount = 0;
  let errorCount = 0;

  for (const agent of agentsWithLocalAvatars) {
    console.log(`\n🔄 Migrando: ${agent.name} (${agent.id})`);

    try {
      let newAvatar: string | null = agent.avatar;
      let newReferenceImage: string | null = agent.referenceImageUrl;

      // Migrar avatar
      if (agent.avatar && agent.avatar.startsWith('/uploads/')) {
        const localPath = path.join(process.cwd(), 'public', agent.avatar);

        if (existsSync(localPath)) {
          console.log(`  📤 Subiendo avatar...`);
          const buffer = await readFile(localPath);
          const filename = path.basename(agent.avatar);

          newAvatar = await storageService.uploadImage(
            buffer,
            filename,
            agent.userId || 'system'
          );

          console.log(`  ✅ Avatar migrado: ${newAvatar}`);
        } else {
          console.log(`  ⚠️  Archivo no encontrado: ${localPath}`);
          newAvatar = null;
        }
      }

      // Migrar referenceImageUrl
      if (agent.referenceImageUrl && agent.referenceImageUrl.startsWith('/uploads/')) {
        const localPath = path.join(process.cwd(), 'public', agent.referenceImageUrl);

        if (existsSync(localPath)) {
          console.log(`  📤 Subiendo referenceImage...`);
          const buffer = await readFile(localPath);
          const filename = path.basename(agent.referenceImageUrl);

          newReferenceImage = await storageService.uploadImage(
            buffer,
            filename,
            agent.userId || 'system'
          );

          console.log(`  ✅ ReferenceImage migrada: ${newReferenceImage}`);
        } else {
          console.log(`  ⚠️  Archivo no encontrado: ${localPath}`);
          newReferenceImage = null;
        }
      }

      // Actualizar BD
      await prisma.agent.update({
        where: { id: agent.id },
        data: {
          avatar: newAvatar,
          referenceImageUrl: newReferenceImage,
        },
      });

      console.log(`  ✅ BD actualizada para ${agent.name}`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Error migrando ${agent.name}:`, error);
      errorCount++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`✅ Migración completada:`);
  console.log(`   - Éxitos: ${successCount}`);
  console.log(`   - Errores: ${errorCount}`);
  console.log(`   - Total: ${agentsWithLocalAvatars.length}`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (successCount > 0) {
    console.log('🎉 ¡Migración exitosa!');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('   1. Verificar que las imágenes se ven correctamente en la app');
    console.log('   2. Hacer backup de public/uploads/ por si acaso');
    console.log('   3. Después de verificar, puedes eliminar public/uploads/');
    console.log('      (Guarda el backup por al menos 1 mes)\n');
  }
}

migrate()
  .catch((error) => {
    console.error('❌ Error fatal durante la migración:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
