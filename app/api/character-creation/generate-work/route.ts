import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { getLLMProvider } from '@/lib/llm/provider';
import { z } from 'zod';

const RequestSchema = z.object({
  description: z.string().min(10),
  name: z.string().optional(),
  age: z.number().optional(),
  // Contexto existente (para refinar/expandir)
  existingOccupation: z.string().optional(),
  existingSkills: z.array(z.string()).optional(),
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

    const { description, name, age, existingOccupation, existingSkills, existingAchievements } = validation.data;

    // Construir sección de contexto existente
    let existingContext = '';
    if (existingOccupation) {
      existingContext += `\nOCUPACIÓN YA DEFINIDA: ${existingOccupation}\n(Usa esta ocupación, genera habilidades y logros coherentes)`;
    }
    if (existingSkills && existingSkills.length > 0) {
      existingContext += `\nHABILIDADES YA DEFINIDAS: ${existingSkills.join(', ')}\n(Expande estas habilidades, agrega más si es necesario)`;
    }
    if (existingAchievements && existingAchievements.length > 0) {
      existingContext += `\nLOGROS YA DEFINIDOS: ${existingAchievements.join(', ')}\n(Expande estos logros, agrega más coherentes)`;
    }

    const prompt = `Basándote en la siguiente descripción de un personaje, genera su perfil profesional.

DESCRIPCIÓN DEL PERSONAJE:
${description}
${name ? `Nombre: ${name}` : ''}
${age ? `Edad: ${age}` : ''}
${existingContext}

Genera el siguiente perfil profesional en formato JSON:

{
  "occupation": "Título profesional específico y realista",
  "skills": [
    {"name": "habilidad1", "level": 75},
    {"name": "habilidad2", "level": 60}
  ],
  "achievements": ["logro1", "logro2", "logro3"]
}

INSTRUCCIONES:
- Ocupación: Debe ser coherente con la edad y descripción
- Habilidades: 4-6 competencias específicas con niveles de proficiencia
  - level: 0-20 (Novato), 21-40 (Principiante), 41-60 (Intermedio), 61-80 (Avanzado), 81-100 (Experto)
  - Ajusta niveles según la edad y experiencia del personaje
- Logros: 2-4 logros profesionales concretos y medibles
${existingContext ? '- IMPORTANTE: Si hay información previa, REFINA y EXPANDE (no reemplaces). Mantén lo que el usuario ya definió y construye sobre ello.' : ''}

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
      maxTokens: 15000, // Límite generoso para evitar cortes
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
