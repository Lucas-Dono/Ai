/**
 * World AI Generator API
 * POST /api/worlds/ai/generate - Genera configuración de mundo con IA
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { getWorldGenerator } from '@/lib/worlds/world-generator';
import type { GenerateWorldRequest, GenerateWorldResponse } from '@/lib/worlds/types';
import { z } from 'zod';

// Schema de validación
const generateWorldSchema = z.object({
  description: z.string().min(10).max(2000),
  worldType: z.enum(['chat', 'story', 'professional', 'roleplay', 'educational']).optional(),
  templateId: z.string().optional(),
  format: z.enum(['chat', 'visual_novel']).optional(),
  complexity: z.enum(['simple', 'medium', 'complex']).optional(),
  characterCount: z.number().int().min(1).max(15).optional(),
  detailedMode: z.boolean().optional(),
  characterDescriptions: z.array(z.string()).optional(),
});

// Timeout de 60 segundos para generación con IA
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Autenticación
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parsear y validar body
    const body = await req.json();
    const validation = generateWorldSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const request: GenerateWorldRequest = validation.data;

    console.log('[API/WorldAI] Generating world for user:', user.id);
    console.log('[API/WorldAI] Type:', request.worldType);
    console.log('[API/WorldAI] Description:', request.description.substring(0, 100));

    // Generar con IA
    const generator = getWorldGenerator();
    const generation = await generator.generateWorld(request);

    console.log('[API/WorldAI] Generation successful');
    console.log('[API/WorldAI] Characters generated:', generation.suggestedAgents.length);

    const response: GenerateWorldResponse = {
      success: true,
      data: generation,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API/WorldAI] Error:', error);

    const response: GenerateWorldResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate world',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
