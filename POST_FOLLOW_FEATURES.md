# Sistema de Seguimiento de Posts - Documentación de Features

## Descripción General

El sistema de seguimiento de posts permite a los usuarios seguir publicaciones de la comunidad y recibir notificaciones cuando hay nueva actividad (comentarios, respuestas, actualizaciones). El sistema incluye filtros avanzados, analytics detallados, notificaciones por email personalizables, y digests periódicos.

---

## 1. Filtros en /community/following

### Características

La página de posts seguidos ahora incluye un sistema completo de filtros que permite a los usuarios:

- **Filtrar por tipo de post**: discussion, question, showcase, help, research, poll, announcement
- **Filtrar por comunidad**: Ver posts de comunidades específicas
- **Filtrar por fecha**: hoy, esta semana, este mes, todo el tiempo
- **Ordenar por**: reciente, más activo, más votado, más comentado

### Uso

```typescript
// La UI incluye un panel de filtros colapsable
// Los filtros se aplican automáticamente y hacen llamadas a la API

// API Route: GET /api/community/posts/following
// Query params:
// - type: string (optional)
// - communityId: string (optional)
// - date: 'today' | 'week' | 'month' | 'all'
// - sortBy: 'recent' | 'active' | 'upvoted' | 'commented'
```

### Archivos

- `/app/community/following/page.tsx` - Página principal con filtros
- `/app/api/community/posts/following/route.ts` - API con soporte de filtros
- `/app/api/community/posts/following/communities/route.ts` - API para lista de comunidades

---

## 2. Email Notifications

### Características

Sistema completo de notificaciones por email con:

- **Templates HTML responsivos** y visualmente atractivos
- **Notificaciones instantáneas** cuando hay nuevos comentarios
- **Configuración granular** de qué notificaciones recibir
- **Link de unsubscribe** en cada email
- **Tracking** de emails enviados

### Tipos de Emails

#### 2.1 Nuevo Comentario

Se envía cuando alguien comenta en un post que sigues.

**Incluye:**
- Nombre del autor del comentario
- Título del post
- Preview del comentario (primeros 200 caracteres)
- Link directo al comentario
- Botón de acción principal
- Link para dejar de seguir

#### 2.2 Digest Diario

Resumen de actividad diaria en posts seguidos.

**Incluye:**
- Estadísticas generales (total de comentarios, posts activos)
- Lista de posts con actividad reciente
- Número de nuevos comentarios por post
- Links a cada post
- Link para gestionar preferencias

#### 2.3 Digest Semanal

Resumen de actividad semanal.

**Similar al digest diario** pero cubre los últimos 7 días.

### Configuración

Los usuarios pueden configurar:

1. **Frecuencia**: instant, daily, weekly, disabled
2. **Tipos de notificaciones**:
   - Nuevos comentarios
   - Respuestas a comentarios
   - Actualizaciones de posts
   - Incluir en digest

3. **Configuración de digest**:
   - Día de la semana (para weekly)
   - Hora del día

### Archivos

- `/lib/email/templates/post-follow-templates.ts` - Templates HTML
- `/lib/services/post-follow-email.service.ts` - Servicio de envío
- `/components/community/EmailPreferencesPanel.tsx` - Panel de configuración
- `/app/settings/notifications/page.tsx` - Página de configuración

### Variables de Entorno

```bash
# Necesarias para el sistema de emails
EMAIL_ENABLED=true
EMAIL_PROVIDER=smtp  # o 'api'
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
NEXT_PUBLIC_APP_URL=https://your-app.com
```

---

## 3. Digest Diario/Semanal

### Características

- **Cron jobs automatizados** para envío de digests
- **Tracking** de digests enviados
- **Estadísticas** incluidas en cada digest
- **Resumen inteligente** de actividad

### Configuración de Cron Jobs

#### Vercel

Crear archivo `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-digest",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/weekly-digest",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

#### Manual/Testing

En desarrollo, puedes ejecutar manualmente:

```bash
# Daily digest
curl -X POST http://localhost:3000/api/cron/daily-digest

# Weekly digest
curl -X POST http://localhost:3000/api/cron/weekly-digest
```

### Seguridad

En producción, proteger las rutas con un secreto:

```bash
# .env
CRON_SECRET=your-secret-here
```

```bash
# Llamada al cron
curl -X POST https://your-app.com/api/cron/daily-digest \
  -H "Authorization: Bearer your-secret-here"
```

### Archivos

- `/app/api/cron/daily-digest/route.ts` - Cron job diario
- `/app/api/cron/weekly-digest/route.ts` - Cron job semanal
- `/lib/services/post-follow-email.service.ts` - Lógica de digests

---

## 4. Analytics en Panel de Preferencias

### Características

Dashboard completo de analytics con:

- **Métricas principales**:
  - Total de posts seguidos
  - Posts activos (últimos 7 días)
  - Nuevos comentarios
  - Engagement total

- **Gráficos visuales**:
  - Engagement por tipo de post (gráfico de torta)
  - Engagement por comunidad (gráfico de barras)
  - Línea de tiempo de actividad (gráfico de líneas)

- **Historial de acciones**:
  - Últimas 20 acciones del usuario
  - Tipo de acción y objetivo
  - Timestamp

- **Filtros de tiempo**:
  - Últimos 7 días
  - Últimos 30 días
  - Últimos 90 días

### Tecnologías

- **Recharts** para gráficos
- **Framer Motion** para animaciones
- **Tailwind CSS** para estilos

### Acceso

```
/community/following/analytics
```

### Archivos

- `/app/community/following/analytics/page.tsx` - Página de analytics
- `/app/api/community/posts/following/analytics/route.ts` - API de analytics

---

## 5. Exportar Preferencias

### Características

Los usuarios pueden exportar todos sus datos:

- **Formatos**: JSON y CSV
- **Datos incluidos**:
  - Preferencias de contenido
  - Configuración de email
  - Posts seguidos
  - Historial de acciones (últimas 100)

### Uso

#### Desde la UI

Botones de exportación en la página de analytics:

```tsx
<button onClick={() => exportData('json')}>
  Exportar JSON
</button>
<button onClick={() => exportData('csv')}>
  Exportar CSV
</button>
```

#### Desde la API

```bash
# Exportar como JSON
GET /api/community/posts/following/export?format=json

# Exportar como CSV
GET /api/community/posts/following/export?format=csv
```

### Estructura de Datos

#### JSON

```json
{
  "exportedAt": "2025-01-03T...",
  "user": {
    "id": "user-id",
    "email": "user@example.com"
  },
  "preferences": {
    "content": { ... },
    "email": { ... }
  },
  "followedPosts": [ ... ],
  "actionHistory": [ ... ]
}
```

#### CSV

```csv
# Posts Seguidos
Post ID,Título,Tipo,Comunidad,Fecha Follow,Notificaciones,Email
post-1,"Mi Post",discussion,General,01/01/2025,Sí,Sí

# Historial de Acciones
Acción,Tipo,ID,Timestamp
follow_post,post,post-1,01/01/2025 10:00
```

### Archivos

- `/app/api/community/posts/following/export/route.ts` - API de exportación

---

## Modelos de Base de Datos

### EmailNotificationConfig

Configuración de notificaciones por email de cada usuario.

```prisma
model EmailNotificationConfig {
  id               String    @id @default(cuid())
  userId           String    @unique

  frequency        String    @default("instant")
  newComments      Boolean   @default(true)
  newReplies       Boolean   @default(true)
  postUpdates      Boolean   @default(true)
  digestSummary    Boolean   @default(true)

  digestDay        String?
  digestTime       String    @default("09:00")
  lastDigestSentAt DateTime?

  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  user User @relation("UserEmailNotificationConfig", fields: [userId], references: [id], onDelete: Cascade)
}
```

### UserActionHistory

Historial de acciones del usuario para analytics.

```prisma
model UserActionHistory {
  id         String   @id @default(cuid())
  userId     String

  action     String
  targetType String?
  targetId   String?
  metadata   Json?    @default("{}")

  createdAt  DateTime @default(now())

  user User @relation("UserActionHistory", fields: [userId], references: [id], onDelete: Cascade)
}
```

### PostFollowDigest

Registro de digests enviados.

```prisma
model PostFollowDigest {
  id               String   @id @default(cuid())
  userId           String

  type             String
  postIds          Json     @default("[]")

  totalNewComments Int      @default(0)
  totalNewReplies  Int      @default(0)
  postsCount       Int      @default(0)

  periodStart      DateTime
  periodEnd        DateTime
  sentAt           DateTime @default(now())
  createdAt        DateTime @default(now())

  user User @relation("UserPostFollowDigests", fields: [userId], references: [id], onDelete: Cascade)
}
```

### Actualización a PostFollower

```prisma
model PostFollower {
  // ... campos existentes ...
  emailNotifications Boolean @default(true)  // NUEVO
}
```

---

## API Routes

### GET /api/community/posts/following

Obtener posts seguidos con filtros.

**Query Params:**
- `type`: string (optional)
- `communityId`: string (optional)
- `date`: 'today' | 'week' | 'month' | 'all' (optional)
- `sortBy`: 'recent' | 'active' | 'upvoted' | 'commented' (default: 'recent')

**Response:**
```json
{
  "posts": [ ... ]
}
```

### GET /api/community/posts/following/communities

Obtener lista de comunidades de posts seguidos.

**Response:**
```json
{
  "communities": [
    { "id": "...", "name": "...", "slug": "..." }
  ]
}
```

### GET /api/community/posts/following/analytics

Obtener analytics de posts seguidos.

**Query Params:**
- `range`: '7days' | '30days' | '90days' (default: '30days')

**Response:**
```json
{
  "totalFollowedPosts": 10,
  "activePostsLast7Days": 5,
  "totalNewComments": 25,
  "totalEngagement": 150,
  "engagementByType": [ ... ],
  "engagementByCommunity": [ ... ],
  "activityTimeline": [ ... ],
  "recentActions": [ ... ]
}
```

### GET /api/community/posts/following/preferences

Obtener preferencias del usuario.

**Response:**
```json
{
  "contentPreferences": { ... },
  "emailConfig": { ... },
  "actionHistory": [ ... ]
}
```

### PATCH /api/community/posts/following/preferences

Actualizar preferencias.

**Body:**
```json
{
  "emailConfig": {
    "frequency": "daily",
    "newComments": true,
    ...
  }
}
```

### GET /api/community/posts/following/export

Exportar datos del usuario.

**Query Params:**
- `format`: 'json' | 'csv' (default: 'json')

**Response:** Archivo descargable

### POST /api/cron/daily-digest

Ejecutar cron job de digest diario.

**Headers:**
- `Authorization: Bearer <CRON_SECRET>` (en producción)

### POST /api/cron/weekly-digest

Ejecutar cron job de digest semanal.

**Headers:**
- `Authorization: Bearer <CRON_SECRET>` (en producción)

---

## Servicios

### PostFollowEmailService

Servicio principal para notificaciones por email.

**Métodos principales:**

```typescript
// Notificar nuevo comentario
PostFollowEmailService.notifyNewComment(postId, commentId, authorId)

// Enviar digest diario
PostFollowEmailService.sendDailyDigest(userId)

// Enviar digest semanal
PostFollowEmailService.sendWeeklyDigest(userId)

// Obtener/crear configuración
PostFollowEmailService.getOrCreateEmailConfig(userId)

// Actualizar configuración
PostFollowEmailService.updateEmailConfig(userId, updates)
```

### UserPreferenceService

Ya existente, sin cambios.

### PostFollowService

Ya existente, sin cambios significativos.

---

## Testing

### Testing Manual

#### 1. Filtros

```bash
# Probar diferentes filtros
curl "http://localhost:3000/api/community/posts/following?type=discussion&sortBy=active"
```

#### 2. Email Notifications

```bash
# Crear un comentario en un post seguido
# Verificar que se envíe el email instantáneo
```

#### 3. Digests

```bash
# Ejecutar manualmente los cron jobs
curl -X POST http://localhost:3000/api/cron/daily-digest
curl -X POST http://localhost:3000/api/cron/weekly-digest
```

#### 4. Analytics

```bash
# Acceder a la página de analytics
http://localhost:3000/community/following/analytics
```

#### 5. Exportación

```bash
# Exportar JSON
curl "http://localhost:3000/api/community/posts/following/export?format=json"

# Exportar CSV
curl "http://localhost:3000/api/community/posts/following/export?format=csv"
```

### Testing Automatizado

Crear tests en `/tests/post-follow/`:

```typescript
describe('PostFollowEmailService', () => {
  it('should send email on new comment', async () => {
    // Test implementation
  });

  it('should send daily digest', async () => {
    // Test implementation
  });

  it('should respect user preferences', async () => {
    // Test implementation
  });
});
```

---

## Migración

### 1. Aplicar migraciones de base de datos

```bash
npx prisma migrate dev --name add-post-follow-features
npx prisma generate
```

### 2. Configurar variables de entorno

```bash
# Copiar de .env.example
EMAIL_ENABLED=true
EMAIL_PROVIDER=smtp
CRON_SECRET=generate-a-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configurar cron jobs

Si usas Vercel, agregar a `vercel.json`.
Si usas otro hosting, configurar según la plataforma.

### 4. Testing

Ejecutar tests y verificar funcionalidad.

---

## Mejoras Futuras

### Posibles Extensiones

1. **Notificaciones Push**: Agregar notificaciones push además de emails
2. **ML/AI**: Recomendar posts basado en preferencias
3. **Digest Personalizado**: Contenido personalizado según historial
4. **Analytics Avanzados**: Más métricas y gráficos
5. **Integración con Calendar**: Agregar digests a calendario
6. **A/B Testing**: Probar diferentes formatos de email
7. **Templates Personalizables**: Permitir a usuarios elegir diseño de emails
8. **Multi-idioma**: Soporte para múltiples idiomas en emails

---

## Soporte

Para preguntas o issues:
- Revisar esta documentación
- Verificar logs del servidor
- Revisar configuración de email
- Verificar cron jobs están ejecutándose

---

**Última actualización**: Enero 2025
**Versión**: 1.0.0
