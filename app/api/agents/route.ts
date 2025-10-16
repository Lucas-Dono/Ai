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
    const { name, kind, personality, purpose, tone, nsfwMode, allowDevelopTraumas, initialBehavior } = body;
    console.log('[API] Datos recibidos:', { name, kind, personality, purpose, tone, nsfwMode, allowDevelopTraumas, initialBehavior });

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
        nsfwMode: nsfwMode || false,
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

    // BEHAVIOR SYSTEM: Crear BehaviorProfile si se configuró
    if (initialBehavior && initialBehavior !== "none") {
      console.log('[API] Configurando behavior system...');

      let behaviorType: string;

      // Si es "random_secret", elegir uno basado en personalidad
      if (initialBehavior === "random_secret") {
        console.log('[API] Seleccionando behavior aleatorio secreto...');
        const behaviorsPool = [
          "ANXIOUS_ATTACHMENT",
          "AVOIDANT_ATTACHMENT",
          "CODEPENDENCY",
          "BORDERLINE_PD",
          "NARCISSISTIC_PD",
          "YANDERE_OBSESSIVE",
        ];

        // Usar personalidad para "seed" la selección (más inteligente que random puro)
        const personalityLower = (personality || "").toLowerCase();
        if (personalityLower.includes("dependiente") || personalityLower.includes("necesit")) {
          behaviorType = Math.random() > 0.5 ? "ANXIOUS_ATTACHMENT" : "CODEPENDENCY";
        } else if (personalityLower.includes("distante") || personalityLower.includes("frío") || personalityLower.includes("independiente")) {
          behaviorType = "AVOIDANT_ATTACHMENT";
        } else if (personalityLower.includes("intenso") || personalityLower.includes("extremo") || personalityLower.includes("obsesiv")) {
          behaviorType = Math.random() > 0.5 ? "BORDERLINE_PD" : "YANDERE_OBSESSIVE";
        } else if (personalityLower.includes("orgullos") || personalityLower.includes("superior") || personalityLower.includes("perfeccion")) {
          behaviorType = "NARCISSISTIC_PD";
        } else {
          // Random real si no hay pistas en personalidad
          behaviorType = behaviorsPool[Math.floor(Math.random() * behaviorsPool.length)];
        }

        console.log(`[API] Behavior secreto seleccionado: ${behaviorType} (basado en: "${personality}")`);
      } else {
        behaviorType = initialBehavior;
      }

      // Crear BehaviorProfile
      await prisma.behaviorProfile.create({
        data: {
          agentId: agent.id,
          behaviorType: behaviorType as any,
          baseIntensity: 0.3, // Intensidad inicial moderada
          currentPhase: 1,
          volatility: 0.5, // Volatilidad media
          thresholdForDisplay: 0.4,
          triggers: [],
          phaseStartedAt: new Date(),
          phaseHistory: [],
        },
      });

      console.log(`[API] BehaviorProfile creado: ${behaviorType}`);

      // Crear BehaviorProgressionState inicial
      await prisma.behaviorProgressionState.create({
        data: {
          agentId: agent.id,
          totalInteractions: 0,
          positiveInteractions: 0,
          negativeInteractions: 0,
          currentIntensities: { [behaviorType]: 0.3 },
          lastCalculatedAt: new Date(),
        },
      });

      console.log('[API] BehaviorProgressionState creado');
    }

    // Si allowDevelopTraumas está activado, loguear para futura implementación
    if (allowDevelopTraumas) {
      console.log('[API] allowDevelopTraumas activado - el agente podrá desarrollar behaviors durante interacción');
      // TODO: Implementar lógica de desarrollo gradual de behaviors
      // Por ahora, el sistema ya lo permite si se crean behaviors dinámicamente
    }

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
