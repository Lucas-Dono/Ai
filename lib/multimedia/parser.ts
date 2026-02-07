/**
 * Parser de Multimedia en Mensajes de IA
 *
 * Detecta tags [IMAGE:...] y [AUDIO:...] en respuestas de IA
 * y extrae la información para generar contenido multimedia.
 */

export interface MultimediaTag {
  type: "image" | "audio";
  description: string;
  originalText: string;
  startIndex: number;
  endIndex: number;
}

export interface ParsedMessage {
  textContent: string; // Texto sin tags
  multimediaTags: MultimediaTag[];
  hasMultimedia: boolean;
}

/**
 * Regex patterns para detectar tags multimedia
 */
const IMAGE_REGEX = /\[IMAGE:\s*([^\]]+)\]/gi;
const AUDIO_REGEX = /\[AUDIO:\s*([^\]]+)\]/gi;

/**
 * Parsea un mensaje de IA y extrae los tags multimedia
 */
export function parseMultimediaTags(message: string): ParsedMessage {
  const multimediaTags: MultimediaTag[] = [];
  let textContent = message;

  // Buscar tags de imagen
  let match: RegExpExecArray | null;

  // Reset regex state
  IMAGE_REGEX.lastIndex = 0;
  while ((match = IMAGE_REGEX.exec(message)) !== null) {
    multimediaTags.push({
      type: "image",
      description: match[1].trim(),
      originalText: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  // Buscar tags de audio
  AUDIO_REGEX.lastIndex = 0;
  while ((match = AUDIO_REGEX.exec(message)) !== null) {
    multimediaTags.push({
      type: "audio",
      description: match[1].trim(),
      originalText: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  // Ordenar por posición
  multimediaTags.sort((a, b) => a.startIndex - b.startIndex);

  // Remover tags del texto, pero mantener el contexto
  // Reemplazar tags con marcadores temporales para mantener posiciones
  for (const tag of multimediaTags.reverse()) {
    // Reemplazar con un marcador que indique que hubo multimedia
    const placeholder = tag.type === "image" ? "[📸]" : "[🎤]";
    textContent =
      textContent.substring(0, tag.startIndex) +
      placeholder +
      textContent.substring(tag.endIndex);
  }

  return {
    textContent: textContent.trim(),
    multimediaTags: multimediaTags.reverse(), // Volver a orden original
    hasMultimedia: multimediaTags.length > 0,
  };
}

/**
 * Valida que un mensaje no abuse del multimedia
 * Retorna true si el mensaje es válido
 */
export function validateMultimediaUsage(
  parsedMessage: ParsedMessage,
  maxMultimediaPerMessage: number = 2
): { valid: boolean; reason?: string } {
  if (parsedMessage.multimediaTags.length > maxMultimediaPerMessage) {
    return {
      valid: false,
      reason: `Demasiados elementos multimedia (máximo ${maxMultimediaPerMessage} por mensaje)`,
    };
  }

  // Validar que las descripciones no estén vacías
  for (const tag of parsedMessage.multimediaTags) {
    if (!tag.description || tag.description.length < 3) {
      return {
        valid: false,
        reason: `Descripción de multimedia muy corta: "${tag.description}"`,
      };
    }

    if (tag.description.length > 200) {
      return {
        valid: false,
        reason: `Descripción de multimedia muy larga (máximo 200 caracteres)`,
      };
    }
  }

  return { valid: true };
}

/**
 * Genera prompts para cada tag multimedia detectado
 */
export function generateMultimediaPrompts(
  tags: MultimediaTag[],
  agentName: string,
  agentPersonality: string
): { imagePrompts: string[]; audioPrompts: string[] } {
  const imagePrompts: string[] = [];
  const audioPrompts: string[] = [];

  for (const tag of tags) {
    if (tag.type === "image") {
      // Prompt mejorado para generación de imagen
      const imagePrompt = `${tag.description}.
Character: ${agentName} with personality: ${agentPersonality}.
Style: realistic, high quality, natural lighting, detailed.
Important: Maintain character consistency with reference image.`;
      imagePrompts.push(imagePrompt);
    } else if (tag.type === "audio") {
      // Para audio, la descripción se usará como texto a sintetizar
      // Agregar contexto emocional basado en la descripción
      audioPrompts.push(tag.description);
    }
  }

  return { imagePrompts, audioPrompts };
}
