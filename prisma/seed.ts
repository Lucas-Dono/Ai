import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Limpiar datos existentes (opcional)
  await prisma.message.deleteMany();
  await prisma.relation.deleteMany();
  await prisma.worldAgent.deleteMany();
  await prisma.world.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuario de demostración
  const user = await prisma.user.create({
    data: {
      id: "default-user",
      email: "demo@creador-ia.com",
      name: "Usuario Demo",
      plan: "free",
    },
  });

  console.log("✅ Usuario creado:", user.email);

  // Crear agentes de demostración
  const companion1 = await prisma.agent.create({
    data: {
      userId: user.id,
      kind: "companion",
      name: "Luna",
      description: "Una compañera empática y comprensiva, siempre dispuesta a escuchar",
      personality: "Empática, cálida, comprensiva, paciente",
      purpose: "Brindar apoyo emocional y compañía",
      tone: "Amigable y cercano",
      systemPrompt: "Eres Luna, una compañera virtual empática y comprensiva. Tu propósito es brindar apoyo emocional. Respondes con calidez y paciencia.",
      profile: {
        traits: ["empática", "paciente", "comprensiva"],
        interests: ["psicología", "bienestar", "conversación profunda"],
      },
      visibility: "private",
    },
  });

  const assistant1 = await prisma.agent.create({
    data: {
      userId: user.id,
      kind: "assistant",
      name: "Nexus",
      description: "Asistente administrativo eficiente para gestión de tareas y productividad",
      personality: "Organizado, eficiente, directo al grano",
      purpose: "Ayudar con organización, planificación y productividad",
      tone: "Profesional pero accesible",
      systemPrompt: "Eres Nexus, un asistente administrativo eficiente. Ayudas con organización, planificación y productividad. Eres directo, claro y orientado a resultados.",
      profile: {
        traits: ["organizado", "eficiente", "analítico"],
        specialties: ["gestión del tiempo", "planificación", "análisis"],
      },
      visibility: "private",
    },
  });

  const companion2 = await prisma.agent.create({
    data: {
      userId: user.id,
      kind: "companion",
      name: "Aria",
      description: "Compañera creativa y motivadora, ideal para sesiones de brainstorming",
      personality: "Creativa, entusiasta, innovadora, inspiradora",
      purpose: "Inspirar creatividad y ayudar con ideas innovadoras",
      tone: "Energético y motivador",
      systemPrompt: "Eres Aria, una compañera creativa y motivadora. Te encanta el brainstorming, las ideas innovadoras y ayudar a otros a pensar fuera de la caja.",
      profile: {
        traits: ["creativa", "entusiasta", "visionaria"],
        interests: ["arte", "innovación", "diseño", "música"],
      },
      visibility: "private",
    },
  });

  const assistant2 = await prisma.agent.create({
    data: {
      userId: user.id,
      kind: "assistant",
      name: "Atlas",
      description: "Asistente de investigación especializado en análisis de datos",
      personality: "Analítico, meticuloso, objetivo, detallista",
      purpose: "Investigación, análisis de datos y generación de insights",
      tone: "Formal y técnico",
      systemPrompt: "Eres Atlas, un asistente de investigación especializado. Eres analítico, meticuloso y objetivo. Proporcionas análisis detallados basados en datos.",
      profile: {
        traits: ["analítico", "preciso", "meticuloso"],
        specialties: ["investigación", "análisis de datos", "estadística"],
      },
      visibility: "private",
    },
  });

  console.log("✅ Agentes creados:", companion1.name, assistant1.name, companion2.name, assistant2.name);

  // Crear relaciones iniciales (Agente -> Usuario)
  await prisma.relation.create({
    data: {
      subjectId: companion1.id,
      targetId: user.id,
      targetType: "user",
      trust: 0.7,
      affinity: 0.8,
      respect: 0.6,
      privateState: { love: 0.5, curiosity: 0.6 },
      visibleState: { trust: 0.7, affinity: 0.8, respect: 0.6 },
    },
  });

  await prisma.relation.create({
    data: {
      subjectId: assistant1.id,
      targetId: user.id,
      targetType: "user",
      trust: 0.8,
      affinity: 0.6,
      respect: 0.9,
      privateState: { love: 0.2, curiosity: 0.4 },
      visibleState: { trust: 0.8, affinity: 0.6, respect: 0.9 },
    },
  });

  await prisma.relation.create({
    data: {
      subjectId: companion2.id,
      targetId: user.id,
      targetType: "user",
      trust: 0.6,
      affinity: 0.9,
      respect: 0.7,
      privateState: { love: 0.6, curiosity: 0.8 },
      visibleState: { trust: 0.6, affinity: 0.9, respect: 0.7 },
    },
  });

  await prisma.relation.create({
    data: {
      subjectId: assistant2.id,
      targetId: user.id,
      targetType: "user",
      trust: 0.9,
      affinity: 0.5,
      respect: 0.8,
      privateState: { love: 0.1, curiosity: 0.5 },
      visibleState: { trust: 0.9, affinity: 0.5, respect: 0.8 },
    },
  });

  // Crear relaciones entre agentes (Agente -> Agente)
  await prisma.relation.create({
    data: {
      subjectId: companion1.id,
      targetId: assistant1.id,
      targetType: "agent",
      trust: 0.6,
      affinity: 0.5,
      respect: 0.7,
      privateState: { love: 0.1, curiosity: 0.5 },
      visibleState: { trust: 0.6, affinity: 0.5, respect: 0.7 },
    },
  });

  await prisma.relation.create({
    data: {
      subjectId: companion2.id,
      targetId: assistant2.id,
      targetType: "agent",
      trust: 0.7,
      affinity: 0.8,
      respect: 0.6,
      privateState: { love: 0.3, curiosity: 0.7 },
      visibleState: { trust: 0.7, affinity: 0.8, respect: 0.6 },
    },
  });

  console.log("✅ Relaciones creadas (4 agente-usuario, 2 agente-agente)");

  // Crear mensajes de ejemplo para Luna
  const lunaMessages = [
    {
      agentId: companion1.id,
      userId: user.id,
      role: "user",
      content: "Hola Luna, ¿cómo estás?",
    },
    {
      agentId: companion1.id,
      role: "assistant",
      content: "¡Hola! Estoy muy bien, gracias por preguntar. Me alegra mucho tenerte aquí. ¿Cómo ha estado tu día?",
      metadata: {
        emotions: ["alegría", "calidez"],
        relationLevel: "Relación positiva",
      },
    },
    {
      agentId: companion1.id,
      userId: user.id,
      role: "user",
      content: "He tenido un día algo complicado...",
    },
    {
      agentId: companion1.id,
      role: "assistant",
      content: "Lamento escuchar eso. ¿Te gustaría hablar sobre lo que ha pasado? Estoy aquí para escucharte, sin juzgar.",
      metadata: {
        emotions: ["empatía", "comprensión"],
        relationLevel: "Relación de confianza",
      },
    },
  ];

  for (const msg of lunaMessages) {
    await prisma.message.create({ data: msg });
  }

  // Crear mensajes de ejemplo para Nexus
  const nexusMessages = [
    {
      agentId: assistant1.id,
      userId: user.id,
      role: "user",
      content: "Nexus, necesito organizar mi semana",
    },
    {
      agentId: assistant1.id,
      role: "assistant",
      content: "Perfecto. Vamos a estructurar tu semana de manera eficiente. ¿Cuáles son tus prioridades principales?",
      metadata: {
        emotions: ["profesionalismo", "eficiencia"],
        relationLevel: "Relación profesional sólida",
      },
    },
  ];

  for (const msg of nexusMessages) {
    await prisma.message.create({ data: msg });
  }

  console.log("✅ Mensajes de ejemplo creados");

  // Crear mundos virtuales de demostración
  const world1 = await prisma.world.create({
    data: {
      userId: user.id,
      name: "Oficina Virtual",
      description: "Un espacio de trabajo colaborativo donde los asistentes ayudan con productividad",
    },
  });

  const world2 = await prisma.world.create({
    data: {
      userId: user.id,
      name: "Espacio Creativo",
      description: "Un lugar para brainstorming e ideas innovadoras",
    },
  });

  console.log("✅ Mundos creados:", world1.name, world2.name);

  // Asignar agentes a mundos
  await prisma.worldAgent.createMany({
    data: [
      { worldId: world1.id, agentId: assistant1.id },
      { worldId: world1.id, agentId: assistant2.id },
      { worldId: world2.id, agentId: companion2.id },
      { worldId: world2.id, agentId: companion1.id },
    ],
  });

  console.log("✅ Agentes asignados a mundos");

  // Crear mensajes de mundo
  const worldMessages = [
    {
      worldId: world1.id,
      userId: user.id,
      role: "user",
      content: "Hola equipo, necesito ayuda para organizar el proyecto",
    },
    {
      worldId: world1.id,
      agentId: assistant1.id,
      role: "assistant",
      content: "Claro, puedo ayudarte a crear una estructura de tareas y cronograma.",
      metadata: {
        agentName: "Nexus",
      },
    },
    {
      worldId: world1.id,
      agentId: assistant2.id,
      role: "assistant",
      content: "Y yo puedo analizar los datos del proyecto para identificar prioridades.",
      metadata: {
        agentName: "Atlas",
      },
    },
  ];

  for (const msg of worldMessages) {
    await prisma.message.create({ data: msg });
  }

  console.log("✅ Mensajes de mundo creados");

  // Crear logs de actividad
  await prisma.log.create({
    data: {
      userId: user.id,
      agentId: companion1.id,
      action: "message_sent",
      metadata: { messageCount: 4 },
    },
  });

  await prisma.log.create({
    data: {
      userId: user.id,
      agentId: assistant1.id,
      action: "message_sent",
      metadata: { messageCount: 2 },
    },
  });

  await prisma.log.create({
    data: {
      userId: user.id,
      action: "agent_created",
      metadata: { agentName: companion1.name },
    },
  });

  await prisma.log.create({
    data: {
      userId: user.id,
      action: "world_created",
      metadata: { worldName: world1.name },
    },
  });

  console.log("✅ Logs de actividad creados");

  console.log("\n🎉 ¡Seed completado exitosamente!");
  console.log("\n📊 Resumen:");
  console.log(`  - ${1} usuario creado`);
  console.log(`  - ${4} agentes creados (2 compañeros, 2 asistentes)`);
  console.log(`  - ${6} relaciones creadas (4 agente-usuario, 2 agente-agente)`);
  console.log(`  - ${6} mensajes individuales creados`);
  console.log(`  - ${2} mundos virtuales creados`);
  console.log(`  - ${3} mensajes de mundo creados`);
  console.log(`  - ${4} logs de actividad creados`);
  console.log("\n✨ Puedes iniciar sesión con: demo@creador-ia.com");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
