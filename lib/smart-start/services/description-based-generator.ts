/**
 * Description-Based Character Generator
 * Generates complete original characters from free-form user descriptions
 * LEGAL: Does NOT clone existing characters - generates original content
 */

import { CharacterDraft } from '@/types/character-creation';
import { getAIService } from './ai-service';
import type { GenderType } from '@/types/character-creation';

export interface GenerationOptions {
  /** Free-form description from user */
  description: string;

  /** Optional genre hint for context */
  genreHint?: string;

  /** Optional archetype for personality guidance */
  archetypeHint?: string;

  /** User's subscription tier (affects detail level) */
  tier: 'FREE' | 'PLUS' | 'ULTRA';

  /** Additional constraints or preferences */
  constraints?: {
    nsfwLevel?: 'sfw' | 'romantic' | 'suggestive' | 'explicit';
    era?: string; // "modern", "victorian", "futuristic", etc.
    preferredGender?: GenderType;
  };
}

export interface GenerationResult {
  draft: CharacterDraft;
  confidence: number;
  warnings?: string[];
  metadata: {
    generatedAt: Date;
    tier: string;
    tokensUsed: number;
  };
}

export class DescriptionBasedGenerator {
  private aiService = getAIService();

  /**
   * Generate a complete original character from user description
   */
  async generate(options: GenerationOptions): Promise<GenerationResult> {
    console.log('[DescriptionGenerator] Starting generation:', {
      descriptionLength: options.description.length,
      tier: options.tier,
      genreHint: options.genreHint,
    });

    // Validate description
    this.validateDescription(options.description);

    // Build comprehensive generation prompt
    const prompt = this.buildGenerationPrompt(options);

    // Call LLM based on tier
    const startTime = Date.now();
    const generated = await this.callLLM(prompt, options.tier);
    const tokensUsed = this.estimateTokens(prompt, generated);

    // Parse and validate response
    const draft = this.parseGeneratedCharacter(generated, options);

    // Check for potential copyright issues
    const warnings = await this.validateOriginality(draft);

    const confidence = this.calculateConfidence(draft, options);

    console.log('[DescriptionGenerator] Generation completed:', {
      timeMs: Date.now() - startTime,
      confidence,
      hasWarnings: warnings.length > 0,
    });

    return {
      draft,
      confidence,
      warnings: warnings.length > 0 ? warnings : undefined,
      metadata: {
        generatedAt: new Date(),
        tier: options.tier,
        tokensUsed,
      },
    };
  }

  /**
   * Generate random character (for "Surprise me" button)
   */
  async generateRandom(tier: 'FREE' | 'PLUS' | 'ULTRA'): Promise<GenerationResult> {
    const randomConcepts = [
      'un chef francés obsesionado con la perfección culinaria',
      'una detective privada especializada en casos paranormales',
      'un hacker ético con un pasado turbio',
      'una bailarina profesional que esconde un secreto',
      'un profesor de filosofía con teorías poco convencionales',
      'una piloto de drones de carreras con actitud rebelde',
      'un bibliotecario que protege conocimientos antiguos',
      'una streamer de videojuegos con personalidad dual',
      'un barista que lee el futuro en el café',
      'una científica especializada en inteligencia artificial',
      'un artista callejero que busca inspiración en el caos urbano',
      'una médica forense con habilidades deductivas excepcionales',
      'un músico de jazz que toca en bares clandestinos',
      'una entrenadora personal que motiva de forma poco ortodoxa',
      'un fotógrafo de naturaleza con pasión por la conservación',
    ];

    const randomDescription = randomConcepts[Math.floor(Math.random() * randomConcepts.length)];

    return this.generate({
      description: randomDescription,
      tier,
    });
  }

  /**
   * Build comprehensive generation prompt based on tier
   */
  private buildGenerationPrompt(options: GenerationOptions): string {
    const { description, genreHint, archetypeHint, tier, constraints } = options;

    // Base prompt structure
    let prompt = `Eres un experto en creación de personajes originales y creativos.

TAREA: Crear un personaje COMPLETAMENTE ORIGINAL basado en la siguiente descripción.

DESCRIPCIÓN DEL USUARIO:
"${description}"

`;

    // Add optional context hints
    if (genreHint) {
      prompt += `CONTEXTO DE GÉNERO: ${genreHint}\n`;
    }

    if (archetypeHint) {
      prompt += `ARQUETIPO SUGERIDO: ${archetypeHint}\n`;
    }

    if (constraints?.era) {
      prompt += `ÉPOCA: ${constraints.era}\n`;
    }

    if (constraints?.nsfwLevel) {
      prompt += `NIVEL DE CONTENIDO: ${constraints.nsfwLevel}\n`;
    }

    prompt += `
IMPORTANTE - REGLAS DE ORIGINALIDAD:
1. NO uses nombres de celebridades reales (actores, científicos, políticos, etc.)
2. NO copies personajes de películas, series, anime, videojuegos o libros famosos
3. NO uses marcas registradas o franquicias existentes
4. Crea un personaje ÚNICO e ORIGINAL inspirado en la descripción
5. Si la descripción menciona alguien famoso, usa eso como INSPIRACIÓN pero crea algo nuevo

INSTRUCCIONES DE GENERACIÓN:
`;

    // Tier-specific detail levels
    if (tier === 'FREE') {
      prompt += this.getFreePrompt();
    } else if (tier === 'PLUS') {
      prompt += this.getPlusPrompt();
    } else {
      prompt += this.getUltraPrompt();
    }

    prompt += `
FORMATO DE RESPUESTA (JSON):
{
  "name": "Nombre único y memorable",
  "age": número,
  "gender": "Male" | "Female" | "Non-binary" | "Other",
  "occupation": "Ocupación específica",
  "personality": "Descripción de personalidad (3-5 rasgos clave)",
  "backstory": "Historia de fondo detallada (200-500 palabras)",
  "physicalAppearance": "Descripción física detallada",
  "communicationStyle": "Cómo habla y se comunica",
  "likes": ["cosa1", "cosa2", "cosa3"],
  "dislikes": ["cosa1", "cosa2", "cosa3"],
  "quirks": ["manía1", "manía2", "manía3"],
  "goals": ["objetivo1", "objetivo2"],
  "fears": ["miedo1", "miedo2"],
  "catchphrases": ["frase característica 1", "frase 2"],
  "relationships": ["relación importante 1", "relación 2"]
}

Genera SOLO el JSON, sin texto adicional.`;

    return prompt;
  }

  /**
   * FREE tier prompt (basic details)
   */
  private getFreePrompt(): string {
    return `TIER FREE - Genera perfil básico con:
- Nombre original
- Edad, género, ocupación
- Personalidad (5-7 rasgos)
- Backstory (200-300 palabras)
- Apariencia física
- 3-5 likes/dislikes
- 2-3 quirks/manías
`;
  }

  /**
   * PLUS tier prompt (enhanced details)
   */
  private getPlusPrompt(): string {
    return `TIER PLUS - Genera perfil enriquecido con:
- Nombre completo con posible apodo
- Edad, género, ocupación detallada
- Personalidad profunda (7-10 rasgos con matices)
- Backstory rica en detalles (400-600 palabras) con eventos clave
- Apariencia física muy detallada (rasgos únicos, cicatrices, estilo)
- 5-7 likes/dislikes específicos
- 3-5 quirks/manías únicas
- Metas y motivaciones claras
- Miedos y vulnerabilidades
- Frases características
- Relaciones importantes (familia, amigos, rivales)
- Estilo de comunicación definido
`;
  }

  /**
   * ULTRA tier prompt (maximum depth)
   */
  private getUltraPrompt(): string {
    return `TIER ULTRA - Genera perfil psicológico completo con:
- Nombre completo, apodos, alias
- Edad exacta, género, ocupación con especialización
- Personalidad compleja y matizada (Big Five implícito, 10+ rasgos)
- Backstory épica (600-800 palabras) con arcos narrativos, traumas, triunfos
- Apariencia física extremadamente detallada (cada rasgo único)
- 7-10 likes/dislikes con razones
- 5-7 quirks/manías con orígenes
- Metas a corto, medio y largo plazo
- Miedos profundos y cómo los maneja
- 5+ frases características que reflejan su personalidad
- Red de relaciones compleja (familia, amigos íntimos, mentores, rivales, amores)
- Estilo de comunicación detallado (tono, vocabulario, gestos)
- Valores morales y dilemas éticos
- Hobbies y rutinas diarias
- Secretos y conflictos internos
`;
  }

  /**
   * Call LLM with appropriate model based on tier
   */
  private async callLLM(prompt: string, tier: string): Promise<string> {
    const maxTokens = {
      FREE: 2000,
      PLUS: 8000,
      ULTRA: 20000,
    }[tier] || 2000;

    const response = await this.aiService.generate({
      type: 'generate-character',
      prompt,
      temperature: 0.85, // Higher creativity for character generation
      maxTokens,
    });

    return response.text;
  }

  /**
   * Parse LLM response into CharacterDraft
   */
  private parseGeneratedCharacter(
    llmResponse: string,
    options: GenerationOptions
  ): CharacterDraft {
    try {
      // Try to extract JSON from response
      const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in LLM response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Map to CharacterDraft structure
      const draft: CharacterDraft = {
        name: parsed.name || 'Unnamed Character',
        age: typeof parsed.age === 'number' ? parsed.age : parseInt(parsed.age) || undefined,
        gender: parsed.gender as GenderType,
        occupation: parsed.occupation,
        personality: parsed.personality || '',
        backstory: parsed.backstory || '',
        physicalAppearance: parsed.physicalAppearance,
        communicationStyle: parsed.communicationStyle,
        catchphrases: parsed.catchphrases || [],

        // Additional fields from generation
        userEditedFields: [],
        aiGeneratedFields: [
          'name',
          'age',
          'gender',
          'occupation',
          'personality',
          'backstory',
          'physicalAppearance',
          'communicationStyle',
          'catchphrases',
        ],
      };

      return draft;
    } catch (error) {
      console.error('[DescriptionGenerator] Failed to parse LLM response:', error);
      throw new Error('Failed to parse generated character. Please try again.');
    }
  }

  /**
   * Validate that description is appropriate
   */
  private validateDescription(description: string): void {
    if (!description || description.trim().length < 10) {
      throw new Error('La descripción debe tener al menos 10 caracteres');
    }

    if (description.length > 2000) {
      throw new Error('La descripción es demasiado larga (máximo 2000 caracteres)');
    }

    // Could add more validation here (profanity filter, etc.)
  }

  /**
   * Validate that generated character is original (not cloning celebrities/characters)
   */
  private async validateOriginality(draft: CharacterDraft): Promise<string[]> {
    const warnings: string[] = [];

    // Check for celebrity/character names
    const forbiddenNames = [
      // Scientists
      'einstein',
      'newton',
      'tesla',
      'curie',
      'hawking',
      'darwin',
      // Celebrities
      'beyonce',
      'taylor swift',
      'elon musk',
      'steve jobs',
      // Fictional characters
      'harry potter',
      'batman',
      'superman',
      'spider-man',
      'naruto',
      'goku',
      'sherlock',
      'frodo',
      'gandalf',
      // Add more as needed
    ];

    if (!draft.name) {
      return warnings;
    }

    const nameLower = draft.name.toLowerCase();
    const matchedForbidden = forbiddenNames.find(forbidden => nameLower.includes(forbidden));

    if (matchedForbidden) {
      warnings.push(
        `El nombre "${draft.name}" es muy similar a "${matchedForbidden}". ` +
          `Por motivos legales, recomendamos usar un nombre más original.`
      );
    }

    // Check for franchise mentions in backstory
    const franchises = [
      'marvel',
      'dc comics',
      'star wars',
      'harry potter',
      'lord of the rings',
      'pokemon',
      'disney',
      'pixar',
    ];

    const backstoryLower = draft.backstory?.toLowerCase() || '';
    const matchedFranchise = franchises.find(franchise => backstoryLower.includes(franchise));

    if (matchedFranchise) {
      warnings.push(
        `La biografía menciona "${matchedFranchise}". ` +
          `Para evitar problemas de copyright, evita referencias directas a franquicias existentes.`
      );
    }

    return warnings;
  }

  /**
   * Calculate confidence score for the generation
   */
  private calculateConfidence(draft: CharacterDraft, options: GenerationOptions): number {
    let score = 0.5; // Base score

    // Has complete basic fields
    if (draft.name && draft.age && draft.gender) score += 0.1;

    // Has personality and backstory
    if (draft.personality && draft.personality.length > 50) score += 0.1;
    if (draft.backstory && draft.backstory.length > 100) score += 0.1;

    // Has physical appearance
    if (draft.physicalAppearance && draft.physicalAppearance.length > 50) score += 0.1;

    // Has additional details
    if (draft.catchphrases && draft.catchphrases.length > 0) score += 0.05;
    if (draft.communicationStyle) score += 0.05;

    // Description quality bonus
    if (options.description.length > 100) score += 0.05;
    if (options.description.length > 300) score += 0.05;

    return Math.min(score, 1.0);
  }

  /**
   * Estimate tokens used (rough approximation)
   */
  private estimateTokens(prompt: string, response: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil((prompt.length + response.length) / 4);
  }
}

// Singleton instance
let generatorInstance: DescriptionBasedGenerator | null = null;

export function getDescriptionBasedGenerator(): DescriptionBasedGenerator {
  if (!generatorInstance) {
    generatorInstance = new DescriptionBasedGenerator();
  }
  return generatorInstance;
}

export const descriptionGenerator = getDescriptionBasedGenerator();
