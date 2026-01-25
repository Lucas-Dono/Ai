import sharp from 'sharp';

async function extractEyes() {
  const backup = await sharp('public/minecraft/backup/texture.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('=== OJOS EN HEAD_FRONT (8,8) - (15,15) ===\n');

  // Región de la cara en HEAD_FRONT
  const eyePixels: Array<{ x: number; y: number; color: string }> = [];

  for (let y = 8; y < 16; y++) {
    for (let x = 8; x < 16; x++) {
      const idx = (y * 64 + x) * 4;
      const r = backup.data[idx];
      const g = backup.data[idx + 1];
      const b = backup.data[idx + 2];
      const a = backup.data[idx + 3];

      if (a > 0) {
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        eyePixels.push({ x, y, color: hex });
      }
    }
  }

  // Mostrar mapa visual
  console.log('Mapa de colores en HEAD_FRONT:');
  console.log('  x: 8  9  10 11 12 13 14 15');
  for (let y = 8; y < 16; y++) {
    let line = `y=${y.toString().padStart(2)}: `;
    for (let x = 8; x < 16; x++) {
      const pixel = eyePixels.find(p => p.x === x && p.y === y);
      if (pixel) {
        // Abreviar colores para el mapa
        const abbrev = pixel.color === '#80705f' ? 'SK' :  // Skin
                       pixel.color === '#706253' ? 'sk' :  // Skin dark
                       pixel.color === '#605447' ? 's2' :  // Skin darker
                       pixel.color === '#6a5d50' ? 'SH' :  // Shadow
                       pixel.color === '#228b22' ? 'GR' :  // Green iris
                       pixel.color === '#114611' ? 'gr' :  // Green pupil
                       pixel.color === '#ffffff' ? 'WH' :  // White
                       pixel.color === '#303030' ? 'BK' :  // Black (mouth)
                       '??';
        line += abbrev + ' ';
      } else {
        line += '-- ';
      }
    }
    console.log(line);
  }

  console.log('\nLeyenda:');
  console.log('SK=#80705f (piel), sk=#706253 (piel oscura), s2=#605447 (piel más oscura)');
  console.log('SH=#6a5d50 (sombra), GR=#228b22 (iris verde), gr=#114611 (pupila verde)');
  console.log('WH=#ffffff (blanco ojo), BK=#303030 (boca)');

  // Código SVG para el componente eyes_03
  console.log('\n\n=== CÓDIGO PARA eyes_03.svg ===\n');
  console.log('<svg width="8" height="8" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">');

  // Extraer solo la región de ojos (relativa a HEAD_FRONT)
  // Ojo izquierdo: x=9-10, y=10-12 (en coordenadas de 64x64)
  // En el componente 8x8: x=1-2, y=2-4

  console.log('  <!-- Ojo izquierdo (x=1-2, y=2-4) -->');
  for (let localY = 2; localY <= 4; localY++) {
    for (let localX = 1; localX <= 2; localX++) {
      const globalX = 8 + localX;
      const globalY = 8 + localY;
      const pixel = eyePixels.find(p => p.x === globalX && p.y === globalY);
      if (pixel) {
        if (pixel.color === '#ffffff') {
          console.log(`  <rect x="${localX}" y="${localY}" width="1" height="1" fill="#FFFFFF"/>`);
        } else if (pixel.color === '#228b22') {
          console.log(`  <rect x="${localX}" y="${localY}" width="1" height="1" fill="#E0E0E0" class="colorizable-eye"/>`);
        } else if (pixel.color === '#114611') {
          console.log(`  <rect x="${localX}" y="${localY}" width="1" height="1" fill="#808080" class="colorizable-eye-pupil"/>`);
        }
      }
    }
  }

  console.log('');
  console.log('  <!-- Ojo derecho (x=5-6, y=2-4) -->');
  for (let localY = 2; localY <= 4; localY++) {
    for (let localX = 5; localX <= 6; localX++) {
      const globalX = 8 + localX;
      const globalY = 8 + localY;
      const pixel = eyePixels.find(p => p.x === globalX && p.y === globalY);
      if (pixel) {
        if (pixel.color === '#ffffff') {
          console.log(`  <rect x="${localX}" y="${localY}" width="1" height="1" fill="#FFFFFF"/>`);
        } else if (pixel.color === '#228b22') {
          console.log(`  <rect x="${localX}" y="${localY}" width="1" height="1" fill="#E0E0E0" class="colorizable-eye"/>`);
        } else if (pixel.color === '#114611') {
          console.log(`  <rect x="${localX}" y="${localY}" width="1" height="1" fill="#808080" class="colorizable-eye-pupil"/>`);
        }
      }
    }
  }
  console.log('</svg>');
}

extractEyes().catch(console.error);
