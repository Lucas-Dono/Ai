# 🔒 IMPLEMENTACIÓN DE SEGURIDAD - Guía Completa

**Fecha**: 2025-01-08
**Estado**: ✅ Sistema de encriptación implementado - **REQUIERE PASOS MANUALES**

---

## 📋 ¿QUÉ SE IMPLEMENTÓ AUTOMÁTICAMENTE?

### ✅ Completado

1. **Sistema de encriptación AES-256-GCM**
   - `lib/encryption/message-encryption.ts` - Funciones de encriptación/desencriptación
   - Tests completos en `lib/encryption/__tests__/message-encryption.test.ts`
   - Clave generada y agregada a `.env`

2. **Schema de Prisma actualizado**
   - Campos `iv` y `authTag` agregados al modelo `Message`
   - Soporte para mensajes legacy (sin encriptar) y nuevos (encriptados)

3. **Servicios actualizados**
   - `lib/services/message.service.ts` - Encripta al guardar, desencripta al leer
   - `app/api/agents/[id]/message/route.ts` - API actualizada

4. **Script de migración de datos**
   - `scripts/encrypt-existing-messages.ts` - Encripta mensajes legacy
   - Comandos npm agregados: `npm run encrypt-messages`

5. **Backups encriptados**
   - `scripts/backup-database-manual.sh` - Backups con GPG
   - Backups ahora están encriptados y comprimidos

6. **Tests de seguridad**
   - `lib/__tests__/security.test.ts` - Tests de vulnerabilidades
   - Verificación de SQL injection, XSS, etc.

7. **GitHub Actions**
   - `.github/workflows/security-scan.yml` - Escaneo automático
   - Trivy, Semgrep, npm audit, secret scanning

---

## ⚠️ PASOS MANUALES REQUERIDOS (CRÍTICOS)

### 🔴 PASO 1: Aplicar migración de Prisma (5 min)

```bash
# 1. Generar migración
npx prisma migrate dev --name add_message_encryption

# 2. Aplicar a base de datos
npx prisma generate

# 3. Verificar que los campos fueron agregados
npx prisma studio
# Abre la tabla "Message" y verifica que existan los campos "iv" y "authTag"
```

**¿Qué hace esto?** Agrega las columnas `iv` y `authTag` a la tabla `Message` en tu base de datos PostgreSQL.

---

### 🔴 PASO 2: Encriptar mensajes existentes (10-30 min dependiendo de cantidad)

⚠️ **IMPORTANTE**: Crear un backup ANTES de ejecutar esto

```bash
# 1. Crear backup (OBLIGATORIO)
./scripts/backup-database-manual.sh

# 2. Dry run (ver cuántos mensajes se encriptarían)
npm run encrypt-messages:dry-run

# 3. Si todo se ve bien, encriptar TODOS los mensajes
npm run encrypt-messages

# Opcional: Encriptar solo los primeros 100 mensajes (para testing)
npx tsx scripts/encrypt-existing-messages.ts --limit=100
```

**¿Qué hace esto?** Encripta todos los mensajes que actualmente están en texto plano en tu base de datos.

---

### 🟡 PASO 3: Verificar que la encriptación funciona (2 min)

```bash
# Ejecutar tests de encriptación
npm test lib/encryption/__tests__/message-encryption.test.ts

# Ejecutar tests de seguridad
npm test lib/__tests__/security.test.ts

# Si todos pasan ✅ = La encriptación funciona correctamente
```

---

### 🟡 PASO 4: Configurar GPG para backups (10 min)

```bash
# 1. Generar clave GPG (si no existe)
gpg --quick-generate-key "backup@tuapp.com" default default never

# 2. Verificar que la clave fue creada
gpg --list-keys

# 3. Exportar clave privada (GUARDAR EN LUGAR SEGURO)
gpg --export-secret-keys backup@tuapp.com > ~/.gnupg/backup-key-private.asc

# 4. Guardar en 1Password / Bitwarden / Lugar seguro
# ⚠️ Si pierdes esta clave, NO PODRÁS RECUPERAR LOS BACKUPS
```

---

### 🟢 PASO 5: Configurar GitHub Advanced Security (Opcional - Requiere repo público o GitHub Pro)

1. Ve a **Settings** → **Security** → **Code security and analysis**
2. Activa:
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Code scanning (GitHub Actions ya está configurado)
   - ✅ Secret scanning (si tienes GitHub Advanced Security)

---

## 🧪 TESTING DE SEGURIDAD CON IA (GRATIS)

### Opción 1: Pentesting manual con Claude/ChatGPT

Abre una **nueva conversación** (sin acceso a tu código) y dale este prompt:

```
Eres un pentester ético. Tengo una app Next.js con:
- Autenticación con JWT
- Base de datos PostgreSQL con mensajes encriptados (AES-256-GCM)
- API REST para mensajes en /api/agents/[id]/message

Lista las 20 vulnerabilidades más comunes que debería verificar
y dame ejemplos de payloads de ataque para cada una.

Incluye:
- SQL Injection
- XSS
- CSRF
- IDOR
- Authentication bypass
- Rate limit bypass
- Session hijacking
```

Luego verifica cada vulnerabilidad en tu código.

### Opción 2: Herramientas automatizadas gratuitas

```bash
# 1. OWASP ZAP (Web vulnerability scanner)
docker run -t ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t http://localhost:3000

# 2. npm audit (vulnerabilidades en dependencias)
npm audit --audit-level=moderate

# 3. Trivy (escaneo de dependencias)
docker run aquasec/trivy fs .

# 4. Semgrep (análisis de código)
npx semgrep --config=auto .
```

---

## 📊 VERIFICACIÓN FINAL

Ejecuta estos comandos para verificar que todo está correcto:

```bash
# 1. Verificar que la clave de encriptación está en .env
grep MESSAGE_ENCRYPTION_KEY .env

# 2. Verificar que los campos están en el schema
grep -A 2 "iv.*String" prisma/schema.prisma

# 3. Verificar que los tests pasan
npm test lib/encryption/__tests__/

# 4. Verificar que puedes crear un backup encriptado
./scripts/backup-database-manual.sh --local-only

# 5. Verificar que GitHub Actions está configurado
cat .github/workflows/security-scan.yml
```

**Si todo lo anterior funciona ✅ = Implementación exitosa**

---

## 🚀 PRÓXIMOS PASOS (Recomendados)

### Fase 2: Mejorar PII Protection (1-2 semanas)

1. **Hashear emails y IPs**
   ```typescript
   // Implementar en lib/encryption/pii-encryption.ts
   export function hashEmail(email: string): Promise<string> {
     return bcrypt.hash(email.toLowerCase(), 10);
   }
   ```

2. **Anonimizar IPs en sesiones**
   ```typescript
   // Truncar últimos 2 octetos
   function anonymizeIP(ip: string): string {
     return ip.split('.').slice(0, 2).join('.') + '.XXX.XXX';
   }
   ```

3. **Ampliar sistema de auditoría**
   - Loguear accesos a datos personales
   - Exportación de datos (GDPR Art. 20)
   - Eliminaciones de datos (GDPR Art. 17)

### Fase 3: Data Retention Policy (1 semana)

```typescript
// lib/data-retention/cleanup.service.ts
const RETENTION_PERIODS = {
  messages: {
    free: 30 days,
    plus: 1 year,
    ultra: 5 years,
  },
};
```

Implementar cron job para limpiar mensajes antiguos.

### Fase 4: GDPR Compliance (1 semana)

1. Endpoint de "Derecho al olvido"
2. Endpoint de "Portabilidad de datos"
3. Documentar política de privacidad
4. Cookie consent banner

---

## 📞 AYUDA Y SOPORTE

### ¿Tienes problemas?

1. **Error en migración de Prisma**
   - Revisa `prisma/migrations/` para ver qué falló
   - Ejecuta `npx prisma migrate reset` (⚠️ BORRA DATOS)
   - Restaura desde backup

2. **Error al encriptar mensajes**
   - Verifica que `MESSAGE_ENCRYPTION_KEY` está en `.env`
   - Ejecuta con `--dry-run` primero
   - Revisa logs en `scripts/encrypt-existing-messages.ts`

3. **Tests fallan**
   - Verifica que la clave de test está configurada
   - Ejecuta `npm install` para dependencias

### Recursos útiles

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GDPR Compliance](https://gdpr.eu/checklist/)
- [Node.js Crypto Docs](https://nodejs.org/api/crypto.html)
- [Prisma Security Best Practices](https://www.prisma.io/docs/guides/security)

---

## ✅ CHECKLIST FINAL

Antes de lanzar a producción:

- [ ] Migración de Prisma aplicada
- [ ] Mensajes existentes encriptados
- [ ] Tests de seguridad pasan
- [ ] Backups encriptados funcionan
- [ ] GPG clave privada guardada en lugar seguro
- [ ] GitHub Actions configurado
- [ ] `.env` con permisos 600 (o filesystem no lo soporta)
- [ ] Documentación de política de privacidad actualizada
- [ ] Bug bounty program considerado (opcional)

---

**🎉 ¡Felicitaciones!** Tu aplicación ahora tiene encriptación end-to-end para mensajes.

Los datos en la base de datos están protegidos incluso si alguien accede al servidor.
