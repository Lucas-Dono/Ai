import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CharacterJSON {
  id: string;
  name: string;
  kind: string;
  isPublic?: boolean;
  isPremium?: boolean;
  isHistorical?: boolean;
  gender: string;
  nsfwMode: boolean;
  nsfwLevel: string;
  personalityVariant?: string;
  visibility: string;
  systemPrompt: string;
  profile: any;
  tags?: string[];
  locationCity?: string;
  locationCountry?: string;
  avatar?: string;
  stagePrompts?: {
    stranger?: string;
    acquaintance?: string;
    friend?: string;
    close_friend?: string;
    intimate?: string;
    romantic?: string;
  };
}

async function seedPremiumCharacters() {
  console.log('🚀 Iniciando seed de personajes premium...\n');

  const processedDir = path.join(__dirname, '..', 'Personajes', 'processed');
  const files = fs.readdirSync(processedDir).filter(f => f.endsWith('.json'));

  console.log(`📁 Encontrados ${files.length} archivos JSON:\n`);
  files.forEach(f => console.log(`   - ${f}`));
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const filePath = path.join(processedDir, file);

    try {
      console.log(`\n📝 Procesando: ${file}`);

      const content = fs.readFileSync(filePath, 'utf-8');
      const character: CharacterJSON = JSON.parse(content);

      console.log(`   Personaje: ${character.name}`);
      console.log(`   ID: ${character.id}`);
      console.log(`   NSFW: ${character.nsfwMode} (${character.nsfwLevel})`);
      console.log(`   Variant: ${character.personalityVariant || 'N/A'}`);

      // Verificar si el personaje ya existe
      const existing = await prisma.agent.findUnique({
        where: { id: character.id }
      });

      if (existing) {
        console.log(`   ⚠️  Ya existe - actualizando...`);

        await prisma.agent.update({
          where: { id: character.id },
          data: {
            name: character.name,
            kind: character.kind,
            gender: character.gender,
            systemPrompt: character.systemPrompt,
            visibility: character.visibility,
            nsfwMode: character.nsfwMode,
            nsfwLevel: character.nsfwLevel,
            personalityVariant: character.personalityVariant,
            avatar: character.avatar,
            tags: character.tags || [],
            featured: true, // Todos los personajes premium son destacados
            profile: character.profile,
            stagePrompts: character.stagePrompts || null,
            locationCity: character.locationCity,
            locationCountry: character.locationCountry,
          }
        });

        console.log(`   ✅ Actualizado exitosamente`);
      } else {
        console.log(`   ➕ Creando nuevo personaje...`);

        await prisma.agent.create({
          data: {
            id: character.id,
            userId: null, // Personajes públicos del sistema
            teamId: null,
            kind: character.kind,
            generationTier: 'ultra', // Personajes premium son tier ultra
            name: character.name,
            description: `${character.name} - Personaje premium${character.isHistorical ? ' histórico' : ''}`,
            gender: character.gender,
            systemPrompt: character.systemPrompt,
            visibility: character.visibility,
            nsfwMode: character.nsfwMode,
            nsfwLevel: character.nsfwLevel,
            personalityVariant: character.personalityVariant,
            avatar: character.avatar,
            tags: character.tags || [],
            featured: true,
            profile: character.profile,
            stagePrompts: character.stagePrompts || null,
            locationCity: character.locationCity,
            locationCountry: character.locationCountry,
          }
        });

        console.log(`   ✅ Creado exitosamente`);
      }

      successCount++;

    } catch (error) {
      console.error(`   ❌ Error procesando ${file}:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log(`✅ Exitosos: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📁 Total procesados: ${files.length}`);
  console.log('='.repeat(60) + '\n');

  // Verificar que todos los personajes estén en la DB
  console.log('🔍 Verificando personajes en base de datos...\n');

  const allAgents = await prisma.agent.findMany({
    where: {
      userId: null,
      featured: true
    },
    select: {
      id: true,
      name: true,
      nsfwMode: true,
      nsfwLevel: true,
      visibility: true,
      personalityVariant: true,
    }
  });

  console.log(`📋 Total de personajes premium en DB: ${allAgents.length}\n`);

  allAgents.forEach(agent => {
    console.log(`   ${agent.name}`);
    console.log(`      ID: ${agent.id}`);
    console.log(`      NSFW: ${agent.nsfwMode} (${agent.nsfwLevel})`);
    console.log(`      Variant: ${agent.personalityVariant || 'N/A'}`);
    console.log(`      Visibility: ${agent.visibility}`);
    console.log('');
  });

  console.log('✨ Seed completado exitosamente!\n');
}

seedPremiumCharacters()
  .catch((error) => {
    console.error('💥 Error fatal durante seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
