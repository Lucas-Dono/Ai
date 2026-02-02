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

    const { description, name, age, gender } = validation.data;

    const prompt = `Basándote en la siguiente descripción de un personaje, genera un perfil psicológico completo y realista.

DESCRIPCIÓN DEL PERSONAJE:
${description}
${name ? `Nombre: ${name}` : ''}
${age ? `Edad: ${age}` : ''}
${gender ? `Género: ${gender}` : ''}

Genera el siguiente perfil psicológico en formato JSON:

{
  "bigFive": {
    "openness": número 0-100,
    "conscientiousness": número 0-100,
    "extraversion": número 0-100,
    "agreeableness": número 0-100,
    "neuroticism": número 0-100
  },
  "values": ["valor1", "valor2", "valor3"],
  "fears": ["miedo1", "miedo2"],
  "cognitivePrompt": "Descripción de 2-3 frases sobre cómo piensa, procesa información y se comporta este personaje"
}

INSTRUCCIONES:
- Big Five debe ser coherente con la descripción (0=muy bajo, 50=promedio, 100=muy alto)
- Valores: 3-5 principios fundamentales que guían al personaje
- Miedos: 2-4 temores profundos realistas
- cognitivePrompt: Describe patrones de pensamiento, sesgos cognitivos, estilo de razonamiento

Responde SOLO con el JSON válido, sin texto adicional.`;

    const response = await generateText({
      prompt,
      systemPrompt: 'Eres un psicólogo experto que crea perfiles de personalidad realistas basados en el modelo Big Five. Respondes siempre con JSON válido.',
      maxTokens: 500,
      temperature: 0.8,
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta');
    }

    const personalityData = JSON.parse(jsonMatch[0]);

    // Validar rangos de Big Five
    Object.keys(personalityData.bigFive).forEach(trait => {
      const value = personalityData.bigFive[trait];
      if (value < 0 || value > 100) {
        personalityData.bigFive[trait] = Math.max(0, Math.min(100, value));
      }
    });

    return NextResponse.json(personalityData);
  } catch (error: any) {
    console.error('Error generating personality:', error);
    return NextResponse.json(
      { error: 'Error al generar personalidad', details: error.message },
      { status: 500 }
    );
  }
});
