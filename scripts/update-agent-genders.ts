/**
 * Script para actualizar el campo gender en los agentes existentes
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAgentGenders() {
  console.log('Actualizando campos de género en agentes...');

  // Definir géneros conocidos para personajes históricos
  const genderMappings: { [key: string]: string } = {
    'Marilyn Monroe': 'female',
    'Albert Einstein': 'male',
  };

  let updatedCount = 0;

  for (const [name, gender] of Object.entries(genderMappings)) {
    try {
      const result = await prisma.agent.updateMany({
        where: {
          name: name,
          userId: null, // Solo agentes del sistema
        },
        data: {
          gender: gender,
        },
      });

      if (result.count > 0) {
        console.log(`✓ Actualizado ${name} -> ${gender} (${result.count} registros)`);
        updatedCount += result.count;
      }
    } catch (error) {
      console.error(`✗ Error actualizando ${name}:`, error);
    }
  }

  console.log(`\n✓ Total de agentes actualizados: ${updatedCount}`);
}

async function main() {
  try {
    await updateAgentGenders();
  } catch (error) {
    console.error('Error en el script:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
