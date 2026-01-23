/**
 * INTEGRATION TESTS - POST /api/agents/[id]/behaviors/reset
 *
 * Tests para el endpoint que resetea todos los behaviors de un agente.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { BehaviorType } from "@prisma/client";
import { POST } from "@/app/api/agents/[id]/behaviors/reset/route";
import { NextRequest } from "next/server";
import { nanoid } from "nanoid";

describe("POST /api/agents/[id]/behaviors/reset", () => {
  let testAgentId: string;
  let testUserId: string;

  beforeAll(async () => {
    const existingUser = await prisma.user.findUnique({
      where: { id: "test-user-reset" },
    });

    if (existingUser) {
      await prisma.behaviorTriggerLog.deleteMany({
        where: { Message: { userId: existingUser.id } },
      });
      await prisma.message.deleteMany({ where: { userId: existingUser.id } });
      await prisma.behaviorProgressionState.deleteMany({
        where: { Agent: { userId: existingUser.id } },
      });
      await prisma.behaviorProfile.deleteMany({
        where: { Agent: { userId: existingUser.id } },
      });
      await prisma.agent.deleteMany({ where: { userId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });
    }

    const testUser = await prisma.user.create({
      data: {
        id: "test-user-reset",
        email: "test-reset@test.com",
        name: "Test User Reset",
        updatedAt: new Date(),
      },
    });
    testUserId = testUser.id;

    const testAgent = await prisma.agent.create({
      data: {
        id: nanoid(),
        userId: testUserId,
        kind: "companion",
        name: "Test Agent Reset",
        description: "Test",
        personality: "Test",
        systemPrompt: "Test",
        profile: { age: 25 },
        updatedAt: new Date(),
      },
    });
    testAgentId = testAgent.id;
  });

  afterAll(async () => {
    if (testAgentId) {
      await prisma.behaviorTriggerLog.deleteMany({
        where: { Message: { agentId: testAgentId } },
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

  it("should reset all behaviors and progression state", async () => {
    // Create behaviors and progression state
    await prisma.behaviorProfile.create({
      data: {
        id: nanoid(),
        agentId: testAgentId,
        behaviorType: BehaviorType.YANDERE_OBSESSIVE,
        baseIntensity: 0.5,
        escalationRate: 0.1,
        deEscalationRate: 0.05,
        currentPhase: 3,
        volatility: 0.5,
        thresholdForDisplay: 0.3,
        triggers: [],
        updatedAt: new Date(),
      },
    });

    await prisma.behaviorProgressionState.create({
      data: {
        id: nanoid(),
        agentId: testAgentId,
        totalInteractions: 100,
        positiveInteractions: 60,
        negativeInteractions: 40,
        currentIntensities: { YANDERE_OBSESSIVE: 0.7 },
        updatedAt: new Date(),
      },
    });

    // Verify data exists before reset
    const beforeProfiles = await prisma.behaviorProfile.count({
      where: { agentId: testAgentId },
    });
    expect(beforeProfiles).toBe(1);

    // Execute reset
    const req = new NextRequest(
      `http://localhost:3000/api/agents/${testAgentId}/behaviors/reset`,
      { method: "POST" }
    );
    const response = await POST(req, { params: Promise.resolve({ id: testAgentId }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain("Test Agent Reset");
    expect(data.agentId).toBe(testAgentId);

    // Verify behaviors were deleted
    const afterProfiles = await prisma.behaviorProfile.count({
      where: { agentId: testAgentId },
    });
    expect(afterProfiles).toBe(0);

    // Verify progression state was reset
    const progressionState = await prisma.behaviorProgressionState.findUnique({
      where: { agentId: testAgentId },
    });
    expect(progressionState?.totalInteractions).toBe(0);
    expect(progressionState?.positiveInteractions).toBe(0);
    expect(progressionState?.negativeInteractions).toBe(0);
    expect(progressionState?.currentIntensities).toEqual({});
  });

  it("should return 404 for non-existent agent", async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/agents/fake-id/behaviors/reset`,
      { method: "POST" }
    );
    const response = await POST(req, { params: Promise.resolve({ id: "fake-id" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Agent not found");
  });

  it("should handle agent with no behaviors gracefully", async () => {
    const emptyAgent = await prisma.agent.create({
      data: {
        id: nanoid(),
        userId: testUserId,
        kind: "assistant",
        name: "Empty Agent",
        description: "No behaviors",
        personality: "Test",
        systemPrompt: "Test",
        profile: { age: 30 },
        updatedAt: new Date(),
      },
    });

    const req = new NextRequest(
      `http://localhost:3000/api/agents/${emptyAgent.id}/behaviors/reset`,
      { method: "POST" }
    );
    const response = await POST(req, { params: Promise.resolve({ id: emptyAgent.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    await prisma.agent.delete({ where: { id: emptyAgent.id } });
  });
});
