import sharp from 'sharp';

async function regenerateFromBackup() {
  const backup = await sharp('public/minecraft/backup/texture.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('// Generando código desde backup editado por el usuario\n');

  const regions = [
    {
      name: 'TOP',
      headRegion: { x1: 8, y1: 0, x2: 16, y2: 8 },
      hatRegion: { x1: 40, y1: 0, x2: 48, y2: 8 }
    },
    {
      name: 'RIGHT',
      headRegion: { x1: 0, y1: 8, x2: 8, y2: 16 },
      hatRegion: { x1: 32, y1: 8, x2: 40, y2: 16 }
    },
    {
      name: 'FRONT',
      headRegion: { x1: 8, y1: 8, x2: 16, y2: 16 },
      hatRegion: { x1: 40, y1: 8, x2: 48, y2: 16 }
    },
    {
      name: 'LEFT',
      headRegion: { x1: 16, y1: 8, x2: 24, y2: 16 },
      hatRegion: { x1: 48, y1: 8, x2: 56, y2: 16 }
    },
    {
      name: 'BACK',
      headRegion: { x1: 24, y1: 8, x2: 32, y2: 16 },
      hatRegion: { x1: 56, y1: 8, x2: 64, y2: 16 }
    }
  ];

  for (const region of regions) {
    console.log(`\n      <!-- HEAD_${region.name} (${region.headRegion.x1},${region.headRegion.y1}) - Desde backup del usuario -->`);

    // Generar HEAD desde el backup
    const headPixels: Array<{ x: number; y: number; color: string }> = [];
    for (let y = region.headRegion.y1; y < region.headRegion.y2; y++) {
      for (let x = region.headRegion.x1; x < region.headRegion.x2; x++) {
        const idx = (y * 64 + x) * 4;
        const r = backup.data[idx];
        const g = backup.data[idx + 1];
        const b = backup.data[idx + 2];
        const a = backup.data[idx + 3];

        if (a > 0) {
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          headPixels.push({ x, y, color: hex });
        }
      }
    }

    // Imprimir HEAD píxeles
    for (let y = region.headRegion.y1; y < region.headRegion.y2; y++) {
      const rowPixels = headPixels.filter(p => p.y === y);
      if (rowPixels.length > 0) {
        rowPixels.forEach(p => {
          console.log(`      <rect x="${p.x}" y="${p.y}" width="1" height="1" fill="${p.color}" class="colorizable-hair"/>`);
        });
      }
    }

    // Generar HAT desde el backup
    console.log(`\n      <!-- HAT_${region.name} (${region.hatRegion.x1},${region.hatRegion.y1}) - Highlights editados por usuario -->`);

    const hatPixels: Array<{ x: number; y: number; color: string }> = [];
    for (let y = region.hatRegion.y1; y < region.hatRegion.y2; y++) {
      for (let x = region.hatRegion.x1; x < region.hatRegion.x2; x++) {
        const idx = (y * 64 + x) * 4;
        const r = backup.data[idx];
        const g = backup.data[idx + 1];
        const b = backup.data[idx + 2];
        const a = backup.data[idx + 3];

        if (a > 0) {
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          hatPixels.push({ x, y, color: hex });
        }
      }
    }

    // Imprimir HAT píxeles
    if (hatPixels.length > 0) {
      for (let y = region.hatRegion.y1; y < region.hatRegion.y2; y++) {
        const rowPixels = hatPixels.filter(p => p.y === y);
        if (rowPixels.length > 0) {
          rowPixels.forEach(p => {
            console.log(`      <rect x="${p.x}" y="${p.y}" width="1" height="1" fill="${p.color}" class="colorizable-hair"/>`);
          });
        }
      }
    } else {
      console.log(`      <!-- Sin highlights en esta región -->`);
    }
  }
}

regenerateFromBackup().catch(console.error);
