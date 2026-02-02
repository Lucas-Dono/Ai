import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { getAIHordeClient } from '@/lib/visual-system/ai-horde-client';
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

    // Construir prompt de imagen
    let imagePrompt = `portrait photo of a person, ${description}`;

    if (age) {
      imagePrompt += `, ${age} years old`;
    }

    if (gender) {
      const genderMap = {
        'male': 'male',
        'female': 'female',
        'non-binary': 'androgynous'
      };
      imagePrompt += `, ${genderMap[gender]}`;
    }

    imagePrompt += ', professional headshot, high quality, realistic, detailed face';

    // Generar imagen usando AI Horde
    const aiHordeClient = getAIHordeClient();
    const result = await aiHordeClient.generateImage({
      prompt: imagePrompt,
      negativePrompt: 'cartoon, anime, drawing, painting, sketch, low quality, blurry, distorted, deformed, multiple people, text',
      width: 512,
      height: 512,
      steps: 30,
      cfgScale: 7.5,
      sampler: 'k_euler_a',
      seed: -1,
      nsfw: false,
      karras: true,
    });

    return NextResponse.json({ url: result.imageUrl });
  } catch (error: any) {
    console.error('Error generating avatar:', error);
    return NextResponse.json(
      { error: 'Error al generar avatar', details: error.message },
      { status: 500 }
    );
  }
}
