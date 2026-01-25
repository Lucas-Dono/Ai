import sharp from 'sharp';

async function verifyDualLayerComplete() {
  // Leer el componente generado (hair_long_02_wavy)
  const component = await sharp('public/minecraft/components/hair_front/hair_long_02_wavy.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('=== VERIFICACIÓN DEL SISTEMA DE DOBLE CAPA COMPLETO ===\n');

  const regions = [
    {
      name: 'TOP',
      headRegion: { x1: 8, y1: 0, x2: 16, y2: 8 },
      hatRegion: { x1: 40, y1: 0, x2: 48, y2: 8 },
      expectedHighlights: 16
    },
    {
      name: 'RIGHT',
      headRegion: { x1: 0, y1: 8, x2: 8, y2: 16 },
      hatRegion: { x1: 32, y1: 8, x2: 40, y2: 16 },
      expectedHighlights: 34
    },
    {
      name: 'FRONT',
      headRegion: { x1: 8, y1: 8, x2: 16, y2: 16 },
      hatRegion: { x1: 40, y1: 8, x2: 48, y2: 16 },
      expectedHighlights: 15
    },
    {
      name: 'LEFT',
      headRegion: { x1: 16, y1: 8, x2: 24, y2: 16 },
      hatRegion: { x1: 48, y1: 8, x2: 56, y2: 16 },
      expectedHighlights: 34
    },
    {
      name: 'BACK',
      headRegion: { x1: 24, y1: 8, x2: 32, y2: 16 },
      hatRegion: { x1: 56, y1: 8, x2: 64, y2: 16 },
      expectedHighlights: 38
    },
  ];

  for (const region of regions) {
    console.log(`\n=== ${region.name} ===\n`);

    // Contar píxeles en HEAD
    let headPixels = 0;
    let headDarkPixels = 0;
    const headColors = new Set<string>();

    for (let y = region.headRegion.y1; y < region.headRegion.y2; y++) {
      for (let x = region.headRegion.x1; x < region.headRegion.x2; x++) {
        const idx = (y * 64 + x) * 4;
        const r = component.data[idx];
        const g = component.data[idx + 1];
        const b = component.data[idx + 2];
        const a = component.data[idx + 3];

        if (a > 0) {
          headPixels++;
          headColors.add(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);

          const brightness = (r + g + b) / 3;
          if (brightness < 70) {
            headDarkPixels++;
          }
        }
      }
    }

    // Contar píxeles en HAT
    let hatPixels = 0;
    let hatBrightPixels = 0;
    const hatColors = new Set<string>();

    for (let y = region.hatRegion.y1; y < region.hatRegion.y2; y++) {
      for (let x = region.hatRegion.x1; x < region.hatRegion.x2; x++) {
        const idx = (y * 64 + x) * 4;
        const r = component.data[idx];
        const g = component.data[idx + 1];
        const b = component.data[idx + 2];
        const a = component.data[idx + 3];

        if (a > 0) {
          hatPixels++;
          hatColors.add(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);

          const brightness = (r + g + b) / 3;
          if (brightness >= 70) {
            hatBrightPixels++;
          }
        }
      }
    }

    // Mostrar resultados
    console.log(`HEAD (${region.headRegion.x1},${region.headRegion.y1}):`);
    console.log(`  Total píxeles: ${headPixels}/64`);
    console.log(`  Píxeles oscurecidos (brillo < 70): ${headDarkPixels}`);
    console.log(`  Colores únicos: ${headColors.size}`);

    console.log(`\nHAT (${region.hatRegion.x1},${region.hatRegion.y1}):`);
    console.log(`  Total píxeles: ${hatPixels}/64`);
    console.log(`  Píxeles brillantes (brillo >= 70): ${hatBrightPixels}`);
    console.log(`  Colores únicos: ${hatColors.size}`);
    console.log(`  Esperados: ${region.expectedHighlights} highlights`);

    // Verificación
    const headOk = headPixels > 0;
    const hatOk = hatPixels === region.expectedHighlights;
    const brightnessOk = hatBrightPixels === hatPixels;

    console.log(`\n✓ Verificación:`);
    console.log(`  ${headOk ? '✓' : '✗'} HEAD tiene píxeles (${headPixels})`);
    console.log(`  ${hatOk ? '✓' : '✗'} HAT tiene highlights esperados (${hatPixels}/${region.expectedHighlights})`);
    console.log(`  ${brightnessOk ? '✓' : '✗'} Todos los píxeles de HAT son brillantes`);

    if (headOk && hatOk && brightnessOk) {
      const coverage = ((hatPixels / 64) * 100).toFixed(1);
      const exposure = (100 - parseFloat(coverage)).toFixed(1);
      console.log(`  📊 HEAD expuesto: ${exposure}% (para efecto 3D)`);
      console.log(`  ✅ REGIÓN ${region.name} CORRECTA`);
    } else {
      console.log(`  ❌ REGIÓN ${region.name} NECESITA REVISIÓN`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  ✅ VERIFICACIÓN COMPLETA DEL SISTEMA DE DOBLE CAPA');
  console.log('═══════════════════════════════════════════════════════\n');
}

verifyDualLayerComplete().catch(console.error);
