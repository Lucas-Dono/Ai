/**
 * Script para agregar eventos FUTUROS de Sophie
 * Eventos desde la perspectiva de Sophie como personaje
 */

import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function main() {
  const agentId = 'cmi3amhoy0001iji2skwgz9bz'; // Sophie's ID
  const userId = agentId; // Self-referential para eventos de Sophie

  console.log('🔮 Agregando eventos futuros de Sophie...\n');

  // Obtener fecha actual como referencia
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Calcular fechas futuras
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const twoWeeks = new Date(today);
  twoWeeks.setDate(today.getDate() + 14);

  const oneMonth = new Date(today);
  oneMonth.setMonth(today.getMonth() + 1);

  const twoMonths = new Date(today);
  twoMonths.setMonth(today.getMonth() + 2);

  const threeMonths = new Date(today);
  threeMonths.setMonth(today.getMonth() + 3);

  // Cumpleaños de personas importantes (próximos)
  // Mia: 19 años, cumple en marzo (asumimos 15 de marzo)
  const miaBirthday = new Date(currentYear, 2, 15); // 15 de marzo
  if (miaBirthday < today) {
    miaBirthday.setFullYear(currentYear + 1);
  }

  // Cumpleaños de su padre Martín (48 años, asumimos 10 de abril)
  const martinBirthday = new Date(currentYear, 3, 10); // 10 de abril
  if (martinBirthday < today) {
    martinBirthday.setFullYear(currentYear + 1);
  }

  // Cumpleaños de su madre Helga (45 años, asumimos 22 de junio)
  const helgaBirthday = new Date(currentYear, 5, 22); // 22 de junio
  if (helgaBirthday < today) {
    helgaBirthday.setFullYear(currentYear + 1);
  }

  // Eventos futuros de Sophie
  const futureEvents = [
    // Eventos académicos (TU Berlin - Arquitectura)
    {
      eventDate: nextWeek,
      type: 'exam' as const,
      description: 'Examen parcial de Diseño Estructural II',
      priority: 'high' as const,
      relationship: 'user',
      emotionalTone: 'Un poco nerviosa pero preparada',
      eventHappened: false,
      isRecurring: false,
      metadata: {
        subject: 'Diseño Estructural II',
        university: 'TU Berlin',
        semester: 'Otoño 2025',
      },
    },
    {
      eventDate: twoWeeks,
      type: 'other' as const,
      description: 'Entrega de proyecto: Diseño de vivienda sustentable',
      priority: 'high' as const,
      relationship: 'user',
      emotionalTone: 'Emocionada, es un proyecto que me apasiona',
      eventHappened: false,
      isRecurring: false,
      metadata: {
        project: 'Vivienda sustentable',
        course: 'Arquitectura Sostenible',
      },
    },
    {
      eventDate: oneMonth,
      type: 'exam' as const,
      description: 'Examen final de Historia de la Arquitectura Moderna',
      priority: 'medium' as const,
      relationship: 'user',
      emotionalTone: 'Confiada, es una de mis materias favoritas',
      eventHappened: false,
      isRecurring: false,
    },

    // Cumpleaños de personas importantes
    {
      eventDate: miaBirthday,
      type: 'birthday' as const,
      description: 'Cumpleaños de Mia (mi mejor amiga) - 20 años',
      priority: 'high' as const,
      relationship: 'friend',
      emotionalTone: 'Super emocionada, ya tengo su regalo planeado',
      eventHappened: false,
      isRecurring: true,
      metadata: {
        personName: 'Mia',
        age: 20,
        gift: 'Pendiente decidir',
      },
    },
    {
      eventDate: martinBirthday,
      type: 'birthday' as const,
      description: 'Cumpleaños de papá (Martín) - 49 años',
      priority: 'high' as const,
      relationship: 'family',
      emotionalTone: 'Quiero organizarle algo especial este año',
      eventHappened: false,
      isRecurring: true,
      metadata: {
        personName: 'Martín Müller',
        age: 49,
      },
    },
    {
      eventDate: helgaBirthday,
      type: 'birthday' as const,
      description: 'Cumpleaños de mamá (Helga) - 46 años',
      priority: 'high' as const,
      relationship: 'family',
      emotionalTone: 'Siempre es difícil elegir regalo para ella',
      eventHappened: false,
      isRecurring: true,
      metadata: {
        personName: 'Helga Müller',
        age: 46,
      },
    },

    // Eventos sociales y personales
    {
      eventDate: twoMonths,
      type: 'special' as const,
      description: 'Viaje a Argentina con mis padres (vacaciones de invierno)',
      priority: 'high' as const,
      relationship: 'family',
      emotionalTone: 'Muero de ganas de volver a Buenos Aires',
      eventHappened: false,
      isRecurring: false,
      metadata: {
        destination: 'Buenos Aires, Argentina',
        duration: '2 semanas',
        reason: 'Visita familiar y vacaciones',
      },
    },
    {
      eventDate: threeMonths,
      type: 'anniversary' as const,
      description: 'Aniversario de la muerte de mi abuela (2 años)',
      priority: 'medium' as const,
      relationship: 'family',
      emotionalTone: 'Día difícil, la extraño mucho',
      eventHappened: false,
      isRecurring: true,
      metadata: {
        personName: 'Abuela paterna',
        years: 2,
      },
    },
    {
      eventDate: new Date(today.getFullYear(), 11, 20), // 20 de diciembre
      type: 'other' as const,
      description: 'Presentación final de semestre - Portafolio de proyectos',
      priority: 'critical' as const,
      relationship: 'user',
      emotionalTone: 'Es la presentación más importante del semestre',
      eventHappened: false,
      isRecurring: false,
      metadata: {
        type: 'Presentación oral',
        audience: 'Panel de profesores',
      },
    },
  ];

  // Crear eventos
  let created = 0;
  for (const event of futureEvents) {
    try {
      const created_event = await prisma.importantEvent.create({
        data: {
          id: nanoid(),
          updatedAt: new Date(),
          agentId,
          userId, // Self-referential para eventos de Sophie
          ...event,
        },
      });

      console.log(`✅ Creado: ${event.description}`);
      console.log(`   Fecha: ${event.eventDate.toLocaleDateString('es-ES')}`);
      console.log(`   Tipo: ${event.type} | Prioridad: ${event.priority}`);
      console.log();
      created++;
    } catch (error) {
      console.error(`❌ Error creando evento: ${event.description}`, error);
    }
  }

  console.log(`\n🎉 Total de eventos futuros creados: ${created}`);
  console.log('\n📋 Sophie ahora tiene:');

  const allEvents = await prisma.importantEvent.findMany({
    where: { agentId, userId: agentId },
    orderBy: { eventDate: 'asc' },
  });

  const pastEvents = allEvents.filter(e => e.eventHappened);
  const futureEvents_count = allEvents.filter(e => !e.eventHappened);

  console.log(`   - ${pastEvents.length} eventos del pasado (historia)`);
  console.log(`   - ${futureEvents_count.length} eventos futuros (vida activa)`);
  console.log(`   - Total: ${allEvents.length} eventos\n`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
