import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: originalId } = await params;
  const original = await prisma.agent.findFirst({
    where: { id: originalId, visibility: "public" },
  });

  if (!original) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const cloned = await prisma.agent.create({
    data: {
      userId: user.id,
      name: `${original.name} (Clone)`,
      kind: original.kind,
      description: original.description,
      gender: original.gender,
      personality: original.personality,
      tone: original.tone,
      purpose: original.purpose,
      profile: original.profile as Prisma.InputJsonValue,
      systemPrompt: original.systemPrompt,
      visibility: "private",
      avatar: original.avatar,
      tags: original.tags as Prisma.InputJsonValue,
      originalId: original.id,
    },
  });

  await Promise.all([
    prisma.agent.update({
      where: { id: originalId },
      data: { cloneCount: { increment: 1 } },
    }),
    prisma.agentClone.create({
      data: {
        originalAgentId: originalId,
        clonedByUserId: user.id,
        clonedAgentId: cloned.id,
      },
    }),
  ]);

  return NextResponse.json({ agent: cloned, success: true });
}
