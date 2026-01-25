import sharp from 'sharp';

async function compareSkins() {
  const backup = await sharp('public/minecraft/backup/texture.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const showcase = await sharp('public/minecraft/hairstyle-showcase/08_long_wavy_romantic.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Comparar región de la CARA en HEAD_FRONT (8,8) - (15,15)
  console.log('=== COMPARACIÓN HEAD_FRONT - CARA (8,8) - (15,15) ===\n');

  let faceDifferences = 0;
  const diffs: Array<{x: number, y: number, backup: string, showcase: string}> = [];

  for (let y = 8; y < 16; y++) {
    for (let x = 8; x < 16; x++) {
      const backupIdx = (y * 64 + x) * 4;
      const showcaseIdx = (y * 64 + x) * 4;

      const backupColor = {
        r: backup.data[backupIdx],
        g: backup.data[backupIdx + 1],
        b: backup.data[backupIdx + 2],
        a: backup.data[backupIdx + 3],
      };

      const showcaseColor = {
        r: showcase.data[showcaseIdx],
        g: showcase.data[showcaseIdx + 1],
        b: showcase.data[showcaseIdx + 2],
        a: showcase.data[showcaseIdx + 3],
      };

      if (backupColor.r !== showcaseColor.r ||
          backupColor.g !== showcaseColor.g ||
          backupColor.b !== showcaseColor.b ||
          backupColor.a !== showcaseColor.a) {

        const backupHex = `#${backupColor.r.toString(16).padStart(2,'0')}${backupColor.g.toString(16).padStart(2,'0')}${backupColor.b.toString(16).padStart(2,'0')}`;
        const showcaseHex = `#${showcaseColor.r.toString(16).padStart(2,'0')}${showcaseColor.g.toString(16).padStart(2,'0')}${showcaseColor.b.toString(16).padStart(2,'0')}`;

        diffs.push({
          x,
          y,
          backup: `${backupHex} a=${backupColor.a}`,
          showcase: `${showcaseHex} a=${showcaseColor.a}`
        });
        faceDifferences++;
      }
    }
  }

  if (diffs.length > 0 && diffs.length <= 20) {
    diffs.forEach(d => {
      console.log(`(${d.x},${d.y}): Backup=${d.backup} vs Showcase=${d.showcase}`);
    });
  } else if (diffs.length > 20) {
    console.log(`Primeras 20 diferencias:`);
    diffs.slice(0, 20).forEach(d => {
      console.log(`(${d.x},${d.y}): Backup=${d.backup} vs Showcase=${d.showcase}`);
    });
    console.log(`... y ${diffs.length - 20} diferencias más`);
  }

  console.log(`\nHead_Front: ${faceDifferences}/64 píxeles diferentes`);

  // Verificar región de los OJOS específicamente (esperamos verde #228b22 o similar)
  console.log('\n=== VERIFICACIÓN DE OJOS (región y=2-4) ===\n');

  const eyeRegions = [
    { x: 10, y: 11, name: 'Ojo izquierdo (pupila)' },
    { x: 10, y: 12, name: 'Ojo izquierdo (inferior)' },
    { x: 13, y: 11, name: 'Ojo derecho (pupila)' },
    { x: 13, y: 12, name: 'Ojo derecho (inferior)' },
  ];

  eyeRegions.forEach(region => {
    const idx = (region.y * 64 + region.x) * 4;
    const backupR = backup.data[idx];
    const backupG = backup.data[idx + 1];
    const backupB = backup.data[idx + 2];
    const showcaseR = showcase.data[idx];
    const showcaseG = showcase.data[idx + 1];
    const showcaseB = showcase.data[idx + 2];

    const backupHex = `#${backupR.toString(16).padStart(2,'0')}${backupG.toString(16).padStart(2,'0')}${backupB.toString(16).padStart(2,'0')}`;
    const showcaseHex = `#${showcaseR.toString(16).padStart(2,'0')}${showcaseG.toString(16).padStart(2,'0')}${showcaseB.toString(16).padStart(2,'0')}`;

    console.log(`${region.name} (${region.x},${region.y}):`);
    console.log(`  Backup:   ${backupHex}`);
    console.log(`  Showcase: ${showcaseHex}`);
    console.log();
  });
}

compareSkins().catch(console.error);
