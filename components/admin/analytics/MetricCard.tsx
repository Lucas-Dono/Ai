/**
 * Tarjeta de métrica con valor, cambio y opcional ícono
 */

import { ReactNode } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  loading?: boolean;
  suffix?: string;
  valueColor?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel = 'vs periodo anterior',
  icon,
  loading,
  suffix,
  valueColor = 'text-gray-900'
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeBg = isPositive ? 'bg-green-50' : 'bg-red-50';

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return val.toLocaleString('es-ES', { maximumFractionDigits: 2 });
    }
    return val;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>

      <div>
        <p className={`text-3xl font-bold ${valueColor} mb-2`}>
          {formatValue(value)}
          {suffix && <span className="text-lg ml-1">{suffix}</span>}
        </p>

        {change !== undefined && (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${changeBg} ${changeColor}`}>
              {isPositive ? (
                <ArrowUpIcon className="w-3 h-3" />
              ) : (
                <ArrowDownIcon className="w-3 h-3" />
              )}
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500">{changeLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
