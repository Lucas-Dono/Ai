# Sistema Admin - Índice de Documentación

Índice rápido para navegar toda la documentación del sistema de administración segura.

---

## 🎯 Empezar Aquí

**¿Primera vez?** → [ADMIN-SUMMARY.md](./ADMIN-SUMMARY.md)
- Resumen completo del proyecto
- Estadísticas y arquitectura
- Features implementadas

---

## 📚 Guías por Orden de Lectura

### 1. Overview y Conceptos
**[ADMIN-README.md](./ADMIN-README.md)**
- ¿Qué es este sistema?
- Arquitectura de seguridad
- Comandos principales
- Roadmap

### 2. Instalación y Configuración
**[ADMIN-SETUP.md](./ADMIN-SETUP.md)**
- Setup paso a paso
- Configuración de CA
- TOTP configuration
- Generación de certificados
- NGINX setup
- Troubleshooting

### 3. Documentación de API
**[ADMIN-API.md](./ADMIN-API.md)**
- Todos los endpoints
- Parámetros y respuestas
- Ejemplos con cURL
- Códigos de error

### 4. Testing Completo
**[ADMIN-TESTING.md](./ADMIN-TESTING.md)**
- Guía de testing paso a paso
- Checklist completo
- Testing de API, UI, seguridad
- Troubleshooting

### 5. Seguridad SSH
**[SSH-HARDENING.md](./SSH-HARDENING.md)**
- Configuración segura de SSH
- Autenticación por clave
- Fail2Ban
- IP whitelist

---

## 🔍 Buscar por Tema

### Instalación
- Setup inicial → [ADMIN-SETUP.md](./ADMIN-SETUP.md) - FASE 1
- Variables de entorno → [ADMIN-SETUP.md](./ADMIN-SETUP.md) - FASE 1, Paso 1
- Migraciones BD → [ADMIN-SETUP.md](./ADMIN-SETUP.md) - FASE 1, Paso 3

### Certificados
- Crear CA → [ADMIN-SETUP.md](./ADMIN-SETUP.md) - FASE 2
- Generar certificado → [ADMIN-SETUP.md](./ADMIN-SETUP.md) - FASE 2, Paso 3
- Instalar en navegador → [ADMIN-SETUP.md](./ADMIN-SETUP.md) - FASE 2, Paso 4
- Revocar → [ADMIN-API.md](./ADMIN-API.md) - Certificados, DELETE
- Listar → [ADMIN-API.md](./ADMIN-API.md) - Certificados, GET

### TOTP
- Configurar → [ADMIN-SETUP.md](./ADMIN-SETUP.md) - FASE 2, Paso 2
- Backup codes → [ADMIN-SETUP.md](./ADMIN-SETUP.md) - FASE 2, Paso 2
- Verificar → Script `verify-totp.ts`

### Recuperación
- SSH + TOTP → [ADMIN-SETUP.md](./ADMIN-SETUP.md) - FASE 6
- Certificado de emergencia → [ADMIN-TESTING.md](./ADMIN-TESTING.md) - FASE 6

### API
- Dashboard → [ADMIN-API.md](./ADMIN-API.md) - Dashboard
- Usuarios → [ADMIN-API.md](./ADMIN-API.md) - Gestión de Usuarios
- Agentes → [ADMIN-API.md](./ADMIN-API.md) - Gestión de Agentes
- Moderación → [ADMIN-API.md](./ADMIN-API.md) - Moderación
- Audit Logs → [ADMIN-API.md](./ADMIN-API.md) - Analytics

### Panel Web
- Acceder → [ADMIN-TESTING.md](./ADMIN-TESTING.md) - FASE 5
- Dashboard → `/admin`
- Usuarios → `/admin/users`
- Agentes → `/admin/agents`
- Moderación → `/admin/moderation`
- Audit Logs → `/admin/audit-logs`
- Certificados → `/admin/certificates`

### Seguridad
- SSH hardening → [SSH-HARDENING.md](./SSH-HARDENING.md)
- Rate limiting → [ADMIN-API.md](./ADMIN-API.md) - Rate Limiting
- Audit logs → [ADMIN-API.md](./ADMIN-API.md) - Analytics

### Troubleshooting
- Problemas generales → [ADMIN-SETUP.md](./ADMIN-SETUP.md) - Troubleshooting
- Problemas de certificado → [ADMIN-TESTING.md](./ADMIN-TESTING.md) - Troubleshooting
- Problemas de TOTP → [ADMIN-TESTING.md](./ADMIN-TESTING.md) - Troubleshooting
- Problemas de SSH → [SSH-HARDENING.md](./SSH-HARDENING.md) - Recuperación

---

## 💻 Comandos Rápidos

### Setup
```bash
npm run admin:setup-ca              # Crear CA
npm run admin:setup-totp -- <email> # Configurar TOTP
npm run admin:generate-cert -- <email> <device> 48  # Generar cert
```

### Gestión
```bash
npm run admin:list-certs                    # Listar certificados
npm run admin:revoke-cert -- <serial> <reason>  # Revocar
npm run admin:cleanup-certs                 # Limpiar expirados
npm run admin:update-crl                    # Actualizar CRL
```

### Recovery
```bash
ssh user@server
./scripts/admin/emergency-cert-ssh.sh       # Emergencia SSH
```

---

## 📖 Glosario Rápido

| Término | Definición |
|---------|------------|
| **mTLS** | Mutual TLS - Autenticación bidireccional con certificados |
| **CA** | Certificate Authority - Autoridad que firma certificados |
| **TOTP** | Time-based One-Time Password - Códigos de Google Authenticator |
| **CRL** | Certificate Revocation List - Lista de certificados revocados |
| **Audit Log** | Registro de todas las acciones administrativas |
| **PKCS12** | Formato de archivo para certificados (.p12) |
| **Passkey** | WebAuthn - Autenticación biométrica |

---

## 🗂️ Estructura de Carpetas

```
docs/
├── ADMIN-INDEX.md      # Este archivo (índice)
├── ADMIN-SUMMARY.md    # Resumen completo del proyecto
├── ADMIN-README.md     # Overview y conceptos
├── ADMIN-SETUP.md      # Guía de instalación
├── ADMIN-API.md        # Documentación de API
├── ADMIN-TESTING.md    # Guía de testing
└── SSH-HARDENING.md    # Configuración SSH

scripts/admin/
├── setup-ca.sh                 # Setup CA
├── cert-manager.ts             # Gestor certificados
├── generate-cert-cli.ts        # CLI generación
├── setup-totp.ts               # Setup TOTP
├── verify-totp.ts              # Verificación TOTP
└── emergency-cert-ssh.sh       # Recuperación SSH

lib/admin/
├── crypto.ts           # Utilidades de cifrado
├── middleware.ts       # Validación mTLS
├── audit-logger.ts     # Sistema de logs
└── hooks.ts            # React hooks

app/api/admin-secure/   # Endpoints API (8 grupos)
app/admin/              # Páginas del panel (6 páginas)
components/admin/       # Componentes UI (3 componentes)
```

---

## ⚡ Quick Links

| Necesito... | Ir a... |
|-------------|---------|
| Empezar desde cero | [ADMIN-SETUP.md](./ADMIN-SETUP.md) |
| Entender la arquitectura | [ADMIN-SUMMARY.md](./ADMIN-SUMMARY.md) |
| Usar la API | [ADMIN-API.md](./ADMIN-API.md) |
| Testear el sistema | [ADMIN-TESTING.md](./ADMIN-TESTING.md) |
| Configurar SSH | [SSH-HARDENING.md](./SSH-HARDENING.md) |
| Ver comandos | [ADMIN-README.md](./ADMIN-README.md) |
| Resolver problemas | [ADMIN-TESTING.md](./ADMIN-TESTING.md) - Troubleshooting |

---

## 📞 Soporte

**¿No encuentras lo que buscas?**

1. Usa `Ctrl+F` / `Cmd+F` en cada documento
2. Revisa la sección de Troubleshooting en [ADMIN-TESTING.md](./ADMIN-TESTING.md)
3. Revisa los logs:
   - NGINX: `/var/log/nginx/admin-error.log`
   - SSH: `/var/log/auth.log`
   - Prisma Studio: `npx prisma studio`

---

**🚀 Happy Administrating!**
