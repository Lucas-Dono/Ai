#!/usr/bin/env node

/**
 * Script de Testing para APIs Multimodales
 *
 * Verifica que las APIs estén correctamente configuradas
 * y funcionando sin necesidad de interfaz gráfica.
 *
 * USO:
 *   node scripts/test-multimodal-apis.js
 *
 * REQUISITOS:
 *   - Servidor corriendo en http://localhost:3000
 *   - Usuario autenticado (obtener cookie de session)
 *   - Agent ID válido
 */

const https = require('https');
const http = require('http');

// CONFIGURACIÓN
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const AGENT_ID = process.env.TEST_AGENT_ID || 'test-agent-id';
const SESSION_COOKIE = process.env.SESSION_COOKIE || '';

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const lib = urlObj.protocol === 'https:' ? https : http;

    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function testVoiceConfig() {
  log('\n📋 Test 1: Voice Config API', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  try {
    const url = `${BASE_URL}/api/chat/voice/config?agentId=${AGENT_ID}`;
    const response = await makeRequest(url, {
      method: 'GET',
      headers: {
        Cookie: SESSION_COOKIE,
      },
    });

    if (response.status === 200 && response.body.success) {
      log('✅ Voice Config API: OK', 'green');
      log(`   Voice ID: ${response.body.voiceConfig.voiceId}`, 'blue');
      log(`   Voice Name: ${response.body.voiceConfig.voiceName}`, 'blue');
      log(`   Input Enabled: ${response.body.voiceConfig.enableVoiceInput}`, 'blue');
      log(`   Output Enabled: ${response.body.voiceConfig.enableVoiceOutput}`, 'blue');
      return true;
    } else if (response.status === 404) {
      log('⚠️  Voice Config API: Agent no tiene voz configurada', 'yellow');
      log('   Necesitas crear un VoiceConfig para este agente', 'yellow');
      return false;
    } else if (response.status === 401) {
      log('❌ Voice Config API: No autenticado', 'red');
      log('   Necesitas proporcionar SESSION_COOKIE válida', 'red');
      return false;
    } else {
      log(`❌ Voice Config API: Error ${response.status}`, 'red');
      log(`   ${JSON.stringify(response.body)}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Voice Config API: Error de conexión`, 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function testMultimodalMessage() {
  log('\n💬 Test 2: Multimodal Message API', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  try {
    const url = `${BASE_URL}/api/agents/${AGENT_ID}/message-multimodal`;
    const body = JSON.stringify({
      message: 'Hola, este es un mensaje de prueba.',
    });

    const response = await makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: SESSION_COOKIE,
      },
      body,
    });

    if (response.status === 200 && response.body.success) {
      log('✅ Multimodal Message API: OK', 'green');
      log(`   Response Text: "${response.body.response.text.substring(0, 50)}..."`, 'blue');
      log(`   Emotion: ${response.body.response.emotion.type} (${response.body.response.emotion.intensity})`, 'blue');
      log(`   Has Audio: ${!!response.body.response.audioUrl}`, 'blue');
      log(`   Has Image: ${!!response.body.response.imageUrl}`, 'blue');
      return true;
    } else if (response.status === 404) {
      log('❌ Multimodal Message API: Agent no encontrado', 'red');
      return false;
    } else if (response.status === 401) {
      log('❌ Multimodal Message API: No autenticado', 'red');
      log('   Necesitas proporcionar SESSION_COOKIE válida', 'red');
      return false;
    } else {
      log(`❌ Multimodal Message API: Error ${response.status}`, 'red');
      log(`   ${JSON.stringify(response.body)}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Multimodal Message API: Error de conexión`, 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function checkEnvVars() {
  log('\n🔐 Verificando Variables de Entorno', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  const requiredVars = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
  };

  let allPresent = true;

  for (const [key, value] of Object.entries(requiredVars)) {
    if (value) {
      log(`✅ ${key}: Configurada`, 'green');
    } else {
      log(`❌ ${key}: NO CONFIGURADA`, 'red');
      allPresent = false;
    }
  }

  return allPresent;
}

async function main() {
  log('═══════════════════════════════════════════════════════', 'blue');
  log('     TEST DE APIS MULTIMODALES', 'blue');
  log('═══════════════════════════════════════════════════════', 'blue');

  // Check environment variables
  const envOk = await checkEnvVars();

  if (!envOk) {
    log('\n⚠️  Algunas variables de entorno no están configuradas', 'yellow');
    log('   Las APIs pueden no funcionar correctamente', 'yellow');
  }

  // Test Voice Config
  const voiceConfigOk = await testVoiceConfig();

  // Test Multimodal Message
  const multimodalOk = await testMultimodalMessage();

  // Summary
  log('\n═══════════════════════════════════════════════════════', 'blue');
  log('     RESUMEN', 'blue');
  log('═══════════════════════════════════════════════════════', 'blue');

  const results = {
    'Voice Config API': voiceConfigOk,
    'Multimodal Message API': multimodalOk,
  };

  for (const [test, passed] of Object.entries(results)) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${status} - ${test}`, color);
  }

  const allPassed = Object.values(results).every((v) => v);

  if (allPassed) {
    log('\n🎉 Todas las APIs están funcionando correctamente!', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Algunas APIs no están funcionando', 'yellow');
    log('   Revisa los errores arriba y la documentación', 'yellow');
    process.exit(1);
  }
}

// Help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Test de APIs Multimodales

USO:
  node scripts/test-multimodal-apis.js

VARIABLES DE ENTORNO:
  BASE_URL         - URL base del servidor (default: http://localhost:3000)
  TEST_AGENT_ID    - ID del agente para testing (default: test-agent-id)
  SESSION_COOKIE   - Cookie de sesión para autenticación (requerida)
  OPENAI_API_KEY   - API key de OpenAI (para Whisper)
  ELEVENLABS_API_KEY - API key de ElevenLabs (para TTS)

EJEMPLO:
  BASE_URL=http://localhost:3000 \\
  TEST_AGENT_ID=cm2abc123 \\
  SESSION_COOKIE="next-auth.session-token=xyz..." \\
  node scripts/test-multimodal-apis.js

OBTENER SESSION_COOKIE:
  1. Abre DevTools en tu navegador (F12)
  2. Ve a Application → Cookies → http://localhost:3000
  3. Copia el valor de "next-auth.session-token"
  4. Usa: SESSION_COOKIE="next-auth.session-token=VALOR"
  `);
  process.exit(0);
}

main().catch((error) => {
  log(`\n❌ Error fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
