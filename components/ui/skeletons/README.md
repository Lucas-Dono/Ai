# Skeleton Components - Loading States

Componentes de skeleton/loading para mejorar la percepción de performance.

## 🎯 Propósito

Los skeletons proporcionan feedback visual inmediato mientras se carga el contenido, mejorando significativamente la UX percibida.

**Beneficios**:
- ✅ Mejor percepción de velocidad (+34% según estudios)
- ✅ Reduce ansiedad del usuario
- ✅ Comunica estructura antes de cargar datos
- ✅ Profesional y moderno

---

## 📦 Componentes Disponibles

### Básicos (Primitivos)

```tsx
import { Skeleton, SkeletonCircle, SkeletonText, SkeletonButton, SkeletonImage } from '@/components/ui/skeletons';

// Skeleton genérico
<Skeleton className="h-4 w-full" />

// Avatar circular
<SkeletonCircle size="md" />

// Texto multi-línea
<SkeletonText lines={3} />

// Botón
<SkeletonButton size="default" />

// Imagen
<SkeletonImage aspectRatio="video" />
```

### Compuestos

#### SkeletonCard
```tsx
import { SkeletonCard } from '@/components/ui/skeletons';

<SkeletonCard
  showAvatar={true}
  lines={3}
  showActions={true}
/>
```

#### SkeletonList
```tsx
import { SkeletonList } from '@/components/ui/skeletons';

<SkeletonList
  count={5}
  variant="detailed" // 'simple' | 'detailed' | 'compact'
/>
```

#### SkeletonChat
```tsx
import { SkeletonChat, SkeletonTyping } from '@/components/ui/skeletons';

// Chat completo
<SkeletonChat messageCount={3} />

// Solo typing indicator
<SkeletonTyping />
```

#### SkeletonDashboard
```tsx
import {
  SkeletonStatsGrid,
  SkeletonStatCard,
  SkeletonChart,
  SkeletonTable,
  SkeletonActivity,
} from '@/components/ui/skeletons';

// Grid de estadísticas
<SkeletonStatsGrid />

// Stat individual
<SkeletonStatCard />

// Gráfico
<SkeletonChart />

// Tabla
<SkeletonTable rows={5} columns={4} />

// Actividad reciente
<SkeletonActivity />
```

---

## 🎨 Variantes de Animación

```tsx
// Pulse (default)
<Skeleton variant="pulse" />

// Shimmer (wave effect)
<Skeleton variant="shimmer" />

// Sin animación
<Skeleton variant="none" />
```

---

## 📖 Ejemplos de Uso

### 1. Loading Card

```tsx
'use client';

import { useState, useEffect } from 'react';
import { SkeletonCard } from '@/components/ui/skeletons';

export function AgentCard({ id }: { id: string }) {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/agents/${id}`)
      .then(res => res.json())
      .then(data => {
        setAgent(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <SkeletonCard showAvatar lines={3} showActions />;
  }

  return (
    <div className="rounded-2xl bg-card p-6">
      {/* Tu contenido real */}
    </div>
  );
}
```

### 2. Loading List

```tsx
'use client';

import { SkeletonList } from '@/components/ui/skeletons';

export function AgentsList() {
  const { data, isLoading } = useAgents();

  if (isLoading) {
    return <SkeletonList count={5} variant="detailed" />;
  }

  return (
    <ul>
      {data.map(agent => (
        <li key={agent.id}>{agent.name}</li>
      ))}
    </ul>
  );
}
```

### 3. Loading Chat

```tsx
'use client';

import { SkeletonChat, SkeletonTyping } from '@/components/ui/skeletons';

export function ChatView() {
  const { messages, isLoading, isTyping } = useChat();

  return (
    <div className="space-y-4">
      {isLoading ? (
        <SkeletonChat messageCount={3} />
      ) : (
        messages.map(msg => <Message key={msg.id} {...msg} />)
      )}

      {isTyping && <SkeletonTyping />}
    </div>
  );
}
```

### 4. Loading Dashboard

```tsx
'use client';

import {
  SkeletonStatsGrid,
  SkeletonChart,
  SkeletonActivity,
} from '@/components/ui/skeletons';

export function Dashboard() {
  const { stats, chart, activity, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonStatsGrid />
        <SkeletonChart />
        <SkeletonActivity />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsGrid data={stats} />
      <Chart data={chart} />
      <Activity data={activity} />
    </div>
  );
}
```

### 5. Skeleton con Suspense

```tsx
import { Suspense } from 'react';
import { SkeletonCard } from '@/components/ui/skeletons';

async function AgentData({ id }: { id: string }) {
  const agent = await fetchAgent(id);
  return <AgentCard data={agent} />;
}

export function AgentPage({ id }: { id: string }) {
  return (
    <Suspense fallback={<SkeletonCard showAvatar lines={3} />}>
      <AgentData id={id} />
    </Suspense>
  );
}
```

---

## ♿ Accesibilidad

Todos los skeletons incluyen:

```tsx
<div
  role="status"
  aria-label="Loading..."
>
  {/* skeleton content */}
</div>
```

- ✅ `role="status"` - Indica contenido en cambio
- ✅ `aria-label` - Describe qué se está cargando
- ✅ Animaciones respetan `prefers-reduced-motion`

---

## 🎨 Personalización

### Crear Skeleton Personalizado

```tsx
import { Skeleton } from '@/components/ui/skeletons';

export function SkeletonCustom() {
  return (
    <div className="rounded-2xl bg-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24 rounded-2xl" />
        <Skeleton className="h-10 w-24 rounded-2xl" />
      </div>
    </div>
  );
}
```

### Agregar Nuevas Variantes

```tsx
// En Skeleton.tsx
<div
  className={cn(
    'rounded-md bg-muted',
    variant === 'pulse' && 'animate-pulse',
    variant === 'shimmer' && 'animate-shimmer',
    variant === 'wave' && 'animate-wave', // Nueva variante
    className
  )}
/>
```

---

## 📊 Performance

### Mejores Prácticas

1. **Usa skeletons que coincidan con el layout real**
   ```tsx
   // ✅ BIEN - Mismo layout que el contenido real
   <SkeletonCard showAvatar lines={3} />

   // ❌ MAL - Layout diferente
   <Skeleton className="h-20 w-full" />
   ```

2. **Evita skeletons innecesarios en cargas rápidas (<200ms)**
   ```tsx
   const [showSkeleton, setShowSkeleton] = useState(false);

   useEffect(() => {
    const timer = setTimeout(() => setShowSkeleton(true), 200);
     return () => clearTimeout(timer);
   }, []);

   if (loading && showSkeleton) return <SkeletonCard />;
   ```

3. **Combina con React Suspense cuando sea posible**
   ```tsx
   <Suspense fallback={<SkeletonList count={5} />}>
     <DataComponent />
   </Suspense>
   ```

---

## 🔗 Referencias

- [Best Practices for Loading Patterns](https://www.lukew.com/ff/entry.asp?1797)
- [Material Design Progress Indicators](https://m3.material.io/components/progress-indicators)
- [Skeleton Screens - Facebook's Approach](https://www.lukew.com/ff/entry.asp?1797)

---

**Happy loading!** ⚡
