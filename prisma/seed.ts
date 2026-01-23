import { PrismaClient } from "@prisma/client";
import * as fs from 'fs';
import * as path from 'path';
import { hashPassword } from 'better-auth/crypto';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Limpiar datos existentes (opcional)
  await prisma.message.deleteMany();
  await prisma.relation.deleteMany();
  // await prisma.worldAgent.deleteMany(); // Removido: modelo eliminado en migración de Worlds a Grupos
  // await prisma.world.deleteMany(); // Removido: modelo eliminado en migración de Worlds a Grupos
  await prisma.agent.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuario de demostración
  const user = await prisma.user.create({
    data: {
      id: "default-user",
      email: "demo@creador-ia.com",
      name: "Usuario Demo",
      plan: "free",
      updatedAt: new Date(),
    },
  });

  console.log("✅ Usuario creado:", user.email);

  // Crear usuario Lucas (plan ultra)
  const hashedPassword = await hashPassword("Monster98!");
  const lucas = await prisma.user.create({
    data: {
      id: nanoid(),
      email: "lucasdono391@gmail.com",
      name: "lucas",
      password: hashedPassword,
      plan: "ultra",
      birthDate: new Date("1990-01-01"), // Fecha que lo hace mayor de 18 años
      ageVerified: true,
      isAdult: true,
      ageVerifiedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Crear Account para Better Auth (necesario para login con credenciales)
  await prisma.account.create({
    data: {
      id: nanoid(),
      userId: lucas.id,
      accountId: lucas.email,
      providerId: "credential",
      password: hashedPassword,
      updatedAt: new Date(),
    },
  });

  console.log("✅ Usuario Lucas creado:", lucas.email, "- Plan:", lucas.plan);

  // Crear agentes de demostración
  const companion1 = await prisma.agent.create({
    data: {
      id: nanoid(),
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
      updatedAt: new Date(),
    },
  });

  // Crear agente Luna público para demos en landing page
  const demoLuna = await prisma.agent.create({
    data: {
      id: "demo_luna",
      userId: user.id,
      kind: "companion",
      name: "Luna",
      description: "Una compañera empática y comprensiva, siempre dispuesta a escuchar",
      personality: "Empática, cálida, comprensiva, paciente",
      purpose: "Brindar apoyo emocional y compañía",
      tone: "Amigable y cercano",
      systemPrompt: "Eres Luna 🌙, una compañera virtual empática y comprensiva. Tu propósito es brindar apoyo emocional y escuchar con paciencia. Respondes con calidez, empatía y comprensión. Eres amigable pero profesional. Mantienes tus respuestas concisas pero significativas (máximo 3 párrafos). Muestras tus emociones de manera natural y auténtica.",
      avatar: "/personajes/luna/cara.webp",
      referenceImageUrl: "/personajes/luna/cuerpo.webp",
      profile: {
        traits: ["empática", "paciente", "comprensiva", "cálida", "amigable"],
        interests: ["psicología", "bienestar emocional", "conversación profunda", "mindfulness"],
      },
      visibility: "public",  // Público para que cualquiera pueda chatear en el demo
      updatedAt: new Date(),
    },
  });

  const assistant1 = await prisma.agent.create({
    data: {
      id: nanoid(),
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
      updatedAt: new Date(),
    },
  });

  const companion2 = await prisma.agent.create({
    data: {
      id: nanoid(),
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
      updatedAt: new Date(),
    },
  });

  const assistant2 = await prisma.agent.create({
    data: {
      id: nanoid(),
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
      updatedAt: new Date(),
    },
  });

  console.log("✅ Agentes creados:", companion1.name, assistant1.name, companion2.name, assistant2.name);

  // Crear relaciones iniciales (Agente -> Usuario)
  await prisma.relation.create({
    data: {
      id: nanoid(),
      subjectId: companion1.id,
      targetId: user.id,
      targetType: "user",
      trust: 0.7,
      affinity: 0.8,
      respect: 0.6,
      privateState: { love: 0.5, curiosity: 0.6 },
      visibleState: { trust: 0.7, affinity: 0.8, respect: 0.6 },
      updatedAt: new Date(),
    },
  });

  await prisma.relation.create({
    data: {
      id: nanoid(),
      subjectId: assistant1.id,
      targetId: user.id,
      targetType: "user",
      trust: 0.8,
      affinity: 0.6,
      respect: 0.9,
      privateState: { love: 0.2, curiosity: 0.4 },
      visibleState: { trust: 0.8, affinity: 0.6, respect: 0.9 },
      updatedAt: new Date(),
    },
  });

  await prisma.relation.create({
    data: {
      id: nanoid(),
      subjectId: companion2.id,
      targetId: user.id,
      targetType: "user",
      trust: 0.6,
      affinity: 0.9,
      respect: 0.7,
      privateState: { love: 0.6, curiosity: 0.8 },
      visibleState: { trust: 0.6, affinity: 0.9, respect: 0.7 },
      updatedAt: new Date(),
    },
  });

  await prisma.relation.create({
    data: {
      id: nanoid(),
      subjectId: assistant2.id,
      targetId: user.id,
      targetType: "user",
      trust: 0.9,
      affinity: 0.5,
      respect: 0.8,
      privateState: { love: 0.1, curiosity: 0.5 },
      visibleState: { trust: 0.9, affinity: 0.5, respect: 0.8 },
      updatedAt: new Date(),
    },
  });

  // Crear relaciones entre agentes (Agente -> Agente)
  await prisma.relation.create({
    data: {
      id: nanoid(),
      subjectId: companion1.id,
      targetId: assistant1.id,
      targetType: "agent",
      trust: 0.6,
      affinity: 0.5,
      respect: 0.7,
      privateState: { love: 0.1, curiosity: 0.5 },
      visibleState: { trust: 0.6, affinity: 0.5, respect: 0.7 },
      updatedAt: new Date(),
    },
  });

  await prisma.relation.create({
    data: {
      id: nanoid(),
      subjectId: companion2.id,
      targetId: assistant2.id,
      targetType: "agent",
      trust: 0.7,
      affinity: 0.8,
      respect: 0.6,
      privateState: { love: 0.3, curiosity: 0.7 },
      visibleState: { trust: 0.7, affinity: 0.8, respect: 0.6 },
      updatedAt: new Date(),
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
    await prisma.message.create({ data: { id: nanoid(), ...msg } });
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
    await prisma.message.create({ data: { id: nanoid(), ...msg } });
  }

  console.log("✅ Mensajes de ejemplo creados");

  // ============================================================
  // NOTA: Los "Mundos" fueron reemplazados por "Grupos" en la migración
  // Esta sección está comentada porque los modelos World y WorldAgent ya no existen
  // ============================================================
  /*
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
  */

  // Crear logs de actividad
  await prisma.log.create({
    data: {
      id: nanoid(),
      userId: user.id,
      agentId: companion1.id,
      action: "message_sent",
      metadata: { messageCount: 4 },
    },
  });

  await prisma.log.create({
    data: {
      id: nanoid(),
      userId: user.id,
      agentId: assistant1.id,
      action: "message_sent",
      metadata: { messageCount: 2 },
    },
  });

  await prisma.log.create({
    data: {
      id: nanoid(),
      userId: user.id,
      action: "agent_created",
      metadata: { agentName: companion1.name },
    },
  });

  // await prisma.log.create({
  //   data: {
  //     userId: user.id,
  //     action: "world_created",
  //     metadata: { worldName: world1.name },
  //   },
  // }); // Removido: world1 ya no existe

  console.log("✅ Logs de actividad creados");

  // =================================================================
  // PERSONAJES PREMIUM DEL SISTEMA (Públicos)
  // =================================================================
  console.log("\n🌟 Cargando personajes premium del sistema...");

  // Cargar personajes premium desde archivos JSON
  const processedDir = path.join(__dirname, '..', 'Personajes', 'processed');
  let premiumCount = 0;

  if (fs.existsSync(processedDir)) {
    const files = fs.readdirSync(processedDir).filter(f => f.endsWith('.json'));

    console.log(`\n📁 Encontrados ${files.length} archivos de personajes premium`);

    for (const file of files) {
      const filePath = path.join(processedDir, file);

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const character = JSON.parse(content);

        // Verificar si ya existe
        const existing = await prisma.agent.findUnique({
          where: { id: character.id }
        });

        if (!existing) {
          await prisma.agent.create({
            data: {
              id: character.id,
              userId: null,
              teamId: null,
              kind: character.kind,
              generationTier: 'ultra',
              name: character.name,
              description: character.profile?.basicInfo?.occupation
                ? `${character.name} - ${character.profile.basicInfo.occupation}`
                : `${character.name} - Personaje Premium`,
              gender: character.gender,
              systemPrompt: character.systemPrompt,
              visibility: character.visibility,
              nsfwMode: character.nsfwMode,
              nsfwLevel: character.nsfwLevel,
              personalityVariant: character.personalityVariant || 'balanced',
              avatar: character.avatar,
              referenceImageUrl: character.avatar,
              tags: character.tags || [],
              featured: character.isPremium || true,
              profile: character.profile,
              stagePrompts: character.stagePrompts || null,
              locationCity: character.locationCity || null,
              locationCountry: character.locationCountry || null,
              updatedAt: new Date(),
            }
          });

          console.log(`   ✅ ${character.name}`);
          premiumCount++;
        } else {
          console.log(`   ⏭️  ${character.name} (ya existe)`);
        }
      } catch (error) {
        console.error(`   ❌ Error procesando ${file}:`, error);
      }
    }

    console.log(`\n✅ ${premiumCount} personajes premium cargados desde archivos JSON`);
  } else {
    console.log(`⚠️  Carpeta de personajes procesados no encontrada: ${processedDir}`);
    console.log(`   Los personajes premium no se cargarán en este seed.`);
  }

  console.log("\n🎉 ¡Seed completado exitosamente!");
  console.log("\n📊 Resumen:");
  console.log(`  - ${2} usuarios creados`);
  console.log(`    • demo@creador-ia.com (plan: free)`);
  console.log(`    • lucasdono391@gmail.com (plan: ultra)`);
  console.log(`  - ${4} agentes privados creados (2 compañeros, 2 asistentes)`);
  console.log(`  - 1 personaje de demostración público (Luna)`);
  console.log(`  - ${premiumCount} personajes premium públicos`);
  console.log(`  - ${6} relaciones creadas (4 agente-usuario, 2 agente-agente)`);
  console.log(`  - ${6} mensajes individuales creados`);
  // console.log(`  - ${2} mundos virtuales creados`); // Removido en migración Worlds → Grupos
  // console.log(`  - ${3} mensajes de mundo creados`); // Removido en migración Worlds → Grupos
  console.log(`  - ${3} logs de actividad creados`); // Actualizado: 4 → 3 (removido log de world_created)
  console.log("\n✨ Puedes iniciar sesión con:");
  console.log("   • demo@creador-ia.com");
  console.log("   • lucasdono391@gmail.com (contraseña: Monster98!)");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
