/**
 * Create Placeholder Avatars for New Characters
 * Temporary solution until AI Horde images can be generated
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

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

// Color palette by category
const CATEGORY_COLORS: { [key: string]: string } = {
  'tech': '#3b82f6',      // Blue
  'science': '#8b5cf6',   // Purple
  'arts': '#ec4899',      // Pink
  'health': '#10b981',    // Green
  'business': '#f59e0b',  // Amber
  'education': '#06b6d4', // Cyan
  'creative': '#f43f5e',  // Rose
};

function getCategoryFromSlug(slug: string): string {
  if (slug.includes('dr-') || slug.includes('prof-')) {
    if (slug.includes('kira') || slug.includes('maya') || slug.includes('amara')) return 'science';
    if (slug.includes('samira') || slug.includes('aisha') || slug.includes('marcus')) return 'health';
    if (slug.includes('elena') || slug.includes('omar') || slug.includes('grace') || slug.includes('akira') || slug.includes('fatima') || slug.includes('santiago')) return 'education';
  }
  if (slug.includes('axel') || slug.includes('viktor') || slug.includes('theo')) return 'tech';
  if (slug.includes('lucia') || slug.includes('jasper') || slug.includes('nadia') || slug.includes('diego') || slug.includes('iris') || slug.includes('roman')) return 'arts';
  if (slug.includes('luca') || slug.includes('kai') || slug.includes('yara')) return 'health';
  if (slug.includes('sienna') || slug.includes('rajesh') || slug.includes('tania') || slug.includes('andre') || slug.includes('amina') || slug.includes('henrik')) return 'business';
  if (slug.includes('zoe') || slug.includes('finn') || slug.includes('leila') || slug.includes('miles') || slug.includes('saskia') || slug.includes('tomas')) return 'creative';
  return 'tech';
}

function getInitials(name: string): string {
  const parts = name.split(' ').filter(p => !p.startsWith('Dr.') && !p.startsWith('Prof.'));
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

async function createPlaceholder(name: string, category: string): Promise<Buffer> {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.tech;
  const initials = getInitials(name);

  // Create SVG with initials
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="${color}"/>
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="180"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="central"
      >${initials}</text>
    </svg>
  `;

  return sharp(Buffer.from(svg))
    .webp({ quality: 90 })
    .toBuffer();
}

async function generatePlaceholders() {
  const processedDir = path.join(__dirname, '..', 'Personajes', 'processed');
  const publicDir = path.join(__dirname, '..', 'public', 'personajes');

  let count = 0;

  console.log('\n🎨 Creando placeholders para 36 personajes...\n');

  for (const slug of NEW_CHARACTER_SLUGS) {
    const jsonPath = path.join(processedDir, `${slug}.json`);

    if (!fs.existsSync(jsonPath)) {
      continue;
    }

    const characterData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const charDir = path.join(publicDir, slug);

    if (!fs.existsSync(charDir)) {
      fs.mkdirSync(charDir, { recursive: true });
    }

    const avatarPath = path.join(charDir, 'avatar.webp');

    // Skip if avatar already exists
    if (fs.existsSync(avatarPath)) {
      console.log(`⏭️  ${characterData.name} - Avatar ya existe`);
      continue;
    }

    const category = getCategoryFromSlug(slug);
    const placeholder = await createPlaceholder(characterData.name, category);

    fs.writeFileSync(avatarPath, placeholder);

    console.log(`✅ ${characterData.name} - Placeholder creado (${category})`);
    count++;
  }

  console.log(`\n🎉 ${count} placeholders creados exitosamente!`);
  console.log('\n💡 Estos son placeholders temporales.');
  console.log('   Puedes reemplazarlos con imágenes generadas con IA más tarde.\n');
}

generatePlaceholders().catch(console.error);
