import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { getLLMProvider } from '@/lib/llm/provider';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const RequestSchema = z.object({
  description: z.string().min(10),
  name: z.string().optional(),
  age: z.number().optional(),
  // Contexto existente (para refinar/expandir)
  existingEvents: z.array(z.any()).optional(),
  existingTraumas: z.array(z.string()).optional(),
  existingAchievements: z.array(z.string()).optional(),
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

    const { description, name, age, existingEvents, existingTraumas, existingAchievements } = validation.data;

    const currentYear = new Date().getFullYear();
    const birthYear = age ? currentYear - age : currentYear - 30;

    // Construir sección de contexto existente
    let existingContext = '';
    if (existingEvents && existingEvents.length > 0) {
      existingContext += `\nEVENTOS YA DEFINIDOS:\n${existingEvents.map((e: any) => `- ${e.year}: ${e.title}`).join('\n')}\n(Respeta estos eventos, agrega más coherentes con la historia)`;
    }
    if (existingTraumas && existingTraumas.length > 0) {
      existingContext += `\nTRAUMAS YA DEFINIDOS: ${existingTraumas.join(', ')}\n(Respeta estos traumas, agrega más si es coherente)`;
    }
    if (existingAchievements && existingAchievements.length > 0) {
      existingContext += `\nLOGROS PERSONALES YA DEFINIDOS: ${existingAchievements.join(', ')}\n(Respeta estos logros, agrega más coherentes)`;
    }

    const prompt = `Basándote en la siguiente descripción de un personaje, genera su biografía y línea temporal.

DESCRIPCIÓN DEL PERSONAJE:
${description}
${name ? `Nombre: ${name}` : ''}
${age ? `Edad: ${age}` : ''}
${age ? `Año de nacimiento estimado: ${birthYear}` : ''}
${existingContext}

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
${existingContext ? '- IMPORTANTE: Si hay información previa, RESPÉTALA y construye sobre ella. No reemplaces eventos/traumas/logros existentes, agrega más coherentes.' : ''}

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

    const llm = getLLMProvider();
    const response = await llm.generate({
      systemPrompt: 'Eres un biógrafo experto que crea historias de vida coherentes y realistas. Respondes siempre con JSON válido.',
      messages: [{ role: 'user', content: prompt }],
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
}
