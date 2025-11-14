/**
 * Script para iniciar el procesamiento de cola de embeddings
 * Se ejecuta en background y procesa embeddings continuamente
 */

const { embeddingQueue } = require('../lib/embeddings/queue-manager');
const { warmupQwenModel } = require('../lib/memory/qwen-embeddings');

async function main() {
  console.log('🚀 Iniciando procesamiento de cola de embeddings...');

  try {
    // Pre-calentar modelo
    console.log('🔥 Pre-calentando modelo Qwen...');
    await warmupQwenModel();
    console.log('✅ Modelo Qwen pre-calentado');

    // Iniciar procesamiento de cola
    console.log('▶️  Iniciando procesamiento de cola...');
    embeddingQueue.startProcessing();
    console.log('✅ Procesamiento de cola iniciado');

    // Mantener el proceso vivo
    console.log('📊 Sistema de embeddings listo y funcionando');
    console.log('💡 El procesamiento continuará en background');

    // Registrar handler para shutdown graceful
    process.on('SIGTERM', async () => {
      console.log('⏹️  Recibida señal SIGTERM, deteniendo procesamiento...');
      embeddingQueue.stopProcessing();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('⏹️  Recibida señal SIGINT, deteniendo procesamiento...');
      embeddingQueue.stopProcessing();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error iniciando sistema de embeddings:', error);
    process.exit(1);
  }
}

main();
