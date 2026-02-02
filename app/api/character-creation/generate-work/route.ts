import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { getLLMProvider } from '@/lib/llm/provider';
import { z } from 'zod';

const RequestSchema = z.object({
  description: z.string().min(10),
  name: z.string().optional(),
  age: z.number().optional(),
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

    const { description, name, age } = validation.data;

    const prompt = `Basándote en la siguiente descripción de un personaje, genera su perfil profesional.

DESCRIPCIÓN DEL PERSONAJE:
${description}
${name ? `Nombre: ${name}` : ''}
${age ? `Edad: ${age}` : ''}

Genera el siguiente perfil profesional en formato JSON:

{
  "occupation": "Título profesional específico y realista",
  "skills": ["habilidad1", "habilidad2", "habilidad3", "habilidad4"],
  "achievements": ["logro1", "logro2", "logro3"]
}

INSTRUCCIONES:
- Ocupación: Debe ser coherente con la edad y descripción
- Habilidades: 4-6 competencias específicas relacionadas con su ocupación y experiencia
- Logros: 2-4 logros profesionales concretos y medibles

EJEMPLOS DE BUENAS HABILIDADES:
- "Gestión de proyectos ágiles"
- "Diseño UX/UI con Figma"
- "Análisis de datos con Python"

EJEMPLOS DE BUENOS LOGROS:
- "Lideró equipo que aumentó ventas 40% en 2023"
- "Publicó 3 artículos en revistas académicas"
- "Ganador del premio 'Innovación del Año 2022'"

Responde SOLO con el JSON válido, sin texto adicional.`;

    const llm = getLLMProvider();
    const response = await llm.generate({
      systemPrompt: 'Eres un experto en desarrollo profesional que crea perfiles de carrera realistas. Respondes siempre con JSON válido.',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 400,
      temperature: 0.7,
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta');
    }

    const workData = JSON.parse(jsonMatch[0]);

    return NextResponse.json(workData);
  } catch (error: any) {
    console.error('Error generating work profile:', error);
    return NextResponse.json(
      { error: 'Error al generar perfil profesional', details: error.message },
      { status: 500 }
    );
  }
}
