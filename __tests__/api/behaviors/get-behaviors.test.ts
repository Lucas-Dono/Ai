/**
 * INTEGRATION TESTS - GET /api/agents/[id]/behaviors
 *
 * Tests para el endpoint que obtiene información detallada de behaviors.
 * Valida la estructura de datos, cálculos estadísticos, y casos edge.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { BehaviorType } from "@prisma/client";
import { GET } from "@/app/api/agents/[id]/behaviors/route";
import { NextRequest } from "next/server";

describe("GET /api/agents/[id]/behaviors", () => {
  let testAgentId: string;
  let testUserId: string;
  let testBehaviorProfileId: string;

  beforeAll(async () => {
    // Limpiar cualquier dato anterior del test (en caso de fallo previo)
    const existingUser = await prisma.user.findUnique({
      where: { id: "test-user-behaviors-get" },
    });

    if (existingUser) {
      // Delete related data first
      await prisma.behaviorTriggerLog.deleteMany({
        where: {
          message: {
            userId: existingUser.id,
          },
        },
      });

      await prisma.message.deleteMany({
        where: { userId: existingUser.id },
      });

      await prisma.behaviorProgressionState.deleteMany({
        where: {
          agent: {
            userId: existingUser.id,
          },
        },
      });

      await prisma.behaviorProfile.deleteMany({
        where: {
          agent: {
            userId: existingUser.id,
          },
        },
      });

      await prisma.agent.deleteMany({
        where: { userId: existingUser.id },
      });

      await prisma.user.delete({
        where: { id: existingUser.id },
      });
    }

    // Crear datos de test en DB
    const testUser = await prisma.user.create({
      data: {
        id: "test-user-behaviors-get",
        email: "test-behaviors-get@test.com",
        name: "Test User",
      },
    });
    testUserId = testUser.id;

    const testAgent = await prisma.agent.create({
      data: {
        userId: testUserId,
        kind: "companion",
        name: "Test Agent for Behaviors GET",
        description: "Test agent",
        personality: "Test personality",
        systemPrompt: "Test prompt",
        profile: { age: 25, background: "Test" },
        nsfwMode: true,
      },
    });
    testAgentId = testAgent.id;

    // Crear BehaviorProfile
    const behaviorProfile = await prisma.behaviorProfile.create({
      data: {
        agentId: testAgentId,
        behaviorType: BehaviorType.YANDERE_OBSESSIVE,
        baseIntensity: 0.5,
        escalationRate: 0.1,
        deEscalationRate: 0.05,
        currentPhase: 3,
        volatility: 0.5,
        thresholdForDisplay: 0.4,
        triggers: [],
        phaseHistory: [
          {
            phase: 1,
            startedAt: new Date("2024-01-01").toISOString(),
            endedAt: new Date("2024-01-10").toISOString(),
            interactions: 20,
            triggers: ["delayed_response"],
          },
          {
            phase: 2,
            startedAt: new Date("2024-01-10").toISOString(),
            endedAt: new Date("2024-01-20").toISOString(),
            interactions: 30,
            triggers: ["abandonment_signal", "criticism"],
          },
        ],
        interactionsSincePhaseStart: 45,
      },
    });
    testBehaviorProfileId = behaviorProfile.id;

    // Crear BehaviorProgressionState
    await prisma.behaviorProgressionState.create({
      data: {
        agentId: testAgentId,
        totalInteractions: 95,
        positiveInteractions: 60,
        negativeInteractions: 35,
        currentIntensities: {
          YANDERE_OBSESSIVE: 0.65,
        },
      },
    });

    // Crear mensajes y triggers para historial
    const message1 = await prisma.message.create({
      data: {
        agentId: testAgentId,
        userId: testUserId,
        content: "Necesito espacio",
        role: "user",
      },
    });

    const message2 = await prisma.message.create({
      data: {
        agentId: testAgentId,
        userId: testUserId,
        content: "Eres muy intenso",
        role: "user",
      },
    });

    await prisma.behaviorTriggerLog.create({
      data: {
        messageId: message1.id,
        triggerType: "abandonment_signal",
        behaviorType: BehaviorType.YANDERE_OBSESSIVE,
        weight: 0.7,
        detectedText: "Necesito espacio",
      },
    });

    await prisma.behaviorTriggerLog.create({
      data: {
        messageId: message2.id,
        triggerType: "criticism",
        behaviorType: BehaviorType.YANDERE_OBSESSIVE,
        weight: 0.8,
        detectedText: "muy intenso",
      },
    });
  });

  afterAll(async () => {
    // Limpiar datos de test - check if IDs exist first
    if (testAgentId) {
      await prisma.behaviorTriggerLog.deleteMany({
        where: {
          message: {
            agentId: testAgentId,
          },
        },
      });

      await prisma.message.deleteMany({
        where: { agentId: testAgentId },
      });

      await prisma.behaviorProgressionState.deleteMany({
        where: { agentId: testAgentId },
      });

      await prisma.behaviorProfile.deleteMany({
        where: { agentId: testAgentId },
      });

      await prisma.agent.delete({
        where: { id: testAgentId },
      });
    }

    if (testUserId) {
      await prisma.user.delete({
        where: { id: testUserId },
      }).catch(() => {
        // User might not exist if test failed early
      });
    }
  });

  it("should return complete behavior data for valid agent", async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/agents/${testAgentId}/behaviors`
    );
    const response = await GET(req, { params: { id: testAgentId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("agent");
    expect(data).toHaveProperty("behaviorProfiles");
    expect(data).toHaveProperty("progressionState");
    expect(data).toHaveProperty("triggerHistory");
    expect(data).toHaveProperty("stats");

    // Validar estructura de agent
    expect(data.agent.id).toBe(testAgentId);
    expect(data.agent.name).toBe("Test Agent for Behaviors GET");
    expect(data.agent.nsfwMode).toBe(true);

    // Validar behaviorProfiles
    expect(data.behaviorProfiles).toHaveLength(1);
    expect(data.behaviorProfiles[0].behaviorType).toBe("YANDERE_OBSESSIVE");
    expect(data.behaviorProfiles[0].baseIntensity).toBe(0.5);
    expect(data.behaviorProfiles[0].currentPhase).toBe(3);
    expect(data.behaviorProfiles[0].phaseHistory).toHaveLength(2);

    // Validar progressionState
    expect(data.progressionState.totalInteractions).toBe(95);
    expect(data.progressionState.positiveInteractions).toBe(60);
    expect(data.progressionState.negativeInteractions).toBe(35);
    expect(data.progressionState.currentIntensities).toHaveProperty(
      "YANDERE_OBSESSIVE"
    );

    // Validar triggerHistory
    expect(data.triggerHistory).toHaveLength(2);
    expect(data.triggerHistory[0]).toHaveProperty("triggerType");
    expect(data.triggerHistory[0]).toHaveProperty("weight");
    expect(data.triggerHistory[0]).toHaveProperty("message");

    // Validar stats
    expect(data.stats.totalTriggers).toBe(2);
    expect(data.stats).toHaveProperty("triggersByType");
    expect(data.stats).toHaveProperty("triggersByBehavior");
    expect(data.stats.averageWeight).toBeCloseTo(0.75, 2); // (0.7 + 0.8) / 2
  });

  it("should return 404 for non-existent agent", async () => {
    const fakeAgentId = "non-existent-agent-id";
    const req = new NextRequest(
      `http://localhost:3000/api/agents/${fakeAgentId}/behaviors`
    );
    const response = await GET(req, { params: { id: fakeAgentId } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Agent not found");
  });

  it("should handle agent with no behaviors gracefully", async () => {
    // Crear agente sin behaviors
    const emptyAgent = await prisma.agent.create({
      data: {
        userId: testUserId,
        kind: "assistant",
        name: "Empty Agent",
        description: "No behaviors",
        personality: "Test",
        systemPrompt: "Test",
        profile: { age: 30, background: "Test" },
      },
    });

    const req = new NextRequest(
      `http://localhost:3000/api/agents/${emptyAgent.id}/behaviors`
    );
    const response = await GET(req, { params: { id: emptyAgent.id } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.behaviorProfiles).toHaveLength(0);
    expect(data.progressionState).toBeNull();
    expect(data.triggerHistory).toHaveLength(0);
    expect(data.stats.totalTriggers).toBe(0);
    expect(data.stats.averageWeight).toBe(0);

    // Cleanup
    await prisma.agent.delete({ where: { id: emptyAgent.id } });
  });

  it("should correctly calculate trigger statistics", async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/agents/${testAgentId}/behaviors`
    );
    const response = await GET(req, { params: { id: testAgentId } });
    const data = await response.json();

    // Verificar triggersByType
    expect(data.stats.triggersByType).toHaveProperty("abandonment_signal");
    expect(data.stats.triggersByType).toHaveProperty("criticism");
    expect(data.stats.triggersByType.abandonment_signal).toBe(1);
    expect(data.stats.triggersByType.criticism).toBe(1);

    // Verificar triggersByBehavior
    expect(data.stats.triggersByBehavior).toHaveProperty("YANDERE_OBSESSIVE");
    expect(data.stats.triggersByBehavior.YANDERE_OBSESSIVE).toBe(2);

    // Verificar average weight
    expect(data.stats.averageWeight).toBeGreaterThan(0);
    expect(data.stats.averageWeight).toBeLessThan(1);
  });

  it("should format phase history correctly", async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/agents/${testAgentId}/behaviors`
    );
    const response = await GET(req, { params: { id: testAgentId } });
    const data = await response.json();

    const phaseHistory = data.behaviorProfiles[0].phaseHistory;

    expect(phaseHistory[0]).toHaveProperty("phase");
    expect(phaseHistory[0]).toHaveProperty("startedAt");
    expect(phaseHistory[0]).toHaveProperty("endedAt");
    expect(phaseHistory[0]).toHaveProperty("interactions");
    expect(phaseHistory[0]).toHaveProperty("triggers");

    expect(phaseHistory[0].phase).toBe(1);
    expect(phaseHistory[0].interactions).toBe(20);
    expect(phaseHistory[0].triggers).toContain("delayed_response");

    expect(phaseHistory[1].phase).toBe(2);
    expect(phaseHistory[1].interactions).toBe(30);
    expect(phaseHistory[1].triggers).toHaveLength(2);
  });
});
