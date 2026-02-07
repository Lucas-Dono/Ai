/**
 * Gráfico de series de tiempo usando Recharts
 */

'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface TimeSeriesDataPoint {
  date: string;
  [key: string]: string | number;
}

export interface LineConfig {
  key: string;
  label: string;
  color: string;
}

export interface TimeSeriesChartProps {
  data?: TimeSeriesDataPoint[];
  dataKeys: LineConfig[];
  loading?: boolean;
  height?: number;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
];

export function TimeSeriesChart({
  data,
  dataKeys,
  loading,
  height = 300
}: TimeSeriesChartProps) {
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height }}>
        <div className="animate-pulse text-gray-400">Cargando datos...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  // Formatear fechas para display
  const chartData = data.map(point => ({
    ...point,
    displayDate: format(new Date(point.date), 'dd MMM', { locale: es })
  }));

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900 mb-2">
                      {payload[0].payload.displayDate}
                    </p>
                    {payload.map((entry, index) => (
                      <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: <span className="font-medium">{entry.value}</span>
                      </p>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          {dataKeys.map((config, index) => (
            <Line
              key={config.key}
              type="monotone"
              dataKey={config.key}
              name={config.label}
              stroke={config.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
