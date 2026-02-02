import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { getLLMProvider } from '@/lib/llm/provider';
import { z } from 'zod';

const RequestSchema = z.object({
  description: z.string().min(10),
  name: z.string().optional(),
  age: z.number().optional(),
  gender: z.enum(['male', 'female', 'non-binary']).optional(),
  // Contexto existente (para refinar/expandir)
  existingOrigin: z.string().optional(),
  existingPhysicalDescription: z.string().optional(),
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

    const { description, name, age, gender, existingOrigin, existingPhysicalDescription } = validation.data;

    // Construir sección de contexto existente
    let existingContext = '';
    if (existingOrigin) {
      existingContext += `\nORIGEN YA DEFINIDO: ${existingOrigin}\n(Usa este origen, no lo cambies)`;
    }
    if (existingPhysicalDescription) {
      existingContext += `\nDESCRIPCIÓN FÍSICA YA DEFINIDA: "${existingPhysicalDescription}"\n(Refina y expande esta descripción, mantén la esencia)`;
    }

    const prompt = `Basándote en la siguiente descripción de un personaje, genera los datos de identidad básicos y extrae la descripción física/visual.

DESCRIPCIÓN DEL PERSONAJE:
${description}
${existingContext}

Genera SOLO los siguientes campos en formato JSON válido:
{
  "name": "Nombre completo apropiado",
  "age": número (edad realista),
  "gender": "male" | "female" | "non-binary",
  "origin": "Ciudad, país de origen realista",
  "physicalDescription": "Descripción SOLO de la apariencia física extraída de la descripción original"
}

IMPORTANTE:
- El nombre debe ser coherente con el origen y la descripción
- La edad debe ser realista según la descripción
- El género debe inferirse de la descripción si es posible
- El origen debe ser específico (ciudad y país)
- physicalDescription: Extrae SOLO las características visuales/físicas mencionadas (altura, complexión, color de ojos, cabello, rasgos faciales, vestimenta). Si no hay descripción física en el texto original, genera una coherente basada en el nombre, edad y origen. Máximo 150 palabras, enfócate en lo visual.
${existingContext ? '- IMPORTANTE: Si hay información previa (origen o descripción física), RESPÉTALA y construye sobre ella. No reemplaces lo que ya existe.' : ''}

Responde SOLO con el JSON, sin texto adicional.`;

    const llm = getLLMProvider();
    const response = await llm.generate({
      systemPrompt: 'Eres un generador de datos de personajes realistas. Respondes siempre con JSON válido y datos coherentes.',
      messages: [{ role: 'user', content: prompt }],
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
}
