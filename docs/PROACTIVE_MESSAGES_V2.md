# Sistema de Mensajes Proactivos V2

## 🎯 Objetivo

Implementar un sistema robusto de mensajes proactivos que:
- ✅ No cause spam de requests al servidor
- ✅ No genere bucles infinitos
- ✅ Comparta estado eficientemente entre componentes
- ✅ Se limpie automáticamente cuando no se usa

## 🏗️ Arquitectura

### Sistema Singleton (Patrón Observer)

El nuevo hook usa un **ProactiveMessagesManager** global que:

1. **Una instancia de polling por agentId**: Múltiples componentes pueden suscribirse al mismo agentId sin crear múltiples pollings
2. **Estado compartido**: Todos los suscriptores reciben el mismo estado actualizado
3. **Limpieza automática**: Cuando el último suscriptor se desconecta, se detiene el polling y se limpia la memoria
4. **Rate limiting integrado**: Evita fetches duplicados en menos de 30 segundos

### Flujo de Funcionamiento

```
┌─────────────────┐
│  Component A    │──┐
│  (uses hook)    │  │
└─────────────────┘  │
                     │    ┌──────────────────────┐
┌─────────────────┐  ├───▶│  Singleton Manager   │
│  Component B    │──┘    │  - 1 polling/agentId │──▶ API Server
│  (uses hook)    │       │  - Shared state      │
└─────────────────┘       └──────────────────────┘
                                    │
                                    ▼
                          All subscribers get
                          the same updates
```

## 📝 Uso del Hook

### Básico

```tsx
import { useProactiveMessages } from '@/hooks/useProactiveMessages';

function MyComponent({ agentId }: { agentId: string }) {
  const {
    messages,
    isLoading,
    error,
    markAsRead,
    markAsDismissed,
    hasMessages
  } = useProactiveMessages(agentId, {
    enabled: true,
    pollingInterval: 600000, // 10 minutos
  });

  if (!hasMessages) return null;

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          {msg.content}
          <button onClick={() => markAsRead(msg.id)}>
            Marcar como leído
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Con callbacks

```tsx
const { messages } = useProactiveMessages(agentId, {
  enabled: true,
  pollingInterval: 600000,
  onNewMessage: (message) => {
    // Se ejecuta solo para mensajes nuevos
    console.log('Nuevo mensaje:', message);
    playNotificationSound();
  },
  onError: (error) => {
    console.error('Error:', error);
  },
});
```

## 🔧 Configuración

### Opciones del Hook

| Opción | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Habilita/deshabilita el polling |
| `pollingInterval` | number | `900000` (15min) | Intervalo de polling en milisegundos |
| `onNewMessage` | function | - | Callback cuando llega un mensaje nuevo |
| `onError` | function | - | Callback cuando hay un error |

### Valores Retornados

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `messages` | ProactiveMessage[] | Array de mensajes proactivos |
| `isLoading` | boolean | Estado de carga |
| `error` | Error \| null | Error si lo hay |
| `markAsRead` | function | Marca mensaje como leído |
| `markAsDismissed` | function | Descarta un mensaje |
| `respondToMessage` | function | Responde a un mensaje |
| `refresh` | function | Refresca manualmente |
| `hasMessages` | boolean | Indica si hay mensajes |

## 🚀 Mejoras Implementadas

### 1. Sistema Singleton

**Antes:**
```tsx
// ❌ Problema: Cada componente crea su propio polling
<ComponentA agentId="123" />  // Polling cada 1 min
<ComponentB agentId="123" />  // Otro polling cada 1 min
<ComponentC agentId="123" />  // Otro polling cada 1 min
// = 3 requests por minuto para el mismo agentId
```

**Ahora:**
```tsx
// ✅ Solución: Un solo polling compartido
<ComponentA agentId="123" />  // Se suscribe al manager
<ComponentB agentId="123" />  // Se suscribe al mismo manager
<ComponentC agentId="123" />  // Se suscribe al mismo manager
// = 1 request cada 10 minutos compartido entre todos
```

### 2. Sin Bucles Infinitos

**Problema anterior:**
- `fetchMessages` en las dependencias de useEffect
- `fetchMessages` se recreaba en cada render
- Causaba loop infinito

**Solución:**
- Callbacks en refs estables
- Lógica de polling fuera de React
- Suscripción simple sin dependencias problemáticas

### 3. Rate Limiting

```typescript
// No permite fetches duplicados en menos de 30 segundos
if (now - instance.lastFetch < 30000) {
  return; // Skip fetch
}
```

### 4. Limpieza Automática

```typescript
// Cuando el último suscriptor se desconecta:
if (instance.subscribers.size === 0) {
  this.stopPolling(agentId);      // Detiene interval
  this.instances.delete(agentId);  // Limpia memoria
}
```

## 📊 Monitoreo

El sistema incluye logs para debugging:

```
[ProactiveMessages] Started polling for agent abc123 (interval: 600000ms)
[ProactiveMessages] Stopped polling for agent abc123
[ProactiveMessages] Error fetching for agent abc123: Network error
```

## 🔄 Migración desde V1

### Cambios en el API

El API del hook es **100% compatible** con la versión anterior. No necesitas cambiar código existente.

### Comportamiento mejorado

- **V1**: Múltiples instancias = múltiples pollings
- **V2**: Múltiples instancias = un solo polling compartido

## ⚠️ Consideraciones

### Intervalos Recomendados

| Escenario | Intervalo | Razón |
|-----------|-----------|-------|
| Mensajes críticos | 5 min (300000ms) | Balance entre tiempo real y servidor |
| Mensajes normales | **10 min (600000ms)** | **Recomendado** |
| Notificaciones pasivas | 15-30 min | Bajo impacto en servidor |

### Límites del Sistema

- **Rate limiting**: Mínimo 30 segundos entre fetches del mismo agentId
- **Deduplicación**: Mensajes ya vistos no disparan `onNewMessage`
- **Cleanup**: Instancias se limpian automáticamente sin suscriptores

## 🐛 Troubleshooting

### Muchos requests al servidor

**Causa**: Múltiples agentIds distintos con intervalos cortos

**Solución**:
```tsx
// Aumenta el intervalo
pollingInterval: 600000 // 10 minutos en lugar de 60000 (1 min)
```

### Mensajes no se actualizan

**Causa**: Hook deshabilitado o agentId null

**Solución**:
```tsx
// Verifica que esté habilitado
enabled: true

// Y que agentId tenga valor
agentId={agentId || undefined}
```

### Error: "Failed to fetch"

**Causa**: API endpoint no disponible o problemas de autenticación

**Solución**: Verifica que el endpoint `/api/agents/[id]/proactive-messages` esté funcionando

## 🎯 Best Practices

1. **Usa intervalos razonables**: 10-15 minutos es ideal
2. **Deshabilita cuando no se necesite**: `enabled={isVisible}`
3. **Maneja errores**: Siempre usa `onError` callback
4. **Evita múltiples agentIds**: No renderices decenas de componentes con agentIds diferentes simultáneamente

## 📚 Referencias

- **Hook**: `/hooks/useProactiveMessages.ts`
- **Componentes de ejemplo**:
  - `/components/chat/ProactiveMessageNotification.tsx`
  - `/components/dashboard/ProactiveMessageBadge.tsx`
- **API Endpoint**: `/app/api/agents/[id]/proactive-messages/route.ts`
