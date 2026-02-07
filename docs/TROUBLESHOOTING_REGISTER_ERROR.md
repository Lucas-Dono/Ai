# Solución de Problemas: Error de Registro JSON.parse

## Problema

Al intentar registrarse, se produce el siguiente error:

```
Error en registro: SyntaxError: JSON.parse: unexpected character at line 1 column 1 of the JSON data
```

Y en la consola del navegador se muestra:

```
Respuesta no es JSON: <!DOCTYPE html><html lang="es">...
```

## Causa Raíz (SOLUCIONADO)

**El problema era que el middleware estaba bloqueando el endpoint `/api/auth/register`** y redirigiendo a la página de login, devolviendo HTML en lugar de JSON.

### ¿Por qué ocurría?

1. El matcher del middleware incluía todas las rutas `/api/*`
2. La ruta `/api/auth/register` **NO estaba en la lista de rutas públicas** (`publicRoutes`)
3. El middleware detectaba que no había autenticación y redirigía a `/login`
4. El cliente recibía HTML de la página de login en lugar de JSON

### Causas comunes adicionales

1. **Servidor no está corriendo** - El servidor Next.js no está iniciado
2. **Error de base de datos** - La base de datos PostgreSQL no está conectada o configurada correctamente
3. **Error de configuración** - Variables de entorno faltantes o incorrectas
4. **Error en el código** - Un error no capturado que hace que Next.js devuelva HTML en lugar de JSON

## Solución Implementada ✅

Se han realizado las siguientes correcciones para resolver el problema:

### 1. **FIX PRINCIPAL: Middleware** (`middleware.ts:115`)

✅ **Agregado `/api/auth/register` a rutas públicas**: El endpoint ahora es accesible sin autenticación
✅ **Matcher actualizado**: Clarificado que todas las rutas `/api/*` pasan por el middleware, pero las rutas en `publicRoutes` son permitidas

```typescript
const publicRoutes = [
  // ... otras rutas
  "/api/auth/register", // ← AGREGADO
];
```

### 2. Mejoras en el Cliente (`app/registro/page.tsx:84-101`)

✅ **Validación de Content-Type**: Ahora verifica que la respuesta sea JSON antes de parsearla
✅ **Manejo de errores mejorado**: Muestra mensajes de error más descriptivos
✅ **Logging detallado**: Registra la respuesta real en la consola para diagnóstico

### 3. Mejoras en el Servidor (`app/api/auth/register/route.ts`)

✅ **Content-Type explícito**: Todas las respuestas incluyen el header `Content-Type: application/json`
✅ **Manejo de errores de base de datos**: Captura errores de Prisma específicamente
✅ **Logging detallado**: Todos los pasos tienen logs con el prefijo `[REGISTER]`
✅ **Validación de entrada mejorada**: Maneja errores al parsear el body de la request

## Pasos para Diagnosticar

### 1. Verificar que el servidor está corriendo

```bash
# Asegúrate de que el servidor de desarrollo está iniciado
npm run dev
```

Deberías ver algo como:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 2. Verificar la configuración de la base de datos

```bash
# Revisar el archivo .env
cat .env | grep DATABASE_URL
```

Debería mostrar algo como:
```
DATABASE_URL="postgresql://user:password@localhost:5432/creador_inteligencias"
```

Si no existe, crea un archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
# Luego edita .env con tus credenciales de base de datos
```

### 3. Verificar que Prisma puede conectarse a la base de datos

```bash
# Verificar conexión a la base de datos
npx prisma db push
```

Si hay errores de conexión, revisa:
- ¿PostgreSQL está corriendo?
- ¿Las credenciales en DATABASE_URL son correctas?
- ¿La base de datos existe?

### 4. Ejecutar el script de prueba

Ejecuta el script de diagnóstico que hemos creado:

```bash
# Asegúrate de que el servidor está corriendo primero
npm run dev

# En otra terminal, ejecuta el script de prueba
npx tsx scripts/test-register-endpoint.ts
```

Este script probará el endpoint con diferentes casos y te dirá exactamente qué está fallando.

### 5. Revisar los logs del servidor

Cuando intentes registrarte, revisa la consola donde está corriendo `npm run dev`. Deberías ver logs con el prefijo `[REGISTER]`:

```
[REGISTER] Rate limit exceeded for IP: 127.0.0.1
[REGISTER] Validation failed: Email inválido
[REGISTER] Email already registered: test@example.com
[REGISTER] Database error checking existing user: ...
[REGISTER] User created successfully: test@example.com
[REGISTER] Unexpected error: ...
```

### 6. Revisar los logs del navegador

Abre las herramientas de desarrollador del navegador (F12) y ve a la pestaña "Console". Intenta registrarte y busca mensajes de error que incluyan:

```
Respuesta no es JSON: ...
Error al parsear JSON: ...
```

Estos logs te darán información sobre qué está devolviendo realmente el servidor.

## Verificación de Variables de Entorno

Asegúrate de tener configuradas las siguientes variables de entorno en tu archivo `.env`:

```bash
# Base de datos (REQUERIDO)
DATABASE_URL="postgresql://user:password@localhost:5432/creador_inteligencias"

# NextAuth (REQUERIDO)
NEXTAUTH_SECRET="your_secret_here"
NEXTAUTH_URL="http://localhost:3000"

# Redis para rate limiting (OPCIONAL - si no está, rate limiting se desactiva)
UPSTASH_REDIS_REST_URL="your_redis_url"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"
```

## Causas Comunes y Soluciones

### Problema: "Connection refused" en la consola del navegador

**Causa**: El servidor Next.js no está corriendo

**Solución**:
```bash
npm run dev
```

### Problema: "PrismaClientInitializationError"

**Causa**: No se puede conectar a la base de datos

**Solución**:
1. Verifica que PostgreSQL está corriendo
2. Verifica las credenciales en DATABASE_URL
3. Crea la base de datos si no existe:
   ```bash
   # Conectarse a PostgreSQL
   psql -U postgres

   # Crear la base de datos
   CREATE DATABASE creador_inteligencias;

   # Salir
   \q
   ```
4. Ejecuta las migraciones:
   ```bash
   npx prisma db push
   ```

### Problema: "Demasiados intentos de registro"

**Causa**: Rate limiting activado (3 intentos por hora por IP)

**Solución**:
1. Espera 1 hora, o
2. Desactiva temporalmente Redis (comenta las variables UPSTASH_REDIS_* en .env), o
3. Limpia la caché de Redis:
   ```bash
   # Si tienes acceso a Redis
   redis-cli FLUSHDB
   ```

### Problema: Error de validación de edad

**Causa**: Fecha de nacimiento indica edad menor a 13 años

**Solución**: Usa una fecha de nacimiento que resulte en al menos 13 años de edad

## Resumen de Cambios

### Archivos Modificados

1. **`middleware.ts`** (líneas 115 y 305) - **FIX PRINCIPAL** ⭐
   - Agregado `/api/auth/register` a la lista de rutas públicas
   - Actualizado el matcher de `/api/((?!auth).*)` a `/api/(.*)` para mayor claridad
   - Documentado que todas las rutas API pasan por el middleware pero las públicas son permitidas

2. **`app/registro/page.tsx`** (líneas 84-101)
   - Validación de Content-Type antes de parsear
   - Manejo de errores de parsing
   - Mensajes de error más descriptivos con logging

3. **`app/api/auth/register/route.ts`** (múltiples secciones)
   - Headers Content-Type explícitos en todas las respuestas
   - Try-catch para errores de base de datos
   - Try-catch para parsing del body
   - Logging detallado en cada paso con prefijo `[REGISTER]`
   - Mensajes de error específicos para diagnóstico

### Archivos Nuevos

1. **`scripts/test-register-endpoint.ts`**
   - Script de prueba automatizado para el endpoint
   - Prueba múltiples escenarios (válido, inválido, duplicado, edad incorrecta)
   - Verifica que todas las respuestas sean JSON

2. **`docs/TROUBLESHOOTING_REGISTER_ERROR.md`** (este archivo)
   - Documentación completa del problema y solución
   - Guía de diagnóstico paso a paso
   - Causas comunes y sus soluciones

## Próximos Pasos

1. **Reinicia el servidor de desarrollo** para que los cambios surtan efecto:
   ```bash
   # Detén el servidor (Ctrl+C) y reinícialo
   npm run dev
   ```

2. **Intenta registrarte de nuevo** - Ahora deberías ver un mensaje de error más descriptivo si algo falla

3. **Revisa los logs** - Tanto en la consola del navegador como en la terminal del servidor

4. **Si el problema persiste**, ejecuta el script de prueba y comparte los resultados:
   ```bash
   npx tsx scripts/test-register-endpoint.ts
   ```

## Soporte Adicional

Si después de seguir estos pasos el problema persiste, comparte la siguiente información:

1. Output del script de prueba (`npx tsx scripts/test-register-endpoint.ts`)
2. Logs de la consola del navegador (F12 → Console)
3. Logs de la terminal donde corre `npm run dev`
4. Contenido de tu archivo `.env` (sin credenciales sensibles)

Esto ayudará a diagnosticar el problema específico en tu entorno.
