/**
 * Character Research System
 *
 * Sistema para detectar personajes públicos/famosos y buscar información
 * biográfica real para generar perfiles precisos en lugar de inventar datos.
 *
 * Flujo:
 * 1. Detectar si es personaje público/famoso usando LLM
 * 2. Buscar información biográfica en múltiples fuentes
 * 3. Estructurar información para generateProfile
 * 4. Validar y enriquecer datos
 */

import { LLMProvider } from "@/lib/llm/provider";

export interface CharacterDetectionResult {
  isPublicFigure: boolean;
  confidence: number; // 0-1
  category?: "fictional" | "historical" | "celebrity" | "original";
  context?: string; // "MCU", "DC Comics", "Historia", "Música", etc.
  suggestedSearchQueries?: string[];
}

export interface CharacterBiography {
  found: boolean;
  fullName?: string;
  age?: number | string; // Puede ser "~50" o número exacto
  nationality?: string;
  city?: string;
  occupation?: string;
  family?: {
    spouse?: string;
    children?: string[];
    parents?: { father?: string; mother?: string };
    siblings?: string[];
  };
  personality?: string;
  background?: string; // Historia/backstory
  keyTraits?: string[];
  relationships?: Array<{ name: string; type: string; description: string }>;
  sourceContext?: string; // "MCU", "Comics", "Real life", etc.
  rawData?: string; // Información cruda para que el LLM la procese
}

/**
 * Detecta si un nombre/personalidad corresponde a un personaje público o famoso
 * usando análisis con LLM.
 */
export async function detectPublicCharacter(
  name: string,
  personality: string,
  purpose?: string
): Promise<CharacterDetectionResult> {
  const llm = new LLMProvider();

  const detectionPrompt = `Analiza si este personaje es una persona/personaje público o famoso:

NOMBRE: ${name}
PERSONALIDAD DESCRITA: ${personality}
${purpose ? `PROPÓSITO: ${purpose}` : ""}

TAREA: Determina si es un personaje conocido (real o de ficción).

CATEGORÍAS:
- "fictional": Personaje de ficción (películas, series, libros, anime, videojuegos, comics)
- "historical": Persona histórica real (científicos, políticos, artistas del pasado)
- "celebrity": Celebridad actual (actores, cantantes, influencers, deportistas)
- "original": Personaje original/desconocido creado por el usuario

EJEMPLOS:
- "Tony Stark" + "genio millonario filántropo" → fictional, MCU/Marvel
- "Albert Einstein" + "científico brillante" → historical, Física
- "Marilyn Monroe" + "actriz icónica" → historical, Cine
- "María" + "estudiante universitaria" → original, -

Responde SOLO con este JSON (sin markdown):
{
  "isPublicFigure": true/false,
  "confidence": 0.0-1.0,
  "category": "fictional/historical/celebrity/original",
  "context": "contexto específico (MCU, DC, Historia, Música, etc.) o null",
  "suggestedSearchQueries": ["query1", "query2", "query3"] o null
}

Si es personaje conocido (isPublicFigure: true), incluye 3 queries de búsqueda optimizadas para encontrar:
1. Biografía básica (edad, origen, familia)
2. Personalidad y comportamiento
3. Relaciones y contexto

Si es original (isPublicFigure: false), devuelve queries: null`;

  try {
    const response = await llm.generate({
      systemPrompt: "Eres un experto en identificar personajes públicos, históricos y de ficción. Respondes únicamente con JSON válido.",
      messages: [{ role: "user", content: detectionPrompt }],
      temperature: 0.3, // Baja temperatura para respuestas consistentes
      maxTokens: 500,
    });

    // Limpiar respuesta de markdown
    let cleaned = response.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const result = JSON.parse(cleaned) as CharacterDetectionResult;

    console.log("[CharacterResearch] Detección completada:", {
      name,
      isPublic: result.isPublicFigure,
      category: result.category,
      confidence: result.confidence,
    });

    return result;
  } catch (error) {
    console.error("[CharacterResearch] Error en detección:", error);

    // Fallback: detección simple por keywords
    const keywords = [
      // Marvel/DC
      "stark", "iron man", "spider-man", "batman", "superman", "captain america",
      "thor", "hulk", "black widow", "hawkeye", "avengers", "marvel", "dc comics",

      // Anime/Manga
      "naruto", "goku", "luffy", "eren", "sailor moon", "pokemon",

      // Historia
      "einstein", "newton", "tesla", "curie", "galileo", "darwin",
      "cleopatra", "napoleon", "lincoln", "washington",

      // Celebridades
      "monroe", "presley", "jackson", "beatles", "queen",

      // Términos que indican personaje conocido
      "de marvel", "de dc", "de disney", "personaje de", "protagonista de",
    ];

    const text = `${name} ${personality}`.toLowerCase();
    const isPublic = keywords.some(k => text.includes(k));

    return {
      isPublicFigure: isPublic,
      confidence: isPublic ? 0.6 : 0.3,
      category: isPublic ? "fictional" : "original",
      context: isPublic ? "Desconocido" : undefined,
    };
  }
}

interface WikipediaSearchResult {
  pages?: Array<{
    id: number;
    key: string;
    title: string;
    excerpt: string;
    description?: string;
  }>;
}

interface WikipediaSummary {
  type: string;
  title: string;
  displaytitle?: string;
  description: string;
  extract: string;
  extract_html?: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
    source: string;
    width: number;
    height: number;
  };
  content_urls?: {
    desktop: {
      page: string;
    };
  };
}

/**
 * Busca información biográfica sobre un personaje usando Wikipedia API (100% GRATIS)
 */
export async function searchCharacterBiography(
  name: string,
  searchQueries: string[],
  context?: string
): Promise<{ found: boolean; rawData?: string }> {
  console.log("[CharacterResearch] 🔍 Buscando en Wikipedia:", { name });

  try {
    // Paso 1: Buscar el personaje en Wikipedia (inglés primero)
    const searchUrl = `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(name)}&limit=5`;

    console.log("[CharacterResearch] 📡 Wikipedia Search API:", searchUrl);

    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'CreadorInteligencias/1.0 (Educational/Non-commercial)',
      },
    });

    if (!searchResponse.ok) {
      console.warn("[CharacterResearch] ⚠️ Wikipedia search falló:", searchResponse.status);

      // Fallback: intentar en español
      return await searchWikipediaSpanish(name);
    }

    const searchData = await searchResponse.json() as WikipediaSearchResult;

    if (!searchData.pages || searchData.pages.length === 0) {
      console.log("[CharacterResearch] ❌ No se encontró en Wikipedia inglés, intentando español...");
      return await searchWikipediaSpanish(name);
    }

    console.log(`[CharacterResearch] ✅ Encontrados ${searchData.pages.length} resultados`);

    // Paso 2: Obtener el resumen detallado del mejor resultado
    const bestMatch = searchData.pages[0];
    console.log("[CharacterResearch] 📄 Mejor resultado:", bestMatch.title);

    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestMatch.title)}`;

    const summaryResponse = await fetch(summaryUrl, {
      headers: {
        'User-Agent': 'CreadorInteligencias/1.0 (Educational/Non-commercial)',
      },
    });

    if (!summaryResponse.ok) {
      console.warn("[CharacterResearch] ⚠️ No se pudo obtener resumen");
      return { found: false };
    }

    const summary = await summaryResponse.json() as WikipediaSummary;

    // Paso 3: Filtrar páginas de desambiguación
    if (isDisambiguationPage(summary)) {
      console.log("[CharacterResearch] ⚠️ Página de desambiguación detectada, intentando segundo resultado...");

      // Intentar con el segundo resultado si existe
      if (searchData.pages.length > 1) {
        const secondMatch = searchData.pages[1];
        const secondSummaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(secondMatch.title)}`;

        const secondResponse = await fetch(secondSummaryUrl, {
          headers: {
            'User-Agent': 'CreadorInteligencias/1.0 (Educational/Non-commercial)',
          },
        });

        if (secondResponse.ok) {
          const secondSummary = await secondResponse.json() as WikipediaSummary;
          if (!isDisambiguationPage(secondSummary)) {
            return formatWikipediaData(secondSummary);
          }
        }
      }

      // Si todo falla, intentar español
      return await searchWikipediaSpanish(name);
    }

    // Paso 4: Formatear datos para el LLM
    return formatWikipediaData(summary);

  } catch (error) {
    console.error("[CharacterResearch] ❌ Error en búsqueda Wikipedia:", error);
    return { found: false };
  }
}

/**
 * Detecta si una página es de desambiguación
 */
function isDisambiguationPage(summary: WikipediaSummary): boolean {
  // Páginas de desambiguación tienen características específicas
  const disambiguationIndicators = [
    'may refer to:',
    'may also refer to',
    'topics referred to by the same term',
    'disambiguation',
  ];

  const text = `${summary.extract} ${summary.description}`.toLowerCase();

  // Si el extracto es muy corto, probablemente es desambiguación
  if (summary.extract.length < 100) {
    return true;
  }

  // Si contiene indicadores de desambiguación
  return disambiguationIndicators.some(indicator => text.includes(indicator));
}

/**
 * Formatea datos de Wikipedia para el LLM
 */
function formatWikipediaData(summary: WikipediaSummary): { found: boolean; rawData: string } {
  const rawData = `
TÍTULO: ${summary.title}
DESCRIPCIÓN: ${summary.description}

EXTRACTO COMPLETO:
${summary.extract}

${summary.thumbnail ? `IMAGEN: ${summary.thumbnail.source}` : ''}

FUENTE: Wikipedia
ENLACE: ${summary.content_urls?.desktop.page || 'N/A'}
  `.trim();

  console.log("[CharacterResearch] ✅ Datos formateados, caracteres:", rawData.length);

  return {
    found: true,
    rawData,
  };
}

/**
 * Busca en Wikipedia en español como fallback
 */
async function searchWikipediaSpanish(name: string): Promise<{ found: boolean; rawData?: string }> {
  try {
    console.log("[CharacterResearch] 🇪🇸 Intentando Wikipedia en español...");

    const summaryUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;

    const response = await fetch(summaryUrl, {
      headers: {
        'User-Agent': 'CreadorInteligencias/1.0 (Educational/Non-commercial)',
      },
    });

    if (!response.ok) {
      console.log("[CharacterResearch] ❌ No encontrado en español tampoco");
      return { found: false };
    }

    const summary = await response.json() as WikipediaSummary;

    // Verificar si es página de desambiguación
    if (isDisambiguationPage(summary)) {
      console.log("[CharacterResearch] ⚠️ También es página de desambiguación en español");
      return { found: false };
    }

    console.log("[CharacterResearch] ✅ Encontrado en Wikipedia español");
    return formatWikipediaData(summary);

  } catch (error) {
    console.error("[CharacterResearch] ❌ Error en Wikipedia español:", error);
    return { found: false };
  }
}

/**
 * Extrae y estructura información biográfica usando LLM
 */
export async function extractBiographyData(
  name: string,
  rawSearchResults: string,
  context?: string
): Promise<CharacterBiography> {
  const llm = new LLMProvider();

  const extractionPrompt = `Extrae información biográfica estructurada de estos resultados de búsqueda:

PERSONAJE: ${name}
${context ? `CONTEXTO: ${context}` : ""}

RESULTADOS DE BÚSQUEDA:
${rawSearchResults}

TAREA: Extraer información precisa y estructurada.

IMPORTANTE:
- USA SOLO información que aparece en los resultados
- Si algo no está claro, usa "unknown" o null
- Para personajes de ficción, incluye el contexto (MCU, Comics, Serie específica)
- Para edades, si no hay número exacto, usa rangos ("~50", "30-40")

Responde SOLO con este JSON (sin markdown):
{
  "found": true/false,
  "fullName": "nombre completo oficial",
  "age": "edad o rango de edad",
  "nationality": "nacionalidad",
  "city": "ciudad de residencia principal",
  "occupation": "ocupación principal",
  "family": {
    "spouse": "nombre de esposo/a o null",
    "children": ["hijo1", "hijo2"] o null,
    "parents": {
      "father": "nombre del padre o null",
      "mother": "nombre de la madre o null"
    },
    "siblings": ["hermano1"] o null
  },
  "personality": "descripción de personalidad basada en el personaje real",
  "background": "historia/backstory resumida (2-3 oraciones)",
  "keyTraits": ["rasgo1", "rasgo2", "rasgo3"],
  "relationships": [
    {
      "name": "nombre persona",
      "type": "tipo de relación (amigo, enemigo, amor, mentor)",
      "description": "descripción breve"
    }
  ],
  "sourceContext": "de dónde viene esta información (MCU, Comics, Historia real, etc.)"
}`;

  try {
    const response = await llm.generate({
      systemPrompt: "Eres un experto en extraer y estructurar información biográfica. Respondes únicamente con JSON válido.",
      messages: [{ role: "user", content: extractionPrompt }],
      temperature: 0.2,
      maxTokens: 1500,
    });

    let cleaned = response.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const biography = JSON.parse(cleaned) as CharacterBiography;

    console.log("[CharacterResearch] Extracción completada:", {
      name: biography.fullName,
      found: biography.found,
    });

    return biography;
  } catch (error) {
    console.error("[CharacterResearch] Error en extracción:", error);
    return {
      found: false,
      rawData: rawSearchResults,
    };
  }
}

/**
 * Función principal: investigar personaje completo
 */
export async function researchCharacter(
  name: string,
  personality: string,
  purpose?: string
): Promise<{
  detection: CharacterDetectionResult;
  biography: CharacterBiography | null;
  enhancedPrompt: string | null;
}> {
  console.log("[CharacterResearch] 🔍 Iniciando investigación:", { name });

  // Paso 1: Detectar si es personaje público
  const detection = await detectPublicCharacter(name, personality, purpose);

  if (!detection.isPublicFigure || detection.confidence < 0.5) {
    console.log("[CharacterResearch] ❌ No es personaje público, usando generación normal");
    return {
      detection,
      biography: null,
      enhancedPrompt: null,
    };
  }

  console.log("[CharacterResearch] ✅ Personaje público detectado:", {
    category: detection.category,
    context: detection.context,
    confidence: detection.confidence,
  });

  // Paso 2: Buscar información biográfica
  if (!detection.suggestedSearchQueries || detection.suggestedSearchQueries.length === 0) {
    console.log("[CharacterResearch] ⚠️ No hay queries de búsqueda, usando generación normal");
    return {
      detection,
      biography: null,
      enhancedPrompt: null,
    };
  }

  console.log("[CharacterResearch] 🌐 Buscando información en web...");
  const searchResult = await searchCharacterBiography(
    name,
    detection.suggestedSearchQueries,
    detection.context
  );

  if (!searchResult.found || !searchResult.rawData) {
    console.log("[CharacterResearch] ⚠️ No se encontró información, usando generación normal");
    return {
      detection,
      biography: null,
      enhancedPrompt: null,
    };
  }

  // Paso 3: Extraer y estructurar datos
  console.log("[CharacterResearch] 📊 Extrayendo datos estructurados...");
  const biography = await extractBiographyData(name, searchResult.rawData, detection.context);

  if (!biography.found) {
    console.log("[CharacterResearch] ⚠️ No se pudo estructurar información, usando generación normal");
    return {
      detection,
      biography: null,
      enhancedPrompt: null,
    };
  }

  // Paso 4: Generar prompt enriquecido
  console.log("[CharacterResearch] ✨ Generando prompt enriquecido con datos reales");
  const enhancedPrompt = `
⚠️ INFORMACIÓN BIOGRÁFICA VERIFICADA DE WEB SEARCH:

Este personaje es conocido: ${biography.fullName || name}
Contexto fuente: ${biography.sourceContext || detection.context}
Categoría: ${detection.category}

DATOS REALES EXTRAÍDOS DE BÚSQUEDA WEB (USA ESTOS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${biography.fullName ? `✓ Nombre completo: ${biography.fullName}` : ''}
${biography.age ? `✓ Edad: ${biography.age}` : ''}
${biography.nationality ? `✓ Nacionalidad: ${biography.nationality}` : ''}
${biography.city ? `✓ Ciudad de residencia: ${biography.city}` : ''}
${biography.occupation ? `✓ Ocupación: ${biography.occupation}` : ''}

${biography.family ? `
FAMILIA CONOCIDA:
${biography.family.spouse ? `- Esposo/a: ${biography.family.spouse}` : ''}
${biography.family.children && biography.family.children.length > 0 ? `- Hijos: ${biography.family.children.join(", ")}` : ''}
${biography.family.parents?.father ? `- Padre: ${biography.family.parents.father}` : ''}
${biography.family.parents?.mother ? `- Madre: ${biography.family.parents.mother}` : ''}
${biography.family.siblings && biography.family.siblings.length > 0 ? `- Hermanos: ${biography.family.siblings.join(", ")}` : ''}
` : ''}

${biography.personality ? `PERSONALIDAD DOCUMENTADA:\n${biography.personality}` : ''}

${biography.background ? `BACKSTORY:\n${biography.background}` : ''}

${biography.keyTraits && biography.keyTraits.length > 0 ? `
RASGOS CLAVE:
${biography.keyTraits.map(t => `• ${t}`).join('\n')}
` : ''}

${biography.relationships && biography.relationships.length > 0 ? `
RELACIONES IMPORTANTES:
${biography.relationships.map(r => `• ${r.name} (${r.type}): ${r.description}`).join('\n')}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 INSTRUCCIÓN CRÍTICA PARA GENERATEPROFILE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. USA OBLIGATORIAMENTE los datos reales proporcionados arriba
2. NO inventes información que contradiga los hechos conocidos
3. NO uses valores por defecto genéricos (Buenos Aires, Argentina, etc.)
4. Si falta información específica, INFIÉRELA coherentemente con el personaje real
5. Mantén consistencia con el universo/contexto del personaje (${biography.sourceContext})

Ejemplo: Si el personaje es Tony Stark del MCU:
✓ CORRECTO: Malibu/Nueva York, Estados Unidos, CEO Stark Industries, padre Howard Stark (fallecido), madre Maria Stark (fallecida), esposa Pepper Potts, hija Morgan Stark
✗ INCORRECTO: Buenos Aires, Argentina, profesor, madre Carmen viva, etc.
`;

  console.log("[CharacterResearch] ✅ Investigación completada con éxito");

  return {
    detection,
    biography,
    enhancedPrompt,
  };
}
