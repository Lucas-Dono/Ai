# 🚀 Guía de Integración - Sistema de Límites Diarios

## ✅ COMPLETADO

### 1. Backend - CRON_SECRET
```bash
# Ya agregado a .env.example
CRON_SECRET="d09697ebe3fb59e1968befd2d5a265acd560f4e6a0fed2e620bb6b87cf8f0aff"
```

### 2. Backend - trackMessageUsage integrado
**Archivo:** `app/api/agents/[id]/message/route.ts:382-387`

```typescript
// Track message usage with smart counting
const trackingResult = await trackMessageUsage(userId, content);
log.info({
  userId,
  counted: trackingResult.counted,
  reason: trackingResult.reason,
}, 'Message usage tracked');
```

✅ **Ya integrado** - Los mensajes triviales no se cuentan automáticamente.

### 3. Backend - Context Compression integrado
**Archivo:** `lib/services/message.service.ts:423-439`

```typescript
// Apply context compression (optimizes old messages)
const compressionResult = await compressContext(allMessages, contextLimit);

if (compressionResult.compressionApplied) {
  log.info({
    originalCount: compressionResult.originalCount,
    compressedCount: compressionResult.compressedCount,
    summarizedCount: compressionResult.summarizedCount,
    contextLimit,
  }, 'Context compression applied');
}

// Use compressed messages for LLM
const conversationMessages = compressionResult.messages.map(m => ({
  role: m.role as 'user' | 'assistant',
  content: m.content,
}));
```

✅ **Ya integrado** - Los mensajes antiguos se comprimen automáticamente según el tier.

---

## 📦 COMPONENTES UI DISPONIBLES

### 1. UsageIndicator
Muestra una barra de progreso con el uso actual de mensajes.

**Ubicación:** `components/upgrade/UsageIndicator.tsx`

```tsx
import { UsageIndicator } from '@/components/upgrade/UsageIndicator';

<UsageIndicator
  current={messageQuota.current}
  limit={messageQuota.limit}
  resource="messages"
  showUpgradeHint={true}
  onUpgradeClick={() => router.push('/pricing')}
/>
```

**Variantes:**
- Verde (0-69%): Todo bien
- Amarillo (70-89%): Advertencia
- Rojo (90-100%): Crítico

### 2. UsageIndicatorCompact
Versión compacta para sidebar.

```tsx
import { UsageIndicatorCompact } from '@/components/upgrade/UsageIndicator';

<UsageIndicatorCompact
  current={messageQuota.current}
  limit={messageQuota.limit}
  resource="messages"
/>
```

### 3. UpgradeNotificationUI
Notificaciones NO intrusivas para upgrades.

**Ubicación:** `components/upgrade/UpgradeNotification.tsx`

```tsx
import {
  UpgradeNotificationUI,
  useUpgradeNotifications
} from '@/components/upgrade/UpgradeNotification';
import { getUpgradeNotification } from '@/lib/usage/upgrade-prompts';

function ChatComponent() {
  const router = useRouter();
  const {
    notification,
    showNotification,
    dismissNotification
  } = useUpgradeNotifications();

  // Cuando el usuario se acerca al límite
  useEffect(() => {
    if (messageQuota) {
      const percentage = (messageQuota.current / messageQuota.limit) * 100;

      if (percentage >= 90) {
        const notif = getUpgradeNotification('nearly_reached', {
          currentUsage: messageQuota.current,
          limit: messageQuota.limit,
        });
        showNotification(notif);
      }
    }
  }, [messageQuota]);

  return (
    <>
      {notification && (
        <UpgradeNotificationUI
          notification={notification}
          onDismiss={dismissNotification}
          onPrimaryAction={() => router.push('/pricing')}
        />
      )}
    </>
  );
}
```

**Tipos de notificaciones:**
- `toast`: Esquina, auto-dismiss
- `banner`: Arriba del chat, persistente
- `modal`: Centrado, bloquea acción

---

## 🎯 INTEGRACIÓN COMPLETA EN CHAT

### Ejemplo: components/chat/v2/ModernChat.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UsageIndicator } from '@/components/upgrade/UsageIndicator';
import {
  UpgradeNotificationUI,
  useUpgradeNotifications
} from '@/components/upgrade/UpgradeNotification';
import { getUpgradeNotification } from '@/lib/usage/upgrade-prompts';

interface MessageQuota {
  current: number;
  limit: number;
  remaining: number;
}

export function ModernChat({ agentId }: { agentId: string }) {
  const router = useRouter();
  const [messageQuota, setMessageQuota] = useState<MessageQuota | null>(null);
  const {
    notification,
    showNotification,
    dismissNotification
  } = useUpgradeNotifications();

  // Función para enviar mensaje
  const sendMessage = async (content: string) => {
    const response = await fetch(`/api/agents/${agentId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    const data = await response.json();

    // Actualizar quota desde la respuesta
    if (data.quota) {
      setMessageQuota(data.quota);
    }

    return data;
  };

  // Verificar si mostrar notificación
  useEffect(() => {
    if (!messageQuota) return;

    const percentage = (messageQuota.current / messageQuota.limit) * 100;

    // 90%: Advertencia crítica
    if (percentage >= 90) {
      const notif = getUpgradeNotification('nearly_reached', {
        currentUsage: messageQuota.current,
        limit: messageQuota.limit,
      });
      showNotification(notif);
    }
    // 70%: Advertencia suave
    else if (percentage >= 70) {
      const notif = getUpgradeNotification('approaching_limit', {
        currentUsage: messageQuota.current,
        limit: messageQuota.limit,
      });
      showNotification(notif);
    }
  }, [messageQuota]);

  return (
    <div className="flex flex-col h-screen">
      {/* Notificación de upgrade (si existe) */}
      {notification && (
        <UpgradeNotificationUI
          notification={notification}
          onDismiss={dismissNotification}
          onPrimaryAction={() => router.push('/pricing')}
        />
      )}

      {/* Indicador de uso */}
      {messageQuota && (
        <UsageIndicator
          current={messageQuota.current}
          limit={messageQuota.limit}
          resource="messages"
          showUpgradeHint={true}
          onUpgradeClick={() => router.push('/pricing')}
        />
      )}

      {/* Resto del chat aquí... */}
      <div className="flex-1 overflow-y-auto">
        {/* Mensajes */}
      </div>

      {/* Input del chat */}
      <div className="p-4">
        {/* Input aquí */}
      </div>
    </div>
  );
}
```

---

## 🎁 EVENTOS ESPECIALES

### Verificar si hay evento activo

```tsx
'use client';

import { useEffect, useState } from 'react';

interface SpecialEvent {
  hasActiveEvent: boolean;
  eligible: boolean;
  event?: {
    id: string;
    name: string;
    emoji: string;
    benefits: {
      message: string;
      tempUpgradeTo: string;
      durationHours: number;
    };
  };
}

export function SpecialEventBanner() {
  const [eventData, setEventData] = useState<SpecialEvent | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar si hay evento activo
    fetch('/api/events/activate', { method: 'GET' })
      .then(res => res.json())
      .then(data => setEventData(data));
  }, []);

  const activateEvent = async () => {
    setLoading(true);

    const response = await fetch('/api/events/activate', {
      method: 'POST'
    });

    const result = await response.json();

    if (result.success) {
      alert(`¡${result.message}! Activo hasta ${new Date(result.expiresAt).toLocaleString()}`);
      window.location.reload();
    }

    setLoading(false);
  };

  if (!eventData?.hasActiveEvent || !eventData.eligible) {
    return null;
  }

  const event = eventData.event!;

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">
            {event.emoji} {event.name}
          </h3>
          <p className="text-sm opacity-90">
            {event.benefits.message}
          </p>
        </div>

        <button
          onClick={activateEvent}
          disabled={loading}
          className="
            px-6 py-3 rounded-lg
            bg-white text-purple-600 font-bold
            hover:bg-purple-50
            disabled:opacity-50
            transition-all
          "
        >
          {loading ? 'Activando...' : '¡Activar ahora!'}
        </button>
      </div>
    </div>
  );
}
```

---

## 📊 RESPUESTA DEL API CON QUOTA

El endpoint `/api/agents/[id]/message` ahora retorna:

```json
{
  "message": { ... },
  "emotions": { ... },
  "quota": {
    "current": 5,
    "limit": 10,
    "remaining": 5
  }
}
```

**Headers de respuesta:**
```
X-Resource-Quota-Current: 5
X-Resource-Quota-Limit: 10
X-Resource-Quota-Remaining: 5
```

---

## 🔧 CONFIGURACIÓN VERCEL

### Variables de entorno requeridas

```bash
# En Vercel Dashboard → Settings → Environment Variables
CRON_SECRET=d09697ebe3fb59e1968befd2d5a265acd560f4e6a0fed2e620bb6b87cf8f0aff
```

### Cron Jobs

Ya configurado en `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/expire-temp-grants",
      "schedule": "0 * * * *"
    }
  ]
}
```

Vercel ejecutará automáticamente el endpoint cada hora.

---

## 🧪 TESTING

### 1. Test Smart Counting (local)

```bash
# Enviar mensaje trivial (no debería contarse)
curl -X POST http://localhost:3000/api/agents/[id]/message \
  -H "Content-Type: application/json" \
  -d '{"content": "hola"}'

# Verificar logs: "Message NOT counted (trivial)"
```

### 2. Test Context Compression (logs)

```bash
# Enviar mensaje en conversación larga
# Verificar logs: "Context compression applied"
```

### 3. Test Evento Especial

```bash
# GET: Verificar evento activo
curl http://localhost:3000/api/events/activate

# POST: Activar evento (requiere auth)
curl -X POST http://localhost:3000/api/events/activate \
  -H "Cookie: next-auth.session-token=..."
```

---

## 📈 TIER LIMITS ACTUALES

```typescript
FREE:
- 10 mensajes/día (con smart counting ≈ 12 reales)
- 10 mensajes de contexto
- 0 mensajes proactivos
- 3 agentes activos
- Sin NSFW/Behaviors

PLUS ($10/mes):
- 100 mensajes/día
- 40 mensajes de contexto (4x)
- 3 mensajes proactivos/día
- 10 agentes activos
- NSFW + Behaviors ✅

ULTRA ($20/mes):
- Mensajes ilimitados
- 100 mensajes de contexto (10x)
- Mensajes proactivos ilimitados
- 50 agentes activos
- Todo desbloqueado ✅
```

---

## ✅ CHECKLIST DE INTEGRACIÓN

### Backend
- [x] CRON_SECRET generado y agregado a .env.example
- [x] trackMessageUsage integrado en endpoint de mensajes
- [x] Context compression integrado en message.service
- [x] Endpoint `/api/events/activate` disponible
- [x] Cron job `/api/cron/expire-temp-grants` configurado

### Frontend (pendiente según necesidad)
- [ ] Agregar `UsageIndicator` en chat principal
- [ ] Agregar `UpgradeNotificationUI` en chat
- [ ] Agregar `SpecialEventBanner` en dashboard
- [ ] Mostrar quota info en sidebar

### Deployment
- [ ] Agregar CRON_SECRET a variables de Vercel
- [ ] Verificar cron jobs en Vercel Dashboard
- [ ] Testing en producción

---

## 🆘 TROUBLESHOOTING

### Problema: Cron job no se ejecuta

1. Verificar `CRON_SECRET` en Vercel → Settings → Environment Variables
2. Verificar logs en Vercel → Deployments → Functions
3. Probar endpoint manualmente:
   ```bash
   curl -H "Authorization: Bearer CRON_SECRET" \
     https://tu-app.vercel.app/api/cron/expire-temp-grants
   ```

### Problema: Smart counting no funciona

1. Verificar logs del backend: `"Message usage tracked"`
2. Verificar que `trackMessageUsage` reciba el contenido del mensaje
3. Ajustar patterns en `lib/usage/smart-counting.ts` si es necesario

### Problema: Context compression no se aplica

1. Verificar logs: `"Context compression applied"`
2. Verificar que `contextLimit` sea correcto según tier
3. Verificar que hay suficientes mensajes para comprimir (> contextLimit)

---

## 📚 ARCHIVOS DE REFERENCIA

- **Límites diarios:** `lib/usage/daily-limits.ts`
- **Smart counting:** `lib/usage/smart-counting.ts`
- **Compresión contexto:** `lib/memory/context-compression.ts`
- **Eventos especiales:** `lib/usage/special-events.ts`
- **Notificaciones upgrade:** `lib/usage/upgrade-prompts.ts`
- **Componentes UI:** `components/upgrade/`
- **Endpoint mensajes:** `app/api/agents/[id]/message/route.ts`
- **Service mensajes:** `lib/services/message.service.ts`

---

## 🎉 ¡TODO LISTO!

El sistema de límites diarios está completamente integrado en el backend.

**Próximos pasos opcionales:**
1. Integrar componentes UI en el frontend según necesidad
2. Configurar variables de Vercel para producción
3. Testing exhaustivo en diferentes tiers
4. Analytics de conversión free → plus

**¿Dudas?** Consulta `INTEGRATION_COMPLETE.md` para más detalles.
