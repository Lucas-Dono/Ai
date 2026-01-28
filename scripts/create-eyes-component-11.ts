/**
 * Crea componente de ojos expresivos para skin 11
 * Basado en análisis del backup:
 * y4: #3c3c3c #000000 #000000 #ffe2bd #ffe2bd #000000 #000000 #484848
 * y5: #000000 #f0f0f0 #321600 #ffe2bd #ffe2bd #321600 #f0f0f0 #000000
 * y6: #242424 #ffffff #461f00 #ffe2bd #ffe2bd #461f00 #ffffff #303030
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function createEyesComponent() {
  const outputPath = path.join(process.cwd(), 'public/minecraft/components/eyes/eyes_expressive_11.png');

  console.log('Creando componente de ojos expresivos (skin 11)...\n');

  // Canvas 8x8 transparente
  const data = Buffer.alloc(8 * 8 * 4, 0);

  const setPixel = (x: number, y: number, r: number, g: number, b: number, a: number = 255) => {
    const idx = (y * 8 + x) * 4;
    data[idx] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
    data[idx + 3] = a;
  };

  // y=4: contorno superior de ojos (negro alrededor, piel en centro)
  setPixel(0, 4, 0x3c, 0x3c, 0x3c); // Gris oscuro
  setPixel(1, 4, 0x00, 0x00, 0x00); // Negro
  setPixel(2, 4, 0x00, 0x00, 0x00); // Negro
  // x=3,4 = piel (no dibujar, transparente)
  setPixel(5, 4, 0x00, 0x00, 0x00); // Negro
  setPixel(6, 4, 0x00, 0x00, 0x00); // Negro
  setPixel(7, 4, 0x48, 0x48, 0x48); // Gris

  // y=5: ojos con blanco e iris
  setPixel(0, 5, 0x00, 0x00, 0x00); // Negro (contorno)
  setPixel(1, 5, 0xf0, 0xf0, 0xf0); // Blanco del ojo
  setPixel(2, 5, 0x32, 0x16, 0x00); // Iris marrón
  // x=3,4 = piel (no dibujar)
  setPixel(5, 5, 0x32, 0x16, 0x00); // Iris marrón
  setPixel(6, 5, 0xf0, 0xf0, 0xf0); // Blanco del ojo
  setPixel(7, 5, 0x00, 0x00, 0x00); // Negro (contorno)

  // y=6: parte inferior de ojos
  setPixel(0, 6, 0x24, 0x24, 0x24); // Gris oscuro (sombra)
  setPixel(1, 6, 0xff, 0xff, 0xff); // Blanco puro
  setPixel(2, 6, 0x46, 0x1f, 0x00); // Iris marrón más claro
  // x=3,4 = piel (no dibujar)
  setPixel(5, 6, 0x46, 0x1f, 0x00); // Iris marrón más claro
  setPixel(6, 6, 0xff, 0xff, 0xff); // Blanco puro
  setPixel(7, 6, 0x30, 0x30, 0x30); // Gris (sombra)

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(data, {
    raw: { width: 8, height: 8, channels: 4 }
  })
    .png()
    .toFile(outputPath);

  console.log(`✓ Componente guardado en: ${outputPath}`);
}

createEyesComponent().catch(console.error);
