import sharp from 'sharp';

// Regiones de HEAD y HAT según component-generator.ts
const REGIONS = {
  // CABEZA (Head)
  HEAD_FRONT: { x: 8, y: 8, width: 8, height: 8 },
  HEAD_RIGHT: { x: 0, y: 8, width: 8, height: 8 },
  HEAD_LEFT: { x: 16, y: 8, width: 8, height: 8 },
  HEAD_TOP: { x: 8, y: 0, width: 8, height: 8 },
  HEAD_BOTTOM: { x: 16, y: 0, width: 8, height: 8 },
  HEAD_BACK: { x: 24, y: 8, width: 8, height: 8 },

  // OVERLAY CABEZA (Hat/Hair)
  HAT_TOP: { x: 40, y: 0, width: 8, height: 8 },
  HAT_FRONT: { x: 40, y: 8, width: 8, height: 8 },
  HAT_RIGHT: { x: 32, y: 8, width: 8, height: 8 },
  HAT_LEFT: { x: 48, y: 8, width: 8, height: 8 },
  HAT_BACK: { x: 56, y: 8, width: 8, height: 8 },
  HAT_BOTTOM: { x: 48, y: 0, width: 8, height: 8 },
};

async function extractRegion(
  imageData: sharp.OutputInfo & { data: Buffer },
  region: { x: number; y: number; width: number; height: number },
  regionName: string
) {
  const pixels: Array<{ x: number; y: number; color: string; alpha: number }> = [];

  for (let y = region.y; y < region.y + region.height; y++) {
    for (let x = region.x; x < region.x + region.width; x++) {
      const idx = (y * 64 + x) * 4;
      const r = imageData.data[idx];
      const g = imageData.data[idx + 1];
      const b = imageData.data[idx + 2];
      const a = imageData.data[idx + 3];

      if (a > 0) {
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        pixels.push({ x, y, color: hex, alpha: a });
      }
    }
  }

  // Agrupar por fila
  const rows: Record<number, typeof pixels> = {};
  pixels.forEach(p => {
    if (!rows[p.y]) rows[p.y] = [];
    rows[p.y].push(p);
  });

  console.log(`\n${'='.repeat(80)}`);
  console.log(`${regionName} - (${region.x},${region.y}) ${region.width}x${region.height}`);
  console.log('='.repeat(80));
  console.log(`\n<!-- ${regionName} (${region.width}x${region.height}) at (${region.x},${region.y}) -->`);

  // Mostrar píxeles en formato SVG rect
  Object.keys(rows)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(y => {
      rows[parseInt(y)]
        .sort((a, b) => a.x - b.x)
        .forEach(p => {
          console.log(`<rect x="${p.x}" y="${p.y}" width="1" height="1" fill="${p.color}" class="colorizable-skin"/>`);
        });
    });

  // Estadísticas
  const totalPixels = region.width * region.height;
  const uniqueColors = new Set(pixels.map(p => p.color));
  console.log(`\n<!-- Total: ${pixels.length}/${totalPixels} píxeles | Transparentes: ${totalPixels - pixels.length} | Colores: ${uniqueColors.size} -->`);

  if (uniqueColors.size <= 10) {
    console.log(`<!-- Paleta: ${Array.from(uniqueColors).join(', ')} -->`);
  }
}

async function extractAllRegions() {
  console.log('EXTRAYENDO REGIONES HEAD Y HAT DE backup/texture.png\n');

  const backup = await sharp('public/minecraft/backup/texture.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('\n\n');
  console.log('█'.repeat(80));
  console.log('█' + ' '.repeat(30) + 'REGIONES HEAD' + ' '.repeat(35) + '█');
  console.log('█'.repeat(80));

  // Extraer todas las regiones HEAD
  for (const [name, region] of Object.entries(REGIONS)) {
    if (name.startsWith('HEAD_')) {
      await extractRegion(backup, region, name);
    }
  }

  console.log('\n\n');
  console.log('█'.repeat(80));
  console.log('█' + ' '.repeat(30) + 'REGIONES HAT' + ' '.repeat(36) + '█');
  console.log('█'.repeat(80));

  // Extraer todas las regiones HAT
  for (const [name, region] of Object.entries(REGIONS)) {
    if (name.startsWith('HAT_')) {
      await extractRegion(backup, region, name);
    }
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('EXTRACCIÓN COMPLETA');
  console.log('='.repeat(80));
}

extractAllRegions().catch(console.error);
