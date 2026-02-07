/**
 * Analytics Components Usage Examples
 *
 * This file shows how to use each analytics component.
 * Use these examples as reference when building analytics pages.
 *
 * NOTE: This file is for reference only - do not import it in production code.
 */

'use client';

import { UsersIcon, TrendingUpIcon, DollarSignIcon, ActivityIcon } from 'lucide-react';
import {
  MetricCard,
  FunnelChart,
  TimeSeriesChart,
  DataTable,
  PieChart
} from './index';

// Example 1: Metrics Grid
export function MetricsGridExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Signups"
        value="1,234"
        change={12.5}
        changeLabel="vs last month"
        icon={<UsersIcon className="w-5 h-5" />}
      />

      <MetricCard
        title="Conversion Rate"
        value="3.2%"
        change={-0.5}
        changeLabel="vs last week"
        icon={<TrendingUpIcon className="w-5 h-5" />}
      />

      <MetricCard
        title="MRR"
        value="$28,450"
        change={8.7}
        icon={<DollarSignIcon className="w-5 h-5" />}
      />

      <MetricCard
        title="Active Users"
        value="856"
        icon={<ActivityIcon className="w-5 h-5" />}
      />
    </div>
  );
}

// Example 2: Conversion Funnel
export function FunnelExample() {
  const funnelData = [
    { stage: 'Landing Views', count: 10000, rate: 100 },
    { stage: 'Demo Starts', count: 2000, rate: 20 },
    { stage: 'Demo Completes', count: 1400, rate: 14 },
    { stage: 'Signups', count: 500, rate: 5 },
    { stage: 'First Message', count: 425, rate: 4.25 },
    { stage: 'Paid Conversion', count: 50, rate: 0.5 }
  ];

  return <FunnelChart data={funnelData} />;
}

// Example 3: Time Series
export function TimeSeriesExample() {
  const timeSeriesData = [
    { date: '2026-01-01', signups: 45, conversions: 8, revenue: 720 },
    { date: '2026-01-02', signups: 52, conversions: 12, revenue: 1080 },
    { date: '2026-01-03', signups: 38, conversions: 7, revenue: 630 },
    { date: '2026-01-04', signups: 61, conversions: 15, revenue: 1350 },
    { date: '2026-01-05', signups: 49, conversions: 9, revenue: 810 },
    { date: '2026-01-06', signups: 55, conversions: 11, revenue: 990 },
    { date: '2026-01-07', signups: 43, conversions: 8, revenue: 720 }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Daily Signups vs Conversions</h3>
      <TimeSeriesChart
        data={timeSeriesData}
        dataKeys={[
          { key: 'signups', label: 'Signups', color: '#3b82f6' },
          { key: 'conversions', label: 'Conversions', color: '#10b981' }
        ]}
        height={400}
      />
    </div>
  );
}

// Example 4: Data Table
export function DataTableExample() {
  const usersData = [
    { id: 1, email: 'user1@example.com', plan: 'ultra', signupDate: '2026-01-05', messages: 328, ltv: 89.50 },
    { id: 2, email: 'user2@example.com', plan: 'plus', signupDate: '2026-01-03', messages: 156, ltv: 29.00 },
    { id: 3, email: 'user3@example.com', plan: 'free', signupDate: '2026-01-07', messages: 42, ltv: 0 },
    { id: 4, email: 'user4@example.com', plan: 'ultra', signupDate: '2026-01-02', messages: 521, ltv: 149.50 },
    { id: 5, email: 'user5@example.com', plan: 'plus', signupDate: '2026-01-06', messages: 89, ltv: 29.00 }
  ];

  return (
    <DataTable
      columns={[
        {
          key: 'email',
          label: 'Email',
          sortable: true
        },
        {
          key: 'plan',
          label: 'Plan',
          render: (row) => (
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              row.plan === 'ultra' ? 'bg-purple-100 text-purple-800' :
              row.plan === 'plus' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {row.plan.toUpperCase()}
            </span>
          )
        },
        {
          key: 'signupDate',
          label: 'Signup Date',
          sortable: true
        },
        {
          key: 'messages',
          label: 'Messages',
          sortable: true,
          align: 'right',
          render: (row) => row.messages.toLocaleString()
        },
        {
          key: 'ltv',
          label: 'LTV',
          sortable: true,
          align: 'right',
          render: (row) => `$${row.ltv.toFixed(2)}`
        }
      ]}
      data={usersData}
      sortable
      searchable
      searchPlaceholder="Search users..."
      itemsPerPage={10}
      onRowClick={(row) => console.log('Clicked user:', row)}
    />
  );
}

// Example 5: Pie Chart
export function PieChartExample() {
  const planDistribution = [
    { name: 'Free', value: 1250 },
    { name: 'Plus', value: 320 },
    { name: 'Ultra', value: 85 }
  ];

  return (
    <PieChart
      title="User Plan Distribution"
      data={planDistribution}
      height={400}
    />
  );
}

// Complete Dashboard Example
export function CompleteDashboardExample() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-2">Overview of key metrics and conversion funnel</p>
      </div>

      {/* Metrics */}
      <MetricsGridExample />

      {/* Funnel */}
      <FunnelExample />

      {/* Time Series */}
      <TimeSeriesExample />

      {/* Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartExample />
        <PieChart
          title="Traffic Sources"
          data={[
            { name: 'Google', value: 850, color: '#3b82f6' },
            { name: 'Facebook', value: 620, color: '#1877f2' },
            { name: 'Direct', value: 340, color: '#10b981' },
            { name: 'Reddit', value: 190, color: '#ff4500' },
            { name: 'Other', value: 125, color: '#6b7280' }
          ]}
        />
      </div>

      {/* Users Table */}
      <DataTableExample />
    </div>
  );
}
