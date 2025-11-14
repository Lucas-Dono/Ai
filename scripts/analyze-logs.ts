#!/usr/bin/env tsx
/**
 * Script para analizar logs locales
 *
 * Uso:
 *   tsx scripts/analyze-logs.ts [log-file]
 *   tsx scripts/analyze-logs.ts --level=error
 *   tsx scripts/analyze-logs.ts --module=llm
 *   tsx scripts/analyze-logs.ts --since="2024-01-01"
 */

import * as fs from 'fs';
import * as path from 'path';
import { createInterface } from 'readline';

interface LogEntry {
  level: number;
  time: number;
  pid: number;
  hostname?: string;
  module?: string;
  requestId?: string;
  msg: string;
  err?: any;
  [key: string]: any;
}

const LOG_LEVELS: Record<number, string> = {
  10: 'TRACE',
  20: 'DEBUG',
  30: 'INFO',
  40: 'WARN',
  50: 'ERROR',
  60: 'FATAL',
};

interface AnalysisOptions {
  file?: string;
  level?: string;
  module?: string;
  since?: string;
  requestId?: string;
}

async function analyzeLogs(options: AnalysisOptions) {
  // Determinar archivo de log
  const logFile = options.file || path.join(process.cwd(), 'logs', 'app.log');

  if (!fs.existsSync(logFile)) {
    console.error(`❌ Log file not found: ${logFile}`);
    console.log('\n💡 Tip: Logs are created when the app runs in production mode.');
    process.exit(1);
  }

  console.log(`📂 Analyzing: ${logFile}\n`);

  // Filtros
  const levelFilter = options.level ? getLevelNumber(options.level) : null;
  const moduleFilter = options.module;
  const sinceFilter = options.since ? new Date(options.since).getTime() : null;
  const requestIdFilter = options.requestId;

  // Estadísticas
  const stats = {
    total: 0,
    byLevel: {} as Record<string, number>,
    byModule: {} as Record<string, number>,
    errors: [] as LogEntry[],
  };

  // Leer archivo línea por línea
  const fileStream = fs.createReadStream(logFile);
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const log: LogEntry = JSON.parse(line);

      // Aplicar filtros
      if (levelFilter !== null && log.level < levelFilter) continue;
      if (moduleFilter && log.module !== moduleFilter) continue;
      if (sinceFilter && log.time < sinceFilter) continue;
      if (requestIdFilter && log.requestId !== requestIdFilter) continue;

      // Contar
      stats.total++;

      const levelName = LOG_LEVELS[log.level] || 'UNKNOWN';
      stats.byLevel[levelName] = (stats.byLevel[levelName] || 0) + 1;

      if (log.module) {
        stats.byModule[log.module] = (stats.byModule[log.module] || 0) + 1;
      }

      // Guardar errores
      if (log.level >= 50) {
        stats.errors.push(log);
      }
    } catch (error) {
      // Línea no es JSON válido, skip
    }
  }

  // Mostrar resultados
  console.log('═══════════════════════════════════════════');
  console.log('📊 LOG ANALYSIS RESULTS');
  console.log('═══════════════════════════════════════════\n');

  console.log(`Total logs: ${stats.total}\n`);

  // Por nivel
  console.log('By Level:');
  console.log('─────────────────────────────────────────');
  for (const [level, count] of Object.entries(stats.byLevel).sort((a, b) => b[1] - a[1])) {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    const bar = '█'.repeat(Math.ceil(count / stats.total * 40));
    console.log(`  ${level.padEnd(8)} ${count.toString().padStart(6)} (${percentage}%) ${bar}`);
  }

  // Por módulo
  if (Object.keys(stats.byModule).length > 0) {
    console.log('\nBy Module:');
    console.log('─────────────────────────────────────────');
    for (const [module, count] of Object.entries(stats.byModule).sort((a, b) => b[1] - a[1])) {
      const percentage = ((count / stats.total) * 100).toFixed(1);
      console.log(`  ${module.padEnd(20)} ${count.toString().padStart(6)} (${percentage}%)`);
    }
  }

  // Errores
  if (stats.errors.length > 0) {
    console.log('\n🚨 Recent Errors:');
    console.log('─────────────────────────────────────────');

    // Mostrar últimos 10 errores
    const recentErrors = stats.errors.slice(-10).reverse();

    for (const error of recentErrors) {
      const time = new Date(error.time).toISOString();
      const level = LOG_LEVELS[error.level];
      const module = error.module || 'unknown';

      console.log(`\n[${time}] ${level} [${module}]`);
      console.log(`  ${error.msg}`);

      if (error.err) {
        console.log(`  Error: ${error.err.message || error.err.type || 'Unknown'}`);
        if (error.err.stack) {
          const stackLines = error.err.stack.split('\n').slice(0, 3);
          console.log(`  ${stackLines.join('\n  ')}`);
        }
      }

      if (error.requestId) {
        console.log(`  RequestID: ${error.requestId}`);
      }
    }

    if (stats.errors.length > 10) {
      console.log(`\n  ... and ${stats.errors.length - 10} more errors`);
    }
  }

  console.log('\n═══════════════════════════════════════════\n');

  // Recomendaciones
  if (stats.errors.length > stats.total * 0.1) {
    console.log('⚠️  WARNING: High error rate (>10% of logs)');
  }

  if (stats.byLevel['DEBUG'] && stats.byLevel['DEBUG'] > stats.total * 0.5) {
    console.log('💡 TIP: Many DEBUG logs. Consider setting LOG_LEVEL=info in production');
  }
}

function getLevelNumber(levelName: string): number {
  const upperName = levelName.toUpperCase();
  for (const [num, name] of Object.entries(LOG_LEVELS)) {
    if (name === upperName) {
      return parseInt(num);
    }
  }
  throw new Error(`Unknown log level: ${levelName}`);
}

// Parse command line arguments
function parseArgs(): AnalysisOptions {
  const args = process.argv.slice(2);
  const options: AnalysisOptions = {};

  for (const arg of args) {
    if (arg.startsWith('--level=')) {
      options.level = arg.split('=')[1];
    } else if (arg.startsWith('--module=')) {
      options.module = arg.split('=')[1];
    } else if (arg.startsWith('--since=')) {
      options.since = arg.split('=')[1];
    } else if (arg.startsWith('--request=')) {
      options.requestId = arg.split('=')[1];
    } else if (!arg.startsWith('--')) {
      options.file = arg;
    }
  }

  return options;
}

// Main
const options = parseArgs();
analyzeLogs(options).catch((error) => {
  console.error('Error analyzing logs:', error);
  process.exit(1);
});
