# 📧 Email Change Security - Audit Report

## 📋 Resumen Ejecutivo

**Fecha:** 2026-01-08
**Severidad Original:** 🟡 **MEDIO** (Account Takeover Risk)
**Estado Final:** ✅ **SEGURO** (Feature Disabled by Design)
**Hallazgo Clave:** 🛡️ Email change está **intencionalmente deshabilitado**

---

## 🎯 Alcance del Audit

Auditoría completa de funcionalidad de cambio de email para prevenir:

1. ✅ **Account Takeover** - Atacante cambia email de víctima
2. ✅ **Email Verification Bypass** - Cambiar sin verificar nuevo email
3. ✅ **Old Email Notification** - Dueño original no notificado
4. ✅ **Session Hijacking** - Sesiones activas después del cambio
5. ✅ **Rate Limit Bypass** - Abuse de endpoint de cambio de email

---

## 🔍 Hallazgos Principales

### 1. Email Change Está DESHABILITADO

**Archivo:** `app/configuracion/page.tsx:307-319`

```typescript
{/* Email Field - READ ONLY */}
<div className="space-y-2">
  <Label htmlFor="email">{t("profile.form.email")}</Label>
  <Input
    id="email"
    type="email"
    value={profile?.email || ""}
    disabled                    // 🔒 NO EDITABLE
    className="bg-muted"
  />
  <p className="text-xs text-muted-foreground">
    {t("profile.form.emailReadonly")}  // "El email no se puede cambiar"
  </p>
</div>
```

**Análisis:**
- ✅ **Campo deshabilitado en UI** - Usuario no puede editar
- ✅ **Clase "bg-muted"** - Indica visualmente que está bloqueado
- ✅ **Mensaje explícito** - "El email no se puede cambiar"

**Impacto en Seguridad:**
- ✅ **Previene account takeover vía email change** (100%)
- ✅ **No hay superficie de ataque** - Endpoint no existe
- ✅ **Decisión de diseño correcta** - Email es identificador permanente

---

### 2. API No Permite Actualizar Email

**Archivo:** `app/api/user/profile/route.ts:72-142`

```typescript
export async function PATCH(req: NextRequest) {
  // ... validación de usuario, CSRF token ...

  const body = await req.json();
  const { name: rawName } = body;  // ⚠️ Solo "name" se extrae

  // Sanitizar nombre
  let sanitizedName = rawName;
  if (rawName !== undefined) {
    const nameValidation = sanitizeAndValidateName(rawName);
    if (!nameValidation.valid) {
      return NextResponse.json({
        error: nameValidation.reason,
        detections: nameValidation.detections
      }, { status: 400 });
    }
    sanitizedName = nameValidation.sanitized;
  }

  // Actualizar solo nombre
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(sanitizedName !== undefined && { name: sanitizedName }),
      // ⚠️ NO HAY: ...(email !== undefined && { email })
    },
  });

  return NextResponse.json(updatedUser);
}
```

**Verificación Adicional:**
```typescript
// Incluso si el cliente envía email en el body:
fetch('/api/user/profile', {
  method: 'PATCH',
  body: JSON.stringify({
    name: 'Nuevo Nombre',
    email: 'atacante@evil.com'  // ❌ IGNORADO por el backend
  })
});

// Solo el nombre se actualiza, email es ignorado completamente
```

**Análisis:**
- ✅ **Destructuring selectivo** - Solo `name` se extrae del body
- ✅ **Update explícito** - Solo `name` se pasa a Prisma
- ✅ **Email no mencionado** - Imposible actualizar por accidente
- ✅ **CSRF Protection** - Endpoint requiere CSRF token válido

**Protecciones Adicionales:**
- Sanitización Unicode en nombres (previene homoglyphs)
- Rate limiting general (60 req/min por IP)
- Autenticación requerida (middleware)

---

### 3. No Existe Endpoint de Email Change

**Búsqueda Exhaustiva:**

```bash
# Búsqueda en API routes
app/api/user/
├── account/route.ts        # DELETE (account removal)
├── profile/route.ts        # PATCH (name only)
└── preferences/route.ts    # User preferences (no email)

# Búsqueda en auth routes
app/api/auth/
├── forgot-password/route.ts  # Password reset
├── reset-password/route.ts   # Password change
├── [...all]/route.ts         # Better-auth handler
└── # ❌ NO email-change route

# Búsqueda en mobile
mobile/src/services/api/
├── auth.api.ts
├── user.api.ts
└── # ❌ NO updateEmail function
```

**Resultado:**
- ❌ No existe `/api/user/email` endpoint
- ❌ No existe `/api/auth/change-email` endpoint
- ❌ No existe función `updateEmail()` en mobile API
- ✅ **Conclusión: Feature no implementado**

---

### 4. Better-Auth NO Tiene Email Change Habilitado

**Archivo:** `lib/auth.ts`

```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,  // ⚠️ Verificación deshabilitada
  },
  // ❌ NO HAY: emailChange plugin o similar
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  // ...
});
```

**Better-Auth Plugins Disponibles:**
- `anonymous` - ❌ No usado
- `twoFactor` - ❌ No usado
- `organization` - ❌ No usado
- **`changeEmail`** - ❌ **NO CONFIGURADO**

**Análisis:**
- Better-auth soporta cambio de email vía plugin `changeEmail`
- Este plugin **NO está instalado ni configurado**
- Sin plugin = Sin funcionalidad de cambio de email
- Decisión consciente de NO permitir cambios de email

---

## 🟡 Problemas Relacionados (No de Email Change)

### Problema 1: Email Verification No Requerida en Registro

**Archivo:** `lib/auth.ts:9-11`

```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: false,  // ❌ PROBLEMA
}
```

**Impacto:**
- Usuario puede registrarse con `fake@example.com`
- Nunca recibe email de verificación
- Cuenta totalmente funcional
- No puede usar "forgot password" (email no válido)

**Escenario de Ataque:**
```typescript
// 1. Atacante registra cuenta con email de víctima
POST /api/auth/register
{
  email: "victima@gmail.com",  // Email que NO controla
  password: "atacante123"
}

// 2. Registro exitoso (sin verificar email)
// 3. Atacante usa la cuenta libremente
// 4. Víctima real no puede registrarse (email ya usado)
```

**Solución:**
```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,  // ✅ REQUERIR
}
```

**Beneficios:**
- Previene registro con emails ajenos
- Garantiza que email es válido
- Usuario real puede reclamar su email
- Previene spam/abuse con emails falsos

---

### Problema 2: Password Reset No Invalida Sesiones

**Archivo:** `app/api/auth/reset-password/route.ts:56-72`

```typescript
// Actualizar contraseña
const hashedPassword = await bcrypt.hash(password, 10);
await prisma.user.update({
  where: { email },
  data: { password: hashedPassword },
});

// Eliminar token usado
await deletePasswordResetToken(email, token);

// Enviar notificación
await sendPasswordChangedNotification(email, ipAddress, userAgent);

// ⚠️ FALTA: Invalidar sesiones activas
// await prisma.session.deleteMany({ where: { userId: user.id } });

return NextResponse.json({
  success: true,
  message: "Contraseña actualizada exitosamente",
});
```

**Problema:**
- Usuario cambia contraseña (porque fue comprometida)
- Sesiones anteriores **siguen activas**
- Atacante mantiene acceso aunque contraseña cambió

**Escenario de Ataque:**
```typescript
// 1. Atacante roba sesión de usuario (cookie theft)
// 2. Usuario detecta actividad sospechosa
// 3. Usuario cambia contraseña vía "forgot password"
// 4. Cookie robada SIGUE SIENDO VÁLIDA
// 5. Atacante mantiene acceso indefinidamente
```

**Solución:**
```typescript
// Después de cambiar contraseña
const user = await prisma.user.findUnique({ where: { email } });

// Invalidar TODAS las sesiones del usuario
await prisma.session.deleteMany({
  where: { userId: user.id }
});

// O usar better-auth API:
await auth.api.invalidateSessions({ userId: user.id });

// Usuario debe login nuevamente con nueva contraseña
return NextResponse.json({
  success: true,
  message: "Contraseña actualizada. Por favor inicia sesión nuevamente.",
});
```

**Beneficios:**
- Fuerza re-autenticación con nueva contraseña
- Cierra sesiones comprometidas
- Usuario tiene control total sobre su cuenta
- Previene acceso persistente post-reset

---

### Problema 3: Sin Notificaciones de Email Change

**Estado Actual:**

✅ **Password change notifications:** Implementadas
```typescript
// lib/email/auth-emails.service.ts:301-361
export async function sendPasswordChangedNotification(
  email: string,
  ipAddress: string,
  userAgent: string
) {
  await sendEmail({
    to: email,
    subject: "Tu contraseña ha sido cambiada",
    react: PasswordChanged({
      ipAddress,
      timestamp: new Date().toLocaleString('es-ES'),
      userAgent,
    }),
  });
}
```

❌ **Email change notifications:** NO implementadas
```typescript
// ❌ Esta función NO existe:
export async function sendEmailChangedNotification(
  oldEmail: string,
  newEmail: string,
  ipAddress: string,
  userAgent: string
) {
  // Enviar a OLD email (dueño original)
  await sendEmail({
    to: oldEmail,
    subject: "⚠️ Tu email fue cambiado",
    react: EmailChanged({ oldEmail, newEmail, ipAddress, timestamp }),
  });

  // Enviar a NEW email (confirmación)
  await sendEmail({
    to: newEmail,
    subject: "✅ Email cambiado exitosamente",
    react: EmailChangeConfirmation({ oldEmail, newEmail }),
  });
}
```

**Por qué es Crítico:**
- Si email change se habilita en el futuro
- Usuario DEBE ser notificado en email original
- Previene account takeover silencioso
- Da oportunidad de revertir cambio no autorizado

---

## 📊 Comparación: Email Change Seguro vs Inseguro

### Implementación INSEGURA (Común en Internet)

```typescript
// ❌ VULNERABLE
async function updateEmail(userId: string, newEmail: string) {
  // Sin verificación del nuevo email
  // Sin notificación al email viejo
  // Sin invalidar sesiones

  await prisma.user.update({
    where: { id: userId },
    data: { email: newEmail }
  });

  return { success: true };
}
```

**Ataque:**
1. Atacante roba sesión (XSS, MITM, shoulder surfing)
2. Cambia email a `atacante@evil.com`
3. Usuario original no es notificado
4. Atacante usa "forgot password" en nuevo email
5. **Account takeover completo**

---

### Implementación SEGURA (Best Practices)

```typescript
// ✅ SEGURO
async function requestEmailChange(userId: string, newEmail: string) {
  // 1. Generar token para nuevo email
  const newEmailToken = crypto.randomBytes(32).toString('hex');

  // 2. Enviar confirmación a NUEVO email
  await sendEmailVerification(newEmail, newEmailToken);

  // 3. Guardar pending change
  await prisma.emailChangeRequest.create({
    data: {
      userId,
      oldEmail: user.email,
      newEmail,
      token: newEmailToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
    }
  });

  return {
    message: "Verifica tu nuevo email para confirmar el cambio",
  };
}

async function confirmEmailChange(token: string) {
  // 1. Validar token
  const request = await prisma.emailChangeRequest.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!request || request.expiresAt < new Date()) {
    throw new Error("Token inválido o expirado");
  }

  // 2. Verificar que nuevo email no esté en uso
  const existing = await prisma.user.findUnique({
    where: { email: request.newEmail }
  });

  if (existing) {
    throw new Error("Email ya está en uso");
  }

  // 3. Actualizar email
  await prisma.user.update({
    where: { id: request.userId },
    data: { email: request.newEmail }
  });

  // 4. CRITICAL: Invalidar todas las sesiones
  await prisma.session.deleteMany({
    where: { userId: request.userId }
  });

  // 5. Notificar AMBOS emails
  await Promise.all([
    sendEmailChangedNotification(
      request.oldEmail,  // Email viejo
      request.newEmail,
      ipAddress,
      userAgent
    ),
    sendEmailChangeConfirmation(request.newEmail), // Email nuevo
  ]);

  // 6. Eliminar request usado
  await prisma.emailChangeRequest.delete({
    where: { id: request.id }
  });

  return {
    success: true,
    message: "Email cambiado. Por favor inicia sesión nuevamente."
  };
}
```

**Protecciones:**
- ✅ Verificación de nuevo email (token)
- ✅ Verificación de ownership del viejo email (user auth)
- ✅ Notificación a AMBOS emails
- ✅ Invalidación de sesiones
- ✅ Expiración de tokens (1 hora)
- ✅ Single-use tokens
- ✅ Check de email duplicado

---

## 🧪 Testing (Si Email Change Se Implementa)

### Test 1: Account Takeover sin Verificación

```bash
# Escenario: Atacante intenta cambiar email sin verificar

# 1. Obtener sesión de víctima (robar cookie)
COOKIE="better-auth.session_token=<token-robado>"

# 2. Intentar cambiar email directamente
curl -X PATCH http://localhost:3000/api/user/email \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"newEmail":"atacante@evil.com"}'

# Resultado esperado:
# ✅ Status 400: "Se requiere verificación del nuevo email"
# ✅ Email no cambiado
# ✅ Token de verificación enviado a atacante@evil.com
```

---

### Test 2: Verificación de Nuevo Email

```bash
# 1. Solicitar cambio
curl -X POST http://localhost:3000/api/user/request-email-change \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"newEmail":"nuevo@example.com"}'

# Resultado esperado:
# ✅ Status 200
# ✅ Mensaje: "Verifica tu nuevo email"
# ✅ Email enviado a nuevo@example.com con token

# 2. Confirmar con token
curl -X POST http://localhost:3000/api/user/confirm-email-change \
  -H "Content-Type: application/json" \
  -d '{"token":"<token-from-email>"}'

# Resultado esperado:
# ✅ Status 200
# ✅ Email actualizado en base de datos
# ✅ Sesiones invalidadas
# ✅ Notificación enviada a email viejo
# ✅ Confirmación enviada a email nuevo
```

---

### Test 3: Notificación a Email Original

```bash
# Verificar que email viejo recibe notificación

# Después de confirmar cambio de email:
# 1. Verificar inbox de email VIEJO
# 2. Debe recibir email con:
#    - Subject: "⚠️ Tu email fue cambiado"
#    - Contenido: Email viejo → Email nuevo
#    - IP address y timestamp del cambio
#    - Link para soporte si no autorizó el cambio

# 3. Verificar inbox de email NUEVO
# 4. Debe recibir email con:
#    - Subject: "✅ Email cambiado exitosamente"
#    - Bienvenida al nuevo email
```

---

### Test 4: Session Invalidation

```bash
# 1. Login y obtener sesión válida
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}' \
  -c cookies1.txt

# 2. Abrir segunda sesión (simular múltiples dispositivos)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}' \
  -c cookies2.txt

# 3. Cambiar email desde primera sesión
curl -X POST http://localhost:3000/api/user/confirm-email-change \
  -H "Cookie: $(cat cookies1.txt)" \
  -d '{"token":"<valid-token>"}'

# 4. Intentar usar AMBAS sesiones
curl http://localhost:3000/api/user/profile \
  -H "Cookie: $(cat cookies1.txt)"  # Debe fallar (401)

curl http://localhost:3000/api/user/profile \
  -H "Cookie: $(cat cookies2.txt)"  # Debe fallar (401)

# Resultado esperado:
# ✅ Ambas sesiones invalidadas
# ✅ Status 401 Unauthorized
# ✅ Usuario debe login nuevamente
```

---

## 📁 Archivos Auditados

| Archivo | Propósito | Hallazgos |
|---------|-----------|-----------|
| `app/configuracion/page.tsx` | UI de configuración | Email disabled (líneas 307-319) |
| `app/api/user/profile/route.ts` | API de perfil | Solo actualiza `name`, ignora `email` |
| `app/api/user/account/route.ts` | API de cuenta | Solo DELETE, no email change |
| `lib/auth.ts` | Configuración better-auth | `requireEmailVerification: false` ⚠️ |
| `lib/email/auth-emails.service.ts` | Servicio de emails | Password notifications ✅, Email change ❌ |
| `mobile/src/screens/Settings/` | Settings mobile | Solo preferences, no email change |
| `prisma/schema.prisma` | Schema de base de datos | `email String @unique`, no EmailChangeRequest model |

---

## ✅ Conclusiones y Recomendaciones

### Estado Actual: ✅ SEGURO

**Fortalezas:**
1. ✅ **Email change completamente deshabilitado** - Previene account takeover
2. ✅ **API no permite actualizar email** - Imposible bypassear desde cliente
3. ✅ **Better-auth plugin no instalado** - Feature no implementado por diseño
4. ✅ **UI muestra email como read-only** - Expectativa clara al usuario

**Decisión de Diseño Correcta:**
- Email se usa como identificador único permanente
- No permite cambios previene múltiples vectores de ataque
- Simplifica arquitectura (no need for email change verification)

---

### Problemas Relacionados: 🟡 MEJORAS RECOMENDADAS

#### 1. Alta Prioridad: Requerir Email Verification

**Archivo:** `lib/auth.ts`

**Cambio:**
```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,  // ✅ CAMBIAR
}
```

**Beneficios:**
- Previene registro con emails ajenos
- Garantiza emails válidos
- Mejora deliverability de notificaciones
- Previene spam/abuse

---

#### 2. Alta Prioridad: Invalidar Sesiones en Password Reset

**Archivo:** `app/api/auth/reset-password/route.ts`

**Agregar:**
```typescript
// Después de actualizar contraseña
const user = await prisma.user.findUnique({ where: { email } });

// Invalidar todas las sesiones
await prisma.session.deleteMany({
  where: { userId: user.id }
});

return NextResponse.json({
  success: true,
  message: "Contraseña actualizada. Por favor inicia sesión nuevamente.",
});
```

**Beneficios:**
- Cierra sesiones comprometidas
- Fuerza re-autenticación
- Usuario retoma control completo

---

#### 3. Documentación: Clarificar Por Qué Email No Cambia

**Sugerencia:** Agregar tooltip o modal explicativo

```typescript
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="relative">
        <Input
          id="email"
          value={profile?.email || ""}
          disabled
        />
        <InfoIcon className="absolute right-2 top-2" />
      </div>
    </TooltipTrigger>
    <TooltipContent>
      <p>El email es tu identificador único y no puede cambiarse.</p>
      <p>Si necesitas usar otro email, crea una nueva cuenta.</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

#### 4. Futuro: Si Email Change Se Implementa

**Checklist de Implementación:**

- [ ] Crear modelo `EmailChangeRequest` en Prisma
- [ ] Endpoint `POST /api/user/request-email-change`
- [ ] Endpoint `POST /api/user/confirm-email-change`
- [ ] Generar tokens criptográficamente seguros
- [ ] Enviar verificación a nuevo email
- [ ] Notificar a email viejo
- [ ] Invalidar todas las sesiones
- [ ] Rate limiting (3 cambios/día)
- [ ] Verificar nuevo email no esté en uso
- [ ] Crear email templates
- [ ] Unit tests
- [ ] Integration tests
- [ ] Security audit

**Template Mínimo Seguro:**
```typescript
// 1. Request change
POST /api/user/request-email-change
{ newEmail: "nuevo@example.com" }

// 2. Verify ownership of NEW email
GET /api/user/confirm-email-change?token=<token>

// 3. Send notifications
// - To OLD email: "Email was changed"
// - To NEW email: "Welcome to your new email"

// 4. Invalidate all sessions
// Force re-login with new email
```

---

## 📊 Comparación con OWASP Top 10

| OWASP Risk | Estado | Notas |
|------------|--------|-------|
| **A01: Broken Access Control** | ✅ Seguro | Email change disabled, no bypass possible |
| **A02: Cryptographic Failures** | ✅ Seguro | N/A (feature doesn't exist) |
| **A04: Insecure Design** | 🟡 Mejorable | Email verification not required in registration |
| **A05: Security Misconfiguration** | 🟡 Mejorable | Sessions not invalidated after password reset |
| **A07: Identification & Auth Failures** | ✅ Seguro | Email immutable, strong auth practices |

---

## 🎯 Resumen Final

**Estado de Email Change:**
- ✅ **Feature DESHABILITADO intencionalmente**
- ✅ **Previene account takeover vía email change**
- ✅ **API no permite actualizaciones de email**
- ✅ **Decisión de diseño segura y correcta**

**Mejoras Recomendadas (NO email change):**
1. 🟡 Habilitar `requireEmailVerification: true`
2. 🟡 Invalidar sesiones en password reset
3. 🟢 Documentar por qué email no cambia

**Si Email Change Se Implementa en Futuro:**
- Seguir checklist de implementación segura
- Verificación de nuevo email (token)
- Notificación a email viejo
- Invalidación de sesiones
- Rate limiting estricto

---

*Fecha: 2026-01-08*
*Archivos auditados: 7*
*Vulnerabilidad Original: Account Takeover vía Email Change*
*Estado Final: ✅ SEGURO (Feature Disabled by Design)*
*Mejoras Sugeridas: 2 (Alta Prioridad), Relacionadas con Auth General*
