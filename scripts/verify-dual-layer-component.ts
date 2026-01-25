import sharp from 'sharp';

async function verifyComponent() {
  const component = await sharp('public/minecraft/components/hair_front/hair_long_02_wavy.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const showcase = await sharp('public/minecraft/hairstyle-showcase/08_long_wavy_romantic.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('=== VERIFICACIÓN COMPONENTE vs SHOWCASE ===\n');

  // Verificar HEAD_FRONT en componente (8,8)
  console.log('COMPONENTE - HEAD_FRONT (8,8):');
  let compHeadPixels = 0;
  for (let y = 8; y < 16; y++) {
    for (let x = 8; x < 16; x++) {
      const idx = (y * 64 + x) * 4;
      const a = component.data[idx + 3];
      if (a > 0) compHeadPixels++;
    }
  }
  console.log(`  Píxeles no transparentes: ${compHeadPixels}`);

  // Verificar HEAD_FRONT en showcase (debería tener pelo oscuro)
  console.log('\nSHOWCASE - HEAD_FRONT (8,8):');
  let showHeadPixels = 0;
  for (let y = 8; y < 16; y++) {
    for (let x = 8; x < 16; x++) {
      const idx = (y * 64 + x) * 4;
      const a = showcase.data[idx + 3];
      if (a > 0) showHeadPixels++;
    }
  }
  console.log(`  Píxeles no transparentes: ${showHeadPixels}`);

  // Comparar algunos píxeles clave
  console.log('\n=== COMPARACIÓN PÍXEL POR PÍXEL ===\n');

  const testPixels = [
    { x: 8, y: 8, name: 'HEAD_FRONT esquina sup izq' },
    { x: 15, y: 8, name: 'HEAD_FRONT esquina sup der' },
    { x: 40, y: 8, name: 'HAT_FRONT esquina sup izq' },
    { x: 47, y: 8, name: 'HAT_FRONT esquina sup der' },
  ];

  for (const pixel of testPixels) {
    const compIdx = (pixel.y * 64 + pixel.x) * 4;
    const showIdx = (pixel.y * 64 + pixel.x) * 4;

    const compHex = `#${component.data[compIdx].toString(16).padStart(2,'0')}${component.data[compIdx+1].toString(16).padStart(2,'0')}${component.data[compIdx+2].toString(16).padStart(2,'0')}`;
    const showHex = `#${showcase.data[showIdx].toString(16).padStart(2,'0')}${showcase.data[showIdx+1].toString(16).padStart(2,'0')}${showcase.data[showIdx+2].toString(16).padStart(2,'0')}`;

    const match = compHex === showHex ? '✓' : '✗';
    console.log(`${match} (${pixel.x},${pixel.y}) ${pixel.name}:`);
    console.log(`    Componente: ${compHex}`);
    console.log(`    Showcase:   ${showHex}`);
    console.log('');
  }

  // Verificar que HEAD_FRONT tenga pelo oscurecido
  console.log('=== VERIFICACIÓN DE COLORES HEAD_FRONT ===\n');
  const headIdx = (8 * 64 + 8) * 4;
  const headColor = `#${showcase.data[headIdx].toString(16).padStart(2,'0')}${showcase.data[headIdx+1].toString(16).padStart(2,'0')}${showcase.data[headIdx+2].toString(16).padStart(2,'0')}`;

  console.log(`Color en HEAD_FRONT (8,8): ${headColor}`);
  console.log(`¿Es un tono oscurecido? ${headColor.startsWith('#5') || headColor.startsWith('#4') || headColor.startsWith('#3') ? 'SÍ ✓' : 'NO ✗'}`);
}

verifyComponent().catch(console.error);
