import sharp from 'sharp';

async function generateAllDualLayers() {
  const backup = await sharp('public/minecraft/backup/texture.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  function darkenColor(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const newR = Math.floor(r * 0.7);
    const newG = Math.floor(g * 0.7);
    const newB = Math.floor(b * 0.7);
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  const regions = [
    {
      name: 'TOP',
      hatRegion: { x1: 40, y1: 0, x2: 48, y2: 8 },
      headRegion: { x1: 8, y1: 0, x2: 16, y2: 8 },
      brightnessCutoff: 70
    },
    {
      name: 'RIGHT',
      hatRegion: { x1: 32, y1: 8, x2: 40, y2: 16 },
      headRegion: { x1: 0, y1: 8, x2: 8, y2: 16 },
      brightnessCutoff: 70
    },
    {
      name: 'LEFT',
      hatRegion: { x1: 48, y1: 8, x2: 56, y2: 16 },
      headRegion: { x1: 16, y1: 8, x2: 24, y2: 16 },
      brightnessCutoff: 70
    },
    {
      name: 'BACK',
      hatRegion: { x1: 56, y1: 8, x2: 64, y2: 16 },
      headRegion: { x1: 24, y1: 8, x2: 32, y2: 16 },
      brightnessCutoff: 70
    },
  ];

  for (const region of regions) {
    console.log(`\n=== ${region.name} ===\n`);

    // Extraer píxeles de HAT
    const hatPixels: Array<{ x: number; y: number; color: string; brightness: number }> = [];

    for (let y = region.hatRegion.y1; y < region.hatRegion.y2; y++) {
      for (let x = region.hatRegion.x1; x < region.hatRegion.x2; x++) {
        const idx = (y * 64 + x) * 4;
        const r = backup.data[idx];
        const g = backup.data[idx + 1];
        const b = backup.data[idx + 2];
        const a = backup.data[idx + 3];

        if (a > 0) {
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          const brightness = (r + g + b) / 3;
          hatPixels.push({ x, y, color: hex, brightness });
        }
      }
    }

    // Generar código HEAD (todos los píxeles, oscurecidos)
    console.log(`<!-- HEAD_${region.name} (${region.headRegion.x1},${region.headRegion.y1}) - Base oscurecida -->`);
    for (let y = region.hatRegion.y1; y < region.hatRegion.y2; y++) {
      const rowPixels = hatPixels.filter(p => p.y === y);
      if (rowPixels.length > 0) {
        rowPixels.forEach(p => {
          const headX = p.x - (region.hatRegion.x1 - region.headRegion.x1);
          const darkColor = darkenColor(p.color);
          console.log(`<rect x="${headX}" y="${p.y}" width="1" height="1" fill="${darkColor}" class="colorizable-hair"/>`);
        });
      }
    }

    // Generar código HAT (solo highlights)
    const highlights = hatPixels.filter(p => p.brightness >= region.brightnessCutoff);
    console.log(`\n<!-- HAT_${region.name} (${region.hatRegion.x1},${region.hatRegion.y1}) - Solo highlights (${highlights.length}/${hatPixels.length}) -->`);
    for (let y = region.hatRegion.y1; y < region.hatRegion.y2; y++) {
      const rowHighlights = highlights.filter(p => p.y === y);
      if (rowHighlights.length > 0) {
        rowHighlights.forEach(p => {
          console.log(`<rect x="${p.x}" y="${p.y}" width="1" height="1" fill="${p.color}" class="colorizable-hair"/>`);
        });
      }
    }

    console.log(`\nTotal: ${hatPixels.length} píxeles → ${hatPixels.length} HEAD + ${highlights.length} HAT`);
  }
}

generateAllDualLayers().catch(console.error);
