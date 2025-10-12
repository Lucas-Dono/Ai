# Guía de Integraciones Opcionales

Esta guía te ayudará a configurar todas las integraciones opcionales del proyecto.

---

## 🔐 1. Google OAuth (Login con Google)

Permite que los usuarios inicien sesión con su cuenta de Google.

### Paso 1: Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en "Seleccionar un proyecto" → "Nuevo proyecto"
3. Nombre del proyecto: "Creador de Inteligencias" (o el que prefieras)
4. Haz clic en "Crear"
5. Espera unos segundos a que se cree el proyecto

### Paso 2: Configurar pantalla de consentimiento OAuth

1. Ve a "APIs y servicios" → "Pantalla de consentimiento de OAuth"
2. Selecciona **"Externo"** → "Crear"
3. Completa los campos obligatorios:
   - **Nombre de la aplicación**: Creador de Inteligencias
   - **Correo electrónico de asistencia**: tu@email.com
   - **Logotipo de la aplicación**: (opcional)
   - **Dominio de la aplicación**: (opcional en desarrollo)
   - **Dominios autorizados**: tudominio.com (solo en producción)
   - **Información de contacto del desarrollador**: tu@email.com
4. Haz clic en "Guardar y continuar"
5. En **"Alcances"**, haz clic en "Agregar o quitar alcances"
6. Busca y selecciona estos alcances (ya vienen por defecto):
   - `openid`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
7. Haz clic en "Actualizar" → "Guardar y continuar"
8. En **"Usuarios de prueba"** (si está en modo desarrollo), haz clic en "Agregar usuarios"
9. Agrega los correos de las personas que podrán probar (incluyendo el tuyo)
10. Haz clic en "Guardar y continuar"
11. Revisa el resumen y haz clic en "Volver al panel"

### Paso 3: Crear credenciales OAuth

1. Ve a "APIs y servicios" → "Credenciales"
2. Haz clic en "Crear credenciales" → "ID de cliente de OAuth 2.0"
3. Tipo de aplicación: **"Aplicación web"**
4. Nombre: "Cliente web - Creador de Inteligencias"
5. **Orígenes de JavaScript autorizados** (agregar ambos):
   ```
   http://localhost:3000
   ```
   Si ya tienes dominio, agrega también:
   ```
   https://tudominio.com
   ```
6. **URIs de redireccionamiento autorizados** (agregar ambos):
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   Si ya tienes dominio, agrega también:
   ```
   https://tudominio.com/api/auth/callback/google
   ```
7. Haz clic en "Crear"

### Paso 4: Copiar credenciales

Verás una ventana emergente con:
- **ID de cliente**: Algo como `123456789012-abcdefghijklmnop.apps.googleusercontent.com`
- **Secreto del cliente**: Algo como `GOCSPX-AbCdEfGhIjKlMnOpQrSt`

Copia ambos valores a tu `.env.local`:

```env
GOOGLE_CLIENT_ID="123456789012-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-AbCdEfGhIjKlMnOpQrSt"
```

### Paso 5: Modo de prueba vs Producción

**Modo de prueba (desarrollo):**
- Solo los usuarios agregados en "Usuarios de prueba" pueden iniciar sesión
- Perfecto para desarrollo
- No requiere verificación de Google

**Modo de producción:**
1. Ve a "Pantalla de consentimiento de OAuth"
2. En la parte superior, verás "Estado de publicación: En producción" o similar
3. Haz clic en "Publicar aplicación"
4. Acepta los términos
5. **Nota**: Google puede revisar tu aplicación si solicitas scopes sensibles (los básicos no requieren revisión)

### ✅ Verificación

1. Reinicia tu servidor Next.js
2. Ve a `http://localhost:3000/api/auth/signin`
3. Deberías ver el botón **"Sign in with Google"**
4. Haz clic y prueba iniciar sesión con una cuenta de prueba

---

## 🚀 2. Upstash Redis (Rate Limiting y Caché)

Upstash ofrece Redis serverless, ideal para rate limiting y caché en Next.js.

### Paso 1: Crear cuenta en Upstash

1. Ve a [Upstash](https://console.upstash.com/)
2. Haz clic en "Sign Up"
3. Regístrate con Google, GitHub o email
4. Verifica tu email si es necesario

### Paso 2: Crear una base de datos Redis

1. En el dashboard, haz clic en **"Create Database"**
2. Configura tu base de datos:
   - **Name**: `creador-inteligencias-redis`
   - **Type**:
     - **Regional** (más barato, suficiente para empezar)
     - **Global** (más rápido, multi-región)
   - **Region**: Selecciona el más cercano a tus usuarios
     - Para América Latina: `us-east-1` (Virginia, USA) es buena opción
     - Para Brasil: `sa-east-1` (São Paulo)
   - **TLS**: Dejarlo activado (recomendado)
   - **Eviction**: `noeviction` (no borrar datos automáticamente)
3. Haz clic en **"Create"**
4. Espera unos segundos a que se cree

### Paso 3: Obtener credenciales REST API

1. Una vez creada la base de datos, verás el dashboard de tu Redis
2. Verás varias pestañas: **Details, REST API, Redis, CLI**
3. Haz clic en la pestaña **"REST API"**
4. Encontrarás dos secciones:

**REST API:**
```
UPSTASH_REDIS_REST_URL
https://gusc1-sweet-mongoose-12345.upstash.io
```

**REST Token:**
```
UPSTASH_REDIS_REST_TOKEN
AYyxASQgZTFmN2E5N2YtMDExNC00NTk1LTk1YmItZjE0ZWY3YzI3ZDgwabcdef...
```

5. Copia ambos valores (usa los botones de copiar 📋)

### Paso 4: Agregar a variables de entorno

Pega los valores en tu `.env.local`:

```env
UPSTASH_REDIS_REST_URL="https://gusc1-sweet-mongoose-12345.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AYyxASQgZTFmN2E5N2YtMDExNC00NTk1LTk1YmItZjE0ZWY3YzI3ZDgwabcdef..."
```

### Paso 5: Límites del plan gratuito

El **Free Plan** de Upstash incluye:
- ✅ 10,000 comandos por día
- ✅ 256 MB de almacenamiento
- ✅ Máximo 100 comandos concurrentes
- ✅ Sin límite de bases de datos
- ✅ Sin tarjeta de crédito requerida

**Perfecto para desarrollo y proyectos pequeños/medianos.**

### Usos en el proyecto:

- **Rate limiting**: Limitar requests por IP/usuario
- **Caché de sesiones**: Mejorar rendimiento de autenticación
- **Caché de queries**: Cachear resultados de base de datos
- **Contadores**: Trackear uso en tiempo real

### ✅ Verificación

Para probar que funciona, puedes ir a la pestaña **"CLI"** en Upstash y ejecutar:

```redis
SET test "Hola desde Redis"
GET test
```

Deberías ver: `"Hola desde Redis"`

---

## 🔔 3. Web Push Notifications (Notificaciones Push)

Permite enviar notificaciones push a los navegadores de los usuarios.

### Paso 1: Generar VAPID Keys

Las VAPID keys son necesarias para identificar tu aplicación ante los navegadores.

**Método 1: Con npx (Recomendado)**

Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
npx web-push generate-vapid-keys
```

Verás algo como:

```
=======================================

Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib27SGeRlwpu0ZKwmVxdaEWKrUHhkjsHTcx2HH8y_D2Z0X2yHKlWK8VQMQI

Private Key:
p6YHKBgpqZQK4FZGNvQQxD5fQhZLq-7f6E5Hp1QrfLQ

=======================================
```

**Método 2: Online (menos seguro, solo para pruebas)**

1. Ve a [https://web-push-codelab.glitch.me/](https://web-push-codelab.glitch.me/)
2. Haz clic en **"Generate Keys"**
3. Copia las keys generadas

### Paso 2: Configurar variables de entorno

Copia los valores generados a tu `.env.local`:

```env
# Web Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BEl62iUYgUivxIkv69yViEuiBIa-Ib27SGeRlwpu0ZKwmVxdaEWKrUHhkjsHTcx2HH8y_D2Z0X2yHKlWK8VQMQI"
VAPID_PRIVATE_KEY="p6YHKBgpqZQK4FZGNvQQxD5fQhZLq-7f6E5Hp1QrfLQ"
VAPID_SUBJECT="mailto:admin@tudominio.com"
```

**⚠️ Importante:**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`: **Debe** tener el prefijo `NEXT_PUBLIC_` para estar disponible en el frontend
- `VAPID_PRIVATE_KEY`: Solo backend, **NUNCA** expongas esta key
- `VAPID_SUBJECT`: Tu email de contacto (ej: `mailto:admin@tudominio.com`)

### Paso 3: Crear Service Worker

Crea el archivo `public/sw.js` en tu proyecto:

```javascript
// public/sw.js
self.addEventListener('push', function(event) {
  if (!event.data) {
    return;
  }

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    data: data.data,
    actions: data.actions || [],
    tag: data.tag || 'notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action) {
    // Manejar acciones específicas
    clients.openWindow(event.action);
  } else {
    // Click general en la notificación
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
```

### Paso 4: Crear iconos para notificaciones

Crea estos iconos en la carpeta `public/`:

1. `public/icon-192x192.png` - Icono principal (192x192 px)
2. `public/badge-72x72.png` - Badge pequeño (72x72 px)

Puedes usar cualquier imagen de tu logo/marca.

### Paso 5: Probar las notificaciones

1. Reinicia tu servidor Next.js
2. Ve a tu aplicación
3. Busca la opción de notificaciones en el perfil/configuración
4. Haz clic en "Activar notificaciones"
5. El navegador te pedirá permiso - acepta
6. Envía una notificación de prueba

### Limitaciones por navegador:

| Navegador | Soporte | Notas |
|-----------|---------|-------|
| Chrome Desktop ✅ | Completo | Funciona perfecto |
| Chrome Mobile ✅ | Completo | Android solamente |
| Firefox Desktop ✅ | Completo | Funciona perfecto |
| Firefox Mobile ✅ | Limitado | Solo en Android |
| Safari Desktop ✅ | Desde macOS 13+ | Requiere certificado válido |
| Safari iOS ✅ | Desde iOS 16.4+ | Requiere PWA instalada |
| Edge ✅ | Completo | Basado en Chromium |
| Opera ✅ | Completo | Basado en Chromium |

### ⚠️ Requisitos importantes:

1. **HTTPS requerido** (excepto en localhost)
2. **Permiso del usuario** obligatorio
3. **Service Worker** debe estar registrado
4. **Dominio válido** (no funciona en IPs)

---

## 📝 Resumen Final

Una vez configuradas todas las integraciones opcionales, tu `.env.local` completo debería verse así:

```env
# ===== REQUERIDAS =====

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/creador_inteligencias"

# Gemini AI
GEMINI_API_KEY="AIzaSy..."

# NextAuth
NEXTAUTH_SECRET="tu_secret_super_seguro_generado_con_openssl"
NEXTAUTH_URL="http://localhost:3000"

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN="APP_USR-1234567890-abcdef-ghijklmnopqrstuv"
MERCADOPAGO_PUBLIC_KEY="APP_USR-abcd1234-efgh-5678-ijkl-mnopqrstuvwx"
MERCADOPAGO_PRO_PLAN_ID="2c9380848e7c0e73018e7c7f9876543a"
MERCADOPAGO_ENTERPRISE_PLAN_ID="2c9380848e7c0e73018e7c7f9876543b"

# ===== OPCIONALES =====

# Google OAuth
GOOGLE_CLIENT_ID="123456789012-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-AbCdEfGhIjKlMnOpQrSt"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://gusc1-sweet-mongoose-12345.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AYyxASQgZTFmN2E5N2Yt..."

# Web Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BEl62iUYgUivxIkv69yViEuiBIa..."
VAPID_PRIVATE_KEY="p6YHKBgpqZQK4FZGNvQQxD5f..."
VAPID_SUBJECT="mailto:admin@tudominio.com"

# App URL (opcional pero recomendada)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🔍 Verificación paso a paso

### ✅ Google OAuth
```bash
# 1. Reinicia el servidor
npm run dev

# 2. Ve a la página de login
# http://localhost:3000/api/auth/signin

# 3. Deberías ver el botón de Google
# 4. Intenta iniciar sesión
```

### ✅ Upstash Redis
```bash
# 1. Verifica en los logs del servidor al iniciar
# Deberías ver algo como: "Redis connected successfully"

# 2. El rate limiting funcionará automáticamente
# Intenta hacer muchas peticiones rápidas y verás el límite
```

### ✅ Web Push
```bash
# 1. Ve a configuración de usuario/notificaciones
# 2. Activa las notificaciones
# 3. Acepta el permiso del navegador
# 4. Envía una notificación de prueba
```

---

## 🆘 Troubleshooting

### Google OAuth

**Error: "Error 400: redirect_uri_mismatch"**
- ✅ Verifica que la URL de redirección sea exactamente: `http://localhost:3000/api/auth/callback/google`
- ✅ No olvides el `/api/auth/callback/google` al final
- ✅ Debe coincidir exactamente con lo configurado en Google Cloud Console

**Error: "Access blocked: This app's request is invalid"**
- ✅ Completa la pantalla de consentimiento OAuth
- ✅ Agrega tu email a "Usuarios de prueba"
- ✅ Verifica que los scopes básicos estén configurados

**Error: "User not found" después de login**
- ✅ Verifica que NextAuth esté configurado correctamente en `lib/auth.ts`
- ✅ Asegúrate de que la base de datos tenga las tablas de NextAuth

---

### Upstash Redis

**Error: "Unauthorized" o "Invalid token"**
- ✅ Verifica que copiaste el token completo (es muy largo, +150 caracteres)
- ✅ Asegúrate de no tener espacios al inicio o final
- ✅ Prueba copiar de nuevo desde el dashboard de Upstash

**Error: "Connection timeout"**
- ✅ Verifica tu conexión a internet
- ✅ Asegúrate de que la URL tenga `https://`
- ✅ Revisa que no haya firewall bloqueando la conexión

**No funciona el rate limiting**
- ✅ Verifica que las variables estén en `.env.local`
- ✅ Reinicia el servidor después de agregar las variables
- ✅ Verifica que Upstash Redis esté implementado en el código

---

### Web Push

**Error: "Push not supported"**
- ✅ Usa HTTPS (en producción)
- ✅ En localhost HTTP está permitido
- ✅ Verifica que tu navegador soporte push notifications
- ✅ Prueba en Chrome/Firefox primero

**Error: "Registration failed"**
- ✅ Verifica que `public/sw.js` exista
- ✅ Limpia el caché del navegador (Ctrl+Shift+R)
- ✅ Asegúrate de que el service worker se registre correctamente

**Las notificaciones no llegan**
- ✅ Verifica que el usuario haya dado permiso
- ✅ Revisa que las VAPID keys sean correctas
- ✅ Asegúrate de que `NEXT_PUBLIC_VAPID_PUBLIC_KEY` tenga el prefijo `NEXT_PUBLIC_`
- ✅ Verifica en la consola del navegador si hay errores

**Safari no muestra notificaciones**
- ✅ Safari requiere macOS 13+ o iOS 16.4+
- ✅ En iOS, la app debe estar instalada como PWA
- ✅ Requiere HTTPS con certificado válido

---

## 💡 Tips y Mejores Prácticas

### Desarrollo Local
1. ✅ Todas estas integraciones funcionan en `localhost`
2. ✅ No necesitas HTTPS en desarrollo (excepto para probar Safari)
3. ✅ Usa las credenciales de prueba/desarrollo

### Producción
1. ✅ Actualiza todas las URLs de callback/redirect
2. ✅ Usa credenciales de producción
3. ✅ Requiere HTTPS obligatorio
4. ✅ Configura webhooks con URLs públicas

### Seguridad
1. 🚨 **NUNCA** commits `.env.local` a Git
2. 🚨 Usa `.env.example` solo con valores de ejemplo
3. 🚨 Rota las keys si se exponen accidentalmente
4. ✅ Usa variables de entorno en tu servicio de hosting

### Testing
1. ✅ Prueba cada integración por separado
2. ✅ Verifica los logs del servidor
3. ✅ Usa el modo incógnito para probar con cuentas nuevas
4. ✅ Documenta cualquier problema que encuentres

---

## 📚 Recursos Adicionales

### Google OAuth
- [Google Cloud Console](https://console.cloud.google.com/)
- [Documentación OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth Google Provider](https://next-auth.js.org/providers/google)

### Upstash Redis
- [Upstash Console](https://console.upstash.com/)
- [Documentación Upstash](https://docs.upstash.com/)
- [REST API Reference](https://docs.upstash.com/redis/features/restapi)

### Web Push
- [Web Push Notifications Intro](https://web.dev/push-notifications-overview/)
- [Push API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [VAPID Keys Explanation](https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/)

---

## ✨ ¿Necesitas ayuda?

Si encuentras algún problema:
1. Revisa la sección de **Troubleshooting** arriba
2. Verifica los logs del servidor (`npm run dev`)
3. Revisa la consola del navegador (F12)
4. Busca el error específico en la documentación oficial

¡Buena suerte con la configuración! 🚀
