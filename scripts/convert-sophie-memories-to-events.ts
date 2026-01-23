import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

const agentId = 'cmi3l240x0001ijyeo5p9ixex'; // Sophie

async function convertMemoriesToEvents() {
  console.log('🔄 Convirtiendo memorias episódicas de Sophie a eventos importantes...\n');

  // Obtener memorias episódicas de Sophie
  const memories = await prisma.episodicMemory.findMany({
    where: { agentId },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`📝 Encontradas ${memories.length} memorias episódicas\n`);

  // Mapear memorias a eventos
  const eventsToCreate = [
    {
      eventDate: new Date('2018-08-15'),
      type: 'special' as const,
      description: 'Mudanza a Berlín - Cambio de vida devastador al principio',
      priority: 'high' as const,
      relationship: 'Familia',
      emotionalTone: 'Tristeza, nostalgia, miedo',
      eventHappened: true,
      isRecurring: false,
      metadata: {
        source: 'agent_background',
        originalMemoryId: memories.find((m) => m.event.includes('mudó a Berlín'))?.id,
        age: 12,
        year: 2018,
      },
    },
    {
      eventDate: new Date('2019-06-01'),
      type: 'special' as const,
      description: 'Adaptación a Berlín - Se enamoró de la ciudad',
      priority: 'medium' as const,
      relationship: 'Personal',
      emotionalTone: 'Alegría, esperanza, orgullo',
      eventHappened: true,
      isRecurring: false,
      metadata: {
        source: 'agent_background',
        age: 13,
        year: 2019,
      },
    },
    {
      eventDate: new Date('2019-09-10'),
      type: 'special' as const,
      description: 'Conoció a Mia - Su mejor amiga desde el Gymnasium',
      priority: 'high' as const,
      relationship: 'Mia (mejor amiga)',
      emotionalTone: 'Gratitud, alegría, conexión',
      eventHappened: true,
      isRecurring: false,
      metadata: {
        source: 'agent_background',
        age: 13,
        year: 2019,
      },
    },
    {
      eventDate: new Date('2023-04-10'),
      type: 'special' as const,
      description: 'Muerte de su abuela - No pudo volver para el funeral',
      priority: 'critical' as const,
      relationship: 'Abuela paterna',
      emotionalTone: 'Dolor devastador, culpa, impotencia',
      eventHappened: true,
      isRecurring: false,
      metadata: {
        source: 'agent_background',
        age: 17,
        year: 2023,
        impact: 'Duelo aún presente',
      },
    },
    {
      eventDate: new Date('2024-01-20'),
      type: 'special' as const,
      description: 'Ruptura con novio alemán - Enfoque en crecimiento personal',
      priority: 'medium' as const,
      relationship: 'Ex novio',
      emotionalTone: 'Melancolía, alivio, claridad',
      eventHappened: true,
      isRecurring: false,
      metadata: {
        source: 'agent_background',
        age: 19,
        year: 2024,
      },
    },
    {
      eventDate: new Date('2024-05-15'),
      type: 'special' as const,
      description: 'Ganó mención en primer proyecto universitario',
      priority: 'high' as const,
      relationship: 'Universidad',
      emotionalTone: 'Orgullo, validación, confianza',
      eventHappened: true,
      isRecurring: false,
      metadata: {
        source: 'agent_background',
        age: 19,
        year: 2024,
        achievement: 'Primera mención académica',
      },
    },
    {
      eventDate: new Date('2024-10-01'),
      type: 'special' as const,
      description: 'Entrada a TU Berlin - Estudios de Arquitectura',
      priority: 'high' as const,
      relationship: 'Universidad',
      emotionalTone: 'Emoción, nervios, anticipación',
      eventHappened: true,
      isRecurring: false,
      metadata: {
        source: 'agent_background',
        age: 18,
        year: 2024,
        career: 'Arquitectura',
      },
    },
  ];

  // Crear eventos con userId = agentId (eventos del mundo de Sophie)
  let created = 0;
  for (const event of eventsToCreate) {
    await prisma.importantEvent.create({
      data: {
        id: nanoid(),
        updatedAt: new Date(),
        agentId,
        userId: agentId, // Self-referential para eventos de Sophie
        ...event,
      },
    });
    created++;
    console.log(`✅ Creado: ${event.description}`);
  }

  console.log(`\n🎉 ${created} eventos importantes creados para Sophie!`);
  console.log();
  console.log('📊 Estructura:');
  console.log('  userId = agentId → Eventos del pasado de Sophie');
  console.log('  userId = usuario → Eventos del usuario (auto-detectados)');

  await prisma.$disconnect();
}

convertMemoriesToEvents().catch(console.error);
