/**
 * Gestión de Agentes
 */

'use client';

import { useState } from 'react';
import { useAgents } from '@/lib/admin/hooks';
import { DataTable } from '@/components/admin/DataTable';

export default function AgentsPage() {
  const [page, setPage] = useState(1);
  const { agents, pagination, isLoading } = useAgents({ page, limit: 50 });

  const columns = [
    { key: 'name', label: 'Nombre' },
    {
      key: 'owner',
      label: 'Creador',
      render: (agent: any) => agent.owner.email
    },
    {
      key: 'nsfwMode',
      label: 'NSFW',
      render: (agent: any) => agent.nsfwMode ? '✓' : '✗'
    },
    { key: 'visibility', label: 'Visibilidad' },
    {
      key: 'messages',
      label: 'Mensajes',
      render: (agent: any) => agent._count.messages
    },
    {
      key: 'createdAt',
      label: 'Creado',
      render: (agent: any) => new Date(agent.createdAt).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agentes</h1>
        <p className="mt-2 text-gray-600">Gestión de agentes IA</p>
      </div>

      <DataTable
        data={agents}
        columns={columns}
        pagination={pagination}
        onPageChange={setPage}
        loading={isLoading}
      />
    </div>
  );
}
