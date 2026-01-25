/**
 * Biblioteca Completa de Peinados para Sistema Modular de Minecraft Skins
 *
 * IMPORTANTE: Este archivo contiene SOLO funciones de peinados realistas
 * basados en referencias de peinados reales y comunes.
 *
 * Categorías:
 * - Peinados Cortos (8 variaciones)
 * - Peinados Medios (8 variaciones)
 * - Peinados Largos (7 variaciones × 2 componentes cada uno = 14 funciones)
 * - Peinados Recogidos (14 variaciones)
 *
 * Total: 44 funciones
 */

// ============================================================================
// PEINADOS CORTOS (SHORT HAIR) - 8 variaciones
// ============================================================================

/**
 * Genera sprite de pelo corto - Tipo 4: Crew Cut
 * Estilo: Corto arriba con pequeña pompa al frente, lados muy cortos degradados
 * Género: Masculino
 * Inspiración: Militar clásico, deportistas, George Clooney
 */
export function generateHairShort_04_CrewCut(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- HAT_TOP (8x8) at (40,0) - Vista superior con volumen frontal -->
      <rect x="40" y="0" width="8" height="8" fill="#808080" class="colorizable-hair"/>
      <!-- Volumen frontal (pompa) -->
      <rect x="41" y="0" width="6" height="3" fill="#909090" class="colorizable-hair"/>
      <rect x="42" y="1" width="4" height="1" fill="#959595" class="colorizable-hair"/>
      <!-- Transición hacia atrás -->
      <rect x="43" y="4" width="2" height="3" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_BOTTOM (8x8) at (48,0) - Vista inferior (vacío) -->

      <!-- HAT_RIGHT (8x8) at (32,8) - Lado derecho con degradado -->
      <!-- Parte superior con volumen -->
      <rect x="32" y="8" width="8" height="2" fill="#808080" class="colorizable-hair"/>
      <rect x="33" y="10" width="6" height="1" fill="#707070" class="colorizable-hair"/>
      <!-- Degradado hacia abajo -->
      <rect x="34" y="11" width="4" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="35" y="12" width="2" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Frente con pompa -->
      <rect x="40" y="8" width="8" height="2" fill="#909090" class="colorizable-hair"/>
      <!-- Pompa pronunciada -->
      <rect x="41" y="10" width="6" height="1" fill="#959595" class="colorizable-hair"/>
      <rect x="42" y="11" width="4" height="1" fill="#808080" class="colorizable-hair"/>
      <!-- Línea de transición -->
      <rect x="43" y="12" width="2" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Lado izquierdo con degradado -->
      <!-- Parte superior con volumen -->
      <rect x="48" y="8" width="8" height="2" fill="#808080" class="colorizable-hair"/>
      <rect x="49" y="10" width="6" height="1" fill="#707070" class="colorizable-hair"/>
      <!-- Degradado hacia abajo -->
      <rect x="50" y="11" width="4" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="51" y="12" width="2" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Parte trasera corta -->
      <rect x="56" y="8" width="8" height="3" fill="#808080" class="colorizable-hair"/>
      <rect x="57" y="11" width="6" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="58" y="12" width="4" height="1" fill="#606060" class="colorizable-hair"/>
    </svg>
  `;
}

/**
 * Genera sprite de pelo corto - Tipo 5: Caesar Cut
 * Estilo: Flequillo corto horizontal, pelo en capas 2-5cm uniforme
 * Género: Masculino
 * Inspiración: Emperador romano Augusto, George Clooney, Ryan Gosling
 */
export function generateHairShort_05_CaesarCut(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- HAT_TOP (8x8) at (40,0) - Vista superior uniforme -->
      <rect x="40" y="0" width="8" height="8" fill="#808080" class="colorizable-hair"/>
      <rect x="41" y="0" width="6" height="2" fill="#909090" class="colorizable-hair"/>
      <!-- Textura de capas -->
      <rect x="40" y="2" width="8" height="1" fill="#909090" class="colorizable-hair"/>
      <rect x="41" y="4" width="6" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_BOTTOM (8x8) at (48,0) - Vista inferior (vacío) -->

      <!-- HAT_RIGHT (8x8) at (32,8) - Lado derecho uniforme -->
      <rect x="32" y="8" width="8" height="4" fill="#808080" class="colorizable-hair"/>
      <!-- Capas -->
      <rect x="33" y="12" width="6" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="34" y="13" width="4" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Frente con flequillo horizontal -->
      <rect x="40" y="8" width="8" height="3" fill="#808080" class="colorizable-hair"/>
      <!-- Flequillo horizontal recto -->
      <rect x="40" y="11" width="8" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="41" y="12" width="6" height="1" fill="#707070" class="colorizable-hair"/>
      <!-- Línea del flequillo -->
      <rect x="40" y="13" width="8" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Lado izquierdo uniforme -->
      <rect x="48" y="8" width="8" height="4" fill="#808080" class="colorizable-hair"/>
      <!-- Capas -->
      <rect x="49" y="12" width="6" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="50" y="13" width="4" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Parte trasera uniforme -->
      <rect x="56" y="8" width="8" height="4" fill="#808080" class="colorizable-hair"/>
      <rect x="57" y="12" width="6" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="58" y="13" width="4" height="1" fill="#606060" class="colorizable-hair"/>
    </svg>
  `;
}

/**
 * Genera sprite de pelo corto - Tipo 6: Undercut Corto
 * Estilo: Lados muy cortos o rapados, volumen significativo en la parte superior
 * Género: Unisex
 * Inspiración: Miley Cyrus, Brad Pitt (Fury), Zayn Malik
 */
export function generateHairShort_06_Undercut(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- HAT_TOP (8x8) at (40,0) - Vista superior con mucho volumen arriba -->
      <rect x="40" y="0" width="8" height="8" fill="#808080" class="colorizable-hair"/>
      <!-- Volumen pronunciado -->
      <rect x="41" y="0" width="6" height="2" fill="#909090" class="colorizable-hair"/>
      <rect x="42" y="1" width="4" height="2" fill="#959595" class="colorizable-hair"/>
      <!-- Centro con altura -->
      <rect x="43" y="2" width="2" height="4" fill="#959595" class="colorizable-hair"/>

      <!-- HAT_BOTTOM (8x8) at (48,0) - Vista inferior (vacío) -->

      <!-- HAT_RIGHT (8x8) at (32,8) - Lado derecho con contraste marcado -->
      <!-- Parte superior con volumen -->
      <rect x="32" y="8" width="8" height="2" fill="#909090" class="colorizable-hair"/>
      <rect x="33" y="10" width="5" height="1" fill="#808080" class="colorizable-hair"/>
      <!-- Transición abrupta (undercut) -->
      <rect x="34" y="11" width="2" height="1" fill="#707070" class="colorizable-hair"/>
      <!-- Lados rapados -->
      <rect x="35" y="12" width="1" height="2" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Frente con volumen alto -->
      <rect x="40" y="8" width="8" height="2" fill="#909090" class="colorizable-hair"/>
      <!-- Volumen frontal pronunciado -->
      <rect x="41" y="10" width="6" height="1" fill="#959595" class="colorizable-hair"/>
      <rect x="42" y="11" width="4" height="1" fill="#909090" class="colorizable-hair"/>
      <rect x="43" y="12" width="2" height="1" fill="#808080" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Lado izquierdo con contraste marcado -->
      <!-- Parte superior con volumen -->
      <rect x="48" y="8" width="8" height="2" fill="#909090" class="colorizable-hair"/>
      <rect x="50" y="10" width="5" height="1" fill="#808080" class="colorizable-hair"/>
      <!-- Transición abrupta (undercut) -->
      <rect x="52" y="11" width="2" height="1" fill="#707070" class="colorizable-hair"/>
      <!-- Lados rapados -->
      <rect x="52" y="12" width="1" height="2" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Parte trasera con volumen arriba -->
      <rect x="56" y="8" width="8" height="3" fill="#909090" class="colorizable-hair"/>
      <rect x="57" y="11" width="6" height="1" fill="#808080" class="colorizable-hair"/>
      <rect x="59" y="12" width="2" height="1" fill="#606060" class="colorizable-hair"/>
    </svg>
  `;
}

/**
 * Genera sprite de pelo corto - Tipo 7: Bowl Cut (Corte Hongo)
 * Estilo: Corte circular uniforme alrededor de la cabeza, tipo hongo
 * Género: Unisex
 * Inspiración: Los Beatles años 60, Moe (The Three Stooges)
 */
export function generateHairShort_07_BowlCut(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- HAT_TOP (8x8) at (40,0) - Vista superior circular -->
      <rect x="40" y="0" width="8" height="8" fill="#808080" class="colorizable-hair"/>
      <!-- Forma circular en la parte superior -->
      <rect x="41" y="0" width="6" height="8" fill="#909090" class="colorizable-hair"/>
      <rect x="42" y="1" width="4" height="6" fill="#959595" class="colorizable-hair"/>
      <!-- Centro -->
      <rect x="43" y="2" width="2" height="4" fill="#808080" class="colorizable-hair"/>

      <!-- HAT_BOTTOM (8x8) at (48,0) - Vista inferior (vacío) -->

      <!-- HAT_RIGHT (8x8) at (32,8) - Lado derecho con corte circular -->
      <!-- Cobertura superior -->
      <rect x="32" y="8" width="8" height="4" fill="#808080" class="colorizable-hair"/>
      <rect x="33" y="10" width="6" height="2" fill="#909090" class="colorizable-hair"/>
      <!-- Línea de corte circular -->
      <rect x="32" y="12" width="7" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="33" y="13" width="6" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="34" y="14" width="4" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Frente con flequillo circular -->
      <rect x="40" y="8" width="8" height="4" fill="#808080" class="colorizable-hair"/>
      <rect x="41" y="10" width="6" height="2" fill="#909090" class="colorizable-hair"/>
      <!-- Flequillo recto circular -->
      <rect x="40" y="12" width="8" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="41" y="13" width="6" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="42" y="14" width="4" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Lado izquierdo con corte circular -->
      <!-- Cobertura superior -->
      <rect x="48" y="8" width="8" height="4" fill="#808080" class="colorizable-hair"/>
      <rect x="49" y="10" width="6" height="2" fill="#909090" class="colorizable-hair"/>
      <!-- Línea de corte circular -->
      <rect x="49" y="12" width="7" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="49" y="13" width="6" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="50" y="14" width="4" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Parte trasera con línea circular -->
      <rect x="56" y="8" width="8" height="4" fill="#808080" class="colorizable-hair"/>
      <rect x="57" y="10" width="6" height="2" fill="#909090" class="colorizable-hair"/>
      <!-- Línea de corte -->
      <rect x="57" y="12" width="6" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="58" y="13" width="4" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="59" y="14" width="2" height="1" fill="#606060" class="colorizable-hair"/>
    </svg>
  `;
}

/**
 * Genera sprite de pelo corto - Tipo 8: Slicked Back Corto
 * Estilo: Peinado hacia atrás con gel/pomada, corto en lados
 * Género: Masculino
 * Inspiración: David Beckham, Don Draper (Mad Men)
 */
export function generateHairShort_08_SlickedBack(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- HAT_TOP (8x8) at (40,0) - Vista superior con dirección hacia atrás -->
      <rect x="40" y="0" width="8" height="8" fill="#808080" class="colorizable-hair"/>
      <!-- Líneas de dirección hacia atrás -->
      <rect x="41" y="1" width="6" height="1" fill="#909090" class="colorizable-hair"/>
      <rect x="42" y="3" width="4" height="1" fill="#909090" class="colorizable-hair"/>
      <rect x="43" y="5" width="2" height="2" fill="#909090" class="colorizable-hair"/>
      <!-- Brillo del gel -->
      <rect x="42" y="2" width="2" height="1" fill="#959595" class="colorizable-hair"/>
      <rect x="44" y="4" width="1" height="1" fill="#959595" class="colorizable-hair"/>

      <!-- HAT_BOTTOM (8x8) at (48,0) - Vista inferior (vacío) -->

      <!-- HAT_RIGHT (8x8) at (32,8) - Lado derecho corto con transición -->
      <!-- Parte superior -->
      <rect x="32" y="8" width="8" height="2" fill="#808080" class="colorizable-hair"/>
      <rect x="33" y="10" width="5" height="1" fill="#707070" class="colorizable-hair"/>
      <!-- Lados cortos -->
      <rect x="34" y="11" width="3" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="35" y="12" width="1" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Frente peinado hacia atrás -->
      <rect x="40" y="8" width="8" height="2" fill="#909090" class="colorizable-hair"/>
      <!-- Líneas de dirección -->
      <rect x="41" y="10" width="6" height="1" fill="#808080" class="colorizable-hair"/>
      <rect x="42" y="11" width="4" height="1" fill="#707070" class="colorizable-hair"/>
      <!-- Brillo -->
      <rect x="43" y="9" width="2" height="1" fill="#959595" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Lado izquierdo corto con transición -->
      <!-- Parte superior -->
      <rect x="48" y="8" width="8" height="2" fill="#808080" class="colorizable-hair"/>
      <rect x="50" y="10" width="5" height="1" fill="#707070" class="colorizable-hair"/>
      <!-- Lados cortos -->
      <rect x="51" y="11" width="3" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="52" y="12" width="1" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Parte trasera peinada -->
      <rect x="56" y="8" width="8" height="4" fill="#808080" class="colorizable-hair"/>
      <!-- Líneas de dirección -->
      <rect x="57" y="11" width="6" height="1" fill="#909090" class="colorizable-hair"/>
      <rect x="58" y="12" width="4" height="1" fill="#707070" class="colorizable-hair"/>
      <!-- Brillo -->
      <rect x="59" y="10" width="2" height="1" fill="#959595" class="colorizable-hair"/>
    </svg>
  `;
}

// ============================================================================
// PEINADOS MEDIOS (MEDIUM HAIR) - Selección representativa
// ============================================================================

/**
 * Genera sprite de pelo medio - Tipo 1: Lob (Long Bob)
 * Estilo: Bob largo hasta los hombros, línea recta, flequillo lateral
 * Género: Femenino/Unisex
 * Inspiración: Heidi Klum, Jessica Alba
 */
export function generateHairMedium_01_Lob(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- HAT_TOP (8x8) at (40,0) - Vista superior con volumen -->
      <rect x="40" y="0" width="8" height="8" fill="#808080" class="colorizable-hair"/>
      <rect x="41" y="0" width="6" height="1" fill="#909090" class="colorizable-hair"/>
      <!-- Raya lateral -->
      <rect x="42" y="1" width="1" height="6" fill="#707070" class="colorizable-hair" opacity="0.4"/>

      <!-- HAT_BOTTOM (8x8) at (48,0) - Vista inferior (vacío por transparencia) -->

      <!-- HAT_RIGHT (8x8) at (32,8) - Lado derecho con pelo hasta hombros -->
      <!-- Base superior -->
      <rect x="32" y="8" width="8" height="2" fill="#808080" class="colorizable-hair"/>
      <!-- Transición media -->
      <rect x="32" y="10" width="7" height="2" fill="#808080" class="colorizable-hair"/>
      <!-- Mechones bajando -->
      <rect x="32" y="12" width="6" height="2" fill="#707070" class="colorizable-hair"/>
      <!-- Puntas (salen un poco del HAT layer hacia abajo) -->
      <rect x="32" y="14" width="4" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="33" y="15" width="2" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Frente con flequillo lateral -->
      <rect x="40" y="8" width="8" height="2" fill="#808080" class="colorizable-hair"/>
      <!-- Flequillo lateral (más largo de un lado) -->
      <rect x="40" y="10" width="3" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="40" y="12" width="2" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="40" y="13" width="1" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Lado izquierdo con pelo hasta hombros -->
      <!-- Base superior -->
      <rect x="48" y="8" width="8" height="2" fill="#808080" class="colorizable-hair"/>
      <!-- Transición media -->
      <rect x="49" y="10" width="7" height="2" fill="#808080" class="colorizable-hair"/>
      <!-- Mechones bajando -->
      <rect x="50" y="12" width="6" height="2" fill="#707070" class="colorizable-hair"/>
      <!-- Puntas -->
      <rect x="52" y="14" width="4" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="53" y="15" width="2" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Parte trasera recta -->
      <rect x="56" y="8" width="8" height="3" fill="#808080" class="colorizable-hair"/>
      <rect x="56" y="11" width="8" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="57" y="13" width="6" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="58" y="14" width="4" height="1" fill="#606060" class="colorizable-hair"/>
    </svg>
  `;
}

/**
 * Genera sprite de pelo medio - Tipo 3: Shag Medio
 * Estilo: Capas múltiples "feathered", volumen arriba, textura despeinada
 * Género: Unisex
 * Inspiración: Jane Fonda en Klute, Jennifer Aniston "The Rachel"
 */
export function generateHairMedium_03_Shag(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- HAT_TOP (8x8) at (40,0) - Vista superior con mucho volumen -->
      <rect x="40" y="0" width="8" height="8" fill="#808080" class="colorizable-hair"/>
      <rect x="40" y="0" width="8" height="2" fill="#909090" class="colorizable-hair"/>
      <!-- Textura despeinada -->
      <rect x="41" y="2" width="2" height="1" fill="#909090" class="colorizable-hair"/>
      <rect x="45" y="2" width="2" height="1" fill="#909090" class="colorizable-hair"/>
      <rect x="42" y="4" width="4" height="1" fill="#707070" class="colorizable-hair" opacity="0.3"/>

      <!-- HAT_BOTTOM (8x8) at (48,0) - Vista inferior (vacío) -->

      <!-- HAT_RIGHT (8x8) at (32,8) - Lado derecho con capas -->
      <!-- Base superior con volumen -->
      <rect x="32" y="8" width="8" height="2" fill="#909090" class="colorizable-hair"/>
      <!-- Capas medias -->
      <rect x="32" y="10" width="7" height="1" fill="#808080" class="colorizable-hair"/>
      <rect x="32" y="11" width="6" height="1" fill="#808080" class="colorizable-hair"/>
      <!-- Mechones irregulares (feathered) -->
      <rect x="32" y="12" width="5" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="32" y="13" width="3" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="33" y="14" width="2" height="1" fill="#606060" class="colorizable-hair"/>
      <!-- Puntas separadas -->
      <rect x="32" y="14" width="1" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Frente con flequillo despeinado -->
      <rect x="40" y="8" width="8" height="2" fill="#909090" class="colorizable-hair"/>
      <!-- Mechones irregulares -->
      <rect x="41" y="10" width="2" height="2" fill="#808080" class="colorizable-hair"/>
      <rect x="45" y="10" width="2" height="2" fill="#808080" class="colorizable-hair"/>
      <rect x="42" y="12" width="1" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="45" y="12" width="1" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Lado izquierdo con capas -->
      <!-- Base superior con volumen -->
      <rect x="48" y="8" width="8" height="2" fill="#909090" class="colorizable-hair"/>
      <!-- Capas medias -->
      <rect x="49" y="10" width="7" height="1" fill="#808080" class="colorizable-hair"/>
      <rect x="50" y="11" width="6" height="1" fill="#808080" class="colorizable-hair"/>
      <!-- Mechones irregulares -->
      <rect x="51" y="12" width="5" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="53" y="13" width="3" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="53" y="14" width="2" height="1" fill="#606060" class="colorizable-hair"/>
      <!-- Puntas separadas -->
      <rect x="55" y="14" width="1" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Parte trasera con capas -->
      <rect x="56" y="8" width="8" height="3" fill="#909090" class="colorizable-hair"/>
      <rect x="56" y="11" width="8" height="2" fill="#808080" class="colorizable-hair"/>
      <!-- Capas visibles -->
      <rect x="57" y="13" width="3" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="60" y="13" width="3" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="58" y="14" width="2" height="1" fill="#606060" class="colorizable-hair"/>
    </svg>
  `;
}

// ============================================================================
// PEINADOS LARGOS (LONG HAIR) - Selección representativa
// Cada estilo tiene 2 funciones: HEAD (cabeza) + BODY (caída en espalda)
// ============================================================================

/**
 * Genera sprite de pelo largo (cabeza) - Tipo 1: Straight Long Hair (Lacio)
 * Pelo lacio que cae recto desde la coronilla hasta los hombros
 */
export function generateHairLong_01(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- HAT_TOP (8x8) at (40,0) - Vista superior con raya al medio -->
      <rect x="40" y="0" width="8" height="8" fill="#808080" class="colorizable-hair"/>
      <!-- Raya central -->
      <rect x="43" y="0" width="2" height="8" fill="#707070" class="colorizable-hair"/>
      <!-- Volumen lateral -->
      <rect x="40" y="1" width="3" height="6" fill="#909090" class="colorizable-hair"/>
      <rect x="45" y="1" width="3" height="6" fill="#909090" class="colorizable-hair"/>

      <!-- HAT_BOTTOM (8x8) at (48,0) - Vista inferior (vacío, pelo cae) -->

      <!-- HAT_RIGHT (8x8) at (32,8) - Lado derecho con caída recta -->
      <rect x="32" y="8" width="8" height="8" fill="#808080" class="colorizable-hair"/>
      <!-- Sombra lateral -->
      <rect x="32" y="8" width="2" height="8" fill="#707070" class="colorizable-hair"/>
      <!-- Mechas de caída -->
      <rect x="34" y="10" width="4" height="5" fill="#909090" class="colorizable-hair"/>
      <rect x="35" y="14" width="3" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Frente con pelo liso hacia atrás -->
      <rect x="40" y="8" width="8" height="4" fill="#808080" class="colorizable-hair"/>
      <!-- Línea central suave -->
      <rect x="43" y="8" width="2" height="4" fill="#707070" class="colorizable-hair"/>
      <!-- Sombra inferior -->
      <rect x="41" y="11" width="6" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Lado izquierdo con caída recta -->
      <rect x="48" y="8" width="8" height="8" fill="#808080" class="colorizable-hair"/>
      <!-- Sombra lateral -->
      <rect x="54" y="8" width="2" height="8" fill="#707070" class="colorizable-hair"/>
      <!-- Mechas de caída -->
      <rect x="50" y="10" width="4" height="5" fill="#909090" class="colorizable-hair"/>
      <rect x="50" y="14" width="3" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Parte trasera con volumen -->
      <rect x="56" y="8" width="8" height="8" fill="#808080" class="colorizable-hair"/>
      <!-- Volumen central -->
      <rect x="58" y="8" width="4" height="6" fill="#909090" class="colorizable-hair"/>
      <!-- Transición hacia caída -->
      <rect x="57" y="13" width="6" height="2" fill="#707070" class="colorizable-hair"/>
    </svg>
  `;
}

/**
 * Genera sprite de pelo largo (cuerpo/caída) - Tipo 1: Straight Long Hair
 * Se combina con generateHairLong_01 para pelo completo
 */
export function generateHairLongBody_01(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- BODY_BACK (8x12) at (32,20) - Pelo cayendo en espalda (PRINCIPAL) - COBERTURA COMPLETA -->
      <rect x="32" y="20" width="8" height="12" fill="#808080" class="colorizable-hair"/>
      <!-- Sombra central -->
      <rect x="34" y="20" width="4" height="12" fill="#707070" class="colorizable-hair"/>
      <!-- Mechas laterales izquierdas -->
      <rect x="32" y="21" width="1" height="10" fill="#909090" class="colorizable-hair"/>
      <rect x="33" y="22" width="1" height="9" fill="#858585" class="colorizable-hair"/>
      <!-- Mechas laterales derechas -->
      <rect x="38" y="21" width="1" height="10" fill="#909090" class="colorizable-hair"/>
      <rect x="39" y="22" width="1" height="9" fill="#858585" class="colorizable-hair"/>
      <!-- Puntas centrales -->
      <rect x="35" y="30" width="2" height="2" fill="#606060" class="colorizable-hair"/>

      <!-- BODY_RIGHT (4x12) at (16,20) - Pelo cayendo lado derecho -->
      <rect x="16" y="20" width="4" height="8" fill="#808080" class="colorizable-hair"/>
      <rect x="17" y="20" width="2" height="8" fill="#909090" class="colorizable-hair"/>
      <!-- Mechas puntiagudas -->
      <rect x="17" y="27" width="2" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="18" y="28" width="1" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- BODY_LEFT (4x12) at (28,20) - Pelo cayendo lado izquierdo -->
      <rect x="28" y="20" width="4" height="8" fill="#808080" class="colorizable-hair"/>
      <rect x="29" y="20" width="2" height="8" fill="#909090" class="colorizable-hair"/>
      <!-- Mechas puntiagudas -->
      <rect x="29" y="27" width="2" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="29" y="28" width="1" height="1" fill="#606060" class="colorizable-hair"/>
    </svg>
  `;
}

/**
 * Genera sprite de pelo largo - Tipo 2: Wavy Long Hair RIZADO
 * Versión mejorada con pixel art profesional, shading realista y paleta específica
 * MANUAL EDIT: Basado en ajustes manuales del usuario
 */
export function generateHairLong_02(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">

      <!-- HEAD_TOP (8,0) - Desde backup del usuario -->
      <rect x="8" y="0" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="9" y="0" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="10" y="0" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="11" y="0" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="12" y="0" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="13" y="0" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="14" y="0" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="15" y="0" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="8" y="1" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="9" y="1" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="10" y="1" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="11" y="1" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="12" y="1" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="13" y="1" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="14" y="1" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="15" y="1" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="8" y="2" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="9" y="2" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="10" y="2" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="11" y="2" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="12" y="2" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="13" y="2" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="14" y="2" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="15" y="2" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="8" y="3" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="9" y="3" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="10" y="3" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="11" y="3" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="12" y="3" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="13" y="3" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="14" y="3" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="15" y="3" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="8" y="4" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="9" y="4" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="10" y="4" width="1" height="1" fill="#2e1515" class="colorizable-hair"/>
      <rect x="11" y="4" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="12" y="4" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="13" y="4" width="1" height="1" fill="#2e1515" class="colorizable-hair"/>
      <rect x="14" y="4" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="15" y="4" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="8" y="5" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="9" y="5" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="10" y="5" width="1" height="1" fill="#2e1515" class="colorizable-hair"/>
      <rect x="11" y="5" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="12" y="5" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="13" y="5" width="1" height="1" fill="#2e1515" class="colorizable-hair"/>
      <rect x="14" y="5" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="15" y="5" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="8" y="6" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="9" y="6" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="10" y="6" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="11" y="6" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="12" y="6" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="13" y="6" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="14" y="6" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="15" y="6" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="8" y="7" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="9" y="7" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="10" y="7" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="11" y="7" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="12" y="7" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="13" y="7" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="14" y="7" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="15" y="7" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>

      <!-- HAT_TOP (40,0) - Highlights editados por usuario -->
      <rect x="41" y="1" width="1" height="1" fill="#4f2323" class="colorizable-hair"/>
      <rect x="46" y="1" width="1" height="1" fill="#4f2323" class="colorizable-hair"/>
      <rect x="43" y="3" width="1" height="1" fill="#461f1f" class="colorizable-hair"/>

      <!-- HEAD_RIGHT (0,8) - Desde backup del usuario -->
      <rect x="0" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="1" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="2" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="3" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="4" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="5" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="6" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="7" y="8" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="0" y="9" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="1" y="9" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="2" y="9" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="3" y="9" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="4" y="9" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="5" y="9" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="6" y="9" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="7" y="9" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="0" y="10" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="1" y="10" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="2" y="10" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="3" y="10" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="4" y="10" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="5" y="10" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="6" y="10" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="7" y="10" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="0" y="11" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="1" y="11" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="2" y="11" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="3" y="11" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="4" y="11" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="5" y="11" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="6" y="11" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="7" y="11" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="0" y="12" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="1" y="12" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="2" y="12" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="3" y="12" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="4" y="12" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="5" y="12" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="6" y="12" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="7" y="12" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="0" y="13" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="1" y="13" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="2" y="13" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="3" y="13" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="4" y="13" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="5" y="13" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="6" y="13" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="7" y="13" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="0" y="14" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="1" y="14" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="2" y="14" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="3" y="14" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="4" y="14" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="5" y="14" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="6" y="14" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="7" y="14" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="0" y="15" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="1" y="15" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="2" y="15" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="3" y="15" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="4" y="15" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="5" y="15" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="6" y="15" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="7" y="15" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>

      <!-- HAT_RIGHT (32,8) - Highlights editados por usuario -->
      <rect x="33" y="9" width="1" height="1" fill="#522424" class="colorizable-hair"/>
      <rect x="35" y="10" width="1" height="1" fill="#4f2323" class="colorizable-hair"/>
      <rect x="34" y="12" width="1" height="1" fill="#4f2323" class="colorizable-hair"/>
      <rect x="36" y="14" width="1" height="1" fill="#3e1b1b" class="colorizable-hair"/>

      <!-- HEAD_FRONT (8,8) - Desde backup del usuario -->
      <rect x="8" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="9" y="8" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="10" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="11" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="12" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="13" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="14" y="8" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="15" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="8" y="9" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="9" y="9" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="10" y="9" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="11" y="9" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="12" y="9" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="13" y="9" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="14" y="9" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="15" y="9" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="8" y="10" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="9" y="10" width="1" height="1" fill="#ffffff" class="colorizable-hair"/>
      <rect x="10" y="10" width="1" height="1" fill="#ffffff" class="colorizable-hair"/>
      <rect x="11" y="10" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="12" y="10" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="13" y="10" width="1" height="1" fill="#ffffff" class="colorizable-hair"/>
      <rect x="14" y="10" width="1" height="1" fill="#ffffff" class="colorizable-hair"/>
      <rect x="15" y="10" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="8" y="11" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="9" y="11" width="1" height="1" fill="#ffffff" class="colorizable-hair"/>
      <rect x="10" y="11" width="1" height="1" fill="#1e7a1e" class="colorizable-hair"/>
      <rect x="11" y="11" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="12" y="11" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="13" y="11" width="1" height="1" fill="#1e7a1e" class="colorizable-hair"/>
      <rect x="14" y="11" width="1" height="1" fill="#ffffff" class="colorizable-hair"/>
      <rect x="15" y="11" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="8" y="12" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="9" y="12" width="1" height="1" fill="#ffffff" class="colorizable-hair"/>
      <rect x="10" y="12" width="1" height="1" fill="#1e7a1e" class="colorizable-hair"/>
      <rect x="11" y="12" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="12" y="12" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="13" y="12" width="1" height="1" fill="#1e7a1e" class="colorizable-hair"/>
      <rect x="14" y="12" width="1" height="1" fill="#ffffff" class="colorizable-hair"/>
      <rect x="15" y="12" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="8" y="13" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="9" y="13" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="10" y="13" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="11" y="13" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="12" y="13" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="13" y="13" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="14" y="13" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="15" y="13" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="8" y="14" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="9" y="14" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="10" y="14" width="1" height="1" fill="#303030" class="colorizable-hair"/>
      <rect x="11" y="14" width="1" height="1" fill="#303030" class="colorizable-hair"/>
      <rect x="12" y="14" width="1" height="1" fill="#303030" class="colorizable-hair"/>
      <rect x="13" y="14" width="1" height="1" fill="#303030" class="colorizable-hair"/>
      <rect x="14" y="14" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="15" y="14" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="8" y="15" width="1" height="1" fill="#2e1515" class="colorizable-hair"/>
      <rect x="9" y="15" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="10" y="15" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="11" y="15" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="12" y="15" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="13" y="15" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="14" y="15" width="1" height="1" fill="#80705f" class="colorizable-hair"/>
      <rect x="15" y="15" width="1" height="1" fill="#2e1515" class="colorizable-hair"/>

      <!-- HAT_FRONT (40,8) - Highlights editados por usuario -->
      <rect x="43" y="9" width="1" height="1" fill="#461f1f" class="colorizable-hair"/>
      <rect x="41" y="10" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="46" y="10" width="1" height="1" fill="#482020" class="colorizable-hair"/>

      <!-- HEAD_LEFT (16,8) - Desde backup del usuario -->
      <rect x="16" y="8" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="17" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="18" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="19" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="20" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="21" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="22" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="23" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="16" y="9" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="17" y="9" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="18" y="9" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="19" y="9" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="20" y="9" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="21" y="9" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="22" y="9" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="23" y="9" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="16" y="10" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="17" y="10" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="18" y="10" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="19" y="10" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="20" y="10" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="21" y="10" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="22" y="10" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="23" y="10" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="16" y="11" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="17" y="11" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="18" y="11" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="19" y="11" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="20" y="11" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="21" y="11" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="22" y="11" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="23" y="11" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="16" y="12" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="17" y="12" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="18" y="12" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="19" y="12" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="20" y="12" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="21" y="12" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="22" y="12" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="23" y="12" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="16" y="13" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="17" y="13" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="18" y="13" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="19" y="13" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="20" y="13" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="21" y="13" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="22" y="13" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="23" y="13" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="16" y="14" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="17" y="14" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="18" y="14" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="19" y="14" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="20" y="14" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="21" y="14" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="22" y="14" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="23" y="14" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="16" y="15" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="17" y="15" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="18" y="15" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="19" y="15" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="20" y="15" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="21" y="15" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="22" y="15" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="23" y="15" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>

      <!-- HAT_LEFT (48,8) - Highlights editados por usuario -->
      <rect x="52" y="9" width="1" height="1" fill="#522424" class="colorizable-hair"/>
      <rect x="50" y="10" width="1" height="1" fill="#4f2323" class="colorizable-hair"/>
      <rect x="51" y="12" width="1" height="1" fill="#4f2323" class="colorizable-hair"/>
      <rect x="53" y="14" width="1" height="1" fill="#3e1b1b" class="colorizable-hair"/>

      <!-- HEAD_BACK (24,8) - Desde backup del usuario -->
      <rect x="24" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="25" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="26" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="27" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="28" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="29" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="30" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="31" y="8" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="24" y="9" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="25" y="9" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="26" y="9" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="27" y="9" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="28" y="9" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="29" y="9" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="30" y="9" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="31" y="9" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="24" y="10" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="25" y="10" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="26" y="10" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="27" y="10" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="28" y="10" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="29" y="10" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="30" y="10" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="31" y="10" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="24" y="11" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="25" y="11" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="26" y="11" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="27" y="11" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="28" y="11" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="29" y="11" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="30" y="11" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="31" y="11" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="24" y="12" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="25" y="12" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="26" y="12" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="27" y="12" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="28" y="12" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="29" y="12" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="30" y="12" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="31" y="12" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="24" y="13" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="25" y="13" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="26" y="13" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="27" y="13" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="28" y="13" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="29" y="13" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="30" y="13" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="31" y="13" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="24" y="14" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="25" y="14" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="26" y="14" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="27" y="14" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="28" y="14" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="29" y="14" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="30" y="14" width="1" height="1" fill="#482020" class="colorizable-hair"/>
      <rect x="31" y="14" width="1" height="1" fill="#451f1f" class="colorizable-hair"/>
      <rect x="24" y="15" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="25" y="15" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="26" y="15" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="27" y="15" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="28" y="15" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="29" y="15" width="1" height="1" fill="#361818" class="colorizable-hair"/>
      <rect x="30" y="15" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>
      <rect x="31" y="15" width="1" height="1" fill="#3d1b1b" class="colorizable-hair"/>

      <!-- HAT_BACK (56,8) - Highlights editados por usuario -->
      <rect x="57" y="9" width="1" height="1" fill="#522424" class="colorizable-hair"/>
      <rect x="62" y="9" width="1" height="1" fill="#522424" class="colorizable-hair"/>
      <rect x="59" y="11" width="1" height="1" fill="#3e1b1b" class="colorizable-hair"/>
      <rect x="60" y="13" width="1" height="1" fill="#3e1b1b" class="colorizable-hair"/>
    </svg>
  `;
}
