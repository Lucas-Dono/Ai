# Solución: Autenticación Mobile (JWT) + Web (NextAuth)

## Problema

La app móvil no podía cargar agentes ni mundos porque:
1. El middleware solo aceptaba sesiones de NextAuth (web)
2. La función `getAuthenticatedUser()` intentaba NextAuth primero, que fallaba en el contexto de requests con JWT

**Error observado:**
```
GET /api/agents 200 -> redirect to /login
GET /api/worlds 200 -> redirect to /login
```

## Solución Implementada

Se modificó el **middleware** para soportar **AMBOS** sistemas de autenticación sin romper la web:

### 1. Web (NextAuth) - Sin cambios
- ✅ Sigue funcionando exactamente igual
- ✅ Usa sesiones de NextAuth
- ✅ No requiere headers Authorization

### 2. Mobile (JWT) - Ahora funciona
- ✅ Envía `Authorization: Bearer <token>` en los headers
- ✅ El middleware valida el JWT
- ✅ Si el JWT es válido, permite acceso

## Cambios Realizados

### 1. [lib/auth-helper.ts](../lib/auth-helper.ts)

**Problema:** `getAuthenticatedUser()` intentaba NextAuth primero, pero como `auth()` no recibe el request como parámetro, no podía ver los headers JWT.

**Solución:** Invertir el orden - priorizar JWT porque es más directo:

```typescript
// ANTES: NextAuth primero (fallaba)
const session = await auth(); // No puede ver headers Authorization
if (session?.user?.id) return session.user;

// JWT segundo
const authHeader = req.headers.get('Authorization');
// ...

// DESPUÉS: JWT primero (funciona)
const authHeader = req.headers.get('Authorization');
if (authHeader) {
  const token = extractTokenFromHeader(authHeader);
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      // Buscar usuario en BD
      return user;
    }
  }
}

// NextAuth segundo (fallback para web)
const session = await auth();
// ...
```

### 2. [middleware.ts](../middleware.ts)

```typescript
// ANTES: Solo verificaba NextAuth
else if (!req.auth) {
  // Redirect to login
}

// DESPUÉS: Verifica NextAuth O JWT
else {
  let isAuthenticated = false;

  // Primero verificar sesión NextAuth (web)
  if (req.auth) {
    isAuthenticated = true;
  }
  // Si no hay sesión web, verificar JWT token (mobile)
  else {
    const authHeader = req.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        isAuthenticated = true;
      }
    }
  }

  if (!isAuthenticated) {
    // Redirect to login
  }
}
```

## Flujo de Autenticación

### Web (Sin cambios)
1. Usuario hace login en `/login`
2. NextAuth crea una sesión con cookies
3. Middleware detecta `req.auth` y permite acceso
4. **No se usa JWT ni headers Authorization**

### Mobile (Ahora funciona)
1. Usuario hace login en app móvil
2. POST `/api/auth/login` devuelve `{ token, user }`
3. App móvil guarda el token localmente
4. **Todas las requests incluyen** `Authorization: Bearer <token>`
5. Middleware verifica el JWT y permite acceso

## Endpoints Existentes (Ya funcionaban)

### `/api/auth/login` (POST)
- Recibe: `{ email, password }`
- Devuelve: `{ token, user }`
- Para: App móvil

### `/api/auth/register` (POST)
- Recibe: `{ email, password, name }`
- Devuelve: `{ token, user }`
- Para: App móvil

### `/api/auth/me` (GET)
- Requiere: Header `Authorization: Bearer <token>`
- Devuelve: `{ user }`
- Para: App móvil (validar sesión)

## Testing

### Verificar que Web sigue funcionando
1. Abre http://localhost:3000 en navegador
2. Inicia sesión normalmente
3. Navega por el dashboard
4. ✅ Todo debe funcionar sin cambios

### Verificar que Mobile ahora funciona
1. Abre la app móvil en Expo Go
2. Inicia sesión
3. Ve al Home
4. ✅ Deben aparecer los agentes y mundos
5. ✅ No más redirects a `/login`

## Logs Útiles

Si mobile sigue sin funcionar, revisa los logs del servidor:

```bash
# El servidor debería mostrar:
GET /api/agents 200
GET /api/worlds 200

# En lugar de:
GET /login?callbackUrl=%2Fapi%2Fagents 200
```

## Compatibilidad

- ✅ **Web**: No afectada, sigue usando NextAuth
- ✅ **Mobile**: Ahora funciona con JWT
- ✅ **Ambos pueden coexistir** sin conflictos
- ✅ **Mismo usuario** puede usar web y mobile simultáneamente

## Próximos Pasos

Cuando la app móvil esté lista para producción:

1. **Configurar project ID de Expo** para push notifications (ver PUSH-NOTIFICATIONS-FIX.md)
2. **Generar APK/AAB** con `npx expo build:android`
3. **Todo funcionará automáticamente** (no requiere cambios adicionales)

## Notas de Seguridad

- ✅ Los JWT expiran en 30 días (configurable en `lib/jwt.ts`)
- ✅ Los JWT usan `NEXTAUTH_SECRET` para firmar/verificar
- ✅ Los tokens se validan en cada request
- ✅ Si un token es inválido, se rechaza el acceso
- ⚠️ **IMPORTANTE**: En producción, asegúrate de tener `NEXTAUTH_SECRET` configurado correctamente en `.env`
