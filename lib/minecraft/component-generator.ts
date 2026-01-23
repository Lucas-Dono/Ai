/**
 * Generador de Componentes de Skins de Minecraft
 *
 * Genera sprites base (en escala de grises) que luego se recolorean programáticamente
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { ComponentCategory, UVRegion } from '@/types/minecraft-skin-components';

// ============================================================================
// CONSTANTES DE MINECRAFT
// ============================================================================

/**
 * Dimensiones de skin de Minecraft
 */
export const SKIN_WIDTH = 64;
export const SKIN_HEIGHT = 64;

/**
 * Coordenadas UV estándar de Minecraft (64x64)
 */
export const UV_REGIONS = {
  // CABEZA (Head)
  HEAD_FRONT: { x: 8, y: 8, width: 8, height: 8, name: 'head_front' },
  HEAD_RIGHT: { x: 0, y: 8, width: 8, height: 8, name: 'head_right' },
  HEAD_LEFT: { x: 16, y: 8, width: 8, height: 8, name: 'head_left' },
  HEAD_TOP: { x: 8, y: 0, width: 8, height: 8, name: 'head_top' },
  HEAD_BOTTOM: { x: 16, y: 0, width: 8, height: 8, name: 'head_bottom' },
  HEAD_BACK: { x: 24, y: 8, width: 8, height: 8, name: 'head_back' },

  // OVERLAY CABEZA (Hat/Hair - +0.5px más grande)
  HAT_TOP: { x: 40, y: 0, width: 8, height: 8, name: 'hat_top' },
  HAT_FRONT: { x: 40, y: 8, width: 8, height: 8, name: 'hat_front' },
  HAT_RIGHT: { x: 32, y: 8, width: 8, height: 8, name: 'hat_right' },
  HAT_LEFT: { x: 48, y: 8, width: 8, height: 8, name: 'hat_left' },
  HAT_BACK: { x: 56, y: 8, width: 8, height: 8, name: 'hat_back' },
  HAT_BOTTOM: { x: 48, y: 0, width: 8, height: 8, name: 'hat_bottom' },

  // TORSO (Body)
  BODY_FRONT: { x: 20, y: 20, width: 8, height: 12, name: 'body_front' },
  BODY_BACK: { x: 32, y: 20, width: 8, height: 12, name: 'body_back' },
  BODY_RIGHT: { x: 16, y: 20, width: 4, height: 12, name: 'body_right' },
  BODY_LEFT: { x: 28, y: 20, width: 4, height: 12, name: 'body_left' },
  BODY_TOP: { x: 20, y: 16, width: 8, height: 4, name: 'body_top' },
  BODY_BOTTOM: { x: 28, y: 16, width: 8, height: 4, name: 'body_bottom' },

  // BRAZO DERECHO (Right Arm - modelo Classic 4px)
  ARM_R_FRONT: { x: 44, y: 20, width: 4, height: 12, name: 'arm_r_front' },
  ARM_R_BACK: { x: 52, y: 20, width: 4, height: 12, name: 'arm_r_back' },
  ARM_R_RIGHT: { x: 40, y: 20, width: 4, height: 12, name: 'arm_r_right' },
  ARM_R_LEFT: { x: 48, y: 20, width: 4, height: 12, name: 'arm_r_left' },
  ARM_R_TOP: { x: 44, y: 16, width: 4, height: 4, name: 'arm_r_top' },
  ARM_R_BOTTOM: { x: 48, y: 16, width: 4, height: 4, name: 'arm_r_bottom' },

  // BRAZO IZQUIERDO (Left Arm - modelo Classic 4px)
  ARM_L_FRONT: { x: 36, y: 52, width: 4, height: 12, name: 'arm_l_front' },
  ARM_L_BACK: { x: 44, y: 52, width: 4, height: 12, name: 'arm_l_back' },
  ARM_L_RIGHT: { x: 32, y: 52, width: 4, height: 12, name: 'arm_l_right' },
  ARM_L_LEFT: { x: 40, y: 52, width: 4, height: 12, name: 'arm_l_left' },
  ARM_L_TOP: { x: 36, y: 48, width: 4, height: 4, name: 'arm_l_top' },
  ARM_L_BOTTOM: { x: 40, y: 48, width: 4, height: 4, name: 'arm_l_bottom' },

  // PIERNA DERECHA (Right Leg)
  LEG_R_FRONT: { x: 4, y: 20, width: 4, height: 12, name: 'leg_r_front' },
  LEG_R_BACK: { x: 12, y: 20, width: 4, height: 12, name: 'leg_r_back' },
  LEG_R_RIGHT: { x: 0, y: 20, width: 4, height: 12, name: 'leg_r_right' },
  LEG_R_LEFT: { x: 8, y: 20, width: 4, height: 12, name: 'leg_r_left' },
  LEG_R_TOP: { x: 4, y: 16, width: 4, height: 4, name: 'leg_r_top' },
  LEG_R_BOTTOM: { x: 8, y: 16, width: 4, height: 4, name: 'leg_r_bottom' },

  // PIERNA IZQUIERDA (Left Leg)
  LEG_L_FRONT: { x: 20, y: 52, width: 4, height: 12, name: 'leg_l_front' },
  LEG_L_BACK: { x: 28, y: 52, width: 4, height: 12, name: 'leg_l_back' },
  LEG_L_RIGHT: { x: 16, y: 52, width: 4, height: 12, name: 'leg_l_right' },
  LEG_L_LEFT: { x: 24, y: 52, width: 4, height: 12, name: 'leg_l_left' },
  LEG_L_TOP: { x: 20, y: 48, width: 4, height: 4, name: 'leg_l_top' },
  LEG_L_BOTTOM: { x: 24, y: 48, width: 4, height: 4, name: 'leg_l_bottom' },
} as const;

// ============================================================================
// BIBLIOTECA DE SPRITES - CABEZA BASE (PIEL)
// ============================================================================

/**
 * Genera sprite de cabeza base - Todas las caras
 * Se recolorea con skinTone
 */
export function generateHead_Base_01(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- HEAD TOP (8x8) at (8,0) -->
      <rect x="8" y="0" width="8" height="8" fill="#808080" class="colorizable-skin"/>

      <!-- HEAD BOTTOM (8x8) at (16,0) -->
      <rect x="16" y="0" width="8" height="8" fill="#707070" class="colorizable-skin"/>

      <!-- HEAD RIGHT (8x8) at (0,8) -->
      <rect x="0" y="8" width="8" height="8" fill="#707070" class="colorizable-skin"/>

      <!-- HEAD FRONT (8x8) at (8,8) -->
      <rect x="8" y="8" width="8" height="8" fill="#808080" class="colorizable-skin"/>

      <!-- HEAD LEFT (8x8) at (16,8) -->
      <rect x="16" y="8" width="8" height="8" fill="#707070" class="colorizable-skin"/>

      <!-- HEAD BACK (8x8) at (24,8) -->
      <rect x="24" y="8" width="8" height="8" fill="#606060" class="colorizable-skin"/>
    </svg>
  `;
}

// ============================================================================
// BIBLIOTECA DE SPRITES - OJOS
// ============================================================================

/**
 * Genera sprite de ojos - Tipo 1: Ojos grandes redondos
 */
export function generateEyes_01(): string {
  return `
    <svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">
      <!-- Fondo transparente -->
      <rect width="8" height="8" fill="none"/>

      <!-- Ojo izquierdo (desde perspectiva del personaje) -->
      <!-- Blanco del ojo -->
      <rect x="1" y="3" width="2" height="2" fill="#FFFFFF"/>
      <!-- Pupila (se recolorea) -->
      <rect x="2" y="3" width="1" height="2" fill="#808080" class="colorizable-eye"/>

      <!-- Ojo derecho (desde perspectiva del personaje) -->
      <!-- Blanco del ojo -->
      <rect x="5" y="3" width="2" height="2" fill="#FFFFFF"/>
      <!-- Pupila (se recolorea) -->
      <rect x="5" y="3" width="1" height="2" fill="#808080" class="colorizable-eye"/>

      <!-- Sombra superior (párpados) -->
      <rect x="1" y="2" width="2" height="1" fill="#404040"/>
      <rect x="5" y="2" width="2" height="1" fill="#404040"/>
    </svg>
  `;
}

/**
 * Genera sprite de ojos - Tipo 2: Ojos entrecerrados
 */
export function generateEyes_02(): string {
  return `
    <svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">
      <!-- Ojo izquierdo - entrecerrado -->
      <rect x="1" y="4" width="2" height="1" fill="#404040"/>
      <rect x="2" y="4" width="1" height="1" fill="#808080" class="colorizable-eye"/>

      <!-- Ojo derecho - entrecerrado -->
      <rect x="5" y="4" width="2" height="1" fill="#404040"/>
      <rect x="5" y="4" width="1" height="1" fill="#808080" class="colorizable-eye"/>
    </svg>
  `;
}

/**
 * Genera sprite de ojos - Tipo 3: Ojos grandes con brillo
 */
export function generateEyes_03(): string {
  return `
    <svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">
      <!-- Ojo izquierdo -->
      <rect x="1" y="2" width="2" height="3" fill="#FFFFFF"/>
      <rect x="2" y="2" width="1" height="3" fill="#808080" class="colorizable-eye"/>
      <!-- Brillo -->
      <rect x="1" y="2" width="1" height="1" fill="#FFFFFF" opacity="0.8"/>

      <!-- Ojo derecho -->
      <rect x="5" y="2" width="2" height="3" fill="#FFFFFF"/>
      <rect x="5" y="2" width="1" height="3" fill="#808080" class="colorizable-eye"/>
      <!-- Brillo -->
      <rect x="5" y="2" width="1" height="1" fill="#FFFFFF" opacity="0.8"/>
    </svg>
  `;
}

// ============================================================================
// BIBLIOTECA DE SPRITES - BOCAS
// ============================================================================

/**
 * Genera sprite de boca - Tipo 1: Sonrisa pequeña
 */
export function generateMouth_01(): string {
  return `
    <svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">
      <!-- Sonrisa (3 pixels) -->
      <rect x="2" y="6" width="1" height="1" fill="#303030"/>
      <rect x="3" y="6" width="2" height="1" fill="#303030"/>
      <rect x="5" y="6" width="1" height="1" fill="#303030"/>
      <!-- Curva de sonrisa -->
      <rect x="2" y="5" width="1" height="1" fill="#404040" opacity="0.5"/>
      <rect x="5" y="5" width="1" height="1" fill="#404040" opacity="0.5"/>
    </svg>
  `;
}

/**
 * Genera sprite de boca - Tipo 2: Neutral (línea)
 */
export function generateMouth_02(): string {
  return `
    <svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">
      <!-- Línea neutral -->
      <rect x="2" y="6" width="4" height="1" fill="#303030"/>
    </svg>
  `;
}

/**
 * Genera sprite de boca - Tipo 3: Sonrisa amplia
 */
export function generateMouth_03(): string {
  return `
    <svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">
      <!-- Sonrisa amplia con dientes -->
      <rect x="1" y="6" width="6" height="1" fill="#303030"/>
      <rect x="2" y="5" width="4" height="1" fill="#FFFFFF"/>
      <!-- Sombra -->
      <rect x="1" y="5" width="1" height="1" fill="#202020" opacity="0.3"/>
      <rect x="6" y="5" width="1" height="1" fill="#202020" opacity="0.3"/>
    </svg>
  `;
}

// ============================================================================
// BIBLIOTECA DE SPRITES - PELO
// ============================================================================

/**
 * Genera sprite de pelo completo - Tipo 1: Pelo corto estilizado
 * Incluye todas las caras de la capa de pelo (HAT layer)
 */
export function generateHairFront_01(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- HAT_TOP (8x8) at (40,0) - Vista superior con volumen -->
      <rect x="40" y="0" width="8" height="8" fill="#808080" class="colorizable-hair"/>
      <rect x="41" y="0" width="6" height="1" fill="#909090" class="colorizable-hair"/>
      <!-- Línea central -->
      <rect x="43" y="1" width="2" height="6" fill="#707070" class="colorizable-hair" opacity="0.3"/>

      <!-- HAT_BOTTOM (8x8) at (48,0) - Vista inferior (vacío) -->

      <!-- HAT_RIGHT (8x8) at (32,8) - Lado derecho estilizado -->
      <!-- Base del pelo -->
      <rect x="32" y="8" width="8" height="2" fill="#808080" class="colorizable-hair"/>
      <!-- Mechones laterales -->
      <rect x="32" y="10" width="6" height="1" fill="#808080" class="colorizable-hair"/>
      <rect x="32" y="11" width="5" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="32" y="12" width="3" height="1" fill="#707070" class="colorizable-hair"/>
      <!-- Sombra -->
      <rect x="32" y="13" width="2" height="2" fill="#606060" class="colorizable-hair" opacity="0.5"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Frente con flequillo -->
      <rect x="40" y="8" width="8" height="2" fill="#808080" class="colorizable-hair"/>
      <!-- Mechones del flequillo -->
      <rect x="41" y="10" width="2" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="45" y="10" width="2" height="1" fill="#707070" class="colorizable-hair"/>
      <!-- Puntas -->
      <rect x="41" y="11" width="1" height="1" fill="#606060" class="colorizable-hair"/>
      <rect x="46" y="11" width="1" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Lado izquierdo estilizado -->
      <!-- Base del pelo -->
      <rect x="48" y="8" width="8" height="2" fill="#808080" class="colorizable-hair"/>
      <!-- Mechones laterales -->
      <rect x="50" y="10" width="6" height="1" fill="#808080" class="colorizable-hair"/>
      <rect x="51" y="11" width="5" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="53" y="12" width="3" height="1" fill="#707070" class="colorizable-hair"/>
      <!-- Sombra -->
      <rect x="54" y="13" width="2" height="2" fill="#606060" class="colorizable-hair" opacity="0.5"/>

      <!-- HAT_BACK (8x8) at (56,8) - Parte trasera -->
      <rect x="56" y="8" width="8" height="3" fill="#808080" class="colorizable-hair"/>
      <rect x="57" y="11" width="6" height="1" fill="#707070" class="colorizable-hair"/>
    </svg>
  `;
}

/**
 * Genera sprite de pelo completo - Tipo 2: Pelo largo lateral estilizado
 * Incluye todas las caras de la capa de pelo (HAT layer)
 */
export function generateHairFront_02(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- HAT_TOP (8x8) at (40,0) - Vista superior con volumen -->
      <rect x="40" y="0" width="8" height="8" fill="#808080" class="colorizable-hair"/>
      <rect x="41" y="0" width="6" height="1" fill="#909090" class="colorizable-hair"/>
      <!-- Línea central -->
      <rect x="43" y="1" width="2" height="6" fill="#707070" class="colorizable-hair" opacity="0.3"/>

      <!-- HAT_RIGHT (8x8) at (32,8) - Lado derecho con pelo largo estilizado -->
      <!-- Base del pelo -->
      <rect x="32" y="8" width="8" height="3" fill="#808080" class="colorizable-hair"/>
      <!-- Transición -->
      <rect x="32" y="11" width="7" height="1" fill="#808080" class="colorizable-hair"/>
      <rect x="32" y="12" width="6" height="1" fill="#707070" class="colorizable-hair"/>
      <!-- Mechón largo con puntas -->
      <rect x="33" y="13" width="4" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="33" y="14" width="2" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Frente con flequillo lateral -->
      <rect x="40" y="8" width="3" height="3" fill="#808080" class="colorizable-hair"/>
      <rect x="41" y="11" width="2" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="41" y="12" width="1" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Lado izquierdo con pelo largo estilizado -->
      <!-- Base del pelo -->
      <rect x="48" y="8" width="8" height="3" fill="#808080" class="colorizable-hair"/>
      <!-- Transición -->
      <rect x="49" y="11" width="7" height="1" fill="#808080" class="colorizable-hair"/>
      <rect x="50" y="12" width="6" height="1" fill="#707070" class="colorizable-hair"/>
      <!-- Mechón largo con puntas -->
      <rect x="51" y="13" width="4" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="53" y="14" width="2" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Parte trasera con detalle -->
      <rect x="56" y="8" width="8" height="4" fill="#808080" class="colorizable-hair"/>
      <rect x="57" y="12" width="6" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="58" y="13" width="4" height="1" fill="#606060" class="colorizable-hair" opacity="0.5"/>
    </svg>
  `;
}

/**
 * Genera sprite de pelo - Tipo 3: Coleta alta (vista superior)
 * NOTA: Este se mantiene solo para HAT_TOP, se combina con otros
 */
export function generateHairTop_01(): string {
  return `
    <svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">
      <!-- Base de la coleta en la parte superior -->
      <rect x="3" y="0" width="2" height="2" fill="#808080" class="colorizable-hair"/>
      <rect x="2" y="1" width="4" height="1" fill="#707070" class="colorizable-hair"/>
      <!-- Volumen -->
      <rect x="1" y="0" width="6" height="1" fill="#909090" class="colorizable-hair"/>
    </svg>
  `;
}

/**
 * Genera sprite de pelo - Tipo 4: Pelo trasero corto
 * NOTA: Este se mantiene solo para HAT_BACK, se combina con otros
 */
export function generateHairBack_01(): string {
  return `
    <svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">
      <!-- Cubriendo parte trasera de la cabeza -->
      <rect x="0" y="0" width="8" height="3" fill="#808080" class="colorizable-hair"/>
      <rect x="1" y="3" width="6" height="1" fill="#707070" class="colorizable-hair"/>
    </svg>
  `;
}

// ============================================================================
// BIBLIOTECA DE SPRITES - CUERPO BASE
// ============================================================================

/**
 * Genera sprite de torso - Tipo 1: Complexión slim (estrecho)
 * Incluye todas las caras del modelo 3D
 */
export function generateTorso_Slim_01(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- BODY TOP (8x4) at (20,16) -->
      <rect x="20" y="16" width="8" height="4" fill="#707070" class="colorizable-skin"/>

      <!-- BODY BOTTOM (8x4) at (28,16) -->
      <rect x="28" y="16" width="8" height="4" fill="#606060" class="colorizable-skin"/>

      <!-- BODY RIGHT (4x12) at (16,20) -->
      <rect x="16" y="20" width="4" height="12" fill="#707070" class="colorizable-skin"/>

      <!-- BODY FRONT (8x12) at (20,20) -->
      <rect x="20" y="20" width="8" height="12" fill="#808080" class="colorizable-skin"/>
      <!-- Cintura estrecha -->
      <rect x="21" y="26" width="6" height="2" fill="#707070" class="colorizable-skin"/>

      <!-- BODY LEFT (4x12) at (28,20) -->
      <rect x="28" y="20" width="4" height="12" fill="#707070" class="colorizable-skin"/>

      <!-- BODY BACK (8x12) at (32,20) -->
      <rect x="32" y="20" width="8" height="12" fill="#606060" class="colorizable-skin"/>
    </svg>
  `;
}

/**
 * Genera sprite de torso - Tipo 2: Complexión athletic (atlético)
 */
export function generateTorso_Athletic_01(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- BODY TOP (8x4) at (20,16) -->
      <rect x="20" y="16" width="8" height="4" fill="#707070" class="colorizable-skin"/>

      <!-- BODY BOTTOM (8x4) at (28,16) -->
      <rect x="28" y="16" width="8" height="4" fill="#606060" class="colorizable-skin"/>

      <!-- BODY RIGHT (4x12) at (16,20) -->
      <rect x="16" y="20" width="4" height="12" fill="#707070" class="colorizable-skin"/>

      <!-- BODY FRONT (8x12) at (20,20) -->
      <rect x="20" y="20" width="8" height="12" fill="#808080" class="colorizable-skin"/>
      <!-- Definición muscular -->
      <rect x="22" y="22" width="2" height="8" fill="#707070" class="colorizable-skin" opacity="0.3"/>
      <rect x="24" y="22" width="2" height="8" fill="#707070" class="colorizable-skin" opacity="0.3"/>

      <!-- BODY LEFT (4x12) at (28,20) -->
      <rect x="28" y="20" width="4" height="12" fill="#707070" class="colorizable-skin"/>

      <!-- BODY BACK (8x12) at (32,20) -->
      <rect x="32" y="20" width="8" height="12" fill="#606060" class="colorizable-skin"/>
    </svg>
  `;
}

/**
 * Genera sprite de torso - Tipo 3: Complexión average (promedio)
 */
export function generateTorso_Average_01(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- BODY TOP (8x4) at (20,16) -->
      <rect x="20" y="16" width="8" height="4" fill="#707070" class="colorizable-skin"/>

      <!-- BODY BOTTOM (8x4) at (28,16) -->
      <rect x="28" y="16" width="8" height="4" fill="#606060" class="colorizable-skin"/>

      <!-- BODY RIGHT (4x12) at (16,20) -->
      <rect x="16" y="20" width="4" height="12" fill="#707070" class="colorizable-skin"/>

      <!-- BODY FRONT (8x12) at (20,20) -->
      <rect x="20" y="20" width="8" height="12" fill="#808080" class="colorizable-skin"/>

      <!-- BODY LEFT (4x12) at (28,20) -->
      <rect x="28" y="20" width="4" height="12" fill="#707070" class="colorizable-skin"/>

      <!-- BODY BACK (8x12) at (32,20) -->
      <rect x="32" y="20" width="8" height="12" fill="#606060" class="colorizable-skin"/>
    </svg>
  `;
}

/**
 * Genera sprite de brazos - Tipo 1: Brazos slim (3px)
 */
export function generateArms_Slim_01(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- ARM RIGHT (todas las caras del brazo derecho) -->
      <!-- ARM_R_TOP (4x4) at (44,16) -->
      <rect x="44" y="16" width="4" height="4" fill="#909090" class="colorizable-skin"/>

      <!-- ARM_R_BOTTOM (4x4) at (48,16) -->
      <rect x="48" y="16" width="4" height="4" fill="#707070" class="colorizable-skin"/>

      <!-- ARM_R_RIGHT (4x12) at (40,20) -->
      <rect x="40" y="20" width="4" height="12" fill="#808080" class="colorizable-skin"/>
      <!-- Sombra lateral -->
      <rect x="40" y="20" width="1" height="12" fill="#707070" class="colorizable-skin" opacity="0.4"/>

      <!-- ARM_R_FRONT (4x12) at (44,20) -->
      <rect x="44" y="20" width="4" height="12" fill="#909090" class="colorizable-skin"/>
      <!-- Definición antebrazo -->
      <rect x="45" y="26" width="1" height="6" fill="#808080" class="colorizable-skin" opacity="0.2"/>

      <!-- ARM_R_LEFT (4x12) at (48,20) -->
      <rect x="48" y="20" width="4" height="12" fill="#808080" class="colorizable-skin"/>
      <!-- Sombra lateral -->
      <rect x="51" y="20" width="1" height="12" fill="#707070" class="colorizable-skin" opacity="0.4"/>

      <!-- ARM_R_BACK (4x12) at (52,20) -->
      <rect x="52" y="20" width="4" height="12" fill="#707070" class="colorizable-skin"/>

      <!-- ARM LEFT (todas las caras del brazo izquierdo) -->
      <!-- ARM_L_TOP (4x4) at (36,48) -->
      <rect x="36" y="48" width="4" height="4" fill="#909090" class="colorizable-skin"/>

      <!-- ARM_L_BOTTOM (4x4) at (40,48) -->
      <rect x="40" y="48" width="4" height="4" fill="#707070" class="colorizable-skin"/>

      <!-- ARM_L_RIGHT (4x12) at (32,52) -->
      <rect x="32" y="52" width="4" height="12" fill="#808080" class="colorizable-skin"/>
      <!-- Sombra lateral -->
      <rect x="32" y="52" width="1" height="12" fill="#707070" class="colorizable-skin" opacity="0.4"/>

      <!-- ARM_L_FRONT (4x12) at (36,52) -->
      <rect x="36" y="52" width="4" height="12" fill="#909090" class="colorizable-skin"/>
      <!-- Definición antebrazo -->
      <rect x="37" y="58" width="1" height="6" fill="#808080" class="colorizable-skin" opacity="0.2"/>

      <!-- ARM_L_LEFT (4x12) at (40,52) -->
      <rect x="40" y="52" width="4" height="12" fill="#808080" class="colorizable-skin"/>
      <!-- Sombra lateral -->
      <rect x="43" y="52" width="1" height="12" fill="#707070" class="colorizable-skin" opacity="0.4"/>

      <!-- ARM_L_BACK (4x12) at (44,52) -->
      <rect x="44" y="52" width="4" height="12" fill="#707070" class="colorizable-skin"/>
    </svg>
  `;
}

/**
 * Genera sprite de brazos - Tipo 2: Brazos classic (4px)
 */
export function generateArms_Classic_01(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- ARM RIGHT (todas las caras del brazo derecho) -->
      <!-- ARM_R_TOP (4x4) at (44,16) -->
      <rect x="44" y="16" width="4" height="4" fill="#909090" class="colorizable-skin"/>

      <!-- ARM_R_BOTTOM (4x4) at (48,16) -->
      <rect x="48" y="16" width="4" height="4" fill="#707070" class="colorizable-skin"/>

      <!-- ARM_R_RIGHT (4x12) at (40,20) -->
      <rect x="40" y="20" width="4" height="12" fill="#808080" class="colorizable-skin"/>
      <!-- Sombra lateral -->
      <rect x="40" y="20" width="1" height="12" fill="#707070" class="colorizable-skin" opacity="0.4"/>

      <!-- ARM_R_FRONT (4x12) at (44,20) -->
      <rect x="44" y="20" width="4" height="12" fill="#909090" class="colorizable-skin"/>
      <!-- Definición muscular -->
      <rect x="45" y="22" width="2" height="4" fill="#808080" class="colorizable-skin" opacity="0.2"/>

      <!-- ARM_R_LEFT (4x12) at (48,20) -->
      <rect x="48" y="20" width="4" height="12" fill="#808080" class="colorizable-skin"/>
      <!-- Sombra lateral -->
      <rect x="51" y="20" width="1" height="12" fill="#707070" class="colorizable-skin" opacity="0.4"/>

      <!-- ARM_R_BACK (4x12) at (52,20) -->
      <rect x="52" y="20" width="4" height="12" fill="#707070" class="colorizable-skin"/>

      <!-- ARM LEFT (todas las caras del brazo izquierdo) -->
      <!-- ARM_L_TOP (4x4) at (36,48) -->
      <rect x="36" y="48" width="4" height="4" fill="#909090" class="colorizable-skin"/>

      <!-- ARM_L_BOTTOM (4x4) at (40,48) -->
      <rect x="40" y="48" width="4" height="4" fill="#707070" class="colorizable-skin"/>

      <!-- ARM_L_RIGHT (4x12) at (32,52) -->
      <rect x="32" y="52" width="4" height="12" fill="#808080" class="colorizable-skin"/>
      <!-- Sombra lateral -->
      <rect x="32" y="52" width="1" height="12" fill="#707070" class="colorizable-skin" opacity="0.4"/>

      <!-- ARM_L_FRONT (4x12) at (36,52) -->
      <rect x="36" y="52" width="4" height="12" fill="#909090" class="colorizable-skin"/>
      <!-- Definición muscular -->
      <rect x="37" y="54" width="2" height="4" fill="#808080" class="colorizable-skin" opacity="0.2"/>

      <!-- ARM_L_LEFT (4x12) at (40,52) -->
      <rect x="40" y="52" width="4" height="12" fill="#808080" class="colorizable-skin"/>
      <!-- Sombra lateral -->
      <rect x="43" y="52" width="1" height="12" fill="#707070" class="colorizable-skin" opacity="0.4"/>

      <!-- ARM_L_BACK (4x12) at (44,52) -->
      <rect x="44" y="52" width="4" height="12" fill="#707070" class="colorizable-skin"/>
    </svg>
  `;
}

/**
 * Genera sprite de piernas - Tipo 1: Piernas average (promedio)
 */
export function generateLegs_Average_01(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- LEG RIGHT (todas las caras de la pierna derecha) -->
      <!-- LEG_R_TOP (4x4) at (4,16) -->
      <rect x="4" y="16" width="4" height="4" fill="#707070" class="colorizable-skin"/>

      <!-- LEG_R_BOTTOM (4x4) at (8,16) -->
      <rect x="8" y="16" width="4" height="4" fill="#606060" class="colorizable-skin"/>

      <!-- LEG_R_RIGHT (4x12) at (0,20) -->
      <rect x="0" y="20" width="4" height="12" fill="#707070" class="colorizable-skin"/>

      <!-- LEG_R_FRONT (4x12) at (4,20) -->
      <rect x="4" y="20" width="4" height="12" fill="#808080" class="colorizable-skin"/>
      <!-- Definición de rodilla -->
      <rect x="5" y="26" width="2" height="1" fill="#707070" class="colorizable-skin" opacity="0.3"/>

      <!-- LEG_R_LEFT (4x12) at (8,20) -->
      <rect x="8" y="20" width="4" height="12" fill="#707070" class="colorizable-skin"/>

      <!-- LEG_R_BACK (4x12) at (12,20) -->
      <rect x="12" y="20" width="4" height="12" fill="#606060" class="colorizable-skin"/>

      <!-- LEG LEFT (todas las caras de la pierna izquierda) -->
      <!-- LEG_L_TOP (4x4) at (20,48) -->
      <rect x="20" y="48" width="4" height="4" fill="#707070" class="colorizable-skin"/>

      <!-- LEG_L_BOTTOM (4x4) at (24,48) -->
      <rect x="24" y="48" width="4" height="4" fill="#606060" class="colorizable-skin"/>

      <!-- LEG_L_RIGHT (4x12) at (16,52) -->
      <rect x="16" y="52" width="4" height="12" fill="#707070" class="colorizable-skin"/>

      <!-- LEG_L_FRONT (4x12) at (20,52) -->
      <rect x="20" y="52" width="4" height="12" fill="#808080" class="colorizable-skin"/>
      <!-- Definición de rodilla -->
      <rect x="21" y="58" width="2" height="1" fill="#707070" class="colorizable-skin" opacity="0.3"/>

      <!-- LEG_L_LEFT (4x12) at (24,52) -->
      <rect x="24" y="52" width="4" height="12" fill="#707070" class="colorizable-skin"/>

      <!-- LEG_L_BACK (4x12) at (28,52) -->
      <rect x="28" y="52" width="4" height="12" fill="#606060" class="colorizable-skin"/>
    </svg>
  `;
}

/**
 * Genera sprite de piernas - Tipo 2: Piernas long (largas)
 */
export function generateLegs_Long_01(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- LEG RIGHT (todas las caras de la pierna derecha) -->
      <!-- LEG_R_TOP (4x4) at (4,16) -->
      <rect x="4" y="16" width="4" height="4" fill="#707070" class="colorizable-skin"/>

      <!-- LEG_R_BOTTOM (4x4) at (8,16) -->
      <rect x="8" y="16" width="4" height="4" fill="#606060" class="colorizable-skin"/>

      <!-- LEG_R_RIGHT (4x12) at (0,20) -->
      <rect x="0" y="20" width="4" height="12" fill="#707070" class="colorizable-skin"/>

      <!-- LEG_R_FRONT (4x12) at (4,20) -->
      <rect x="4" y="20" width="4" height="12" fill="#808080" class="colorizable-skin"/>
      <!-- Definición de pantorrilla -->
      <rect x="5" y="28" width="2" height="3" fill="#707070" class="colorizable-skin" opacity="0.3"/>

      <!-- LEG_R_LEFT (4x12) at (8,20) -->
      <rect x="8" y="20" width="4" height="12" fill="#707070" class="colorizable-skin"/>

      <!-- LEG_R_BACK (4x12) at (12,20) -->
      <rect x="12" y="20" width="4" height="12" fill="#606060" class="colorizable-skin"/>

      <!-- LEG LEFT (todas las caras de la pierna izquierda) -->
      <!-- LEG_L_TOP (4x4) at (20,48) -->
      <rect x="20" y="48" width="4" height="4" fill="#707070" class="colorizable-skin"/>

      <!-- LEG_L_BOTTOM (4x4) at (24,48) -->
      <rect x="24" y="48" width="4" height="4" fill="#606060" class="colorizable-skin"/>

      <!-- LEG_L_RIGHT (4x12) at (16,52) -->
      <rect x="16" y="52" width="4" height="12" fill="#707070" class="colorizable-skin"/>

      <!-- LEG_L_FRONT (4x12) at (20,52) -->
      <rect x="20" y="52" width="4" height="12" fill="#808080" class="colorizable-skin"/>
      <!-- Definición de pantorrilla -->
      <rect x="21" y="60" width="2" height="3" fill="#707070" class="colorizable-skin" opacity="0.3"/>

      <!-- LEG_L_LEFT (4x12) at (24,52) -->
      <rect x="24" y="52" width="4" height="12" fill="#707070" class="colorizable-skin"/>

      <!-- LEG_L_BACK (4x12) at (28,52) -->
      <rect x="28" y="52" width="4" height="12" fill="#606060" class="colorizable-skin"/>
    </svg>
  `;
}

// ============================================================================
// BIBLIOTECA DE SPRITES - ROPA
// ============================================================================

/**
 * Genera sprite de camisa - Tipo 1: Camisa básica
 * Incluye todas las caras (frente, atrás, lados)
 */
export function generateShirt_01(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- BODY RIGHT (4x12) at (16,20) -->
      <rect x="16" y="20" width="4" height="12" fill="#707070" class="colorizable-clothing"/>

      <!-- BODY FRONT (8x12) at (20,20) -->
      <rect x="20" y="20" width="8" height="12" fill="#808080" class="colorizable-clothing"/>
      <!-- Cuello -->
      <rect x="23" y="20" width="2" height="1" fill="#606060" class="colorizable-clothing"/>
      <!-- Botones -->
      <rect x="23" y="22" width="2" height="1" fill="#404040"/>
      <rect x="23" y="25" width="2" height="1" fill="#404040"/>
      <rect x="23" y="28" width="2" height="1" fill="#404040"/>

      <!-- BODY LEFT (4x12) at (28,20) -->
      <rect x="28" y="20" width="4" height="12" fill="#707070" class="colorizable-clothing"/>

      <!-- BODY BACK (8x12) at (32,20) -->
      <rect x="32" y="20" width="8" height="12" fill="#606060" class="colorizable-clothing"/>

      <!-- MANGAS BRAZO DERECHO (todas las caras) -->
      <!-- ARM_R_TOP (4x4) at (44,16) -->
      <rect x="44" y="16" width="4" height="4" fill="#808080" class="colorizable-clothing"/>

      <!-- ARM_R_BOTTOM (4x4) at (48,16) -->
      <rect x="48" y="16" width="4" height="4" fill="#606060" class="colorizable-clothing"/>

      <!-- ARM_R_RIGHT (4x12) at (40,20) -->
      <rect x="40" y="20" width="4" height="12" fill="#707070" class="colorizable-clothing"/>

      <!-- ARM_R_FRONT (4x12) at (44,20) -->
      <rect x="44" y="20" width="4" height="12" fill="#808080" class="colorizable-clothing"/>

      <!-- ARM_R_LEFT (4x12) at (48,20) -->
      <rect x="48" y="20" width="4" height="12" fill="#707070" class="colorizable-clothing"/>

      <!-- ARM_R_BACK (4x12) at (52,20) -->
      <rect x="52" y="20" width="4" height="12" fill="#606060" class="colorizable-clothing"/>

      <!-- MANGAS BRAZO IZQUIERDO (todas las caras) -->
      <!-- ARM_L_TOP (4x4) at (36,48) -->
      <rect x="36" y="48" width="4" height="4" fill="#808080" class="colorizable-clothing"/>

      <!-- ARM_L_BOTTOM (4x4) at (40,48) -->
      <rect x="40" y="48" width="4" height="4" fill="#606060" class="colorizable-clothing"/>

      <!-- ARM_L_RIGHT (4x12) at (32,52) -->
      <rect x="32" y="52" width="4" height="12" fill="#707070" class="colorizable-clothing"/>

      <!-- ARM_L_FRONT (4x12) at (36,52) -->
      <rect x="36" y="52" width="4" height="12" fill="#808080" class="colorizable-clothing"/>

      <!-- ARM_L_LEFT (4x12) at (40,52) -->
      <rect x="40" y="52" width="4" height="12" fill="#707070" class="colorizable-clothing"/>

      <!-- ARM_L_BACK (4x12) at (44,52) -->
      <rect x="44" y="52" width="4" height="12" fill="#606060" class="colorizable-clothing"/>
    </svg>
  `;
}

/**
 * Genera sprite de pantalón - Tipo 1: Pantalón básico
 * Incluye todas las caras (frente, atrás, lados)
 */
export function generatePants_01(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- LEG RIGHT (todas las caras) -->
      <!-- LEG_R_RIGHT (4x12) at (0,20) -->
      <rect x="0" y="20" width="4" height="12" fill="#505050" class="colorizable-clothing"/>

      <!-- LEG_R_FRONT (4x12) at (4,20) -->
      <rect x="4" y="20" width="4" height="12" fill="#606060" class="colorizable-clothing"/>
      <!-- Costura -->
      <rect x="5" y="20" width="2" height="12" fill="#505050" class="colorizable-clothing" opacity="0.7"/>

      <!-- LEG_R_LEFT (4x12) at (8,20) -->
      <rect x="8" y="20" width="4" height="12" fill="#505050" class="colorizable-clothing"/>

      <!-- LEG_R_BACK (4x12) at (12,20) -->
      <rect x="12" y="20" width="4" height="12" fill="#404040" class="colorizable-clothing"/>

      <!-- LEG LEFT (todas las caras) -->
      <!-- LEG_L_RIGHT (4x12) at (16,52) -->
      <rect x="16" y="52" width="4" height="12" fill="#505050" class="colorizable-clothing"/>

      <!-- LEG_L_FRONT (4x12) at (20,52) -->
      <rect x="20" y="52" width="4" height="12" fill="#606060" class="colorizable-clothing"/>
      <!-- Costura -->
      <rect x="21" y="52" width="2" height="12" fill="#505050" class="colorizable-clothing" opacity="0.7"/>

      <!-- LEG_L_LEFT (4x12) at (24,52) -->
      <rect x="24" y="52" width="4" height="12" fill="#505050" class="colorizable-clothing"/>

      <!-- LEG_L_BACK (4x12) at (28,52) -->
      <rect x="28" y="52" width="4" height="12" fill="#404040" class="colorizable-clothing"/>
    </svg>
  `;
}

/**
 * Genera sprite de chaqueta - Tipo 1: Chaqueta abierta
 * Incluye todas las caras (frente, atrás, lados)
 */
export function generateJacket_01(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- BODY FRONT (8x12) at (20,20) -->
      <!-- Solapa izquierda -->
      <rect x="20" y="20" width="3" height="12" fill="#707070" class="colorizable-clothing"/>
      <!-- Solapa derecha -->
      <rect x="25" y="20" width="3" height="12" fill="#707070" class="colorizable-clothing"/>
      <!-- Cuello -->
      <rect x="21" y="20" width="6" height="1" fill="#606060" class="colorizable-clothing"/>
      <!-- Botones/cremallera -->
      <rect x="23" y="21" width="2" height="1" fill="#303030"/>
      <rect x="23" y="23" width="2" height="1" fill="#303030"/>
      <rect x="23" y="25" width="2" height="1" fill="#303030"/>
      <!-- Bolsillos -->
      <rect x="21" y="27" width="2" height="2" fill="#505050" opacity="0.7"/>
      <rect x="25" y="27" width="2" height="2" fill="#505050" opacity="0.7"/>

      <!-- BODY BACK (8x12) at (32,20) -->
      <rect x="32" y="20" width="8" height="12" fill="#606060" class="colorizable-clothing"/>

      <!-- MANGAS BRAZO DERECHO (todas las caras) -->
      <!-- ARM_R_TOP (4x4) at (44,16) -->
      <rect x="44" y="16" width="4" height="4" fill="#707070" class="colorizable-clothing"/>

      <!-- ARM_R_BOTTOM (4x4) at (48,16) -->
      <rect x="48" y="16" width="4" height="4" fill="#505050" class="colorizable-clothing"/>

      <!-- ARM_R_RIGHT (4x12) at (40,20) -->
      <rect x="40" y="20" width="4" height="12" fill="#606060" class="colorizable-clothing"/>

      <!-- ARM_R_FRONT (4x12) at (44,20) -->
      <rect x="44" y="20" width="4" height="12" fill="#707070" class="colorizable-clothing"/>

      <!-- ARM_R_LEFT (4x12) at (48,20) -->
      <rect x="48" y="20" width="4" height="12" fill="#606060" class="colorizable-clothing"/>

      <!-- ARM_R_BACK (4x12) at (52,20) -->
      <rect x="52" y="20" width="4" height="12" fill="#505050" class="colorizable-clothing"/>

      <!-- MANGAS BRAZO IZQUIERDO (todas las caras) -->
      <!-- ARM_L_TOP (4x4) at (36,48) -->
      <rect x="36" y="48" width="4" height="4" fill="#707070" class="colorizable-clothing"/>

      <!-- ARM_L_BOTTOM (4x4) at (40,48) -->
      <rect x="40" y="48" width="4" height="4" fill="#505050" class="colorizable-clothing"/>

      <!-- ARM_L_RIGHT (4x12) at (32,52) -->
      <rect x="32" y="52" width="4" height="12" fill="#606060" class="colorizable-clothing"/>

      <!-- ARM_L_FRONT (4x12) at (36,52) -->
      <rect x="36" y="52" width="4" height="12" fill="#707070" class="colorizable-clothing"/>

      <!-- ARM_L_LEFT (4x12) at (40,52) -->
      <rect x="40" y="52" width="4" height="12" fill="#606060" class="colorizable-clothing"/>

      <!-- ARM_L_BACK (4x12) at (44,52) -->
      <rect x="44" y="52" width="4" height="12" fill="#505050" class="colorizable-clothing"/>
    </svg>
  `;
}

// ============================================================================
// BIBLIOTECA DE SPRITES - ACCESORIOS
// ============================================================================

/**
 * Genera sprite de lentes - Tipo 1: Lentes redondos
 */
export function generateGlasses_01(): string {
  return `
    <svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">
      <!-- Marco izquierdo -->
      <rect x="1" y="3" width="2" height="2" fill="none" stroke="#303030" stroke-width="1"/>
      <!-- Marco derecho -->
      <rect x="5" y="3" width="2" height="2" fill="none" stroke="#303030" stroke-width="1"/>
      <!-- Puente -->
      <rect x="3" y="3" width="2" height="1" fill="#303030"/>
      <!-- Brillo en lentes -->
      <rect x="1" y="3" width="1" height="1" fill="#FFFFFF" opacity="0.5"/>
      <rect x="5" y="3" width="1" height="1" fill="#FFFFFF" opacity="0.5"/>
    </svg>
  `;
}

/**
 * Genera sprite de sombrero - Tipo 1: Gorra con visera
 */
export function generateHat_01(): string {
  return `
    <svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">
      <!-- Parte superior de la gorra -->
      <rect x="1" y="0" width="6" height="2" fill="#707070" class="colorizable-clothing"/>
      <!-- Visera -->
      <rect x="0" y="2" width="8" height="1" fill="#505050" class="colorizable-clothing"/>
      <!-- Sombra de visera -->
      <rect x="0" y="3" width="8" height="1" fill="#303030" opacity="0.3"/>
    </svg>
  `;
}

// ============================================================================
// GENERADOR Y EXPORTADOR
// ============================================================================

/**
 * Información de un componente para generar
 */
interface ComponentInfo {
  id: string;
  category: ComponentCategory;
  generator: () => string;
  filename: string;
}

/**
 * Catálogo completo de componentes a generar
 */
export const COMPONENT_CATALOG: ComponentInfo[] = [
  // CABEZA BASE (piel)
  { id: 'head_base_01', category: 'head_base' as ComponentCategory, generator: generateHead_Base_01, filename: 'head_base_01.svg' },

  // OJOS
  { id: 'eyes_01', category: ComponentCategory.EYES, generator: generateEyes_01, filename: 'eyes_01.svg' },
  { id: 'eyes_02', category: ComponentCategory.EYES, generator: generateEyes_02, filename: 'eyes_02.svg' },
  { id: 'eyes_03', category: ComponentCategory.EYES, generator: generateEyes_03, filename: 'eyes_03.svg' },

  // BOCAS
  { id: 'mouth_01', category: ComponentCategory.MOUTH, generator: generateMouth_01, filename: 'mouth_01.svg' },
  { id: 'mouth_02', category: ComponentCategory.MOUTH, generator: generateMouth_02, filename: 'mouth_02.svg' },
  { id: 'mouth_03', category: ComponentCategory.MOUTH, generator: generateMouth_03, filename: 'mouth_03.svg' },

  // PELO
  { id: 'hair_front_01', category: ComponentCategory.HAIR_FRONT, generator: generateHairFront_01, filename: 'hair_front_01.svg' },
  { id: 'hair_front_02', category: ComponentCategory.HAIR_FRONT, generator: generateHairFront_02, filename: 'hair_front_02.svg' },
  { id: 'hair_top_01', category: ComponentCategory.HAIR_TOP, generator: generateHairTop_01, filename: 'hair_top_01.svg' },
  { id: 'hair_back_01', category: ComponentCategory.HAIR_BACK, generator: generateHairBack_01, filename: 'hair_back_01.svg' },

  // CUERPO BASE
  { id: 'torso_slim_01', category: ComponentCategory.TORSO_BASE, generator: generateTorso_Slim_01, filename: 'torso_slim_01.svg' },
  { id: 'torso_athletic_01', category: ComponentCategory.TORSO_BASE, generator: generateTorso_Athletic_01, filename: 'torso_athletic_01.svg' },
  { id: 'torso_average_01', category: ComponentCategory.TORSO_BASE, generator: generateTorso_Average_01, filename: 'torso_average_01.svg' },
  { id: 'arms_slim_01', category: ComponentCategory.ARMS_BASE, generator: generateArms_Slim_01, filename: 'arms_slim_01.svg' },
  { id: 'arms_classic_01', category: ComponentCategory.ARMS_BASE, generator: generateArms_Classic_01, filename: 'arms_classic_01.svg' },
  { id: 'legs_average_01', category: ComponentCategory.LEGS_BASE, generator: generateLegs_Average_01, filename: 'legs_average_01.svg' },
  { id: 'legs_long_01', category: ComponentCategory.LEGS_BASE, generator: generateLegs_Long_01, filename: 'legs_long_01.svg' },

  // ROPA
  { id: 'shirt_01', category: ComponentCategory.SHIRT, generator: generateShirt_01, filename: 'shirt_01.svg' },
  { id: 'pants_01', category: ComponentCategory.PANTS, generator: generatePants_01, filename: 'pants_01.svg' },
  { id: 'jacket_01', category: ComponentCategory.JACKET, generator: generateJacket_01, filename: 'jacket_01.svg' },

  // ACCESORIOS
  { id: 'glasses_01', category: ComponentCategory.GLASSES, generator: generateGlasses_01, filename: 'glasses_01.svg' },
  { id: 'hat_01', category: ComponentCategory.HAT, generator: generateHat_01, filename: 'hat_01.svg' },
];

/**
 * Genera todos los componentes y los guarda en disco
 */
export async function generateAllComponents(outputDir: string): Promise<void> {
  console.log(`[Component Generator] Generando ${COMPONENT_CATALOG.length} componentes...`);

  for (const component of COMPONENT_CATALOG) {
    const categoryDir = path.join(outputDir, component.category);
    await fs.mkdir(categoryDir, { recursive: true });

    const svgContent = component.generator();
    const svgPath = path.join(categoryDir, component.filename);
    const pngPath = svgPath.replace('.svg', '.png');

    // Guardar SVG
    await fs.writeFile(svgPath, svgContent);

    // Convertir a PNG con Sharp
    await sharp(Buffer.from(svgContent))
      .png()
      .toFile(pngPath);

    console.log(`  ✓ ${component.id} → ${pngPath}`);
  }

  console.log('[Component Generator] ¡Generación completada!');
}
