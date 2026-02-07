# Analytics Components

Componentes de visualización de datos con Recharts para el dashboard de analytics.

## Instalación

Estos componentes dependen de:
- `recharts` (^3.5.0) - Librería de gráficos
- `lucide-react` - Iconos
- `date-fns` - Formateo de fechas

Todas las dependencias ya están instaladas en el proyecto.

## Componentes Disponibles

### 1. MetricCard

Muestra una métrica clave con indicador de cambio opcional.

```tsx
import { MetricCard } from '@/components/admin/analytics';
import { TrendingUpIcon } from 'lucide-react';

<MetricCard
  title="Total Signups"
  value="1,234"
  change={12.5}
  changeLabel="vs mes anterior"
  trend="up"
  icon={<TrendingUpIcon className="w-5 h-5" />}
/>
```

**Props:**
- `title` (string): Título de la métrica
- `value` (string | number): Valor a mostrar
- `change?` (number): % de cambio
- `changeLabel?` (string): Label del cambio (default: "vs periodo anterior")
- `trend?` ('up' | 'down' | 'neutral'): Tendencia visual
- `icon?` (ReactNode): Icono opcional
- `loading?` (boolean): Estado de carga

### 2. FunnelChart

Gráfico de embudo horizontal con color coding según conversión.

```tsx
import { FunnelChart } from '@/components/admin/analytics';

<FunnelChart
  data={[
    { stage: 'Landing Views', count: 10000, rate: 100 },
    { stage: 'Demo Starts', count: 2000, rate: 20 },
    { stage: 'Signups', count: 500, rate: 5 },
    { stage: 'First Message', count: 350, rate: 3.5 },
    { stage: 'Paid Conversion', count: 50, rate: 0.5 }
  ]}
/>
```

**Props:**
- `data` (FunnelStage[]): Array de stages con count y rate
- `loading?` (boolean): Estado de carga

**Color coding:**
- Verde (>15%): Buena conversión
- Amarillo (5-15%): Conversión moderada
- Rojo (<5%): Conversión baja

### 3. TimeSeriesChart

Gráfico de líneas para series temporales con múltiples líneas.

```tsx
import { TimeSeriesChart } from '@/components/admin/analytics';

<TimeSeriesChart
  title="Signups vs Conversions"
  data={[
    { date: '2026-01-01', signups: 45, conversions: 8 },
    { date: '2026-01-02', signups: 52, conversions: 12 },
    { date: '2026-01-03', signups: 38, conversions: 7 },
  ]}
  lines={['signups', 'conversions']}
  height={400}
/>
```

**Con configuración custom:**

```tsx
<TimeSeriesChart
  title="User Activity"
  data={data}
  lines={[
    { key: 'dau', name: 'DAU', color: '#3b82f6' },
    { key: 'mau', name: 'MAU', color: '#10b981' },
    { key: 'wau', name: 'WAU', color: '#f59e0b' }
  ]}
/>
```

**Props:**
- `title?` (string): Título del gráfico
- `data` (TimeSeriesDataPoint[]): Array con date + valores
- `lines` (string[] | LineConfig[]): Keys a graficar
- `loading?` (boolean): Estado de carga
- `height?` (number): Altura en px (default: 400)

### 4. DataTable

Tabla con sorting, búsqueda y paginación.

```tsx
import { DataTable } from '@/components/admin/analytics';

<DataTable
  columns={[
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.plan === 'ultra' ? 'bg-purple-100 text-purple-800' :
          row.plan === 'plus' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.plan}
        </span>
      )
    },
    {
      key: 'signups',
      label: 'Signups',
      sortable: true,
      align: 'right'
    }
  ]}
  data={users}
  sortable
  searchable
  searchPlaceholder="Buscar usuarios..."
  itemsPerPage={50}
  onRowClick={(row) => router.push(`/admin/users/${row.id}`)}
/>
```

**Props:**
- `data` (T[]): Array de datos
- `columns` (Column[]): Definición de columnas
- `sortable?` (boolean): Habilitar sorting
- `searchable?` (boolean): Habilitar búsqueda
- `searchPlaceholder?` (string): Placeholder del buscador
- `itemsPerPage?` (number): Items por página (default: 50)
- `loading?` (boolean): Estado de carga
- `emptyMessage?` (string): Mensaje cuando no hay datos
- `onRowClick?` (fn): Handler para click en fila

### 5. PieChart

Gráfico circular con leyenda y estadísticas.

```tsx
import { PieChart } from '@/components/admin/analytics';

<PieChart
  title="User Plan Distribution"
  data={[
    { name: 'Free', value: 1250 },
    { name: 'Plus', value: 320 },
    { name: 'Ultra', value: 85 }
  ]}
  height={400}
/>
```

**Con colores custom:**

```tsx
<PieChart
  title="Traffic Sources"
  data={[
    { name: 'Google', value: 850, color: '#3b82f6' },
    { name: 'Facebook', value: 620, color: '#1877f2' },
    { name: 'Direct', value: 340, color: '#10b981' },
    { name: 'Reddit', value: 190, color: '#ff4500' }
  ]}
/>
```

**Props:**
- `title?` (string): Título del gráfico
- `data` (PieChartDataPoint[]): Array con name y value
- `loading?` (boolean): Estado de carga
- `height?` (number): Altura en px (default: 400)

## Ejemplo de Dashboard Completo

```tsx
'use client';

import { useEffect, useState } from 'react';
import {
  MetricCard,
  FunnelChart,
  TimeSeriesChart,
  DataTable,
  PieChart
} from '@/components/admin/analytics';
import { UsersIcon, TrendingUpIcon, DollarSignIcon } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/congrats-secure/analytics/funnel');
      const data = await res.json();
      setData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Users"
          value={data?.totalUsers || 0}
          change={12.5}
          trend="up"
          icon={<UsersIcon className="w-5 h-5" />}
          loading={loading}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${data?.conversionRate || 0}%`}
          change={-2.3}
          trend="down"
          icon={<TrendingUpIcon className="w-5 h-5" />}
          loading={loading}
        />
        <MetricCard
          title="MRR"
          value={`$${data?.mrr || 0}`}
          change={8.7}
          trend="up"
          icon={<DollarSignIcon className="w-5 h-5" />}
          loading={loading}
        />
      </div>

      {/* Funnel Chart */}
      <FunnelChart
        data={data?.funnelStages || []}
        loading={loading}
      />

      {/* Time Series */}
      <TimeSeriesChart
        title="Daily Signups vs Conversions"
        data={data?.timeSeries || []}
        lines={['signups', 'conversions']}
        loading={loading}
      />

      {/* Plan Distribution */}
      <PieChart
        title="Plan Distribution"
        data={data?.planDistribution || []}
        loading={loading}
      />

      {/* Users Table */}
      <DataTable
        columns={[
          { key: 'email', label: 'Email', sortable: true },
          { key: 'plan', label: 'Plan' },
          { key: 'signupDate', label: 'Signup Date', sortable: true }
        ]}
        data={data?.users || []}
        sortable
        searchable
        loading={loading}
      />
    </div>
  );
}
```

## Estilos y Consistencia

Todos los componentes siguen el mismo sistema de diseño:
- Cards: `bg-white`, `border-gray-200`, `rounded-lg`, `p-6`
- Hover: `hover:shadow-md transition-shadow`
- Loading states: skeleton con `animate-pulse`
- Colores: Palette Tailwind (blue, green, red, amber, etc.)

## TypeScript

Todos los componentes tienen tipos completos exportados:

```tsx
import type {
  MetricCardProps,
  FunnelStage,
  TimeSeriesDataPoint,
  Column,
  PieChartDataPoint
} from '@/components/admin/analytics';
```

## Notas

1. **Responsive**: Todos los charts usan `ResponsiveContainer` de Recharts
2. **Accesibilidad**: Labels, tooltips y contrastes están optimizados
3. **Performance**: DataTable pagina automáticamente en 50 items
4. **i18n**: Fechas usan `date-fns` con locale español

## Próximos Pasos

Estos componentes están listos para ser integrados en las páginas de analytics:
- `/app/congrats/analytics/page.tsx` - Dashboard principal
- `/app/congrats/users/page.tsx` - Tabla de usuarios
- `/app/congrats/users/[userId]/analytics/page.tsx` - Detalle usuario
