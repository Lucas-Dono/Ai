import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { getLLMProvider } from '@/lib/llm/provider';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { withRetry } from '@/lib/utils/retry';
import { getVeniceClient, VENICE_MODELS } from '@/lib/emotional-system/llm/venice';

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

    // Try with Gemini first, fallback to Venice if all retries fail
    let response: string;
    try {
      response = await withRetry(
        async () => {
          return await llm.generate({
            systemPrompt: 'Eres un biógrafo experto que crea historias de vida coherentes y realistas. Respondes siempre con JSON válido.',
            messages: [{ role: 'user', content: prompt }],
            maxTokens: 15000,
            temperature: 0.8,
          });
        },
        {
          maxRetries: 3,
          initialDelay: 2000,
          shouldRetry: (error) => {
            if (error.message?.includes('503') || error.message?.includes('500') || error.message?.includes('saturated')) {
              console.log('[Generate History] Gemini saturated, retrying...');
              return true;
            }
            return false;
          },
          onRetry: (error, attempt) => {
            console.log(`[Generate History] Retrying with Gemini (${attempt}/3):`, error.message);
          }
        }
      );
    } catch (geminiError: any) {
      // Fallback to Venice if Gemini fails
      console.warn('[Generate History] ⚠️ Gemini failed, falling back to Venice...');

      const veniceClient = getVeniceClient();
      response = await veniceClient.generateWithMessages({
        systemPrompt: 'Eres un biógrafo experto que crea historias de vida coherentes y realistas. Respondes siempre con JSON válido.',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        maxTokens: 15000,
        model: VENICE_MODELS.DEFAULT,
      });

      console.log('[Generate History] ✅ Fallback to Venice successful');
    }

    // Post-procesamiento: Limpiar artefactos del modelo antes de parsear JSON
    let cleanedResponse = response.trim();

    // Eliminar markdown code blocks si existen
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Eliminar comentarios de JavaScript (// y /* */)
    cleanedResponse = cleanedResponse.replace(/\/\/.*$/gm, ''); // Comentarios de una línea
    cleanedResponse = cleanedResponse.replace(/\/\*[\s\S]*?\*\//g, ''); // Comentarios multilínea

    // Parse JSON response
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Generate History] No se pudo extraer JSON. Respuesta limpiada:', cleanedResponse.substring(0, 500));
      throw new Error('No se pudo extraer JSON de la respuesta');
    }

    let jsonText = jsonMatch[0];

    // Limpiar trailing commas antes de } o ]
    jsonText = jsonText.replace(/,([\s]*[}\]])/g, '$1');

    const historyData = JSON.parse(jsonText);

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
