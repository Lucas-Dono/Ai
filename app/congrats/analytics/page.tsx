/**
 * Página de Analytics Dashboard
 * Visualización completa de KPIs y métricas clave
 */

'use client';

import { useState } from 'react';
import {
  useAnalyticsFunnel,
  useAnalyticsLanding,
  useAnalyticsConversion
} from '@/lib/admin/hooks';
import { MetricCard } from '@/components/admin/analytics/MetricCard';
import { FunnelChart } from '@/components/admin/analytics/FunnelChart';
import { TimeSeriesChart } from '@/components/admin/analytics/TimeSeriesChart';
import { PieChart } from '@/components/admin/analytics/PieChart';
import { DataTable, Column } from '@/components/admin/analytics/DataTable';
import {
  TrendingUpIcon,
  UsersIcon,
  DollarSignIcon,
  MousePointerClickIcon,
  EyeIcon,
  UserPlusIcon,
  CreditCardIcon
} from 'lucide-react';

type TabType = 'funnel' | 'landing' | 'conversion';

export default function AnalyticsPage() {
  const [selectedTab, setSelectedTab] = useState<TabType>('funnel');
  const [timeRange, setTimeRange] = useState(30);

  const { funnel, isLoading: loadingFunnel } = useAnalyticsFunnel(timeRange);
  const { landing, isLoading: loadingLanding } = useAnalyticsLanding(timeRange);
  const { conversion, isLoading: loadingConversion } = useAnalyticsConversion(timeRange);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Métricas de conversión y comportamiento de usuarios
          </p>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={7}>Últimos 7 días</option>
          <option value={30}>Últimos 30 días</option>
          <option value={90}>Últimos 90 días</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setSelectedTab('funnel')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              selectedTab === 'funnel'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Funnel de Conversión
          </button>
          <button
            onClick={() => setSelectedTab('landing')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              selectedTab === 'landing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Landing Page
          </button>
          <button
            onClick={() => setSelectedTab('conversion')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              selectedTab === 'conversion'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Conversión y MRR
          </button>
        </nav>
      </div>

      {/* Tab Content: Funnel */}
      {selectedTab === 'funnel' && (
        <div className="space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Landing Views"
              value={funnel?.funnel?.[0]?.count || 0}
              icon={<EyeIcon className="w-5 h-5" />}
              loading={loadingFunnel}
            />
            <MetricCard
              title="Demo Starts"
              value={funnel?.funnel?.[1]?.count || 0}
              suffix={funnel?.funnel?.[1]?.rate ? `${funnel.funnel[1].rate.toFixed(1)}%` : ''}
              icon={<MousePointerClickIcon className="w-5 h-5" />}
              loading={loadingFunnel}
            />
            <MetricCard
              title="Signups"
              value={funnel?.funnel?.[3]?.count || 0}
              suffix={funnel?.funnel?.[3]?.rate ? `${funnel.funnel[3].rate.toFixed(1)}%` : ''}
              icon={<UserPlusIcon className="w-5 h-5" />}
              loading={loadingFunnel}
            />
            <MetricCard
              title="Paid Upgrades"
              value={funnel?.funnel?.[6]?.count || 0}
              suffix={funnel?.funnel?.[6]?.rate ? `${funnel.funnel[6].rate.toFixed(1)}%` : ''}
              icon={<CreditCardIcon className="w-5 h-5" />}
              loading={loadingFunnel}
              valueColor="text-green-600"
            />
          </div>

          {/* Gráfico de funnel */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Funnel de Conversión Completo
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Visualización del recorrido del usuario desde la landing hasta el pago
            </p>
            <FunnelChart data={funnel?.funnel} loading={loadingFunnel} />
          </div>

          {/* Drop-off analysis */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Análisis de Drop-off
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Puntos críticos donde perdemos usuarios
            </p>
            <DataTable
              columns={[
                {
                  key: 'from',
                  label: 'Desde',
                  sortable: true,
                  render: (row: any) => (
                    <span className="font-medium text-gray-900">
                      {row.from.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  )
                },
                {
                  key: 'to',
                  label: 'Hasta',
                  sortable: true,
                  render: (row: any) => (
                    <span className="font-medium text-gray-900">
                      {row.to.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  )
                },
                {
                  key: 'loss',
                  label: 'Usuarios Perdidos',
                  sortable: true,
                  align: 'right' as const,
                  render: (row: any) => (
                    <span className="text-red-600 font-semibold">
                      {row.loss.toLocaleString()}
                    </span>
                  )
                },
                {
                  key: 'rate',
                  label: 'Tasa de Drop-off',
                  sortable: true,
                  align: 'right' as const,
                  render: (row: any) => (
                    <span className={`font-semibold ${row.rate > 50 ? 'text-red-600' : 'text-amber-600'}`}>
                      {row.rate.toFixed(2)}%
                    </span>
                  )
                }
              ]}
              data={funnel?.dropoff || []}
              loading={loadingFunnel}
              sortable
            />
          </div>
        </div>
      )}

      {/* Tab Content: Landing Page */}
      {selectedTab === 'landing' && (
        <div className="space-y-6">
          {/* Overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Visitas"
              value={landing?.overview?.totalViews || 0}
              icon={<EyeIcon className="w-5 h-5" />}
              loading={loadingLanding}
            />
            <MetricCard
              title="Visitantes Únicos"
              value={landing?.overview?.uniqueVisitors || 0}
              icon={<UsersIcon className="w-5 h-5" />}
              loading={loadingLanding}
            />
            <MetricCard
              title="Demo Starts"
              value={landing?.demo?.starts || 0}
              suffix={landing?.demo?.startRate ? `${(landing.demo.startRate * 100).toFixed(1)}%` : ''}
              icon={<MousePointerClickIcon className="w-5 h-5" />}
              loading={loadingLanding}
            />
            <MetricCard
              title="Tasa de Conversión Demo"
              value={landing?.demo?.conversionRate ? `${(landing.demo.conversionRate * 100).toFixed(1)}%` : '0%'}
              icon={<TrendingUpIcon className="w-5 h-5" />}
              loading={loadingLanding}
              valueColor="text-blue-600"
            />
          </div>

          {/* Demo engagement metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Mensajes Promedio por Demo</h4>
              <p className="text-3xl font-bold text-gray-900">
                {landing?.demo?.avgMessages?.toFixed(1) || '0'}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Tasa de Completado</h4>
              <p className="text-3xl font-bold text-gray-900">
                {landing?.demo?.completionRate ? `${(landing.demo.completionRate * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Signups después de Demo</h4>
              <p className="text-3xl font-bold text-green-600">
                {landing?.demo?.signupAfterDemo || 0}
              </p>
            </div>
          </div>

          {/* Traffic sources */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Fuentes de Tráfico
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              De dónde provienen los visitantes
            </p>
            <DataTable
              columns={[
                {
                  key: 'source',
                  label: 'Fuente',
                  sortable: true,
                  render: (row: any) => (
                    <span className="font-medium text-gray-900 capitalize">
                      {row.source}
                    </span>
                  )
                },
                {
                  key: 'visits',
                  label: 'Visitas',
                  sortable: true,
                  align: 'right' as const,
                  render: (row: any) => row.visits.toLocaleString()
                },
                {
                  key: 'signups',
                  label: 'Signups',
                  sortable: true,
                  align: 'right' as const,
                  render: (row: any) => (
                    <span className="font-semibold text-green-600">
                      {row.signups.toLocaleString()}
                    </span>
                  )
                },
                {
                  key: 'conversionRate',
                  label: 'Tasa de Conversión',
                  sortable: true,
                  align: 'right' as const,
                  render: (row: any) => (
                    <span className="font-semibold text-blue-600">
                      {(row.conversionRate * 100).toFixed(2)}%
                    </span>
                  )
                }
              ]}
              data={landing?.traffic?.sources || []}
              loading={loadingLanding}
              sortable
            />
          </div>

          {/* Device distribution */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribución por Dispositivo
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Cómo acceden los usuarios a la landing
            </p>
            <PieChart
              data={landing?.traffic?.devices?.map((d: any) => ({
                name: d.type,
                value: d.count
              })) || []}
              loading={loadingLanding}
              height={350}
            />
          </div>
        </div>
      )}

      {/* Tab Content: Conversion */}
      {selectedTab === 'conversion' && (
        <div className="space-y-6">
          {/* Plan distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Free Users"
              value={conversion?.overview?.freeUsers || 0}
              icon={<UsersIcon className="w-5 h-5" />}
              loading={loadingConversion}
            />
            <MetricCard
              title="Plus Users"
              value={conversion?.overview?.plusUsers || 0}
              icon={<UsersIcon className="w-5 h-5" />}
              loading={loadingConversion}
              valueColor="text-blue-600"
            />
            <MetricCard
              title="Ultra Users"
              value={conversion?.overview?.ultraUsers || 0}
              icon={<UsersIcon className="w-5 h-5" />}
              loading={loadingConversion}
              valueColor="text-purple-600"
            />
          </div>

          {/* Plan distribution pie chart */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribución de Planes
            </h3>
            <PieChart
              data={[
                { name: 'Free', value: conversion?.overview?.freeUsers || 0 },
                { name: 'Plus', value: conversion?.overview?.plusUsers || 0 },
                { name: 'Ultra', value: conversion?.overview?.ultraUsers || 0 }
              ]}
              loading={loadingConversion}
              height={350}
            />
          </div>

          {/* Conversion rates */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tasas de Conversión entre Planes
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Porcentaje de usuarios que upgradearon en el periodo
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free to Plus */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">Free → Plus</p>
                <p className="text-4xl font-bold text-blue-600 mb-1">
                  {conversion?.conversions?.freeToPlus?.rate
                    ? `${(conversion.conversions.freeToPlus.rate * 100).toFixed(2)}%`
                    : '0%'}
                </p>
                <p className="text-sm text-blue-700">
                  {conversion?.conversions?.freeToPlus?.count || 0} conversiones
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Tiempo promedio: {conversion?.conversions?.freeToPlus?.avgTimeToConvert?.toFixed(1) || '0'} días
                </p>
              </div>

              {/* Free to Ultra */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <p className="text-sm font-medium text-purple-900 mb-2">Free → Ultra</p>
                <p className="text-4xl font-bold text-purple-600 mb-1">
                  {conversion?.conversions?.freeToUltra?.rate
                    ? `${(conversion.conversions.freeToUltra.rate * 100).toFixed(2)}%`
                    : '0%'}
                </p>
                <p className="text-sm text-purple-700">
                  {conversion?.conversions?.freeToUltra?.count || 0} conversiones
                </p>
                <p className="text-xs text-purple-600 mt-2">
                  Tiempo promedio: {conversion?.conversions?.freeToUltra?.avgTimeToConvert?.toFixed(1) || '0'} días
                </p>
              </div>

              {/* Plus to Ultra */}
              <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
                <p className="text-sm font-medium text-amber-900 mb-2">Plus → Ultra</p>
                <p className="text-4xl font-bold text-amber-600 mb-1">
                  {conversion?.conversions?.plusToUltra?.rate
                    ? `${(conversion.conversions.plusToUltra.rate * 100).toFixed(2)}%`
                    : '0%'}
                </p>
                <p className="text-sm text-amber-700">
                  {conversion?.conversions?.plusToUltra?.count || 0} conversiones
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  Tiempo promedio: {conversion?.conversions?.plusToUltra?.avgTimeToConvert?.toFixed(1) || '0'} días
                </p>
              </div>
            </div>
          </div>

          {/* Revenue metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600">MRR</h4>
                <DollarSignIcon className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                ${conversion?.revenue?.mrr?.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Monthly Recurring Revenue</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600">ARR</h4>
                <DollarSignIcon className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                ${conversion?.revenue?.arr?.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Annual Recurring Revenue</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600">Churn Rate</h4>
                <TrendingUpIcon className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {conversion?.revenue?.churnRate?.toFixed(2) || '0'}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Tasa de cancelación mensual</p>
            </div>
          </div>

          {/* Conversion triggers */}
          {conversion?.triggers && conversion.triggers.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Triggers de Conversión
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Qué eventos preceden a un upgrade
              </p>
              <DataTable
                columns={[
                  {
                    key: 'trigger',
                    label: 'Trigger',
                    sortable: true,
                    render: (row: any) => (
                      <span className="font-medium text-gray-900">
                        {row.trigger.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                    )
                  },
                  {
                    key: 'conversions',
                    label: 'Conversiones',
                    sortable: true,
                    align: 'right' as const,
                    render: (row: any) => (
                      <span className="font-semibold text-blue-600">
                        {row.conversions.toLocaleString()}
                      </span>
                    )
                  },
                  {
                    key: 'rate',
                    label: 'Tasa',
                    sortable: true,
                    align: 'right' as const,
                    render: (row: any) => (
                      <span className="font-semibold">
                        {row.rate.toFixed(2)}%
                      </span>
                    )
                  }
                ]}
                data={conversion.triggers}
                loading={loadingConversion}
                sortable
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
