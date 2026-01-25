/**
 * Biblioteca Completa de Peinados para Sistema Modular de Minecraft Skins
 *
 * IMPORTANTE: Este archivo contiene SOLO funciones de peinados realistas
 * basados en referencias de peinados reales y comunes.
 *
 * Sistema de Doble Capa:
 * - HEAD: Forma base compacta pegada a la cabeza
 * - HAT: Detalles de profundidad, mechones sobresalientes, volumen
 *
 * Categorías:
 * - Peinados Cortos (5 variaciones)
 * - Peinados Medios (2 variaciones)
 * - Peinados Largos (2 variaciones × 2 componentes cada uno = 4 funciones)
 * - Peinados Recogidos (2 variaciones)
 *
 * Total: 13 funciones
 */

// ============================================================================
// PEINADOS CORTOS (SHORT HAIR) - 5 variaciones
// ============================================================================

/**
 * Genera sprite de pelo corto - Tipo 4: Crew Cut
 * Estilo: Corto arriba con pequeña pompa al frente, lados muy cortos degradados
 * Género: Masculino
 * Inspiración: Militar clásico, deportistas, George Clooney
 */
export function generateHairShort_04_CrewCut(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- ========== CAPA BASE (HEAD) - Pelo pegado a la cabeza ========== -->

      <!-- HEAD_TOP (8x8) at (8,0) - Forma base compacta -->
      <rect x="8" y="0" width="8" height="8" fill="#707070" class="colorizable-hair"/>
      <rect x="9" y="0" width="6" height="6" fill="#808080" class="colorizable-hair"/>
      <rect x="10" y="1" width="4" height="4" fill="#707070" class="colorizable-hair"/>

      <!-- HEAD_RIGHT (8x8) at (0,8) - Lado derecho compacto -->
      <rect x="0" y="8" width="8" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="1" y="10" width="6" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HEAD_FRONT (8x8) at (8,8) - Frente con pompa base -->
      <rect x="8" y="8" width="8" height="2" fill="#808080" class="colorizable-hair"/>
      <rect x="9" y="10" width="6" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HEAD_LEFT (8x8) at (16,8) - Lado izquierdo compacto -->
      <rect x="16" y="8" width="8" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="17" y="10" width="6" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HEAD_BACK (8x8) at (24,8) - Nuca base -->
      <rect x="24" y="8" width="8" height="3" fill="#707070" class="colorizable-hair"/>
      <rect x="25" y="11" width="6" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- ========== CAPA OVERLAY (HAT) - Volumen y profundidad ========== -->

      <!-- HAT_TOP (8x8) at (40,0) - Volumen frontal (pompa) -->
      <rect x="41" y="0" width="6" height="2" fill="#909090" class="colorizable-hair"/>
      <rect x="42" y="1" width="4" height="1" fill="#959595" class="colorizable-hair"/>

      <!-- HAT_RIGHT (8x8) at (32,8) - Mechones laterales mínimos -->
      <rect x="33" y="8" width="4" height="1" fill="#808080" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Puntas de la pompa -->
      <rect x="41" y="10" width="6" height="1" fill="#959595" class="colorizable-hair"/>
      <rect x="42" y="11" width="4" height="1" fill="#808080" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Mechones laterales mínimos -->
      <rect x="51" y="8" width="4" height="1" fill="#808080" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Volumen trasero mínimo -->
      <rect x="58" y="8" width="4" height="1" fill="#808080" class="colorizable-hair"/>
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
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- ========== CAPA BASE (HEAD) - Pelo pegado a la cabeza ========== -->

      <!-- HEAD_TOP (8x8) at (8,0) - Forma base uniforme -->
      <rect x="8" y="0" width="8" height="8" fill="#707070" class="colorizable-hair"/>
      <rect x="9" y="0" width="6" height="7" fill="#808080" class="colorizable-hair"/>

      <!-- HEAD_RIGHT (8x8) at (0,8) - Lado derecho uniforme -->
      <rect x="0" y="8" width="8" height="4" fill="#707070" class="colorizable-hair"/>
      <rect x="1" y="12" width="6" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HEAD_FRONT (8x8) at (8,8) - Frente con flequillo base -->
      <rect x="8" y="8" width="8" height="3" fill="#808080" class="colorizable-hair"/>
      <rect x="8" y="11" width="8" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HEAD_LEFT (8x8) at (16,8) - Lado izquierdo uniforme -->
      <rect x="16" y="8" width="8" height="4" fill="#707070" class="colorizable-hair"/>
      <rect x="17" y="12" width="6" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HEAD_BACK (8x8) at (24,8) - Nuca uniforme -->
      <rect x="24" y="8" width="8" height="4" fill="#707070" class="colorizable-hair"/>
      <rect x="25" y="12" width="6" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- ========== CAPA OVERLAY (HAT) - Textura de capas ========== -->

      <!-- HAT_TOP (8x8) at (40,0) - Textura superior -->
      <rect x="40" y="2" width="8" height="1" fill="#909090" class="colorizable-hair"/>
      <rect x="41" y="4" width="6" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_RIGHT (8x8) at (32,8) - Capas laterales -->
      <rect x="33" y="12" width="4" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Borde del flequillo -->
      <rect x="41" y="12" width="6" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Capas laterales -->
      <rect x="51" y="12" width="4" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Capas traseras -->
      <rect x="57" y="12" width="6" height="1" fill="#707070" class="colorizable-hair"/>
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
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- ========== CAPA BASE (HEAD) - Pelo pegado a la cabeza ========== -->

      <!-- HEAD_TOP (8x8) at (8,0) - Forma base con volumen arriba -->
      <rect x="8" y="0" width="8" height="8" fill="#808080" class="colorizable-hair"/>
      <rect x="9" y="0" width="6" height="6" fill="#909090" class="colorizable-hair"/>
      <rect x="10" y="1" width="4" height="4" fill="#808080" class="colorizable-hair"/>

      <!-- HEAD_RIGHT (8x8) at (0,8) - Lado derecho: arriba volumen, abajo rapado -->
      <rect x="0" y="8" width="8" height="2" fill="#808080" class="colorizable-hair"/>
      <rect x="1" y="10" width="5" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="2" y="11" width="3" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HEAD_FRONT (8x8) at (8,8) - Frente con volumen -->
      <rect x="8" y="8" width="8" height="2" fill="#909090" class="colorizable-hair"/>
      <rect x="9" y="10" width="6" height="1" fill="#808080" class="colorizable-hair"/>

      <!-- HEAD_LEFT (8x8) at (16,8) - Lado izquierdo: arriba volumen, abajo rapado -->
      <rect x="16" y="8" width="8" height="2" fill="#808080" class="colorizable-hair"/>
      <rect x="18" y="10" width="5" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="19" y="11" width="3" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HEAD_BACK (8x8) at (24,8) - Nuca con volumen arriba -->
      <rect x="24" y="8" width="8" height="3" fill="#808080" class="colorizable-hair"/>
      <rect x="25" y="11" width="6" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- ========== CAPA OVERLAY (HAT) - Volumen pronunciado arriba ========== -->

      <!-- HAT_TOP (8x8) at (40,0) - Volumen extra superior -->
      <rect x="41" y="0" width="6" height="2" fill="#959595" class="colorizable-hair"/>
      <rect x="42" y="1" width="4" height="2" fill="#a0a0a0" class="colorizable-hair"/>
      <rect x="43" y="2" width="2" height="3" fill="#959595" class="colorizable-hair"/>

      <!-- HAT_RIGHT (8x8) at (32,8) - Contraste undercut -->
      <rect x="33" y="8" width="4" height="1" fill="#909090" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Volumen frontal pronunciado -->
      <rect x="41" y="10" width="6" height="1" fill="#959595" class="colorizable-hair"/>
      <rect x="42" y="11" width="4" height="1" fill="#909090" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Contraste undercut -->
      <rect x="51" y="8" width="4" height="1" fill="#909090" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Volumen trasero -->
      <rect x="57" y="8" width="6" height="1" fill="#909090" class="colorizable-hair"/>
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
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- ========== CAPA BASE (HEAD) - Pelo pegado a la cabeza ========== -->

      <!-- HEAD_TOP (8x8) at (8,0) - Forma circular base -->
      <rect x="8" y="0" width="8" height="8" fill="#707070" class="colorizable-hair"/>
      <rect x="9" y="0" width="6" height="8" fill="#808080" class="colorizable-hair"/>
      <rect x="10" y="1" width="4" height="6" fill="#707070" class="colorizable-hair"/>

      <!-- HEAD_RIGHT (8x8) at (0,8) - Lado derecho circular -->
      <rect x="0" y="8" width="8" height="4" fill="#707070" class="colorizable-hair"/>
      <rect x="1" y="10" width="6" height="2" fill="#808080" class="colorizable-hair"/>
      <rect x="0" y="12" width="7" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HEAD_FRONT (8x8) at (8,8) - Frente con flequillo circular -->
      <rect x="8" y="8" width="8" height="4" fill="#808080" class="colorizable-hair"/>
      <rect x="9" y="10" width="6" height="2" fill="#909090" class="colorizable-hair"/>
      <rect x="8" y="12" width="8" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HEAD_LEFT (8x8) at (16,8) - Lado izquierdo circular -->
      <rect x="16" y="8" width="8" height="4" fill="#707070" class="colorizable-hair"/>
      <rect x="17" y="10" width="6" height="2" fill="#808080" class="colorizable-hair"/>
      <rect x="17" y="12" width="7" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HEAD_BACK (8x8) at (24,8) - Nuca circular -->
      <rect x="24" y="8" width="8" height="4" fill="#707070" class="colorizable-hair"/>
      <rect x="25" y="10" width="6" height="2" fill="#808080" class="colorizable-hair"/>
      <rect x="25" y="12" width="6" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- ========== CAPA OVERLAY (HAT) - Volumen circular ========== -->

      <!-- HAT_TOP (8x8) at (40,0) - Volumen superior circular -->
      <rect x="41" y="0" width="6" height="7" fill="#909090" class="colorizable-hair"/>
      <rect x="42" y="1" width="4" height="5" fill="#959595" class="colorizable-hair"/>

      <!-- HAT_RIGHT (8x8) at (32,8) - Borde circular -->
      <rect x="33" y="10" width="4" height="2" fill="#909090" class="colorizable-hair"/>
      <rect x="33" y="13" width="5" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Flequillo circular pronunciado -->
      <rect x="41" y="10" width="6" height="2" fill="#959595" class="colorizable-hair"/>
      <rect x="41" y="13" width="6" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Borde circular -->
      <rect x="51" y="10" width="4" height="2" fill="#909090" class="colorizable-hair"/>
      <rect x="50" y="13" width="5" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Borde circular trasero -->
      <rect x="57" y="10" width="6" height="2" fill="#909090" class="colorizable-hair"/>
      <rect x="58" y="13" width="4" height="1" fill="#707070" class="colorizable-hair"/>
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
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- ========== CAPA BASE (HEAD) - Pelo pegado a la cabeza ========== -->

      <!-- HEAD_TOP (8x8) at (8,0) - Forma base hacia atrás -->
      <rect x="8" y="0" width="8" height="8" fill="#707070" class="colorizable-hair"/>
      <rect x="9" y="1" width="6" height="6" fill="#808080" class="colorizable-hair"/>

      <!-- HEAD_RIGHT (8x8) at (0,8) - Lado derecho corto -->
      <rect x="0" y="8" width="8" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="1" y="10" width="5" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HEAD_FRONT (8x8) at (8,8) - Frente peinado hacia atrás -->
      <rect x="8" y="8" width="8" height="2" fill="#808080" class="colorizable-hair"/>
      <rect x="9" y="10" width="6" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HEAD_LEFT (8x8) at (16,8) - Lado izquierdo corto -->
      <rect x="16" y="8" width="8" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="18" y="10" width="5" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HEAD_BACK (8x8) at (24,8) - Nuca peinada -->
      <rect x="24" y="8" width="8" height="4" fill="#707070" class="colorizable-hair"/>
      <rect x="25" y="11" width="6" height="1" fill="#808080" class="colorizable-hair"/>

      <!-- ========== CAPA OVERLAY (HAT) - Líneas de dirección y brillo ========== -->

      <!-- HAT_TOP (8x8) at (40,0) - Líneas hacia atrás con brillo -->
      <rect x="41" y="1" width="6" height="1" fill="#909090" class="colorizable-hair"/>
      <rect x="42" y="3" width="4" height="1" fill="#909090" class="colorizable-hair"/>
      <rect x="42" y="2" width="2" height="1" fill="#959595" class="colorizable-hair"/>

      <!-- HAT_RIGHT (8x8) at (32,8) - Transición lateral -->
      <rect x="33" y="8" width="4" height="1" fill="#808080" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Brillo del gel frontal -->
      <rect x="41" y="10" width="6" height="1" fill="#808080" class="colorizable-hair"/>
      <rect x="43" y="9" width="2" height="1" fill="#959595" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Transición lateral -->
      <rect x="51" y="8" width="4" height="1" fill="#808080" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Líneas y brillo trasero -->
      <rect x="57" y="11" width="6" height="1" fill="#909090" class="colorizable-hair"/>
      <rect x="59" y="10" width="2" height="1" fill="#959595" class="colorizable-hair"/>
    </svg>
  `;
}

// ============================================================================
// PEINADOS MEDIOS (MEDIUM HAIR) - 2 variaciones
// ============================================================================

/**
 * Genera sprite de pelo medio - Tipo 1: Lob (Long Bob)
 * Estilo: Bob largo hasta los hombros, línea recta, flequillo lateral
 * Género: Femenino/Unisex
 * Inspiración: Heidi Klum, Jessica Alba
 */
export function generateHairMedium_01_Lob(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- ========== CAPA BASE (HEAD) - Pelo pegado a la cabeza ========== -->

      <!-- HEAD_TOP (8x8) at (8,0) - Forma base con raya lateral -->
      <rect x="8" y="0" width="8" height="8" fill="#707070" class="colorizable-hair"/>
      <rect x="9" y="0" width="6" height="7" fill="#808080" class="colorizable-hair"/>
      <rect x="10" y="1" width="1" height="6" fill="#606060" class="colorizable-hair"/>

      <!-- HEAD_RIGHT (8x8) at (0,8) - Lado derecho pegado -->
      <rect x="0" y="8" width="8" height="6" fill="#707070" class="colorizable-hair"/>
      <rect x="1" y="9" width="6" height="4" fill="#808080" class="colorizable-hair"/>

      <!-- HEAD_FRONT (8x8) at (8,8) - Frente con flequillo lateral base -->
      <rect x="8" y="8" width="8" height="2" fill="#808080" class="colorizable-hair"/>
      <rect x="8" y="10" width="3" height="2" fill="#707070" class="colorizable-hair"/>

      <!-- HEAD_LEFT (8x8) at (16,8) - Lado izquierdo pegado -->
      <rect x="16" y="8" width="8" height="6" fill="#707070" class="colorizable-hair"/>
      <rect x="17" y="9" width="6" height="4" fill="#808080" class="colorizable-hair"/>

      <!-- HEAD_BACK (8x8) at (24,8) - Nuca con pelo descendiendo -->
      <rect x="24" y="8" width="8" height="5" fill="#707070" class="colorizable-hair"/>
      <rect x="25" y="9" width="6" height="4" fill="#808080" class="colorizable-hair"/>

      <!-- ========== CAPA OVERLAY (HAT) - Mechones y profundidad ========== -->

      <!-- HAT_TOP (8x8) at (40,0) - Volumen superior -->
      <rect x="41" y="0" width="6" height="1" fill="#909090" class="colorizable-hair"/>

      <!-- HAT_RIGHT (8x8) at (32,8) - Mechones laterales -->
      <rect x="32" y="12" width="6" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="32" y="14" width="4" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Puntas del flequillo -->
      <rect x="40" y="12" width="2" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Mechones laterales -->
      <rect x="50" y="12" width="6" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="52" y="14" width="4" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Mechones traseros -->
      <rect x="56" y="13" width="8" height="1" fill="#707070" class="colorizable-hair"/>
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
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- ========== CAPA BASE (HEAD) - Pelo pegado a la cabeza ========== -->

      <!-- HEAD_TOP (8x8) at (8,0) - Forma base con volumen -->
      <rect x="8" y="0" width="8" height="8" fill="#808080" class="colorizable-hair"/>
      <rect x="9" y="0" width="6" height="7" fill="#909090" class="colorizable-hair"/>

      <!-- HEAD_RIGHT (8x8) at (0,8) - Lado derecho con capas base -->
      <rect x="0" y="8" width="8" height="5" fill="#808080" class="colorizable-hair"/>
      <rect x="1" y="10" width="6" height="3" fill="#909090" class="colorizable-hair"/>

      <!-- HEAD_FRONT (8x8) at (8,8) - Frente con flequillo base -->
      <rect x="8" y="8" width="8" height="2" fill="#909090" class="colorizable-hair"/>
      <rect x="9" y="10" width="6" height="2" fill="#808080" class="colorizable-hair"/>

      <!-- HEAD_LEFT (8x8) at (16,8) - Lado izquierdo con capas base -->
      <rect x="16" y="8" width="8" height="5" fill="#808080" class="colorizable-hair"/>
      <rect x="17" y="10" width="6" height="3" fill="#909090" class="colorizable-hair"/>

      <!-- HEAD_BACK (8x8) at (24,8) - Nuca con capas base -->
      <rect x="24" y="8" width="8" height="5" fill="#808080" class="colorizable-hair"/>
      <rect x="25" y="11" width="6" height="2" fill="#909090" class="colorizable-hair"/>

      <!-- ========== CAPA OVERLAY (HAT) - Textura despeinada ========== -->

      <!-- HAT_TOP (8x8) at (40,0) - Textura irregular superior -->
      <rect x="40" y="0" width="8" height="2" fill="#909090" class="colorizable-hair"/>
      <rect x="41" y="2" width="2" height="1" fill="#909090" class="colorizable-hair"/>
      <rect x="45" y="2" width="2" height="1" fill="#909090" class="colorizable-hair"/>

      <!-- HAT_RIGHT (8x8) at (32,8) - Mechones feathered -->
      <rect x="32" y="12" width="5" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="32" y="13" width="3" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="32" y="14" width="1" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Mechones irregulares frontales -->
      <rect x="41" y="10" width="2" height="2" fill="#808080" class="colorizable-hair"/>
      <rect x="45" y="10" width="2" height="2" fill="#808080" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Mechones feathered -->
      <rect x="51" y="12" width="5" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="53" y="13" width="3" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="55" y="14" width="1" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Capas traseras visibles -->
      <rect x="57" y="13" width="3" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="60" y="13" width="3" height="1" fill="#707070" class="colorizable-hair"/>
    </svg>
  `;
}

// ============================================================================
// PEINADOS LARGOS (LONG HAIR) - 2 variaciones × 2 componentes = 4 funciones
// Cada estilo tiene 2 funciones: HEAD (cabeza) + BODY (caída en espalda)
// ============================================================================

/**
 * Genera sprite de pelo largo (cabeza) - Tipo 1: Straight Long Hair (Lacio)
 * Pelo lacio que cae recto desde la coronilla hasta los hombros
 */
export function generateHairLong_01(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- ========== CAPA BASE (HEAD) - Pelo pegado a la cabeza ========== -->

      <!-- HEAD_TOP (8x8) at (8,0) - Forma base con raya -->
      <rect x="8" y="0" width="8" height="8" fill="#707070" class="colorizable-hair"/>
      <rect x="11" y="0" width="2" height="8" fill="#606060" class="colorizable-hair"/>
      <rect x="8" y="1" width="3" height="6" fill="#808080" class="colorizable-hair"/>
      <rect x="13" y="1" width="3" height="6" fill="#808080" class="colorizable-hair"/>

      <!-- HEAD_RIGHT (8x8) at (0,8) - Lado derecho con caída -->
      <rect x="0" y="8" width="8" height="8" fill="#707070" class="colorizable-hair"/>
      <rect x="0" y="8" width="2" height="8" fill="#606060" class="colorizable-hair"/>
      <rect x="2" y="10" width="4" height="5" fill="#808080" class="colorizable-hair"/>

      <!-- HEAD_FRONT (8x8) at (8,8) - Frente con pelo hacia atrás -->
      <rect x="8" y="8" width="8" height="4" fill="#707070" class="colorizable-hair"/>
      <rect x="11" y="8" width="2" height="4" fill="#606060" class="colorizable-hair"/>
      <rect x="9" y="11" width="6" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HEAD_LEFT (8x8) at (16,8) - Lado izquierdo con caída -->
      <rect x="16" y="8" width="8" height="8" fill="#707070" class="colorizable-hair"/>
      <rect x="22" y="8" width="2" height="8" fill="#606060" class="colorizable-hair"/>
      <rect x="18" y="10" width="4" height="5" fill="#808080" class="colorizable-hair"/>

      <!-- HEAD_BACK (8x8) at (24,8) - Nuca con volumen -->
      <rect x="24" y="8" width="8" height="8" fill="#707070" class="colorizable-hair"/>
      <rect x="26" y="8" width="4" height="6" fill="#808080" class="colorizable-hair"/>
      <rect x="25" y="13" width="6" height="2" fill="#606060" class="colorizable-hair"/>

      <!-- ========== CAPA OVERLAY (HAT) - Mechones y profundidad ========== -->

      <!-- HAT_TOP (8x8) at (40,0) - Volumen superior y raya -->
      <rect x="40" y="1" width="3" height="6" fill="#909090" class="colorizable-hair"/>
      <rect x="45" y="1" width="3" height="6" fill="#909090" class="colorizable-hair"/>

      <!-- HAT_RIGHT (8x8) at (32,8) - Mechones laterales -->
      <rect x="34" y="10" width="4" height="5" fill="#909090" class="colorizable-hair"/>
      <rect x="35" y="14" width="3" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Sombra frontal -->
      <rect x="41" y="11" width="6" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Mechones laterales -->
      <rect x="50" y="10" width="4" height="5" fill="#909090" class="colorizable-hair"/>
      <rect x="50" y="14" width="3" height="1" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Volumen trasero -->
      <rect x="58" y="8" width="4" height="6" fill="#909090" class="colorizable-hair"/>
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
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- BODY_BACK (4x12) at (32,20) - Pelo cayendo en espalda (PRINCIPAL) -->
      <rect x="32" y="20" width="4" height="12" fill="#808080" class="colorizable-hair"/>
      <!-- Sombra central -->
      <rect x="33" y="20" width="2" height="12" fill="#707070" class="colorizable-hair"/>
      <!-- Mechas laterales -->
      <rect x="32" y="21" width="1" height="10" fill="#909090" class="colorizable-hair"/>
      <rect x="35" y="21" width="1" height="10" fill="#909090" class="colorizable-hair"/>
      <!-- Puntas -->
      <rect x="33" y="30" width="2" height="2" fill="#606060" class="colorizable-hair"/>

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
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- ========== CAPA BASE (HEAD) - Pelo pegado a la cabeza ========== -->

      <!-- HEAD_TOP (8x8) at (8,0) - Forma base con ondas -->
      <rect x="8" y="0" width="8" height="8" fill="#672e2e" class="colorizable-hair"/>
      <rect x="9" y="0" width="6" height="7" fill="#743434" class="colorizable-hair"/>
      <rect x="10" y="2" width="1" height="4" fill="#5a2828" class="colorizable-hair"/>
      <rect x="11" y="3" width="2" height="2" fill="#5a2828" class="colorizable-hair"/>
      <rect x="13" y="2" width="1" height="4" fill="#5a2828" class="colorizable-hair"/>
      <rect x="14" y="3" width="2" height="2" fill="#5a2828" class="colorizable-hair"/>

      <!-- HEAD_RIGHT (8x8) at (0,8) - Lado derecho ondulado -->
      <rect x="0" y="8" width="8" height="8" fill="#672e2e" class="colorizable-hair"/>
      <rect x="1" y="9" width="6" height="6" fill="#743434" class="colorizable-hair"/>
      <rect x="2" y="11" width="3" height="2" fill="#5a2828" class="colorizable-hair"/>

      <!-- HEAD_FRONT (8x8) at (8,8) - Frente ondulado -->
      <rect x="8" y="8" width="8" height="6" fill="#743434" class="colorizable-hair"/>
      <rect x="9" y="9" width="6" height="4" fill="#672e2e" class="colorizable-hair"/>
      <rect x="8" y="11" width="1" height="2" fill="#5a2828" class="colorizable-hair"/>
      <rect x="15" y="11" width="1" height="2" fill="#5a2828" class="colorizable-hair"/>

      <!-- HEAD_LEFT (8x8) at (16,8) - Lado izquierdo ondulado -->
      <rect x="16" y="8" width="8" height="8" fill="#672e2e" class="colorizable-hair"/>
      <rect x="17" y="9" width="6" height="6" fill="#743434" class="colorizable-hair"/>
      <rect x="19" y="11" width="3" height="2" fill="#5a2828" class="colorizable-hair"/>

      <!-- HEAD_BACK (8x8) at (24,8) - Nuca ondulada -->
      <rect x="24" y="8" width="8" height="8" fill="#672e2e" class="colorizable-hair"/>
      <rect x="25" y="9" width="6" height="6" fill="#743434" class="colorizable-hair"/>
      <rect x="27" y="10" width="4" height="4" fill="#5a2828" class="colorizable-hair"/>

      <!-- ========== CAPA OVERLAY (HAT) - Ondas y profundidad ========== -->

      <!-- HAT_TOP (8x8) at (40,0) - Ondas superiores -->
      <rect x="40" y="2" width="1" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="41" y="2" width="2" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="43" y="2" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="45" y="2" width="2" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="47" y="2" width="1" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="40" y="3" width="1" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="41" y="3" width="2" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="43" y="3" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="45" y="3" width="2" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="47" y="3" width="1" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="40" y="4" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="42" y="4" width="1" height="1" fill="#4d2323" class="colorizable-hair"/>
      <rect x="43" y="4" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="45" y="4" width="1" height="1" fill="#4d2323" class="colorizable-hair"/>
      <rect x="46" y="4" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>

      <!-- HAT_BOTTOM (8x8) at (48,0) - Marco delicado inferior -->
      <rect x="48" y="0" width="1" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="49" y="0" width="6" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="55" y="0" width="1" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="48" y="1" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="50" y="1" width="4" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="54" y="1" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>

      <!-- HAT_RIGHT (8x8) at (32,8) - Mechones ondulados laterales -->
      <rect x="34" y="11" width="3" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="32" y="14" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="34" y="14" width="3" height="1" fill="#5a2828" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Mechones frontales -->
      <rect x="40" y="11" width="1" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="47" y="11" width="1" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="40" y="13" width="1" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="47" y="13" width="1" height="1" fill="#672e2e" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Mechones ondulados laterales -->
      <rect x="51" y="11" width="3" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="51" y="14" width="3" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="54" y="14" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Ondas traseras -->
      <rect x="58" y="10" width="4" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="59" y="11" width="3" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="58" y="14" width="4" height="1" fill="#672e2e" class="colorizable-hair"/>
    </svg>
  `;
}

/**
 * Genera sprite de pelo largo (cuerpo/caída) - Tipo 2: Wavy Long Hair RIZADO
 * Versión mejorada con pixel art profesional y paleta específica
 * MANUAL EDIT: Basado en ajustes manuales del usuario
 */
export function generateHairLongBody_02(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- BODY_FRONT (8x12) at (20,20) - Torso frontal -->
      <rect x="20" y="20" width="2" height="1" fill="#783636" class="colorizable-hair"/>
      <rect x="22" y="20" width="4" height="1" fill="#604549" class="colorizable-hair"/>
      <rect x="26" y="20" width="2" height="1" fill="#783636" class="colorizable-hair"/>
      <rect x="20" y="21" width="3" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="23" y="21" width="2" height="1" fill="#805b61" class="colorizable-hair"/>
      <rect x="25" y="21" width="3" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="20" y="22" width="1" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="21" y="22" width="2" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="23" y="22" width="2" height="1" fill="#6a5d50" class="colorizable-hair"/>
      <rect x="25" y="22" width="2" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="27" y="22" width="1" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="20" y="23" width="1" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="21" y="23" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="23" y="23" width="2" height="1" fill="#805b61" class="colorizable-hair"/>
      <rect x="25" y="23" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="27" y="23" width="1" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="20" y="24" width="1" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="21" y="24" width="2" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="23" y="24" width="2" height="1" fill="#805b61" class="colorizable-hair"/>
      <rect x="25" y="24" width="2" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="27" y="24" width="1" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="20" y="25" width="1" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="21" y="25" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="23" y="25" width="2" height="1" fill="#805b61" class="colorizable-hair"/>
      <rect x="25" y="25" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="27" y="25" width="1" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="20" y="26" width="1" height="1" fill="#805b61" class="colorizable-hair"/>
      <rect x="21" y="26" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="23" y="26" width="2" height="1" fill="#805b61" class="colorizable-hair"/>
      <rect x="25" y="26" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="27" y="26" width="1" height="1" fill="#805b61" class="colorizable-hair"/>
      <rect x="20" y="27" width="1" height="1" fill="#805b61" class="colorizable-hair"/>
      <rect x="21" y="27" width="2" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="23" y="27" width="2" height="1" fill="#6a5d50" class="colorizable-hair"/>
      <rect x="25" y="27" width="2" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="27" y="27" width="1" height="1" fill="#805b61" class="colorizable-hair"/>
      <rect x="20" y="28" width="1" height="1" fill="#805b61" class="colorizable-hair"/>
      <rect x="21" y="28" width="2" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="23" y="28" width="2" height="1" fill="#805b61" class="colorizable-hair"/>
      <rect x="25" y="28" width="2" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="27" y="28" width="1" height="1" fill="#805b61" class="colorizable-hair"/>
      <rect x="20" y="29" width="2" height="1" fill="#805b61" class="colorizable-hair"/>
      <rect x="22" y="29" width="1" height="1" fill="#4d2323" class="colorizable-hair"/>
      <rect x="23" y="29" width="2" height="1" fill="#805b61" class="colorizable-hair"/>
      <rect x="25" y="29" width="1" height="1" fill="#4d2323" class="colorizable-hair"/>
      <rect x="26" y="29" width="2" height="1" fill="#805b61" class="colorizable-hair"/>
      <rect x="20" y="30" width="8" height="1" fill="#805b61" class="colorizable-hair"/>
      <rect x="20" y="31" width="8" height="1" fill="#805b61" class="colorizable-hair"/>

      <!-- BODY_BACK (4x12) at (32,20) - Torso trasero - Solo píxeles de pelo -->
      <!-- Fila y=20: mechones superiores -->
      <rect x="32" y="20" width="1" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="33" y="20" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="35" y="20" width="1" height="1" fill="#743434" class="colorizable-hair"/>
      <!-- Fila y=21: mechones en 33-36 -->
      <rect x="33" y="21" width="1" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="34" y="21" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <!-- Fila y=22: mechones completos -->
      <rect x="32" y="22" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="34" y="22" width="2" height="1" fill="#5a2828" class="colorizable-hair"/>
      <!-- Fila y=23: mechones completos -->
      <rect x="32" y="23" width="1" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="33" y="23" width="2" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="35" y="23" width="1" height="1" fill="#783636" class="colorizable-hair"/>
      <!-- Fila y=24: mechones en 33-35 -->
      <rect x="33" y="24" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="35" y="24" width="1" height="1" fill="#743434" class="colorizable-hair"/>
      <!-- Fila y=25: mechones en 34-36 -->
      <rect x="34" y="25" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <!-- Fila y=26: mechones completos -->
      <rect x="32" y="26" width="1" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="33" y="26" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="35" y="26" width="1" height="1" fill="#5a2828" class="colorizable-hair"/>
      <!-- Fila y=27: mechones completos -->
      <rect x="32" y="27" width="1" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="33" y="27" width="2" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="35" y="27" width="1" height="1" fill="#783636" class="colorizable-hair"/>
      <!-- Fila y=28: mechones en 33-34 -->
      <rect x="33" y="28" width="1" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="34" y="28" width="1" height="1" fill="#743434" class="colorizable-hair"/>
      <!-- Fila y=29: mechones completos -->
      <rect x="32" y="29" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="34" y="29" width="2" height="1" fill="#5a2828" class="colorizable-hair"/>
      <!-- Fila y=30: mechones en 33-34 -->
      <rect x="33" y="30" width="2" height="1" fill="#5a2828" class="colorizable-hair"/>

      <!-- BODY_RIGHT (4x12) at (16,20) - Torso derecho -->
      <rect x="16" y="20" width="1" height="1" fill="#783636" class="colorizable-hair"/>
      <rect x="17" y="20" width="2" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="19" y="20" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="16" y="21" width="1" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="17" y="21" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="19" y="21" width="1" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="16" y="22" width="1" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="17" y="22" width="2" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="19" y="22" width="1" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="16" y="23" width="1" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="17" y="23" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="19" y="23" width="1" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="16" y="24" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="17" y="24" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="19" y="24" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="16" y="25" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="17" y="25" width="3" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="16" y="26" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="17" y="26" width="2" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="19" y="26" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="16" y="27" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="17" y="27" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="19" y="27" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="16" y="28" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="17" y="28" width="2" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="19" y="28" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="16" y="29" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="17" y="29" width="2" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="19" y="29" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="16" y="30" width="2" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="18" y="30" width="1" height="1" fill="#4d2323" class="colorizable-hair"/>
      <rect x="19" y="30" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="16" y="31" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="17" y="31" width="1" height="1" fill="#4d2323" class="colorizable-hair"/>
      <rect x="18" y="31" width="2" height="1" fill="#705055" class="colorizable-hair"/>

      <!-- BODY_LEFT (4x12) at (28,20) - Torso izquierdo -->
      <rect x="28" y="20" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="29" y="20" width="2" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="31" y="20" width="1" height="1" fill="#783636" class="colorizable-hair"/>
      <rect x="28" y="21" width="1" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="29" y="21" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="31" y="21" width="1" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="28" y="22" width="1" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="29" y="22" width="2" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="31" y="22" width="1" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="28" y="23" width="1" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="29" y="23" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="31" y="23" width="1" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="28" y="24" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="29" y="24" width="2" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="31" y="24" width="1" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="28" y="25" width="3" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="31" y="25" width="1" height="1" fill="#783636" class="colorizable-hair"/>
      <rect x="28" y="26" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="29" y="26" width="2" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="31" y="26" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="28" y="27" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="29" y="27" width="3" height="1" fill="#672e2e" class="colorizable-hair"/>
      <rect x="28" y="28" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="29" y="28" width="3" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="28" y="29" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="29" y="29" width="2" height="1" fill="#5a2828" class="colorizable-hair"/>
      <rect x="31" y="29" width="1" height="1" fill="#743434" class="colorizable-hair"/>
      <rect x="28" y="30" width="1" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="29" y="30" width="1" height="1" fill="#4d2323" class="colorizable-hair"/>
      <rect x="30" y="30" width="2" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="28" y="31" width="2" height="1" fill="#705055" class="colorizable-hair"/>
      <rect x="30" y="31" width="1" height="1" fill="#4d2323" class="colorizable-hair"/>
      <rect x="31" y="31" width="1" height="1" fill="#705055" class="colorizable-hair"/>
    </svg>
  `;
}

// ============================================================================
// PEINADOS RECOGIDOS (UPDOS) - 2 variaciones
// ============================================================================

/**
 * Genera sprite de peinado recogido - Tipo 1: High Ponytail (Colita Alta Deportiva)
 * Estilo: Colita alta clásica, deportiva y juvenil. El pelo se recoge completamente en la coronilla.
 * Género: Femenino/Unisex
 */
export function generateHairUpdo_01_HighPonytail(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- ========== CAPA BASE (HEAD) - Pelo pegado a la cabeza ========== -->

      <!-- HEAD_TOP (8x8) at (8,0) - Base de la coleta -->
      <rect x="8" y="0" width="8" height="4" fill="#707070" class="colorizable-hair"/>
      <rect x="10" y="0" width="4" height="4" fill="#808080" class="colorizable-hair"/>
      <rect x="11" y="4" width="2" height="3" fill="#606060" class="colorizable-hair"/>

      <!-- HEAD_RIGHT (8x8) at (0,8) - Lado derecho despejado -->
      <rect x="0" y="8" width="8" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="2" y="8" width="3" height="1" fill="#808080" class="colorizable-hair"/>

      <!-- HEAD_FRONT (8x8) at (8,8) - Frente despejado -->
      <rect x="8" y="8" width="8" height="1" fill="#707070" class="colorizable-hair"/>
      <rect x="9" y="9" width="2" height="1" fill="#606060" class="colorizable-hair"/>
      <rect x="13" y="9" width="2" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HEAD_LEFT (8x8) at (16,8) - Lado izquierdo despejado -->
      <rect x="16" y="8" width="8" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="19" y="8" width="3" height="1" fill="#808080" class="colorizable-hair"/>

      <!-- HEAD_BACK (8x8) at (24,8) - Nuca despejada con coleta -->
      <rect x="24" y="8" width="8" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="26" y="8" width="4" height="1" fill="#808080" class="colorizable-hair"/>
      <rect x="27" y="9" width="3" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="28" y="11" width="2" height="2" fill="#606060" class="colorizable-hair"/>

      <!-- ========== CAPA OVERLAY (HAT) - Volumen de la coleta ========== -->

      <!-- HAT_TOP (8x8) at (40,0) - Base circular prominente -->
      <rect x="42" y="0" width="4" height="4" fill="#808080" class="colorizable-hair"/>
      <rect x="41" y="1" width="6" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="43" y="0" width="2" height="1" fill="#909090" class="colorizable-hair"/>
      <rect x="43" y="4" width="2" height="3" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_RIGHT (8x8) at (32,8) - Proyección lateral de coleta -->
      <rect x="34" y="8" width="3" height="1" fill="#909090" class="colorizable-hair"/>
      <rect x="35" y="9" width="2" height="2" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Sombra frontal mínima -->

      <!-- HAT_LEFT (8x8) at (48,8) - Proyección lateral de coleta -->
      <rect x="51" y="8" width="3" height="1" fill="#909090" class="colorizable-hair"/>
      <rect x="51" y="9" width="2" height="2" fill="#707070" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Coleta colgando -->
      <rect x="58" y="8" width="4" height="1" fill="#909090" class="colorizable-hair"/>
      <rect x="59" y="9" width="3" height="2" fill="#808080" class="colorizable-hair"/>
      <rect x="60" y="11" width="2" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="60" y="13" width="2" height="1" fill="#606060" class="colorizable-hair"/>
    </svg>
  `;
}

/**
 * Genera sprite de peinado recogido - Tipo 5: Messy Bun (Moño Despeinado)
 * Estilo: Moño casual y desprolijo, bohemio, con textura irregular.
 * Género: Femenino
 */
export function generateHairUpdo_05_MessyBun(): string {
  return `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <!-- ========== CAPA BASE (HEAD) - Pelo pegado a la cabeza ========== -->

      <!-- HEAD_TOP (8x8) at (8,0) - Base del moño -->
      <rect x="8" y="1" width="8" height="5" fill="#707070" class="colorizable-hair"/>
      <rect x="9" y="1" width="6" height="5" fill="#808080" class="colorizable-hair"/>
      <rect x="8" y="2" width="2" height="2" fill="#606060" class="colorizable-hair"/>
      <rect x="14" y="2" width="2" height="2" fill="#606060" class="colorizable-hair"/>

      <!-- HEAD_RIGHT (8x8) at (0,8) - Lado derecho con moño -->
      <rect x="0" y="8" width="8" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="3" y="8" width="3" height="3" fill="#808080" class="colorizable-hair"/>

      <!-- HEAD_FRONT (8x8) at (8,8) - Frente con mechones -->
      <rect x="8" y="8" width="8" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="8" y="10" width="2" height="2" fill="#606060" class="colorizable-hair"/>
      <rect x="14" y="10" width="2" height="2" fill="#606060" class="colorizable-hair"/>

      <!-- HEAD_LEFT (8x8) at (16,8) - Lado izquierdo con moño -->
      <rect x="16" y="8" width="8" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="18" y="8" width="3" height="3" fill="#808080" class="colorizable-hair"/>

      <!-- HEAD_BACK (8x8) at (24,8) - Nuca con moño -->
      <rect x="24" y="8" width="8" height="3" fill="#707070" class="colorizable-hair"/>
      <rect x="26" y="8" width="4" height="3" fill="#808080" class="colorizable-hair"/>

      <!-- ========== CAPA OVERLAY (HAT) - Textura desprolija ========== -->

      <!-- HAT_TOP (8x8) at (40,0) - Textura irregular -->
      <rect x="41" y="1" width="6" height="5" fill="#808080" class="colorizable-hair"/>
      <rect x="40" y="2" width="2" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="46" y="2" width="2" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="42" y="1" width="1" height="1" fill="#909090" class="colorizable-hair"/>
      <rect x="45" y="1" width="1" height="1" fill="#909090" class="colorizable-hair"/>

      <!-- HAT_RIGHT (8x8) at (32,8) - Volumen lateral -->
      <rect x="35" y="8" width="3" height="3" fill="#707070" class="colorizable-hair"/>
      <rect x="36" y="9" width="2" height="2" fill="#909090" class="colorizable-hair"/>
      <rect x="34" y="11" width="2" height="2" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_FRONT (8x8) at (40,8) - Mechones desprolijos -->
      <rect x="40" y="10" width="2" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="46" y="10" width="2" height="2" fill="#707070" class="colorizable-hair"/>
      <rect x="41" y="12" width="1" height="1" fill="#606060" class="colorizable-hair"/>
      <rect x="46" y="12" width="1" height="1" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_LEFT (8x8) at (48,8) - Volumen lateral -->
      <rect x="50" y="8" width="3" height="3" fill="#707070" class="colorizable-hair"/>
      <rect x="50" y="9" width="2" height="2" fill="#909090" class="colorizable-hair"/>
      <rect x="52" y="11" width="2" height="2" fill="#606060" class="colorizable-hair"/>

      <!-- HAT_BACK (8x8) at (56,8) - Volumen trasero -->
      <rect x="58" y="8" width="4" height="3" fill="#707070" class="colorizable-hair"/>
      <rect x="59" y="9" width="2" height="2" fill="#909090" class="colorizable-hair"/>
      <rect x="57" y="11" width="1" height="2" fill="#606060" class="colorizable-hair"/>
      <rect x="62" y="11" width="1" height="2" fill="#606060" class="colorizable-hair"/>
    </svg>
  `;
}
