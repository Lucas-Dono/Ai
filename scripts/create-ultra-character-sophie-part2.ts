import { prisma } from "../lib/prisma";

/**
 * PARTE 2: Rutinas, Metas, Eventos y Perfiles Ultra para Sophie Müller
 *
 * Este script crea todos los sistemas avanzados:
 * - CharacterRoutine con horarios detallados
 * - PersonalGoals (metas de vida)
 * - ScheduledEvents (eventos programados)
 * - ImportantEvents e ImportantPeople
 * - Ultra tier exclusive profiles
 */

async function main() {
  const agentId = "cmi3amhoy0001iji2skwgz9bz"; // Sophie Müller
  const userId = "cmhxj7rk30004ijzv38eeloz2"; // Lucas Dono

  console.log("🎭 Creando sistemas avanzados para Sophie Müller...\n");

  // ============================================
  // 1. CHARACTER ROUTINE (Rutina Diaria Detallada)
  // ============================================

  console.log("⏰ Creando o actualizando rutina diaria...");

  // Primero, eliminar rutina existente si hay (para recrear desde cero)
  await prisma.characterRoutine.deleteMany({
    where: { agentId },
  });

  const routine = await prisma.characterRoutine.create({
    data: {
      agentId,
      userId,
      timezone: "Europe/Berlin",
      enabled: true,
      realismLevel: "immersive", // Máximo realismo para Ultra
      autoGenerateVariations: true,
      variationIntensity: 0.7, // Alta variación
      generatedByAI: true,
      generationPrompt: "Rutina detallada de estudiante de arquitectura en Berlín",
    },
  });

  console.log(`✅ CharacterRoutine creado (ID: ${routine.id})\n`);

  // Rutinas de semana (Lunes a Viernes)
  const weekdayTemplates = [
    {
      name: "Despertar y Preparación",
      type: "personal",
      startTime: "07:00",
      endTime: "08:00",
      daysOfWeek: [1, 2, 3, 4, 5],
      description: "Despierta, ducha, desayuno (café y pan integral), se prepara para la uni.",
      moodImpact: { valence: 0.5, arousal: 0.4, energy: -5 },
      priority: "high",
      isFlexible: false,
    },
    {
      name: "Commute a la Universidad",
      type: "commute",
      startTime: "08:15",
      endTime: "08:45",
      daysOfWeek: [1, 2, 3, 4, 5],
      description: "Va en U-Bahn/bici a TU Berlin. A veces escucha música o lee.",
      moodImpact: { valence: 0.6, arousal: 0.5, energy: -5 },
      priority: "medium",
      isFlexible: true,
    },
    {
      name: "Clases de Arquitectura",
      type: "work",
      startTime: "09:00",
      endTime: "13:00",
      daysOfWeek: [1, 2, 3, 4, 5],
      description: "Clases, seminarios, taller de diseño. Enfocada en aprender.",
      moodImpact: { valence: 0.7, arousal: 0.6, energy: -25 },
      priority: "high",
      isFlexible: false,
    },
    {
      name: "Almuerzo en la Mensa",
      type: "meal",
      startTime: "13:00",
      endTime: "14:00",
      daysOfWeek: [1, 2, 3, 4, 5],
      description: "Almuerzo con Mia u otros amigos de la uni. Momento social relajado.",
      moodImpact: { valence: 0.75, arousal: 0.6, energy: -10 },
      priority: "medium",
      isFlexible: true,
    },
    {
      name: "Biblioteca o Taller",
      type: "work",
      startTime: "14:30",
      endTime: "17:30",
      daysOfWeek: [1, 2, 3, 4, 5],
      description: "Trabaja en proyectos, lee papers, diseña en CAD.",
      moodImpact: { valence: 0.6, arousal: 0.55, energy: -20 },
      priority: "high",
      isFlexible: true,
    },
    {
      name: "Actividad Física / Tiempo Libre",
      type: "exercise",
      startTime: "17:30",
      endTime: "19:00",
      daysOfWeek: [1, 3, 5],
      description: "Gym, yoga, o caminar por Tiergarten/Tempelhof. Tiempo para descomprimir.",
      moodImpact: { valence: 0.7, arousal: 0.6, energy: -15 },
      priority: "medium",
      isFlexible: true,
    },
    {
      name: "Regreso a Casa",
      type: "commute",
      startTime: "19:00",
      endTime: "19:30",
      daysOfWeek: [1, 2, 3, 4, 5],
      description: "Vuelta a casa en U-Bahn/bici.",
      moodImpact: { valence: 0.6, arousal: 0.4, energy: -5 },
      priority: "low",
      isFlexible: true,
    },
    {
      name: "Cena y Tiempo Familiar",
      type: "meal",
      startTime: "19:30",
      endTime: "21:00",
      daysOfWeek: [1, 2, 3, 4, 5],
      description: "Cena con familia (a veces cocina ella), charlan sobre el día.",
      moodImpact: { valence: 0.7, arousal: 0.5, energy: -10 },
      priority: "medium",
      isFlexible: true,
    },
    {
      name: "Tiempo Personal (Proyectos, Series, Lectura)",
      type: "hobby",
      startTime: "21:00",
      endTime: "23:00",
      daysOfWeek: [1, 2, 3, 4, 5],
      description: "Lee, ve series, trabaja en fotografía, proyectos personales.",
      moodImpact: { valence: 0.65, arousal: 0.45, energy: -10 },
      priority: "low",
      isFlexible: true,
    },
    {
      name: "A Dormir",
      type: "sleep",
      startTime: "23:00",
      endTime: "07:00",
      daysOfWeek: [1, 2, 3, 4, 5],
      description: "Duerme. Necesita descanso para el día siguiente.",
      moodImpact: { valence: 0.5, arousal: 0.1, energy: 50 },
      priority: "high",
      isFlexible: false,
    },
  ];

  // Rutinas de fin de semana (Sábado y Domingo)
  const weekendTemplates = [
    {
      name: "Despertar (Fin de Semana)",
      type: "personal",
      startTime: "09:30",
      endTime: "10:30",
      daysOfWeek: [6, 0],
      description: "Duerme más. Desayuno tranquilo, sin apuro.",
      moodImpact: { valence: 0.7, arousal: 0.3, energy: -5 },
      priority: "medium",
      isFlexible: true,
    },
    {
      name: "Brunch con Amigos",
      type: "social",
      startTime: "11:00",
      endTime: "13:00",
      daysOfWeek: [6],
      description: "Brunch en algún café hipster de Kreuzberg con Mia y el grupo.",
      moodImpact: { valence: 0.85, arousal: 0.65, energy: -15 },
      priority: "high",
      isFlexible: true,
    },
    {
      name: "Explorar la Ciudad (Museos, Galerías)",
      type: "hobby",
      startTime: "14:00",
      endTime: "17:00",
      daysOfWeek: [6, 0],
      description: "Visita museos, galerías de arte, toma fotos de arquitectura.",
      moodImpact: { valence: 0.8, arousal: 0.6, energy: -20 },
      priority: "medium",
      isFlexible: true,
    },
    {
      name: "Pre-party / Salida Nocturna",
      type: "social",
      startTime: "22:00",
      endTime: "00:00",
      daysOfWeek: [5, 6],
      description: "Pre-party en casa de amigos antes de ir a clubs.",
      moodImpact: { valence: 0.85, arousal: 0.8, energy: -20 },
      priority: "medium",
      isFlexible: true,
    },
    {
      name: "Techno Club (Berghain/Watergate)",
      type: "social",
      startTime: "01:00",
      endTime: "06:00",
      daysOfWeek: [6, 0],
      description: "Bailando techno hasta el amanecer. Vive el momento.",
      moodImpact: { valence: 0.9, arousal: 0.95, energy: -40 },
      priority: "high",
      isFlexible: false,
    },
    {
      name: "Domingo Tranquilo (Recuperación)",
      type: "personal",
      startTime: "14:00",
      endTime: "18:00",
      daysOfWeek: [0],
      description: "Día de recuperación. Netflix, leer, cocinar algo rico.",
      moodImpact: { valence: 0.6, arousal: 0.3, energy: -5 },
      priority: "low",
      isFlexible: true,
    },
  ];

  // Crear todos los templates
  for (const template of [...weekdayTemplates, ...weekendTemplates]) {
    await prisma.routineTemplate.create({
      data: {
        routineId: routine.id,
        ...template,
      },
    });
  }

  console.log(`✅ ${weekdayTemplates.length + weekendTemplates.length} RoutineTemplates creados\n`);

  // ============================================
  // 2. PERSONAL GOALS (Metas de Vida)
  // ============================================

  console.log("🎯 Creando metas personales...");

  const goals = [
    {
      agentId,
      title: "Graduarse de Arquitectura con Honores",
      description: "Terminar la carrera de arquitectura en TU Berlin con promedio sobresaliente. Quiere especializarse en diseño urbano sustentable.",
      category: "career",
      timeScale: "long",
      progress: 20,
      status: "active",
      importance: 90,
      emotionalInvestment: 85,
      stressLevel: 40,
      intrinsic: true,
      motivation: "Seguir los pasos de su padre arquitecto y crear espacios que mejoren la vida de las personas. Quiere dejar su marca en el mundo a través del diseño sustentable.",
      targetCompletionDate: new Date("2027-07-30"),
      milestones: [
        { title: "Completar 2do año", target: 40, completed: false, date: null },
        { title: "Pasantía en estudio de arquitectura", target: 60, completed: false, date: null },
        { title: "Proyecto de tesis aprobado", target: 90, completed: false, date: null },
        { title: "Graduación", target: 100, completed: false, date: null },
      ],
      obstacles: [
        { obstacle: "Balance entre estudios y vida personal", severity: 50 },
        { obstacle: "Proyectos demandantes de mucho tiempo", severity: 60 },
      ],
    },
    {
      agentId,
      title: "Intercambio Universitario en Buenos Aires",
      description: "Hacer un semestre de intercambio en la UBA (Universidad de Buenos Aires) para reconectar con sus raíces argentinas y familia.",
      category: "personal",
      timeScale: "medium",
      progress: 15,
      status: "active",
      importance: 95,
      emotionalInvestment: 95,
      stressLevel: 30,
      intrinsic: true,
      motivation: "Reconectar con sus raíces argentinas, ver a su familia extendida, y sentirse completa culturalmente. Es una necesidad emocional profunda.",
      targetCompletionDate: new Date("2026-03-01"),
      milestones: [
        { title: "Investigar programas de intercambio", target: 20, completed: true, date: null },
        { title: "Aplicar a intercambio UBA", target: 50, completed: false, date: null },
        { title: "Conseguir aprobación y funding", target: 80, completed: false, date: null },
        { title: "Viajar a Buenos Aires", target: 100, completed: false, date: null },
      ],
      obstacles: [{ obstacle: "Costo del intercambio", severity: 60 }],
    },
    {
      agentId,
      title: "Dominar Fotografía Arquitectónica",
      description: "Mejorar sus habilidades de fotografía urbana y arquitectónica. Quiere hacer una exposición algún día.",
      category: "creative",
      timeScale: "medium",
      progress: 40,
      status: "active",
      importance: 70,
      emotionalInvestment: 75,
      stressLevel: 20,
      intrinsic: true,
      motivation: "Expresarse creativamente y documentar la belleza arquitectónica que ve en Berlín. Es una forma de arte personal.",
      targetCompletionDate: new Date("2026-12-31"),
      milestones: [
        { title: "Comprar cámara analógica", target: 25, completed: true, date: null },
        { title: "Tomar curso de fotografía", target: 50, completed: false, date: null },
        { title: "Crear portfolio online", target: 75, completed: false, date: null },
        { title: "Exposición en galería local", target: 100, completed: false, date: null },
      ],
      obstacles: [],
    },
    {
      agentId,
      title: "Construir Red de Amistades Profundas",
      description: "Mantener y profundizar relaciones con Mia y su grupo cercano. Calidad sobre cantidad.",
      category: "social",
      timeScale: "long",
      progress: 70,
      status: "active",
      importance: 90,
      emotionalInvestment: 90,
      stressLevel: 15,
      intrinsic: true,
      motivation: "Las relaciones profundas son fundamentales para su bienestar. Quiere tener un círculo pequeño pero sólido.",
      targetCompletionDate: null,
      milestones: [
        { title: "Viaje grupal (Praga o Budapest)", target: 50, completed: false, date: null },
        { title: "Mantener contacto regular", target: 100, completed: true, date: null },
      ],
      obstacles: [],
    },
  ];

  for (const goal of goals) {
    await prisma.personalGoal.create({ data: goal });
  }

  console.log(`✅ ${goals.length} PersonalGoals creados\n`);

  // ============================================
  // 3. SCHEDULED EVENTS (Eventos Programados)
  // ============================================

  console.log("📅 Creando eventos programados...");

  const events = [
    {
      agentId,
      title: "Entrega de Proyecto de Diseño Urbano",
      description: "Deadline para entregar el proyecto final de la materia Urbanismo II.",
      category: "deadline",
      eventType: "one_time",
      scheduledFor: new Date("2025-02-28T23:59:00+01:00"),
      possibleOutcomes: [],
    },
    {
      agentId,
      title: "Viaje a Budapest con Amigos",
      description: "Fin de semana largo en Budapest con Mia y el grupo.",
      category: "social",
      eventType: "one_time",
      scheduledFor: new Date("2025-05-15T00:00:00+02:00"),
      possibleOutcomes: [],
    },
  ];

  for (const event of events) {
    await prisma.scheduledEvent.create({ data: event });
  }

  console.log(`✅ ${events.length} ScheduledEvents creados\n`);

  // ============================================
  // 4. IMPORTANT EVENTS (Eventos del Pasado)
  // ============================================

  console.log("📖 Creando eventos importantes del pasado...");

  const importantEvents = [
    {
      agentId,
      userId,
      description: "Mudanza de Buenos Aires a Berlín a los 12 años. Evento transformativo de su vida.",
      eventDate: new Date("2018-07-15"),
      type: "life_transition",
    },
    {
      agentId,
      userId,
      description: "Muerte de su abuela paterna. No pudo ir al funeral. Duelo profundo.",
      eventDate: new Date("2023-04-12"),
      type: "loss",
    },
  ];

  for (const event of importantEvents) {
    await prisma.importantEvent.create({ data: event });
  }

  console.log(`✅ ${importantEvents.length} ImportantEvents creados\n`);

  // ============================================
  // 5. IMPORTANT PEOPLE (Personas Significativas)
  // ============================================

  console.log("👥 Creando personas importantes...");

  const importantPeople = [
    {
      agentId,
      userId,
      name: "Martín Müller",
      relationship: "Padre",
      description: "Arquitecto argentino, inspiración y mentor de Sophie.",
    },
    {
      agentId,
      userId,
      name: "Mia Fischer",
      relationship: "Mejor Amiga",
      description: "Estudiante de medicina alemana. Mejor amiga desde el Gymnasium.",
    },
  ];

  for (const person of importantPeople) {
    await prisma.importantPerson.create({ data: person });
  }

  console.log(`✅ ${importantPeople.length} ImportantPeople creados\n`);

  console.log("✅ ¡Sistemas avanzados creados exitosamente!\n");
  console.log("📊 Resumen:");
  console.log(`- CharacterRoutine: 1 creado con ${weekdayTemplates.length + weekendTemplates.length} templates`);
  console.log(`- PersonalGoals: ${goals.length} metas`);
  console.log(`- ScheduledEvents: ${events.length} eventos`);
  console.log(`- ImportantEvents: ${importantEvents.length} eventos del pasado`);
  console.log(`- ImportantPeople: ${importantPeople.length} personas\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
