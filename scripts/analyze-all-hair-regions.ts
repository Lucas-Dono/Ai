import sharp from 'sharp';

async function analyzeAllRegions() {
  const backup = await sharp('public/minecraft/backup/texture.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('=== ANÁLISIS DE TODAS LAS REGIONES DE PELO ===\n');

  const regions = [
    { name: 'HAT_TOP', x1: 40, y1: 0, x2: 48, y2: 8 },
    { name: 'HAT_RIGHT', x1: 32, y1: 8, x2: 40, y2: 16 },
    { name: 'HAT_FRONT', x1: 40, y1: 8, x2: 48, y2: 16 },
    { name: 'HAT_LEFT', x1: 48, y1: 8, x2: 56, y2: 16 },
    { name: 'HAT_BACK', x1: 56, y1: 8, x2: 64, y2: 16 },
  ];

  for (const region of regions) {
    console.log(`\n=== ${region.name} ===\n`);

    const pixels: Array<{ x: number; y: number; color: string; brightness: number }> = [];

    for (let y = region.y1; y < region.y2; y++) {
      for (let x = region.x1; x < region.x2; x++) {
        const idx = (y * 64 + x) * 4;
        const r = backup.data[idx];
        const g = backup.data[idx + 1];
        const b = backup.data[idx + 2];
        const a = backup.data[idx + 3];

        if (a > 0) {
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          const brightness = (r + g + b) / 3;
          pixels.push({ x, y, color: hex, brightness });
        }
      }
    }

    console.log(`Total píxeles: ${pixels.length}/64`);

    // Contar colores
    const colorGroups = new Map<string, number>();
    pixels.forEach(p => {
      colorGroups.set(p.color, (colorGroups.get(p.color) || 0) + 1);
    });

    console.log('\nDistribución de colores:');
    [...colorGroups.entries()]
      .sort((a, b) => {
        const brightnessA = pixels.find(p => p.color === a[0])!.brightness;
        const brightnessB = pixels.find(p => p.color === b[0])!.brightness;
        return brightnessB - brightnessA;
      })
      .forEach(([color, count]) => {
        const brightness = pixels.find(p => p.color === color)!.brightness;
        console.log(`  ${color} (brillo: ${brightness.toFixed(1)}) - ${count} píxeles`);
      });

    // Sugerir highlights (solo píxeles con brillo >= 70)
    const highlights = pixels.filter(p => p.brightness >= 70);
    const percentage = (highlights.length / pixels.length) * 100;
    console.log(`\nHighlights sugeridos: ${highlights.length}/${pixels.length} (${percentage.toFixed(1)}%)`);

    // Mostrar distribución por fila/columna
    if (region.name.includes('TOP')) {
      console.log('\nDistribución por fila (de arriba a abajo):');
      for (let y = region.y1; y < region.y2; y++) {
        const rowPixels = pixels.filter(p => p.y === y).length;
        const rowHighlights = highlights.filter(p => p.y === y).length;
        console.log(`  y=${y}: ${rowPixels} píxeles (${rowHighlights} highlights)`);
      }
    } else {
      console.log('\nDistribución por fila:');
      for (let y = region.y1; y < region.y2; y++) {
        const rowPixels = pixels.filter(p => p.y === y).length;
        const rowHighlights = highlights.filter(p => p.y === y).length;
        console.log(`  y=${y}: ${rowPixels} píxeles (${rowHighlights} highlights)`);
      }
    }
  }
}

analyzeAllRegions().catch(console.error);
