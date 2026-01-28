/**
 * Crea ojos naturales para la skin gótica 14
 * Ojos claros/grises con aspecto humano sobre piel pálida
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// Los ojos van en un canvas de 8x8 (HEAD_FRONT completo)
// pero solo dibujamos en la zona de ojos (y=4-5 aproximadamente)
const WIDTH = 8;
const HEIGHT = 8;

// Colores para piel pálida gótica
const SKIN = {
  base: { r: 0xf9, g: 0xe7, b: 0xe0 },      // #f9e7e0
  shadow: { r: 0xfa, g: 0xda, b: 0xd4 },    // #fadad4
  highlight: { r: 0xff, g: 0xff, b: 0xff }, // #ffffff
};

// Colores para ojos grises/claros góticos
const EYE = {
  white: { r: 0xf0, g: 0xf0, b: 0xf0 },     // Blanco del ojo (ligeramente gris)
  iris: { r: 0x70, g: 0x80, b: 0x90 },      // Iris gris-azulado
  pupil: { r: 0x1a, g: 0x1a, b: 0x1a },     // Pupila negra
  outline: { r: 0x40, g: 0x40, b: 0x40 },   // Contorno oscuro (eyeliner gótico)
};

async function createEyesGoth14() {
  const outputPath = path.join(process.cwd(), 'public/minecraft/components/eyes/eyes_goth_14.png');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  CREANDO OJOS GÓTICOS NATURALES');
  console.log('═══════════════════════════════════════════════════════\n');

  const data = Buffer.alloc(WIDTH * HEIGHT * 4, 0);

  const setPixel = (x: number, y: number, r: number, g: number, b: number, a: number = 255) => {
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
    const idx = (y * WIDTH + x) * 4;
    data[idx] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
    data[idx + 3] = a;
  };

  // Rellenar todo con piel base (transparente donde no hay nada)
  // Solo dibujamos la zona de la cara (y=3 a y=7)
  for (let y = 3; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      // Piel base en toda la zona facial
      let color = SKIN.base;

      // Sombras en los bordes
      if (x === 0 || x === 7) {
        color = SKIN.shadow;
      }
      // Highlight en el centro
      if (x >= 3 && x <= 4 && y === 7) {
        color = SKIN.highlight;
      }

      setPixel(x, y, color.r, color.g, color.b);
    }
  }

  // ===== OJO IZQUIERDO (x=1-2, y=4-5) =====
  // Fila y=4: parte superior del ojo
  setPixel(1, 4, EYE.outline.r, EYE.outline.g, EYE.outline.b); // Contorno superior izq
  setPixel(2, 4, EYE.outline.r, EYE.outline.g, EYE.outline.b); // Contorno superior der

  // Fila y=5: ojo propiamente
  setPixel(1, 5, EYE.white.r, EYE.white.g, EYE.white.b);       // Blanco
  setPixel(2, 5, EYE.iris.r, EYE.iris.g, EYE.iris.b);          // Iris con pupila

  // ===== OJO DERECHO (x=5-6, y=4-5) =====
  // Fila y=4: parte superior del ojo
  setPixel(5, 4, EYE.outline.r, EYE.outline.g, EYE.outline.b); // Contorno superior izq
  setPixel(6, 4, EYE.outline.r, EYE.outline.g, EYE.outline.b); // Contorno superior der

  // Fila y=5: ojo propiamente
  setPixel(5, 5, EYE.iris.r, EYE.iris.g, EYE.iris.b);          // Iris con pupila
  setPixel(6, 5, EYE.white.r, EYE.white.g, EYE.white.b);       // Blanco

  // ===== NARIZ sutil (x=3-4, y=5-6) =====
  setPixel(3, 6, SKIN.shadow.r, SKIN.shadow.g, SKIN.shadow.b); // Sombra nariz izq
  setPixel(4, 6, SKIN.shadow.r, SKIN.shadow.g, SKIN.shadow.b); // Sombra nariz der

  // ===== BOCA pequeña (x=3-4, y=7) =====
  // Boca neutral/seria para look gótico
  setPixel(3, 7, 0xc0, 0x90, 0x90); // Labio izq (rosa pálido)
  setPixel(4, 7, 0xc0, 0x90, 0x90); // Labio der (rosa pálido)

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(data, {
    raw: { width: WIDTH, height: HEIGHT, channels: 4 }
  })
    .png()
    .toFile(outputPath);

  console.log(`✓ Guardado en: ${outputPath}`);
  console.log('\n📝 Características de los ojos:');
  console.log('   - Ojos grises-azulados (estilo gótico)');
  console.log('   - Contorno oscuro (eyeliner sutil)');
  console.log('   - Piel pálida circundante');
  console.log('   - Boca neutral/seria');
  console.log('\n═══════════════════════════════════════════════════════\n');
}

createEyesGoth14().catch(console.error);
