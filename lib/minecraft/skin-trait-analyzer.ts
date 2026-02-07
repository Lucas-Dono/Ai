import { GoogleGenerativeAI } from '@google/generative-ai';
import { MinecraftSkinTraits } from '@/types/minecraft-skin';
import { logError } from '@/lib/logger';

/**
 * Analiza una imagen para extraer rasgos de skin de Minecraft
 * Costo: ~$0.001 por análisis (Gemini 2.0 Flash)
 */
export async function analyzeSkinTraits(
  imageUrl: string
): Promise<MinecraftSkinTraits> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Analiza esta imagen de personaje para crear una skin de Minecraft.
Extrae las siguientes características EN FORMATO JSON:

{
  "gender": "male|female|non_binary",
  "skinTone": "#HEXCOLOR (tono de piel promedio)",
  "hairColor": "#HEXCOLOR (color de pelo dominante, si es calvo usa #000000)",
  "eyeColor": "#HEXCOLOR (color de ojos)",
  "hairStyle": "short|long|bald|ponytail|curly",
  "clothingStyle": "modern|fantasy|medieval|casual|formal|athletic",
  "hasGlasses": true/false,
  "hasHat": true/false,
  "hasFacialHair": true/false
}

IMPORTANTE:
- Responde SOLO el JSON, sin texto adicional
- Usa colores hex reales extraídos de la imagen
- Si no puedes determinar algo, usa valores por defecto razonables`;

    // Descargar imagen y convertir a base64
    const imageBase64 = await fetchImageAsBase64(imageUrl);

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg',
        },
      },
    ]);

    const responseText = result.response.text();

    // Limpiar respuesta (Gemini a veces añade ```json```)
    const cleanJson = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const analysis = JSON.parse(cleanJson);

    // Seleccionar plantilla óptima
    const templateId = selectTemplate(analysis);

    const traits: MinecraftSkinTraits = {
      version: 1,
      ...analysis,
      templateId,
      generatedAt: new Date().toISOString(),
    };

    console.log('[Minecraft Skin] Traits generados:', traits);

    return traits;

  } catch (error) {
    logError(error, { context: 'analyzeSkinTraits', imageUrl });

    // Fallback a valores por defecto
    console.warn('[Minecraft Skin] Usando traits por defecto debido a error');
    return getDefaultTraits();
  }
}

/**
 * Selecciona la plantilla óptima basada en los rasgos analizados
 */
function selectTemplate(analysis: Partial<MinecraftSkinTraits>): string {
  const { gender, clothingStyle, hairStyle } = analysis;

  // Formato: {gender}_{clothingStyle}_{hairStyle}_{variant}
  const g = gender || 'male';
  const c = clothingStyle || 'casual';
  const h = hairStyle || 'short';

  return `${g}_${c}_${h}_01`;
}

/**
 * Descarga imagen y convierte a base64
 */
async function fetchImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('base64');

  } catch (error) {
    logError(error, { context: 'fetchImageAsBase64', url });
    throw error;
  }
}

/**
 * Traits por defecto (fallback)
 */
function getDefaultTraits(): MinecraftSkinTraits {
  return {
    version: 1,
    gender: 'non_binary',
    skinTone: '#F5D7B1', // Tono medio
    hairColor: '#3D2817', // Castaño oscuro
    eyeColor: '#4A7BA7',  // Azul
    hairStyle: 'short',
    clothingStyle: 'casual',
    hasGlasses: false,
    hasHat: false,
    hasFacialHair: false,
    templateId: 'non_binary_casual_short_01',
    generatedAt: new Date().toISOString(),
  };
}
