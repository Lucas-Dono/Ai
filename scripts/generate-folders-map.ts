/**
 * Generate Folders Map for New Characters Only
 */

import * as fs from 'fs';
import * as path from 'path';

const NEW_CHARACTER_SLUGS = [
  'dr-kira-nakamura',
  'axel-winters',
  'dr-amara-osei',
  'viktor-kozlov',
  'maya-patel',
  'theo-santos',
  'lucia-martinez',
  'jasper-blake',
  'nadia-khoury',
  'diego-vargas',
  'iris-chen',
  'roman-volkov',
  'dr-samira-hassan',
  'luca-moretti',
  'dr-aisha-mohammed',
  'kai-tanaka',
  'dr-marcus-kline',
  'yara-al-farsi',
  'sienna-brooks',
  'rajesh-kumar',
  'tania-volkov',
  'andre-dubois',
  'amina-diallo',
  'henrik-larsen',
  'dr-elena-petrova',
  'omar-rashid',
  'dr-grace-nkosi',
  'prof-akira-sato',
  'dr-fatima-zahra',
  'dr-santiago-rojas',
  'zoe-park',
  'finn-oreilly',
  'leila-novak',
  'miles-washington',
  'saskia-van-der-meer',
  'tomas-silva',
];

interface CharacterData {
  name: string;
}

async function generateFoldersMap() {
  const processedDir = path.join(__dirname, '..', 'Personajes', 'processed');
  const outputFile = path.join(__dirname, '..', 'character-folders-map.txt');

  let output = '='.repeat(80) + '\n';
  output += 'MAPA DE CARPETAS PARA IMÁGENES DE NUEVOS PERSONAJES\n';
  output += '(Los 24 personajes originales ya tienen imágenes)\n';
  output += '='.repeat(80) + '\n\n';

  output += 'ESTRUCTURA:\n';
  output += 'public/personajes/{slug}/\n';
  output += '├── avatar.webp         (foto de cara/headshot - GENERAR PRIMERO)\n';
  output += '└── reference.webp      (foto de cuerpo completo - GENERAR CON AVATAR ADJUNTO)\n\n';
  output += '='.repeat(80) + '\n\n';

  console.log(`\n📝 Generando mapa para ${NEW_CHARACTER_SLUGS.length} nuevos personajes...\n`);

  for (let i = 0; i < NEW_CHARACTER_SLUGS.length; i++) {
    const slug = NEW_CHARACTER_SLUGS[i];
    const jsonPath = path.join(processedDir, `${slug}.json`);

    if (!fs.existsSync(jsonPath)) {
      console.log(`⚠️  [${i + 1}/${NEW_CHARACTER_SLUGS.length}] ${slug} - No existe JSON, saltando`);
      continue;
    }

    const character: CharacterData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    output += `PERSONAJE ${i + 1}/36: ${character.name}\n`;
    output += `📁 Carpeta: public/personajes/${slug}/\n`;
    output += `Archivo JSON: Personajes/processed/${slug}.json\n\n`;

    console.log(`✅ [${i + 1}/36] ${character.name}`);
  }

  output += '='.repeat(80) + '\n';
  output += 'FIN DEL MAPA\n';
  output += '='.repeat(80) + '\n';

  fs.writeFileSync(outputFile, output, 'utf-8');

  console.log(`\n🎉 Mapa generado exitosamente!`);
  console.log(`📄 Archivo guardado en: ${outputFile}\n`);
}

generateFoldersMap().catch(console.error);
