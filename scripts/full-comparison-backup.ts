import sharp from 'sharp';

async function fullComparison() {
  const backup = await sharp('public/minecraft/backup/texture.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const showcase = await sharp('public/minecraft/hairstyle-showcase/08_long_wavy_romantic.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('=== COMPARACIÓN COMPLETA BACKUP VS SHOWCASE ===\n');

  // Regiones a comparar
  const regions = [
    { name: 'HEAD_TOP', x1: 8, y1: 0, x2: 16, y2: 8 },
    { name: 'HEAD_FRONT (cara)', x1: 8, y1: 8, x2: 16, y2: 16 },
    { name: 'HAT_TOP', x1: 40, y1: 0, x2: 48, y2: 8 },
    { name: 'HAT_BOTTOM', x1: 48, y1: 0, x2: 56, y2: 8 },
    { name: 'HAT_RIGHT', x1: 32, y1: 8, x2: 40, y2: 16 },
    { name: 'HAT_FRONT', x1: 40, y1: 8, x2: 48, y2: 16 },
    { name: 'HAT_LEFT', x1: 48, y1: 8, x2: 56, y2: 16 },
    { name: 'HAT_BACK', x1: 56, y1: 8, x2: 64, y2: 16 },
  ];

  for (const region of regions) {
    let diffs = 0;
    let total = (region.x2 - region.x1) * (region.y2 - region.y1);

    for (let y = region.y1; y < region.y2; y++) {
      for (let x = region.x1; x < region.x2; x++) {
        const idx = (y * 64 + x) * 4;

        const backupR = backup.data[idx];
        const backupG = backup.data[idx + 1];
        const backupB = backup.data[idx + 2];
        const backupA = backup.data[idx + 3];

        const showcaseR = showcase.data[idx];
        const showcaseG = showcase.data[idx + 1];
        const showcaseB = showcase.data[idx + 2];
        const showcaseA = showcase.data[idx + 3];

        if (backupR !== showcaseR || backupG !== showcaseG ||
            backupB !== showcaseB || backupA !== showcaseA) {
          diffs++;
        }
      }
    }

    const icon = diffs === 0 ? '✅' : '❌';
    const pct = ((diffs / total) * 100).toFixed(1);
    console.log(`${icon} ${region.name.padEnd(20)} ${diffs}/${total} diferentes (${pct}%)`);
  }

  // Análisis detallado de HEAD_FRONT (cara)
  console.log('\n=== ANÁLISIS DETALLADO: HEAD_FRONT (Cara) ===\n');

  const faceDiffs: Array<{x: number, y: number, backup: string, showcase: string}> = [];

  for (let y = 8; y < 16; y++) {
    for (let x = 8; x < 16; x++) {
      const idx = (y * 64 + x) * 4;

      const backupColor = {
        r: backup.data[idx],
        g: backup.data[idx + 1],
        b: backup.data[idx + 2],
        a: backup.data[idx + 3],
      };

      const showcaseColor = {
        r: showcase.data[idx],
        g: showcase.data[idx + 1],
        b: showcase.data[idx + 2],
        a: showcase.data[idx + 3],
      };

      if (backupColor.r !== showcaseColor.r ||
          backupColor.g !== showcaseColor.g ||
          backupColor.b !== showcaseColor.b ||
          backupColor.a !== showcaseColor.a) {

        const backupHex = `#${backupColor.r.toString(16).padStart(2,'0')}${backupColor.g.toString(16).padStart(2,'0')}${backupColor.b.toString(16).padStart(2,'0')}`;
        const showcaseHex = `#${showcaseColor.r.toString(16).padStart(2,'0')}${showcaseColor.g.toString(16).padStart(2,'0')}${showcaseColor.b.toString(16).padStart(2,'0')}`;

        faceDiffs.push({ x, y, backup: backupHex, showcase: showcaseHex });
      }
    }
  }

  if (faceDiffs.length > 0) {
    console.log('Diferencias encontradas en HEAD_FRONT:');
    faceDiffs.forEach(d => {
      const localX = d.x - 8;
      const localY = d.y - 8;
      console.log(`  (${d.x},${d.y}) local(${localX},${localY}): ${d.backup} → ${d.showcase}`);
    });
  } else {
    console.log('✅ HEAD_FRONT es IDÉNTICO');
  }
}

fullComparison().catch(console.error);
