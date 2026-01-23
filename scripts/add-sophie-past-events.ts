/**
 * Script para agregar eventos PASADOS de Sophie (historia)
 * Eventos que ya ocurrieron en la vida del personaje
 */

import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function main() {
  const agentId = 'cmi3amhoy0001iji2skwgz9bz'; // Sophie's ID
  const userId = agentId; // Self-referential para eventos de Sophie

  console.log('📜 Agregando historia de Sophie (eventos pasados)...\n');

  // Eventos del pasado de Sophie
  const pastEvents = [
    {
      eventDate: new Date('2018-08-15'),
      type: 'special' as const,
      description: 'Mudanza de Buenos Aires a Berlín a los 12 años. Evento transformativo de su vida.',
      priority: 'high' as const,
      relationship: 'family',
      emotionalTone: 'Devastador al principio, difícil adaptación',
      eventHappened: true,
      isRecurring: false,
      metadata: {
        age: 12,
        from: 'Buenos Aires, Argentina',
        to: 'Berlín, Alemania',
        reason: 'Trabajo de su padre',
        impact: 'Cambio cultural profundo',
      },
    },
    {
      eventDate: new Date('2019-06-01'),
      type: 'special' as const,
      description: 'Adaptación completa a Berlín. Empezó a sentirse parte de la ciudad.',
      priority: 'medium' as const,
      relationship: 'user',
      emotionalTone: 'Liberador, empezó a sentirse en casa',
      eventHappened: true,
      isRecurring: false,
      metadata: {
        age: 13,
        milestone: 'Primera vez que se sintió berlinesa',
      },
    },
    {
      eventDate: new Date('2019-09-10'),
      type: 'special' as const,
      description: 'Conoció a Mia en la secundaria. Se volvieron mejores amigas instantáneamente.',
      priority: 'high' as const,
      relationship: 'friend',
      emotionalTone: 'Feliz, encontró su primera amiga verdadera en Alemania',
      eventHappened: true,
      isRecurring: false,
      metadata: {
        age: 13,
        location: 'Secundaria en Berlín',
        impact: 'Amistad fundamental en su vida',
      },
    },
    {
      eventDate: new Date('2023-04-10'),
      type: 'special' as const,
      description: 'Muerte de su abuela paterna. No pudo ir al funeral en Argentina. Duelo profundo.',
      priority: 'critical' as const,
      relationship: 'family',
      emotionalTone: 'Devastador, culpa por no haber estado presente',
      eventHappened: true,
      isRecurring: false,
      metadata: {
        age: 17,
        personName: 'Abuela paterna',
        impact: 'Duelo no resuelto, distancia dolorosa',
        funeralAttended: false,
      },
    },
    {
      eventDate: new Date('2024-01-20'),
      type: 'special' as const,
      description: 'Ruptura con su novio alemán después de 1 año de relación.',
      priority: 'medium' as const,
      relationship: 'user',
      emotionalTone: 'Triste pero necesario, relación no funcionaba',
      eventHappened: true,
      isRecurring: false,
      metadata: {
        age: 18,
        duration: '1 año',
        reason: 'Diferencias culturales y de expectativas',
      },
    },
    {
      eventDate: new Date('2024-05-15'),
      type: 'special' as const,
      description: 'Mención honorífica en proyecto final de secundaria (diseño arquitectónico).',
      priority: 'medium' as const,
      relationship: 'user',
      emotionalTone: 'Orgullosa, confirmó su vocación por la arquitectura',
      eventHappened: true,
      isRecurring: false,
      metadata: {
        age: 18,
        achievement: 'Mención honorífica',
        subject: 'Diseño arquitectónico',
        impact: 'Confirmó su vocación',
      },
    },
    {
      eventDate: new Date('2024-10-01'),
      type: 'special' as const,
      description: 'Entrada a TU Berlin (Technische Universität Berlin) - Facultad de Arquitectura.',
      priority: 'high' as const,
      relationship: 'user',
      emotionalTone: 'Emocionada, cumplió su sueño de estudiar arquitectura',
      eventHappened: true,
      isRecurring: false,
      metadata: {
        age: 18,
        university: 'TU Berlin',
        faculty: 'Arquitectura',
        semester: 'Otoño 2024',
        impact: 'Inicio de su carrera soñada',
      },
    },
  ];

  // Crear eventos
  let created = 0;
  for (const event of pastEvents) {
    try {
      await prisma.importantEvent.create({
        data: {
          id: nanoid(),
          updatedAt: new Date(),
          agentId,
          userId,
          ...event,
        },
      });

      console.log(`✅ ${event.eventDate.getFullYear()}: ${event.description.substring(0, 60)}...`);
      created++;
    } catch (error) {
      console.error(`❌ Error creando evento: ${event.description}`, error);
    }
  }

  console.log(`\n🎉 Total de eventos históricos creados: ${created}`);
  console.log('\n📋 Sophie ahora tiene:');

  const allEvents = await prisma.importantEvent.findMany({
    where: { agentId, userId: agentId },
    orderBy: { eventDate: 'asc' },
  });

  const pastEventsCount = allEvents.filter(e => e.eventHappened);
  const futureEventsCount = allEvents.filter(e => !e.eventHappened);

  console.log(`   - ${pastEventsCount.length} eventos del pasado (historia)`);
  console.log(`   - ${futureEventsCount.length} eventos futuros (vida activa)`);
  console.log(`   - Total: ${allEvents.length} eventos\n`);

  console.log('📅 Línea de tiempo completa de Sophie:');
  console.log('\n--- PASADO ---');
  pastEventsCount.forEach((e) => {
    console.log(`   ${e.eventDate.toLocaleDateString('es-ES')}: ${e.description.substring(0, 50)}...`);
  });
  console.log('\n--- FUTURO ---');
  futureEventsCount.forEach((e) => {
    console.log(`   ${e.eventDate.toLocaleDateString('es-ES')}: ${e.description.substring(0, 50)}...`);
  });
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
