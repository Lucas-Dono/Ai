/**
 * Time Series Chart Component
 * Line chart for displaying metrics over time using Recharts
 */

"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  label: string;
}

interface TimeSeriesChartProps {
  title: string;
  data: TimeSeriesPoint[];
  dataKey?: string;
  color?: string;
  height?: number;
  showLegend?: boolean;
}

export function TimeSeriesChart({
  title,
  data,
  dataKey = "value",
  color = "#3b82f6",
  height = 300,
  showLegend = false,
}: TimeSeriesChartProps) {
  // Transform data for recharts
  const chartData = data.map((point) => ({
    date: point.label,
    value: point.value,
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          {showLegend && <Legend />}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
            name={title}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
