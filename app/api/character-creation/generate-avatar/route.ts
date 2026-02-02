import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/withAuth';
import { VisualGenerationService } from '@/lib/visual-system/visual-generation-service';
import { z } from 'zod';

const RequestSchema = z.object({
  description: z.string().min(10),
  age: z.number().optional(),
  gender: z.enum(['male', 'female', 'non-binary']).optional(),
});

export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: validation.error.errors },
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

    // Generar imagen usando el servicio de visual generation
    const visualService = new VisualGenerationService();

    const imageUrl = await visualService.generateImage({
      prompt: imagePrompt,
      negativePrompt: 'cartoon, anime, drawing, painting, sketch, low quality, blurry, distorted',
      width: 512,
      height: 512,
      steps: 30,
      model: 'realistic',
    });

    return NextResponse.json({ url: imageUrl });
  } catch (error: any) {
    console.error('Error generating avatar:', error);
    return NextResponse.json(
      { error: 'Error al generar avatar', details: error.message },
      { status: 500 }
    );
  }
});
