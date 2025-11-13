# Sistema de Notificaciones UI - Documentación

## Resumen

Sistema completo de notificaciones UI implementado con React/Next.js, integrado con el backend existente.

## Componentes Implementados

### 1. **Tipos y Utilidades** (`/types/notifications.ts`)

Define todos los tipos y helpers para el sistema de notificaciones:

- `NotificationType`: Enum con 15+ tipos de notificaciones
- `Notification`: Interface principal de notificación
- `NotificationsResponse`: Response de la API
- `NOTIFICATION_BADGE_CONFIG`: Configuración de colores y labels por tipo
- `formatRelativeTime()`: Helper para formatear tiempo relativo (hace 5 min, hace 2h)
- `getBadgeConfig()`: Helper para obtener configuración de badge por tipo
- `truncateText()`: Helper para truncar texto

### 2. **Hook Personalizado** (`/hooks/use-notifications.ts`)

Hook principal para gestionar notificaciones con SWR:

```typescript
const {
  notifications,        // Notificaciones filtradas
  unreadCount,         // Contador de no leídas
  total,               // Total de notificaciones
  totalPages,          // Páginas totales
  currentPage,         // Página actual
  isLoading,           // Estado de carga
  isError,             // Estado de error
  markAsRead,          // Marcar como leída
  markAllAsRead,       // Marcar todas como leídas
  deleteNotification,  // Eliminar notificación
  deleteAllNotifications, // Eliminar todas
  refetch,             // Refetch manual
  isMarkingAsRead,     // Estado de marcado
  isDeleting,          // Estado de eliminación
} = useNotifications({
  page: 1,
  limit: 20,
  filter: 'all' // 'all' | 'unread' | 'mentions' | 'interactions'
});
```

**Características:**
- ✅ Polling automático cada 30 segundos
- ✅ Revalidación on focus
- ✅ Filtrado por tipo (todas, no leídas, menciones, interacciones)
- ✅ Paginación
- ✅ Mutación optimista

**Hook Adicional:**
```typescript
const { count, isLoading, isError } = useUnreadCount();
```

### 3. **NotificationBadge** (`/components/notifications/NotificationBadge.tsx`)

Badge circular rojo con número de notificaciones no leídas:

```typescript
<NotificationBadge
  count={unreadCount}
  showPing={true}  // Animación de ping
/>
```

**Características:**
- ✅ Se oculta automáticamente si count = 0
- ✅ Muestra "99+" si hay más de 99
- ✅ Animación de "ping" cuando hay nuevas
- ✅ Glassmorphism design

### 4. **NotificationDropdown** (`/components/notifications/NotificationDropdown.tsx`)

Dropdown completo de notificaciones para el navbar:

**Características:**
- ✅ Muestra últimas 10 notificaciones no leídas
- ✅ Preview con avatar, mensaje, tiempo relativo
- ✅ Badge de tipo de notificación con colores
- ✅ Botón "Marcar todas como leídas"
- ✅ Botón "Ver todas" que lleva a `/notifications`
- ✅ Botón eliminar individual
- ✅ Click en notificación marca como leída y navega
- ✅ Cierre automático al click fuera
- ✅ Scroll para muchas notificaciones
- ✅ Glassmorphism design moderno

**Uso:**
```tsx
import { NotificationDropdown } from '@/components/notifications';

<NotificationDropdown />
```

### 5. **Página de Centro de Notificaciones** (`/app/notifications/page.tsx`)

Página completa para gestionar todas las notificaciones:

**Características:**
- ✅ Tabs de filtro: Todas, No leídas, Menciones, Interacciones
- ✅ Buscador de notificaciones
- ✅ Lista paginada (20 por página)
- ✅ Cada notificación expandible con metadata
- ✅ Acciones: Marcar como leída, Eliminar
- ✅ Acciones masivas: Marcar todas como leídas, Eliminar todas
- ✅ Estado de carga con skeletons
- ✅ Estado vacío con ilustración
- ✅ Navegación por paginación
- ✅ Responsive design
- ✅ Glassmorphism design

**Ruta:** `/notifications`

### 6. **Integración en DashboardNav** (`/components/dashboard-nav.tsx`)

El dropdown de notificaciones está integrado en el sidebar principal:

```tsx
<div className="flex gap-2">
  <NotificationDropdown />
  <OnboardingMenu />
  <ThemeToggle />
</div>
```

## API Endpoints Utilizados

### GET `/api/community/notifications`
Obtener notificaciones del usuario

**Query Params:**
- `page`: Número de página (default: 1)
- `limit`: Notificaciones por página (default: 50)

**Response:**
```json
{
  "notifications": [...],
  "total": 100,
  "unreadCount": 15,
  "page": 1,
  "totalPages": 5
}
```

### GET `/api/community/notifications/unread-count`
Obtener contador de no leídas

**Response:**
```json
{
  "count": 15
}
```

### PATCH `/api/community/notifications/[id]`
Marcar notificación como leída

### DELETE `/api/community/notifications/[id]`
Eliminar notificación individual

### POST `/api/community/notifications/mark-all-read`
Marcar todas las notificaciones como leídas

### DELETE `/api/community/notifications`
Eliminar todas las notificaciones

## Tipos de Notificaciones Soportados

El sistema soporta 15+ tipos de notificaciones con badges de colores:

1. **new_post** - Nuevo post en comunidad seguida (azul)
2. **new_comment** - Nuevo comentario en tu post (verde)
3. **comment_reply** - Respuesta a tu comentario (verde)
4. **post_milestone** - Post alcanzó milestone de upvotes (púrpura)
5. **award_received** - Award recibido (amarillo)
6. **answer_accepted** - Tu respuesta fue aceptada (esmeralda)
7. **new_follower** - Nuevo seguidor (rosa)
8. **event_invitation** - Invitación a evento (índigo)
9. **event_reminder** - Recordatorio de evento (naranja)
10. **badge_earned** - Nuevo badge desbloqueado (ámbar)
11. **level_up** - Nivel alcanzado (violeta)
12. **direct_message** - Mensaje directo (cielo)
13. **project_accepted** - Aceptado como colaborador (teal)
14. **mention** - Te mencionaron (cian)
15. **upvote** - Upvote en tu contenido (rosa)

Cada tipo tiene su propio color, label y estilo definido en `NOTIFICATION_BADGE_CONFIG`.

## Diseño y Experiencia de Usuario

### Glassmorphism
- Fondos translúcidos con `backdrop-blur`
- Bordes suaves con gradientes
- Sombras profundas para profundidad

### Animaciones
- Entrada/salida suave del dropdown
- Ping animation en el badge
- Hover effects en cards
- Transiciones fluidas

### Estados
- Loading skeletons para mejor UX
- Estados vacíos con ilustraciones
- Feedback visual para acciones
- Indicadores de no leída

### Responsive
- Mobile-first design
- Breakpoints para tablet y desktop
- Touch-friendly en móviles

## Testing

### 1. **Crear Notificación de Prueba**

Desde el backend, puedes usar el `NotificationService`:

```typescript
import { NotificationService } from '@/lib/services/notification.service';

// Crear notificación de prueba
await NotificationService.createNotification({
  userId: 'user-id-aqui',
  type: 'new_comment',
  title: 'Nuevo comentario en tu post',
  message: 'Alguien comentó en "Mi primer post"',
  actionUrl: '/community/posts/123',
  metadata: { postId: '123', commentId: '456' }
});
```

### 2. **Verificar en UI**

1. Abre la aplicación en `/dashboard`
2. Verás el badge con el número en el botón de notificaciones
3. Click en el botón para abrir el dropdown
4. Verifica que aparece la notificación con:
   - Título correcto
   - Mensaje correcto
   - Badge de tipo con color
   - Tiempo relativo
   - Punto azul de "no leída"

### 3. **Probar Acciones**

- **Click en notificación**: Marca como leída y navega a actionUrl
- **Click en eliminar**: Elimina la notificación
- **Click en "Marcar todas"**: Marca todas como leídas
- **Click en "Ver todas"**: Navega a `/notifications`

### 4. **Probar Página Completa**

1. Navega a `/notifications`
2. Verifica:
   - Header con contador
   - Tabs de filtro funcionan
   - Búsqueda funciona
   - Paginación funciona
   - Expandir notificación muestra metadata
   - Marcar como leída/no leída
   - Eliminar individual
   - Eliminar todas

### 5. **Probar Polling**

1. Mantén la aplicación abierta
2. Crea una nueva notificación desde backend
3. Espera ~30 segundos
4. Verifica que el contador se actualiza automáticamente
5. Verifica que el dropdown muestra la nueva notificación

## Próximos Pasos (Opcionales)

### Mejoras Sugeridas

1. **WebSocket/SSE para Real-time**
   - Cambiar polling por push real-time
   - Implementar Server-Sent Events o WebSocket
   - Notificaciones instantáneas sin esperar 30s

2. **Agrupación de Notificaciones**
   - Agrupar notificaciones similares ("3 personas comentaron")
   - Colapsar/expandir grupos

3. **Preferencias de Notificación**
   - Página de configuración para elegir qué notificaciones recibir
   - Silenciar ciertos tipos
   - Horarios de no molestar

4. **Push Notifications**
   - Ya existe `NotificationSettings.tsx` para push
   - Integrar con el sistema de notificaciones
   - Enviar push cuando llega notificación importante

5. **Sonidos y Vibración**
   - Reproducir sonido cuando llega notificación
   - Vibración en móviles
   - Configurables por usuario

6. **Avatares de Actores**
   - Mostrar avatar del usuario que causó la notificación
   - Requiere agregar `actorAvatar` en metadata

7. **Analytics**
   - Tracking de notificaciones vistas
   - Métricas de engagement
   - A/B testing de mensajes

## Troubleshooting

### El contador no se actualiza
- Verifica que el backend está corriendo
- Revisa que el usuario está autenticado
- Chequea la consola del navegador para errores
- Verifica que SWR está configurado correctamente

### Las notificaciones no aparecen
- Verifica que existen notificaciones en la DB para ese usuario
- Revisa la respuesta de la API en Network tab
- Chequea que `userId` coincide con el usuario autenticado

### El dropdown no se cierra
- Verifica que el `useEffect` de click outside está funcionando
- Revisa que `dropdownRef` está correctamente asignado

### Errores de compilación
- Verifica que todas las dependencias están instaladas
- Chequea que los componentes UI de shadcn existen
- Revisa imports de tipos

## Estructura de Archivos

```
/run/media/lucas/SSD/Proyectos/AI/circuit-prompt-ai/
├── types/
│   └── notifications.ts          # Tipos y helpers
├── hooks/
│   └── use-notifications.ts      # Hook principal con SWR
├── components/
│   └── notifications/
│       ├── index.ts              # Exports
│       ├── NotificationBadge.tsx # Badge de contador
│       ├── NotificationDropdown.tsx # Dropdown
│       └── NotificationSettings.tsx # Config push (ya existía)
├── app/
│   └── notifications/
│       └── page.tsx              # Página completa
└── lib/
    └── services/
        └── notification.service.ts # Backend (ya existía)
```

## Conclusión

El sistema de notificaciones UI está **completamente funcional** e integrado con el backend existente. Incluye:

- ✅ Hook personalizado con SWR y polling
- ✅ Badge de contador con animación
- ✅ Dropdown completo en navbar
- ✅ Página de centro de notificaciones
- ✅ 15+ tipos de notificaciones con estilos
- ✅ Filtrado, búsqueda y paginación
- ✅ Acciones: marcar leída, eliminar
- ✅ Glassmorphism design moderno
- ✅ Responsive y accesible
- ✅ TypeScript completo

El sistema está listo para producción y puede ser extendido fácilmente con las mejoras sugeridas.
