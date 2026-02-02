import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/withAuth';
import { generateText } from '@/lib/llm/provider';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const RequestSchema = z.object({
  description: z.string().min(10),
  name: z.string().optional(),
  age: z.number().optional(),
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

    const { description, name, age } = validation.data;

    const currentYear = new Date().getFullYear();
    const birthYear = age ? currentYear - age : currentYear - 30;

    const prompt = `Basándote en la siguiente descripción de un personaje, genera su biografía y línea temporal.

DESCRIPCIÓN DEL PERSONAJE:
${description}
${name ? `Nombre: ${name}` : ''}
${age ? `Edad: ${age}` : ''}
${age ? `Año de nacimiento estimado: ${birthYear}` : ''}

Genera la siguiente historia en formato JSON:

{
  "events": [
    {"year": ${birthYear}, "title": "Nacimiento"},
    {"year": número, "title": "Título breve del evento"},
    ...4-6 eventos más
  ],
  "traumas": ["trauma1", "trauma2"],
  "achievements": ["logro1", "logro2", "logro3"]
}

INSTRUCCIONES:
- Eventos: 4-8 momentos clave en orden cronológico desde nacimiento hasta ahora
- Años realistas: entre ${birthYear} y ${currentYear}
- Títulos cortos y descriptivos (máx 60 caracteres)
- Traumas: 1-3 experiencias difíciles que moldearon al personaje
- Logros personales: 2-4 logros no profesionales (relaciones, superación personal, etc.)

EJEMPLOS DE BUENOS EVENTOS:
- {"year": 2010, "title": "Inicio de estudios universitarios"}
- {"year": 2018, "title": "Primer viaje al extranjero"}
- {"year": 2020, "title": "Mudanza a nueva ciudad"}

EJEMPLOS DE BUENOS TRAUMAS:
- "Divorcio de los padres durante la adolescencia"
- "Pérdida de un ser querido cercano"

EJEMPLOS DE BUENOS LOGROS:
- "Aprendió a tocar guitarra autodidacta"
- "Corrió su primera maratón"
- "Superó miedo a hablar en público"

Responde SOLO con el JSON válido, sin texto adicional.`;

    const response = await generateText({
      prompt,
      systemPrompt: 'Eres un biógrafo experto que crea historias de vida coherentes y realistas. Respondes siempre con JSON válido.',
      maxTokens: 600,
      temperature: 0.8,
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta');
    }

    const historyData = JSON.parse(jsonMatch[0]);

    // Añadir IDs a los eventos
    if (historyData.events) {
      historyData.events = historyData.events.map((event: any) => ({
        id: nanoid(),
        year: event.year,
        title: event.title,
        description: event.description || ''
      }));
    }

    return NextResponse.json(historyData);
  } catch (error: any) {
    console.error('Error generating history:', error);
    return NextResponse.json(
      { error: 'Error al generar historia', details: error.message },
      { status: 500 }
    );
  }
});
