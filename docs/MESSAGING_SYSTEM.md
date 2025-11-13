# Sistema de Direct Messaging (DMs)

Sistema completo de mensajería directa implementado para el proyecto circuit-prompt-ai.

## Estado de Implementación: COMPLETO ✅

### Backend

#### 1. Database Schema (`prisma/schema.prisma`)
**Líneas 2164-2227**

Dos modelos principales:

- **DirectMessage**: Mensajes individuales
  - Soporte para texto, imágenes, archivos, posts compartidos
  - Estados: leído/no leído, editado, eliminado
  - Sistema de reacciones (JSON array)
  - Timestamps completos

- **DirectConversation**: Conversaciones 1-on-1 o grupos
  - Tipos: `direct` (1-on-1) o `group`
  - Participantes almacenados como JSON array
  - Configuración: mute, archive
  - Preview del último mensaje

#### 2. Service Layer (`/lib/services/messaging.service.ts`)
**10 funciones implementadas:**

- `getOrCreateConversation()` - Crear o obtener conversación existente
- `sendMessage()` - Enviar mensaje nuevo
- `getMessages()` - Obtener mensajes con paginación
- `getUserConversations()` - Lista de conversaciones del usuario
- `markAsRead()` - Marcar mensajes como leídos
- `editMessage()` - Editar mensaje existente
- `deleteMessage()` - Soft delete de mensajes
- `updateConversation()` - Actualizar configuración (mute, archive)
- `deleteConversation()` - Eliminar conversación completa
- `searchMessages()` - Buscar mensajes por contenido

#### 3. API Routes (`/app/api/messages/`)

##### `/api/messages/conversations`
- **GET**: Lista conversaciones del usuario (con unreadCount)
- **POST**: Crear nueva conversación (direct o group)

##### `/api/messages/conversations/[id]`
- **GET**: Detalles de conversación + mensajes paginados
- **PATCH**: Actualizar configuración (mute, archive, name, icon)
- **DELETE**: Eliminar conversación

##### `/api/messages/conversations/[id]/messages`
- **GET**: Mensajes de conversación (paginados)
- **POST**: Enviar mensaje nuevo

##### `/api/messages/conversations/[id]/messages/[messageId]`
- **PATCH**: Editar mensaje
- **DELETE**: Eliminar mensaje

##### `/api/messages/conversations/[id]/read`
- **POST**: Marcar mensajes como leídos

##### `/api/messages/search`
- **GET**: Buscar mensajes (`?q=query&limit=20`)

##### Endpoints Legacy (retrocompatibilidad)
- `/api/messages/[id]` - DELETE mensaje
- `/api/messages/conversations/[id]/send` - POST mensaje (usa /messages en su lugar)

**Características:**
- Autenticación con NextAuth (getServerSession)
- Validación de participantes en cada request
- Manejo de errores consistente
- Logs para debugging

#### 4. Authentication (`/lib/auth-options.ts`)
Wrapper de NextAuth con soporte para:
- Google OAuth
- Credentials (email)
- JWT strategy
- Session callbacks con user.id y user.plan

### Frontend

#### 5. Types (`/types/messaging.ts`)
Interfaces TypeScript completas:
- `DirectMessage` - Mensaje individual
- `DirectConversation` - Conversación
- `ConversationWithDetails` - Con datos populados
- `MessagesResponse` - Respuesta paginada
- Enums: `ConversationType`, `MessageContentType`, `MessageStatus`
- Request types para todos los endpoints

#### 6. Custom Hooks (`/hooks/`)

##### `useConversations()`
Gestión de conversaciones:
- `conversations` - Array de conversaciones
- `loading`, `error` - Estados
- `createConversation()` - Crear nueva
- `updateConversation()` - Actualizar config
- `deleteConversation()` - Eliminar
- `markAsRead()` - Marcar como leído
- `refresh()` - Recargar lista

##### `useMessages(conversationId)`
Gestión de mensajes:
- `messages` - Array de mensajes
- `loading`, `sending`, `hasMore` - Estados
- `sendMessage()` - Enviar nuevo
- `editMessage()` - Editar existente
- `deleteMessage()` - Eliminar
- `loadMore()` - Cargar más (scroll infinito)
- `messagesEndRef` - Ref para auto-scroll

##### `useUnreadCount()`
Contador de mensajes no leídos:
- `unreadCount` - Total de mensajes sin leer
- `loading` - Estado
- `refresh()` - Actualizar
- Auto-refresh cada 30 segundos

#### 7. Components (`/components/messaging/`)

##### `<ConversationList>`
Lista de conversaciones:
- Vista en cards con avatar, nombre, preview
- Badge de mensajes no leídos
- Búsqueda por nombre/contenido
- Filtros: All, Unread, Archived
- Timestamp relativo con date-fns
- Botón "Nueva conversación"
- Empty states por filtro
- Responsive (full width en mobile)

##### `<MessageThread>`
Thread de mensajes estilo WhatsApp:
- Header con avatar, nombre, info
- Menú de opciones (mute, archive, delete)
- Scroll area con infinite scroll
- Load more al hacer scroll up
- Burbujas de mensaje diferenciadas (propios/otros)
- Auto-scroll a último mensaje
- Botón "scroll to bottom" flotante
- Empty state cuando no hay conversación
- Marca como leído automático
- Responsive (oculta lista en mobile)

##### `<MessageBubble>`
Burbuja individual de mensaje:
- Diseño diferente para mensajes propios (derecha, azul) y otros (izquierda, gris)
- Avatar del remitente
- Nombre del remitente (si no es propio)
- Timestamp formateado
- Estado de lectura (✓ / ✓✓)
- Badge "editado"
- Soporte para texto e imágenes
- Menú contextual (editar/eliminar) al hacer hover
- Soft delete muestra "[Mensaje eliminado]"
- Diseño responsive

##### `<MessageComposer>`
Input de mensaje:
- Textarea auto-expandible (max 120px)
- Botón enviar (solo habilitado si hay texto)
- Botones de adjuntar y emoji (placeholder)
- Contador de caracteres (máx 2000)
- Enter para enviar, Shift+Enter para nueva línea
- Loading state durante envío
- Focus indicators
- Hint text
- Diseño glassmorphism

##### `<NewConversationModal>`
Modal para crear conversaciones:
- Tabs: Conversación directa / Grupo
- Búsqueda de usuarios (mock por ahora)
- Selección múltiple con badges
- Campo de nombre de grupo (solo grupos)
- Validación: 1 user para direct, 2+ para grupo
- Loading states
- Diseño responsive
- TODO: Integrar con endpoint de búsqueda de usuarios

#### 8. Pages (`/app/messages/page.tsx`)
Página principal de mensajería:
- Layout dividido: 30% lista / 70% thread
- Responsive: toggle entre lista y thread en mobile
- Header mobile con menú hamburguesa
- Integra todos los hooks
- Manejo de estados (loading, empty)
- Protección con auth (redirect a /login)
- Modal de nueva conversación

## Características Implementadas

### Core Messaging
- [x] Conversaciones 1-on-1
- [x] Conversaciones grupales
- [x] Envío de mensajes de texto
- [x] Edición de mensajes
- [x] Eliminación de mensajes (soft delete)
- [x] Marcado de leídos
- [x] Paginación de mensajes (50 por página)
- [x] Infinite scroll (load more)

### UI/UX
- [x] Diseño WhatsApp-style
- [x] Burbujas diferenciadas propios/otros
- [x] Auto-scroll a último mensaje
- [x] Scroll to bottom button
- [x] Timestamps relativos
- [x] Estados de lectura (✓✓)
- [x] Badge de no leídos
- [x] Búsqueda de conversaciones
- [x] Filtros (All, Unread, Archived)
- [x] Empty states
- [x] Loading states
- [x] Responsive design (mobile-first)

### Settings
- [x] Silenciar conversaciones
- [x] Archivar conversaciones
- [x] Eliminar conversaciones
- [x] Configurar nombre de grupo
- [x] Configurar icono de grupo

### Search & Discovery
- [x] Búsqueda de mensajes por contenido
- [x] Búsqueda de conversaciones
- [x] Filtrado de conversaciones

## Características Pendientes (Futuras)

### Media & Attachments
- [ ] Upload de imágenes
- [ ] Upload de archivos
- [ ] Previsualización de attachments
- [ ] Compartir posts/items del sistema

### Rich Features
- [ ] Emojis picker
- [ ] Reacciones a mensajes
- [ ] Indicador "escribiendo..."
- [ ] Read receipts por usuario (grupos)
- [ ] Mensajes temporales (autodestruct)
- [ ] Mensajes anclados

### Notifications
- [ ] Push notifications en tiempo real
- [ ] Desktop notifications
- [ ] Email notifications
- [ ] Configuración de notificaciones por conversación

### Advanced
- [ ] WebSocket para mensajes en tiempo real
- [ ] Búsqueda de usuarios (endpoint `/api/users/search`)
- [ ] Menciones (@usuario) en grupos
- [ ] Respuestas a mensajes (threading)
- [ ] Forwards de mensajes
- [ ] Voice messages
- [ ] Video calls
- [ ] Screen sharing

### Admin & Moderation
- [ ] Reportar mensajes
- [ ] Bloquear usuarios
- [ ] Roles en grupos (admin, member)
- [ ] Permisos de grupo (quién puede enviar, invitar)
- [ ] Historial de cambios en grupos

## Uso

### Crear conversación
```typescript
const conversation = await createConversation({
  participants: ['userId1', 'userId2'],
  type: 'direct' // o 'group'
});
```

### Enviar mensaje
```typescript
await sendMessage({
  content: 'Hola!',
  recipientId: 'userId2',
  contentType: 'text'
});
```

### Marcar como leído
```typescript
await markAsRead(conversationId);
```

## Testing

Para probar el sistema:

1. Acceder a `/messages`
2. Crear nueva conversación (mock users por ahora)
3. Enviar mensajes
4. Probar edición/eliminación
5. Probar scroll infinito
6. Probar búsqueda y filtros
7. Probar responsive (mobile)

## Notas Técnicas

### Performance
- Paginación en backend (50 mensajes/página)
- Infinite scroll en frontend
- Debounce en búsqueda (300ms)
- Auto-refresh de unread count (30s)

### Security
- Autenticación en todos los endpoints
- Validación de participantes
- Soft delete (no se borran datos reales)
- Sanitización de inputs

### Database
- Índices en conversationId, senderId, recipientId, createdAt
- JSON para participants y reactions (PostgreSQL)
- Cascade delete en mensajes al borrar conversación

### Browser Support
- Moderno (ES2020+)
- Requiere JS habilitado
- Mobile-first responsive

## Dependencias

- `next-auth` - Autenticación
- `@prisma/client` - ORM
- `date-fns` - Formateo de fechas
- `lucide-react` - Iconos
- `@radix-ui/*` - Componentes UI
- `class-variance-authority` - Variantes CSS
- `tailwindcss` - Estilos

## Estructura de Archivos

```
/app/api/messages/
  conversations/
    route.ts                           # GET, POST conversaciones
    [id]/
      route.ts                         # GET, PATCH, DELETE conversación
      messages/
        route.ts                       # GET, POST mensajes
        [messageId]/route.ts          # PATCH, DELETE mensaje
      read/route.ts                    # POST marcar leído
      send/route.ts                    # POST enviar (legacy)
  [id]/route.ts                       # DELETE mensaje (legacy)
  search/route.ts                     # GET buscar mensajes

/components/messaging/
  ConversationList.tsx
  MessageThread.tsx
  MessageBubble.tsx
  MessageComposer.tsx
  NewConversationModal.tsx
  index.ts

/hooks/
  useConversations.ts
  useMessages.ts
  useUnreadCount.ts

/lib/services/
  messaging.service.ts

/types/
  messaging.ts

/app/messages/
  page.tsx
```

## Autor

Sistema implementado completamente desde cero siguiendo especificaciones del schema Prisma.
