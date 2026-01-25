import sharp from 'sharp';

async function analyzeHairLayers() {
  const backup = await sharp('public/minecraft/backup/texture.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('=== ANÁLISIS DE COLORES EN HAT_FRONT (pelo) ===\n');

  const hairPixels: Array<{ x: number; y: number; color: string; brightness: number }> = [];

  for (let y = 8; y < 16; y++) {
    for (let x = 40; x < 48; x++) {
      const idx = (y * 64 + x) * 4;
      const r = backup.data[idx];
      const g = backup.data[idx + 1];
      const b = backup.data[idx + 2];
      const a = backup.data[idx + 3];

      if (a > 0) {
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        const brightness = (r + g + b) / 3;
        hairPixels.push({ x, y, color: hex, brightness });
      }
    }
  }

  // Agrupar por color
  const colorGroups: Record<string, typeof hairPixels> = {};
  hairPixels.forEach(p => {
    if (!colorGroups[p.color]) colorGroups[p.color] = [];
    colorGroups[p.color].push(p);
  });

  console.log('Colores únicos en el pelo (ordenados por brillo):');
  Object.entries(colorGroups)
    .sort((a, b) => b[1][0].brightness - a[1][0].brightness)
    .forEach(([color, pixels]) => {
      const brightness = pixels[0].brightness.toFixed(1);
      console.log(`  ${color} (brillo: ${brightness}) - ${pixels.length} píxeles`);
    });

  console.log('\n=== ESTRATEGIA DE DISTRIBUCIÓN HEAD/HAT ===\n');
  console.log('HEAD (capa base - tonos oscuros/medios):');
  console.log('  - Usará los tonos más oscuros como base sólida');
  console.log('  - Estos píxeles dan la "masa" del pelo');
  console.log('');
  console.log('HAT (capa overlay - highlights y detalles):');
  console.log('  - Usará los tonos más claros como highlights');
  console.log('  - Crea el efecto de ondulación y profundidad 3D');
  console.log('  - +0.5 pixels offset en el render = efecto de volumen');

  // Propuesta de distribución
  const sortedColors = Object.entries(colorGroups)
    .sort((a, b) => a[1][0].brightness - b[1][0].brightness);

  const midPoint = Math.floor(sortedColors.length / 2);

  console.log('\n=== PROPUESTA DE ASIGNACIÓN ===\n');
  console.log('HEAD (tonos base):');
  sortedColors.slice(0, midPoint + 1).forEach(([color, pixels]) => {
    console.log(`  ${color} - ${pixels.length} píxeles`);
  });

  console.log('\nHAT (highlights):');
  sortedColors.slice(midPoint + 1).forEach(([color, pixels]) => {
    console.log(`  ${color} - ${pixels.length} píxeles`);
  });

  // Mapa visual por fila
  console.log('\n=== MAPA VISUAL DE COLORES POR FILA ===\n');
  console.log('  x: 40 41 42 43 44 45 46 47');
  for (let y = 8; y < 16; y++) {
    let line = `y=${y}: `;
    for (let x = 40; x < 48; x++) {
      const pixel = hairPixels.find(p => p.x === x && p.y === y);
      if (pixel) {
        // Abreviar colores
        const abbrev = pixel.color === '#743434' ? 'M1' :
                       pixel.color === '#783636' ? 'M2' :
                       pixel.color === '#672e2e' ? 'D1' :
                       pixel.color === '#5a2828' ? 'D2' :
                       pixel.color === '#4e2323' ? 'DD' :
                       '??';
        line += abbrev + ' ';
      } else {
        line += '-- ';
      }
    }
    console.log(line);
  }

  console.log('\nLeyenda:');
  console.log('M1=#743434 (medio), M2=#783636 (medio claro)');
  console.log('D1=#672e2e (oscuro), D2=#5a2828 (más oscuro), DD=#4e2323 (muy oscuro)');
}

analyzeHairLayers().catch(console.error);
