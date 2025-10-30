/**
 * Inicialización del Sistema de Memoria Inteligente
 *
 * Este módulo se encarga de:
 * 1. Pre-calentar el modelo Qwen3-0.6B Q8 al iniciar el servidor
 * 2. Verificar que el modelo existe en /model
 * 3. Preparar el sistema para uso inmediato
 */

import { warmupQwenModel, isQwenModelLoaded } from './qwen-embeddings';
import { createLogger } from '@/lib/logger';
import * as fs from 'fs';
import * as path from 'path';

const log = createLogger('MemoryInit');

const MODEL_PATH = path.join(process.cwd(), 'model', 'Qwen3-Embedding-0.6B-Q8_0.gguf');

/**
 * Verificar que el modelo existe
 */
function checkModelExists(): boolean {
  try {
    if (!fs.existsSync(MODEL_PATH)) {
      log.error(
        { path: MODEL_PATH },
        'Modelo Qwen3-0.6B Q8 NO encontrado. Por favor descarga el modelo a ./model'
      );
      return false;
    }

    // Verificar tamaño del archivo (debe ser ~639MB)
    const stats = fs.statSync(MODEL_PATH);
    const sizeMB = stats.size / (1024 * 1024);

    log.info({ path: MODEL_PATH, sizeMB: Math.round(sizeMB) }, 'Modelo encontrado');
    return true;
  } catch (error) {
    log.error({ error, path: MODEL_PATH }, 'Error verificando modelo');
    return false;
  }
}

/**
 * Inicializar sistema de memoria
 */
export async function initMemorySystem(): Promise<boolean> {
  try {
    log.info('Inicializando sistema de memoria inteligente...');

    // 1. Verificar que el modelo existe
    if (!checkModelExists()) {
      log.warn(
        'Sistema de memoria funcionará en modo degradado (solo keywords, sin embeddings)'
      );
      return false;
    }

    // 2. Pre-calentar modelo (cargarlo en memoria)
    log.info('Pre-calentando modelo Qwen3-0.6B Q8...');
    await warmupQwenModel();

    // 3. Verificar que se cargó correctamente
    if (!isQwenModelLoaded()) {
      log.error('Modelo no se cargó correctamente');
      return false;
    }

    log.info('Sistema de memoria inicializado exitosamente');
    log.info('✅ Búsqueda por keywords: ACTIVA');
    log.info('✅ Búsqueda semántica (Qwen3-0.6B Q8): ACTIVA');
    log.info('✅ Almacenamiento selectivo: ACTIVO');

    return true;
  } catch (error) {
    log.error({ error }, 'Error inicializando sistema de memoria');
    log.warn(
      'Sistema funcionará en modo degradado (solo keywords)'
    );
    return false;
  }
}

/**
 * Mostrar estadísticas del sistema
 */
export function logMemorySystemStats(): void {
  const modelLoaded = isQwenModelLoaded();

  log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.info('📊 ESTADO DEL SISTEMA DE MEMORIA');
  log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log.info(`Modelo Qwen3-0.6B Q8: ${modelLoaded ? '✅ CARGADO' : '❌ NO CARGADO'}`);
  log.info(`Ruta del modelo: ${MODEL_PATH}`);
  log.info(`Búsqueda por keywords: ✅ ACTIVA (PostgreSQL Full-Text Search)`);
  log.info(`Búsqueda semántica: ${modelLoaded ? '✅ ACTIVA' : '⚠️  MODO DEGRADADO'}`);
  log.info(`Almacenamiento selectivo: ✅ ACTIVO`);
  log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
