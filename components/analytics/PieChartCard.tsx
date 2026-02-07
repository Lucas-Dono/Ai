/**
 * Pie Chart Card Component
 * Pie chart for displaying distribution data
 */

"use client";

import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface PieChartCardProps {
  title: string;
  data: Record<string, number>;
  colors?: string[];
  height?: number;
}

const DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#8b5cf6", // purple
  "#f59e0b", // orange
  "#ef4444", // red
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#84cc16", // lime
];

export function PieChartCard({
  title,
  data,
  colors = DEFAULT_COLORS,
  height = 300,
}: PieChartCardProps) {
  // Transform data for recharts
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculate total for percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props: any) => {
              const percentage = ((props.value / total) * 100).toFixed(1);
              return `${props.name}: ${percentage}%`;
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number) => {
              const percentage = ((value / total) * 100).toFixed(1);
              return [`${value} (${percentage}%)`, "Count"];
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
