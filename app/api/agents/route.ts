import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLLMProvider } from "@/lib/llm/provider";
import { auth } from "@/lib/auth";
import { canUseResource, trackUsage } from "@/lib/usage/tracker";

export async function POST(req: NextRequest) {
  try {
    console.log('[API] Iniciando creación de agente...');

    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      console.log('[API] No hay sesión de usuario');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('[API] Usuario autenticado:', userId);

    // Check agent creation quota
    console.log('[API] Verificando cuota...');
    const quotaCheck = await canUseResource(userId, "agent");
    if (!quotaCheck.allowed) {
      console.log('[API] Cuota excedida');
      return NextResponse.json(
        {
          error: quotaCheck.reason,
          current: quotaCheck.current,
          limit: quotaCheck.limit,
          upgrade: "/pricing",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, kind, personality, purpose, tone } = body;
    console.log('[API] Datos recibidos:', { name, kind, personality, purpose, tone });

    // Validar datos
    if (!name || !kind) {
      console.log('[API] Datos inválidos');
      return NextResponse.json(
        { error: "Name and kind are required" },
        { status: 400 }
      );
    }

    // Generar profile y systemPrompt con Gemini
    console.log('[API] Obteniendo proveedor LLM...');
    const llm = getLLMProvider();
    console.log('[API] Generando perfil con LLM...');
    const { profile, systemPrompt } = await llm.generateProfile({
      name,
      kind,
      personality,
      purpose,
      tone,
    });
    console.log('[API] Perfil generado exitosamente');

    // Crear agente en BD
    console.log('[API] Creando agente en base de datos...');
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
    console.log('[API] Agente creado:', agent.id);

    // Crear relación inicial con el usuario
    console.log('[API] Creando relación inicial...');
    await prisma.relation.create({
      data: {
        subjectId: agent.id,
        targetId: userId,
        targetType: "user",
        trust: 0.5,
        affinity: 0.5,
        respect: 0.5,
        privateState: { love: 0, curiosity: 0 },
        visibleState: { trust: 0.5, affinity: 0.5, respect: 0.5 },
      },
    });
    console.log('[API] Relación creada');

    // Track usage
    console.log('[API] Registrando uso...');
    await trackUsage(userId, "agent", 1, agent.id, {
      name: agent.name,
      kind: agent.kind,
    });
    console.log('[API] Agente creado exitosamente');

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating agent:", error);
    return NextResponse.json(
      { error: "Failed to create agent", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('[API GET] Obteniendo agentes...');

    // Obtener userId de la sesión si no se pasa como parámetro
    const session = await auth();
    const userIdParam = req.nextUrl.searchParams.get("userId");
    const userId = userIdParam || session?.user?.id || "default-user";

    console.log('[API GET] userId:', userId, 'de sesión:', session?.user?.id);

    const kind = req.nextUrl.searchParams.get("kind");

    const where = kind ? { userId, kind } : { userId };

    const agents = await prisma.agent.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    console.log('[API GET] Agentes encontrados:', agents.length);

    return NextResponse.json(agents);
  } catch (error) {
    console.error("[API GET] Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
