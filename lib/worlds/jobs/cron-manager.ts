/**
 * Cron Manager - Sistema de gestión de cron jobs para mundos
 *
 * Coordina y programa todos los jobs de mantenimiento de mundos:
 * - Cleanup Job (cada 1 hora)
 * - Sync Job (cada 5 minutos)
 * - Auto-pause Job (cada 6 horas)
 * - Memory Consolidation Job (cada 24 horas)
 * - Emergent Events Job (cada 30 minutos)
 *
 * FUNCIONALIDADES:
 * - Iniciar/detener todos los jobs
 * - Monitorear estado de jobs
 * - Obtener métricas agregadas
 * - Manejo de errores y alertas
 */

import * as cron from 'node-cron';
import { cleanupJob } from './cleanup-job';
import { syncJob } from './sync-job';
import { autoPauseJob } from './auto-pause-job';
import { memoryConsolidationJob } from './memory-consolidation-job';
import { emergentEventsJob } from './emergent-events-job';
import { createLogger } from '@/lib/logger';
import { isRedisConfigured } from '@/lib/redis/config';

const log = createLogger('CronManager');

export interface JobSchedule {
  name: string;
  schedule: string; // Cron expression
  description: string;
  enabled: boolean;
  task?: cron.ScheduledTask;
  lastRun?: Date;
  nextRun?: Date;
  isRunning: boolean;
}

export interface CronManagerStats {
  totalJobs: number;
  runningJobs: number;
  enabledJobs: number;
  disabledJobs: number;
  jobs: JobSchedule[];
}

export class CronManager {
  private jobs: Map<string, JobSchedule> = new Map();
  private isInitialized = false;

  /**
   * Inicializa todos los cron jobs
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      log.warn('Cron manager already initialized');
      return;
    }

    if (!isRedisConfigured()) {
      log.warn('⚠️  Redis not configured, cron jobs will run but with limited functionality');
    }

    log.info('🚀 Initializing cron jobs...');

    // 1. Cleanup Job - cada 1 hora
    this.scheduleJob({
      name: 'cleanup',
      schedule: '0 * * * *', // Cada hora en punto
      description: 'Limpia estado de mundos inactivos y locks huérfanos',
      enabled: true,
      isRunning: false,
    }, async () => {
      await cleanupJob.execute();
    });

    // 2. Sync Job - cada 5 minutos
    this.scheduleJob({
      name: 'sync',
      schedule: '*/5 * * * *', // Cada 5 minutos
      description: 'Sincroniza estado de Redis a DB',
      enabled: true,
      isRunning: false,
    }, async () => {
      await syncJob.execute();
    });

    // 3. Auto-pause Job - cada 6 horas
    this.scheduleJob({
      name: 'auto-pause',
      schedule: '0 */6 * * *', // Cada 6 horas
      description: 'Pausa mundos abandonados (sin actividad > 24h)',
      enabled: true,
      isRunning: false,
    }, async () => {
      await autoPauseJob.execute();
    });

    // 4. Memory Consolidation Job - cada 24 horas (a las 3 AM)
    this.scheduleJob({
      name: 'memory-consolidation',
      schedule: '0 3 * * *', // Cada día a las 3 AM
      description: 'Consolida memoria de mundos largos (> 1000 interacciones)',
      enabled: true,
      isRunning: false,
    }, async () => {
      await memoryConsolidationJob.execute();
    });

    // 5. Emergent Events Job - cada 30 minutos
    this.scheduleJob({
      name: 'emergent-events',
      schedule: '*/30 * * * *', // Cada 30 minutos
      description: 'Genera eventos emergentes para mundos activos',
      enabled: true,
      isRunning: false,
    }, async () => {
      await emergentEventsJob.execute();
    });

    this.isInitialized = true;

    log.info(
      { jobCount: this.jobs.size },
      '✅ Cron manager initialized with all jobs scheduled'
    );

    // Log schedule info
    this.logScheduleInfo();
  }

  /**
   * Programa un job
   */
  private scheduleJob(
    config: JobSchedule,
    handler: () => Promise<void>
  ): void {
    if (!config.enabled) {
      this.jobs.set(config.name, config);
      log.debug({ job: config.name }, 'Job registered but disabled');
      return;
    }

    try {
      const task = cron.schedule(
        config.schedule,
        async () => {
          const job = this.jobs.get(config.name);
          if (!job) return;

          // Prevenir ejecución concurrente
          if (job.isRunning) {
            log.warn({ job: config.name }, 'Job already running, skipping');
            return;
          }

          try {
            job.isRunning = true;
            job.lastRun = new Date();

            log.info({ job: config.name }, `▶️  Running job: ${config.description}`);

            await handler();

            log.info({ job: config.name }, `✅ Job completed`);
          } catch (error) {
            log.error({ error, job: config.name }, `❌ Job failed`);
          } finally {
            job.isRunning = false;
          }
        },
        {
          timezone: 'UTC', // Usar UTC para consistencia
        } as any // node-cron types incompletos
      );

      config.task = task;
      this.jobs.set(config.name, config);

      log.info(
        { job: config.name, schedule: config.schedule },
        `📅 Job scheduled: ${config.description}`
      );
    } catch (error) {
      log.error({ error, job: config.name }, 'Failed to schedule job');
    }
  }

  /**
   * Detiene todos los jobs
   */
  stop(): void {
    log.info('🛑 Stopping all cron jobs...');

    for (const [name, job] of this.jobs.entries()) {
      if (job.task) {
        job.task.stop();
        log.debug({ job: name }, 'Job stopped');
      }
    }

    log.info('✅ All cron jobs stopped');
  }

  /**
   * Reinicia todos los jobs
   */
  restart(): void {
    log.info('🔄 Restarting all cron jobs...');

    for (const [name, job] of this.jobs.entries()) {
      if (job.task) {
        job.task.stop();
        job.task.start();
        log.debug({ job: name }, 'Job restarted');
      }
    }

    log.info('✅ All cron jobs restarted');
  }

  /**
   * Ejecuta un job manualmente (útil para testing)
   */
  async runJobManually(jobName: string): Promise<void> {
    const job = this.jobs.get(jobName);
    if (!job) {
      throw new Error(`Job ${jobName} not found`);
    }

    log.info({ job: jobName }, '🔧 Running job manually...');

    switch (jobName) {
      case 'cleanup':
        await cleanupJob.execute();
        break;
      case 'sync':
        await syncJob.execute();
        break;
      case 'auto-pause':
        await autoPauseJob.execute();
        break;
      case 'memory-consolidation':
        await memoryConsolidationJob.execute();
        break;
      case 'emergent-events':
        await emergentEventsJob.execute();
        break;
      default:
        throw new Error(`Unknown job: ${jobName}`);
    }

    log.info({ job: jobName }, '✅ Manual job execution completed');
  }

  /**
   * Obtiene estadísticas de todos los jobs
   */
  getStats(): CronManagerStats {
    const jobsArray = Array.from(this.jobs.values());

    return {
      totalJobs: this.jobs.size,
      runningJobs: jobsArray.filter(j => j.isRunning).length,
      enabledJobs: jobsArray.filter(j => j.enabled).length,
      disabledJobs: jobsArray.filter(j => !j.enabled).length,
      jobs: jobsArray.map(job => ({
        ...job,
        task: undefined, // No serializar el task
      })),
    };
  }

  /**
   * Obtiene métricas detalladas de todos los jobs
   */
  getDetailedMetrics(): any {
    return {
      cleanup: cleanupJob.getLastMetrics(),
      sync: syncJob.getLastMetrics(),
      autoPause: autoPauseJob.getLastMetrics(),
      memoryConsolidation: memoryConsolidationJob.getLastMetrics(),
      emergentEvents: emergentEventsJob.getLastMetrics(),
      timestamp: new Date(),
    };
  }

  /**
   * Verifica si está inicializado
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Log info de schedules
   */
  private logScheduleInfo(): void {
    log.info('📋 Cron Job Schedules:');
    for (const [name, job] of this.jobs.entries()) {
      if (job.enabled) {
        log.info(`  • ${name}: ${job.schedule} - ${job.description}`);
      }
    }
  }

  /**
   * Habilita un job
   */
  enableJob(jobName: string): void {
    const job = this.jobs.get(jobName);
    if (!job) {
      throw new Error(`Job ${jobName} not found`);
    }

    if (job.task) {
      job.task.start();
      job.enabled = true;
      log.info({ job: jobName }, 'Job enabled');
    }
  }

  /**
   * Deshabilita un job
   */
  disableJob(jobName: string): void {
    const job = this.jobs.get(jobName);
    if (!job) {
      throw new Error(`Job ${jobName} not found`);
    }

    if (job.task) {
      job.task.stop();
      job.enabled = false;
      log.info({ job: jobName }, 'Job disabled');
    }
  }
}

// Singleton
export const cronManager = new CronManager();
