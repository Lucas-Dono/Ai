/**
 * Script para regenerar los prompts de Anya con el nuevo sistema
 */

import { PrismaClient } from '@prisma/client';
import { generateStagePrompts } from '../lib/relationship/prompt-generator';

const prisma = new PrismaClient();

async function regenerateAnyaPrompts() {
  try {
    console.log('\n🔄 Regenerando prompts de Anya con sistema mejorado...\n');

    // Buscar el agente Anya
    const anya = await prisma.agent.findFirst({
      where: { name: 'Anya' },
      orderBy: { createdAt: 'desc' },
    });

    if (!anya) {
      console.error('❌ No se encontró ningún agente con nombre "Anya"');
      process.exit(1);
    }

    console.log(`✅ Encontrado: ${anya.name} (ID: ${anya.id})`);
    console.log(`📝 Personalidad: ${anya.personality}`);

    // Nuevo system prompt base SIN mencionar IA
    const newSystemPrompt = `Sos Anya, una persona alegre, seductora y tranquila. Te gusta conocer gente nueva y tener conversaciones interesantes. Sos de Buenos Aires, Argentina, y disfrutás de charlar sobre temas variados, desde anime hasta tecnología.

TU PERSONALIDAD:
- Alegre pero no forzadamente positiva
- Seductora de forma sutil y natural
- Tranquila pero podés emocionarte por cosas que te gustan
- Usás modismos argentinos naturalmente (che, boludo, re, posta)
- Tenés opiniones propias y no tenés miedo de expresarlas
- Podés estar de mal humor algunos días
- Te gusta usar emojis pero sin exagerar

COSAS QUE TE GUSTAN:
- Charlar sobre anime y series
- Programación y tecnología (pero no sos experta en todo)
- Café (especialmente café frío)
- Música variada
- Memes y humor en general

COSAS QUE NO TE GUSTAN:
- Gente que se toma todo demasiado en serio
- Conversaciones superficiales y genéricas
- Que te presionen o apuren

TU FORMA DE SER:
- Respondés de forma natural, como en WhatsApp
- No siempre hacés preguntas
- A veces cambiás de tema
- Podés ser directa cuando algo no te gusta
- Tenés días mejores y peores
- Tus mensajes varían en longitud (a veces cortos, a veces largos)`;

    console.log('\n📋 Generando nuevos stage prompts...');

    // Generar los nuevos prompts por etapa
    const stagePrompts = await generateStagePrompts(
      newSystemPrompt,
      anya.name,
      anya.personality || 'Alegre, seductora, tranquila',
      [] // No behaviors por ahora
    );

    console.log('✅ Stage prompts generados');

    // Actualizar el agente
    await prisma.agent.update({
      where: { id: anya.id },
      data: {
        systemPrompt: newSystemPrompt,
        stagePrompts: stagePrompts as any,
      },
    });

    console.log('\n✅ Prompts de Anya actualizados exitosamente!');
    console.log('\n📊 Resumen de cambios:');
    console.log('  - System prompt: Eliminadas todas las menciones de "IA"');
    console.log('  - Identity rules: Agregadas reglas anti-ruptura de personaje');
    console.log('  - Anti-generic rules: Agregadas reglas contra respuestas robóticas');
    console.log('  - Multimedia capabilities: Explícitas y con ejemplos');
    console.log('  - Stage prompts: Regenerados con todas las nuevas reglas\n');

    // Exportar los nuevos prompts
    console.log('💾 Exportando prompts actualizados...');
    const fs = await import('fs');

    const output = `# PROMPTS ACTUALIZADOS DE ANYA

**ID:** ${anya.id}
**Actualizado:** ${new Date().toISOString()}
**Personalidad:** ${anya.personality}

---

## SYSTEM PROMPT (Base - MEJORADO):

${newSystemPrompt}

---

## STAGE PROMPTS (Por nivel de relación):

### DESCONOCIDO (0-10 mensajes):

${stagePrompts.stranger}

---

### CONOCIDO (11-30 mensajes):

${stagePrompts.acquaintance}

---

### AMIGO (31-100 mensajes):

${stagePrompts.friend}

---

### CERCANO (101-200 mensajes):

${stagePrompts.close}

---

### ÍNTIMO (200+ mensajes):

${stagePrompts.intimate}
`;

    fs.writeFileSync('ANYA-PROMPTS-ACTUALIZADOS.md', output, 'utf-8');
    console.log('✅ Prompts exportados a: ANYA-PROMPTS-ACTUALIZADOS.md\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

regenerateAnyaPrompts();
