import sharp from 'sharp';

async function extractPixels() {
  const backup = await sharp('public/minecraft/backup/texture.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('=== BACKUP ORIGINAL - HAT_FRONT (40,8) - (47,15) ===\n');

  // Extraer región HAT_FRONT
  const pixels: Array<{ x: number; y: number; color: string; alpha: number }> = [];

  for (let y = 8; y < 16; y++) {
    for (let x = 40; x < 48; x++) {
      const idx = (y * 64 + x) * 4;
      const r = backup.data[idx];
      const g = backup.data[idx + 1];
      const b = backup.data[idx + 2];
      const a = backup.data[idx + 3];

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

  // Mostrar píxeles agrupados
  console.log('Píxeles no transparentes en HAT_FRONT:\n');
  Object.keys(rows).sort((a, b) => parseInt(a) - parseInt(b)).forEach(y => {
    console.log(`y=${y}:`);
    rows[parseInt(y)].forEach(p => {
      console.log(`  <rect x="${p.x}" y="${p.y}" width="1" height="1" fill="${p.color}" class="colorizable-hair"/>`);
    });
    console.log();
  });

  // También generar el código SVG completo
  console.log('\n=== CÓDIGO SVG PARA GENERADOR ===\n');
  console.log('<!-- HAT_FRONT (8x8) at (40,8) - Cara frontal -->');
  Object.keys(rows).sort((a, b) => parseInt(a) - parseInt(b)).forEach(y => {
    rows[parseInt(y)].forEach(p => {
      console.log(`<rect x="${p.x}" y="${p.y}" width="1" height="1" fill="${p.color}" class="colorizable-hair"/>`);
    });
  });

  // Estadísticas
  console.log(`\n\nTotal píxeles en HAT_FRONT: ${pixels.length}/64`);
  console.log(`Píxeles transparentes: ${64 - pixels.length}`);

  // Colores únicos
  const uniqueColors = new Set(pixels.map(p => p.color));
  console.log(`\nColores únicos: ${uniqueColors.size}`);
  uniqueColors.forEach(c => console.log(`  ${c}`));
}

extractPixels().catch(console.error);
