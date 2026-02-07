'use client';

/**
 * Cost Monitoring Dashboard
 * Real-time tracking of AI/LLM operation costs
 */

import React, { useState, useEffect } from 'react';
import { CostChart, CostMetric, CostAlert } from '@/components/costs/CostChart';
import { useTranslations } from "next-intl";

interface CostSummary {
  total: number;
  callCount: number;
  byType: Array<{ type: string; cost: number; count: number }>;
  byProvider: Array<{ provider: string; cost: number; count: number }>;
  byModel: Array<{ model: string; cost: number; count: number }>;
}

interface DailyCost {
  date: string;
  cost: number;
  count: number;
}

interface TopUser {
  userId: string;
  email: string;
  name: string;
  plan: string;
  cost: number;
  count: number;
}

interface CostProjection {
  currentMonthCost: number;
  dailyAverage: number;
  projectedMonthEnd: number;
  daysInMonth: number;
  daysPassed: number;
  daysRemaining: number;
  trend: string;
  trendPercentage: number;
  last7DaysAverage: number;
}

export default function CostsDashboardPage() {
  const t = useTranslations("costs");
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [dailyCosts, setDailyCosts] = useState<DailyCost[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [projection, setProjection] = useState<CostProjection | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch summary
      const summaryRes = await fetch(`/api/admin/costs?view=summary&days=${dateRange}`);
      const summaryData = await summaryRes.json();
      if (summaryData.success) {
        setSummary(summaryData.data);
      }

      // Fetch daily costs
      const dailyRes = await fetch(`/api/admin/costs?view=daily&days=${dateRange}`);
      const dailyData = await dailyRes.json();
      if (dailyData.success) {
        setDailyCosts(dailyData.data);
      }

      // Fetch top users
      const usersRes = await fetch(`/api/admin/costs?view=top-users`);
      const usersData = await usersRes.json();
      if (usersData.success) {
        setTopUsers(usersData.data);
      }

      // Fetch projection
      const projectionRes = await fetch(`/api/admin/costs?view=projection`);
      const projectionData = await projectionRes.json();
      if (projectionData.success) {
        setProjection(projectionData.data);
      }
    } catch (error) {
      console.error('Error fetching cost data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Calculate alerts
  const alerts = [];
  if (projection) {
    if (projection.dailyAverage > 50) {
      alerts.push({
        type: 'danger' as const,
        message: t("alerts.dailyExceeds", { amount: projection.dailyAverage.toFixed(2) }),
      });
    }
    if (projection.projectedMonthEnd > 1000) {
      alerts.push({
        type: 'warning' as const,
        message: t("alerts.monthlyExceeds", { amount: projection.projectedMonthEnd.toFixed(2) }),
      });
    }
    if (projection.trend === 'increasing' && projection.trendPercentage > 20) {
      alerts.push({
        type: 'warning' as const,
        message: t("alerts.increasing", { percent: projection.trendPercentage.toFixed(1) }),
      });
    }
  }

  const expensiveUsers = topUsers.filter(u => u.cost > 10);
  if (expensiveUsers.length > 0) {
    alerts.push({
      type: 'info' as const,
      message: t("alerts.expensiveUsers", { count: expensiveUsers.length }),
    });
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setDateRange(7)}
            className={`px-4 py-2 rounded ${
              dateRange === 7
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t("dateRange.7days")}
          </button>
          <button
            onClick={() => setDateRange(30)}
            className={`px-4 py-2 rounded ${
              dateRange === 30
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t("dateRange.30days")}
          </button>
          <button
            onClick={() => setDateRange(90)}
            className={`px-4 py-2 rounded ${
              dateRange === 90
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t("dateRange.90days")}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {alerts.map((alert, index) => (
            <CostAlert key={index} type={alert.type} message={alert.message} />
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <CostMetric
          title={t("metrics.total")}
          value={summary?.total ?? 0}
          subtitle={t("metrics.apiCalls", { count: summary?.callCount ?? 0 })}
        />
        <CostMetric
          title={t("metrics.currentMonth")}
          value={projection?.currentMonthCost ?? 0}
          subtitle={t("metrics.daysPassed", { days: projection?.daysPassed ?? 0 })}
          trend={
            projection
              ? {
                  direction: projection.trend === 'increasing' ? 'up' : 'down',
                  percentage: projection.trendPercentage,
                }
              : undefined
          }
        />
        <CostMetric
          title="Daily Average"
          value={projection?.dailyAverage ?? 0}
          subtitle="Last 7 days"
        />
        <CostMetric
          title="Projected Month End"
          value={projection?.projectedMonthEnd ?? 0}
          subtitle={`${projection?.daysRemaining ?? 0} days remaining`}
        />
      </div>

      {/* Daily Costs Chart */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Daily Costs - Last {dateRange} Days
        </h2>
        <CostChart type="daily" data={dailyCosts} height={300} />
      </div>

      {/* Breakdown by Type and Provider */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cost by Type</h2>
          <CostChart type="type" data={summary?.byType ?? []} height={300} />
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cost by Provider</h2>
          <CostChart type="provider" data={summary?.byProvider ?? []} height={300} />
        </div>
      </div>

      {/* Top Models */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top 10 Models by Cost</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calls
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg per Call
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary?.byModel.map((model, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {model.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${model.cost.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {model.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${(model.cost / model.count).toFixed(6)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Users */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top 10 Users by Cost</h2>
        <CostChart type="users" data={topUsers} height={400} />
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calls
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topUsers.map((user, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.plan === 'ultra'
                          ? 'bg-purple-100 text-purple-800'
                          : user.plan === 'plus'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.plan.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${user.cost.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.cost > 10 ? (
                      <span className="text-red-600 font-medium">High usage</span>
                    ) : user.cost > 5 ? (
                      <span className="text-yellow-600 font-medium">Moderate</span>
                    ) : (
                      <span className="text-green-600 font-medium">Normal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
