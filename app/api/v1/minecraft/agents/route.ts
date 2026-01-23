import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/v1/minecraft/agents
 *
 * Lista los agentes del usuario disponibles para Minecraft
 *
 * Límites por plan:
 * - FREE: máximo 3 agentes
 * - PLUS: máximo 10 agentes
 * - ULTRA: ilimitado
 *
 * Solo retorna datos esenciales para minimizar payload
 */
export async function GET(req: NextRequest) {
  try {
    // Extraer y verificar JWT token
    const authHeader = req.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const tokenData = await verifyToken(token);
    if (!tokenData) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Obtener usuario completo de la BD
    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      select: { id: true, plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener agentes del usuario con datos mínimos
    const agents = await prisma.agent.findMany({
      where: {
        userId: user.id,
        // Excluir agentes marcados como no disponibles para Minecraft
        // (opcional: agregar campo isMinecraftEnabled en el futuro)
      },
      include: {
        PersonalityCore: {
          select: {
            openness: true,
            conscientiousness: true,
            extraversion: true,
            agreeableness: true,
            neuroticism: true,
          },
        },
        Relation: {
          where: { targetId: user.id },
          select: {
            trust: true,
            affinity: true,
            stage: true,
          },
        },
        InternalState: {
          select: {
            currentEmotions: true,
            moodValence: true,
            moodArousal: true,
            moodDominance: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: user.plan === 'FREE' ? 3 : user.plan === 'PLUS' ? 10 : undefined,
    });

    // Formatear respuesta minimalista
    const formattedAgents = agents.map((agent) => {
      // Extraer edad del profile JSON
      const profile = agent.profile as any;
      const age = profile?.identidad?.edad || profile?.age || null;

      return {
        id: agent.id,
        name: agent.name,
        gender: agent.gender || 'unknown',
        age: age,
        profession: extractProfession(agent.profile),
        personality: agent.PersonalityCore
          ? {
            openness: agent.PersonalityCore.openness,
            conscientiousness: agent.PersonalityCore.conscientiousness,
            extraversion: agent.PersonalityCore.extraversion,
            agreeableness: agent.PersonalityCore.agreeableness,
            neuroticism: agent.PersonalityCore.neuroticism,
          }
        : null,
        relationship: agent.Relation[0]
          ? {
            trust: agent.Relation[0].trust,
            affinity: agent.Relation[0].affinity,
            stage: agent.Relation[0].stage,
          }
          : null,
        currentEmotion: agent.InternalState?.currentEmotions
          ? (agent.InternalState.currentEmotions as any).primary || 'neutral'
          : 'neutral',
        // Datos para skinning en Minecraft
        appearance: {
          skinUrl: agent.referenceImageUrl || null,
          hairColor: extractFromProfile(agent.profile, 'hairColor'),
          eyeColor: extractFromProfile(agent.profile, 'eyeColor'),
          height: extractFromProfile(agent.profile, 'height'),
          build: extractFromProfile(agent.profile, 'build'),
        },
      };
    });

    return NextResponse.json({
      agents: formattedAgents,
      total: formattedAgents.length,
      plan: user.plan,
      limits: {
        FREE: 3,
        PLUS: 10,
        ULTRA: -1, // ilimitado
      },
    });

  } catch (error: any) {
    console.error('[Minecraft Agents List API Error]', error);
    return NextResponse.json(
      {
        error: 'Error al obtener agentes',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Extrae la profesión del perfil del agente
 */
function extractProfession(profile: any): string {
  if (!profile) return 'VILLAGER';

  // Intentar extraer de diferentes campos del perfil
  const profileData = typeof profile === 'string' ? JSON.parse(profile) : profile;

  if (profileData.occupation) return mapProfessionToMCA(profileData.occupation);
  if (profileData.career) return mapProfessionToMCA(profileData.career);
  if (profileData.job) return mapProfessionToMCA(profileData.job);

  return 'VILLAGER';
}

/**
 * Mapea profesiones de Blaniel a profesiones de MCA
 */
function mapProfessionToMCA(occupation: string): string {
  const lowerOccupation = occupation.toLowerCase();

  // Mapeo de profesiones comunes
  const professionMap: Record<string, string> = {
    // Agricultores
    farmer: 'FARMER',
    agricultor: 'FARMER',
    granjero: 'FARMER',

    // Guardias/Militares
    guard: 'GUARD',
    guardia: 'GUARD',
    soldier: 'GUARD',
    soldado: 'GUARD',
    warrior: 'GUARD',
    guerrero: 'GUARD',

    // Bandidos (para personajes antagonistas)
    bandit: 'BANDIT',
    bandido: 'BANDIT',
    thief: 'BANDIT',
    ladrón: 'BANDIT',

    // Mineros
    miner: 'MINER',
    minero: 'MINER',

    // Herreros
    blacksmith: 'BLACKSMITH',
    herrero: 'BLACKSMITH',
    smith: 'BLACKSMITH',

    // Comerciantes
    merchant: 'TRADER',
    trader: 'TRADER',
    comerciante: 'TRADER',
    vendedor: 'TRADER',

    // Sacerdotes
    priest: 'PRIEST',
    sacerdote: 'PRIEST',
    cleric: 'PRIEST',

    // Bibliotecarios
    librarian: 'LIBRARIAN',
    bibliotecario: 'LIBRARIAN',
    scholar: 'LIBRARIAN',
    erudito: 'LIBRARIAN',

    // Panaderos
    baker: 'BAKER',
    panadero: 'BAKER',

    // Chefs
    chef: 'CHEF',
    cocinero: 'CHEF',
    cook: 'CHEF',

    // Default
    default: 'VILLAGER',
  };

  // Buscar match exacto
  if (professionMap[lowerOccupation]) {
    return professionMap[lowerOccupation];
  }

  // Buscar match parcial (contains)
  for (const [key, value] of Object.entries(professionMap)) {
    if (lowerOccupation.includes(key)) {
      return value;
    }
  }

  return 'VILLAGER';
}

/**
 * Extrae un campo específico del perfil
 */
function extractFromProfile(profile: any, field: string): string | null {
  if (!profile) return null;

  try {
    const profileData = typeof profile === 'string' ? JSON.parse(profile) : profile;

    // Buscar en diferentes niveles del perfil
    if (profileData[field]) return profileData[field];
    if (profileData.appearance?.[field]) return profileData.appearance[field];
    if (profileData.physical?.[field]) return profileData.physical[field];

    return null;
  } catch {
    return null;
  }
}
