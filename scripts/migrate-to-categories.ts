import { PrismaClient } from '@prisma/client';
import type { CategoryKey } from '../lib/categories';

const prisma = new PrismaClient();

/**
 * Mapeo de tags antiguos a nuevas categorías
 */
const tagToCategoryMap: Record<string, CategoryKey> = {
  // Filosofía y Sabiduría
  'philosophy': 'philosophy',
  'philosopher': 'philosophy',
  'filosofía': 'philosophy',
  'filósofo': 'philosophy',
  'wisdom': 'wisdom',
  'sabiduría': 'wisdom',
  'spiritual': 'wisdom',
  'espiritual': 'wisdom',
  'meditation': 'wisdom',
  'meditación': 'wisdom',
  'mindfulness': 'wisdom',

  // Ciencia y Física
  'science': 'science',
  'scientist': 'science',
  'ciencia': 'science',
  'científico': 'science',
  'physicist': 'physics',
  'physics': 'physics',
  'física': 'physics',
  'físico': 'physics',
  'mathematician': 'physics',
  'matemático': 'physics',

  // Arte y Literatura
  'art': 'art',
  'artist': 'art',
  'arte': 'art',
  'artista': 'art',
  'painter': 'art',
  'painting': 'art',
  'literature': 'literature',
  'writer': 'literature',
  'poet': 'literature',
  'literatura': 'literature',
  'escritor': 'literature',
  'poeta': 'literature',

  // Música y Teatro
  'music': 'music',
  'musician': 'music',
  'composer': 'music',
  'música': 'music',
  'músico': 'music',
  'compositor': 'music',
  'theater': 'theater',
  'theatre': 'theater',
  'actor': 'theater',
  'teatro': 'theater',

  // Psicología
  'psychology': 'psychology',
  'psychologist': 'psychology',
  'psicología': 'psychology',
  'therapist': 'psychology',
  'therapy': 'psychology',
  'mental-health': 'psychology',

  // Historia
  'history': 'history',
  'historical': 'history',
  'historical-figure': 'history',
  'historia': 'history',
  'histórico': 'history',
  'histórica': 'history',

  // Romance
  'romance': 'romance',
  'romantic': 'romance',
  'love': 'romance',
  'relationship': 'romance',

  // Tecnología
  'technology': 'technology',
  'tech': 'technology',
  'programmer': 'technology',
  'engineer': 'technology',
  'tecnología': 'technology',
  'ingeniero': 'technology',

  // Negocios
  'business': 'business',
  'entrepreneur': 'business',
  'negocios': 'business',
  'emprendedor': 'business',

  // Gaming
  'gaming': 'gaming',
  'gamer': 'gaming',
  'video-games': 'gaming',
  'game-designer': 'gaming',

  // Amistad
  'friendship': 'friendship',
  'friend': 'friendship',
  'amistad': 'friendship',
  'amigo': 'friendship',
  'companion': 'friendship',

  // Fantasía y Aventura
  'fantasy': 'fantasy',
  'fantasía': 'fantasy',
  'magic': 'fantasy',
  'adventure': 'adventure',
  'adventurer': 'adventure',
  'explorer': 'adventure',
  'aventura': 'adventure',

  // Deportes
  'sports': 'sports',
  'athlete': 'sports',
  'deporte': 'sports',

  // Gastronomía
  'gastronomy': 'gastronomy',
  'chef': 'gastronomy',
  'culinary': 'gastronomy',
  'gastronomía': 'gastronomy',

  // Naturaleza
  'nature': 'nature',
  'environmental': 'nature',
  'naturaleza': 'nature',
  'ecologist': 'nature',
};

/**
 * Analiza el nombre y descripción para sugerir categorías
 */
function inferCategoriesFromText(name: string, description?: string): CategoryKey[] {
  const text = `${name} ${description || ''}`.toLowerCase();
  const categories: Set<CategoryKey> = new Set();

  // Palabras clave para inferir categorías
  const keywords: Record<string, CategoryKey> = {
    'filósof': 'philosophy',
    'philosoph': 'philosophy',
    'sabio': 'wisdom',
    'wise': 'wisdom',
    'científic': 'science',
    'scientist': 'science',
    'físic': 'physics',
    'physicist': 'physics',
    'artist': 'art',
    'pintor': 'art',
    'paint': 'art',
    'escrit': 'literature',
    'writer': 'literature',
    'poet': 'literature',
    'músic': 'music',
    'music': 'music',
    'compos': 'music',
    'psicólog': 'psychology',
    'psycholog': 'psychology',
    'terap': 'psychology',
    'therap': 'psychology',
    'históric': 'history',
    'historic': 'history',
    'roman': 'romance',
    'love': 'romance',
    'tecnolog': 'technology',
    'technolog': 'technology',
    'program': 'technology',
    'negocio': 'business',
    'business': 'business',
    'empresar': 'business',
    'gaming': 'gaming',
    'gamer': 'gaming',
    'videojueg': 'gaming',
    'amig': 'friendship',
    'friend': 'friendship',
    'fantas': 'fantasy',
    'magic': 'fantasy',
    'aventur': 'adventure',
    'adventur': 'adventure',
    'explor': 'adventure',
    'deport': 'sports',
    'sport': 'sports',
    'chef': 'gastronomy',
    'cocin': 'gastronomy',
    'culinar': 'gastronomy',
    'natural': 'nature',
    'ambient': 'nature',
    'ecolog': 'nature',
  };

  for (const [keyword, category] of Object.entries(keywords)) {
    if (text.includes(keyword)) {
      categories.add(category);
      if (categories.size >= 2) break;
    }
  }

  return Array.from(categories);
}

/**
 * Asigna categorías a un personaje basándose en sus tags actuales
 */
function assignCategories(agent: {
  name: string;
  description?: string;
  tags?: any;
}): CategoryKey[] {
  const categories: Set<CategoryKey> = new Set();

  // 1. Mapear tags existentes
  if (agent.tags && Array.isArray(agent.tags)) {
    for (const tag of agent.tags) {
      const normalizedTag = tag.toLowerCase().trim();
      const category = tagToCategoryMap[normalizedTag];
      if (category) {
        categories.add(category);
        if (categories.size >= 2) return Array.from(categories);
      }
    }
  }

  // 2. Si no hay suficientes categorías, inferir del texto
  if (categories.size < 2) {
    const inferred = inferCategoriesFromText(agent.name, agent.description);
    inferred.forEach(cat => {
      if (categories.size < 2) {
        categories.add(cat);
      }
    });
  }

  // 3. Si aún no hay categorías, asignar por defecto
  if (categories.size === 0) {
    categories.add('friendship');
  }

  return Array.from(categories).slice(0, 2);
}

async function main() {
  console.log('🚀 Iniciando migración de tags a categorías...\n');

  // Obtener todos los personajes públicos
  const agents = await prisma.agent.findMany({
    where: {
      kind: 'companion',
      userId: null
    },
    select: {
      id: true,
      name: true,
      description: true,
      tags: true,
      categories: true
    }
  });

  console.log(`📊 Total de personajes a procesar: ${agents.length}\n`);

  let updated = 0;
  let skipped = 0;
  const categoryStats = new Map<CategoryKey, number>();

  for (const agent of agents) {
    // Skip si ya tiene categorías asignadas
    if (agent.categories && agent.categories.length > 0) {
      console.log(`⏭️  ${agent.name} - Ya tiene categorías: [${agent.categories.join(', ')}]`);
      skipped++;
      continue;
    }

    // Asignar categorías
    const newCategories = assignCategories(agent);

    // Actualizar en DB
    await prisma.agent.update({
      where: { id: agent.id },
      data: { categories: newCategories }
    });

    // Estadísticas
    newCategories.forEach(cat => {
      categoryStats.set(cat, (categoryStats.get(cat) || 0) + 1);
    });

    console.log(`✅ ${agent.name} - Asignadas: [${newCategories.join(', ')}]`);
    updated++;
  }

  console.log('\n' + '='.repeat(60));
  console.log('📈 RESUMEN DE MIGRACIÓN');
  console.log('='.repeat(60));
  console.log(`✅ Actualizados: ${updated}`);
  console.log(`⏭️  Omitidos (ya tenían categorías): ${skipped}`);
  console.log(`📊 Total procesados: ${agents.length}`);

  console.log('\n📊 DISTRIBUCIÓN DE CATEGORÍAS:');
  const sortedStats = Array.from(categoryStats.entries()).sort((a, b) => b[1] - a[1]);
  sortedStats.forEach(([category, count]) => {
    console.log(`  • ${category}: ${count} personajes`);
  });

  await prisma.$disconnect();
}

main()
  .then(() => {
    console.log('\n✨ Migración completada exitosamente!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error durante la migración:', error);
    process.exit(1);
  });
