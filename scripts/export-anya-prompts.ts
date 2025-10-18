/**
 * Script para exportar todos los prompts del agente Anya
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function exportAnyaPrompts() {
  try {
    // Buscar el agente Anya más reciente
    const anya = await prisma.agent.findFirst({
      where: { name: 'Anya' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        personality: true,
        systemPrompt: true,
        stagePrompts: true,
        createdAt: true,
      }
    });

    if (!anya) {
      console.error('No se encontró ningún agente con nombre "Anya"');
      process.exit(1);
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`PROMPTS DEL AGENTE: ${anya.name}`);
    console.log(`ID: ${anya.id}`);
    console.log(`Creado: ${anya.createdAt}`);
    console.log(`Personalidad: ${anya.personality}`);
    console.log(`${'='.repeat(80)}\n`);

    // System Prompt
    console.log('## SYSTEM PROMPT (Base):\n');
    console.log(anya.systemPrompt);
    console.log('\n' + '='.repeat(80) + '\n');

    // Stage Prompts
    const stagePrompts = anya.stagePrompts as any;
    if (stagePrompts) {
      console.log('## STAGE PROMPTS (Por nivel de relación):\n');

      const stages = ['stranger', 'acquaintance', 'friend', 'close', 'intimate'];
      const stageNames = {
        stranger: 'DESCONOCIDO (0-5 mensajes)',
        acquaintance: 'CONOCIDO (6-15 mensajes)',
        friend: 'AMIGO (16-30 mensajes)',
        close: 'CERCANO (31-60 mensajes)',
        intimate: 'ÍNTIMO (61+ mensajes)'
      };

      for (const stage of stages) {
        if (stagePrompts[stage]) {
          console.log(`\n### ${stageNames[stage as keyof typeof stageNames]}:\n`);
          console.log(stagePrompts[stage]);
          console.log('\n' + '-'.repeat(80));
        }
      }
    }

    // Guardar en archivo
    const output = `# PROMPTS COMPLETOS DE ANYA

**ID:** ${anya.id}
**Creado:** ${anya.createdAt}
**Personalidad:** ${anya.personality}

---

## SYSTEM PROMPT (Base):

${anya.systemPrompt}

---

## STAGE PROMPTS (Por nivel de relación):

### DESCONOCIDO (0-5 mensajes):

${stagePrompts?.stranger || 'N/A'}

---

### CONOCIDO (6-15 mensajes):

${stagePrompts?.acquaintance || 'N/A'}

---

### AMIGO (16-30 mensajes):

${stagePrompts?.friend || 'N/A'}

---

### CERCANO (31-60 mensajes):

${stagePrompts?.close || 'N/A'}

---

### ÍNTIMO (61+ mensajes):

${stagePrompts?.intimate || 'N/A'}
`;

    fs.writeFileSync('ANYA-PROMPTS-COMPLETOS.md', output, 'utf-8');
    console.log('\n✅ Prompts exportados a: ANYA-PROMPTS-COMPLETOS.md\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportAnyaPrompts();
