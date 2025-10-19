"use client";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
  TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

// Color palette for business charts
const CHART_COLORS = {
  primary: "rgb(30 64 175)", // business-primary
  accent: "rgb(6 182 212)", // business-accent
  success: "rgb(16 185 129)", // business-success
  warning: "rgb(245 158 11)", // business-warning
  error: "rgb(239 68 68)", // business-error
  gradient: {
    from: "rgb(30 64 175)",
    to: "rgb(6 182 212)",
  },
};

// Custom Tooltip
interface CustomTooltipProps extends TooltipProps<number, string> {
  formatter?: (value: number) => string;
}

export function ChartTooltip({ active, payload, formatter }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="business-chart-tooltip">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-business-primary">
            {entry.name}:
          </span>
          <span className="text-sm font-bold text-business-brand">
            {formatter ? formatter(entry.value as number) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// Performance Line Chart
interface PerformanceChartProps {
  data: Array<{ name: string; value: number; [key: string]: any }>;
  title?: string;
  description?: string;
  dataKey?: string;
  loading?: boolean;
  className?: string;
}

export function PerformanceChart({
  data,
  title,
  description,
  dataKey = "value",
  loading = false,
  className,
}: PerformanceChartProps) {
  if (loading) {
    return (
      <Card className={cn("business-card p-6", className)}>
        <div className="space-y-4">
          {title && <div className="h-6 w-48 business-skeleton" />}
          {description && <div className="h-4 w-64 business-skeleton" />}
          <div className="h-[300px] business-skeleton" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("business-card p-6", className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-business-primary">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-business-muted">{description}</p>
          )}
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={CHART_COLORS.primary}
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor={CHART_COLORS.primary}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgb(var(--business-border-default))"
            opacity={0.3}
          />
          <XAxis
            dataKey="name"
            stroke="rgb(var(--business-text-muted))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="rgb(var(--business-text-muted))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={CHART_COLORS.primary}
            strokeWidth={3}
            dot={{ fill: CHART_COLORS.primary, r: 4 }}
            activeDot={{ r: 6 }}
            fill="url(#colorValue)"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

// Area Chart for Trends
export function TrendChart({
  data,
  title,
  description,
  dataKey = "value",
  loading = false,
  className,
}: PerformanceChartProps) {
  if (loading) {
    return (
      <Card className={cn("business-card p-6", className)}>
        <div className="h-[300px] business-skeleton" />
      </Card>
    );
  }

  return (
    <Card className={cn("business-card p-6", className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-business-primary">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-business-muted">{description}</p>
          )}
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={CHART_COLORS.accent}
                stopOpacity={0.4}
              />
              <stop
                offset="95%"
                stopColor={CHART_COLORS.accent}
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgb(var(--business-border-default))"
            opacity={0.3}
          />
          <XAxis
            dataKey="name"
            stroke="rgb(var(--business-text-muted))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="rgb(var(--business-text-muted))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={CHART_COLORS.accent}
            strokeWidth={2}
            fill="url(#areaGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

// Bar Chart for Comparisons
interface BarChartProps {
  data: Array<{ name: string; [key: string]: any }>;
  title?: string;
  description?: string;
  dataKeys?: string[];
  loading?: boolean;
  className?: string;
}

export function ComparisonBarChart({
  data,
  title,
  description,
  dataKeys = ["value"],
  loading = false,
  className,
}: BarChartProps) {
  const colors = [
    CHART_COLORS.primary,
    CHART_COLORS.accent,
    CHART_COLORS.success,
    CHART_COLORS.warning,
  ];

  if (loading) {
    return (
      <Card className={cn("business-card p-6", className)}>
        <div className="h-[300px] business-skeleton" />
      </Card>
    );
  }

  return (
    <Card className={cn("business-card p-6", className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-business-primary">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-business-muted">{description}</p>
          )}
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgb(var(--business-border-default))"
            opacity={0.3}
          />
          <XAxis
            dataKey="name"
            stroke="rgb(var(--business-text-muted))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="rgb(var(--business-text-muted))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              radius={[8, 8, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// Donut Chart for Distribution
interface DonutChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title?: string;
  description?: string;
  loading?: boolean;
  className?: string;
}

export function DonutChart({
  data,
  title,
  description,
  loading = false,
  className,
}: DonutChartProps) {
  const defaultColors = [
    CHART_COLORS.primary,
    CHART_COLORS.accent,
    CHART_COLORS.success,
    CHART_COLORS.warning,
    CHART_COLORS.error,
  ];

  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: item.color || defaultColors[index % defaultColors.length],
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <Card className={cn("business-card p-6", className)}>
        <div className="flex items-center justify-center h-[300px]">
          <div className="h-48 w-48 rounded-full business-skeleton" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("business-card p-6", className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-business-primary">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-business-muted">{description}</p>
          )}
        </div>
      )}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={dataWithColors}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {dataWithColors.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2 flex-1">
          {dataWithColors.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-business-secondary">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-business-primary">
                  {item.value}
                </span>
                <span className="text-xs text-business-muted ml-1">
                  ({((item.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
