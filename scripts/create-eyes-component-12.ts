/**
 * Crea componente de ojos para skin messy bun (12)
 * Basado en análisis del backup:
 * y4: #f8b796 #000000 #000000 #faccae #faccae #000000 #000000 #fbb79d
 * y5: #000000 #a6a6a6 #5f432b #faccae #faccae #5f432b #a6a6a6 #000000
 * y6: #000000 #ffffff #b57640 #faccae #faccae #b57640 #ffffff #000000
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function createEyesComponent() {
  const outputPath = path.join(process.cwd(), 'public/minecraft/components/eyes/eyes_cute_12.png');

  console.log('Creando componente de ojos cute (skin messy bun 12)...\n');

  // Canvas 8x8 transparente
  const data = Buffer.alloc(8 * 8 * 4, 0);

  const setPixel = (x: number, y: number, r: number, g: number, b: number, a: number = 255) => {
    const idx = (y * 8 + x) * 4;
    data[idx] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
    data[idx + 3] = a;
  };

  // y=4: contorno superior de ojos
  // x=0,7 = piel (no dibujar)
  setPixel(1, 4, 0x00, 0x00, 0x00); // Negro
  setPixel(2, 4, 0x00, 0x00, 0x00); // Negro
  // x=3,4 = piel (no dibujar)
  setPixel(5, 4, 0x00, 0x00, 0x00); // Negro
  setPixel(6, 4, 0x00, 0x00, 0x00); // Negro

  // y=5: ojos con gris e iris
  setPixel(0, 5, 0x00, 0x00, 0x00); // Negro (contorno)
  setPixel(1, 5, 0xa6, 0xa6, 0xa6); // Gris claro (blanco del ojo)
  setPixel(2, 5, 0x5f, 0x43, 0x2b); // Iris marrón oscuro
  // x=3,4 = piel (no dibujar)
  setPixel(5, 5, 0x5f, 0x43, 0x2b); // Iris marrón oscuro
  setPixel(6, 5, 0xa6, 0xa6, 0xa6); // Gris claro
  setPixel(7, 5, 0x00, 0x00, 0x00); // Negro (contorno)

  // y=6: parte inferior de ojos
  setPixel(0, 6, 0x00, 0x00, 0x00); // Negro (contorno)
  setPixel(1, 6, 0xff, 0xff, 0xff); // Blanco puro
  setPixel(2, 6, 0xb5, 0x76, 0x40); // Iris marrón claro
  // x=3,4 = piel (no dibujar)
  setPixel(5, 6, 0xb5, 0x76, 0x40); // Iris marrón claro
  setPixel(6, 6, 0xff, 0xff, 0xff); // Blanco puro
  setPixel(7, 6, 0x00, 0x00, 0x00); // Negro (contorno)

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(data, {
    raw: { width: 8, height: 8, channels: 4 }
  })
    .png()
    .toFile(outputPath);

  console.log(`✓ Componente guardado en: ${outputPath}`);
}

createEyesComponent().catch(console.error);
