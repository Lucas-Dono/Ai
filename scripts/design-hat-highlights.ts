import sharp from 'sharp';

async function designHatHighlights() {
  const backup = await sharp('public/minecraft/backup/texture.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('=== DISEÑO DE HIGHLIGHTS PARA HAT ===\n');

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

  // Clasificar píxeles por brillo
  const sortedByBrightness = [...hairPixels].sort((a, b) => b.brightness - a.brightness);

  console.log('Distribución de colores por brillo:');
  const colorGroups = new Map<string, number>();
  hairPixels.forEach(p => {
    colorGroups.set(p.color, (colorGroups.get(p.color) || 0) + 1);
  });

  [...colorGroups.entries()]
    .sort((a, b) => {
      const brightnessA = hairPixels.find(p => p.color === a[0])!.brightness;
      const brightnessB = hairPixels.find(p => p.color === b[0])!.brightness;
      return brightnessB - brightnessA;
    })
    .forEach(([color, count]) => {
      const brightness = hairPixels.find(p => p.color === color)!.brightness;
      console.log(`  ${color} (brillo: ${brightness.toFixed(1)}) - ${count} píxeles`);
    });

  console.log('\n=== ESTRATEGIA DE DISTRIBUCIÓN ===\n');
  console.log('HEAD_FRONT (todos los píxeles):');
  console.log('  - Toda la forma del pelo en tonos oscurecidos');
  console.log('  - 28 píxeles total\n');

  console.log('HAT_FRONT (solo highlights):');
  console.log('  - Solo píxeles más claros (#783636, #743434)');
  console.log('  - Píxeles en posiciones superiores y laterales');
  console.log('  - Crear efecto de ondulación 3D\n');

  // Seleccionar píxeles para HAT (solo los más claros y en posiciones clave)
  const hatPixels = hairPixels.filter(p => {
    // Solo tonos claros
    if (p.brightness < 70) return false;

    // Priorizar filas superiores (y=8, y=9)
    if (p.y <= 9) return true;

    // En filas inferiores, solo los extremos laterales para ondulación
    if (p.y === 10 && (p.x === 40 || p.x === 47)) return true;

    return false;
  });

  console.log(`Píxeles seleccionados para HAT: ${hatPixels.length}/28\n`);

  console.log('=== CÓDIGO PARA HAT_FRONT (solo highlights) ===\n');
  console.log('<!-- HAT_FRONT (8x8) at (40,8) - Solo HIGHLIGHTS para efecto 3D -->');

  for (let y = 8; y < 16; y++) {
    const rowPixels = hatPixels.filter(p => p.y === y);
    if (rowPixels.length > 0) {
      rowPixels.forEach(p => {
        console.log(`<rect x="${p.x}" y="${p.y}" width="1" height="1" fill="${p.color}" class="colorizable-hair"/>`);
      });
    }
  }

  console.log('\n=== MAPA VISUAL ===\n');
  console.log('  x: 40 41 42 43 44 45 46 47');
  for (let y = 8; y < 16; y++) {
    let line = `y=${y}: `;
    for (let x = 40; x < 48; x++) {
      const inHead = hairPixels.some(p => p.x === x && p.y === y);
      const inHat = hatPixels.some(p => p.x === x && p.y === y);

      if (inHat) {
        line += 'HH '; // HEAD + HAT
      } else if (inHead) {
        line += 'H_ '; // Solo HEAD
      } else {
        line += '-- ';
      }
    }
    console.log(line);
  }

  console.log('\nLeyenda:');
  console.log('HH = HEAD + HAT (highlight visible)');
  console.log('H_ = Solo HEAD (base oscura visible)');
  console.log('-- = Transparente');
}

designHatHighlights().catch(console.error);
