# Sistema de Administración Segura

## 🔐 Descripción

Panel de administración ultra-seguro para Creador de Inteligencias con arquitectura de cero confianza (Zero Trust) y múltiples capas de protección.

### Características Principales

✅ **mTLS (Mutual TLS)** - Certificados cliente de 48h con auto-renovación
✅ **TOTP** - Autenticación de dos factores (Google Authenticator)
✅ **SSH Recovery** - Recuperación de emergencia en 5 minutos
✅ **Audit Logs** - Registro completo de todas las acciones
✅ **Sin superficie pública** - No hay `/admin` accesible desde internet
✅ **$0 de costo** - Sin dependencias de pago

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        CAPAS DE SEGURIDAD                    │
├─────────────────────────────────────────────────────────────┤
│  CAPA 1: mTLS - Certificado cliente (48h, revocable)       │
│  CAPA 2: NGINX - Validación certificado + CRL               │
│  CAPA 3: Better-Auth - Rol admin                            │
│  CAPA 4: Passkeys - Biometría (Face ID / Huella)           │
│  CAPA 5: Audit Logs - Registro completo                     │
├─────────────────────────────────────────────────────────────┤
│                   RECUPERACIÓN DE EMERGENCIA                 │
├─────────────────────────────────────────────────────────────┤
│  SSH + TOTP → Certificado 24h → Acceso restaurado          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Documentación

### Guías Completas

- **[ADMIN-SETUP.md](./ADMIN-SETUP.md)** - Guía de instalación paso a paso
- **[SSH-HARDENING.md](./SSH-HARDENING.md)** - Configuración segura de SSH

### Quick Start (5 minutos)

```bash
# 1. Generar clave maestra
openssl rand -hex 32
# Agregar a .env como ADMIN_MASTER_KEY

# 2. Ejecutar migraciones
npx prisma migrate dev

# 3. Setup CA (Certificate Authority)
npm run admin:setup-ca

# 4. Configurar TOTP
npm run admin:setup-totp -- admin@tudominio.com

# 5. Generar certificado (48h)
npm run admin:generate-cert -- admin@tudominio.com "MacBook Pro" 48

# 6. Configurar NGINX (ver ADMIN-SETUP.md)

# ✅ Listo! Accede a https://tu-dominio.com:8443/admin
```

---

## 🎯 Comandos Principales

### Setup Inicial

```bash
# Crear Certificate Authority (una sola vez)
npm run admin:setup-ca

# Configurar TOTP para admin
npm run admin:setup-totp -- <email>
```

### Gestión de Certificados

```bash
# Generar certificado cliente (48h)
npm run admin:generate-cert -- <email> <device-name> 48

# Listar todos los certificados
npm run admin:list-certs

# Listar certificados de un admin
npm run admin:list-certs -- <email>

# Revocar certificado
npm run admin:revoke-cert -- <serial-number> <reason>

# Limpiar certificados expirados
npm run admin:cleanup-certs

# Actualizar CRL (Certificate Revocation List)
npm run admin:update-crl
```

### Recuperación de Emergencia

```bash
# Conectar por SSH al servidor
ssh admin@tu-servidor.com

# Ejecutar script de emergencia
cd /ruta/a/tu/proyecto
./scripts/admin/emergency-cert-ssh.sh

# Seguir instrucciones:
# 1. Ingresar email
# 2. Ingresar código TOTP (Google Authenticator)
# 3. Descargar certificado generado (24h)
```

---

## 🔄 Flujos de Uso

### Uso Diario Normal

```
1. Abrir https://tu-dominio.com:8443/admin
2. Navegador usa certificado automáticamente
3. [Opcional] Passkey biométrico
4. ✅ Acceso al admin panel
```

El certificado se **auto-renueva cada vez que entras**, por lo que los 48h se reinician automáticamente.

### Si el Certificado Expira

**Opción A: Desde otro dispositivo con certificado válido**

```bash
npm run admin:generate-cert -- admin@email.com "Laptop" 48
# Instalar en navegador
```

**Opción B: Recuperación de emergencia (SSH + TOTP)**

```bash
ssh admin@servidor.com
./scripts/admin/emergency-cert-ssh.sh
# Seguir instrucciones
```

---

## 🗂️ Estructura de Archivos

```
proyecto/
├── certs/                          # Certificados
│   ├── ca/                         # Certificate Authority
│   │   ├── ca.key                  # Clave privada CA ⚠️ CRÍTICO
│   │   ├── ca.crt                  # Certificado CA
│   │   ├── openssl-client.cnf      # Config OpenSSL
│   │   └── crl.pem                 # Lista de revocación
│   ├── client/                     # Certificados cliente
│   └── temp/                       # Certificados temporales
│
├── scripts/admin/                  # Scripts de gestión
│   ├── setup-ca.sh                 # Setup CA
│   ├── cert-manager.ts             # Gestor certificados
│   ├── generate-cert-cli.ts        # CLI generación
│   ├── setup-totp.ts               # Setup TOTP
│   ├── verify-totp.ts              # Verificación TOTP
│   └── emergency-cert-ssh.sh       # Recuperación SSH
│
├── lib/admin/
│   └── crypto.ts                   # Utilidades cifrado
│
├── nginx/
│   └── admin-mtls.conf             # Config NGINX mTLS
│
├── docs/
│   ├── ADMIN-README.md             # Este archivo
│   ├── ADMIN-SETUP.md              # Guía completa
│   └── SSH-HARDENING.md            # Guía SSH
│
└── prisma/
    ├── schema.prisma               # Modelos admin
    └── migrations/                 # Migraciones BD
```

---

## 🔐 Modelos de Base de Datos

### AdminAccess

Usuario con permisos de administrador.

```prisma
model AdminAccess {
  id               String
  userId           String  @unique
  role             String  // "admin", "moderator"
  enabled          Boolean
  totpSecret       String? // Secret TOTP cifrado
  lastLoginAt      DateTime?
  lastLoginIp      String?

  certificates     AdminCertificate[]
  backupCodes      AdminBackupCode[]
  auditLogs        AuditLog[]
}
```

### AdminCertificate

Certificados cliente para mTLS (48 horas de validez).

```prisma
model AdminCertificate {
  id            String
  adminAccessId String
  serialNumber  String  @unique
  fingerprint   String  @unique
  issuedAt      DateTime
  expiresAt     DateTime  // 48h desde issuedAt
  revokedAt     DateTime?
  revokedReason String?
  deviceName    String?
  isEmergency   Boolean   // Certificado de emergencia (24h)
}
```

### AuditLog

Registro completo de acciones administrativas.

```prisma
model AuditLog {
  id            String
  adminAccessId String
  action        String    // "user.update", "agent.delete", etc.
  targetType    String    // "User", "Agent", "Certificate"
  targetId      String?
  ipAddress     String
  userAgent     String?
  details       Json?     // Detalles específicos
  createdAt     DateTime
}
```

---

## 🛡️ Seguridad

### Principios

1. **Defense in Depth** - Múltiples capas independientes
2. **Least Privilege** - Mínimos permisos necesarios
3. **Zero Trust** - Verificar siempre, nunca confiar
4. **Audit Everything** - Log completo de acciones
5. **Fail Secure** - Si algo falla, denegar acceso

### Certificados de Corta Duración

Los certificados expiran en **48 horas** para minimizar la ventana de ataque si son robados. Sin embargo:

- ✅ Auto-renovación transparente cada acceso
- ✅ Recuperación fácil vía SSH + TOTP (5 minutos)
- ✅ Revocación instantánea ante compromiso

### Recuperación ante Compromiso

**Certificado robado:**

```bash
# Revocar al instante
npm run admin:revoke-cert -- <serial> "stolen"

# Certificado bloqueado en <1 segundo
# Ladrón no puede acceder
```

**TOTP comprometido:**

```bash
# Generar nuevos backup codes
npm run admin:regenerate-backup-codes -- <email>

# O reconfigurar TOTP completamente
npm run admin:setup-totp -- <email>
```

---

## 📊 Métricas y KPIs del Admin Panel

El admin panel incluirá (FASE 3 del proyecto):

### Dashboard Principal

- Usuarios activos / total
- Agentes creados / día
- Mensajes / día
- Errores del sistema
- Latencia API promedio

### Gestión de Usuarios

- Lista paginada con búsqueda
- Filtros (plan, estado, NSFW)
- Detalles completos
- Acciones: banear, cambiar plan, etc.

### Gestión de Agentes

- Lista de todos los agentes
- Moderación de contenido
- Estadísticas de uso
- Eliminación de contenido problemático

### Analytics

- MRR (Monthly Recurring Revenue)
- Conversiones free → premium
- Churn rate
- Retención de usuarios
- Métricas de engagement

### Moderación

- Reportes de contenido
- Cola de moderación
- Acciones rápidas
- Historial

---

## 🔧 Troubleshooting Común

### No puedo conectar a puerto 8443

```bash
# Verificar NGINX
sudo systemctl status nginx

# Ver logs
sudo tail -f /var/log/nginx/admin-error.log

# Verificar puerto abierto
sudo netstat -tlnp | grep 8443

# Abrir en firewall
sudo ufw allow 8443/tcp
```

### "Certificate required"

- Verificar que instalaste el `.p12` en navegador
- Verificar que no expiró (48h)
- Reiniciar navegador

### TOTP inválido en SSH

- Sincronizar hora del servidor: `sudo timedatectl set-ntp true`
- Esperar 30s y usar código nuevo
- Verificar que el código tiene 6 dígitos

---

## 📝 Checklist de Producción

Antes de desplegar en producción:

- [ ] ADMIN_MASTER_KEY generada y en `.env`
- [ ] `.env` en `.gitignore`
- [ ] Migraciones aplicadas
- [ ] CA creada y backup guardado en lugar seguro
- [ ] TOTP configurado y testeado
- [ ] Certificado cliente instalado y probado
- [ ] NGINX configurado con mTLS
- [ ] SSL/TLS (Let's Encrypt) activo
- [ ] Puerto 8443 abierto
- [ ] SSH hardening aplicado
- [ ] Fail2Ban instalado y configurado
- [ ] Backup codes guardados en lugar seguro
- [ ] Acceso admin verificado
- [ ] Recuperación de emergencia testeada
- [ ] Audit logs funcionando

---

## 🚀 Roadmap

### FASE 1: Infraestructura de Seguridad ✅

- [x] Migraciones de BD
- [x] Sistema de certificados (mTLS)
- [x] TOTP + SSH recovery
- [x] Utilidades de cifrado
- [x] Configuración NGINX
- [x] Documentación completa

### FASE 2: API Admin Segura ✅

- [x] Middleware de validación
- [x] Endpoints CRUD (users, agents, etc.)
- [x] Sistema de audit logs
- [x] Rate limiting específico (NGINX)
- [ ] WebAuthn/Passkeys (Fase 3)

### FASE 3: Panel Admin Web ✅

- [x] Dashboard con KPIs
- [x] Gestión de usuarios
- [x] Gestión de agentes
- [x] Sistema de moderación
- [x] Audit logs y reportes
- [x] Gestión de certificados desde web

### FASE 4: Features Avanzados

- [ ] Notificaciones automáticas
- [ ] Backup/Restore automático
- [ ] Multi-admin con permisos granulares
- [ ] Gráficos en tiempo real

---

## 📞 Soporte

**Documentación:**
- [ADMIN-SETUP.md](./ADMIN-SETUP.md) - Setup completo
- [SSH-HARDENING.md](./SSH-HARDENING.md) - SSH seguro

**Logs útiles:**
```bash
# NGINX
sudo tail -f /var/log/nginx/admin-error.log

# SSH
sudo tail -f /var/log/auth.log

# Aplicación
pm2 logs  # o tu método de logging
```

**Base de Datos:**
```bash
# Ver audit logs
npx prisma studio
# Ir a tabla AuditLog

# Ver certificados activos
# Ir a tabla AdminCertificate
```

---

## ⚖️ Licencia

Este sistema es parte del proyecto Creador de Inteligencias.

**⚠️ IMPORTANTE:**
- La clave privada de la CA (`certs/ca/ca.key`) es CRÍTICA
- NUNCA subir a Git
- Hacer backup seguro
- Permisos 400 (solo lectura, solo owner)

---

## 🎓 Aprendizaje

Este sistema implementa:

- **mTLS (Mutual TLS)** - Autenticación bidireccional
- **TOTP (RFC 6238)** - One-Time Passwords
- **Certificate Revocation** - CRL en tiempo real
- **Defense in Depth** - Múltiples capas
- **Zero Trust Architecture** - Verificar siempre
- **Audit Logging** - Trazabilidad completa

Recursos recomendados:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)

---

**✅ FASE 1 COMPLETADA - Infraestructura de Seguridad Lista**

**✅ FASE 2 COMPLETADA - API Admin Segura Lista**

**✅ FASE 3 COMPLETADA - Panel Admin Web Lista**

**🎉 SISTEMA ADMIN COMPLETO Y LISTO PARA USAR**

Ver guía de testing: [ADMIN-TESTING.md](./ADMIN-TESTING.md)
