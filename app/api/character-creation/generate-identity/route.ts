import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/withAuth';
import { generateText } from '@/lib/llm/provider';
import { z } from 'zod';

const RequestSchema = z.object({
  description: z.string().min(10),
  name: z.string().optional(),
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

    const { description } = validation.data;

    const prompt = `Basándote en la siguiente descripción de un personaje, genera los datos de identidad básicos.

DESCRIPCIÓN DEL PERSONAJE:
${description}

Genera SOLO los siguientes campos en formato JSON válido:
{
  "name": "Nombre completo apropiado",
  "age": número (edad realista),
  "gender": "male" | "female" | "non-binary",
  "origin": "Ciudad, país de origen realista"
}

IMPORTANTE:
- El nombre debe ser coherente con el origen y la descripción
- La edad debe ser realista según la descripción
- El género debe inferirse de la descripción si es posible
- El origen debe ser específico (ciudad y país)

Responde SOLO con el JSON, sin texto adicional.`;

    const response = await generateText({
      prompt,
      systemPrompt: 'Eres un generador de datos de personajes realistas. Respondes siempre con JSON válido y datos coherentes.',
      maxTokens: 200,
      temperature: 0.7,
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta');
    }

    const identityData = JSON.parse(jsonMatch[0]);

    return NextResponse.json(identityData);
  } catch (error: any) {
    console.error('Error generating identity:', error);
    return NextResponse.json(
      { error: 'Error al generar identidad', details: error.message },
      { status: 500 }
    );
  }
});
