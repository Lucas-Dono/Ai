import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { getLLMProvider } from '@/lib/llm/provider';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const RequestSchema = z.object({
  description: z.string().min(10),
  name: z.string().optional(),
  age: z.number().optional(),
  // Contexto existente
  existingPeople: z.array(z.any()).optional(),
  existingValues: z.array(z.string()).optional(),
  existingFears: z.array(z.string()).optional(),
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

    const { description, name, age, existingPeople, existingValues, existingFears } = validation.data;

    // Construir sección de contexto existente
    let existingContext = '';
    if (existingPeople && existingPeople.length > 0) {
      existingContext += `\nPERSONAS YA DEFINIDAS:\n${existingPeople.map((p: any) => `- ${p.name} (${p.relationship}): ${p.description}`).join('\n')}\n(Respeta estas personas, agrega más coherentes)`;
    }
    if (existingValues && existingValues.length > 0) {
      existingContext += `\nVALORES DEL PERSONAJE: ${existingValues.join(', ')}\n(Usa estos valores para crear influencias coherentes)`;
    }
    if (existingFears && existingFears.length > 0) {
      existingContext += `\nMIEDOS DEL PERSONAJE: ${existingFears.join(', ')}\n(Usa estos miedos para crear historias coherentes)`;
    }

    const prompt = `Basándote en la siguiente descripción de un personaje, genera su red social de personas importantes con PROFUNDIDAD PSICOLÓGICA.

DESCRIPCIÓN DEL PERSONAJE:
${description}
${name ? `Nombre: ${name}` : ''}
${age ? `Edad: ${age}` : ''}
${existingContext}

Genera las siguientes relaciones en formato JSON:

{
  "people": [
    {
      "name": "Nombre de la persona",
      "relationship": "Madre / Padre / Mejor amigo / Ex-pareja / Mentor / Rival / etc.",
      "description": "Descripción breve de quién es y por qué es importante",
      "type": "family | friend | romantic | rival | mentor | colleague | other",
      "closeness": número 0-100,
      "status": "active | estranged | deceased | distant",
      "influenceOn": {
        "values": ["valor1", "valor2"],
        "fears": ["miedo1"],
        "skills": ["habilidad1"],
        "personalityImpact": "Descripción de cómo moldeó al personaje"
      },
      "sharedHistory": [
        {
          "year": número,
          "title": "Evento compartido importante",
          "description": "Breve descripción"
        }
      ],
      "currentDynamic": "Descripción de la relación actual (frecuencia de contacto, tono, etc.)",
      "conflict": {
        "active": true/false,
        "description": "Descripción del conflicto si existe",
        "intensity": número 0-100
      }
    }
  ]
}

INSTRUCCIONES CRÍTICAS:

1. DIVERSIDAD DE RELACIONES (3-6 personas):
   - Familia: Padres, hermanos, abuelos (influencias formativas)
   - Amistades: Mejor amigo, amigos de la infancia
   - Románticas: Pareja actual, ex significativa
   - Profesionales: Mentor, colega influyente
   - Conflictivas: Rival, relación complicada

2. PROFUNDIDAD PSICOLÓGICA:
   - INFLUENCIA: Cada persona debe haber moldeado valores, miedos o personalidad
   - HISTORIA COMPARTIDA: Eventos específicos que definieron la relación
   - DINÁMICA ACTUAL: Cómo es la relación HOY (frecuencia, tono, cercanía)
   - CONFLICTOS REALISTAS: No todas las relaciones son perfectas

3. CLOSENESS (0-100):
   - 0-20: Distante, contacto mínimo
   - 21-40: Ocasional, cordial pero no cercano
   - 41-60: Regular, relación importante pero no íntima
   - 61-80: Cercano, confidente
   - 81-100: Extremadamente cercano, vínculo profundo

4. STATUS:
   - active: Relación activa y presente
   - estranged: Distanciados, conflicto sin resolver
   - deceased: Persona fallecida (pero su influencia perdura)
   - distant: Relación que se enfrió con el tiempo

5. REALISMO:
   - No todas las relaciones son positivas
   - Incluir AL MENOS una relación complicada o conflictiva
   - Padres/familia pueden ser influencia negativa o fuente de trauma
   - Las personas moldeamos valores EN REACCIÓN a otros (ej: padre controlador → valor de independencia)

6. COHERENCIA CON EDAD:
   - 18-25 años: Énfasis en amigos, primeras relaciones románticas, padres presentes
   - 26-35 años: Pareja estable, mentores profesionales, amigos de universidad
   - 36+ años: Posible familia propia, relaciones duraderas, algunos vínculos perdidos

EJEMPLOS DE BUENAS RELACIONES:

{
  "name": "María Rodríguez (Madre)",
  "relationship": "Madre",
  "description": "Madre sobreprotectora con buenas intenciones pero tendencias controladoras",
  "type": "family",
  "closeness": 50,
  "status": "active",
  "influenceOn": {
    "values": ["Independencia", "Autoconfianza"],
    "fears": ["Perder autonomía", "Decepcionar a otros"],
    "skills": ["Cocina italiana", "Planificación financiera"],
    "personalityImpact": "Creció en oposición a su madre, desarrollando fuerte necesidad de independencia"
  },
  "sharedHistory": [
    {
      "year": 2015,
      "title": "Discusión fuerte sobre carrera profesional",
      "description": "Madre quería que estudiara medicina, él eligió arte. No se hablaron 6 meses."
    },
    {
      "year": 2020,
      "title": "Reconciliación parcial tras enfermedad de ella",
      "description": "Cáncer de mama la suavizó, él aprendió a poner límites pero con amor"
    }
  ],
  "currentDynamic": "Hablan 1 vez al mes, amor complicado, límites claros pero respeto mutuo",
  "conflict": {
    "active": false,
    "description": "Superaron el conflicto tras terapia familiar",
    "intensity": 20
  }
}

${existingContext ? '\n- IMPORTANTE: Si hay personas ya definidas, RESPETA y construye sobre ellas. No dupliques, agrega nuevas coherentes.' : ''}

Responde SOLO con el JSON válido, sin texto adicional.`;

    const llm = getLLMProvider();
    const response = await llm.generate({
      systemPrompt: 'Eres un psicólogo experto en dinámicas familiares y relacionales. Creas redes sociales realistas con profundidad emocional. Respondes siempre con JSON válido.',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 1500,
      temperature: 0.8,
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta');
    }

    const relationshipsData = JSON.parse(jsonMatch[0]);

    // Añadir IDs a las personas y eventos
    if (relationshipsData.people) {
      relationshipsData.people = relationshipsData.people.map((person: any) => {
        // Añadir ID a la persona
        const personWithId = { id: nanoid(), ...person };

        // Añadir IDs a shared history si existe
        if (personWithId.sharedHistory && Array.isArray(personWithId.sharedHistory)) {
          personWithId.sharedHistory = personWithId.sharedHistory.map((event: any) => ({
            id: nanoid(),
            ...event
          }));
        }

        return personWithId;
      });
    }

    return NextResponse.json(relationshipsData);
  } catch (error: any) {
    console.error('Error generating relationships:', error);
    return NextResponse.json(
      { error: 'Error al generar relaciones', details: error.message },
      { status: 500 }
    );
  }
}
