import { z } from 'zod';

/**
 * Rasgos de una skin de Minecraft
 * Se almacenan como JSON (~200 bytes) en vez de PNG (8KB)
 */
export interface MinecraftSkinTraits {
  version: 1; // Para migración futura

  // Análisis base
  gender: 'male' | 'female' | 'non_binary';
  skinTone: string;      // hex color #F5D7B1
  hairColor: string;     // hex color #3D2817
  eyeColor: string;      // hex color #4A7BA7

  // Estilo
  hairStyle: 'short' | 'long' | 'bald' | 'ponytail' | 'curly';
  clothingStyle: 'modern' | 'fantasy' | 'medieval' | 'casual' | 'formal' | 'athletic';

  // Accesorios (opcional)
  hasGlasses?: boolean;
  hasHat?: boolean;
  hasFacialHair?: boolean;

  // Plantilla seleccionada
  templateId: string; // 'male_modern_casual_01'

  // Timestamp de generación
  generatedAt: string;
}

/**
 * Zod schema para validación runtime
 */
export const MinecraftSkinTraitsSchema = z.object({
  version: z.literal(1),
  gender: z.enum(['male', 'female', 'non_binary']),
  skinTone: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be valid hex color'),
  hairColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be valid hex color'),
  eyeColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be valid hex color'),
  hairStyle: z.enum(['short', 'long', 'bald', 'ponytail', 'curly']),
  clothingStyle: z.enum(['modern', 'fantasy', 'medieval', 'casual', 'formal', 'athletic']),
  hasGlasses: z.boolean().optional(),
  hasHat: z.boolean().optional(),
  hasFacialHair: z.boolean().optional(),
  templateId: z.string(),
  generatedAt: z.string().datetime(),
});

/**
 * Metadata de Minecraft en Agent.metadata
 */
export interface MinecraftMetadata {
  compatible: boolean;
  skinTraits?: MinecraftSkinTraits;
  generatedAt: string;
}
