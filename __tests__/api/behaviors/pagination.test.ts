/**
 * INTEGRATION TESTS - Pagination for Behavior Triggers
 *
 * Tests cursor-based pagination in GET /api/agents/[id]/behaviors
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { nanoid } from "nanoid";
import { BehaviorType } from "@prisma/client";
import { GET } from "@/app/api/agents/[id]/behaviors/route";
import { NextRequest } from "next/server";

// Unmock Prisma for integration tests - we need the real database connection
vi.unmock("@/lib/prisma");

import { prisma } from "@/lib/prisma";

// Mock next-auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "test-user-pagination" },
  }),
}));

describe("GET /api/agents/[id]/behaviors - Pagination", () => {
  let testUserId: string;
  let testAgentId: string;
  let triggerIds: string[] = [];

  beforeAll(async () => {
    // Cleanup
    const existingUser = await prisma.user.findUnique({
      where: { id: "test-user-pagination" },
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
        id: "test-user-pagination",
        email: "test-pagination@test.com",
        name: "Test User Pagination",
        updatedAt: new Date(),
      },
    });
    testUserId = testUser.id;

    // Create agent
    const agent = await prisma.agent.create({
      data: {
        id: nanoid(),
        userId: testUserId,
        kind: "companion",
        name: "Pagination Test Agent",
        description: "Test",
        personality: "Test",
        systemPrompt: "Test",
        profile: { age: 25 },
        nsfwMode: true,
        updatedAt: new Date(),
      },
    });
    testAgentId = agent.id;

    // Create behavior
    await prisma.behaviorProfile.create({
      data: {
        id: nanoid(),
        agentId: testAgentId,
        behaviorType: BehaviorType.YANDERE_OBSESSIVE,
        baseIntensity: 0.5,
        escalationRate: 0.1,
        deEscalationRate: 0.05,
        currentPhase: 1,
        volatility: 0.5,
        thresholdForDisplay: 0.3,
        triggers: [],
        updatedAt: new Date(),
      },
    });

    // Create 75 messages and triggers for pagination testing
    for (let i = 0; i < 75; i++) {
      const message = await prisma.message.create({
        data: {
          id: nanoid(),
          agentId: testAgentId,
          userId: testUserId,
          content: `Test message ${i}`,
          role: "user",
        },
      });

      const trigger = await prisma.behaviorTriggerLog.create({
        data: {
          id: nanoid(),
          messageId: message.id,
          triggerType: "abandonment_signal",
          behaviorType: BehaviorType.YANDERE_OBSESSIVE,
          weight: 0.7,
          detectedText: `Trigger ${i}`,
        },
      });

      triggerIds.push(trigger.id);
    }
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

  it("should return first page with default limit (50)", async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/agents/${testAgentId}/behaviors`
    );
    const response = await GET(req, {
      params: Promise.resolve({ id: testAgentId }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination).toBeDefined();
    expect(data.pagination.total).toBe(75);
    expect(data.pagination.count).toBe(50);
    expect(data.pagination.hasMore).toBe(true);
    expect(data.pagination.nextCursor).toBeDefined();
    expect(data.triggerHistory).toHaveLength(50);
  });

  it("should return custom page size", async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/agents/${testAgentId}/behaviors?limit=20`
    );
    const response = await GET(req, {
      params: Promise.resolve({ id: testAgentId }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.count).toBe(20);
    expect(data.pagination.hasMore).toBe(true);
    expect(data.triggerHistory).toHaveLength(20);
  });

  it("should return next page with cursor", async () => {
    // Get first page
    const req1 = new NextRequest(
      `http://localhost:3000/api/agents/${testAgentId}/behaviors?limit=30`
    );
    const response1 = await GET(req1, {
      params: Promise.resolve({ id: testAgentId }),
    });
    const data1 = await response1.json();

    const cursor = data1.pagination.nextCursor;
    expect(cursor).toBeDefined();

    // Get second page with cursor
    const req2 = new NextRequest(
      `http://localhost:3000/api/agents/${testAgentId}/behaviors?limit=30&cursor=${cursor}`
    );
    const response2 = await GET(req2, {
      params: Promise.resolve({ id: testAgentId }),
    });
    const data2 = await response2.json();

    expect(response2.status).toBe(200);
    expect(data2.pagination.count).toBe(30);
    expect(data2.pagination.hasMore).toBe(true);
    expect(data2.triggerHistory).toHaveLength(30);

    // Verify no overlap
    const ids1 = data1.triggerHistory.map((t: any) => t.id);
    const ids2 = data2.triggerHistory.map((t: any) => t.id);
    const overlap = ids1.filter((id: string) => ids2.includes(id));
    expect(overlap).toHaveLength(0);
  });

  it("should return last page with hasMore=false", async () => {
    // Get first page
    const req1 = new NextRequest(
      `http://localhost:3000/api/agents/${testAgentId}/behaviors?limit=50`
    );
    const response1 = await GET(req1, {
      params: Promise.resolve({ id: testAgentId }),
    });
    const data1 = await response1.json();

    // Get second page (should be last)
    const req2 = new NextRequest(
      `http://localhost:3000/api/agents/${testAgentId}/behaviors?limit=50&cursor=${data1.pagination.nextCursor}`
    );
    const response2 = await GET(req2, {
      params: Promise.resolve({ id: testAgentId }),
    });
    const data2 = await response2.json();

    expect(response2.status).toBe(200);
    expect(data2.pagination.count).toBe(25); // 75 - 50 = 25
    expect(data2.pagination.hasMore).toBe(false);
    expect(data2.pagination.nextCursor).toBeNull();
    expect(data2.triggerHistory).toHaveLength(25);
  });

  it("should enforce max limit of 100", async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/agents/${testAgentId}/behaviors?limit=200`
    );
    const response = await GET(req, {
      params: Promise.resolve({ id: testAgentId }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.limit).toBe(100); // Max enforced
    expect(data.pagination.count).toBeLessThanOrEqual(75); // Can't exceed total
  });

  it("should enforce min limit of 10", async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/agents/${testAgentId}/behaviors?limit=5`
    );
    const response = await GET(req, {
      params: Promise.resolve({ id: testAgentId }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.limit).toBe(10); // Min enforced
  });
});
