/**
 * Tarjeta de estadística para dashboard
 */

import { ReactNode } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs último periodo',
  icon,
  loading
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeBg = isPositive ? 'bg-green-50' : 'bg-red-50';

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>

          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
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
    </div>
  );
}
