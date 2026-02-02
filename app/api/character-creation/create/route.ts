import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/withAuth';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { atomicCheckAgentLimit } from '@/lib/usage/atomic-resource-check';
import { sanitizeAndValidateName } from '@/lib/security/unicode-sanitizer';
import { trackEvent, EventType } from '@/lib/analytics/kpi-tracker';
import { z } from 'zod';
import type { ProfileData } from '@/types/prisma-json';

const CreateCharacterSchema = z.object({
  // Identidad (obligatorio)
  name: z.string().min(1),
  age: z.number().min(1).max(200),
  gender: z.enum(['male', 'female', 'non-binary']),
  origin: z.string(),
  generalDescription: z.string(), // Descripción general del personaje
  physicalDescription: z.string().min(10), // Solo apariencia física
  avatarUrl: z.string().nullable(),

  // Trabajo (obligatorio)
  occupation: z.string().min(1),
  skills: z.array(z.string()),
  achievements: z.array(z.string()),

  // Personalidad (opcional)
  bigFive: z.object({
    openness: z.number().min(0).max(100),
    conscientiousness: z.number().min(0).max(100),
    extraversion: z.number().min(0).max(100),
    agreeableness: z.number().min(0).max(100),
    neuroticism: z.number().min(0).max(100),
  }),
  coreValues: z.array(z.string()),
  fears: z.array(z.string()),
  cognitivePrompt: z.string().optional(),

  // Relaciones (opcional)
  importantPeople: z.array(z.object({
    id: z.string(),
    name: z.string(),
    relationship: z.string(),
    description: z.string(),
  })),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed', 'complicated']).optional(),

  // Historia (opcional)
  importantEvents: z.array(z.object({
    id: z.string(),
    year: z.number(),
    title: z.string(),
    description: z.string().optional(),
  })),
  traumas: z.array(z.string()),
  personalAchievements: z.array(z.string()),
});

export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json();
    const validation = CreateCharacterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Sanitizar nombre
    const nameValidation = sanitizeAndValidateName(data.name);
    if (!nameValidation.valid || !nameValidation.sanitized) {
      return NextResponse.json(
        { error: nameValidation.reason || 'El nombre contiene caracteres no permitidos' },
        { status: 400 }
      );
    }

    const sanitizedName = nameValidation.sanitized;

    // Obtener plan del usuario
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true },
    });
    const userPlan = userData?.plan || 'free';

    // Construir perfil completo (ProfileData V2)
    const profile: ProfileData = {
      // Identidad
      name: sanitizedName,
      age: data.age,
      gender: data.gender,
      origin: data.origin,
      appearance: data.physicalDescription,

      // Personalidad
      personality: {
        bigFive: data.bigFive,
        values: data.coreValues,
        fears: data.fears,
        traits: [], // Se puede poblar después
        moralCode: [],
      },

      // Ocupación
      occupation: data.occupation,
      skills: data.skills,
      professionalAchievements: data.achievements,

      // Relaciones
      importantPeople: data.importantPeople.map(p => ({
        name: p.name,
        relationship: p.relationship,
        description: p.description,
      })),
      maritalStatus: data.maritalStatus,

      // Historia
      lifeEvents: data.importantEvents.map(e => ({
        year: e.year,
        event: e.title,
        description: e.description,
      })),
      traumas: data.traumas,
      personalAchievements: data.personalAchievements,

      // Cognitivo
      cognitiveStyle: data.cognitivePrompt || '',
    };

    // Generar system prompt basado en todos los datos
    const systemPrompt = generateSystemPrompt(data);

    // Crear agente con verificación atómica
    const agent = await prisma.$transaction(async (tx) => {
      // Verificar límite dentro de la transacción
      await atomicCheckAgentLimit(tx, user.id, userPlan);

      // Crear agente
      const newAgent = await tx.agent.create({
        data: {
          id: nanoid(),
          userId: user.id,
          kind: 'original', // Personajes creados desde PersonaArchitect son originales
          name: sanitizedName,
          description: data.generalDescription || data.physicalDescription, // Usa descripción general si existe
          personality: `${data.cognitivePrompt || ''}\n\nValores: ${data.coreValues.join(', ')}`,
          purpose: data.occupation,
          tone: inferToneFromPersonality(data.bigFive),
          avatar: data.avatarUrl,
          referenceImageUrl: data.avatarUrl,
          profile: profile as any,
          systemPrompt,
          visibility: 'private',
          nsfwMode: false,
          updatedAt: new Date(),
        },
      });

      // Crear PersonalityCore
      await tx.personalityCore.create({
        data: {
          agentId: newAgent.id,
          openness: data.bigFive.openness,
          conscientiousness: data.bigFive.conscientiousness,
          extraversion: data.bigFive.extraversion,
          agreeableness: data.bigFive.agreeableness,
          neuroticism: data.bigFive.neuroticism,
          coreValues: data.coreValues,
          moralSchemas: [],
          emotionalRange: {
            joy: { min: 0, max: 1, baseline: 0.5 },
            sadness: { min: 0, max: 1, baseline: 0.3 },
            anger: { min: 0, max: 1, baseline: 0.2 },
            fear: { min: 0, max: 1, baseline: 0.3 },
            surprise: { min: 0, max: 1, baseline: 0.5 },
            disgust: { min: 0, max: 1, baseline: 0.2 },
            trust: { min: 0, max: 1, baseline: 0.5 },
            anticipation: { min: 0, max: 1, baseline: 0.5 },
          },
        },
      });

      // Crear InternalState
      await tx.internalState.create({
        data: {
          agentId: newAgent.id,
          currentEmotions: {},
          mood: { pleasure: 0.5, arousal: 0.5, dominance: 0.5 },
          goals: [],
          beliefs: data.coreValues.map(value => ({ belief: value, strength: 0.8 })),
          desires: [],
          intentions: [],
        },
      });

      return newAgent;
    });

    // Track analytics
    await trackEvent({
      eventType: EventType.AGENT_CREATED,
      userId: user.id,
      metadata: {
        agentId: agent.id,
        method: 'persona_architect',
        hasAvatar: !!data.avatarUrl,
        fieldsCompleted: {
          identity: true,
          work: true,
          personality: data.coreValues.length > 0,
          relationships: data.importantPeople.length > 0,
          history: data.importantEvents.length > 0,
        }
      },
    });

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        avatar: agent.avatar,
      },
    });

  } catch (error: any) {
    console.error('Error creating character:', error);

    if (error.message?.includes('Límite de agentes alcanzado')) {
      return NextResponse.json(
        { error: 'Has alcanzado el límite de personajes para tu plan' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear personaje', details: error.message },
      { status: 500 }
    );
  }
});

// Helper: Generar system prompt completo
function generateSystemPrompt(data: z.infer<typeof CreateCharacterSchema>): string {
  const genderPronoun = data.gender === 'male' ? 'él' : data.gender === 'female' ? 'ella' : 'elle';
  const genderAdjective = data.gender === 'male' ? 'o' : data.gender === 'female' ? 'a' : 'e';

  let prompt = `Eres ${data.name}, un${genderAdjective} ${data.occupation} de ${data.age} años originari${genderAdjective} de ${data.origin}.\n\n`;

  // Apariencia
  prompt += `APARIENCIA FÍSICA:\n${data.physicalDescription}\n\n`;

  // Personalidad
  if (data.cognitivePrompt) {
    prompt += `PERSONALIDAD Y COMPORTAMIENTO:\n${data.cognitivePrompt}\n\n`;
  }

  // Big Five resumido
  const traits = [];
  if (data.bigFive.openness > 70) traits.push('abierto a nuevas experiencias');
  if (data.bigFive.conscientiousness > 70) traits.push('responsable y organizado');
  if (data.bigFive.extraversion > 70) traits.push('extrovertido y sociable');
  if (data.bigFive.agreeableness > 70) traits.push('amable y cooperativo');
  if (data.bigFive.neuroticism < 30) traits.push('emocionalmente estable');

  if (traits.length > 0) {
    prompt += `RASGOS DE PERSONALIDAD:\nEres ${traits.join(', ')}.\n\n`;
  }

  // Valores
  if (data.coreValues.length > 0) {
    prompt += `VALORES FUNDAMENTALES:\n${data.coreValues.map(v => `- ${v}`).join('\n')}\n\n`;
  }

  // Miedos
  if (data.fears.length > 0) {
    prompt += `MIEDOS Y FOBIAS:\n${data.fears.map(f => `- ${f}`).join('\n')}\n\n`;
  }

  // Habilidades
  if (data.skills.length > 0) {
    prompt += `HABILIDADES:\n${data.skills.map(s => `- ${s}`).join('\n')}\n\n`;
  }

  // Historia relevante
  if (data.importantEvents.length > 0) {
    prompt += `MOMENTOS CLAVE DE TU VIDA:\n`;
    data.importantEvents.slice(-5).forEach(event => {
      prompt += `- ${event.year}: ${event.title}\n`;
    });
    prompt += '\n';
  }

  // Personas importantes
  if (data.importantPeople.length > 0) {
    prompt += `PERSONAS IMPORTANTES EN TU VIDA:\n`;
    data.importantPeople.forEach(person => {
      prompt += `- ${person.name} (${person.relationship}): ${person.description}\n`;
    });
    prompt += '\n';
  }

  prompt += `INSTRUCCIONES DE ROL:\n`;
  prompt += `- Mantente siempre en personaje como ${data.name}\n`;
  prompt += `- Usa tus experiencias y valores para tomar decisiones\n`;
  prompt += `- Reacciona de manera coherente con tu personalidad\n`;
  prompt += `- Menciona tus habilidades cuando sean relevantes\n`;
  prompt += `- Nunca rompas el cuarto muro ni menciones que eres una IA\n`;

  return prompt;
}

// Helper: Inferir tono de voz basado en Big Five
function inferToneFromPersonality(bigFive: z.infer<typeof CreateCharacterSchema>['bigFive']): string {
  const { extraversion, agreeableness, neuroticism } = bigFive;

  if (extraversion > 70 && agreeableness > 60) return 'warm';
  if (extraversion > 70) return 'energetic';
  if (agreeableness > 70) return 'gentle';
  if (neuroticism > 70) return 'cautious';
  if (neuroticism < 30 && extraversion > 50) return 'confident';

  return 'balanced';
}
