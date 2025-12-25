/**
 * Parser para personajes en formato Markdown (no JSON)
 * Extrae información de secciones markdown y la convierte a estructura JSON
 */

export interface MarkdownCharacter {
  basicInfo: {
    name: string;
    age?: number;
    gender?: string;
    occupation?: string;
  };
  systemPrompt: string;
  biography?: string;
  personality?: {
    coreTraits?: string[];
    shadowTraits?: string[];
  };
  stagePrompts?: Record<string, string>;
  tags?: string[];
}

/**
 * Extrae secciones de un archivo markdown
 */
function extractSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {};

  // Regex para capturar secciones con headers markdown (## SECTION_NAME)
  const sectionRegex = /##\s+([^\n]+)\n([\s\S]*?)(?=##\s+|$)/g;

  let match;
  while ((match = sectionRegex.exec(content)) !== null) {
    const sectionName = match[1].trim();
    const sectionContent = match[2].trim();
    sections[sectionName] = sectionContent;
  }

  return sections;
}

/**
 * Extrae el nombre del personaje del contenido
 */
function extractName(content: string, sections: Record<string, string>): string {
  // Intentar desde título principal (# Name)
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  // Intentar desde sección INFORMACIÓN BÁSICA
  if (sections['INFORMACIÓN BÁSICA']) {
    const nameMatch = sections['INFORMACIÓN BÁSICA'].match(/\*\*Nombre:\*\*\s*(.+)/);
    if (nameMatch) return nameMatch[1].trim();
  }

  return 'Unknown';
}

/**
 * Extrae edad si está disponible
 */
function extractAge(sections: Record<string, string>): number | undefined {
  if (sections['INFORMACIÓN BÁSICA']) {
    const ageMatch = sections['INFORMACIÓN BÁSICA'].match(/\*\*Edad:\*\*\s*(\d+)/);
    if (ageMatch) return parseInt(ageMatch[1]);
  }
  return undefined;
}

/**
 * Extrae género si está disponible
 */
function extractGender(sections: Record<string, string>): string | undefined {
  if (sections['INFORMACIÓN BÁSICA']) {
    const genderMatch = sections['INFORMACIÓN BÁSICA'].match(/\*\*Género:\*\*\s*(.+)/i);
    if (genderMatch) {
      const gender = genderMatch[1].trim().toLowerCase();
      if (gender.includes('mujer') || gender.includes('female') || gender.includes('femenino')) return 'female';
      if (gender.includes('hombre') || gender.includes('male') || gender.includes('masculino')) return 'male';
    }
  }
  return undefined;
}

/**
 * Extrae ocupación si está disponible
 */
function extractOccupation(sections: Record<string, string>): string | undefined {
  if (sections['INFORMACIÓN BÁSICA']) {
    const occupationMatch = sections['INFORMACIÓN BÁSICA'].match(/\*\*Ocupación:\*\*\s*(.+)/i);
    if (occupationMatch) return occupationMatch[1].trim();
  }
  return undefined;
}

/**
 * Extrae system prompt
 */
function extractSystemPrompt(sections: Record<string, string>): string {
  // Buscar en diferentes posibles nombres de sección
  const possibleSections = [
    'SYSTEM PROMPT',
    'PROMPT DEL SISTEMA',
    'SISTEMA',
    'INSTRUCCIONES DEL SISTEMA',
  ];

  for (const sectionName of possibleSections) {
    if (sections[sectionName]) {
      // Limpiar bloques de código si existen
      let prompt = sections[sectionName];
      prompt = prompt.replace(/```[\s\S]*?```/g, ''); // Remove code blocks
      prompt = prompt.trim();
      if (prompt.length > 50) return prompt;
    }
  }

  return 'Eres un asistente conversacional empático y útil.';
}

/**
 * Extrae biografía
 */
function extractBiography(sections: Record<string, string>): string | undefined {
  const possibleSections = [
    'BIOGRAFÍA DETALLADA',
    'BIOGRAFÍA',
    'HISTORIA',
    'BACKGROUND',
    'BACKSTORY',
  ];

  for (const sectionName of possibleSections) {
    if (sections[sectionName]) {
      return sections[sectionName].trim();
    }
  }

  return undefined;
}

/**
 * Extrae stage prompts si existen
 */
function extractStagePrompts(sections: Record<string, string>): Record<string, string> | undefined {
  if (!sections['STAGE PROMPTS']) return undefined;

  const stagePrompts: Record<string, string> = {};
  const content = sections['STAGE PROMPTS'];

  // Buscar secciones de stages (### Stranger, ### Friend, etc.)
  const stageRegex = /###\s+(\w+)\s*\n([\s\S]*?)(?=###\s+|$)/g;

  let match;
  while ((match = stageRegex.exec(content)) !== null) {
    const stageName = match[1].toLowerCase();
    const stageContent = match[2].trim();
    stagePrompts[stageName] = stageContent;
  }

  return Object.keys(stagePrompts).length > 0 ? stagePrompts : undefined;
}

/**
 * Infiere tags del contenido
 */
function inferTags(character: MarkdownCharacter, content: string): string[] {
  const tags: string[] = ['premium'];

  const lowerContent = content.toLowerCase();

  // Tags históricos
  if (lowerContent.includes('históric') || lowerContent.includes('historic')) {
    tags.push('historical');
  }

  // Tags de ocupación
  if (character.basicInfo.occupation) {
    const occupation = character.basicInfo.occupation.toLowerCase();
    if (occupation.includes('filósof') || occupation.includes('philosoph')) tags.push('philosophy', 'intellectual');
    if (occupation.includes('científic') || occupation.includes('scientist')) tags.push('science', 'intellectual');
    if (occupation.includes('escrit') || occupation.includes('writer')) tags.push('writer', 'creative');
    if (occupation.includes('artista') || occupation.includes('artist')) tags.push('art', 'creative');
    if (occupation.includes('músic') || occupation.includes('music')) tags.push('music', 'creative');
  }

  // Tags de personalidad del content
  if (lowerContent.includes('empát') || lowerContent.includes('empath')) tags.push('emotional');
  if (lowerContent.includes('romántic') || lowerContent.includes('romantic')) tags.push('romantic');
  if (lowerContent.includes('intelectual') || lowerContent.includes('intellectual')) tags.push('intellectual');

  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Parsea un personaje en formato Markdown y retorna estructura JSON
 */
export function parseMarkdownCharacter(content: string): MarkdownCharacter {
  const sections = extractSections(content);

  const character: MarkdownCharacter = {
    basicInfo: {
      name: extractName(content, sections),
      age: extractAge(sections),
      gender: extractGender(sections),
      occupation: extractOccupation(sections),
    },
    systemPrompt: extractSystemPrompt(sections),
    biography: extractBiography(sections),
    stagePrompts: extractStagePrompts(sections),
  };

  character.tags = inferTags(character, content);

  return character;
}

/**
 * Detecta si un archivo es formato Markdown o JSON
 */
export function detectFormat(content: string): 'json' | 'markdown' {
  // Si tiene bloque ```json o empieza con {, es JSON
  if (content.includes('```json') || content.trim().startsWith('{')) {
    return 'json';
  }

  // Si tiene headers markdown ##, es markdown
  if (content.includes('##')) {
    return 'markdown';
  }

  return 'markdown'; // Default
}
