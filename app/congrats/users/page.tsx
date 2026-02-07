/**
 * Gestión de Usuarios
 */

'use client';

import { useState } from 'react';
import { useUsers, useAdminMutation } from '@/lib/admin/hooks';
import { DataTable } from '@/components/admin/DataTable';
import { SearchIcon } from 'lucide-react';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState<string>('');

  const { users, pagination, isLoading, refresh } = useUsers({
    page,
    limit: 50,
    search: search || undefined,
    plan: plan || undefined
  });

  const columns = [
    {
      key: 'email',
      label: 'Email',
      render: (user: any) => (
        <div>
          <div className="font-medium text-gray-900">{user.email}</div>
          {user.name && <div className="text-xs text-gray-500">{user.name}</div>}
        </div>
      )
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (user: any) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          user.plan === 'ultra' ? 'bg-purple-100 text-purple-800' :
          user.plan === 'plus' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {user.plan}
        </span>
      )
    },
    {
      key: 'verified',
      label: 'Verificado',
      render: (user: any) => user.emailVerified ? '✓' : '✗'
    },
    {
      key: 'agents',
      label: 'Agentes',
      render: (user: any) => user._count.agents
    },
    {
      key: 'createdAt',
      label: 'Registro',
      render: (user: any) => new Date(user.createdAt).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
        <p className="mt-2 text-gray-600">Gestión de usuarios del sistema</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Email, nombre o ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan
            </label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="free">Free</option>
              <option value="plus">Plus</option>
              <option value="ultra">Ultra</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={users}
        columns={columns}
        pagination={pagination}
        onPageChange={setPage}
        loading={isLoading}
        emptyMessage="No se encontraron usuarios"
      />
    </div>
  );
}
