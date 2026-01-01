#!/usr/bin/env tsx

/**
 * Script para pre-generar audios de Academia Sakura
 * Genera y guarda todos los audios de diálogos predefinidos
 * Ejecutar con: npx tsx scripts/pregenerate-academia-voices.ts
 *
 * DEPRECATED: Este script fue deshabilitado debido a la migración del sistema de Worlds a Grupos.
 * Los modelos 'world' y 'worldInteraction' ya no existen en el esquema de Prisma.
 * Si necesitas funcionalidad similar para el nuevo sistema de Grupos, crea un nuevo script.
 */

// import { PrismaClient } from '@prisma/client';
// import { getElevenLabsClient } from '../lib/voice-system/elevenlabs-client';
// import { cleanTextForTTS, hasSpokenContent } from '../lib/voice-system/text-cleaner';
// import { getVoiceConfig, getVoiceSettings } from '../lib/voice-system/voice-config';
// import fs from 'fs/promises';
// import path from 'path';
//
// const prisma = new PrismaClient();
//
// async function main() {
//   console.log('🎤 Pre-generando audios de Academia Sakura...\n');
//
//   try {
//     // ... resto del código comentado
//   } catch (error) {
//     console.error('❌ Error:', error);
//     throw error;
//   }
// }
//
// main()
//   .catch((error) => {
//     console.error('❌ Error fatal:', error);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

console.log('⚠️  Este script está deshabilitado debido a la migración de Worlds a Grupos.');
console.log('Los modelos "world" y "worldInteraction" ya no existen en el esquema de Prisma.');
process.exit(0);
