import sharp from 'sharp';

async function generateDualLayerCode() {
  const backup = await sharp('public/minecraft/backup/texture.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('=== CÓDIGO DUAL-LAYER PARA generateHairLong_02 ===\n');

  // Extraer píxeles de HAT_FRONT
  const hatPixels: Array<{ x: number; y: number; color: string }> = [];

  for (let y = 8; y < 16; y++) {
    for (let x = 40; x < 48; x++) {
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

  // Función para oscurecer un color (multiplicar RGB por 0.7)
  function darkenColor(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const newR = Math.floor(r * 0.7);
    const newG = Math.floor(g * 0.7);
    const newB = Math.floor(b * 0.7);

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  console.log('<!-- HEAD_FRONT (8x8) at (8,8) - Capa BASE del pelo (tonos oscurecidos) -->');
  console.log('<!-- Esta capa da profundidad 3D al estar debajo del HAT -->');

  // Generar HEAD_FRONT (misma forma, colores oscurecidos)
  for (let y = 8; y < 16; y++) {
    const rowPixels = hatPixels.filter(p => p.y === y);
    if (rowPixels.length > 0) {
      rowPixels.forEach(p => {
        const headX = p.x - 32; // Convertir de HAT (40-47) a HEAD (8-15)
        const darkColor = darkenColor(p.color);
        console.log(`<rect x="${headX}" y="${p.y}" width="1" height="1" fill="${darkColor}" class="colorizable-hair"/>`);
      });
    }
  }

  console.log('\n<!-- HAT_FRONT (8x8) at (40,8) - Capa OVERLAY (colores originales) -->');
  console.log('<!-- Esta capa (+0.5px offset) crea el efecto de volumen 3D -->');

  // Generar HAT_FRONT (exactamente como el backup)
  for (let y = 8; y < 16; y++) {
    const rowPixels = hatPixels.filter(p => p.y === y);
    if (rowPixels.length > 0) {
      rowPixels.forEach(p => {
        console.log(`<rect x="${p.x}" y="${p.y}" width="1" height="1" fill="${p.color}" class="colorizable-hair"/>`);
      });
    }
  }

  // Estadísticas
  console.log(`\n\n=== ESTADÍSTICAS ===`);
  console.log(`Total píxeles en HAT: ${hatPixels.length}`);
  console.log(`Total píxeles que se agregarán a HEAD: ${hatPixels.length}`);
  console.log(`\nEfecto 3D: HEAD (base oscura) + HAT (+0.5px offset con highlights)`);

  // Mostrar conversión de colores
  console.log(`\n=== CONVERSIÓN DE COLORES (HAT → HEAD oscurecido) ===`);
  const uniqueColors = [...new Set(hatPixels.map(p => p.color))];
  uniqueColors.forEach(color => {
    const darkened = darkenColor(color);
    console.log(`${color} → ${darkened}`);
  });
}

generateDualLayerCode().catch(console.error);
