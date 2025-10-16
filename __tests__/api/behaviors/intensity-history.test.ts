/**
 * INTEGRATION TESTS - GET /api/agents/[id]/behaviors/intensity-history
 *
 * Tests para el endpoint que obtiene datos históricos de intensidad.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { BehaviorType } from "@prisma/client";
import { GET } from "@/app/api/agents/[id]/behaviors/intensity-history/route";
import { NextRequest } from "next/server";

describe("GET /api/agents/[id]/behaviors/intensity-history", () => {
  let testAgentId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Cleanup previous test data
    const existingUser = await prisma.user.findUnique({
      where: { id: "test-user-intensity" },
    });

    if (existingUser) {
      await prisma.behaviorTriggerLog.deleteMany({
        where: { message: { userId: existingUser.id } },
      });
      await prisma.message.deleteMany({ where: { userId: existingUser.id } });
      await prisma.behaviorProgressionState.deleteMany({
        where: { agent: { userId: existingUser.id } },
      });
      await prisma.behaviorProfile.deleteMany({
        where: { agent: { userId: existingUser.id } },
      });
      await prisma.agent.deleteMany({ where: { userId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });
    }

    // Create test data
    const testUser = await prisma.user.create({
      data: {
        id: "test-user-intensity",
        email: "test-intensity@test.com",
        name: "Test User Intensity",
      },
    });
    testUserId = testUser.id;

    const testAgent = await prisma.agent.create({
      data: {
        userId: testUserId,
        kind: "companion",
        name: "Test Agent Intensity",
        description: "Test",
        personality: "Test",
        systemPrompt: "Test",
        profile: { age: 25, background: "Test" },
      },
    });
    testAgentId = testAgent.id;

    // Create behavior profile
    await prisma.behaviorProfile.create({
      data: {
        agentId: testAgentId,
        behaviorType: BehaviorType.YANDERE_OBSESSIVE,
        baseIntensity: 0.3,
        escalationRate: 0.1,
        deEscalationRate: 0.05,
        currentPhase: 2,
        volatility: 0.5,
        thresholdForDisplay: 0.3,
        triggers: [],
        createdAt: new Date("2024-01-01"),
      },
    });

    // Create messages and triggers for history
    const msg1 = await prisma.message.create({
      data: {
        agentId: testAgentId,
        userId: testUserId,
        content: "Test message 1",
        role: "user",
        createdAt: new Date("2024-01-02"),
      },
    });

    const msg2 = await prisma.message.create({
      data: {
        agentId: testAgentId,
        userId: testUserId,
        content: "Test message 2",
        role: "user",
        createdAt: new Date("2024-01-03"),
      },
    });

    await prisma.behaviorTriggerLog.create({
      data: {
        messageId: msg1.id,
        triggerType: "abandonment_signal",
        behaviorType: BehaviorType.YANDERE_OBSESSIVE,
        weight: 0.7,
        detectedText: "Test",
        createdAt: new Date("2024-01-02"),
      },
    });

    await prisma.behaviorTriggerLog.create({
      data: {
        messageId: msg2.id,
        triggerType: "criticism",
        behaviorType: BehaviorType.YANDERE_OBSESSIVE,
        weight: 0.8,
        detectedText: "Test",
        createdAt: new Date("2024-01-03"),
      },
    });
  });

  afterAll(async () => {
    if (testAgentId) {
      await prisma.behaviorTriggerLog.deleteMany({
        where: { message: { agentId: testAgentId } },
      });
      await prisma.message.deleteMany({ where: { agentId: testAgentId } });
      await prisma.behaviorProgressionState.deleteMany({
        where: { agentId: testAgentId },
      });
      await prisma.behaviorProfile.deleteMany({
        where: { agentId: testAgentId },
      });
      await prisma.agent.delete({ where: { id: testAgentId } });
    }

    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
  });

  it("should return intensity history with data points", async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/agents/${testAgentId}/behaviors/intensity-history`
    );
    const response = await GET(req, { params: { id: testAgentId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("behaviors");
    expect(data).toHaveProperty("metadata");

    // Validar estructura de data
    expect(data.data).toHaveLength(1); // Solo un behavior type
    expect(data.data[0].behaviorType).toBe("YANDERE_OBSESSIVE");
    expect(data.data[0]).toHaveProperty("data");
    expect(data.data[0]).toHaveProperty("currentIntensity");
    expect(data.data[0]).toHaveProperty("totalDataPoints");

    // Validar data points
    expect(data.data[0].data.length).toBeGreaterThan(0);
    expect(data.data[0].data[0]).toHaveProperty("timestamp");
    expect(data.data[0].data[0]).toHaveProperty("intensity");
    expect(data.data[0].data[0]).toHaveProperty("phase");

    // Validar behaviors
    expect(data.behaviors).toHaveLength(1);
    expect(data.behaviors[0].type).toBe("YANDERE_OBSESSIVE");
    expect(data.behaviors[0].baseIntensity).toBe(0.3);

    // Validar metadata
    expect(data.metadata.totalTriggers).toBe(2);
    expect(data.metadata.dateRange).toHaveProperty("start");
    expect(data.metadata.dateRange).toHaveProperty("end");
  });

  it("should return 404 for non-existent agent", async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/agents/fake-id/behaviors/intensity-history`
    );
    const response = await GET(req, { params: { id: "fake-id" } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Agent not found");
  });

  it("should return empty data for agent with no behaviors", async () => {
    const emptyAgent = await prisma.agent.create({
      data: {
        userId: testUserId,
        kind: "assistant",
        name: "Empty Agent",
        description: "No behaviors",
        personality: "Test",
        systemPrompt: "Test",
        profile: { age: 30 },
      },
    });

    const req = new NextRequest(
      `http://localhost:3000/api/agents/${emptyAgent.id}/behaviors/intensity-history`
    );
    const response = await GET(req, { params: { id: emptyAgent.id } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    expect(data.behaviors).toEqual([]);

    await prisma.agent.delete({ where: { id: emptyAgent.id } });
  });

  it("should calculate intensity changes based on triggers", async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/agents/${testAgentId}/behaviors/intensity-history`
    );
    const response = await GET(req, { params: { id: testAgentId } });
    const data = await response.json();

    const dataPoints = data.data[0].data;

    // First point should be base intensity
    expect(dataPoints[0].intensity).toBe(0.3);

    // Subsequent points should show intensity increase
    expect(dataPoints[1].intensity).toBeGreaterThan(0.3);
    expect(dataPoints[2].intensity).toBeGreaterThan(dataPoints[1].intensity);

    // Intensities should be clamped between 0 and 1
    dataPoints.forEach((point: any) => {
      expect(point.intensity).toBeGreaterThanOrEqual(0);
      expect(point.intensity).toBeLessThanOrEqual(1);
    });
  });
});
