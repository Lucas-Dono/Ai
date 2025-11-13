import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withOwnership, errorResponse } from "@/lib/api/middleware";
import { apiLogger as log } from "@/lib/logging/loggers";
import { z } from "zod";

/**
 * GET /api/agents/[id]
 * Get agent details (requires ownership or public visibility)
 */
export const GET = withOwnership(
  'agent',
  async (req, { resource }) => {
    try {
      log.info({ agentId: resource.id }, 'Fetching agent details');

      const agent = await prisma.agent.findUnique({
        where: { id: resource.id },
        include: {
          messagesAsAgent: {
            orderBy: { createdAt: "asc" },
            take: 50,
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });

      if (!agent) {
        log.warn({ agentId: resource.id }, 'Agent not found');
        return errorResponse("Agent not found", 404);
      }

      // Mapear agent para incluir isPublic y reviewCount
      const { _count, ...agentData } = agent;
      const mappedAgent = {
        ...agentData,
        isPublic: agent.visibility === 'public',
        reviewCount: _count?.reviews || 0,
      };

      log.info({ agentId: resource.id, visibility: agent.visibility }, 'Agent details fetched successfully');
      return NextResponse.json(mappedAgent);
    } catch (error) {
      log.error({ err: error, agentId: resource.id }, 'Error fetching agent');
      return errorResponse("Failed to fetch agent", 500);
    }
  },
  { allowPublic: true } // Allow access to public agents
)

/**
 * DELETE /api/agents/[id]
 * Delete an agent (requires ownership)
 */
export const DELETE = withOwnership('agent', async (req, { resource }) => {
  try {
    log.info({ agentId: resource.id }, 'Deleting agent');

    // Eliminar el agente (esto también eliminará las relaciones por CASCADE)
    await prisma.agent.delete({
      where: { id: resource.id },
    });

    log.info({ agentId: resource.id }, 'Agent deleted successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error({ err: error, agentId: resource.id }, 'Error deleting agent');
    return errorResponse("Failed to delete agent", 500);
  }
});

/**
 * PATCH /api/agents/[id]
 * Update agent details (requires ownership)
 */
const patchAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  personality: z.string().optional(),
  purpose: z.string().optional(),
  tone: z.string().optional(),
  description: z.string().optional(),
});

export const PATCH = withOwnership('agent', async (req, { resource }) => {
  try {
    log.info({ agentId: resource.id }, 'Updating agent');

    // Obtener y validar datos del body
    const body = await req.json();
    const validation = patchAgentSchema.safeParse(body);

    if (!validation.success) {
      log.warn({ agentId: resource.id, errors: validation.error.issues }, 'Validation failed');
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, personality, purpose, tone, description } = validation.data;

    log.debug({ agentId: resource.id, updates: { name, personality, purpose, tone, description } }, 'Update data validated');

    // Actualizar el agente
    const updatedAgent = await prisma.agent.update({
      where: { id: resource.id },
      data: {
        ...(name && { name }),
        ...(personality && { personality }),
        ...(purpose && { purpose }),
        ...(tone && { tone }),
        ...(description && { description }),
      },
    });

    log.info({ agentId: resource.id }, 'Agent updated successfully');

    return NextResponse.json(updatedAgent);
  } catch (error) {
    log.error({ err: error, agentId: resource.id }, 'Error updating agent');
    return errorResponse("Failed to update agent", 500);
  }
});
