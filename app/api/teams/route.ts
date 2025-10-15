import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/teams - List user's teams
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teams = await prisma.team.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      owner: { select: { name: true, email: true, image: true } },
      _count: {
        select: { members: true, agents: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ teams });
}

// POST /api/teams - Create new team
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description } = body;

  if (!name || name.trim().length === 0) {
    return NextResponse.json({ error: "Team name is required" }, { status: 400 });
  }

  // Create team and add owner as member
  const team = await prisma.team.create({
    data: {
      name,
      description,
      ownerId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "owner",
        },
      },
    },
    include: {
      owner: { select: { name: true, email: true, image: true } },
      _count: {
        select: { members: true, agents: true },
      },
    },
  });

  return NextResponse.json({ team, success: true }, { status: 201 });
}
