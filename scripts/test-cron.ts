/**
 * Script de Testing para Cron Jobs de Analytics
 *
 * Ejecuta manualmente los endpoints de cron para testing local
 * sin necesidad de esperar a los schedules configurados.
 *
 * Usage:
 *   npx tsx scripts/test-cron.ts [job-name]
 *
 * Examples:
 *   npx tsx scripts/test-cron.ts daily-kpis    # Test daily KPI aggregation
 *   npx tsx scripts/test-cron.ts user-summaries # Test user summaries update
 *   npx tsx scripts/test-cron.ts all           # Test all analytics cron jobs
 */

import 'dotenv/config';

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret';

if (!process.env.CRON_SECRET) {
  console.warn('⚠️  Warning: CRON_SECRET not configured in .env, using dev-secret');
  console.log('\nFor production:');
  console.log('1. Generate a secret: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  console.log('2. Add to .env: CRON_SECRET=your_generated_secret\n');
}

// ============================================================================
// CRON JOB DEFINITIONS
// ============================================================================

interface CronJob {
  name: string;
  path: string;
  description: string;
}

const ANALYTICS_JOBS: CronJob[] = [
  {
    name: 'daily-kpis',
    path: '/api/cron/aggregate-daily-kpis',
    description: 'Aggregate daily KPIs for yesterday'
  },
  {
    name: 'user-summaries',
    path: '/api/cron/update-user-summaries',
    description: 'Update analytics summaries for active users'
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function callCronEndpoint(job: CronJob): Promise<void> {
  const url = `${BASE_URL}${job.path}`;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔄 Testing: ${job.name}`);
  console.log(`📝 Description: ${job.description}`);
  console.log(`🔗 URL: ${url}`);
  console.log(`${'='.repeat(60)}`);

  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (response.ok) {
      console.log(`\n✅ SUCCESS (${duration}ms)`);
      console.log('\nResponse:');
      console.log(JSON.stringify(data, null, 2));

      // Mostrar métricas específicas según el job
      if (job.name === 'daily-kpis' && data.kpis) {
        console.log('\n📊 Key Metrics:');
        console.log(`  • Landing Views: ${data.kpis.landing.views}`);
        console.log(`  • Signups: ${data.kpis.landing.signups}`);
        console.log(`  • DAU: ${data.kpis.engagement.dau}`);
        console.log(`  • Total Messages: ${data.kpis.engagement.totalMessages}`);
        console.log(`  • D1 Retention: ${data.kpis.retention.d1}%`);
      } else if (job.name === 'user-summaries' && data.updated !== undefined) {
        console.log('\n📊 Update Summary:');
        console.log(`  • Users Updated: ${data.updated}`);
        console.log(`  • Failed: ${data.failed || 0}`);
        console.log(`  • Total Processed: ${data.total || 0}`);
      }

    } else {
      console.log(`\n❌ FAILED (${duration}ms)`);
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log('\nError Response:');
      console.log(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`\n❌ ERROR (${duration}ms)`);
    console.error(error);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const jobName = args[0] || 'all';

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        Analytics Cron Jobs - Testing Script               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`🔐 Using CRON_SECRET: ${CRON_SECRET.substring(0, 10)}...`);

  if (jobName === 'all') {
    console.log(`\n🚀 Running ALL analytics cron jobs (${ANALYTICS_JOBS.length} jobs)\n`);

    for (const job of ANALYTICS_JOBS) {
      await callCronEndpoint(job);
      // Pausa entre jobs para evitar race conditions
      if (ANALYTICS_JOBS.indexOf(job) < ANALYTICS_JOBS.length - 1) {
        console.log('\n⏳ Waiting 2 seconds before next job...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

  } else {
    // Run specific job
    const job = ANALYTICS_JOBS.find(j => j.name === jobName);

    if (!job) {
      console.error(`\n❌ Error: Job '${jobName}' not found`);
      console.log('\nAvailable jobs:');
      ANALYTICS_JOBS.forEach(j => {
        console.log(`  • ${j.name.padEnd(20)} - ${j.description}`);
      });
      console.log(`  • all${' '.repeat(17)} - Run all analytics jobs`);
      process.exit(1);
    }

    await callCronEndpoint(job);
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    Testing Complete                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

// Run script
main().catch((error) => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
