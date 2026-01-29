/**
 * Generador Automático de Configuración de Componentes Minecraft
 *
 * Analiza la imagen de referencia de un agente y genera automáticamente
 * la configuración de componentes modulares para su skin de Minecraft.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { SkinConfiguration, ComponentStyle } from '@/types/minecraft-skin-components';
import { logError } from '@/lib/logger';
import fs from 'fs/promises';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

interface VisualAnalysis {
  gender: 'male' | 'female' | 'non_binary';
  skinTone: string;      // hex color
  hairColor: string;     // hex color
  eyeColor: string;      // hex color
  hairLength: 'bald' | 'very_short' | 'short' | 'medium' | 'long';
  hairStyle: 'straight' | 'wavy' | 'curly' | 'updo';
  age: 'young' | 'adult' | 'elderly';
  clothingStyle: 'casual' | 'formal' | 'athletic' | 'historical';
}

/**
 * Analiza una imagen con Gemini Vision y extrae características visuales
 */
async function analyzeImageWithGemini(imageUrl: string): Promise<VisualAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Si es URL local, cargar imagen desde filesystem
    let imagePart;
    if (imageUrl.startsWith('/')) {
      const fullPath = path.join(process.cwd(), 'public', imageUrl);
      const imageBuffer = await fs.readFile(fullPath);
      const base64Image = imageBuffer.toString('base64');

      // Determinar mime type
      const ext = path.extname(imageUrl).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' :
                      ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                      ext === '.webp' ? 'image/webp' : 'image/png';

      imagePart = {
        inlineData: {
          data: base64Image,
          mimeType,
        },
      };
    } else {
      // URL externa - Gemini puede cargarla directamente
      imagePart = {
        fileData: {
          fileUri: imageUrl,
          mimeType: 'image/jpeg',
        },
      };
    }

    const prompt = `Analiza esta imagen de un personaje y extrae las siguientes características EXACTAS para generar una skin de Minecraft.

IMPORTANTE: Responde SOLO con un objeto JSON válido, sin markdown, sin explicaciones adicionales.

Características a extraer:
{
  "gender": "male" | "female" | "non_binary",
  "skinTone": "#RRGGBB (hex color de la piel, ejemplos: #F5D7B1 pálido, #D4A882 medio, #8B6F47 oscuro)",
  "hairColor": "#RRGGBB (hex color del pelo, ejemplos: #1C1208 negro, #8B6F47 castaño, #E8E8E8 blanco)",
  "eyeColor": "#RRGGBB (hex color de los ojos, ejemplos: #4A7BA7 azul, #654321 marrón, #228B22 verde)",
  "hairLength": "bald" | "very_short" | "short" | "medium" | "long",
  "hairStyle": "straight" | "wavy" | "curly" | "updo (recogido/ponytail/bun)",
  "age": "young" | "adult" | "elderly",
  "clothingStyle": "casual" | "formal" | "athletic" | "historical"
}

Reglas:
- skinTone: Analiza el tono de piel visible y da el color hex más cercano
- hairColor: Color principal del cabello
- eyeColor: Color del iris
- hairLength: bald (calvo), very_short (rapado <2cm), short (2-10cm), medium (10-30cm), long (>30cm)
- hairStyle: straight (liso), wavy (ondulado), curly (rizado), updo (recogido/colita/moño)
- age: young (<25), adult (25-60), elderly (>60)
- clothingStyle: Estilo de ropa predominante

Responde SOLO con el JSON:`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response.text();

    // Limpiar respuesta (remover markdown si existe)
    const jsonText = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const analysis = JSON.parse(jsonText) as VisualAnalysis;

    console.log('[Component Config Generator] Análisis Gemini:', analysis);

    return analysis;

  } catch (error) {
    logError(error, { context: 'analyzeImageWithGemini', imageUrl });

    // Fallback: valores por defecto
    return {
      gender: 'female',
      skinTone: '#F5D7B1',
      hairColor: '#8B6F47',
      eyeColor: '#654321',
      hairLength: 'medium',
      hairStyle: 'straight',
      age: 'adult',
      clothingStyle: 'casual',
    };
  }
}

/**
 * Selecciona componentes apropiados basado en el análisis visual
 */
function selectComponents(analysis: VisualAnalysis): SkinConfiguration['components'] {
  const isFemale = analysis.gender === 'female';
  const isMale = analysis.gender === 'male';

  const components: SkinConfiguration['components'] = {
    // Base
    headBase: isFemale ? 'head_female_01' : 'head_base_01',
    eyes: isFemale ? 'eyes_female_01' : 'eyes_01',
    mouth: isFemale ? 'mouth_empty' : 'mouth_02',
    torso: isFemale ? 'torso_slim_01' : 'torso_athletic_01',
    arms: isFemale ? 'arms_slim_01' : 'arms_classic_01',
    legs: 'legs_average_01',
  };

  // Selección de pelo según longitud y estilo
  if (analysis.hairLength === 'bald') {
    // Sin pelo - dejar headBase limpio
  } else if (analysis.hairLength === 'very_short' || analysis.hairLength === 'short') {
    // Pelo corto
    if (analysis.hairStyle === 'curly') {
      components.hairFront = 'hair_curly_red_09'; // Reutilizamos, se recoloreará
    } else if (isFemale) {
      components.hairFront = 'hair_short_02_bob';
    } else {
      components.hairFront = 'hair_short_06_undercut';
    }
  } else if (analysis.hairLength === 'medium') {
    // Pelo medio
    if (isFemale) {
      components.hairFront = 'hair_medium_01_lob';
    } else {
      components.hairFront = 'hair_short_06_undercut';
    }
  } else if (analysis.hairLength === 'long') {
    // Pelo largo
    if (analysis.hairStyle === 'updo') {
      // Recogido
      components.hairBack = 'hair_updo_01_high_ponytail';
    } else if (analysis.hairStyle === 'curly') {
      components.hairFront = 'hair_curly_red_09';
      components.hairBody = 'hair_body_curly_09';
    } else if (analysis.hairStyle === 'wavy') {
      components.hairFront = 'hair_long_02_wavy';
      components.hairBody = 'hair_long_body_02_wavy';
    } else {
      // Liso
      components.hairFront = 'hair_long_straight_07';
      components.hairBody = 'hair_body_long_07';
    }
  }

  // Ropa según estilo
  if (analysis.clothingStyle === 'formal') {
    components.shirt = 'shirt_01';
    components.pants = 'pants_01';
    components.shoes = 'shoes_02';
  } else if (analysis.clothingStyle === 'athletic') {
    components.tShirt = 't_shirt_02';
    components.pants = 'pants_01';
    components.shoes = 'shoes_01';
  } else if (analysis.clothingStyle === 'historical') {
    components.shirt = 'shirt_01';
    components.pants = 'pants_01';
    components.shoes = 'boots_01';
  } else {
    // Casual (por defecto)
    components.tShirt = 't_shirt_01';
    components.pants = 'pants_01';
    components.shoes = 'shoes_01';
  }

  return components;
}

/**
 * Ajusta brillo de un color hex
 */
function adjustColorBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));

  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase();
}

/**
 * Genera configuración completa de componentes desde una imagen
 *
 * @param referenceImageUrl URL de la imagen de referencia (/personajes/... o URL externa)
 * @returns SkinConfiguration completa lista para assembleSkin
 */
export async function generateComponentConfig(
  referenceImageUrl: string
): Promise<SkinConfiguration> {
  console.log('[Component Config Generator] Generando config para:', referenceImageUrl);

  // 1. Analizar imagen con Gemini Vision
  const analysis = await analyzeImageWithGemini(referenceImageUrl);

  // 2. Seleccionar componentes apropiados
  const components = selectComponents(analysis);

  // 3. Construir configuración completa
  const config: SkinConfiguration = {
    bodyGenes: {
      height: 'average',
      build: analysis.gender === 'female' ? 'slim' : 'athletic',
      armModel: analysis.gender === 'female' ? 'slim' : 'classic',
      chest: analysis.gender === 'female' ? 'medium' : 'flat',
      hips: 'average',
      shoulders: analysis.gender === 'female' ? 'narrow' : 'average',
      headSize: 'normal',
      legLength: 'normal',
    },
    facialGenes: {
      faceShape: 'oval',
      eyeSize: analysis.gender === 'female' ? 'large' : 'medium',
      eyeSpacing: 'normal',
      noseSize: 'medium',
      mouthWidth: 'normal',
      jawline: analysis.gender === 'female' ? 'soft' : 'normal',
      eyeExpression: 'neutral',
      mouthExpression: 'neutral',
    },
    colors: {
      skinTone: analysis.skinTone,
      skinShadow: adjustColorBrightness(analysis.skinTone, -20),
      skinHighlight: adjustColorBrightness(analysis.skinTone, 20),
      hairPrimary: analysis.hairColor,
      eyeColor: analysis.eyeColor,
      eyeWhite: '#FFFFFF',
      eyePupil: '#000000',
      clothingPrimary: '#4169E1', // Azul por defecto
      clothingSecondary: '#2C3E50',
    },
    components,
    style: ComponentStyle.PIXEL,
    version: 1,
    generatedAt: new Date().toISOString(),
  };

  console.log('[Component Config Generator] Config generada exitosamente');

  return config;
}

/**
 * Genera y guarda componentConfig en la metadata de un agente
 *
 * @param agentId ID del agente
 * @param referenceImageUrl URL de la imagen de referencia
 */
export async function generateAndSaveComponentConfig(
  agentId: string,
  referenceImageUrl: string
): Promise<void> {
  try {
    const { prisma } = await import('@/lib/prisma');

    console.log('[Component Config Generator] Generando para agente:', agentId);

    // Generar configuración
    const componentConfig = await generateComponentConfig(referenceImageUrl);

    // Obtener metadata actual
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { metadata: true },
    });

    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const metadata = (agent.metadata as any) || {};

    // Actualizar metadata con componentConfig
    metadata.minecraft = metadata.minecraft || {};
    metadata.minecraft.componentConfig = componentConfig;
    metadata.minecraft.generatedAt = new Date().toISOString();
    metadata.minecraft.compatible = true;

    // Guardar en BD
    await prisma.agent.update({
      where: { id: agentId },
      data: { metadata },
    });

    console.log('[Component Config Generator] Config guardada exitosamente para:', agentId);

  } catch (error) {
    logError(error, { context: 'generateAndSaveComponentConfig', agentId, referenceImageUrl });
    throw error;
  }
}
