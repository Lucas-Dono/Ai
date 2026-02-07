/**
 * Gráfico de funnel de conversión usando Recharts
 */

'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export interface FunnelStage {
  stage: string;
  count: number;
  rate: number;
}

export interface FunnelChartProps {
  data?: FunnelStage[];
  loading?: boolean;
}

const STAGE_LABELS: Record<string, string> = {
  landing_view: 'Landing View',
  demo_start: 'Demo Start',
  demo_complete: 'Demo Complete',
  signup: 'Signup',
  first_agent: 'First Agent',
  first_message: 'First Message',
  paid_upgrade: 'Paid Upgrade'
};

// Colores del funnel (verde → amarillo → rojo según drop-off)
const getBarColor = (rate: number): string => {
  if (rate >= 60) return '#10b981'; // green-500
  if (rate >= 30) return '#f59e0b'; // amber-500
  if (rate >= 10) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
};

export function FunnelChart({ data, loading }: FunnelChartProps) {
  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Cargando datos del funnel...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  const chartData = data.map(stage => ({
    ...stage,
    label: STAGE_LABELS[stage.stage] || stage.stage,
    displayRate: stage.rate.toFixed(1)
  }));

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} unit="%" />
          <YAxis type="category" dataKey="label" width={110} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900 mb-1">{data.label}</p>
                    <p className="text-sm text-gray-600">
                      Count: <span className="font-medium">{data.count.toLocaleString()}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Rate: <span className="font-medium">{data.displayRate}%</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.rate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
