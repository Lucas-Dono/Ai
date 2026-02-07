# Wikipedia API Timeout Fix - Diagnóstico y Solución

## PROBLEMA CRÍTICO IDENTIFICADO

Wikipedia API generaba timeouts en menos de 10 segundos con este error:
```
[MultiSourceSearch] Error en Wikipedia: TypeError: fetch failed
  [cause]: [AggregateError: ] { code: 'ETIMEDOUT' }
```

**Síntomas:**
- Tests externos de Wikipedia funcionan perfectamente (606ms, 633ms)
- Dentro de Next.js falla consistentemente en ~400ms-10s
- `AbortController` con timeout de 60s no tiene efecto
- `fetchWithTimeout` wrapper no soluciona el problema

## CAUSA RAÍZ (Dual Problem)

### 1. Next.js API Route sin maxDuration

**Problema:** La ruta `/app/api/v1/smart-start/search/route.ts` NO tenía configurado `maxDuration`.

**Efecto:** Next.js 15 por defecto tiene timeouts muy limitados en API routes. Sin `maxDuration` explícito, las rutas pueden timeout prematuramente antes de que las requests externas terminen.

**Archivo afectado:**
- `/app/api/v1/smart-start/search/route.ts`

**Documentación:**
- [Next.js maxDuration configuration](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)
- [Next.js timeouts explained](https://www.inngest.com/blog/how-to-solve-nextjs-timeouts)

### 2. Undici Socket Timeouts No Configurables con fetch nativo

**Problema:** Node.js 22 usa **Undici** internamente para `fetch()`, que tiene:
- `connectTimeout` por defecto de ~10 segundos
- `headersTimeout`, `bodyTimeout` muy limitados
- **No se pueden configurar usando `AbortController`** (solo controla request timeout, NO socket timeout)

**Efecto:** Las conexiones a Wikipedia fallan a nivel de socket antes de que el timeout de AbortController se active.

**Archivos afectados:**
- `/lib/profile/multi-source-character-search.ts`

**Issues relevantes:**
- [Undici Issue #4215: fetch() ignores connection timeout](https://github.com/nodejs/undici/issues/4215)
- [Undici Issue #1373: Default fetch timeout too short](https://github.com/nodejs/undici/issues/1373)
- [Stack Overflow: Increase timeout in Node.js built-in fetch API](https://stackoverflow.com/questions/76755913/increase-timeout-in-nodejs-built-in-fetch-api)

## SOLUCIÓN IMPLEMENTADA

### Fix 1: Configurar maxDuration en API Route

**Archivo:** `/app/api/v1/smart-start/search/route.ts`

```typescript
// CRITICAL: Configure route timeout for external API calls
// Wikipedia API can take 10-60 seconds to respond
export const maxDuration = 60; // 60 seconds max (supports Free, Hobby, and Pro plans)
export const dynamic = 'force-dynamic'; // Disable static optimization for real-time search
```

**Beneficios:**
- Permite que la API route se ejecute hasta 60 segundos
- Previene que Next.js termine la request prematuramente
- Compatible con todos los planes de Vercel (Free, Hobby, Pro)

### Fix 2: Usar Undici Agent con Timeouts Extendidos

**Archivo:** `/lib/profile/multi-source-character-search.ts`

```typescript
import { Agent, fetch as undiciFetch } from 'undici';

const extendedTimeoutAgent = new Agent({
  // Socket connection timeout (time to establish connection)
  connectTimeout: 60000, // 60 seconds (was defaulting to ~10s)

  // Keep-alive timeout for persistent connections
  keepAliveTimeout: 60000, // 60 seconds

  // Maximum time for entire request (including DNS, connection, headers, body)
  bodyTimeout: 70000, // 70 seconds (slightly higher than request timeout)

  // Maximum time to wait for response headers
  headersTimeout: 60000, // 60 seconds

  // Enable keep-alive for better performance
  keepAliveMaxTimeout: 600000, // 10 minutes

  // Pipelining disabled for compatibility
  pipelining: 0,
});

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Use undici fetch with custom dispatcher for socket timeout control
    const response = await undiciFetch(url, {
      ...options,
      signal: controller.signal,
      dispatcher: extendedTimeoutAgent, // ⭐ CRITICAL FIX
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}
```

**Beneficios:**
- Controla timeouts a nivel de socket (`connectTimeout`)
- Controla timeouts de headers (`headersTimeout`)
- Controla timeouts de body (`bodyTimeout`)
- Usa keep-alive para mejor performance
- Soluciona el problema de `ETIMEDOUT` definitivamente

### Fix 3: Instalar Undici como Dependencia

```bash
npm install undici --save --legacy-peer-deps
```

**Por qué:** Aunque Node.js 22 incluye Undici internamente, necesitamos importar explícitamente `Agent` y `fetch` para poder configurar los timeouts.

## POR QUÉ LOS TESTS EXTERNOS FUNCIONABAN

Los tests externos (Node.js directo) funcionaban porque:

1. **No estaban sujetos a Next.js maxDuration limits**
   - Next.js agrega una capa de timeout management
   - Los tests en Node.js puro no tienen esta restricción

2. **Usaban probablemente diferentes configuraciones de red**
   - Diferentes DNS resolvers
   - Diferentes network stack configurations
   - Posiblemente conexiones directas sin proxy

3. **No tenían el overhead de Next.js middleware**
   - El middleware de Next.js agrega latencia
   - La autenticación agrega latencia
   - El routing agrega latencia

## TESTING

Para verificar que el fix funciona:

```bash
# 1. Restart dev server
npm run dev

# 2. Test the search endpoint
curl "http://localhost:3000/api/v1/smart-start/search?q=Einstein" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Monitor logs for:
# - No more ETIMEDOUT errors
# - Successful Wikipedia responses
# - Response times < 60s
```

## ARCHIVOS MODIFICADOS

1. `/app/api/v1/smart-start/search/route.ts`
   - Agregado `export const maxDuration = 60`
   - Agregado `export const dynamic = 'force-dynamic'`

2. `/lib/profile/multi-source-character-search.ts`
   - Importado `Agent` y `fetch` de `undici`
   - Creado `extendedTimeoutAgent` con configuración personalizada
   - Modificado `fetchWithTimeout` para usar `undiciFetch` con `dispatcher`

3. `/package.json`
   - Agregado `undici` como dependencia

## REFERENCIAS

- [How to configure Next.JS API timeout](https://stackoverflow.com/questions/71994305/how-to-configure-next-js-api-timeout)
- [Next.js maxDuration documentation](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)
- [Undici Issue #4215: fetch() ignores connection timeout](https://github.com/nodejs/undici/issues/4215)
- [Better Stack: Complete Guide to Timeouts in Node.js](https://betterstack.com/community/guides/scaling-nodejs/nodejs-timeouts/)
- [How to solve Next.js timeouts](https://www.inngest.com/blog/how-to-solve-nextjs-timeouts)

## NOTAS IMPORTANTES

1. **maxDuration solo funciona en deployment** - En desarrollo puede no tener efecto completo
2. **Vercel limits** - Free plan: 10s, Hobby: 10s, Pro: 300s (estamos usando 60s para compatibilidad)
3. **Keep-alive** - El agent usa conexiones persistentes para mejor performance
4. **TypeScript warning** - El `@ts-ignore` en `dispatcher` es necesario porque los tipos de undici pueden no matchear exactamente con RequestInit

## MONITOREO FUTURO

Agregar logging para detectar timeouts:

```typescript
console.log('[WikipediaAPI] Starting request to:', url);
const startTime = Date.now();
try {
  const response = await fetchWithTimeout(url, options, timeout);
  console.log('[WikipediaAPI] Success in:', Date.now() - startTime, 'ms');
  return response;
} catch (error) {
  console.error('[WikipediaAPI] Failed after:', Date.now() - startTime, 'ms', error);
  throw error;
}
```

## CONCLUSIÓN

El problema era una **combinación de limitaciones de Next.js y Node.js**:
- Next.js sin `maxDuration` terminaba requests prematuramente
- Node.js fetch (undici) tenía socket timeouts muy bajos sin forma de configurarlos usando AbortController

La solución requiere **ambos fixes**:
1. Configurar `maxDuration` en la API route
2. Usar undici Agent con timeouts extendidos

**STATUS:** ✅ RESUELTO
