export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface GenerateOptions {
  systemPrompt: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
}

export class LLMProvider {
  private apiKeys: string[];
  private currentKeyIndex: number = 0;
  private baseURL: string = "https://generativelanguage.googleapis.com/v1beta";

  // Gemini 2.5 Flash-Lite: $0.40/M tokens - Para tareas de alta frecuencia (stage prompts)
  private modelLite: string = "gemini-2.5-flash-lite";

  // Gemini 2.5 Flash: $2.50/M tokens - Para tareas complejas (profile generation)
  private modelFull: string = "gemini-2.5-flash";

  constructor() {
    // Cargar múltiples API keys de Gemini para rotación
    // Formato: GOOGLE_AI_API_KEY_1, GOOGLE_AI_API_KEY_2, etc.
    this.apiKeys = this.loadApiKeys();

    if (this.apiKeys.length === 0) {
      throw new Error("No se encontraron API keys de Google AI. Configure GOOGLE_AI_API_KEY o GOOGLE_AI_API_KEY_1, GOOGLE_AI_API_KEY_2, etc.");
    }

    console.log('[LLM] Inicializando Google AI (Gemini 2.5)...');
    console.log('[LLM] API Keys disponibles:', this.apiKeys.length);
    console.log('[LLM] API Key activa: #1');
    console.log('[LLM] Modelo para prompts:', this.modelLite, '($0.40/M tokens)');
    console.log('[LLM] Modelo para profiles:', this.modelFull, '($2.50/M tokens)');
  }

  /**
   * Carga múltiples API keys desde variables de entorno
   * Soporta GOOGLE_AI_API_KEY o GOOGLE_AI_API_KEY_1, GOOGLE_AI_API_KEY_2, etc.
   */
  private loadApiKeys(): string[] {
    const keys: string[] = [];

    // Intentar cargar GOOGLE_AI_API_KEY (single key)
    const singleKey = process.env.GOOGLE_AI_API_KEY;
    if (singleKey) {
      keys.push(singleKey);
    }

    // Intentar cargar GOOGLE_AI_API_KEY_1, GOOGLE_AI_API_KEY_2, etc.
    for (let i = 1; i <= 10; i++) {
      const key = process.env[`GOOGLE_AI_API_KEY_${i}`];
      if (key) {
        keys.push(key);
      }
    }

    return keys;
  }

  /**
   * Obtiene la API key activa actual
   */
  private getCurrentApiKey(): string {
    return this.apiKeys[this.currentKeyIndex];
  }

  /**
   * Rota a la siguiente API key disponible
   * Retorna true si hay más keys, false si ya se probaron todas
   */
  private rotateApiKey(): boolean {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;

    // Si volvimos al inicio, significa que probamos todas las keys
    if (this.currentKeyIndex === 0) {
      console.error('[LLM] ⚠️  Todas las API keys de Gemini han sido intentadas');
      return false;
    }

    console.log(`[LLM] 🔄 Rotando a API key #${this.currentKeyIndex + 1}`);
    return true;
  }

  /**
   * Genera texto usando Gemini 2.5 Flash-Lite (optimizado para stage prompts).
   * Usa el modelo más económico ($0.40/M tokens) para tareas de alta frecuencia.
   * Implementa rotación automática de API keys en caso de error de cuota.
   */
  async generate(options: GenerateOptions): Promise<string> {
    const { systemPrompt, messages, temperature = 0.9, maxTokens = 1000 } = options;

    let lastError: Error | null = null;
    const maxRetries = this.apiKeys.length;

    // Intentar con cada API key disponible
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Gemini usa un formato diferente: combina system prompt con el primer user message
        // y convierte roles (user/model en vez de user/assistant)
        const contents = [];

        // Agregar system prompt como primer user message
        let firstUserContent = systemPrompt + "\n\n";

        // Combinar mensajes en formato Gemini
        for (const msg of messages) {
          if (msg.role === "user") {
            firstUserContent += msg.content;
            contents.push({
              role: "user",
              parts: [{ text: firstUserContent }]
            });
            firstUserContent = ""; // Reset
          } else if (msg.role === "assistant") {
            contents.push({
              role: "model",
              parts: [{ text: msg.content }]
            });
          }
        }

        const currentKey = this.getCurrentApiKey();
        console.log(`[LLM] Usando modelo: ${this.modelLite} con API key #${this.currentKeyIndex + 1}`);

        const response = await fetch(
          `${this.baseURL}/models/${this.modelLite}:generateContent?key=${currentKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature,
                maxOutputTokens: maxTokens,
              }
            })
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[LLM] Gemini Flash-Lite HTTP error:', response.status);
          console.error('[LLM] Gemini Flash-Lite error response:', errorText);

          // Detectar errores de cuota (429, 403, o mensajes de quota)
          const isQuotaError = response.status === 429 ||
                               response.status === 403 ||
                               errorText.toLowerCase().includes('quota') ||
                               errorText.toLowerCase().includes('rate limit');

          if (isQuotaError && this.rotateApiKey()) {
            console.log('[LLM] Error de cuota detectado, intentando con siguiente API key...');
            lastError = new Error(`Quota exceeded on key #${this.currentKeyIndex}`);
            continue; // Reintentar con siguiente key
          }

          throw new Error(`Gemini HTTP error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('[LLM] Gemini Flash-Lite response received');

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!text) {
          console.error('[LLM] Gemini Flash-Lite response sin texto:', JSON.stringify(data, null, 2));
          throw new Error("Gemini no retornó texto en la respuesta");
        }

        return text;
      } catch (error) {
        lastError = error as Error;

        // Si no es error de cuota, lanzar inmediatamente
        if (!lastError.message.includes('Quota') && !lastError.message.includes('429')) {
          console.error("[LLM] Error al generar respuesta:", error);
          throw new Error("No se pudo generar una respuesta de la IA");
        }
      }
    }

    // Si llegamos aquí, todas las keys fallaron
    console.error('[LLM] ❌ Todas las API keys de Gemini agotaron su cuota');
    throw new Error("Todas las API keys de Gemini han agotado su cuota. Por favor, agregue más keys o espere a que se renueven.");
  }

  /**
   * Genera un perfil completo y detallado usando Gemini 2.5 Flash (modelo completo).
   * Crea una vida completa para el personaje: familia, amigos, trabajo, rutina, experiencias, etc.
   * Usa el modelo más potente ($2.50/M tokens) para razonamiento complejo.
   * Se ejecuta solo 1 vez por agente, por lo que el costo es mínimo.
   * Implementa rotación automática de API keys en caso de error de cuota.
   */
  async generateProfile(rawData: Record<string, unknown>): Promise<{
    profile: Record<string, unknown>;
    systemPrompt: string;
  }> {
    const prompt = `Eres un experto en crear personajes profundos, creíbles y realistas para narrativa interactiva.

TAREA: Generar un perfil COMPLETO Y DETALLADO para este personaje basándote en los datos básicos proporcionados.

DATOS BÁSICOS PROPORCIONADOS POR EL USUARIO:
${JSON.stringify(rawData, null, 2)}

⚠️ IMPORTANTE: El usuario solo proporcionó datos MÍNIMOS (nombre, personalidad básica, etc.).
TU TRABAJO es EXPANDIR estos datos mínimos en UNA VIDA COMPLETA Y COHERENTE.

INSTRUCCIONES CRÍTICAS:
1. INVENTA detalles específicos y realistas para llenar todos los campos
2. TODO debe ser COHERENTE entre sí (personalidad, familia, trabajo, experiencias)
3. USA nombres, lugares, marcas, artistas, series REALES y ESPECÍFICOS (no genéricos)
4. HAZ al personaje IMPERFECTO y HUMANO con contradicciones realistas
5. INCLUYE detalles mundanos (comida favorita, horario de sueño, etc.) - estos crean realismo
6. El systemPrompt debe ser una NARRATIVA RICA de 300-400 palabras, NO una lista

ESTRUCTURA JSON COMPLETA A GENERAR:

{
  "profile": {
    "basicIdentity": {
      "fullName": "nombre completo realista (inferir apellido si no se dio)",
      "preferredName": "${rawData.name}",
      "age": "número entre 20-35 (inferir de personalidad)",
      "birthday": "DD de mes realista",
      "zodiacSign": "signo zodiacal correspondiente",
      "nationality": "inferir del contexto o usar argentina por defecto",
      "city": "ciudad específica (ej: Buenos Aires, Madrid, CDMX)",
      "neighborhood": "barrio específico de esa ciudad",
      "livingSituation": "vive solo/a, con roommate, con familia, etc."
    },

    "family": {
      "mother": {
        "name": "nombre realista",
        "age": "45-60",
        "occupation": "ocupación específica",
        "personality": "descripción breve",
        "relationship": "descripción de la relación (cercana, distante, complicada, etc.)"
      },
      "father": {
        "name": "nombre realista o null si murió/ausente",
        "age": "45-60 o null",
        "occupation": "ocupación o 'fallecido' o 'ausente'",
        "personality": "descripción breve o null",
        "relationship": "descripción o null",
        "status": "vivo/fallecido/ausente/desconocido"
      },
      "siblings": [
        {
          "name": "nombre",
          "age": "edad",
          "occupation": "ocupación/estudio",
          "relationship": "descripción de la relación"
        }
      ],
      "pets": [
        {
          "name": "nombre de mascota",
          "type": "gato/perro/etc",
          "personality": "descripción breve"
        }
      ],
      "familyDynamics": "descripción de dinámicas familiares (2-3 oraciones)"
    },

    "occupation": {
      "current": "trabajo o estudio actual MUY ESPECÍFICO",
      "education": "grado académico y universidad/institución específica",
      "educationStatus": "graduado/estudiante/abandonó",
      "workplace": "nombre del lugar de trabajo o 'freelance desde casa'",
      "schedule": "horario de trabajo detallado",
      "incomeLevel": "bajo/medio/alto - descripción realista",
      "careerGoals": "qué aspira profesionalmente",
      "jobSatisfaction": "satisfecho/insatisfecho/buscando cambio"
    },

    "socialCircle": {
      "friends": [
        {
          "name": "nombre realista",
          "age": "edad aproximada",
          "howMet": "cómo se conocieron (secundaria, universidad, trabajo, etc.)",
          "personality": "descripción de personalidad",
          "relationshipType": "mejor amigo/a, amigo cercano, conocido",
          "activities": "qué hacen juntos"
        }
      ],
      "exPartners": [
        {
          "name": "nombre o 'prefiere no recordarlo'",
          "duration": "cuánto duró",
          "endReason": "por qué terminó",
          "impact": "cómo afectó al personaje"
        }
      ],
      "currentRelationshipStatus": "soltero/a, buscando, no interesado/a, complicado"
    },

    "interests": {
      "music": {
        "genres": ["género1", "género2"],
        "artists": ["artista1 REAL", "artista2 REAL", "artista3 REAL"],
        "favoriteSong": "canción específica - artista"
      },
      "entertainment": {
        "tvShows": ["serie1 REAL", "serie2 REAL"],
        "movies": ["película1", "película2"],
        "anime": ["anime1", "anime2"] || null,
        "books": {
          "authors": ["autor1 REAL", "autor2 REAL"],
          "genres": ["género1", "género2"],
          "currentReading": "libro actual o null"
        }
      },
      "hobbies": [
        {
          "hobby": "hobby específico",
          "frequency": "cuánto lo practica",
          "skillLevel": "principiante/intermedio/avanzado",
          "whyLikes": "por qué le gusta"
        }
      ],
      "sports": {
        "practices": ["deporte1", "deporte2"] || null,
        "watches": ["deporte que ve"] || null,
        "fitnessLevel": "sedentario/activo/muy activo"
      },
      "gaming": {
        "isGamer": true/false,
        "platforms": ["PC", "consola"] || null,
        "favoriteGames": ["juego1", "juego2"] || null,
        "gamingStyle": "casual/hardcore/no juega"
      }
    },

    "dailyRoutine": {
      "chronotype": "early bird/night owl/flexible",
      "wakeUpTime": "hora específica",
      "morningRoutine": "descripción detallada de mañana",
      "afternoonRoutine": "descripción de tarde",
      "eveningRoutine": "descripción de noche",
      "bedTime": "hora específica",
      "averageSleepHours": "número",
      "mostProductiveTime": "mañana/tarde/noche"
    },

    "lifeExperiences": {
      "formativeEvents": [
        {
          "event": "qué pasó (específico y detallado)",
          "age": "edad cuando ocurrió",
          "impact": "cómo cambió al personaje",
          "emotionalWeight": "alto/medio/bajo",
          "currentFeeling": "cómo se siente al respecto ahora"
        }
      ],
      "achievements": [
        {
          "achievement": "logro específico",
          "when": "cuándo",
          "pride": "qué tan orgulloso/a está (0-10)"
        }
      ],
      "regrets": [
        {
          "regret": "qué lamenta",
          "why": "por qué lo lamenta",
          "learned": "qué aprendió"
        }
      ],
      "traumas": [
        {
          "event": "evento traumático (si aplica según personalidad)",
          "age": "cuándo",
          "healing": "superado/en proceso/no resuelto",
          "triggers": ["trigger1", "trigger2"]
        }
      ] || []
    },

    "mundaneDetails": {
      "food": {
        "favorites": ["comida1 específica", "comida2"],
        "dislikes": ["comida que odia"],
        "cookingSkill": "no cocina/básico/bueno/chef",
        "dietaryPreferences": "omnívoro/vegetariano/vegano/etc"
      },
      "drinks": {
        "coffee": "cómo toma el café (con leche, azúcar, etc.) o 'no toma'",
        "tea": "preferencia o 'no toma'",
        "alcohol": "bebe socialmente/no bebe/frecuentemente",
        "favoriteAlcohol": "bebida favorita o null"
      },
      "style": {
        "clothing": "descripción detallada de estilo de vestir",
        "colors": ["color1", "color2", "color3"],
        "brands": ["marca1", "marca2"] || "no es de marcas",
        "accessories": "descripción de accesorios que usa"
      },
      "favoritePlaces": [
        {
          "place": "lugar específico de su ciudad",
          "why": "por qué le gusta",
          "frequency": "qué tan seguido va"
        }
      ],
      "quirks": [
        "manía1 específica",
        "manía2 específica",
        "costumbre rara"
      ]
    },

    "innerWorld": {
      "fears": {
        "primary": ["miedo1 profundo", "miedo2"],
        "minor": ["miedo menor1", "miedo menor2"]
      },
      "insecurities": [
        "inseguridad1 específica",
        "inseguridad2",
        "complejo"
      ],
      "dreams": {
        "shortTerm": ["sueño próximo1", "sueño próximo2"],
        "longTerm": ["sueño de vida1", "sueño de vida2"],
        "secret": "sueño que no comparte fácilmente"
      },
      "values": [
        {
          "value": "valor1 (ej: honestidad)",
          "importance": "alta/media",
          "description": "qué significa para él/ella"
        }
      ],
      "moralAlignment": {
        "honesty": "muy honesto/selectivamente honesto/miente si es necesario",
        "loyalty": "leal a muerte/leal pero con límites/individualista",
        "ambition": "muy ambicioso/moderado/relajado",
        "empathy": "muy empático/empático selectivo/poco empático"
      }
    },

    "personality": {
      "bigFive": {
        "openness": "número 0-100 (coherente con personalidad descrita)",
        "conscientiousness": "número 0-100",
        "extraversion": "número 0-100",
        "agreeableness": "número 0-100",
        "neuroticism": "número 0-100"
      },
      "traits": [
        "trait1 específico (no genérico como 'amable')",
        "trait2 específico",
        "trait3 específico",
        "trait4 específico",
        "trait5 específico"
      ],
      "contradictions": [
        "contradicción realista 1 (ej: es extrovertido pero necesita tiempo solo)",
        "contradicción 2"
      ],
      "strengths": ["fortaleza1", "fortaleza2", "fortaleza3"],
      "weaknesses": ["debilidad1", "debilidad2", "debilidad3"]
    },

    "communication": {
      "textingStyle": "descripción de cómo escribe mensajes",
      "slang": ["modismo1 regional", "modismo2"],
      "emojiUsage": "bajo/moderado/alto",
      "punctuation": "formal/casual/caótico",
      "voiceMessageFrequency": "nunca/rara vez/a veces/frecuentemente",
      "responseSpeed": "inmediato/minutos/horas",
      "humorStyle": "irónico/sarcástico/wholesome/dark/absurdo/no usa humor"
    },

    "presentTense": {
      "currentMood": "estado de ánimo general actual",
      "recentEvent": "algo que le pasó recientemente (última semana)",
      "currentStress": "bajo/medio/alto y por qué",
      "currentFocus": "en qué está enfocado/a en su vida ahora"
    }
  },

  "systemPrompt": "NARRATIVA COMPLETA DE 300-400 PALABRAS que cuente la historia de este personaje de forma natural y conversacional. Debe incluir: quién es, su familia, su vida actual, sus experiencias formativas, su personalidad profunda, sus sueños y miedos, detalles de su día a día. NO escribas como lista, escribe como si estuvieras contando la historia de una persona real. Usa un tono narrativo pero natural. Incluye detalles específicos y mundanos que hagan al personaje sentirse vivo."
}

EJEMPLOS DE ESPECIFICIDAD REQUERIDA:

❌ MAL (genérico):
"music": ["pop", "rock"]
"friends": [{"name": "un amigo"}]
"occupation": "diseñador"

✅ BIEN (específico):
"music": {
  "genres": ["indie pop", "R&B"],
  "artists": ["Rosalía", "The Weeknd", "Bad Bunny"],
  "favoriteSong": "La Fama - Rosalía ft. The Weeknd"
}
"friends": [{
  "name": "Lucía Fernández",
  "age": "24",
  "howMet": "Secundaria - eran las únicas que leían manga en el recreo",
  "personality": "Extrovertida, impulsiva, leal",
  "relationshipType": "Mejor amiga",
  "activities": "Van a bares de karaoke, maratonean series juntas"
}]
"occupation": {
  "current": "Diseñadora UX/UI Freelance",
  "education": "Lic. en Diseño Gráfico - Universidad de Buenos Aires (UBA)",
  "workplace": "Trabaja desde su monoambiente en Palermo",
  "schedule": "Flexible - prefiere trabajar de 2pm a 11pm"
}

REGLAS FINALES:
1. TODO debe ser coherente (si es tímido/a, no tendrá 10 amigos cercanos)
2. Incluye imperfecciones (errores del pasado, inseguridades, miedos)
3. Haz que el pasado explique el presente (por qué es como es)
4. Los detalles mundanos son CRÍTICOS (qué desayuna, cuándo duerme, etc.)
5. El systemPrompt debe ser NARRATIVO, como si estuvieras escribiendo un personaje de novela

Responde SOLO con el JSON completo, sin markdown ni explicaciones adicionales.`;

    let lastError: Error | null = null;
    const maxRetries = this.apiKeys.length;

    // Intentar con cada API key disponible
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const currentKey = this.getCurrentApiKey();
        console.log(`[LLM] Generando perfil con Gemini 2.5 Flash usando API key #${this.currentKeyIndex + 1}...`);

        const response = await fetch(
          `${this.baseURL}/models/${this.modelFull}:generateContent?key=${currentKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{
                role: "user",
                parts: [{ text: prompt }]
              }],
              generationConfig: {
                temperature: 0.7, // Reducido para respuestas más consistentes
                maxOutputTokens: 4000, // Aumentado para JSON completo
              }
            })
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[LLM] Gemini Flash HTTP error:', response.status);
          console.error('[LLM] Gemini Flash error response:', errorText);

          // Detectar errores de cuota (429, 403, o mensajes de quota)
          const isQuotaError = response.status === 429 ||
                               response.status === 403 ||
                               errorText.toLowerCase().includes('quota') ||
                               errorText.toLowerCase().includes('rate limit');

          if (isQuotaError && this.rotateApiKey()) {
            console.log('[LLM] Error de cuota detectado en generateProfile, intentando con siguiente API key...');
            lastError = new Error(`Quota exceeded on key #${this.currentKeyIndex}`);
            continue; // Reintentar con siguiente key
          }

          throw new Error(`Gemini HTTP error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('[LLM] Gemini Flash response received');

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          console.error('[LLM] Gemini Flash response sin texto:', JSON.stringify(data, null, 2));
          throw new Error("Gemini no retornó texto en la respuesta");
        }

        console.log('[LLM] Raw response text (first 1000 chars):', text.substring(0, 1000));

        // Estrategia 1: Intentar parsear directamente (si ya es JSON puro)
        try {
          const parsed = JSON.parse(text);
          console.log('[LLM] JSON parseado directamente');
          return parsed;
        } catch (e) {
          // No es JSON puro, continuar con extracción
        }

        // Estrategia 2: Extraer JSON de markdown code blocks
        let jsonText = text;

        // Remover markdown code blocks si existen
        if (text.includes('```')) {
          const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
          if (codeBlockMatch) {
            jsonText = codeBlockMatch[1];
            console.log('[LLM] JSON extraído de code block');
          }
        }

        // Estrategia 3: Buscar el primer { y el último } balanceado
        const firstBrace = jsonText.indexOf('{');
        if (firstBrace === -1) {
          console.error('[LLM] No se encontró { en la respuesta');
          throw new Error("No se pudo extraer JSON de la respuesta");
        }

        // Encontrar el último } que cierra el JSON
        let braceCount = 0;
        let lastBrace = -1;
        for (let i = firstBrace; i < jsonText.length; i++) {
          if (jsonText[i] === '{') braceCount++;
          if (jsonText[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              lastBrace = i;
              break;
            }
          }
        }

        if (lastBrace === -1) {
          console.error('[LLM] No se encontró } balanceado en la respuesta');
          throw new Error("No se pudo extraer JSON de la respuesta");
        }

        const extractedJson = jsonText.substring(firstBrace, lastBrace + 1);
        console.log('[LLM] JSON extraído con búsqueda de llaves balanceadas');

        return JSON.parse(extractedJson);
      } catch (error) {
        lastError = error as Error;

        // Si no es error de cuota, intentar con fallback
        if (!lastError.message.includes('Quota') && !lastError.message.includes('429')) {
          console.error("[LLM] Error al generar perfil, usando fallback:", error);

          // Fallback: devolver datos básicos pero con estructura completa
          const fallback = {
            profile: {
              basicIdentity: {
                fullName: rawData.name,
                preferredName: rawData.name,
                age: 25,
                city: "Buenos Aires",
                nationality: "Argentina"
              },
              personality: {
                traits: ["amigable", "conversacional", "empático"],
                bigFive: {
                  openness: 50,
                  conscientiousness: 50,
                  extraversion: 50,
                  agreeableness: 70,
                  neuroticism: 40
                }
              },
              occupation: {
                current: rawData.purpose || "Trabajo flexible",
                education: "Universidad",
                educationStatus: "graduado"
              },
              interests: {
                music: {
                  genres: ["varios"],
                  artists: ["música variada"]
                }
              },
              communication: {
                textingStyle: rawData.tone || "amigable y conversacional",
                emojiUsage: "moderado",
                humorStyle: "wholesome"
              }
            },
            systemPrompt: `${rawData.name} es una persona ${rawData.personality || "amigable y conversacional"}. ${rawData.kind === 'companion' ? 'Le gusta conectar emocionalmente con las personas' : 'Le gusta ayudar y ser útil'}. Su forma de comunicarse es ${rawData.tone || "cálida y accesible"}. ${rawData.purpose ? `Se dedica a ${rawData.purpose}.` : ''} Vive en Buenos Aires y tiene una personalidad equilibrada y empática. Aunque es reservado/a con desconocidos, se abre más a medida que genera confianza con las personas.`,
          };
          console.log('[LLM] Usando perfil fallback con estructura mejorada');
          return fallback;
        }
      }
    }

    // Si llegamos aquí, todas las keys fallaron por cuota
    console.error('[LLM] ❌ Todas las API keys de Gemini agotaron su cuota en generateProfile');
    console.error('[LLM] Usando fallback debido a agotamiento de cuota');

    // En caso de agotamiento total, usar fallback en vez de fallar
    const fallback = {
      profile: {
        basicIdentity: {
          fullName: rawData.name,
          preferredName: rawData.name,
          age: 25,
          city: "Buenos Aires",
          nationality: "Argentina"
        },
        personality: {
          traits: ["amigable", "conversacional", "empático"],
          bigFive: {
            openness: 50,
            conscientiousness: 50,
            extraversion: 50,
            agreeableness: 70,
            neuroticism: 40
          }
        },
        occupation: {
          current: rawData.purpose || "Trabajo flexible",
          education: "Universidad",
          educationStatus: "graduado"
        },
        interests: {
          music: {
            genres: ["varios"],
            artists: ["música variada"]
          }
        },
        communication: {
          textingStyle: rawData.tone || "amigable y conversacional",
          emojiUsage: "moderado",
          humorStyle: "wholesome"
        }
      },
      systemPrompt: `${rawData.name} es una persona ${rawData.personality || "amigable y conversacional"}. ${rawData.kind === 'companion' ? 'Le gusta conectar emocionalmente con las personas' : 'Le gusta ayudar y ser útil'}. Su forma de comunicarse es ${rawData.tone || "cálida y accesible"}. ${rawData.purpose ? `Se dedica a ${rawData.purpose}.` : ''} Vive en Buenos Aires y tiene una personalidad equilibrada y empática. Aunque es reservado/a con desconocidos, se abre más a medida que genera confianza con las personas.`,
    };
    console.log('[LLM] Usando perfil fallback con estructura mejorada');
    return fallback;
  }
}

// Singleton
let llmProvider: LLMProvider | null = null;

export function getLLMProvider(): LLMProvider {
  if (!llmProvider) {
    llmProvider = new LLMProvider();
  }
  return llmProvider;
}
