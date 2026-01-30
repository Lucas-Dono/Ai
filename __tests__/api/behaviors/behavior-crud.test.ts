/**
 * INTEGRATION TESTS - Behavior CRUD operations
 *
 * DELETE /api/agents/[id]/behaviors/[behaviorId]
 * PATCH /api/agents/[id]/behaviors/[behaviorId]
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { nanoid } from "nanoid";
import { BehaviorType } from "@prisma/client";
import { DELETE, PATCH } from "@/app/api/agents/[id]/behaviors/[behaviorId]/route";
import { NextRequest } from "next/server";

// Unmock Prisma for integration tests - we need the real database connection
vi.unmock("@/lib/prisma");

import { prisma } from "@/lib/prisma";

describe("Behavior CRUD operations", () => {
  let testAgentId: string;
  let testUserId: string;
  let testBehaviorId: string;

  beforeAll(async () => {
    const existingUser = await prisma.user.findUnique({
      where: { id: "test-user-crud" },
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
        id: "test-user-crud",
        email: "test-crud@test.com",
        name: "Test User CRUD",
        updatedAt: new Date(),
      },
    });
    testUserId = testUser.id;

    const testAgent = await prisma.agent.create({
      data: {
        id: nanoid(),
        userId: testUserId,
        kind: "companion",
        name: "Test Agent CRUD",
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

  describe("DELETE /api/agents/[id]/behaviors/[behaviorId]", () => {
    it("should delete a specific behavior", async () => {
      // Create behavior to delete
      const behavior = await prisma.behaviorProfile.create({
        data: {
          id: nanoid(),
          agentId: testAgentId,
          behaviorType: BehaviorType.YANDERE_OBSESSIVE,
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

      const req = new NextRequest(
        `http://localhost:3000/api/agents/${testAgentId}/behaviors/${behavior.id}`,
        { method: "DELETE" }
      );
      const response = await DELETE(req, {
        params: Promise.resolve({ id: testAgentId, behaviorId: behavior.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.behaviorId).toBe(behavior.id);
      expect(data.behaviorType).toBe("YANDERE_OBSESSIVE");

      // Verify deletion
      const deleted = await prisma.behaviorProfile.findUnique({
        where: { id: behavior.id },
      });
      expect(deleted).toBeNull();
    });

    it("should return 404 for non-existent behavior", async () => {
      const req = new NextRequest(
        `http://localhost:3000/api/agents/${testAgentId}/behaviors/fake-id`,
        { method: "DELETE" }
      );
      const response = await DELETE(req, {
        params: Promise.resolve({ id: testAgentId, behaviorId: "fake-id" }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Behavior not found");
    });

    it("should return 404 when behavior belongs to different agent", async () => {
      // Create another agent and behavior
      const otherAgent = await prisma.agent.create({
        data: {
          id: nanoid(),
          userId: testUserId,
          kind: "assistant",
          name: "Other Agent",
          description: "Test",
          personality: "Test",
          systemPrompt: "Test",
          profile: { age: 30 },
          updatedAt: new Date(),
        },
      });

      const otherBehavior = await prisma.behaviorProfile.create({
        data: {
          id: nanoid(),
          agentId: otherAgent.id,
          behaviorType: BehaviorType.ANXIOUS_ATTACHMENT,
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

      // Try to delete from wrong agent
      const req = new NextRequest(
        `http://localhost:3000/api/agents/${testAgentId}/behaviors/${otherBehavior.id}`,
        { method: "DELETE" }
      );
      const response = await DELETE(req, {
        params: Promise.resolve({ id: testAgentId, behaviorId: otherBehavior.id }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Behavior not found");

      // Cleanup
      await prisma.behaviorProfile.delete({ where: { id: otherBehavior.id } });
      await prisma.agent.delete({ where: { id: otherAgent.id } });
    });
  });

  describe("PATCH /api/agents/[id]/behaviors/[behaviorId]", () => {
    beforeAll(async () => {
      // Create a behavior for update tests
      const behavior = await prisma.behaviorProfile.create({
        data: {
          id: nanoid(),
          agentId: testAgentId,
          behaviorType: BehaviorType.BORDERLINE_PD,
          baseIntensity: 0.4,
          escalationRate: 0.1,
          deEscalationRate: 0.05,
          volatility: 0.5,
          thresholdForDisplay: 0.3,
          currentPhase: 1,
          triggers: [],
          updatedAt: new Date(),
        },
      });
      testBehaviorId = behavior.id;
    });

    it("should update behavior parameters", async () => {
      const updateData = {
        baseIntensity: 0.6,
        volatility: 0.7,
        escalationRate: 0.15,
      };

      const req = new NextRequest(
        `http://localhost:3000/api/agents/${testAgentId}/behaviors/${testBehaviorId}`,
        {
          method: "PATCH",
          body: JSON.stringify(updateData),
        }
      );
      const response = await PATCH(req, {
        params: Promise.resolve({ id: testAgentId, behaviorId: testBehaviorId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.behavior.baseIntensity).toBe(0.6);
      expect(data.behavior.volatility).toBe(0.7);
      expect(data.behavior.escalationRate).toBe(0.15);

      // Verify in database
      const updated = await prisma.behaviorProfile.findUnique({
        where: { id: testBehaviorId },
      });
      expect(updated?.baseIntensity).toBe(0.6);
      expect(updated?.volatility).toBe(0.7);
    });

    it("should reject invalid values (out of range)", async () => {
      const req = new NextRequest(
        `http://localhost:3000/api/agents/${testAgentId}/behaviors/${testBehaviorId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ baseIntensity: 1.5 }),
        }
      );
      const response = await PATCH(req, {
        params: Promise.resolve({ id: testAgentId, behaviorId: testBehaviorId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("between 0 and 1");
    });

    it("should reject invalid values (negative)", async () => {
      const req = new NextRequest(
        `http://localhost:3000/api/agents/${testAgentId}/behaviors/${testBehaviorId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ escalationRate: -0.1 }),
        }
      );
      const response = await PATCH(req, {
        params: Promise.resolve({ id: testAgentId, behaviorId: testBehaviorId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("between 0 and 1");
    });

    it("should reject empty update", async () => {
      const req = new NextRequest(
        `http://localhost:3000/api/agents/${testAgentId}/behaviors/${testBehaviorId}`,
        {
          method: "PATCH",
          body: JSON.stringify({}),
        }
      );
      const response = await PATCH(req, {
        params: Promise.resolve({ id: testAgentId, behaviorId: testBehaviorId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("No valid fields to update");
    });

    it("should return 404 for non-existent behavior", async () => {
      const req = new NextRequest(
        `http://localhost:3000/api/agents/${testAgentId}/behaviors/fake-id`,
        {
          method: "PATCH",
          body: JSON.stringify({ baseIntensity: 0.5 }),
        }
      );
      const response = await PATCH(req, {
        params: Promise.resolve({ id: testAgentId, behaviorId: "fake-id" }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Behavior not found");
    });
  });
});
