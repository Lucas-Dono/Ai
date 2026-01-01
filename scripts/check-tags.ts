import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const agents = await prisma.agent.findMany({
    where: {
      kind: 'companion',
      userId: null // Solo públicos
    },
    select: {
      id: true,
      name: true,
      tags: true,
      featured: true,
      generationTier: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  // Agrupar por tags
  const tagStats = new Map<string, number>();
  const agentsByTag = new Map<string, string[]>();

  agents.forEach(agent => {
    const tags = (agent.tags as string[]) || [];
    tags.forEach((tag: string) => {
      tagStats.set(tag, (tagStats.get(tag) || 0) + 1);
      if (!agentsByTag.has(tag)) {
        agentsByTag.set(tag, []);
      }
      agentsByTag.get(tag)!.push(agent.name);
    });
  });

  console.log('=== RESUMEN DE ETIQUETAS ===');
  console.log('Total de personajes públicos:', agents.length);
  console.log('\nEtiquetas únicas encontradas:', tagStats.size);
  console.log('\nDistribución de etiquetas:');

  const sortedTags = Array.from(tagStats.entries()).sort((a, b) => b[1] - a[1]);
  sortedTags.forEach(([tag, count]) => {
    console.log(`  • ${tag}: ${count} personajes`);
  });

  console.log('\n=== PERSONAJES POR ETIQUETA ===');
  sortedTags.forEach(([tag, count]) => {
    console.log(`\n[${tag}] (${count} personajes):`);
    const tagAgents = agentsByTag.get(tag)!.slice(0, 10);
    tagAgents.forEach(name => console.log(`  - ${name}`));
    if (agentsByTag.get(tag)!.length > 10) {
      console.log(`  ... y ${agentsByTag.get(tag)!.length - 10} más`);
    }
  });

  console.log('\n=== PERSONAJES SIN ETIQUETAS ===');
  const withoutTags = agents.filter(a => !a.tags || (a.tags as string[]).length === 0);
  console.log(`Total: ${withoutTags.length}`);
  withoutTags.slice(0, 20).forEach(a => {
    console.log(`  - ${a.name} (tier: ${a.generationTier || 'none'}, featured: ${a.featured})`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
