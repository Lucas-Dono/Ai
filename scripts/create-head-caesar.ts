/**
 * Crea un head_base con pelo Caesar (rapado) pintado directamente
 * Sin capa overlay - todo en la capa base HEAD
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SKIN_WIDTH = 64;
const SKIN_HEIGHT = 64;

// Regiones de la cabeza en UV de Minecraft
const HEAD_REGIONS = {
  HEAD_TOP: { x: 8, y: 0, width: 8, height: 8 },
  HEAD_BOTTOM: { x: 16, y: 0, width: 8, height: 8 },
  HEAD_FRONT: { x: 8, y: 8, width: 8, height: 8 },
  HEAD_RIGHT: { x: 0, y: 8, width: 8, height: 8 },
  HEAD_LEFT: { x: 16, y: 8, width: 8, height: 8 },
  HEAD_BACK: { x: 24, y: 8, width: 8, height: 8 },
};

// Colores de piel (tono medio)
const SKIN_COLORS = {
  base: { r: 0xe0, g: 0xac, b: 0x69 },      // #e0ac69 - tono medio
  shadow: { r: 0xc6, g: 0x86, b: 0x42 },    // #c68642 - sombra
  highlight: { r: 0xf0, g: 0xc1, b: 0x8a }, // #f0c18a - highlight
};

// Colores del pelo Caesar (castaño oscuro)
const HAIR_COLORS = {
  base: { r: 0x3b, g: 0x28, b: 0x20 },      // #3b2820 - castaño oscuro
  shadow: { r: 0x2a, g: 0x1a, b: 0x15 },    // #2a1a15 - sombra
  highlight: { r: 0x4a, g: 0x35, b: 0x2a }, // #4a352a - highlight
};

async function createHeadCaesar() {
  const outputPath = path.join(process.cwd(), 'public/minecraft/components/head_base/head_caesar_13.png');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  CREANDO HEAD_BASE CON PELO CAESAR (RAPADO)');
  console.log('═══════════════════════════════════════════════════════\n');

  const data = Buffer.alloc(SKIN_WIDTH * SKIN_HEIGHT * 4, 0);

  const setPixel = (x: number, y: number, r: number, g: number, b: number, a: number = 255) => {
    const idx = (y * SKIN_WIDTH + x) * 4;
    data[idx] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
    data[idx + 3] = a;
  };

  // Función para determinar si un píxel es pelo en cada región
  // IMPORTANTE: Los ojos están en HEAD_FRONT y=4-5, NO debemos cubrir esa zona
  const isHairPixel = (regionName: string, x: number, y: number): boolean => {
    switch (regionName) {
      case 'HEAD_TOP':
        // Todo el top es pelo (rapado)
        return true;

      case 'HEAD_FRONT':
        // Pelo SOLO en la frente (filas 0-2), línea del flequillo en y=3
        // Los ojos están en y=4-5, la boca en y=6-7
        if (y <= 1) return true;
        // Línea del flequillo más corta (solo bordes, no el centro)
        if (y === 2 && (x <= 1 || x >= 6)) return true;
        return false;

      case 'HEAD_RIGHT':
      case 'HEAD_LEFT':
        // Pelo en la parte superior de los lados (filas 0-3)
        // Dejando visible la zona de los ojos (y=4+)
        return y <= 3;

      case 'HEAD_BACK':
        // Pelo en toda la parte trasera excepto el cuello (filas 0-6)
        return y <= 6;

      case 'HEAD_BOTTOM':
        // Sin pelo en la parte inferior (barbilla)
        return false;

      default:
        return false;
    }
  };

  // Rellenar cada región de cabeza
  for (const [regionName, region] of Object.entries(HEAD_REGIONS)) {
    console.log(`   Procesando ${regionName}...`);

    for (let y = 0; y < region.height; y++) {
      for (let x = 0; x < region.width; x++) {
        const globalX = region.x + x;
        const globalY = region.y + y;

        if (isHairPixel(regionName, x, y)) {
          // Píxel de pelo
          let color = HAIR_COLORS.base;

          // Variación para textura de pelo rapado
          // Bordes más oscuros, centro más claro
          if (x === 0 || x === region.width - 1 || y === 0) {
            color = HAIR_COLORS.shadow;
          } else if ((x + y) % 3 === 0) {
            // Patrón de textura sutil
            color = HAIR_COLORS.highlight;
          }

          setPixel(globalX, globalY, color.r, color.g, color.b);
        } else {
          // Píxel de piel
          let color = SKIN_COLORS.base;

          // Bordes = sombra
          if (x === 0 || x === region.width - 1 || y === region.height - 1) {
            color = SKIN_COLORS.shadow;
          }
          // Centro = highlight
          else if (x >= 2 && x <= 5 && y >= 2 && y <= 5) {
            color = SKIN_COLORS.highlight;
          }

          setPixel(globalX, globalY, color.r, color.g, color.b);
        }
      }
    }
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(data, {
    raw: { width: SKIN_WIDTH, height: SKIN_HEIGHT, channels: 4 }
  })
    .png()
    .toFile(outputPath);

  console.log(`\n✓ Guardado en: ${outputPath}`);
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  ✨ HEAD CAESAR CREADO');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('📝 Características del corte Caesar:');
  console.log('   - Pelo muy corto/rapado pintado en capa HEAD');
  console.log('   - Sin capa overlay (HAT vacío)');
  console.log('   - Línea frontal recta característica');
  console.log('   - Textura sutil para simular pelo corto\n');
}

createHeadCaesar().catch(console.error);
