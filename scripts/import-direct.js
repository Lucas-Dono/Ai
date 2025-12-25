// Script directo sin verificación previa
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importCharacter(jsonPath) {
  const fileName = path.basename(jsonPath, '.json');
  console.log(`📂 ${fileName}`);

  try {
    const content = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(content);

    console.log(`   ➡️ ${data.name}`);

    const agentData = {
      id: data.id,
      generationTier: 'ultra',
      name: data.name,
      description: `${data.name} - ${data.profile?.basicInfo?.occupation || 'Personaje Premium'}`,
      kind: data.kind,
      gender: data.gender,
      systemPrompt: data.systemPrompt,
      visibility: data.visibility,
      nsfwMode: data.nsfwMode,
      nsfwLevel: data.nsfwLevel,
      personalityVariant: data.personalityVariant || 'balanced',
      avatar: data.avatar,
      referenceImageUrl: data.avatar,
      tags: data.tags,
      featured: data.isPremium,
      profile: data.profile,
      stagePrompts: data.stagePrompts,
      locationCity: data.locationCity || null,
      locationCountry: data.locationCountry || null,
    };

    // Intentar crear directamente, si falla es porque ya existe
    try {
      await prisma.agent.create({ data: agentData });
      console.log(`   ✅ Creado`);
      return true;
    } catch (createError) {
      if (createError.code === 'P2002') {
        // Ya existe, actualizar
        await prisma.agent.update({
          where: { id: data.id },
          data: agentData
        });
        console.log(`   ✅ Actualizado`);
        return true;
      }
      throw createError;
    }

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    if (error.code) console.error(`   Code: ${error.code}`);
    if (error.meta) console.error(`   Meta:`, error.meta);
    return false;
  }
}

async function main() {
  console.log('🚀 Importando personajes directamente...\n');

  const processedDir = path.join(__dirname, '..', 'Personajes', 'processed');
  const jsonFiles = fs.readdirSync(processedDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(processedDir, f));

  console.log(`📁 Total: ${jsonFiles.length} personajes\n`);

  let success = 0;
  let errors = 0;

  for (const jsonFile of jsonFiles) {
    const result = await importCharacter(jsonFile);
    if (result) success++;
    else errors++;
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Importados/Actualizados: ${success}`);
  console.log(`❌ Errores: ${errors}`);
  console.log('='.repeat(50));

  const total = await prisma.agent.count({
    where: { userId: null, featured: true }
  });

  console.log(`\n📋 Total en BD: ${total} personajes premium\n`);
}

main()
  .catch((error) => {
    console.error('💥 Error fatal:', error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
