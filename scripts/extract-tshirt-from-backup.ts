import sharp from 'sharp';

/**
 * Extrae el diseño de remera de backup/texture.png y genera código SVG
 * para crear t_shirt_03
 */

async function extractTShirtFromBackup() {
  console.log('📖 Leyendo backup/texture.png...\n');

  const backup = await sharp('public/minecraft/backup/texture.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('Generando código para generateTShirt_03():\n');
  console.log('export function generateTShirt_03(): string {');
  console.log('  return `');
  console.log('    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">');

  // Regiones de la remera en la texture
  const regions = [
    { name: 'BODY_RIGHT', x1: 16, y1: 20, x2: 20, y2: 32, comment: '(4x12) at (16,20)' },
    { name: 'BODY_FRONT', x1: 20, y1: 20, x2: 28, y2: 32, comment: '(8x12) at (20,20)' },
    { name: 'BODY_LEFT', x1: 28, y1: 20, x2: 32, y2: 32, comment: '(4x12) at (28,20)' },
    { name: 'BODY_BACK', x1: 32, y1: 20, x2: 40, y2: 32, comment: '(8x12) at (32,20)' },

    // Brazo derecho
    { name: 'ARM_R_TOP', x1: 44, y1: 16, x2: 48, y2: 20, comment: '(4x4) at (44,16)' },
    { name: 'ARM_R_BOTTOM', x1: 48, y1: 16, x2: 52, y2: 20, comment: '(4x4) at (48,16)' },
    { name: 'ARM_R_RIGHT', x1: 40, y1: 20, x2: 44, y2: 32, comment: '(4x12) at (40,20)' },
    { name: 'ARM_R_FRONT', x1: 44, y1: 20, x2: 48, y2: 32, comment: '(4x12) at (44,20)' },
    { name: 'ARM_R_LEFT', x1: 48, y1: 20, x2: 52, y2: 32, comment: '(4x12) at (48,20)' },
    { name: 'ARM_R_BACK', x1: 52, y1: 20, x2: 56, y2: 32, comment: '(4x12) at (52,20)' },

    // Brazo izquierdo
    { name: 'ARM_L_TOP', x1: 36, y1: 48, x2: 40, y2: 52, comment: '(4x4) at (36,48)' },
    { name: 'ARM_L_BOTTOM', x1: 40, y1: 48, x2: 44, y2: 52, comment: '(4x4) at (40,48)' },
    { name: 'ARM_L_RIGHT', x1: 32, y1: 52, x2: 36, y2: 64, comment: '(4x12) at (32,52)' },
    { name: 'ARM_L_FRONT', x1: 36, y1: 52, x2: 40, y2: 64, comment: '(4x12) at (36,52)' },
    { name: 'ARM_L_LEFT', x1: 40, y1: 52, x2: 44, y2: 64, comment: '(4x12) at (40,52)' },
    { name: 'ARM_L_BACK', x1: 44, y1: 52, x2: 48, y2: 64, comment: '(4x12) at (44,52)' },
  ];

  for (const region of regions) {
    console.log(`\n      <!-- ${region.name} ${region.comment} -->`);

    const pixels: Array<{x: number, y: number, color: string}> = [];

    // Extraer todos los píxeles de esta región
    for (let y = region.y1; y < region.y2; y++) {
      for (let x = region.x1; x < region.x2; x++) {
        const idx = (y * 64 + x) * 4;
        const r = backup.data[idx];
        const g = backup.data[idx + 1];
        const b = backup.data[idx + 2];
        const a = backup.data[idx + 3];

        if (a > 0) {
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          pixels.push({ x, y, color: hex });
        }
      }
    }

    // Analizar si los píxeles son uniformes o variados
    const uniqueColors = new Set(pixels.map(p => p.color));

    if (uniqueColors.size === 1 && pixels.length > 0) {
      // Región de color uniforme - usar un solo rect
      const color = pixels[0].color;
      const width = region.x2 - region.x1;
      const height = region.y2 - region.y1;

      // Determinar si es colorizable
      const isGray = isGrayColor(color);
      const cssClass = isGray ? ' class="colorizable-clothing"' : '';

      console.log(`      <rect x="${region.x1}" y="${region.y1}" width="${width}" height="${height}" fill="${color}"${cssClass}/>`);
    } else {
      // Región con múltiples colores - generar pixel por pixel
      for (const pixel of pixels) {
        // Determinar si es colorizable
        const isGray = isGrayColor(pixel.color);
        const cssClass = isGray ? ' class="colorizable-clothing"' : '';

        console.log(`      <rect x="${pixel.x}" y="${pixel.y}" width="1" height="1" fill="${pixel.color}"${cssClass}/>`);
      }
    }
  }

  console.log('    </svg>');
  console.log('  `;');
  console.log('}');

  console.log('\n✅ Código generado. Copia este código a component-generator.ts');
  console.log('📝 No olvides agregarlo al COMPONENT_CATALOG como t_shirt_03');
}

function isGrayColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Si R ≈ G ≈ B (diferencia < 10), es gris
  return Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(r - b) < 10;
}

extractTShirtFromBackup();
