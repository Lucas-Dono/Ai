'use client';

/**
 * Cost Chart Component
 * Visualizations for cost tracking data
 */

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCost } from '@/lib/cost-tracking/calculator';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface DailyCostData {
  date: Date | string;
  cost: number;
  count: number;
}

interface TypeBreakdown {
  type: string;
  cost: number;
  count: number;
}

interface ProviderBreakdown {
  provider: string;
  cost: number;
  count: number;
}

interface CostChartProps {
  type: 'daily' | 'type' | 'provider' | 'users';
  data: any[];
  height?: number;
}

export function CostChart({ type, data, height = 300 }: CostChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-2xl"
        style={{ height }}
      >
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  switch (type) {
    case 'daily':
      return <DailyCostChart data={data as DailyCostData[]} height={height} />;
    case 'type':
      return <TypeBreakdownChart data={data as TypeBreakdown[]} height={height} />;
    case 'provider':
      return <ProviderBreakdownChart data={data as ProviderBreakdown[]} height={height} />;
    case 'users':
      return <TopUsersChart data={data} height={height} />;
    default:
      return null;
  }
}

function DailyCostChart({ data, height }: { data: DailyCostData[]; height: number }) {
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    cost: Number(item.cost),
    count: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis
          tickFormatter={(value) => `$${value.toFixed(2)}`}
        />
        <Tooltip
          formatter={(value: any) => [`$${Number(value).toFixed(4)}`, 'Cost']}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="cost"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function TypeBreakdownChart({ data, height }: { data: TypeBreakdown[]; height: number }) {
  const chartData = data.map(item => ({
    name: item.type.toUpperCase(),
    value: Number(item.cost),
    count: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: any) => `$${Number(value).toFixed(4)}`} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function ProviderBreakdownChart({
  data,
  height,
}: {
  data: ProviderBreakdown[];
  height: number;
}) {
  const chartData = data.map(item => ({
    name: item.provider,
    cost: Number(item.cost),
    count: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `$${value.toFixed(2)}`} />
        <Tooltip
          formatter={(value: any) => [`$${Number(value).toFixed(4)}`, 'Cost']}
        />
        <Legend />
        <Bar dataKey="cost" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function TopUsersChart({ data, height }: { data: any[]; height: number }) {
  const chartData = data.map((item, index) => ({
    user: item.email?.split('@')[0] || `User ${index + 1}`,
    cost: Number(item.cost),
    count: item.count,
    plan: item.plan || 'free',
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={(value) => `$${value.toFixed(2)}`} />
        <YAxis dataKey="user" type="category" width={100} />
        <Tooltip
          formatter={(value: any) => [`$${Number(value).toFixed(4)}`, 'Cost']}
          labelFormatter={(label) => `User: ${label}`}
        />
        <Legend />
        <Bar dataKey="cost" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Cost Metric Card Component
interface CostMetricProps {
  title: string;
  value: number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
  format?: 'currency' | 'number';
}

export function CostMetric({
  title,
  value,
  subtitle,
  trend,
  format = 'currency',
}: CostMetricProps) {
  const formattedValue =
    format === 'currency'
      ? formatCost(value)
      : new Intl.NumberFormat('en-US').format(value);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="text-sm font-medium text-gray-500 mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{formattedValue}</div>
      {subtitle && <div className="text-sm text-gray-600 mb-2">{subtitle}</div>}
      {trend && (
        <div
          className={`text-sm font-medium ${
            trend.direction === 'up' ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.percentage).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

// Cost Alert Component
interface CostAlertProps {
  type: 'warning' | 'danger' | 'info';
  message: string;
}

export function CostAlert({ type, message }: CostAlertProps) {
  const colors = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    warning: '⚠️',
    danger: '🚨',
    info: 'ℹ️',
  };

  return (
    <div className={`border rounded-2xl p-4 ${colors[type]}`}>
      <div className="flex items-start">
        <span className="text-xl mr-3">{icons[type]}</span>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
