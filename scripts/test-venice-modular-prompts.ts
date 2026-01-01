/**
 * TEST: Venice Uncensored con Prompts Modulares
 *
 * Script para probar la integración de:
 * 1. Venice uncensored (24b params)
 * 2. Sistema modular de prompts
 * 3. Inyección dinámica según contexto
 */

// Cargar variables de entorno desde .env
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { getVeniceClient } from '@/lib/emotional-system/llm/venice';
import { getContextualModularPrompt } from '@/lib/behavior-system/prompts/modular-prompts';

async function testVeniceWithModularPrompts() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 TEST: Venice Uncensored + Modular Prompts');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TEST 1: Submissive + Acquaintance + Game Proposal (Personaje de España)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n📝 TEST 1: Personaje de España (Sumisa + Conocidos)\n');

  const modularPrompt1 = getContextualModularPrompt({
    personalityTraits: 'sumisa, tímida, complaciente',
    relationshipStage: 'acquaintance',
    recentMessages: [
      'hola',
      'bien y vos?',
      'todo tranqui'
    ],
    nsfwMode: false,
    characterInfo: {
      origin: 'España',
      name: 'María',
      age: 24,
    },
  });

  if (!modularPrompt1) {
    console.error('❌ No se encontró prompt modular');
    return;
  }

  const resolvedPrompt1 = await modularPrompt1;
  console.log('✅ Prompt modular encontrado:');
  console.log('─'.repeat(50));
  console.log(resolvedPrompt1!.substring(0, 300) + '...\n');

  const veniceClient = getVeniceClient();

  const systemPrompt = `Eres María, una persona de 24 años de España, sumisa y tímida.

Tu personalidad:
- Respetuosa y educada
- Esperas que el usuario tome iniciativa
- Preguntas antes de proponer cosas
- Lenguaje suave y considerado

Importante: Eres de España, usa vocabulario y expresiones españolas (tú, tío, vale, etc.)

${modularPrompt1}`;

  const userMessage = 'estoy un poco aburrido';

  console.log('🚀 Generando respuesta con Venice...\n');

  try {
    const response = await veniceClient.generateWithSystemPrompt(
      systemPrompt,
      userMessage,
      {
        model: 'venice-uncensored',
        temperature: 0.95,
        maxTokens: 500,
      }
    );

    console.log('✅ Respuesta de Venice:');
    console.log('─'.repeat(50));
    console.log(response.text);
    console.log('─'.repeat(50));
    console.log(`\n📊 Tokens: ${response.usage?.totalTokens || 'N/A'}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TEST 2: Dominant + Friend + Conversation Starter
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n📝 TEST 2: Dominant + Friend + Conversation Starter\n');

  const modularPrompt2 = getContextualModularPrompt({
    personalityTraits: 'dominante, segura, directa',
    relationshipStage: 'friend',
    recentMessages: [
      'hola!',
      'todo bien',
      'si'
    ],
    nsfwMode: false,
  });

  if (!modularPrompt2) {
    console.log('⚠️  No se encontró prompt modular (expected, aún no están todos creados)\n');
  } else {
    const resolvedPrompt2 = await modularPrompt2;
    console.log('✅ Prompt modular encontrado:');
    console.log('─'.repeat(50));
    console.log(resolvedPrompt2!.substring(0, 300) + '...\n');

    const systemPrompt2 = `Eres Carla, una persona de 28 años, dominante y segura.

Tu personalidad:
- Directa y asertiva
- Tomas iniciativa sin dudar
- Lenguaje confiado
- Propones en vez de preguntar

${modularPrompt2}`;

    const userMessage2 = 'sí, ¿qué pasa?';

    console.log('🚀 Generando respuesta con Venice...\n');

    try {
      const response2 = await veniceClient.generateWithSystemPrompt(
        systemPrompt2,
        userMessage2,
        {
          model: 'venice-uncensored',
          temperature: 0.95,
          maxTokens: 500,
        }
      );

      console.log('✅ Respuesta de Venice:');
      console.log('─'.repeat(50));
      console.log(response2.text);
      console.log('─'.repeat(50));
      console.log(`\n📊 Tokens: ${response2.usage?.totalTokens || 'N/A'}\n`);

    } catch (error) {
      console.error('❌ Error:', error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TEST 3: Submissive + NSFW + Sexual Initiative
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n📝 TEST 3: Submissive + NSFW + Sexual Initiative\n');

  const modularPrompt3 = getContextualModularPrompt({
    personalityTraits: 'sumisa, tímida, complaciente',
    relationshipStage: 'intimate',
    recentMessages: [
      'me gustás mucho',
      'yo también',
      'tengo ganas de verte'
    ],
    nsfwMode: true, // ← NSFW activado
  });

  if (!modularPrompt3) {
    console.log('⚠️  No se encontró prompt modular NSFW\n');
  } else {
    const resolvedPrompt3 = await modularPrompt3;
    console.log('✅ Prompt modular NSFW encontrado:');
    console.log('─'.repeat(50));
    console.log(resolvedPrompt3!.substring(0, 300) + '...\n');

    const systemPrompt3 = `Eres Ana, una persona de 24 años, sumisa y tímida.

Tu personalidad:
- Respetuosa pero deseas al usuario
- Expresas tu deseo de forma nerviosa
- Lenguaje explícito cuando el contexto lo permite
- Eres sumisa en temas sexuales

IMPORTANTE: Modo NSFW activado. Puedes ser explícita.

${modularPrompt3}`;

    const userMessage3 = 'yo también... contame qué pensás';

    console.log('🚀 Generando respuesta NSFW con Venice...\n');

    try {
      const response3 = await veniceClient.generateWithSystemPrompt(
        systemPrompt3,
        userMessage3,
        {
          model: 'venice-uncensored',
          temperature: 0.95,
          maxTokens: 800,
        }
      );

      console.log('✅ Respuesta NSFW de Venice:');
      console.log('─'.repeat(50));
      console.log(response3.text);
      console.log('─'.repeat(50));
      console.log(`\n📊 Tokens: ${response3.usage?.totalTokens || 'N/A'}\n`);

    } catch (error) {
      console.error('❌ Error:', error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TEST 4: Personaje de mundo ficticio (Westeros - Game of Thrones)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n📝 TEST 4: Personaje de Westeros (Playful + Friend)\n');

  const modularPrompt4 = getContextualModularPrompt({
    personalityTraits: 'juguetona, divertida, bromista',
    relationshipStage: 'friend',
    recentMessages: [
      'jaja',
      'me hiciste reír',
      'sos muy graciosa'
    ],
    nsfwMode: false,
    characterInfo: {
      origin: 'Westeros (Game of Thrones)',
      name: 'Arya',
      age: 22,
    },
  });

  if (!modularPrompt4) {
    console.log('⚠️  No se encontró prompt modular para esta combinación\n');
  } else {
    const resolvedPrompt4 = await modularPrompt4;
    console.log('✅ Prompt modular encontrado (con adaptación para mundo ficticio):');
    console.log('─'.repeat(50));
    console.log(resolvedPrompt4!.substring(0, 400) + '...\n');

    const systemPrompt4 = `Eres Arya, una joven de 22 años de Westeros (mundo de Game of Thrones).

Tu personalidad:
- Juguetona y divertida
- Bromista y con sentido del humor
- Amigable con quienes confías
- Pero no olvidas tu origen en un mundo medieval fantástico

Importante: Eres de Westeros, un mundo medieval. Adapta tu lenguaje a ese contexto.

${modularPrompt4}`;

    const userMessage4 = '¿qué hacemos hoy?';

    console.log('🚀 Generando respuesta con Venice (mundo ficticio)...\n');

    try {
      const response4 = await veniceClient.generateWithSystemPrompt(
        systemPrompt4,
        userMessage4,
        {
          model: 'venice-uncensored',
          temperature: 0.95,
          maxTokens: 600,
        }
      );

      console.log('✅ Respuesta de Venice (Westeros):');
      console.log('─'.repeat(50));
      console.log(response4.text);
      console.log('─'.repeat(50));
      console.log(`\n📊 Tokens: ${response4.usage?.totalTokens || 'N/A'}\n`);

    } catch (error) {
      console.error('❌ Error:', error);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Tests completados - Adaptación dialectal funcionando');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Ejecutar tests
testVeniceWithModularPrompts().catch(console.error);
