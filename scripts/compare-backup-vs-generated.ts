import sharp from 'sharp';

async function compare() {
  const backup = await sharp('public/minecraft/backup/texture.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const generated = await sharp('public/minecraft/components/hair_front/hair_long_02_wavy.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('=== COMPARACIÓN HAT_FRONT (40,8) - (47,15) ===\n');

  let differences = 0;
  let matches = 0;

  for (let y = 8; y < 16; y++) {
    for (let x = 40; x < 48; x++) {
      const backupIdx = (y * 64 + x) * 4;
      const genIdx = (y * 64 + x) * 4;

      const backupColor = {
        r: backup.data[backupIdx],
        g: backup.data[backupIdx + 1],
        b: backup.data[backupIdx + 2],
        a: backup.data[backupIdx + 3],
      };

      const genColor = {
        r: generated.data[genIdx],
        g: generated.data[genIdx + 1],
        b: generated.data[genIdx + 2],
        a: generated.data[genIdx + 3],
      };

      if (backupColor.r !== genColor.r ||
          backupColor.g !== genColor.g ||
          backupColor.b !== genColor.b ||
          backupColor.a !== genColor.a) {

        const backupHex = `#${backupColor.r.toString(16).padStart(2,'0')}${backupColor.g.toString(16).padStart(2,'0')}${backupColor.b.toString(16).padStart(2,'0')}`;
        const genHex = `#${genColor.r.toString(16).padStart(2,'0')}${genColor.g.toString(16).padStart(2,'0')}${genColor.b.toString(16).padStart(2,'0')}`;

        console.log(`DIFERENCIA en (${x},${y}):`);
        console.log(`  Backup:    ${backupHex} alpha=${backupColor.a}`);
        console.log(`  Generado:  ${genHex} alpha=${genColor.a}`);
        differences++;
      } else {
        matches++;
      }
    }
  }

  console.log(`\n=== RESUMEN ===`);
  console.log(`Píxeles idénticos: ${matches}/64`);
  console.log(`Píxeles diferentes: ${differences}/64`);

  if (differences === 0) {
    console.log('\n✅ Los componentes generados son IDÉNTICOS al backup original');
  } else {
    console.log('\n❌ HAY DIFERENCIAS entre backup y generado');
  }
}

compare().catch(console.error);
