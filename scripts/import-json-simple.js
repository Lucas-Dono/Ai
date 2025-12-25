// Script simple en JavaScript puro para importar los personajes
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function copyImages(characterName, avatar) {
  const match = avatar.match(/\/personajes\/([^\/]+)\//);
  if (!match) return;

  const folderName = match[1];
  console.log(`   📸 Imágenes ya copiadas para ${folderName}`);
}

async function importCharacter(jsonPath) {
  const fileName = path.basename(jsonPath, '.json');
  console.log(`\n📂 ${fileName}`);

  try {
    const content = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(content);

    console.log(`   ➡️ ${data.name}`);

    await copyImages(data.name, data.avatar);

    // Verificar si ya existe
    const existing = await prisma.agent.findUnique({
      where: { id: data.id }
    });

    const agentData = {
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
      isPremium: data.isPremium,
      profile: data.profile,
      stagePrompts: data.stagePrompts,
      locationCity: data.locationCity || null,
      locationCountry: data.locationCountry || null,
    };

    if (existing) {
      await prisma.agent.update({
        where: { id: data.id },
        data: agentData
      });
      console.log(`   ✅ Actualizado`);
    } else {
      await prisma.agent.create({
        data: {
          id: data.id,
          userId: null,
          teamId: null,
          generationTier: 'ultra',
          ...agentData
        }
      });
      console.log(`   ✅ Creado`);
    }

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Importando personajes...\n');

  const processedDir = path.join(__dirname, '..', 'Personajes', 'processed');
  const jsonFiles = fs.readdirSync(processedDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(processedDir, f));

  console.log(`📁 Total: ${jsonFiles.length} personajes\n`);

  let success = 0;
  let errors = 0;

  for (const jsonFile of jsonFiles) {
    try {
      await importCharacter(jsonFile);
      success++;
    } catch (error) {
      console.error(`❌ ${path.basename(jsonFile)}: ${error.message}`);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Importados: ${success}`);
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
