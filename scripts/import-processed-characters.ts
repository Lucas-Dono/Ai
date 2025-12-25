import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ProcessedCharacter {
  id: string;
  name: string;
  kind: string;
  isPublic: boolean;
  isPremium: boolean;
  gender: string;
  nsfwMode: boolean;
  nsfwLevel: string;
  personalityVariant?: string;
  visibility: string;
  systemPrompt: string;
  profile: any;
  tags: string[];
  locationCity?: string;
  locationCountry?: string;
  avatar: string;
  stagePrompts: {
    stranger: string;
    acquaintance: string;
    friend: string;
    close_friend: string;
    intimate: string;
    romantic: string;
  };
}

async function copyCharacterImages(characterName: string, avatar: string): Promise<void> {
  // Extraer el nombre de la carpeta del avatar
  // avatar viene como "/personajes/nombre-personaje/foto.png"
  const match = avatar.match(/\/personajes\/([^\/]+)\//);
  if (!match) {
    console.log(`   ⚠️  No se pudo extraer carpeta del avatar: ${avatar}`);
    return;
  }

  const folderName = match[1];

  // Encontrar la carpeta original del personaje
  const personajesDir = path.join(__dirname, '..', 'Personajes');
  const folders = fs.readdirSync(personajesDir);

  // Buscar carpeta que coincida (insensible a mayúsculas y guiones)
  const sourceFolder = folders.find(f => {
    const normalized = f.toLowerCase().replace(/\s+/g, '-').replace(/[áä]/g, 'a').replace(/[éë]/g, 'e').replace(/[íï]/g, 'i').replace(/[óö]/g, 'o').replace(/[úü]/g, 'u');
    return normalized === folderName || f.toLowerCase() === folderName;
  });

  if (!sourceFolder) {
    console.log(`   ⚠️  No se encontró carpeta fuente para: ${folderName}`);
    return;
  }

  const sourcePath = path.join(personajesDir, sourceFolder);
  const destPath = path.join(__dirname, '..', 'public', 'personajes', folderName);

  // Crear carpeta de destino si no existe
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }

  // Copiar todas las imágenes de la carpeta
  const files = fs.readdirSync(sourcePath);
  const imageFiles = files.filter(f =>
    f.toLowerCase().endsWith('.png') ||
    f.toLowerCase().endsWith('.jpg') ||
    f.toLowerCase().endsWith('.jpeg') ||
    f.toLowerCase().endsWith('.webp')
  );

  let copiedCount = 0;
  for (const imageFile of imageFiles) {
    const src = path.join(sourcePath, imageFile);
    const dest = path.join(destPath, imageFile);

    try {
      fs.copyFileSync(src, dest);
      copiedCount++;
    } catch (error) {
      console.log(`   ⚠️  Error copiando ${imageFile}:`, error instanceof Error ? error.message : error);
    }
  }

  if (copiedCount > 0) {
    console.log(`   📸 Copiadas ${copiedCount} imágenes a public/personajes/${folderName}/`);
  }
}

async function importCharacter(jsonPath: string): Promise<void> {
  const fileName = path.basename(jsonPath, '.json');
  console.log(`\n📂 Procesando: ${fileName}`);

  try {
    // Leer JSON
    const content = fs.readFileSync(jsonPath, 'utf-8');
    const data: ProcessedCharacter = JSON.parse(content);

    console.log(`   Personaje: ${data.name}`);

    // Copiar imágenes
    if (data.avatar) {
      await copyCharacterImages(data.name, data.avatar);
    }

    // Verificar si el personaje ya existe
    const existing = await prisma.agent.findUnique({
      where: { id: data.id }
    });

    const agentData = {
      name: data.name,
      description: `${data.name} - ${data.profile?.basicInfo?.occupation || 'Personaje Premium'}`,
      kind: data.kind as any,
      gender: data.gender,
      systemPrompt: data.systemPrompt,
      visibility: data.visibility as any,
      nsfwMode: data.nsfwMode,
      nsfwLevel: data.nsfwLevel as any,
      personalityVariant: data.personalityVariant || 'balanced',
      avatar: data.avatar,
      referenceImageUrl: data.avatar, // Usar el mismo avatar como referencia por ahora
      tags: data.tags,
      featured: data.isPremium, // featured es el campo correcto en el schema
      profile: data.profile,
      stagePrompts: data.stagePrompts,
      locationCity: data.locationCity || null,
      locationCountry: data.locationCountry || null,
    };

    if (existing) {
      console.log(`   ⚠️  Ya existe en BD - actualizando...`);

      await prisma.agent.update({
        where: { id: data.id },
        data: agentData
      });

      console.log(`   ✅ Actualizado exitosamente`);
    } else {
      console.log(`   ➕ Creando nuevo personaje...`);

      await prisma.agent.create({
        data: {
          id: data.id,
          userId: null,
          teamId: null,
          generationTier: 'ultra',
          ...agentData
        }
      });

      console.log(`   ✅ Creado exitosamente`);
    }

  } catch (error) {
    console.error(`   ❌ Error:`, error instanceof Error ? error.message : error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Iniciando importación de personajes procesados...\n');

  const processedDir = path.join(__dirname, '..', 'Personajes', 'processed');

  if (!fs.existsSync(processedDir)) {
    console.error('❌ No existe la carpeta Personajes/processed/');
    process.exit(1);
  }

  const jsonFiles = fs.readdirSync(processedDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(processedDir, f));

  console.log(`📁 Encontrados ${jsonFiles.length} personajes para importar\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const jsonFile of jsonFiles) {
    try {
      await importCharacter(jsonFile);
      successCount++;
    } catch (error) {
      console.error(`❌ Error procesando ${path.basename(jsonFile)}:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log(`✅ Importados exitosamente: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📁 Total procesado: ${jsonFiles.length}`);
  console.log('='.repeat(60) + '\n');

  // Verificar total en BD
  const total = await prisma.agent.count({
    where: {
      userId: null,
      featured: true
    }
  });

  console.log(`📋 Total de personajes premium en BD: ${total}\n`);
  console.log('✨ Proceso completado!\n');
}

main()
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
