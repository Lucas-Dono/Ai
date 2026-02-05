/**
 * Script de diagnóstico para verificar conexión con la API
 *
 * Ejecutar: npx ts-node scripts/debug-api-connection.ts
 */

import { apiClient } from '../src/services/api';
import { JWTManager } from '../src/lib/auth';
import { API_BASE_URL } from '../src/config/api.config';

async function debugApiConnection() {
  console.log('\n🔍 === DIAGNÓSTICO DE CONEXIÓN API ===\n');

  // 1. Verificar configuración de URL
  console.log('📡 1. Configuración de URL:');
  console.log(`   - API_BASE_URL: ${API_BASE_URL}`);
  console.log(`   - Ambiente: ${__DEV__ ? 'DESARROLLO' : 'PRODUCCIÓN'}`);

  // 2. Verificar token de autenticación
  console.log('\n🔐 2. Token de autenticación:');
  try {
    const token = await JWTManager.getAccessToken();
    if (token) {
      console.log(`   ✅ Token encontrado: ${token.substring(0, 30)}...`);
      console.log(`   - Longitud: ${token.length} caracteres`);
    } else {
      console.log('   ❌ No hay token guardado');
      console.log('   → El usuario debe iniciar sesión primero');
    }
  } catch (error) {
    console.error('   ❌ Error al obtener token:', error);
  }

  // 3. Verificar token en apiClient
  console.log('\n🔑 3. Token en ApiClient:');
  const clientToken = apiClient.getAuthToken();
  if (clientToken) {
    console.log(`   ✅ ApiClient tiene token: ${clientToken.substring(0, 30)}...`);
  } else {
    console.log('   ❌ ApiClient NO tiene token configurado');
    console.log('   → Llamar a updateApiClientToken() después del login');
  }

  // 4. Intentar ping al servidor
  console.log('\n🏓 4. Probando conexión al servidor:');
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Servidor responde correctamente');
      console.log('   - Status:', response.status);
      console.log('   - Data:', JSON.stringify(data, null, 2));
    } else {
      console.log(`   ⚠️  Servidor responde con error ${response.status}`);
      console.log('   - El servidor está en línea pero retornó un error');
    }
  } catch (error: any) {
    console.log('   ❌ Error al conectar con el servidor:');
    console.log(`   - ${error.message}`);
    console.log('   → Verifica que:');
    console.log('     1. El servidor backend esté corriendo (npm run dev en directorio raíz)');
    console.log(`     2. La IP en .env sea correcta (${API_BASE_URL})`);
    console.log('     3. Tu dispositivo/emulador esté en la misma red WiFi');
  }

  // 5. Intentar obtener lista de agentes (requiere auth)
  console.log('\n👥 5. Probando endpoint autenticado (GET /api/agents):');
  try {
    const agents: any = await apiClient.get('/api/agents?limit=5');
    if (Array.isArray(agents)) {
      console.log(`   ✅ Autenticación funciona! Recibidos ${agents.length} agentes`);
      if (agents.length > 0) {
        console.log('   - Primer agente:', {
          id: agents[0].id?.substring(0, 8),
          name: agents[0].name,
          hasAvatar: !!agents[0].avatar,
        });
      }
    } else {
      console.log('   ⚠️  Respuesta inesperada:', typeof agents);
    }
  } catch (error: any) {
    const status = error.response?.status;
    if (status === 401) {
      console.log('   ❌ Error 401: No autenticado');
      console.log('   → El token no es válido o no se está enviando');
      console.log('   → Verifica que el usuario haya iniciado sesión');
    } else {
      console.log('   ❌ Error:', error.message);
      if (error.response) {
        console.log('   - Status:', error.response.status);
        console.log('   - Data:', error.response.data);
      }
    }
  }

  console.log('\n✅ === DIAGNÓSTICO COMPLETADO ===\n');
  console.log('📋 Pasos siguientes:');
  console.log('1. Si el servidor no responde → inicia el backend (npm run dev)');
  console.log('2. Si la IP está mal → actualiza mobile/.env con tu IP local');
  console.log('3. Si no hay token → inicia sesión en la app móvil');
  console.log('4. Si hay error 401 → el token expiró o es inválido, cierra sesión y vuelve a entrar\n');
}

// Ejecutar
debugApiConnection().catch(console.error);
