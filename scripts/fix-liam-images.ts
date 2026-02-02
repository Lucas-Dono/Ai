import sharp from 'sharp';
import * as path from 'path';

async function fixLiamImages() {
  const sourceDir = path.join(__dirname, '..', 'public', 'personajes', 'liam-oconnor-composer');
  const targetDir = path.join(__dirname, '..', 'public', 'personajes', 'liam-oconnor');

  await sharp(path.join(sourceDir, 'Foto-de-la-cara.png'))
    .webp({ quality: 90 })
    .toFile(path.join(targetDir, 'avatar.webp'));

  await sharp(path.join(sourceDir, 'Foto-completa.png'))
    .webp({ quality: 90 })
    .toFile(path.join(targetDir, 'reference.webp'));

  console.log('✅ Imágenes de Liam O\'Connor convertidas');
}

fixLiamImages().catch(console.error);
