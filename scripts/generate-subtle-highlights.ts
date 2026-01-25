import sharp from 'sharp';

async function generateSubtleHighlights() {
  const backup = await sharp('public/minecraft/backup/texture.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Función para oscurecer aún más (60% en lugar de 70%)
  function darkenColor(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const newR = Math.floor(r * 0.6);
    const newG = Math.floor(g * 0.6);
    const newB = Math.floor(b * 0.6);
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  // Función para crear highlight sutil (solo 10-15% más claro que el base oscurecido)
  function subtleHighlight(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const newR = Math.min(255, Math.floor(r * 1.15));
    const newG = Math.min(255, Math.floor(g * 1.15));
    const newB = Math.min(255, Math.floor(b * 1.15));
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  const regions = [
    {
      name: 'TOP',
      hatRegion: { x1: 40, y1: 0, x2: 48, y2: 8 },
      headRegion: { x1: 8, y1: 0, x2: 16, y2: 8 },
      // Elegir manualmente 3-4 píxeles estratégicos
      highlightPositions: [
        { x: 41, y: 1 }, // Centro-izquierda fila 2
        { x: 46, y: 1 }, // Centro-derecha fila 2
        { x: 43, y: 3 }, // Centro fila 4
      ]
    },
    {
      name: 'RIGHT',
      hatRegion: { x1: 32, y1: 8, x2: 40, y2: 16 },
      headRegion: { x1: 0, y1: 8, x2: 8, y2: 16 },
      highlightPositions: [
        { x: 33, y: 9 },  // Borde superior
        { x: 35, y: 10 }, // Centro-arriba
        { x: 34, y: 12 }, // Centro
        { x: 36, y: 14 }, // Abajo
      ]
    },
    {
      name: 'FRONT',
      hatRegion: { x1: 40, y1: 8, x2: 48, y2: 16 },
      headRegion: { x1: 8, y1: 8, x2: 16, y2: 16 },
      highlightPositions: [
        { x: 41, y: 8 },  // Borde superior izquierdo
        { x: 46, y: 8 },  // Borde superior derecho
        { x: 43, y: 9 },  // Centro-arriba
      ]
    },
    {
      name: 'LEFT',
      hatRegion: { x1: 48, y1: 8, x2: 56, y2: 16 },
      headRegion: { x1: 16, y1: 8, x2: 24, y2: 16 },
      highlightPositions: [
        { x: 52, y: 9 },  // Borde superior
        { x: 50, y: 10 }, // Centro-arriba
        { x: 51, y: 12 }, // Centro
        { x: 53, y: 14 }, // Abajo
      ]
    },
    {
      name: 'BACK',
      hatRegion: { x1: 56, y1: 8, x2: 64, y2: 16 },
      headRegion: { x1: 24, y1: 8, x2: 32, y2: 16 },
      highlightPositions: [
        { x: 57, y: 9 },  // Izquierda-arriba
        { x: 62, y: 9 },  // Derecha-arriba
        { x: 59, y: 11 }, // Centro
        { x: 60, y: 13 }, // Centro-abajo
      ]
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

    // Generar código HEAD (todos los píxeles, muy oscurecidos)
    console.log(`<!-- HEAD_${region.name} (${region.headRegion.x1},${region.headRegion.y1}) - Base muy oscurecida (60%) -->`);
    for (let y = region.hatRegion.y1; y < region.hatRegion.y2; y++) {
      const rowPixels = hatPixels.filter(p => p.y === y);
      if (rowPixels.length > 0) {
        rowPixels.forEach(p => {
          const headX = p.x - (region.hatRegion.x1 - region.headRegion.x1);
          const headY = p.y;
          const darkColor = darkenColor(p.color);
          console.log(`<rect x="${headX}" y="${headY}" width="1" height="1" fill="${darkColor}" class="colorizable-hair"/>`);
        });
      }
    }

    // Generar código HAT (solo píxeles estratégicos dispersos)
    console.log(`\n<!-- HAT_${region.name} (${region.hatRegion.x1},${region.hatRegion.y1}) - Solo ${region.highlightPositions.length} píxeles estratégicos -->`);
    region.highlightPositions.forEach(pos => {
      // Buscar el pixel en esa posición en el backup
      const pixel = hatPixels.find(p => p.x === pos.x && p.y === pos.y);
      if (pixel) {
        // Usar un highlight sutil (solo 15% más claro que el oscurecido)
        const highlightColor = subtleHighlight(darkenColor(pixel.color));
        console.log(`<rect x="${pos.x}" y="${pos.y}" width="1" height="1" fill="${highlightColor}" class="colorizable-hair"/>`);
      }
    });

    console.log(`\nTotal: ${hatPixels.length} píxeles → ${hatPixels.length} HEAD + ${region.highlightPositions.length} HAT (highlights sutiles)`);
  }
}

generateSubtleHighlights().catch(console.error);
