/**
 * Genera una visualización escalada del backup
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function visualizeBackup() {
  const backupPath = path.join(process.cwd(), 'public/minecraft/backup/texture.png');
  const outputPath = path.join(process.cwd(), 'public/minecraft/debug_backup.png');

  const backupBuffer = await fs.readFile(backupPath);
  const { info } = await sharp(backupBuffer).metadata();

  // Escalar para que se vea mejor (legacy es 64x32)
  const scale = info?.height === 32 ? 16 : 8;

  await sharp(backupBuffer)
    .resize(64 * scale, (info?.height || 64) * scale, { kernel: 'nearest' })
    .png()
    .toFile(outputPath);

  console.log(`Backup escalado guardado en: ${outputPath} (original: ${info?.width}x${info?.height})`);
}

visualizeBackup().catch(console.error);
