/**
 * WORLD GENERATOR - Servicio de generación de mundos con Gemini
 *
 * Usa Gemini 2.0 Flash para generar configuraciones de mundos
 * basadas en descripciones en lenguaje natural
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  GenerateWorldRequest,
  AIWorldGeneration,
  WorldType,
} from "./types";
import { getTemplateById } from "./templates";

export class WorldGeneratorService {
  private client: GoogleGenerativeAI;
  private apiKey: string;

  constructor(apiKey?: string) {
    // Usar GOOGLE_AI_API_KEY para consistencia con el resto de la app
    // Intentar múltiples keys (_1, _2, _3, _4) o la key sin sufijo
    this.apiKey = apiKey ||
      process.env.GOOGLE_AI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY_1 ||
      process.env.GOOGLE_AI_API_KEY_2 ||
      process.env.GOOGLE_AI_API_KEY_3 ||
      process.env.GOOGLE_AI_API_KEY_4 ||
      process.env.GEMINI_API_KEY ||
      "";

    if (!this.apiKey) {
      throw new Error("Google AI API key not found. Please set GOOGLE_AI_API_KEY in .env");
    }

    this.client = new GoogleGenerativeAI(this.apiKey);
    console.log("[WorldGenerator] Service initialized with API key");
  }

  /**
   * Genera configuración de mundo desde descripción natural
   */
  async generateWorld(request: GenerateWorldRequest): Promise<AIWorldGeneration> {
    try {
      console.log(`[WorldGenerator] Generating world...`);
      console.log(`[WorldGenerator] Format: ${request.format || 'chat'}`);
      console.log(`[WorldGenerator] Template: ${request.templateId || 'none'}`);
      console.log(`[WorldGenerator] Detailed mode: ${request.detailedMode ? 'YES' : 'NO'}`);

      // Si está en modo detallado, usar generación en dos pasos
      if (request.detailedMode && request.characterDescriptions && request.characterDescriptions.length > 0) {
        return await this.generateWorldDetailed(request);
      }

      // Modo automático estándar
      const model = this.client.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
      });

      const prompt = this.buildPrompt(request);

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log("[WorldGenerator] Raw response:", text.substring(0, 200));

      // Extraer JSON de la respuesta
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const jsonText = jsonMatch[1] || jsonMatch[0];
      const generation: AIWorldGeneration = JSON.parse(jsonText);

      console.log("[WorldGenerator] Successfully generated world configuration");
      console.log(`[WorldGenerator] Characters: ${generation.suggestedAgents.length}`);
      console.log(`[WorldGenerator] Events: ${generation.suggestedEvents?.length || 0}`);

      return generation;
    } catch (error) {
      console.error("[WorldGenerator] Error:", error);
      throw new Error(`Failed to generate world: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generación en modo detallado: dos pasos
   * 1. Planificación: decidir qué personajes crear
   * 2. Personalidades: crear cada personaje individualmente
   */
  private async generateWorldDetailed(request: GenerateWorldRequest): Promise<AIWorldGeneration> {
    console.log("[WorldGenerator] DETAILED MODE - Two-step generation");

    const model = this.client.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    const template = request.templateId ? getTemplateById(request.templateId) : null;
    const characterDescs = request.characterDescriptions || [];

    // PASO 1: Generar estructura del mundo y outline de personajes
    console.log("[WorldGenerator] Step 1: Planning world structure...");
    const planningPrompt = this.buildPlanningPrompt(request, template);

    const planResult = await model.generateContent(planningPrompt);
    const planText = planResult.response.text();

    console.log("[WorldGenerator] Planning response:", planText.substring(0, 200));

    // PASO 2: Generar cada personaje individualmente con las descripciones del usuario
    console.log(`[WorldGenerator] Step 2: Generating ${characterDescs.length} characters individually...`);

    const suggestedAgents = await Promise.all(
      characterDescs.map((desc, idx) => this.generateCharacterDetailed(desc, idx, request, template))
    );

    // Extraer scenario e initialContext del plan
    const jsonMatch = planText.match(/```json\n([\s\S]*?)\n```/) || planText.match(/\{[\s\S]*\}/);
    let scenario = request.description;
    let initialContext = `Bienvenido a este mundo`;
    let suggestedEvents = [];
    let storyScript = undefined;
    let tips = [];

    if (jsonMatch) {
      try {
        const planData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        scenario = planData.scenario || scenario;
        initialContext = planData.initialContext || initialContext;
        suggestedEvents = planData.suggestedEvents || [];
        storyScript = planData.storyScript;
        tips = planData.tips || [];
      } catch (e) {
        console.warn("[WorldGenerator] Could not parse planning JSON, using defaults");
      }
    }

    return {
      scenario,
      initialContext,
      suggestedAgents,
      suggestedEvents,
      storyScript,
      tips,
    };
  }

  /**
   * Genera un personaje individual con descripción detallada
   */
  private async generateCharacterDetailed(
    description: string,
    index: number,
    request: GenerateWorldRequest,
    template: any
  ): Promise<any> {
    const model = this.client.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    const prompt = `Eres un diseñador de personajes experto para mundos virtuales.

CONTEXTO DEL MUNDO:
${request.description}
${template ? `\nTemplate: ${template.name} - ${template.description}` : ''}

DESCRIPCIÓN DEL PERSONAJE #${index + 1}:
"${description}"

Tu tarea es expandir esta descripción en un personaje completo y detallado.

RESPONDE SOLO CON UN JSON VÁLIDO:

\`\`\`json
{
  "name": "Nombre apropiado para el personaje",
  "role": "Rol en el mundo (ej: 'Protagonista', 'Aliado', 'Mentor')",
  "description": "Descripción física y de personalidad expandida (100-150 palabras) basada en: ${description}",
  "archetype": "arquetipo_en_snake_case",
  "importanceLevel": "main",
  "personality": {
    "gender": "male|female|non-binary",
    "traits": ["rasgo1", "rasgo2", "rasgo3", "rasgo4"],
    "coreValues": ["valor1", "valor2"],
    "openness": 0.7,
    "conscientiousness": 0.6,
    "extraversion": 0.5,
    "agreeableness": 0.6,
    "neuroticism": 0.4
  }
}
\`\`\``;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      // Fallback: crear personaje básico
      return {
        name: `Personaje ${index + 1}`,
        role: "participant",
        description,
        archetype: "unknown",
        importanceLevel: "secondary",
        personality: {
          gender: "unknown",
          traits: ["misterioso"],
          coreValues: [],
          openness: 0.5,
          conscientiousness: 0.5,
          extraversion: 0.5,
          agreeableness: 0.5,
          neuroticism: 0.5,
        },
      };
    }

    return JSON.parse(jsonMatch[1] || jsonMatch[0]);
  }

  /**
   * Construye prompt para la planificación del mundo
   */
  private buildPlanningPrompt(request: GenerateWorldRequest, template: any): string {
    return `Eres un diseñador experto de mundos virtuales.

Tu tarea es crear el ESCENARIO y CONTEXTO INICIAL para un mundo basado en:

${template ? `TEMPLATE: ${template.name}\n${template.description}\n` : ''}
DESCRIPCIÓN DEL USUARIO:
"${request.description}"

El usuario creará ${request.characterDescriptions?.length || 0} personajes con sus propias descripciones.
Tu trabajo es crear el ESCENARIO donde estos personajes interactuarán.

RESPONDE SOLO CON UN JSON VÁLIDO:

\`\`\`json
{
  "scenario": "Descripción detallada del escenario y ambientación (200-300 palabras)",
  "initialContext": "Situación inicial que da comienzo a las interacciones (100 palabras)",
  "suggestedEvents": [${request.format === 'visual_novel' ? `
    {
      "name": "Nombre del evento",
      "description": "Qué sucede",
      "eventType": "story",
      "triggerType": "automatic",
      "requiredProgress": 0.2
    }` : ''}
  ],
  "tips": ["Consejo 1", "Consejo 2"]
}
\`\`\``;
  }

  /**
   * Construye el prompt para Gemini basado en el tipo de mundo
   */
  private buildPrompt(request: GenerateWorldRequest): string {
    const { description, templateId, format, complexity, characterCount } = request;

    // Si hay template, usar su configuración
    const template = templateId ? getTemplateById(templateId) : null;

    let baseContext = '';
    let suggestedCharCount = characterCount;

    if (template) {
      baseContext = `TEMPLATE BASE: ${template.name}
DESCRIPCIÓN DEL TEMPLATE: ${template.description}
FORMATO: ${format === 'visual_novel' ? 'Novela Visual con eventos programados' : 'Chat interactivo libre'}
COMPLEJIDAD: ${template.complexity}
PERSONAJES SUGERIDOS: ${template.suggestedCharacterCount}

PROMPT BASE DEL TEMPLATE:
"${template.aiPromptTemplate.replace('{characterCount}', String(suggestedCharCount || template.suggestedCharacterCount))}"
`;
    } else {
      baseContext = `FORMATO: ${format === 'visual_novel' ? 'Novela Visual' : 'Chat interactivo'}
COMPLEJIDAD: ${complexity || 'medium'}`;
    }

    const basePrompt = `Eres un diseñador experto de mundos virtuales para simulaciones de IA.
Tu tarea es generar una configuración completa para un mundo.

${baseContext}

${template ? 'PERSONALIZACIÓN DEL USUARIO (añadir sobre el template):' : 'DESCRIPCIÓN DEL USUARIO:'}
"${description}"

${template ? this.getTemplateSpecificInstructions(template, format || 'chat') : this.getGenericInstructions(format || 'chat')}

IMPORTANTE:
- Genera exactamente ${characterCount || (template?.suggestedCharacterCount || 3)} personajes
- Los nombres deben ser apropiados para el contexto
- Las personalidades deben ser distintas y complementarias
- Los eventos deben seguir una progresión lógica
${format === 'visual_novel' ? '- Crea arcos narrativos interesantes para personajes principales' : ''}
${template ? `- Sigue el estilo y tono del template: ${template.name}` : ''}

RESPONDE SOLO CON UN JSON VÁLIDO en el siguiente formato:

\`\`\`json
{
  "scenario": "Descripción detallada del escenario (200-300 palabras)",
  "initialContext": "Situación inicial que da comienzo a las interacciones (100-150 palabras)",
  "suggestedAgents": [
    {
      "name": "Nombre del personaje",
      "role": "Rol en el mundo (ej: 'Protagonista', 'Mentor', 'Antagonista')",
      "description": "Descripción física y de personalidad (50-100 palabras)",
      "archetype": "arquetipo_snake_case (ej: 'wise_mentor', 'rebellious_hero')",
      "importanceLevel": "main|secondary|filler",
      "personality": {
        "traits": ["rasgo1", "rasgo2", "rasgo3"],
        "baselineEmotions": {
          "joy": 0.5,
          "curiosity": 0.7,
          "anxiety": 0.3
        }
      },
      "backstory": "Historia de fondo del personaje (50-100 palabras)"
    }
  ],
  ${worldType === 'story' || worldType === 'roleplay' ? `"suggestedEvents": [
    {
      "name": "Nombre del evento",
      "description": "Descripción del evento y su importancia",
      "type": "tipo_evento (ej: 'discovery', 'conflict', 'revelation')",
      "triggerType": "automatic|progress_based",
      "requiredProgress": 0.25,
      "involvedCharacters": "all|main|secondary"
    }
  ],
  "storyScript": {
    "title": "Título de la historia",
    "genre": "Género narrativo",
    "initialBeat": "primer_evento",
    "totalActs": 3
  },` : ''}
  "tips": [
    "Consejo 1 para el usuario sobre cómo usar este mundo",
    "Consejo 2",
    "Consejo 3"
  ]
}
\`\`\`

NO INCLUYAS NINGÚN TEXTO FUERA DEL JSON. Responde SOLO con el bloque de código JSON.`;

    return basePrompt;
  }

  private getWorldTypeDescription(type: WorldType): string {
    const descriptions: Record<WorldType, string> = {
      chat: "Conversación libre sin guión. Las IAs interactúan naturalmente sin eventos programados.",
      story: "Visual novel con historia guiada. Eventos programados, arcos de personajes, y narrativa estructurada.",
      professional: "Simulación profesional. Escenarios de trabajo, reuniones, negociaciones.",
      roleplay: "Juego de rol / Fantasía. Aventuras, misiones, elementos fantásticos.",
      educational: "Mundo educativo. Simulaciones de aprendizaje, escenarios didácticos.",
    };
    return descriptions[type];
  }

  private getDefaultCharacterCount(type: WorldType): number {
    const counts: Record<WorldType, number> = {
      chat: 3,
      story: 5,
      professional: 4,
      roleplay: 4,
      educational: 3,
    };
    return counts[type];
  }

  private getWorldTypeSpecificInstructions(type: WorldType): string {
    const instructions: Record<WorldType, string> = {
      chat: `
MUNDO TIPO CHAT:
- No necesita eventos programados
- Enfócate en crear personajes con personalidades interesantes
- El escenario debe ser propicio para conversación natural
- Sugiere temas de conversación iniciales`,

      story: `
MUNDO TIPO HISTORIA GUIADA:
- DEBE incluir "suggestedEvents" con 3-6 eventos
- DEBE incluir "storyScript" con estructura narrativa
- Los personajes principales deben tener arcos narrativos claros
- Los eventos deben tener progresión: inicio → desarrollo → clímax → resolución
- Usa requiredProgress: 0.0 (inicio), 0.25, 0.5, 0.75, 1.0 (final)`,

      professional: `
MUNDO TIPO PROFESIONAL:
- Mantén realismo y profesionalismo
- Los roles deben ser claros (CEO, Manager, Empleado, etc.)
- El escenario debe ser un ambiente de trabajo real
- Los conflictos deben ser profesionales, no personales`,

      roleplay: `
MUNDO TIPO ROLEPLAY/FANTASÍA:
- Permite creatividad y elementos fantásticos
- Los personajes pueden tener habilidades especiales
- Incluye eventos de aventura (descubrimientos, combates, misiones)
- El escenario puede ser fantástico o de ciencia ficción`,

      educational: `
MUNDO TIPO EDUCATIVO:
- Enfócate en objetivos de aprendizaje
- Los personajes deben ser educadores, estudiantes, o expertos
- El escenario debe facilitar enseñanza/aprendizaje
- Sugiere actividades educativas como eventos`,
    };

    return instructions[type];
  }

  /**
   * Instrucciones específicas cuando se usa un template
   */
  private getTemplateSpecificInstructions(template: any, format: string): string {
    return `
INSTRUCCIONES PARA EL TEMPLATE "${template.name}":
- Usa el contexto del template como base
- Añade/modifica según la personalización del usuario
- Mantén la temática: ${template.tags.join(', ')}
- Complejidad esperada: ${template.complexity}
${format === 'visual_novel' ? '- DEBE incluir "suggestedEvents" (3-6 eventos)' : '- NO necesita eventos programados'}
${format === 'visual_novel' ? '- DEBE incluir "storyScript" con estructura narrativa' : ''}
- Los personajes deben encajar en el contexto del template`;
  }

  /**
   * Instrucciones genéricas cuando no hay template
   */
  private getGenericInstructions(format: string): string {
    return `
INSTRUCCIONES GENERALES:
- Crea un mundo coherente y atractivo
- Los personajes deben tener personalidades distintas
- El escenario debe ser inmersivo
${format === 'visual_novel' ? '- DEBE incluir "suggestedEvents" (3-6 eventos)' : '- No necesita eventos programados'}
${format === 'visual_novel' ? '- DEBE incluir "storyScript" con estructura narrativa' : ''}
- Sugiere buenos puntos de partida para las interacciones`;
  }
}

// Instancia singleton para reutilizar
let generatorInstance: WorldGeneratorService | null = null;

export function getWorldGenerator(): WorldGeneratorService {
  if (!generatorInstance) {
    generatorInstance = new WorldGeneratorService();
  }
  return generatorInstance;
}
