/**
 * Verificar qué personajes tienen imágenes completas
 */

import * as fs from 'fs';
import * as path from 'path';

interface CharacterData {
  id: string;
  name: string;
}

async function checkCharacterImages() {
  const processedDir = path.join(__dirname, '..', 'Personajes', 'processed');
  const publicDir = path.join(__dirname, '..', 'public', 'personajes');

  const files = fs.readdirSync(processedDir).filter(f => f.endsWith('.json'));

  console.log('\n🔍 Verificando imágenes de personajes...\n');
  console.log('='.repeat(80));

  let withAvatar = 0;
  let withReference = 0;
  let withBoth = 0;
  let withNone = 0;

  const readyForProduction: string[] = [];
  const needingImages: string[] = [];

  for (const file of files) {
    const slug = file.replace('.json', '');
    const jsonPath = path.join(processedDir, file);
    const character: CharacterData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    const charDir = path.join(publicDir, slug);
    const avatarPath = path.join(charDir, 'avatar.webp');
    const referencePath = path.join(charDir, 'reference.webp');

    const hasAvatar = fs.existsSync(avatarPath);
    const hasReference = fs.existsSync(referencePath);

    let status = '';
    if (hasAvatar && hasReference) {
      status = '✅ COMPLETO (avatar + cuerpo)';
      withBoth++;
      readyForProduction.push(character.name);
    } else if (hasAvatar && !hasReference) {
      status = '🟡 PARCIAL (solo avatar)';
      withAvatar++;
      readyForProduction.push(character.name);
    } else if (!hasAvatar && hasReference) {
      status = '⚠️  INCOMPLETO (solo cuerpo, falta avatar)';
      withReference++;
      needingImages.push(character.name);
    } else {
      status = '❌ SIN IMÁGENES';
      withNone++;
      needingImages.push(character.name);
    }

    console.log(`${status.padEnd(40)} | ${character.name}`);
  }

  console.log('='.repeat(80));
  console.log('\n📊 RESUMEN:');
  console.log(`  Total personajes:       ${files.length}`);
  console.log(`  ✅ Con ambas imágenes:  ${withBoth}`);
  console.log(`  🟡 Solo con avatar:     ${withAvatar}`);
  console.log(`  ⚠️  Solo con cuerpo:    ${withReference}`);
  console.log(`  ❌ Sin imágenes:        ${withNone}`);
  console.log('');
  console.log(`  🚀 Listos para producción: ${readyForProduction.length} personajes`);
  console.log(`  📸 Necesitan imágenes:     ${needingImages.length} personajes`);

  if (needingImages.length > 0) {
    console.log('\n⚠️  PERSONAJES QUE NO APARECERÁN EN PRODUCCIÓN:');
    console.log('   (hasta que tengan al menos avatar.webp)');
    console.log('');
    needingImages.forEach((name, i) => {
      console.log(`   ${i + 1}. ${name}`);
    });
  }

  console.log('\n💡 NOTA:');
  console.log('   - El seed solo cargará personajes con al menos avatar.webp');
  console.log('   - Si falta reference.webp, se usará el avatar como referencia');
  console.log('   - Puedes agregar imágenes gradualmente y re-ejecutar el seed\n');
}

checkCharacterImages().catch(console.error);
