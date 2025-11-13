/**
 * Script de prueba para el sistema de detección de idioma
 *
 * Ejecutar con: tsx scripts/test-locale-detection.ts
 */

import { NextRequest } from 'next/server';
import { detectLocale } from '../lib/i18n/locale-detector';
import { LOCALE_COOKIE_NAME } from '../i18n/config';

console.log('🧪 Test Suite: Sistema de Detección de Idioma por Geolocalización\n');
console.log('='.repeat(80));
console.log('');

// Helper para crear mock request
function createMockRequest(options: {
  pathname?: string;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
}): NextRequest {
  const url = `https://example.com${options.pathname || '/'}`;
  const headers = new Headers(options.headers || {});

  // Agregar headers por defecto
  if (!headers.has('x-request-id')) {
    headers.set('x-request-id', 'test-' + Math.random().toString(36).substring(7));
  }

  const request = new NextRequest(url, { headers });

  // Agregar cookies
  if (options.cookies) {
    Object.entries(options.cookies).forEach(([name, value]) => {
      (request as any).cookies.set(name, value);
    });
  }

  return request;
}

// Test cases
const testCases = [
  {
    name: 'Test 1: Usuario de Argentina (primera visita)',
    description: 'Sin cookie, con header de Vercel (AR) → Debe detectar español',
    request: createMockRequest({
      headers: {
        'x-vercel-ip-country': 'AR',
      },
    }),
    expectedLocale: 'es',
    expectedSource: 'geolocation',
  },
  {
    name: 'Test 2: Usuario de USA (primera visita)',
    description: 'Sin cookie, con header de Vercel (US) → Debe detectar inglés',
    request: createMockRequest({
      headers: {
        'x-vercel-ip-country': 'US',
      },
    }),
    expectedLocale: 'en',
    expectedSource: 'geolocation',
  },
  {
    name: 'Test 3: Usuario de España',
    description: 'Sin cookie, con header de Vercel (ES) → Debe detectar español',
    request: createMockRequest({
      headers: {
        'x-vercel-ip-country': 'ES',
      },
    }),
    expectedLocale: 'es',
    expectedSource: 'geolocation',
  },
  {
    name: 'Test 4: Usuario de México',
    description: 'Sin cookie, con header de Vercel (MX) → Debe detectar español',
    request: createMockRequest({
      headers: {
        'x-vercel-ip-country': 'MX',
      },
    }),
    expectedLocale: 'es',
    expectedSource: 'geolocation',
  },
  {
    name: 'Test 5: Usuario de Brasil',
    description: 'Sin cookie, con header de Vercel (BR) → Debe detectar inglés (BR no es país de habla hispana)',
    request: createMockRequest({
      headers: {
        'x-vercel-ip-country': 'BR',
      },
    }),
    expectedLocale: 'en',
    expectedSource: 'geolocation',
  },
  {
    name: 'Test 6: Usuario con cookie guardada (español)',
    description: 'Con cookie NEXT_LOCALE=es, sin geolocalización → Debe usar cookie',
    request: createMockRequest({
      cookies: {
        [LOCALE_COOKIE_NAME]: 'es',
      },
    }),
    expectedLocale: 'es',
    expectedSource: 'cookie',
  },
  {
    name: 'Test 7: Usuario con cookie guardada (inglés)',
    description: 'Con cookie NEXT_LOCALE=en, sin geolocalización → Debe usar cookie',
    request: createMockRequest({
      cookies: {
        [LOCALE_COOKIE_NAME]: 'en',
      },
    }),
    expectedLocale: 'en',
    expectedSource: 'cookie',
  },
  {
    name: 'Test 8: Cookie tiene prioridad sobre geolocalización',
    description: 'Con cookie NEXT_LOCALE=en y header AR → Debe usar cookie (en)',
    request: createMockRequest({
      cookies: {
        [LOCALE_COOKIE_NAME]: 'en',
      },
      headers: {
        'x-vercel-ip-country': 'AR',
      },
    }),
    expectedLocale: 'en',
    expectedSource: 'cookie',
  },
  {
    name: 'Test 9: Cloudflare header',
    description: 'Sin cookie, con header de Cloudflare (ES) → Debe detectar español',
    request: createMockRequest({
      headers: {
        'cf-ipcountry': 'ES',
      },
    }),
    expectedLocale: 'es',
    expectedSource: 'geolocation',
  },
  {
    name: 'Test 10: Accept-Language (español)',
    description: 'Sin cookie ni geolocalización, con Accept-Language es-ES → Debe detectar español',
    request: createMockRequest({
      headers: {
        'accept-language': 'es-ES,es;q=0.9,en;q=0.8',
      },
    }),
    expectedLocale: 'es',
    expectedSource: 'accept-language',
  },
  {
    name: 'Test 11: Accept-Language (inglés)',
    description: 'Sin cookie ni geolocalización, con Accept-Language en-US → Debe detectar inglés',
    request: createMockRequest({
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
    }),
    expectedLocale: 'en',
    expectedSource: 'accept-language',
  },
  {
    name: 'Test 12: Accept-Language con prioridades',
    description: 'Accept-Language con inglés de mayor prioridad → Debe detectar inglés',
    request: createMockRequest({
      headers: {
        'accept-language': 'en-GB,en;q=0.9,es;q=0.8',
      },
    }),
    expectedLocale: 'en',
    expectedSource: 'accept-language',
  },
  {
    name: 'Test 13: Sin información',
    description: 'Sin cookie, geolocalización ni Accept-Language → Debe usar default (español)',
    request: createMockRequest({}),
    expectedLocale: 'es',
    expectedSource: 'default',
  },
  {
    name: 'Test 14: Geolocalización tiene prioridad sobre Accept-Language',
    description: 'Con header US y Accept-Language es → Debe usar geolocalización (inglés)',
    request: createMockRequest({
      headers: {
        'x-vercel-ip-country': 'US',
        'accept-language': 'es-ES,es;q=0.9',
      },
    }),
    expectedLocale: 'en',
    expectedSource: 'geolocation',
  },
  {
    name: 'Test 15: Colombia (país LATAM)',
    description: 'Header CO → Debe detectar español',
    request: createMockRequest({
      headers: {
        'x-vercel-ip-country': 'CO',
      },
    }),
    expectedLocale: 'es',
    expectedSource: 'geolocation',
  },
];

// Ejecutar tests
let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`${index + 1}. ${testCase.name}`);
  console.log(`   ${testCase.description}`);
  console.log('');

  try {
    const detectedLocale = detectLocale(testCase.request);

    const passed = detectedLocale === testCase.expectedLocale;

    if (passed) {
      console.log(`   ✅ PASSED`);
      console.log(`   Detected locale: ${detectedLocale}`);
      passedTests++;
    } else {
      console.log(`   ❌ FAILED`);
      console.log(`   Expected locale: ${testCase.expectedLocale}`);
      console.log(`   Detected locale: ${detectedLocale}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error}`);
    failedTests++;
  }
});

// Resumen final
console.log('\n' + '='.repeat(80));
console.log('\n📊 Resumen de Tests\n');
console.log(`   Total de tests:   ${testCases.length}`);
console.log(`   ✅ Pasados:        ${passedTests}`);
console.log(`   ❌ Fallidos:       ${failedTests}`);
console.log(`   📈 Tasa de éxito: ${((passedTests / testCases.length) * 100).toFixed(1)}%`);
console.log('\n' + '='.repeat(80));

// Exit code
process.exit(failedTests > 0 ? 1 : 0);
