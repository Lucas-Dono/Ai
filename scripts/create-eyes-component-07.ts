/**
 * Crea un componente de ojos simple basado en el análisis del backup
 * Ojos: 2 píxeles negros (#292929) en y=4, x=1-2 y x=5-6
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function createEyesComponent() {
  const outputPath = path.join(process.cwd(), 'public/minecraft/components/eyes/eyes_simple_dark_01.png');

  console.log('Creando componente de ojos simple...\n');

  // Canvas 8x8 transparente
  const data = Buffer.alloc(8 * 8 * 4, 0);

  // Helper para setear pixel
  const setPixel = (x: number, y: number, r: number, g: number, b: number, a: number = 255) => {
    const idx = (y * 8 + x) * 4;
    data[idx] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
    data[idx + 3] = a;
  };

  // Ojos del backup - completamente oscuros, sin blanco
  // Basado en el análisis exacto del backup:
  // y=4: #292929 en x=1,2 (ojo izq) y x=5,6 (ojo der)
  // y=5: #303030 en x=1,6 (esquinas) y #292929 en x=2,5 (pupilas inferiores)

  // y=4: fila superior de ojos
  setPixel(1, 4, 0x29, 0x29, 0x29); // Ojo izquierdo
  setPixel(2, 4, 0x29, 0x29, 0x29);
  setPixel(5, 4, 0x29, 0x29, 0x29); // Ojo derecho
  setPixel(6, 4, 0x29, 0x29, 0x29);

  // y=5: fila inferior de ojos (más expresivos)
  setPixel(1, 5, 0x30, 0x30, 0x30); // Esquina izq
  setPixel(2, 5, 0x29, 0x29, 0x29); // Pupila izq inferior
  setPixel(5, 5, 0x29, 0x29, 0x29); // Pupila der inferior
  setPixel(6, 5, 0x30, 0x30, 0x30); // Esquina der

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(data, {
    raw: { width: 8, height: 8, channels: 4 }
  })
    .png()
    .toFile(outputPath);

  console.log(`✓ Componente guardado en: ${outputPath}`);
}

createEyesComponent().catch(console.error);
