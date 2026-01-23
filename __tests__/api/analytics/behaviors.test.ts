/**
 * INTEGRATION TESTS - GET /api/analytics/behaviors
 *
 * Tests para el endpoint de analytics globales de behaviors.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { BehaviorType } from "@prisma/client";
import { GET } from "@/app/api/analytics/behaviors/route";
import { NextRequest } from "next/server";
import { nanoid } from "nanoid";

// Mock next-auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "test-user-analytics" },
  }),
}));

describe("GET /api/analytics/behaviors", () => {
  let testUserId: string;
  let testAgent1Id: string;
  let testAgent2Id: string;

  beforeAll(async () => {
    // Cleanup
    const existingUser = await prisma.user.findUnique({
      where: { id: "test-user-analytics" },
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

    // Create test data
    const testUser = await prisma.user.create({
      data: {
        id: "test-user-analytics",
        email: "test-analytics@test.com",
        name: "Test User Analytics",
        updatedAt: new Date(),
      },
    });
    testUserId = testUser.id;

    // Create agent 1
    const agent1 = await prisma.agent.create({
      data: {
        id: nanoid(),
        userId: testUserId,
        kind: "companion",
        name: "Agent 1",
        description: "Test",
        personality: "Test",
        systemPrompt: "Test",
        profile: { age: 25 },
        nsfwMode: true,
        updatedAt: new Date(),
      },
    });
    testAgent1Id = agent1.id;

    // Create agent 2
    const agent2 = await prisma.agent.create({
      data: {
        id: nanoid(),
        userId: testUserId,
        kind: "assistant",
        name: "Agent 2",
        description: "Test",
        personality: "Test",
        systemPrompt: "Test",
        profile: { age: 30 },
        nsfwMode: false,
        updatedAt: new Date(),
      },
    });
    testAgent2Id = agent2.id;

    // Create behaviors for agent 1
    await prisma.behaviorProfile.create({
      data: {
        id: nanoid(),
        agentId: testAgent1Id,
        behaviorType: BehaviorType.YANDERE_OBSESSIVE,
        baseIntensity: 0.6,
        escalationRate: 0.1,
        deEscalationRate: 0.05,
        currentPhase: 4,
        volatility: 0.5,
        thresholdForDisplay: 0.3,
        triggers: [],
        updatedAt: new Date(),
      },
    });

    await prisma.behaviorProfile.create({
      data: {
        id: nanoid(),
        agentId: testAgent1Id,
        behaviorType: BehaviorType.ANXIOUS_ATTACHMENT,
        baseIntensity: 0.5,
        escalationRate: 0.1,
        deEscalationRate: 0.05,
        currentPhase: 2,
        volatility: 0.5,
        thresholdForDisplay: 0.3,
        triggers: [],
        updatedAt: new Date(),
      },
    });

    // Create behavior for agent 2
    await prisma.behaviorProfile.create({
      data: {
        id: nanoid(),
        agentId: testAgent2Id,
        behaviorType: BehaviorType.BORDERLINE_PD,
        baseIntensity: 0.4,
        escalationRate: 0.1,
        deEscalationRate: 0.05,
        currentPhase: 1,
        volatility: 0.5,
        thresholdForDisplay: 0.3,
        triggers: [],
        updatedAt: new Date(),
      },
    });

    // Create messages and triggers
    const msg1 = await prisma.message.create({
      data: {
        id: nanoid(),
        agentId: testAgent1Id,
        userId: testUserId,
        content: "Test message 1",
        role: "user",
      },
    });

    const msg2 = await prisma.message.create({
      data: {
        id: nanoid(),
        agentId: testAgent2Id,
        userId: testUserId,
        content: "Test message 2",
        role: "user",
      },
    });

    await prisma.behaviorTriggerLog.create({
      data: {
        id: nanoid(),
        messageId: msg1.id,
        triggerType: "abandonment_signal",
        behaviorType: BehaviorType.YANDERE_OBSESSIVE,
        weight: 0.7,
        detectedText: "Test",
      },
    });

    await prisma.behaviorTriggerLog.create({
      data: {
        id: nanoid(),
        messageId: msg1.id,
        triggerType: "criticism",
        behaviorType: BehaviorType.ANXIOUS_ATTACHMENT,
        weight: 0.8,
        detectedText: "Test",
      },
    });

    await prisma.behaviorTriggerLog.create({
      data: {
        id: nanoid(),
        messageId: msg2.id,
        triggerType: "abandonment_signal",
        behaviorType: BehaviorType.BORDERLINE_PD,
        weight: 0.6,
        detectedText: "Test",
      },
    });
  });

  afterAll(async () => {
    if (testAgent1Id || testAgent2Id) {
      await prisma.behaviorTriggerLog.deleteMany({
        where: {
          Message: {
            agentId: { in: [testAgent1Id, testAgent2Id].filter(Boolean) },
          },
        },
      });
      await prisma.message.deleteMany({
        where: { agentId: { in: [testAgent1Id, testAgent2Id].filter(Boolean) } },
      });
      await prisma.behaviorProgressionState.deleteMany({
        where: { agentId: { in: [testAgent1Id, testAgent2Id].filter(Boolean) } },
      });
      await prisma.behaviorProfile.deleteMany({
        where: { agentId: { in: [testAgent1Id, testAgent2Id].filter(Boolean) } },
      });

      if (testAgent1Id) {
        await prisma.agent.delete({ where: { id: testAgent1Id } });
      }
      if (testAgent2Id) {
        await prisma.agent.delete({ where: { id: testAgent2Id } });
      }
    }

    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
  });

  it("should return comprehensive analytics for user's agents", async () => {
    const req = new NextRequest(`http://localhost:3000/api/analytics/behaviors`);
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);

    // Validate structure
    expect(data).toHaveProperty("agents");
    expect(data).toHaveProperty("totalAgents");
    expect(data).toHaveProperty("totalBehaviors");
    expect(data).toHaveProperty("totalTriggers");
    expect(data).toHaveProperty("behaviorDistribution");
    expect(data).toHaveProperty("topTriggers");
    expect(data).toHaveProperty("safetyLevelStats");
    expect(data).toHaveProperty("agentComparison");
    expect(data).toHaveProperty("trends");
    expect(data).toHaveProperty("metadata");

    // Validate counts
    expect(data.totalAgents).toBe(2);
    expect(data.totalBehaviors).toBe(3);
    expect(data.totalTriggers).toBe(3);

    // Validate agents list
    expect(data.agents).toHaveLength(2);
    expect(data.agents[0]).toHaveProperty("id");
    expect(data.agents[0]).toHaveProperty("name");
    expect(data.agents[0]).toHaveProperty("kind");
    expect(data.agents[0]).toHaveProperty("nsfwMode");
  });

  it("should calculate behavior distribution correctly", async () => {
    const req = new NextRequest(`http://localhost:3000/api/analytics/behaviors`);
    const response = await GET(req);
    const data = await response.json();

    // Should have 3 different behavior types
    expect(data.behaviorDistribution).toHaveProperty("YANDERE_OBSESSIVE");
    expect(data.behaviorDistribution).toHaveProperty("ANXIOUS_ATTACHMENT");
    expect(data.behaviorDistribution).toHaveProperty("BORDERLINE_PD");

    expect(data.behaviorDistribution.YANDERE_OBSESSIVE).toBe(1);
    expect(data.behaviorDistribution.ANXIOUS_ATTACHMENT).toBe(1);
    expect(data.behaviorDistribution.BORDERLINE_PD).toBe(1);
  });

  it("should calculate top triggers with stats", async () => {
    const req = new NextRequest(`http://localhost:3000/api/analytics/behaviors`);
    const response = await GET(req);
    const data = await response.json();

    expect(data.topTriggers).toBeInstanceOf(Array);
    expect(data.topTriggers.length).toBeGreaterThan(0);

    // Validate trigger structure
    const trigger = data.topTriggers[0];
    expect(trigger).toHaveProperty("type");
    expect(trigger).toHaveProperty("count");
    expect(trigger).toHaveProperty("avgWeight");

    // abandonment_signal should be most common (2 occurrences)
    const abandonmentTrigger = data.topTriggers.find(
      (t: any) => t.type === "abandonment_signal"
    );
    expect(abandonmentTrigger).toBeDefined();
    expect(abandonmentTrigger.count).toBe(2);
  });

  it("should calculate safety levels based on phases", async () => {
    const req = new NextRequest(`http://localhost:3000/api/analytics/behaviors`);
    const response = await GET(req);
    const data = await response.json();

    expect(data.safetyLevelStats).toHaveProperty("SAFE");
    expect(data.safetyLevelStats).toHaveProperty("WARNING");
    expect(data.safetyLevelStats).toHaveProperty("CRITICAL");
    expect(data.safetyLevelStats).toHaveProperty("EXTREME_DANGER");

    // Agent 2 has phase 1 (SAFE)
    expect(data.safetyLevelStats.SAFE).toBeGreaterThanOrEqual(1);

    // Agent 1 has phase 4 (WARNING)
    expect(data.safetyLevelStats.WARNING).toBeGreaterThanOrEqual(1);
  });

  it("should provide agent comparison data", async () => {
    const req = new NextRequest(`http://localhost:3000/api/analytics/behaviors`);
    const response = await GET(req);
    const data = await response.json();

    expect(data.agentComparison).toHaveLength(2);

    const agent1Data = data.agentComparison.find(
      (a: any) => a.id === testAgent1Id
    );
    expect(agent1Data).toBeDefined();
    expect(agent1Data.behaviorCount).toBe(2);
    expect(agent1Data.triggerCount).toBe(2);
    expect(agent1Data).toHaveProperty("avgIntensity");
    expect(agent1Data).toHaveProperty("avgPhase");

    const agent2Data = data.agentComparison.find(
      (a: any) => a.id === testAgent2Id
    );
    expect(agent2Data).toBeDefined();
    expect(agent2Data.behaviorCount).toBe(1);
    expect(agent2Data.triggerCount).toBe(1);
  });

  it("should include trends data", async () => {
    const req = new NextRequest(`http://localhost:3000/api/analytics/behaviors`);
    const response = await GET(req);
    const data = await response.json();

    expect(data.trends).toBeInstanceOf(Array);

    // Should have entries for recent triggers
    if (data.trends.length > 0) {
      expect(data.trends[0]).toHaveProperty("date");
      expect(data.trends[0]).toHaveProperty("triggerCount");
    }
  });

  it("should include metadata", async () => {
    const req = new NextRequest(`http://localhost:3000/api/analytics/behaviors`);
    const response = await GET(req);
    const data = await response.json();

    expect(data.metadata.periodDays).toBe(30);
    expect(data.metadata.generatedAt).toBeDefined();
    expect(new Date(data.metadata.generatedAt)).toBeInstanceOf(Date);
  });
});
