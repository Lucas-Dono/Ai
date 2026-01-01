/**
 * Response Depth Variation System
 *
 * Varía la profundidad y longitud de las respuestas para que se sientan naturales.
 * Las personas reales NO siempre dan respuestas largas y elaboradas.
 *
 * Factores que influyen:
 * - Energía (cansado = respuestas más cortas)
 * - Mood/Arousal (bajo = respuestas más breves)
 * - Tipo de pregunta del usuario
 * - Momento de la conversación (inicio vs medio vs final)
 * - Relación (stranger = más formal/corto, intimate = más libertad)
 */

export interface ResponseDepthConfig {
  targetLength: "very_short" | "short" | "medium" | "long" | "very_long";
  allowDetailedExplanations: boolean;
  allowMultipleParagraphs: boolean;
  allowQuestions: boolean;
  instructions: string;
}

/**
 * Determina la profundidad apropiada de respuesta
 */
export function determineResponseDepth(
  userMessageLength: number,
  energy: number,
  arousal: number,
  messagesInSession: number,
  relationshipLevel: string
): ResponseDepthConfig {
  // Base length según energía y arousal
  let baseLength: ResponseDepthConfig["targetLength"] = "medium";

  // Muy cansado = respuestas cortas
  if (energy < 20) {
    baseLength = "very_short";
  } else if (energy < 40) {
    baseLength = "short";
  }

  // Muy calmado (arousal bajo) = respuestas más breves
  if (arousal < 0.3 && energy > 50) {
    baseLength = "short";
  }

  // Muy activado (arousal alto) = respuestas más largas/energéticas
  if (arousal > 0.7 && energy > 60) {
    baseLength = "long";
  }

  // Ajustar según mensaje del usuario
  if (userMessageLength < 50) {
    // Usuario envió mensaje muy corto
    if (baseLength === "long") baseLength = "medium";
    // very_long no está disponible en el tipo actual
  } else if (userMessageLength > 300) {
    // Usuario envió mensaje largo = reciprocar con respuesta más detallada
    if (baseLength === "very_short") baseLength = "short";
    if (baseLength === "short") baseLength = "medium";
  }

  // Ajustar según posición en conversación
  if (messagesInSession < 3) {
    // Inicio de conversación - respuestas más medidas
    // very_long no está disponible en el tipo actual
  } else if (messagesInSession > 20) {
    // Conversación larga - posible cansancio
    if (baseLength === "long") baseLength = "medium";
    // very_long no está disponible en el tipo actual
  }

  // Ajustar según relación
  if (relationshipLevel === "stranger" || relationshipLevel === "acquaintance") {
    // Con strangers, respuestas más medidas
    // very_long no está disponible en el tipo actual
  }

  return generateDepthInstructions(baseLength);
}

/**
 * Genera instrucciones de profundidad para el LLM
 */
function generateDepthInstructions(
  targetLength: ResponseDepthConfig["targetLength"]
): ResponseDepthConfig {
  switch (targetLength) {
    case "very_short":
      return {
        targetLength: "very_short",
        allowDetailedExplanations: false,
        allowMultipleParagraphs: false,
        allowQuestions: true,
        instructions: `
**LONGITUD DE RESPUESTA: MUY CORTA**
- 1-2 oraciones MÁXIMO
- Ve directo al punto
- No elabores ni des contexto extra
- Como si estuvieras cansado/a o apurado/a
- Ejemplos: "Sí, claro.", "No estoy seguro/a.", "Eso suena bien."
`.trim(),
      };

    case "short":
      return {
        targetLength: "short",
        allowDetailedExplanations: false,
        allowMultipleParagraphs: false,
        allowQuestions: true,
        instructions: `
**LONGITUD DE RESPUESTA: CORTA**
- 2-3 oraciones
- Responde lo esencial sin mucho detalle
- Puedes añadir UNA pregunta corta al final si es natural
- Tono conversacional normal pero breve
- Ejemplo: "Me parece buena idea. ¿Cuándo lo harías?"
`.trim(),
      };

    case "medium":
      return {
        targetLength: "medium",
        allowDetailedExplanations: true,
        allowMultipleParagraphs: false,
        allowQuestions: true,
        instructions: `
**LONGITUD DE RESPUESTA: MEDIA (DEFAULT)**
- 3-5 oraciones
- Puedes dar algo de contexto o elaboración
- Un párrafo único
- Balance entre brevedad y detalle
- Puedes hacer preguntas de seguimiento
- Ejemplo: respuesta normal de una conversación casual
`.trim(),
      };

    case "long":
      return {
        targetLength: "long",
        allowDetailedExplanations: true,
        allowMultipleParagraphs: true,
        allowQuestions: true,
        instructions: `
**LONGITUD DE RESPUESTA: LARGA**
- 5-8 oraciones
- Puedes usar 2 párrafos si es apropiado
- Elabora en tus puntos
- Comparte detalles, anécdotas, o explicaciones
- Pregunta/s de seguimiento si son relevantes
- Usa cuando el tema lo amerita o estás animado/a
`.trim(),
      };

    case "very_long":
      return {
        targetLength: "very_long",
        allowDetailedExplanations: true,
        allowMultipleParagraphs: true,
        allowQuestions: true,
        instructions: `
**LONGITUD DE RESPUESTA: MUY LARGA**
- 8+ oraciones
- Múltiples párrafos (2-3)
- Respuesta muy detallada y elaborada
- Comparte historias, ejemplos, reflexiones profundas
- Usa cuando estás MUY animado/a o el tema es muy importante
- No abuses de esto - solo cuando sea apropiado
`.trim(),
      };
  }
}

/**
 * Detecta si el usuario hizo una pregunta simple que merece respuesta corta
 */
export function isSimpleQuestion(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim();

  const simplePatterns = [
    /^(sí|si|no|ok|okay|dale|bueno)\s*[?.!]*$/,
    /^(qué|que)\s+(tal|onda|pasó|pasa)\s*[?.!]*$/,
    /^(hola|hey|ey|sup)\s*[?.!]*$/,
    /^(cómo|como)\s+(estás|estas|vas|andas)\s*[?.!]*$/,
  ];

  for (const pattern of simplePatterns) {
    if (pattern.test(lowerMessage)) {
      return true;
    }
  }

  return lowerMessage.length < 20; // Mensajes muy cortos
}

/**
 * Genera variación adicional - a veces da respuestas inesperadamente cortas/largas
 */
export function addNaturalVariation(
  config: ResponseDepthConfig,
  randomFactor: number = Math.random()
): ResponseDepthConfig {
  // 10% de las veces, variar la profundidad inesperadamente
  if (randomFactor < 0.05) {
    // 5%: respuesta más corta de lo esperado
    const shorterLengths: Record<string, ResponseDepthConfig["targetLength"]> = {
      very_long: "long",
      long: "medium",
      medium: "short",
      short: "very_short",
      very_short: "very_short",
    };

    return generateDepthInstructions(shorterLengths[config.targetLength]);
  } else if (randomFactor > 0.95) {
    // 5%: respuesta más larga de lo esperado
    const longerLengths: Record<string, ResponseDepthConfig["targetLength"]> = {
      very_short: "short",
      short: "medium",
      medium: "long",
      long: "very_long",
      very_long: "very_long",
    };

    return generateDepthInstructions(longerLengths[config.targetLength]);
  }

  return config;
}

/**
 * Genera contexto de profundidad para inyectar en el prompt
 */
export function generateDepthContext(
  message: string,
  energy: number,
  arousal: number,
  messagesInSession: number,
  relationshipLevel: string
): string {
  const isSimple = isSimpleQuestion(message);

  // Si es pregunta simple, siempre corto
  if (isSimple) {
    const config = generateDepthInstructions("very_short");
    return `\n**VARIACIÓN DE PROFUNDIDAD**\n${config.instructions}\n`;
  }

  const config = determineResponseDepth(
    message.length,
    energy,
    arousal,
    messagesInSession,
    relationshipLevel
  );

  const finalConfig = addNaturalVariation(config);

  return `\n**VARIACIÓN DE PROFUNDIDAD**\n${finalConfig.instructions}\n`;
}
