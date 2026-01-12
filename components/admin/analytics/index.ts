/**
 * Analytics Components Exports
 *
 * Central export point for all analytics visualization components.
 * These components use Recharts for data visualization.
 *
 * @example
 * import { MetricCard, FunnelChart, TimeSeriesChart } from '@/components/admin/analytics';
 */

export { MetricCard } from './MetricCard';
export type { MetricCardProps } from './MetricCard';

export { FunnelChart } from './FunnelChart';
export type { FunnelChartProps, FunnelStage } from './FunnelChart';

export { TimeSeriesChart } from './TimeSeriesChart';
export type {
  TimeSeriesChartProps,
  TimeSeriesDataPoint,
  LineConfig
} from './TimeSeriesChart';

export { DataTable } from './DataTable';
export type { DataTableProps, Column } from './DataTable';

export { PieChart } from './PieChart';
export type { PieChartProps, PieChartDataPoint } from './PieChart';
