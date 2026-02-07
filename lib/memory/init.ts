/**
 * Inicialización del Sistema de Memoria Inteligente
 *
 * Con OpenAI embeddings, no se requiere pre-calentar modelos locales.
 * Solo verificamos que la API key esté configurada.
 */

import { isOpenAIConfigured } from './openai-embeddings';
import { createLogger } from '@/lib/logger';

const log = createLogger('MemoryInit');

/**
 * Inicializar sistema de memoria
 */
export async function initMemorySystem(): Promise<boolean> {
  try {
    log.info('Inicializando sistema de memoria inteligente...');

    // Verificar que OpenAI esté configurado
    if (!isOpenAIConfigured()) {
      log.error('OPENAI_API_KEY no configurada');
      log.warn('Sistema de memoria funcionará en modo degradado (solo keywords, sin embeddings)');
      return false;
    }

    log.info('Sistema de memoria inicializado exitosamente');
    log.info('✅ Búsqueda por keywords: ACTIVA');
    log.info('✅ Búsqueda semántica (OpenAI text-embedding-3-small): ACTIVA');
    log.info('✅ Almacenamiento selectivo: ACTIVO');

    return true;
  } catch (error) {
    log.error({ error }, 'Error inicializando sistema de memoria');
    log.warn('Sistema funcionará en modo degradado (solo keywords)');
    return false;
  }
}

/**
 * Mostrar estadísticas del sistema
 */
export function logMemorySystemStats(): void {
  const configured = isOpenAIConfigured();

  log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.info('📊 ESTADO DEL SISTEMA DE MEMORIA');
  log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.info(`OpenAI embeddings: ${configured ? '✅ CONFIGURADO' : '❌ NO CONFIGURADO'}`);
  log.info(`Modelo: text-embedding-3-small (1536 dimensiones)`);
  log.info(`Búsqueda por keywords: ✅ ACTIVA (PostgreSQL Full-Text Search)`);
  log.info(`Búsqueda semántica: ${configured ? '✅ ACTIVA' : '⚠️  MODO DEGRADADO'}`);
  log.info(`Almacenamiento selectivo: ✅ ACTIVO`);
  log.info(`Costo: $0.02/M tokens (~$0.001 por embedding promedio)`);
  log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
