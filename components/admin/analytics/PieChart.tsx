/**
 * PieChart Component
 *
 * Displays data distribution as a pie chart with legend.
 * Shows tooltips with percentages and absolute values.
 *
 * @example
 * <PieChart
 *   title="User Plan Distribution"
 *   data={[
 *     { name: 'Free', value: 1250 },
 *     { name: 'Plus', value: 320 },
 *     { name: 'Ultra', value: 85 },
 *   ]}
 * />
 */

'use client';

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

export interface PieChartDataPoint {
  /** Category name */
  name: string;

  /** Numeric value */
  value: number;

  /** Optional custom color (hex) */
  color?: string;
}

export interface PieChartProps {
  /** Chart title */
  title?: string;

  /** Data points to display */
  data: PieChartDataPoint[];

  /** Loading state */
  loading?: boolean;

  /** Height in pixels (default: 400) */
  height?: number;
}

/**
 * Default color palette for pie slices
 */
const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
];

/**
 * Custom tooltip showing absolute value and percentage
 */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const total = payload[0].payload.total;
  const percentage = ((data.value / total) * 100).toFixed(1);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-gray-900 text-sm mb-1">
        {data.name}
      </p>
      <div className="space-y-0.5 text-xs">
        <p className="text-gray-600">
          <span className="font-medium">Valor:</span>{' '}
          <span className="font-semibold text-gray-900">
            {data.value.toLocaleString()}
          </span>
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Porcentaje:</span>{' '}
          <span className="font-semibold text-gray-900">
            {percentage}%
          </span>
        </p>
      </div>
    </div>
  );
}

/**
 * Custom label showing percentage on pie slices
 */
function renderLabel(entry: any) {
  const percentage = ((entry.value / entry.payload.total) * 100).toFixed(1);
  // Only show label if percentage is >= 5% (to avoid cluttered small slices)
  if (parseFloat(percentage) < 5) return null;
  return `${percentage}%`;
}

export function PieChart({
  title,
  data,
  loading,
  height = 400
}: PieChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        {title && <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>}
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="w-64 h-64 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  // Calculate total for percentage calculations
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Enhance data with total for tooltip
  const enhancedData = data.map((item) => ({
    ...item,
    total
  }));

  // Sort by value descending for better visual hierarchy
  const sortedData = [...enhancedData].sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={sortedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius="70%"
            fill="#8884d8"
            dataKey="value"
          >
            {sortedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => {
              const percentage = ((entry.payload.value / total) * 100).toFixed(1);
              return `${value} (${percentage}%)`;
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sortedData.slice(0, 3).map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            const color = item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];

            return (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <p className="text-xs font-medium text-gray-600">
                    {item.name}
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {item.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {percentage}%
                </p>
              </div>
            );
          })}
        </div>

        {sortedData.length > 3 && (
          <p className="text-xs text-gray-500 text-center mt-3">
            +{sortedData.length - 3} más categorías
          </p>
        )}
      </div>
    </div>
  );
}
