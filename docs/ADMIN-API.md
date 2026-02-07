# API Admin - Documentación Completa

Documentación de todos los endpoints de la API admin segura.

## 🔐 Autenticación

Todos los endpoints requieren:
1. **Certificado cliente mTLS** (headers inyectados por NGINX)
2. **Acceso admin habilitado** en la base de datos

### Headers Requeridos (Auto-inyectados por NGINX)

```
X-Client-Cert-Serial: <serial-number>
X-Client-Cert-Fingerprint: <fingerprint-sha256>
X-Client-Cert-Verify: SUCCESS
X-Real-IP: <client-ip>
```

### Errores de Autenticación

| Status | Error | Razón |
|--------|-------|-------|
| 401 | Certificate required | Certificado no presente |
| 403 | Certificate revoked | Certificado revocado |
| 403 | Certificate expired | Certificado expirado |
| 403 | Admin access disabled | Acceso admin deshabilitado |

---

## 📊 Dashboard

### GET /api/admin-secure/dashboard

Obtiene KPIs principales del sistema.

**Query Parameters:**
- `days` (optional, default: 30) - Días de historial

**Response:**
```json
{
  "users": {
    "total": 1234,
    "today": 45,
    "thisWeek": 234,
    "thisMonth": 567,
    "growthRate": 12.5
  },
  "agents": {
    "total": 5678,
    "today": 89,
    "thisWeek": 456,
    "thisMonth": 1234,
    "growthRate": 8.3
  },
  "messages": {
    "totalLastMonth": 123456,
    "averagePerDay": 4115
  },
  "plans": {
    "distribution": [
      { "plan": "free", "count": 1000, "percentage": "81.0" },
      { "plan": "plus", "count": 200, "percentage": "16.2" },
      { "plan": "ultra", "count": 34, "percentage": "2.8" }
    ],
    "premium": 234
  },
  "system": {
    "databaseSize": 1234.56,
    "activeConnections": 23
  },
  "moderation": {
    "pendingReports": 12
  },
  "timestamp": "2026-01-11T..."
}
```

---

## 👥 Gestión de Usuarios

### GET /api/admin-secure/users

Lista usuarios con filtros.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50, max: 100)
- `search` - Busca en email, nombre, id
- `plan` - Filtrar por plan (free, plus, ultra)
- `verified` - true/false - Filtrar por email verificado
- `adult` - true/false - Filtrar por usuarios adultos

**Response:**
```json
{
  "users": [
    {
      "id": "...",
      "email": "user@example.com",
      "name": "User Name",
      "plan": "free",
      "emailVerified": true,
      "isAdult": true,
      "ageVerified": true,
      "nsfwConsent": false,
      "createdAt": "...",
      "_count": {
        "agents": 3,
        "communityPosts": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1234,
    "totalPages": 25
  }
}
```

### GET /api/admin-secure/users/[userId]

Obtiene detalles completos de un usuario.

**Response:**
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "plan": "...",
    "agents": [...],
    "subscriptions": [...],
    "payments": [...],
    "communityPosts": [...],
    "_count": {
      "agents": 3,
      "communityPosts": 5,
      "communityComments": 12
    }
  }
}
```

### PATCH /api/admin-secure/users/[userId]

Actualiza datos de un usuario.

**Body:**
```json
{
  "name": "Nuevo Nombre",
  "email": "nuevo@email.com",
  "plan": "plus",
  "emailVerified": true,
  "isAdult": true,
  "ageVerified": true,
  "nsfwConsent": true,
  "sfwProtection": false,
  "imageUploadLimit": 100
}
```

**Response:**
```json
{
  "user": {...},
  "message": "Usuario actualizado exitosamente"
}
```

### DELETE /api/admin-secure/users/[userId]

Elimina un usuario.

**Query Parameters:**
- `hard` (optional) - true para eliminación permanente

**Response:**
```json
{
  "message": "Usuario eliminado permanentemente"
}
```

---

## 🤖 Gestión de Agentes

### GET /api/admin-secure/agents

Lista agentes con filtros.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50, max: 100)
- `search` - Busca en nombre, descripción, id
- `nsfwMode` - true/false - Filtrar por modo NSFW
- `visibility` - public/private/unlisted
- `creatorId` - Filtrar por creador

**Response:**
```json
{
  "agents": [
    {
      "id": "...",
      "name": "Agent Name",
      "description": "...",
      "gender": "female",
      "personality": "...",
      "visibility": "public",
      "nsfwMode": false,
      "nsfwLevel": null,
      "avatarUrl": "...",
      "createdAt": "...",
      "owner": {
        "id": "...",
        "email": "...",
        "name": "...",
        "plan": "free"
      },
      "_count": {
        "messages": 1234
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 5678,
    "totalPages": 114
  }
}
```

---

## 🚨 Moderación

### GET /api/admin-secure/moderation/reports

Lista reportes de contenido.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50, max: 100)
- `resolved` - true/false - Filtrar por estado
- `type` - post/comment - Tipo de reporte

**Response:**
```json
{
  "reports": [
    {
      "id": "...",
      "type": "post",
      "reason": "spam",
      "description": "...",
      "resolved": false,
      "resolvedAt": null,
      "createdAt": "...",
      "content": {
        "id": "...",
        "title": "...",
        "author": {...}
      },
      "reporter": {
        "id": "...",
        "email": "..."
      }
    }
  ],
  "pagination": {...},
  "stats": {
    "totalPosts": 10,
    "totalComments": 5,
    "total": 15
  }
}
```

### POST /api/admin-secure/moderation/reports

Resuelve un reporte.

**Body:**
```json
{
  "reportId": "...",
  "type": "post",
  "action": "approve" | "reject" | "delete_content" | "ban_user",
  "notes": "Razón de la decisión"
}
```

**Response:**
```json
{
  "message": "Reporte resuelto exitosamente",
  "action": "delete_content"
}
```

---

## 📈 Analytics & Audit Logs

### GET /api/admin-secure/audit-logs

Obtiene audit logs con filtros.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 100, max: 500)
- `action` - Tipo de acción (user.update, agent.delete, etc.)
- `targetType` - Tipo de target (User, Agent, etc.)
- `targetId` - ID específico del target
- `adminAccessId` - Filtrar por admin específico
- `startDate` - ISO 8601
- `endDate` - ISO 8601

**Response:**
```json
{
  "logs": [
    {
      "id": "...",
      "action": "user.update",
      "targetType": "User",
      "targetId": "...",
      "ipAddress": "...",
      "userAgent": "...",
      "details": {
        "changes": {
          "plan": {
            "before": "free",
            "after": "plus"
          }
        }
      },
      "createdAt": "...",
      "adminAccess": {
        "user": {
          "email": "admin@example.com"
        }
      }
    }
  ],
  "pagination": {...}
}
```

---

## 🔐 Gestión de Certificados

### GET /api/admin-secure/certificates

Lista certificados.

**Query Parameters:**
- `all` - true para ver todos (requiere rol admin)

**Response:**
```json
{
  "certificates": [
    {
      "id": "...",
      "serialNumber": "...",
      "fingerprint": "...",
      "issuedAt": "...",
      "expiresAt": "...",
      "revokedAt": null,
      "deviceName": "MacBook Pro",
      "isEmergency": false,
      "adminAccess": {
        "user": {
          "email": "admin@example.com"
        }
      }
    }
  ],
  "stats": {
    "active": 3,
    "expired": 1,
    "revoked": 0,
    "total": 4
  }
}
```

### POST /api/admin-secure/certificates

Genera un nuevo certificado.

**Body:**
```json
{
  "deviceName": "MacBook Pro",
  "validityHours": 48
}
```

**Response:**
```json
{
  "message": "Certificado generado exitosamente",
  "certificate": {
    "serialNumber": "...",
    "fingerprint": "...",
    "deviceName": "MacBook Pro",
    "expiresAt": "...",
    "p12Path": "/path/to/cert.p12",
    "p12Password": "..."
  }
}
```

### DELETE /api/admin-secure/certificates/[serialNumber]

Revoca un certificado.

**Query Parameters:**
- `reason` (optional) - Razón de revocación

**Response:**
```json
{
  "message": "Certificado revocado exitosamente",
  "serialNumber": "...",
  "reason": "stolen"
}
```

---

## 📝 Acciones de Audit Log

### Categorías de Acciones

| Categoría | Acciones |
|-----------|----------|
| **Usuarios** | user.view, user.update, user.delete, user.ban, user.unban, user.change_plan, user.reset_password |
| **Agentes** | agent.view, agent.update, agent.delete, agent.moderate |
| **Certificados** | certificate.generate, certificate.revoke, certificate.download |
| **Moderación** | moderation.approve, moderation.reject, moderation.ban_user, moderation.delete_content |
| **Analytics** | analytics.view, analytics.export |
| **Settings** | settings.update, settings.view |
| **Sistema** | admin.access_denied, admin.login, emergency.access, emergency.failed |

---

## 🔒 Permisos y Roles

### Roles Disponibles

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **admin** | Super administrador | Acceso completo a todo |
| **moderator** | Moderador | Solo moderación de contenido |

### Verificación de Roles en Código

```typescript
import { requireRole, requireAnyRole } from '@/lib/admin/middleware';

// Requiere rol específico
requireRole(admin, 'moderator');

// Requiere uno de varios roles
requireAnyRole(admin, ['admin', 'moderator']);
```

---

## 🧪 Ejemplo de Uso

### Con cURL (desde terminal con certificado)

```bash
# Dashboard
curl --cert client.p12:password \
  https://tu-dominio.com:8443/api/admin-secure/dashboard

# Listar usuarios
curl --cert client.p12:password \
  "https://tu-dominio.com:8443/api/admin-secure/users?page=1&limit=50"

# Actualizar usuario
curl --cert client.p12:password \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"plan":"plus"}' \
  https://tu-dominio.com:8443/api/admin-secure/users/USER_ID
```

### Con JavaScript (fetch)

```javascript
// El navegador usa el certificado automáticamente

// Dashboard
const response = await fetch('https://tu-dominio.com:8443/api/admin-secure/dashboard');
const data = await response.json();

// Listar usuarios
const users = await fetch('https://tu-dominio.com:8443/api/admin-secure/users?page=1&limit=50');
const usersData = await users.json();

// Actualizar usuario
const update = await fetch(`https://tu-dominio.com:8443/api/admin-secure/users/${userId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ plan: 'plus' })
});
```

---

## 🔍 Rate Limiting

Todos los endpoints admin tienen rate limiting configurado en NGINX:
- **10 requests por minuto** por IP
- Burst de 5 requests

Si excedes el límite, recibirás:
```json
{
  "error": "Too Many Requests"
}
```
Status: 429

---

## 📚 Recursos Adicionales

- [ADMIN-SETUP.md](./ADMIN-SETUP.md) - Guía de instalación
- [ADMIN-README.md](./ADMIN-README.md) - Overview del sistema
- [SSH-HARDENING.md](./SSH-HARDENING.md) - Configuración SSH

---

## 🆘 Troubleshooting

### "Certificate required"

Verifica que:
1. El certificado está instalado en tu navegador
2. El certificado no ha expirado (48h)
3. NGINX está configurado correctamente

### "Admin access denied"

Verifica que:
1. Tu usuario tiene `AdminAccess` en la BD
2. `AdminAccess.enabled = true`
3. El certificado no está revocado

### Logs útiles

```bash
# Logs de NGINX
sudo tail -f /var/log/nginx/admin-error.log

# Logs de audit
# Ver en Prisma Studio o query directo a BD
SELECT * FROM "AuditLog" ORDER BY "createdAt" DESC LIMIT 50;
```
