# Sistema de Bond Progress V2

## 🎯 Objetivo

Implementar un sistema robusto de polling de progreso de vínculos que:
- ✅ No cause spam de requests al servidor
- ✅ No genere bucles infinitos
- ✅ Comparta estado eficientemente entre componentes
- ✅ Se limpie automáticamente cuando no se usa
- ✅ Maneje correctamente casos de "bond no existe" (404)

## 🏗️ Arquitectura

### Sistema Singleton (Patrón Observer)

El hook usa un **BondProgressManager** global que:

1. **Una instancia de polling por agentId**: Múltiples componentes pueden suscribirse al mismo agentId sin crear múltiples pollings
2. **Estado compartido**: Todos los suscriptores reciben el mismo estado actualizado
3. **Limpieza automática**: Cuando el último suscriptor se desconecta, se detiene el polling y se limpia la memoria
4. **Rate limiting integrado**: Evita fetches duplicados en menos de 30 segundos
5. **Manejo inteligente de 404**: Un bond que no existe aún es normal, no genera errores

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

### Básico (Compatible con V1)

```tsx
import { useBondProgress } from '@/hooks/useBondProgress';

function MyComponent({ agentId }: { agentId: string }) {
  const { bondProgress, loading, error } = useBondProgress(agentId);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!bondProgress?.hasBond) return <div>Sin vínculo aún</div>;

  return (
    <div>
      <p>Tier actual: {bondProgress.currentTier}</p>
      <p>Afinidad: {bondProgress.currentAffinityLevel}</p>
      <p>Interacciones: {bondProgress.totalInteractions}</p>
    </div>
  );
}
```

### Con opciones personalizadas

```tsx
const { bondProgress, loading, error, refresh } = useBondProgress(agentId, {
  enabled: true,
  pollingInterval: 600000, // 10 minutos (default)
  onUpdate: (progress) => {
    // Se ejecuta cuando el progreso cambia
    console.log('Bond actualizado:', progress);
  },
  onError: (error) => {
    console.error('Error:', error);
  },
});

// Refrescar manualmente
const handleRefresh = () => {
  refresh();
};
```

### Deshabilitar polling condicionalmente

```tsx
const { bondProgress } = useBondProgress(agentId, {
  enabled: isVisible, // Solo hacer polling cuando el componente es visible
  pollingInterval: 600000,
});
```

## 🔧 Configuración

### Opciones del Hook

| Opción | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Habilita/deshabilita el polling |
| `pollingInterval` | number | `600000` (10min) | Intervalo de polling en milisegundos |
| `onUpdate` | function | - | Callback cuando el progreso cambia |
| `onError` | function | - | Callback cuando hay un error |

### Valores Retornados

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `bondProgress` | BondProgress \| null | Datos del progreso del vínculo |
| `loading` | boolean | Estado de carga |
| `error` | string \| null | Error si lo hay |
| `refresh` | function | Refresca manualmente el progreso |

### Estructura de BondProgress

```typescript
interface BondProgress {
  hasBond: boolean;
  currentTier: string | null;
  currentAffinityLevel: number;
  durationDays: number;
  totalInteractions: number;
  nextTier: {
    tier: string;
    requiredAffinity: number;
    requiredDays: number;
    requiredInteractions: number;
    progress: {
      affinity: number; // 0-100
      days: number; // 0-100
      interactions: number; // 0-100
      overall: number; // 0-100
    };
  } | null;
  status: 'active' | 'warned' | 'dormant' | 'fragile' | null;
  rarityTier: string | null;
}
```

## 🚀 Mejoras Implementadas

### 1. Sistema Singleton

**Antes:**
```tsx
// ❌ Problema: Cada componente crea su propio polling
<RelationshipProgressBar agentId="123" />  // Polling cada 1 min
<ModernChat agentId="123" />                // Otro polling cada 1 min
<BondMilestoneDetector agentId="123" />     // Otro polling cada 1 min
// = 3 requests por minuto para el mismo agentId = 180 requests/hora
```

**Ahora:**
```tsx
// ✅ Solución: Un solo polling compartido
<RelationshipProgressBar agentId="123" />  // Se suscribe al manager
<ModernChat agentId="123" />                // Se suscribe al mismo manager
<BondMilestoneDetector agentId="123" />     // Se suscribe al mismo manager
// = 1 request cada 10 minutos compartido entre todos = 6 requests/hora
```

### 2. Sin Bucles Infinitos

**Problema anterior:**
- useEffect se ejecutaba en cada render
- Causaba fetches excesivos

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

### 5. Manejo Inteligente de 404

**Antes:** 404 causaba errores en consola y múltiples reintentos

**Ahora:**
```typescript
if (res.status === 404) {
  // No bond exists yet - this is normal
  const noBondState: BondProgress = {
    hasBond: false,
    // ... valores por defecto
  };
  this.updateState(agentId, {
    bondProgress: noBondState,
    loading: false,
    error: null, // ✅ No es un error
  });
  return;
}
```

### 6. Manejo de Autenticación

```typescript
if (res.status === 401) {
  // User not authenticated - don't spam errors
  return; // Silenciosamente skip
}
```

## 📊 Monitoreo

El sistema incluye logs para debugging:

```
[BondProgress] Started polling for agent abc123 (interval: 600000ms)
[BondProgress] Stopped polling for agent abc123
[BondProgress] Cleaned up instance for agent abc123
[BondProgress] Error fetching for agent abc123: Network error
```

## 🔄 Migración desde V1

### Cambios en el API

El API del hook es **100% compatible** con la versión anterior:

```tsx
// V1 - sigue funcionando
const { bondProgress, loading, error } = useBondProgress(agentId);

// V2 - con nuevas opciones (opcionales)
const { bondProgress, loading, error, refresh } = useBondProgress(agentId, {
  pollingInterval: 600000,
});
```

### Comportamiento mejorado

- **V1**: Polling cada 60 segundos (1 minuto)
- **V2**: Polling cada 600 segundos (10 minutos) por defecto
- **V1**: Múltiples instancias = múltiples pollings
- **V2**: Múltiples instancias = un solo polling compartido
- **V1**: 404 = error en consola
- **V2**: 404 = estado normal (hasBond: false)

## ⚠️ Consideraciones

### Intervalos Recomendados

| Escenario | Intervalo | Razón |
|-----------|-----------|-------|
| Progreso crítico | 5 min (300000ms) | Balance entre tiempo real y servidor |
| Progreso normal | **10 min (600000ms)** | **Recomendado** (default) |
| Progreso pasivo | 15-30 min | Bajo impacto en servidor |

### Límites del Sistema

- **Rate limiting**: Mínimo 30 segundos entre fetches del mismo agentId
- **Deduplicación**: Solo dispara `onUpdate` cuando el progreso realmente cambia
- **Cleanup**: Instancias se limpian automáticamente sin suscriptores
- **404 handling**: Un bond que no existe no genera errores

## 🐛 Troubleshooting

### Muchos requests al servidor

**Causa**: Múltiples agentIds distintos con intervalos cortos

**Solución**:
```tsx
// Aumenta el intervalo
pollingInterval: 600000 // 10 minutos en lugar de 60000 (1 min)
```

### Progreso no se actualiza

**Causa**: Hook deshabilitado o agentId null

**Solución**:
```tsx
// Verifica que esté habilitado
enabled: true

// Y que agentId tenga valor
agentId={agentId || undefined}
```

### Error 404 constante

**Causa**: Usuario no tiene bond con ese agente aún (es normal)

**Solución**: La V2 maneja esto correctamente. Solo verifica:
```tsx
if (!bondProgress?.hasBond) {
  return <div>Aún no tienes un vínculo con este agente</div>;
}
```

### Error: "Failed to fetch"

**Causa**: API endpoint no disponible o problemas de red

**Solución**: Verifica que el endpoint `/api/bonds/progress/[agentId]` esté funcionando

## 🎯 Best Practices

1. **Usa intervalos razonables**: 10-15 minutos es ideal para bond progress
2. **Deshabilita cuando no se necesite**: `enabled={isVisible}`
3. **Maneja el caso hasBond: false**: No todos los usuarios tienen bonds con todos los agentes
4. **Usa refresh() con moderación**: El auto-polling es suficiente en la mayoría de casos
5. **No fuerces intervalos cortos**: El rate limiting bloqueará fetches < 30 segundos de todos modos

## 📚 Referencias

- **Hook**: [hooks/useBondProgress.ts](../hooks/useBondProgress.ts)
- **API Endpoint**: [app/api/bonds/progress/[agentId]/route.ts](../app/api/bonds/progress/[agentId]/route.ts)
- **Componentes de ejemplo**:
  - [components/bonds/RelationshipProgressBar.tsx](../components/bonds/RelationshipProgressBar.tsx)
  - [components/chat/v2/ModernChat.tsx](../components/chat/v2/ModernChat.tsx)
  - [hooks/useBondMilestoneDetector.ts](../hooks/useBondMilestoneDetector.ts)

## 🔗 Relacionado

- [Sistema de Mensajes Proactivos V2](./PROACTIVE_MESSAGES_V2.md) - Mismo patrón singleton aplicado a mensajes proactivos
