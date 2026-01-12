/**
 * Dashboard Admin - Página Principal
 */

'use client';

import { useDashboard } from '@/lib/admin/hooks';
import { StatCard } from '@/components/admin/StatCard';
import { UsersIcon, BotIcon, MessageSquareIcon, DollarSignIcon, AlertTriangleIcon } from 'lucide-react';

export default function AdminDashboard() {
  const { dashboard, isLoading, isError } = useDashboard(30);

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error al cargar el dashboard. Verifica tu conexión y certificado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Vista general del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Usuarios"
          value={dashboard?.users?.total || 0}
          change={dashboard?.users?.growthRate}
          changeLabel="esta semana"
          icon={<UsersIcon className="w-6 h-6" />}
          loading={isLoading}
        />

        <StatCard
          title="Total Agentes"
          value={dashboard?.agents?.total || 0}
          change={dashboard?.agents?.growthRate}
          changeLabel="esta semana"
          icon={<BotIcon className="w-6 h-6" />}
          loading={isLoading}
        />

        <StatCard
          title="Mensajes/Día"
          value={dashboard?.messages?.averagePerDay || 0}
          icon={<MessageSquareIcon className="w-6 h-6" />}
          loading={isLoading}
        />

        <StatCard
          title="Usuarios Premium"
          value={dashboard?.plans?.premium || 0}
          icon={<DollarSignIcon className="w-6 h-6" />}
          loading={isLoading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Hoy</span>
              <span className="text-sm font-medium text-gray-900">{dashboard?.users?.today || 0} usuarios nuevos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Esta Semana</span>
              <span className="text-sm font-medium text-gray-900">{dashboard?.users?.thisWeek || 0} usuarios nuevos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Este Mes</span>
              <span className="text-sm font-medium text-gray-900">{dashboard?.users?.thisMonth || 0} usuarios nuevos</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Distribución de Planes</h3>
          <div className="space-y-3">
            {dashboard?.plans?.distribution?.map((plan: any) => (
              <div key={plan.plan} className="flex justify-between">
                <span className="text-sm text-gray-600 capitalize">{plan.plan}</span>
                <span className="text-sm font-medium text-gray-900">{plan.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Moderación</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reportes Pendientes</span>
              <span className={`inline-flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                (dashboard?.moderation?.pendingReports || 0) > 10
                  ? 'bg-red-50 text-red-600'
                  : 'bg-green-50 text-green-600'
              }`}>
                {dashboard?.moderation?.pendingReports || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Tamaño BD</p>
            <p className="text-2xl font-bold text-gray-900">
              {dashboard?.system?.databaseSize?.toFixed(2) || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">MB</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Conexiones Activas</p>
            <p className="text-2xl font-bold text-green-600">
              {dashboard?.system?.activeConnections || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Ejecutando queries</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Conexiones Idle</p>
            <p className="text-2xl font-bold text-gray-400">
              {dashboard?.system?.idleConnections || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Pool disponible</p>
          </div>
        </div>
      </div>
    </div>
  );
}
