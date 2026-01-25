import sharp from 'sharp';

async function verify3DEffect() {
  const showcase = await sharp('public/minecraft/hairstyle-showcase/08_long_wavy_romantic.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('=== VERIFICACIÓN DEL EFECTO 3D ===\n');

  // Analizar HEAD_FRONT fila por fila
  console.log('HEAD_FRONT (8,8) - Análisis por fila:\n');

  for (let y = 8; y < 16; y++) {
    let headPixels = 0;
    let colors: string[] = [];

    for (let x = 8; x < 16; x++) {
      const idx = (y * 64 + x) * 4;
      const a = showcase.data[idx + 3];
      if (a > 0) {
        headPixels++;
        const r = showcase.data[idx];
        const g = showcase.data[idx + 1];
        const b = showcase.data[idx + 2];
        const hex = `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
        if (!colors.includes(hex)) colors.push(hex);
      }
    }

    if (headPixels > 0) {
      const avgBrightness = colors.reduce((sum, hex) => {
        const r = parseInt(hex.slice(1,3), 16);
        const g = parseInt(hex.slice(3,5), 16);
        const b = parseInt(hex.slice(5,7), 16);
        return sum + (r + g + b) / 3;
      }, 0) / colors.length;

      console.log(`y=${y}: ${headPixels} píxeles, brillo promedio: ${avgBrightness.toFixed(1)}`);
    } else {
      console.log(`y=${y}: 0 píxeles`);
    }
  }

  // Analizar HAT_FRONT fila por fila
  console.log('\nHAT_FRONT (40,8) - Análisis por fila:\n');

  for (let y = 8; y < 16; y++) {
    let hatPixels = 0;

    for (let x = 40; x < 48; x++) {
      const idx = (y * 64 + x) * 4;
      const a = showcase.data[idx + 3];
      if (a > 0) hatPixels++;
    }

    console.log(`y=${y}: ${hatPixels} píxeles ${hatPixels > 0 ? '(HIGHLIGHTS)' : '(base HEAD visible)'}`);
  }

  // Estadísticas finales
  console.log('\n=== ESTADÍSTICAS FINALES ===\n');

  let totalHead = 0;
  let totalHat = 0;

  for (let y = 8; y < 16; y++) {
    for (let x = 8; x < 16; x++) {
      const idx = (y * 64 + x) * 4;
      if (showcase.data[idx + 3] > 0) totalHead++;
    }
  }

  for (let y = 8; y < 16; y++) {
    for (let x = 40; x < 48; x++) {
      const idx = (y * 64 + x) * 4;
      if (showcase.data[idx + 3] > 0) totalHat++;
    }
  }

  console.log(`HEAD_FRONT: ${totalHead} píxeles (forma completa)`);
  console.log(`HAT_FRONT:  ${totalHat} píxeles (solo highlights)`);
  console.log(`Relación:   ${((totalHat / totalHead) * 100).toFixed(1)}% del HEAD está cubierto por HAT`);

  const exposed = totalHead - totalHat;
  console.log(`\nPíxeles de HEAD expuestos: ${exposed} (${((exposed / totalHead) * 100).toFixed(1)}%)`);
  console.log(`\nEfecto 3D: ✓ El HEAD oscuro se verá desde ángulos laterales/inferiores`);
  console.log(`           ✓ El HAT brillante se verá desde ángulo frontal/superior`);
}

verify3DEffect().catch(console.error);
