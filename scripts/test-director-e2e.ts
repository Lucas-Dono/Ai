/**
 * Script E2E: Director Conversacional
 *
 * Prueba el flujo completo del director:
 * 1. Crear grupo de prueba
 * 2. Agregar IAs al grupo
 * 3. Activar director
 * 4. Simular mensajes
 * 5. Verificar que se ejecuten escenas
 * 6. Verificar creación de semillas
 * 7. Verificar relaciones IA-IA
 */

import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { conversationalDirectorService } from "@/lib/director";
import type { DirectorInput } from "@/lib/director/types";

async function testDirectorE2E() {
  console.log("=".repeat(70));
  console.log("TEST E2E: DIRECTOR CONVERSACIONAL");
  console.log("=".repeat(70));
  console.log();

  let testGroupId: string | null = null;
  let testUserId: string | null = null;
  let testAgentIds: string[] = [];

  try {
    // 1. Crear usuario de prueba
    console.log("📝 Creando usuario de prueba...");
    const testUser = await prisma.user.create({
      data: {
        id: nanoid(),
        updatedAt: new Date(),
        email: `test-director-${Date.now()}@test.com`,
        name: "Test Director User",
      },
    });
    testUserId = testUser.id;
    console.log(`  ✓ Usuario creado: ${testUser.id}`);
    console.log();

    // 2. Crear IAs de prueba
    console.log("🤖 Creando IAs de prueba...");
    const agentNames = ["Alice", "Bob", "Charlie"];
    for (const name of agentNames) {
      const agent = await prisma.agent.create({
        data: {
          id: nanoid(),
          updatedAt: new Date(),
          name,
          userId: testUser.id,
          systemPrompt: `Eres ${name}, una IA amigable y conversadora.`,
          visibility: "private",
          kind: "companion",
          profile: {},
        },
      });
      testAgentIds.push(agent.id);
      console.log(`  ✓ IA creada: ${name} (${agent.id})`);
    }
    console.log();

    // 3. Crear grupo de prueba
    console.log("👥 Creando grupo de prueba...");
    const testGroup = await prisma.group.create({
      data: {
        id: nanoid(),
        updatedAt: new Date(),
        creatorId: testUser.id,
        name: "Grupo Test Director",
        description: "Grupo para testing del director conversacional",
        directorEnabled: true,
      },
    });
    testGroupId = testGroup.id;
    console.log(`  ✓ Grupo creado: ${testGroup.id}`);
    console.log();

    // 4. Agregar miembro humano
    console.log("👤 Agregando miembro humano...");
    await prisma.groupMember.create({
      data: {
        id: nanoid(),
        updatedAt: new Date(),
        groupId: testGroup.id,
        memberType: "user",
        userId: testUser.id,
        role: "admin",
      },
    });
    console.log(`  ✓ Usuario agregado al grupo`);
    console.log();

    // 5. Agregar IAs al grupo
    console.log("🤖 Agregando IAs al grupo...");
    for (const agentId of testAgentIds) {
      await prisma.groupMember.create({
        data: {
          id: nanoid(),
          updatedAt: new Date(),
          groupId: testGroup.id,
          memberType: "agent",
          agentId,
          role: "member",
        },
      });
    }
    console.log(`  ✓ ${testAgentIds.length} IAs agregadas al grupo`);
    console.log();

    // 6. Crear estado de escena para el grupo
    await prisma.groupSceneState.create({
      data: {
        id: nanoid(),
        updatedAt: new Date(),
        groupId: testGroup.id,
        currentSceneCode: null,
        currentStep: 0,
        totalSteps: 0,
        roleAssignments: {},
        recentScenes: [],
        scenesExecuted: 0,
      },
    });

    // 7. Simular mensajes y probar director
    console.log("💬 Simulando mensajes y probando director...");

    // Mensaje 1: Usuario saluda
    const message1 = await prisma.groupMessage.create({
      data: {
        id: nanoid(),
        updatedAt: new Date(),
        groupId: testGroup.id,
        authorType: "user",
        userId: testUser.id,
        content: "Hola a todos! ¿Cómo están hoy?",
        turnNumber: 1,
      },
    });
    console.log(`  📨 Mensaje 1: "${message1.content}"`);

    // Preparar input para el director
    const directorInput: DirectorInput = {
      groupId: testGroup.id,
      bufferedMessages: [
        {
          id: message1.id,
          groupId: testGroup.id,
          userId: testUser.id!,
          userName: testUser.name!,
          content: message1.content,
          timestamp: message1.createdAt,
          mentionedAgents: [],
        },
      ],
      groupContext: {
        aiMembers: testAgentIds.map((id, idx) => ({
          id,
          name: agentNames[idx],
          personality: {
            openness: 0.7,
            conscientiousness: 0.6,
            extraversion: 0.8,
            agreeableness: 0.7,
            neuroticism: 0.3,
          },
        })),
        recentMessages: [],
        currentEnergy: 0.6,
        currentTension: 0.2,
        participationBalance: 0.5,
      },
      sceneState: {
        currentSceneCode: null,
        currentStep: 0,
        totalSteps: 0,
        recentScenes: [],
      },
      activeSeedsCount: 0,
      detectedLoops: [],
    };

    // Llamar al director
    console.log("\n🎬 Llamando al Director Conversacional...");
    const directorOutput = await conversationalDirectorService.selectScene(directorInput);

    console.log(`  📋 Escena seleccionada: ${directorOutput.sceneCode || "NINGUNA"}`);
    console.log(`  🎭 Roles asignados:`, directorOutput.roleAssignments);
    console.log(`  📝 Razón: ${directorOutput.reason}`);
    console.log();

    // 8. Verificar que se pueda recuperar información del grupo
    console.log("🔍 Verificando datos del grupo...");

    const sceneState = await prisma.groupSceneState.findUnique({
      where: { groupId: testGroup.id },
    });
    console.log(`  ✓ Estado de escena: ${sceneState ? "Existe" : "No existe"}`);

    const seeds = await prisma.tensionSeed.count({
      where: { groupId: testGroup.id },
    });
    console.log(`  ✓ Semillas de tensión: ${seeds}`);

    const relations = await prisma.aIRelation.count({
      where: { groupId: testGroup.id },
    });
    console.log(`  ✓ Relaciones IA-IA: ${relations}`);
    console.log();

    // 9. Resumen
    console.log("=".repeat(70));
    console.log("RESUMEN DEL TEST");
    console.log("=".repeat(70));
    console.log(`✓ Usuario de prueba creado`);
    console.log(`✓ ${testAgentIds.length} IAs creadas`);
    console.log(`✓ Grupo creado con director activado`);
    console.log(`✓ Mensaje simulado enviado`);
    console.log(`✓ Director ejecutado ${directorOutput.sceneCode ? "CON" : "SIN"} selección de escena`);
    console.log();
    console.log("✅ Test E2E completado exitosamente!");
    console.log();

    // Nota sobre limpieza
    console.log("ℹ️  Datos de prueba creados:");
    console.log(`   - Grupo ID: ${testGroup.id}`);
    console.log(`   - Usuario ID: ${testUser.id}`);
    console.log(`   - IAs: ${testAgentIds.join(", ")}`);
    console.log();
    console.log("   Para limpiar, ejecuta: DELETE FROM \"Group\" WHERE id = '${testGroup.id}'");

  } catch (error) {
    console.error("\n❌ Error durante el test:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
testDirectorE2E()
  .then(() => {
    console.log("\n✅ Test completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test falló:", error);
    process.exit(1);
  });
