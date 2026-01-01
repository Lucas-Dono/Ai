/**
 * Script de prueba para el sistema de eventos aplicados
 *
 * Demuestra cómo aplicar eventos a agentes y verificar su impacto.
 *
 * DEPRECATED: Este script fue deshabilitado debido a la migración del sistema de Worlds a Grupos.
 * Los módulos '@/lib/worlds/event-application.service' y '@/lib/worlds/event-types'
 * ya no existen, y los modelos 'world' y 'worldAgent' fueron eliminados.
 * Si necesitas funcionalidad similar para el nuevo sistema de Grupos, crea un nuevo script.
 */

// import { prisma } from '@/lib/prisma';
// import { getEventApplicationService } from '@/lib/worlds/event-application.service';
// import { EventType } from '@/lib/worlds/event-types';
//
// async function testEventApplication() {
//   console.log('🎯 Testing Event Application System\n');
//
//   // 1. Buscar un mundo de prueba (o crear uno)
//   let world = await prisma.world.findFirst({
//     where: { name: { contains: 'Test' } },
//     include: {
//       worldAgents: {
//         take: 1,
//         include: { agent: true },
//       },
//     },
//   });
//
//   // ... resto del código comentado
// }
//
// testEventApplication().catch(console.error);

console.log('⚠️  Este script está deshabilitado debido a la migración de Worlds a Grupos.');
console.log('Los módulos y modelos relacionados con Worlds ya no existen.');
process.exit(0);
