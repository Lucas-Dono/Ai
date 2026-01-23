/**
 * Script para arreglar el contador de miembros de comunidades existentes
 * y asegurar que los owners estén agregados como miembros
 */

import { nanoid } from 'nanoid';
import { prisma } from '../lib/prisma';

async function fixCommunityMembers() {
  console.log('🔧 Arreglando membresías de comunidades...\n');

  const communities = await prisma.community.findMany({
    include: {
      CommunityMember: true,
      User: true,
    },
  });

  for (const community of communities) {
    console.log(`📋 Comunidad: ${community.name} (${community.slug})`);
    console.log(`   Owner: ${community.User.name}`);
    console.log(`   Miembros actuales: ${community.CommunityMember.length}`);
    console.log(`   Contador: ${community.memberCount}`);

    // Verificar si el owner es miembro
    const ownerIsMember = community.CommunityMember.some((m: any) => m.userId === community.ownerId);

    if (!ownerIsMember) {
      console.log('   ⚠️  Owner no es miembro, agregando...');
      await prisma.communityMember.create({
        data: {
          id: nanoid(),
          communityId: community.id,
          userId: community.ownerId,
          role: 'owner',
          canPost: true,
          canComment: true,
          canModerate: true,
        },
      });
      console.log('   ✅ Owner agregado como miembro');
    }

    // Actualizar contador
    const realCount = ownerIsMember ? community.CommunityMember.length : community.CommunityMember.length + 1;

    if (community.memberCount !== realCount) {
      console.log(`   📊 Actualizando contador: ${community.memberCount} → ${realCount}`);
      await prisma.community.update({
        where: { id: community.id },
        data: { memberCount: realCount },
      });
      console.log('   ✅ Contador actualizado');
    } else {
      console.log('   ✅ Contador correcto');
    }

    console.log('');
  }

  console.log('✅ Proceso completado\n');
}

fixCommunityMembers()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
