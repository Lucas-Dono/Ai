import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { getVeniceClient } from '@/lib/emotional-system/llm/venice';
import { z } from 'zod';

const RequestSchema = z.object({
  description: z.string().min(10),
  age: z.number().optional(),
  gender: z.enum(['male', 'female', 'non-binary']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const validation = RequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { description, age, gender } = validation.data;

    console.log('[Generate Avatar] Generating avatar with Venice (grok-imagine)...');
    console.log('[Generate Avatar] Cost: $0.04 per image');

    // Generar avatar usando Venice AI con grok-imagine
    const veniceClient = getVeniceClient();
    const result = await veniceClient.generateAvatar({
      description,
      age,
      gender,
    });

    console.log(`[Generate Avatar] ✅ Avatar generated in ${result.generationTime.toFixed(2)}s`);

    return NextResponse.json({
      url: result.imageUrl,
      revisedPrompt: result.revisedPrompt,
      generationTime: result.generationTime,
      cost: 0.04, // USD
    });
  } catch (error: any) {
    console.error('Error generating avatar:', error);
    return NextResponse.json(
      { error: 'Error al generar avatar', details: error.message },
      { status: 500 }
    );
  }
}
