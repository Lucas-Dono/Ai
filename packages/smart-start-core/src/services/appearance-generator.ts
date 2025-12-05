/**
 * Appearance Generator Service
 *
 * AI-powered service for generating CharacterAppearance data from
 * personality descriptions and context information.
 *
 * Platform-agnostic - works on both web and mobile
 * @module services/appearance-generator
 */

import type {
  CharacterAppearanceData,
  CharacterStyle,
  GenderType,
  AgeRange,
  AppearanceContext,
  AnalysisResult,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface RawAppearanceData {
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  clothing: string;
  additionalFeatures?: string[];
  skinTone?: string;
  bodyType?: string;
  facialFeatures?: string;
}

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

const MAX_INPUT_LENGTH = 3000;
const API_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Sanitize user input to prevent prompt injection.
 * - Removes control characters
 * - Escapes XML-like tags
 * - Limits length
 */
function sanitizeInput(input: string, maxLength: number = MAX_INPUT_LENGTH): string {
  if (!input) return '';

  // Remove control characters except newlines and tabs
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Escape XML-like tags to prevent breaking our delimiters
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '...';
  }
  return sanitized.trim();
}

// ============================================================================
// GEMINI API INTEGRATION
// ============================================================================

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = process.env.GEMINI_MODEL_LITE || 'gemini-2.5-flash-lite';

/**
 * Gemini API response structure
 */
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
  };
}

/**
 * Call Gemini API with timeout and proper error handling
 */
async function callGeminiAPI(
  prompt: string,
  systemPrompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    signal?: AbortSignal;
  } = {}
): Promise<{ text: string; tokensUsed: { input: number; output: number } }> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY_1;

  if (!apiKey) {
    throw new Error('No Google AI API key configured');
  }

  const { temperature = 0.7, maxTokens = 1500, signal } = options;

  // Create timeout controller if no signal provided
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const effectiveSignal = signal || controller.signal;

  try {
    // Use x-goog-api-key header instead of URL parameter for security
    const response = await fetch(
      `${GEMINI_API_URL}/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        signal: effectiveSignal,
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            responseMimeType: 'application/json',
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
        }),
      }
    );

    if (!response.ok) {
      // Don't leak internal API error details
      const status = response.status;
      if (status === 429) {
        throw new Error('AI service rate limited. Please try again later.');
      } else if (status >= 500) {
        throw new Error('AI service temporarily unavailable. Please try again later.');
      } else {
        throw new Error('Failed to generate appearance. Please try again.');
      }
    }

    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      const finishReason = data.candidates?.[0]?.finishReason;
      throw new Error(`AI generation failed (reason: ${finishReason || 'unknown'})`);
    }

    const tokensUsed = {
      input: data.usageMetadata?.promptTokenCount || 0,
      output: data.usageMetadata?.candidatesTokenCount || 0,
    };

    return { text, tokensUsed };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Parse JSON response from Gemini
 */
function parseJSONResponse<T>(text: string): T {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  return JSON.parse(cleaned) as T;
}

// ============================================================================
// APPEARANCE GENERATION
// ============================================================================

const APPEARANCE_SYSTEM_PROMPT = `You are an expert character designer specializing in creating visually distinctive and personality-aligned appearances.

Your task is to generate detailed physical appearance attributes for a character based on their personality and context.

Guidelines:
1. Appearance should reflect personality (e.g., creative types might have unconventional hair)
2. Consider occupation and lifestyle in clothing choices
3. Be specific with colors (not just "brown" but "warm chestnut brown")
4. Include distinctive features that make the character memorable
5. Ensure age-appropriate descriptions
6. Keep descriptions suitable for image generation (SD/Midjourney style)

Always respond with valid JSON only.`;

/**
 * Generate appearance attributes from context.
 *
 * @param context - Character context (name, age, gender, personality, etc.)
 * @returns Generated appearance attributes
 */
export async function generateAppearanceAttributes(
  context: AppearanceContext
): Promise<AnalysisResult<RawAppearanceData>> {
  const contextString = `
Character Details:
- Name: ${sanitizeInput(context.name || 'Unknown', 100)}
- Age: ${sanitizeInput(String(context.age || 'young adult'), 20)}
- Gender: ${sanitizeInput(context.gender || 'unspecified', 50)}
- Occupation: ${sanitizeInput(context.occupation || 'unspecified', 100)}
- Ethnicity: ${sanitizeInput(context.ethnicity || 'unspecified', 50)}
${context.personality ? `- Personality: ${sanitizeInput(context.personality, 500)}` : ''}
${context.existingAppearance ? `- Existing Description: ${sanitizeInput(context.existingAppearance, 500)}` : ''}`;

  const prompt = `Based on this character, generate their physical appearance:

${contextString}

Return ONLY a JSON object with this structure:
{
  "hairColor": "specific color description",
  "hairStyle": "style description (length, texture, how it's worn)",
  "eyeColor": "specific eye color",
  "clothing": "typical outfit description (1-2 sentences)",
  "skinTone": "skin tone description",
  "bodyType": "build/body type",
  "facialFeatures": "distinctive facial features",
  "additionalFeatures": ["any other distinctive features"]
}`;

  try {
    const { text, tokensUsed } = await callGeminiAPI(prompt, APPEARANCE_SYSTEM_PROMPT, {
      temperature: 0.7,
      maxTokens: 800,
    });

    const appearance = parseJSONResponse<RawAppearanceData>(text);

    // Validate required fields
    if (!appearance.hairColor || !appearance.eyeColor) {
      throw new Error('Missing required appearance fields');
    }

    return {
      success: true,
      data: {
        hairColor: String(appearance.hairColor).trim(),
        hairStyle: String(appearance.hairStyle || '').trim(),
        eyeColor: String(appearance.eyeColor).trim(),
        clothing: String(appearance.clothing || '').trim(),
        skinTone: appearance.skinTone,
        bodyType: appearance.bodyType,
        facialFeatures: appearance.facialFeatures,
        additionalFeatures: Array.isArray(appearance.additionalFeatures)
          ? appearance.additionalFeatures.map(String)
          : [],
      },
      tokensUsed,
    };
  } catch (error) {
    console.error('[AppearanceGenerator] Attribute generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: getDefaultAppearance(context),
    };
  }
}

// ============================================================================
// PROMPT GENERATION
// ============================================================================

const PROMPT_SYSTEM_PROMPT = `You are an expert at writing prompts for image generation models (Stable Diffusion, Midjourney, Gemini Imagen).

Your task is to create detailed, high-quality prompts that will generate consistent character portraits.

Best practices:
1. Start with the subject type (portrait, full body, etc.)
2. Include key physical features early in the prompt
3. Specify lighting, mood, and style
4. Use comma-separated descriptors
5. Include quality tags for better results
6. Be specific but not overly verbose

Always respond with valid JSON only.`;

interface PromptGenerationInput {
  appearance: RawAppearanceData;
  context: AppearanceContext;
  style: CharacterStyle;
}

/**
 * Generate a Stable Diffusion / Imagen prompt from appearance data.
 *
 * @param input - Appearance data and context
 * @returns Base prompt and negative prompt
 */
export async function generateImagePrompt(
  input: PromptGenerationInput
): Promise<AnalysisResult<{ basePrompt: string; negativePrompt: string }>> {
  const { appearance, context, style } = input;

  const styleModifiers = getStyleModifiers(style);

  const prompt = `Generate an image generation prompt for this character:

APPEARANCE:
- Hair: ${sanitizeInput(appearance.hairColor, 100)}, ${sanitizeInput(appearance.hairStyle, 200)}
- Eyes: ${sanitizeInput(appearance.eyeColor, 50)}
- Skin: ${sanitizeInput(appearance.skinTone || 'natural', 50)}
- Body: ${sanitizeInput(appearance.bodyType || 'average build', 100)}
- Clothing: ${sanitizeInput(appearance.clothing, 300)}
- Features: ${sanitizeInput(appearance.facialFeatures || 'none specified', 200)}
${appearance.additionalFeatures?.length ? `- Additional: ${appearance.additionalFeatures.map((f) => sanitizeInput(f, 100)).join(', ')}` : ''}

CHARACTER CONTEXT:
- Name: ${sanitizeInput(context.name || 'Unknown', 100)}
- Age: ${sanitizeInput(String(context.age || 'young adult'), 20)}
- Gender: ${sanitizeInput(context.gender || 'unspecified', 50)}

STYLE: ${style} (${styleModifiers.description})

Return ONLY a JSON object:
{
  "basePrompt": "detailed prompt optimized for ${style} style image generation",
  "negativePrompt": "things to avoid in generation"
}`;

  try {
    const { text, tokensUsed } = await callGeminiAPI(prompt, PROMPT_SYSTEM_PROMPT, {
      temperature: 0.6,
      maxTokens: 600,
    });

    const result = parseJSONResponse<{ basePrompt: string; negativePrompt: string }>(text);

    // Enhance with style modifiers
    const enhancedPrompt = `${result.basePrompt}, ${styleModifiers.suffix}`;
    const enhancedNegative = `${result.negativePrompt}, ${styleModifiers.negativeBase}`;

    return {
      success: true,
      data: {
        basePrompt: enhancedPrompt,
        negativePrompt: enhancedNegative,
      },
      tokensUsed,
    };
  } catch (error) {
    console.error('[AppearanceGenerator] Prompt generation failed:', error);

    // Generate fallback prompt
    const fallbackPrompt = generateFallbackPrompt(appearance, context, style);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: fallbackPrompt,
    };
  }
}

// ============================================================================
// COMPLETE APPEARANCE GENERATION
// ============================================================================

/**
 * Generate a complete CharacterAppearance from context.
 *
 * This is the main function that orchestrates:
 * 1. Generate appearance attributes from personality/context
 * 2. Generate optimized image prompt
 * 3. Combine into CharacterAppearanceData
 *
 * @param context - Character context
 * @returns Complete CharacterAppearanceData
 */
export async function generateCharacterAppearance(
  context: AppearanceContext
): Promise<AnalysisResult<CharacterAppearanceData>> {
  const style = context.style || 'realistic';
  const gender = normalizeGender(context.gender);
  const age = normalizeAge(context.age);

  try {
    // Step 1: Generate appearance attributes
    const attributesResult = await generateAppearanceAttributes(context);
    const attributes = attributesResult.data || getDefaultAppearance(context);

    // Step 2: Generate image prompt
    const promptResult = await generateImagePrompt({
      appearance: attributes,
      context,
      style,
    });
    const prompts = promptResult.data || generateFallbackPrompt(attributes, context, style);

    // Step 3: Combine into CharacterAppearanceData
    const appearance: CharacterAppearanceData = {
      gender,
      age,
      ethnicity: context.ethnicity,
      hairColor: attributes.hairColor,
      hairStyle: attributes.hairStyle,
      eyeColor: attributes.eyeColor,
      clothing: attributes.clothing,
      style,
      basePrompt: prompts.basePrompt,
      negativePrompt: prompts.negativePrompt,
      preferredProvider: 'gemini',
    };

    // Calculate total tokens
    const totalTokens = {
      input: (attributesResult.tokensUsed?.input || 0) + (promptResult.tokensUsed?.input || 0),
      output: (attributesResult.tokensUsed?.output || 0) + (promptResult.tokensUsed?.output || 0),
    };

    return {
      success: true,
      data: appearance,
      tokensUsed: totalTokens,
    };
  } catch (error) {
    console.error('[AppearanceGenerator] Complete appearance generation failed:', error);

    // Return minimal valid appearance
    const fallbackAttributes = getDefaultAppearance(context);
    const fallbackPrompts = generateFallbackPrompt(fallbackAttributes, context, style);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        gender,
        age,
        style,
        hairColor: fallbackAttributes.hairColor,
        hairStyle: fallbackAttributes.hairStyle,
        eyeColor: fallbackAttributes.eyeColor,
        clothing: fallbackAttributes.clothing,
        basePrompt: fallbackPrompts.basePrompt,
        negativePrompt: fallbackPrompts.negativePrompt,
        preferredProvider: 'gemini',
      },
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function normalizeGender(gender?: string): GenderType {
  if (!gender) return 'other';
  const g = gender.toLowerCase().trim();
  if (g === 'male' || g === 'm' || g === 'man' || g === 'hombre') return 'male';
  if (g === 'female' || g === 'f' || g === 'woman' || g === 'mujer') return 'female';
  if (g === 'non-binary' || g === 'nb' || g === 'nonbinary') return 'non-binary';
  return 'other';
}

function normalizeAge(age?: string | number): AgeRange | string {
  if (!age) return '23-27';
  if (typeof age === 'number') {
    if (age < 18) return '18-22'; // Minimum age
    if (age <= 22) return '18-22';
    if (age <= 27) return '23-27';
    if (age <= 35) return '28-35';
    if (age <= 45) return '36-45';
    if (age <= 60) return '46-60';
    return '60+';
  }
  // Already a string range
  return age;
}

function getStyleModifiers(style: CharacterStyle): {
  description: string;
  suffix: string;
  negativeBase: string;
} {
  switch (style) {
    case 'anime':
      return {
        description: 'anime/manga art style',
        suffix:
          'anime style, detailed anime art, vibrant colors, clean lines, anime portrait, high quality anime',
        negativeBase:
          'realistic, photorealistic, 3d render, photograph, bad anatomy, extra limbs, deformed',
      };
    case 'semi-realistic':
      return {
        description: 'semi-realistic art style (blend of realistic and stylized)',
        suffix:
          'semi-realistic, digital art, detailed, stylized portrait, soft lighting, artstation quality',
        negativeBase:
          'bad anatomy, deformed, blurry, low quality, oversaturated, cartoon, anime',
      };
    case 'realistic':
    default:
      return {
        description: 'photorealistic style',
        suffix:
          'photorealistic, detailed, high resolution, professional portrait, studio lighting, 8k uhd',
        negativeBase:
          'cartoon, anime, drawing, painting, bad anatomy, deformed, blurry, low quality',
      };
  }
}

function getDefaultAppearance(context: AppearanceContext): RawAppearanceData {
  // Generate sensible defaults based on gender
  const isMale = context.gender?.toLowerCase() === 'male';

  return {
    hairColor: isMale ? 'dark brown' : 'chestnut brown',
    hairStyle: isMale ? 'short, neatly styled' : 'shoulder-length, soft waves',
    eyeColor: 'warm brown',
    clothing: isMale
      ? 'casual button-up shirt with rolled sleeves, dark jeans'
      : 'comfortable blouse, fitted jeans, minimal jewelry',
    skinTone: 'natural',
    bodyType: 'average build',
    facialFeatures: 'expressive eyes, friendly features',
    additionalFeatures: [],
  };
}

function generateFallbackPrompt(
  appearance: RawAppearanceData,
  context: AppearanceContext,
  style: CharacterStyle
): { basePrompt: string; negativePrompt: string } {
  const styleModifiers = getStyleModifiers(style);
  const gender = context.gender || 'person';
  const age = context.age || 'young adult';

  const basePrompt = `portrait of a ${age} ${gender}, ${appearance.hairColor} ${appearance.hairStyle} hair, ${appearance.eyeColor} eyes, wearing ${appearance.clothing}, ${styleModifiers.suffix}`;

  const negativePrompt = styleModifiers.negativeBase;

  return { basePrompt, negativePrompt };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generateAppearanceAttributes,
  generateImagePrompt,
  generateCharacterAppearance,
};
