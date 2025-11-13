# Notificaciones UI - Quick Start Guide

## 🚀 Inicio Rápido

### 1. Crear Notificaciones de Prueba

```bash
# Obtén tu userId
# En /dashboard, abre DevTools Console y ejecuta:
fetch('/api/auth/session').then(r => r.json()).then(d => console.log(d.user.id))

# Ejecuta el script de testing
npx tsx scripts/test-notifications.ts <tu-userId>
```

### 2. Ver Notificaciones

**Opción A - Dropdown (navbar):**
1. Ve a `/dashboard`
2. Mira el badge rojo con número en el sidebar
3. Haz click en el ícono de campana

**Opción B - Centro completo:**
1. Ve a `/notifications`
2. Navega por las tabs
3. Prueba búsqueda y filtros

---

## 📱 Vista Previa de Componentes

### NotificationBadge
```tsx
import { NotificationBadge } from '@/components/notifications';

<NotificationBadge count={5} showPing={true} />
```
**Resultado:** Badge circular rojo con "5" y animación ping

---

### NotificationDropdown
```tsx
import { NotificationDropdown } from '@/components/notifications';

<NotificationDropdown />
```
**Resultado:** Botón con badge + dropdown completo

---

### Hook useNotifications
```tsx
import { useNotifications } from '@/hooks/use-notifications';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification,
  } = useNotifications({ limit: 10 });

  return (
    <div>
      <p>Tienes {unreadCount} notificaciones sin leer</p>
      {notifications.map(n => (
        <div key={n.id} onClick={() => markAsRead(n.id)}>
          {n.title}
        </div>
      ))}
    </div>
  );
}
```

---

## 🎨 Tipos de Notificaciones

| Tipo | Color | Ejemplo |
|------|-------|---------|
| new_comment | 🟢 Verde | "Nuevo comentario en tu post" |
| comment_reply | 🟢 Verde | "Respondieron a tu comentario" |
| post_milestone | 🟣 Púrpura | "¡50 upvotes!" |
| award_received | 🟡 Amarillo | "¡Recibiste un award!" |
| new_follower | 💖 Rosa | "Carlos comenzó a seguirte" |
| badge_earned | 🟠 Ámbar | "¡Nuevo badge desbloqueado!" |
| level_up | 🟣 Violeta | "¡Nivel alcanzado!" |
| direct_message | 🔵 Cielo | "Mensaje de Ana" |
| mention | 🔷 Cian | "Te mencionaron" |

---

## 🔧 Testing Rápido

### Test 1: Badge de Contador
```bash
# Crear notificación
npx tsx scripts/test-notifications.ts <userId>

# Verificar
# 1. Abrir /dashboard
# 2. Ver badge rojo con número
# 3. Badge debe mostrar el número correcto
```

### Test 2: Dropdown
```bash
# 1. Click en botón de notificaciones
# 2. Verificar que se abre dropdown
# 3. Click en "Marcar todas como leídas"
# 4. Verificar que badge desaparece
```

### Test 3: Centro de Notificaciones
```bash
# 1. Ir a /notifications
# 2. Click en tab "No leídas"
# 3. Buscar "comentario" en el buscador
# 4. Click en notificación
# 5. Verificar que navega a la URL correcta
```

### Test 4: Polling Automático
```bash
# 1. Abrir /dashboard en navegador
# 2. En otra terminal:
npx tsx scripts/test-notifications.ts <userId>

# 3. Esperar ~30 segundos
# 4. Badge debe actualizarse automáticamente
```

---

## 📊 Flujo de Datos

```
Usuario interactúa
       ↓
[NotificationDropdown]
       ↓
useNotifications()
       ↓
SWR Fetch (polling 30s)
       ↓
API /api/community/notifications
       ↓
NotificationService
       ↓
Prisma DB
```

---

## 🎯 Casos de Uso Comunes

### Crear Notificación desde Backend
```typescript
import { NotificationService } from '@/lib/services/notification.service';

// Ejemplo: Usuario comentó en un post
await NotificationService.notifyNewComment(
  commentId,
  postId,
  authorId
);

// Ejemplo: Usuario ganó un badge
await NotificationService.notifyBadgeEarned(
  userId,
  'Contributor',
  '🏆'
);
```

### Filtrar Notificaciones
```typescript
const { notifications } = useNotifications({
  filter: 'unread'  // 'all' | 'unread' | 'mentions' | 'interactions'
});
```

### Obtener Solo Contador
```typescript
import { useUnreadCount } from '@/hooks/use-notifications';

const { count } = useUnreadCount();
// count actualizado automáticamente cada 30s
```

---

## 🐛 Troubleshooting

### Badge no aparece
- ✅ Verifica que hay notificaciones en DB
- ✅ Revisa que userId es correcto
- ✅ Chequea la consola del navegador

### Dropdown no se abre
- ✅ Verifica que el componente está en DashboardNav
- ✅ Revisa que no hay errores en console

### Notificaciones no se actualizan
- ✅ Espera 30 segundos (polling interval)
- ✅ O recarga la página
- ✅ O usa `refetch()` manualmente

### Errores de compilación
- ✅ `npm install` para instalar dependencias
- ✅ Verifica que componentes UI existen
- ✅ Los errores de build en otros archivos no afectan notificaciones

---

## 📦 Archivos Importantes

```
components/notifications/
├── NotificationBadge.tsx      # Badge contador
├── NotificationDropdown.tsx   # Dropdown completo
└── NotificationSettings.tsx   # Push settings

hooks/
└── use-notifications.ts       # Hook principal

types/
└── notifications.ts           # Tipos y helpers

app/notifications/
└── page.tsx                   # Centro de notificaciones

scripts/
└── test-notifications.ts      # Testing script
```

---

## ✨ Features Destacados

- 🔴 Badge con contador y animación ping
- 🔔 Dropdown glassmorphism moderno
- 📱 Responsive en móvil y desktop
- 🔄 Polling automático cada 30s
- 🎨 15+ tipos con colores únicos
- 🔍 Búsqueda y filtros avanzados
- ⏱️ Tiempo relativo (hace 5 min)
- 📄 Paginación fluida
- ✅ Marcar como leída
- 🗑️ Eliminar individual/masivo

---

## 🎉 ¡Listo!

El sistema está completamente funcional. Sigue los pasos del Quick Start para probar todas las funcionalidades.

Para más detalles, consulta:
- `docs/NOTIFICATIONS_UI.md` - Documentación completa
- `docs/NOTIFICATIONS_IMPLEMENTATION_SUMMARY.md` - Resumen técnico
