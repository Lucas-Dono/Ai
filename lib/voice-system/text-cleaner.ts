/**
 * Text Cleaner para TTS
 *
 * Limpia el texto antes de enviarlo a Eleven Labs para evitar que
 * lea literalmente las acciones, risas, etc.
 */

/**
 * Limpia el texto para TTS eliminando:
 * - Acciones entre asteriscos: *suspiro*, *ríe*, etc.
 * - Acciones entre corchetes: [suspira], [ríe], etc.
 * - Acciones entre paréntesis: (suspira), (ríe), etc.
 * - Risas escritas: jaja, jejeje, hehe, etc.
 * - Onomatopeyas y sonidos
 */
export function cleanTextForTTS(text: string): string {
  let cleaned = text;

  // 1. Eliminar acciones entre asteriscos: *suspiro*, *se sonroja*, etc.
  cleaned = cleaned.replace(/\*[^*]+\*/g, '');

  // 2. Eliminar acciones entre corchetes: [suspira], [ríe], etc.
  cleaned = cleaned.replace(/\[[^\]]+\]/g, '');

  // 3. Eliminar acciones entre paréntesis: (suspira), (ríe), etc.
  cleaned = cleaned.replace(/\([^)]+\)/g, '');

  // 4. Eliminar risas escritas (común en español)
  // jaja, jajaja, jejeje, hehe, hehehe, hihi, etc.
  cleaned = cleaned.replace(/\b(ja){2,}\b/gi, ''); // jaja, jajaja...
  cleaned = cleaned.replace(/\b(je){2,}\b/gi, ''); // jejeje...
  cleaned = cleaned.replace(/\b(he){2,}\b/gi, ''); // hehehe...
  cleaned = cleaned.replace(/\b(ji){2,}\b/gi, ''); // jijiji...
  cleaned = cleaned.replace(/\b(hi){2,}\b/gi, ''); // hihihi...

  // 5. Eliminar risas en inglés
  cleaned = cleaned.replace(/\blol\b/gi, '');
  cleaned = cleaned.replace(/\blmao\b/gi, '');
  cleaned = cleaned.replace(/\bhaha\b/gi, '');

  // 6. Eliminar onomatopeyas comunes
  cleaned = cleaned.replace(/\b(ah|oh|eh|uh|mm|mmm|hmm|pfft|uff|auch)\b/gi, '');

  // 7. Eliminar emojis y caracteres especiales no hablables
  cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]/gu, ''); // Emojis de caras
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F5FF}]/gu, ''); // Símbolos y pictogramas
  cleaned = cleaned.replace(/[\u{1F680}-\u{1F6FF}]/gu, ''); // Transporte y mapas
  cleaned = cleaned.replace(/[\u{2600}-\u{26FF}]/gu, '');   // Símbolos varios
  cleaned = cleaned.replace(/[\u{2700}-\u{27BF}]/gu, '');   // Dingbats

  // 8. Eliminar múltiples espacios y espacios al inicio/final
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // 9. Eliminar puntos suspensivos múltiples (dejar solo uno o dos)
  cleaned = cleaned.replace(/\.{4,}/g, '...');

  return cleaned;
}

/**
 * Detecta si el texto tiene contenido hablable después de limpiarlo
 */
export function hasSpokenContent(text: string): boolean {
  const cleaned = cleanTextForTTS(text);
  // Verificar que tenga al menos 3 caracteres alfabéticos
  return /[a-zA-ZáéíóúñÁÉÍÓÚÑ]{3,}/.test(cleaned);
}

/**
 * Ejemplos de uso:
 *
 * cleanTextForTTS("*suspiro* Hola, ¿cómo estás? jajaja")
 * → "Hola, ¿cómo estás?"
 *
 * cleanTextForTTS("Ah... *se sonroja* Y-y-yo... jejeje")
 * → "Y-y-yo..."
 *
 * cleanTextForTTS("[ríe nerviosamente] No sé qué decir...")
 * → "No sé qué decir..."
 */
