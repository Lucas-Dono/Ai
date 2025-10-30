# Guía de Debugging: Autenticación Mobile

## Logs Agregados

Se han agregado logs detallados en todo el flujo de autenticación para identificar exactamente dónde está fallando.

## Cómo Debuggear

### 1. Reiniciar Backend y Mobile

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Mobile (en otra terminal)
cd mobile
npx expo start --clear
```

### 2. En la App Móvil

1. **Cierra sesión** completamente
2. **Vuelve a iniciar sesión**
3. Observa los logs tanto en mobile como en backend

## Logs Esperados (FLUJO CORRECTO)

### En Mobile (Metro/Expo):

```
[Auth] Logging in: lucasdono391@gmail.com
[ApiClient] 🔵 REQUEST: POST /api/auth/login
[ApiClient] ⚠️  No auth token available
[ApiClient] ✅ RESPONSE: 200 /api/auth/login
[Auth] Login successful: lucasdono391@gmail.com
[ApiClient] 🔐 Setting auth token: eyJhbGciOiJIUzI1NiIsInR5c...
[Auth] Token stored successfully
[ApiClient] 🔵 REQUEST: GET /api/agents
[ApiClient] 🔑 Auth token attached: eyJhbGciOiJIUzI1NiIsInR5c...
[ApiClient] ✅ RESPONSE: 200 /api/agents
```

### En Backend (Terminal):

```
[MIDDLEWARE] === POST /api/auth/login ===
[MIDDLEWARE] Public route: true
[MIDDLEWARE] Public route - allowing without auth
POST /api/auth/login 200 in 120ms

[MIDDLEWARE] === GET /api/agents ===
[MIDDLEWARE] Public route: false
[MIDDLEWARE] Authorization header: Bearer eyJhbGciOiJIUzI1NiIsInR5c...
[JWT] Extracting token from header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXV...
[JWT] ✅ Token extracted successfully
[JWT] Verifying token...
[JWT] ✅ Token valid: { userId: 'cm8abc123', email: 'lucasdono391@gmail.com' }
[MIDDLEWARE] Token payload: userId: cm8abc123, email: lucasdono391@gmail.com
[MIDDLEWARE] ✅ JWT token valid for user: lucasdono391@gmail.com
[MIDDLEWARE] ✅ AUTHORIZED via JWT - Allowing request
[AuthHelper] Attempting authentication...
[AuthHelper] Authorization header: Bearer eyJhbGciOiJIUzI1NiIsInR5c...
[JWT] Extracting token from header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXV...
[JWT] ✅ Token extracted successfully
[JWT] Verifying token...
[JWT] ✅ Token valid: { userId: 'cm8abc123', email: 'lucasdono391@gmail.com' }
[AuthHelper] ✅ Authenticated via JWT: lucasdono391@gmail.com
[API GET] Obteniendo agentes...
[API GET] userId: cm8abc123 autenticado: true
GET /api/agents 200 in 80ms
```

## Posibles Problemas y Qué Buscar

### Problema 1: Token NO se está enviando

**Síntomas en logs:**
```
[ApiClient] 🔵 REQUEST: GET /api/agents
[ApiClient] ⚠️  No auth token available
```

**Causa:** El token no se guardó después del login o se perdió

**Solución:**
- Verificar que después del login aparezca: `[ApiClient] 🔐 Setting auth token:`
- Verificar que `[Auth] Token stored successfully`

### Problema 2: Token se envía pero formato incorrecto

**Síntomas en logs del backend:**
```
[MIDDLEWARE] Authorization header: eyJhbGciOiJIUzI1NiIsInR5c...
[JWT] ❌ Invalid header format - expected 2 parts, got: 1
```

**Causa:** Falta la palabra "Bearer" antes del token

**Solución:** Verificar el interceptor en ApiClient

### Problema 3: Token inválido o expirado

**Síntomas en logs del backend:**
```
[JWT] Verifying token...
[JWT] ❌ Token verification failed: invalid signature
```

**Causa:** El token es inválido o el JWT_SECRET no coincide

**Solución:**
- Verificar que `NEXTAUTH_SECRET` está configurado en `.env`
- Cerrar sesión y volver a iniciar para obtener un token fresco

### Problema 4: Middleware redirige a login

**Síntomas en logs del backend:**
```
[MIDDLEWARE] ❌ UNAUTHORIZED - Redirecting to login
GET /login?callbackUrl=%2Fapi%2Fagents 200
```

**Causa:** El middleware no está recibiendo o validando el token

**Qué revisar:**
1. ¿Aparece `[MIDDLEWARE] Authorization header: MISSING`?
   - El token NO se está enviando desde mobile
2. ¿Aparece `[JWT] ❌ Token verification failed`?
   - El token es inválido

### Problema 5: getAuthenticatedUser falla

**Síntomas en logs del backend:**
```
[AuthHelper] Attempting authentication...
[AuthHelper] Authorization header: MISSING
[AuthHelper] ❌ Authentication failed
[API GET] userId: default-user autenticado: false
```

**Causa:** La función no está recibiendo el header Authorization

**Solución:** Verificar que el middleware pasó el token correctamente

## Información que Necesito

Por favor, copia y pega en tu respuesta:

### 1. Logs de Mobile (completos desde login hasta error)

```
# Pega aquí los logs de Metro/Expo
```

### 2. Logs de Backend (completos desde que inicias sesión)

```
# Pega aquí los logs del terminal donde corre npm run dev
```

### 3. ¿Qué ves en la pantalla de la app?

- [ ] Pantalla de login
- [ ] Pantalla de home pero sin agentes ni mundos
- [ ] Error visible en pantalla
- [ ] Otro: _______

## Variables de Entorno

Verifica que tienes configurado en `.env`:

```bash
NEXTAUTH_SECRET=tu-secret-aqui
# O alternativamente:
JWT_SECRET=tu-secret-aqui
```

Si no está configurado, agrega uno:

```bash
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

Y reinicia el backend.

## Próximos Pasos

Una vez que tengas los logs, podré decirte exactamente:
1. En qué paso está fallando
2. Por qué está fallando
3. Cómo solucionarlo

Los logs son **muy verbosos ahora**, así que será fácil identificar el problema.
