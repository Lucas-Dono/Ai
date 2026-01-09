/**
 * Security System Setup Script
 *
 * Script para inicializar el sistema de seguridad:
 * - Crear canary tokens por defecto
 * - Verificar configuración
 * - Test de componentes
 */

import { PrismaClient } from '@prisma/client';
import { setupDefaultCanaryTokens } from '../lib/security/canary-tokens';

const prisma = new PrismaClient();

async function main() {
  console.log('🛡️  Security System Setup\n');
  console.log('=' .repeat(50));

  try {
    // 1. Verificar conexión a base de datos
    console.log('\n1. Verificando conexión a base de datos...');
    await prisma.$connect();
    console.log('   ✓ Conexión exitosa');

    // 2. Verificar que las tablas existen
    console.log('\n2. Verificando tablas de seguridad...');
    const tables = [
      'ClientFingerprint',
      'ThreatDetection',
      'HoneypotHit',
      'CanaryToken',
      'ThreatAlert',
      'AttackPattern',
    ];

    for (const table of tables) {
      try {
        // @ts-ignore
        await prisma[table.charAt(0).toLowerCase() + table.slice(1)].count();
        console.log(`   ✓ ${table}`);
      } catch (error) {
        console.error(`   ✗ ${table} - NO EXISTE`);
        console.error('   → Ejecuta: npx prisma migrate dev');
        throw error;
      }
    }

    // 3. Configurar canary tokens por defecto
    console.log('\n3. Configurando canary tokens...');
    await setupDefaultCanaryTokens();
    console.log('   ✓ Canary tokens creados');

    // 4. Verificar variables de entorno
    console.log('\n4. Verificando configuración...');
    const envVars = [
      { key: 'SECURITY_EMAIL', required: true },
      { key: 'SLACK_WEBHOOK_URL', required: false },
      { key: 'DATABASE_URL', required: true },
    ];

    for (const envVar of envVars) {
      if (process.env[envVar.key]) {
        console.log(`   ✓ ${envVar.key}: ${process.env[envVar.key]?.substring(0, 20)}...`);
      } else if (envVar.required) {
        console.log(`   ⚠ ${envVar.key}: NO CONFIGURADA (requerida)`);
      } else {
        console.log(`   ⚠ ${envVar.key}: NO CONFIGURADA (opcional)`);
      }
    }

    // 5. Estadísticas iniciales
    console.log('\n5. Estadísticas iniciales:');
    const stats = {
      fingerprints: await prisma.clientFingerprint.count(),
      threats: await prisma.threatDetection.count(),
      honeypotHits: await prisma.honeypotHit.count(),
      canaryTokens: await prisma.canaryToken.count(),
      alerts: await prisma.threatAlert.count(),
    };

    console.log(`   - Fingerprints: ${stats.fingerprints}`);
    console.log(`   - Threats: ${stats.threats}`);
    console.log(`   - Honeypot Hits: ${stats.honeypotHits}`);
    console.log(`   - Canary Tokens: ${stats.canaryTokens}`);
    console.log(`   - Alerts: ${stats.alerts}`);

    // 6. Resumen
    console.log('\n' + '='.repeat(50));
    console.log('✅ Security System Setup Complete!\n');
    console.log('Next steps:');
    console.log('  1. Configure SECURITY_EMAIL in .env');
    console.log('  2. Configure SLACK_WEBHOOK_URL in .env (optional)');
    console.log('  3. Visit /security/dashboard to view the dashboard');
    console.log('  4. Test the honeypots: curl http://localhost:3000/admin');
    console.log('  5. Review SECURITY_SYSTEM_DOCS.md for full documentation\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
