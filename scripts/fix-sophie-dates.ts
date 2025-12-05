import { prisma } from "../lib/prisma";

/**
 * Actualiza las fechas de Sophie Müller para que sean coherentes con Nov 2025
 */

async function main() {
  const agentId = "cmi3amhoy0001iji2skwgz9bz";

  console.log("🗓️ Actualizando fechas de Sophie Müller para Nov 2025...\n");

  // Eliminar eventos programados viejos (ya pasaron)
  await prisma.scheduledEvent.deleteMany({
    where: { agentId },
  });

  console.log("✅ Eventos antiguos eliminados\n");

  // Crear nuevos eventos FUTUROS (desde Nov 2025 en adelante)
  const newEvents = [
    {
      agentId,
      title: "Entrega Final de Proyecto de Diseño Sustentable",
      description: "Deadline para entregar el proyecto final del semestre de Diseño Sustentable.",
      category: "deadline",
      eventType: "one_time",
      scheduledFor: new Date("2025-12-15T23:59:00+01:00"), // 15 Dic 2025
      possibleOutcomes: [],
    },
    {
      agentId,
      title: "Vacaciones de Navidad en Argentina",
      description: "Viaje a Buenos Aires para pasar Navidad y Año Nuevo con la familia argentina.",
      category: "social",
      eventType: "one_time",
      scheduledFor: new Date("2025-12-20T00:00:00+01:00"), // 20 Dic 2025
      possibleOutcomes: [],
    },
    {
      agentId,
      title: "Cumpleaños de Sophie (20 años)",
      description: "Su cumpleaños número 20. Probablemente celebre con amigos en Berlín.",
      category: "celebration",
      eventType: "one_time",
      scheduledFor: new Date("2026-03-14T00:00:00+01:00"), // 14 Marzo 2026
      possibleOutcomes: [],
    },
    {
      agentId,
      title: "Inicio de Intercambio en UBA Buenos Aires",
      description: "Comienza su semestre de intercambio en la Universidad de Buenos Aires.",
      category: "academic",
      eventType: "one_time",
      scheduledFor: new Date("2026-08-01T00:00:00-03:00"), // Agosto 2026
      possibleOutcomes: [],
    },
  ];

  for (const event of newEvents) {
    await prisma.scheduledEvent.create({ data: event });
  }

  console.log(`✅ ${newEvents.length} nuevos ScheduledEvents creados (fechas futuras)\n`);

  // Actualizar el backstory si es necesario (ahora tiene 19 años, casi 20)
  console.log("📝 Nota: Sophie tiene 19 años (cumplió en marzo 2025)");
  console.log("📝 Está en su 3er año de Arquitectura en TU Berlin\n");

  console.log("✅ ¡Fechas actualizadas correctamente!\n");
  console.log("📅 Eventos futuros:");
  console.log("   - 15 Dic 2025: Entrega de proyecto final");
  console.log("   - 20 Dic 2025: Viaje a Argentina para Navidad");
  console.log("   - 14 Mar 2026: Cumpleaños 20");
  console.log("   - Ago 2026: Intercambio en UBA Buenos Aires\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
