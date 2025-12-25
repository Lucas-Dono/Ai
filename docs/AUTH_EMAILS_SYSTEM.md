# Sistema de Emails de Autenticación

Sistema completo de envío automático de emails para autenticación de usuarios, incluyendo verificación de email y recuperación de contraseña.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Configuración](#configuración)
- [Arquitectura](#arquitectura)
- [Uso](#uso)
- [Templates de Email](#templates-de-email)
- [Rutas API](#rutas-api)
- [Seguridad](#seguridad)
- [Troubleshooting](#troubleshooting)

## ✨ Características

### ✅ Implementado

- **Email de Verificación**: Enviado automáticamente al registrarse
- **Recuperación de Contraseña**: Sistema completo de reset de contraseña
- **Notificación de Cambio de Contraseña**: Email de confirmación al cambiar contraseña
- **Sistema Desactivable**: Control completo con variable de entorno `EMAIL_ENABLED`
- **Templates Profesionales**: Diseño responsive con brand de Blaniel
- **Seguridad**: Tokens seguros con expiración, rate limiting, validación de datos

### 🔒 Seguridad

- Tokens generados con `crypto.randomBytes(32)` (256 bits)
- Expiración automática de tokens (24h para verificación, 1h para reset)
- No se revela si un email existe en el sistema (mensajes genéricos)
- Registro de IP y User Agent en solicitudes de reset
- Limpieza automática de tokens expirados

## ⚙️ Configuración

### 1. Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```bash
# ═══════════════════════════════════════════════════════════════════
# EMAIL SYSTEM CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

# ⚠️ IMPORTANTE: Habilitar/Deshabilitar sistema de emails
# Si está en "false", la aplicación será totalmente funcional sin emails
EMAIL_ENABLED="false"  # Cambiar a "true" cuando tengas DonWeb configurado

# Proveedor de Email: "smtp" (recomendado) o "api"
EMAIL_PROVIDER="smtp"

# Email remitente
ENVIALOSIMPLE_FROM_EMAIL="noreply@tudominio.com"
ENVIALOSIMPLE_FROM_NAME="Blaniel"

# Configuración SMTP (DonWeb)
SMTP_HOST="smtp.envialosimple.email"
SMTP_PORT="587"
SMTP_USER="noreply@tudominio.com"
SMTP_PASS="tu_contraseña_aquí"
SMTP_SECURE="false"

# URL de la aplicación
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Obtener Credenciales de DonWeb

#### Opción 1: Mail Profesional (Recomendado para empezar)

1. Ingresa a tu cuenta DonWeb
2. Ve a "Mis servicios" → Selecciona tu servicio → "Correos"
3. Haz clic en "Datos de Configuración"
4. Copia las credenciales SMTP:
   - Host: `smtp.envialosimple.email`
   - Puerto: `587`
   - Usuario: Tu email completo
   - Contraseña: Tu contraseña de email

**Límites:**
- 2,400 emails/día (100/hora por casilla)
- Costo: ~$20 USD/año
- Suficiente para ~30,000 usuarios activos

#### Opción 2: EnvíaloSimple Transaccional API

Para cuando necesites escalar (más de 2,000 emails/día):

1. Ve a https://app.envialosimple.com/
2. Obtén tu API KEY
3. Cambia `EMAIL_PROVIDER="api"`
4. Agrega `ENVIALOSIMPLE_API_KEY="tu_api_key"`

**Límites:**
- 24,000 emails/día (1,000/hora)
- Costo: ~$228 USD/año

### 3. Configurar DNS (Importante)

Para mejorar la entregabilidad de tus emails, configura estos registros DNS:

**SPF Record:**
```
TXT @ "v=spf1 include:_spf.envialosimple.email ~all"
```

**DKIM Record:**
Contacta a soporte de DonWeb para obtener tu DKIM record específico.

**DMARC Record:**
```
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:admin@tudominio.com"
```

## 🏗️ Arquitectura

### Flujo de Verificación de Email

```
1. Usuario se registra
   ↓
2. API /api/auth/register crea usuario
   ↓
3. Se envía email de verificación (si EMAIL_ENABLED=true)
   ↓
4. Usuario hace clic en el link del email
   ↓
5. API /api/auth/verify-email verifica el token
   ↓
6. Se marca el email como verificado (emailVerified = true)
   ↓
7. Se elimina el token de la base de datos
```

### Flujo de Recuperación de Contraseña

```
1. Usuario solicita reset desde /forgot-password
   ↓
2. API /api/auth/forgot-password valida email
   ↓
3. Se crea token de reset y se envía email (si EMAIL_ENABLED=true)
   ↓
4. Usuario hace clic en el link del email
   ↓
5. Usuario ingresa nueva contraseña
   ↓
6. API /api/auth/reset-password valida token y actualiza contraseña
   ↓
7. Se elimina el token y se envía email de confirmación
```

## 📝 Uso

### Enviar Email de Verificación

```typescript
import { sendEmailVerification } from '@/lib/email/auth-emails.service';

// Enviar verificación
await sendEmailVerification(userId, email, userName);
```

### Verificar Email

```typescript
import { verifyEmailToken } from '@/lib/email/auth-emails.service';

// Verificar token
const result = await verifyEmailToken(email, token);

if (result.success) {
  console.log('Email verificado!');
} else {
  console.error(result.error);
}
```

### Enviar Reset de Contraseña

```typescript
import { sendPasswordReset } from '@/lib/email/auth-emails.service';

// Enviar reset con información de seguridad
await sendPasswordReset(email, ipAddress, userAgent);
```

### Resetear Contraseña

```typescript
import {
  verifyPasswordResetToken,
  deletePasswordResetToken,
  sendPasswordChangedNotification
} from '@/lib/email/auth-emails.service';

// 1. Verificar token
const verifyResult = await verifyPasswordResetToken(email, token);

if (verifyResult.success) {
  // 2. Actualizar contraseña en la base de datos
  await updateUserPassword(email, newPassword);

  // 3. Eliminar token usado
  await deletePasswordResetToken(email, token);

  // 4. Enviar notificación
  await sendPasswordChangedNotification(email, ipAddress);
}
```

## 📧 Templates de Email

### Email de Verificación (`EmailVerification.tsx`)

**Enviado:** Al registrarse o solicitar reenvío
**Expira:** 24 horas
**Incluye:**
- Nombre del usuario
- Botón de verificación
- Link alternativo (copiar/pegar)
- Advertencia de expiración
- Información de seguridad

### Email de Reset de Contraseña (`PasswordReset.tsx`)

**Enviado:** Al solicitar recuperación de contraseña
**Expira:** 1 hora
**Incluye:**
- Nombre del usuario
- Botón de reset
- Link alternativo (copiar/pegar)
- IP y User Agent de la solicitud
- Advertencias de seguridad

### Email de Confirmación de Cambio (`PasswordChanged.tsx`)

**Enviado:** Después de cambiar contraseña exitosamente
**Incluye:**
- Confirmación del cambio
- Fecha y hora del cambio
- IP desde donde se realizó
- Instrucciones si no fue el usuario

## 🌐 Rutas API

### POST `/api/auth/register`

Registra un nuevo usuario y envía email de verificación.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "birthDate": "1990-01-01"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "user": { ... },
  "emailVerificationSent": true
}
```

### POST `/api/auth/verify-email`

Verifica el email con un token.

**Body:**
```json
{
  "email": "user@example.com",
  "token": "abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verificado exitosamente"
}
```

### GET `/api/auth/verify-email?email=...&token=...`

Verifica email mediante link (usado en emails).

### POST `/api/auth/resend-verification`

Reenvía el email de verificación.

**Body:**
```json
{
  "email": "user@example.com"
}
```

### POST `/api/auth/forgot-password`

Inicia el proceso de recuperación de contraseña.

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Si el email existe, recibirás instrucciones para restablecer tu contraseña"
}
```

### POST `/api/auth/reset-password`

Resetea la contraseña con un token válido.

**Body:**
```json
{
  "email": "user@example.com",
  "token": "abc123...",
  "password": "newSecurePassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

## 🔐 Seguridad

### Generación de Tokens

```typescript
import crypto from 'crypto';

const token = crypto.randomBytes(32).toString('hex');
// Resultado: 64 caracteres hexadecimales (256 bits de entropía)
```

### Almacenamiento de Tokens

Los tokens se almacenan en el modelo `Verification` de Prisma:

```prisma
model Verification {
  id         String   @id @default(cuid())
  identifier String   // email para verificación, "password_reset:email" para reset
  value      String   // token
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([identifier, value])
}
```

### Expiración de Tokens

- **Email Verification**: 24 horas
- **Password Reset**: 1 hora

Los tokens expirados se eliminan automáticamente al verificar.

### Rate Limiting

Se recomienda implementar rate limiting en las rutas de autenticación para prevenir ataques de fuerza bruta.

## 🔧 Troubleshooting

### Los emails no se están enviando

1. **Verifica `EMAIL_ENABLED`:**
   ```bash
   echo $EMAIL_ENABLED
   # Debe ser "true"
   ```

2. **Revisa las credenciales SMTP:**
   ```bash
   # Verifica que estén configuradas
   echo $SMTP_USER
   echo $SMTP_HOST
   ```

3. **Revisa los logs:**
   Los emails se loguean en la consola con información detallada.

### Los emails van a spam

1. **Configura SPF, DKIM y DMARC** (ver sección de Configuración DNS)
2. **Verifica que el dominio del remitente coincida** con el dominio autenticado en DonWeb
3. **Evita palabras spam** en los asuntos y contenido

### Token expirado o inválido

1. **Email verification**: El token dura 24 horas
2. **Password reset**: El token dura 1 hora
3. **Solicita un nuevo token** usando `/api/auth/resend-verification` o `/api/auth/forgot-password`

### La aplicación no funciona con EMAIL_ENABLED=false

Si la aplicación no funciona con emails desactivados:

1. **Revisa que todos los servicios verifiquen `EMAIL_ENABLED`** antes de enviar
2. **Los errores de email NO deben bloquear** el flujo de autenticación
3. **Verifica que `emailVerified` no sea requerido** para funcionalidades críticas

## 📊 Monitoreo

### Logs de Email

Todos los emails se loguean con:
- Email del destinatario
- Asunto
- Resultado (éxito/error)
- Provider usado (SMTP/API)

### Métricas a Monitorear

- Tasa de entrega
- Tasa de apertura (requiere tracking)
- Tasa de verificación de email
- Tiempo promedio de verificación
- Tokens expirados vs usados

## 📚 Referencias

- [DonWeb SMTP](https://soporte.donweb.com/hc/es/articles/22286062992532)
- [EnvíaloSimple API](https://api-transaccional.envialosimple.email/)
- [Better Auth Docs](https://www.better-auth.com/)
- [Nodemailer](https://nodemailer.com/)
- [React Email](https://react.email/)

## 🤝 Contribuir

Para agregar nuevos templates de email:

1. Crea el componente en `lib/email/templates/auth/`
2. Regístralo en `lib/email/templates/renderer.tsx`
3. Crea el servicio en `lib/email/auth-emails.service.ts`
4. Crea la ruta API en `app/api/auth/`
5. Actualiza esta documentación

---

**Creado por:** Blaniel Team
**Última actualización:** Diciembre 2025
