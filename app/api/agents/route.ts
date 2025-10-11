import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLLMProvider } from "@/lib/llm/provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, kind, personality, purpose, tone, userId = "default-user" } = body;

    // Validar datos
    if (!name || !kind) {
      return NextResponse.json(
        { error: "Name and kind are required" },
        { status: 400 }
      );
    }

    // Generar profile y systemPrompt con Gemini
    const llm = getLLMProvider();
    const { profile, systemPrompt } = await llm.generateProfile({
      name,
      kind,
      personality,
      purpose,
      tone,
    });

    // Crear agente en BD
    const agent = await prisma.agent.create({
      data: {
        userId,
        kind,
        name,
        description: personality || purpose,
        personality,
        purpose,
        tone,
        profile: profile as Record<string, string | number | boolean | null>,
        systemPrompt,
        visibility: "private",
      },
    });

    // Crear relación inicial con el usuario
    await prisma.relation.create({
      data: {
        subjectId: agent.id,
        targetId: userId,
        trust: 0.5,
        affinity: 0.5,
        respect: 0.5,
        privateState: { love: 0, curiosity: 0 },
        visibleState: { trust: 0.5, affinity: 0.5, respect: 0.5 },
      },
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId") || "default-user";
    const kind = req.nextUrl.searchParams.get("kind");

    const where = kind ? { userId, kind } : { userId };

    const agents = await prisma.agent.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
