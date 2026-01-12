/**
 * Moderación de Contenido
 */

'use client';

import { useState } from 'react';
import { useReports } from '@/lib/admin/hooks';
import { DataTable } from '@/components/admin/DataTable';

export default function ModerationPage() {
  const [page, setPage] = useState(1);
  const [resolved, setResolved] = useState('false');
  const { reports, pagination, stats, isLoading } = useReports({
    page,
    limit: 50,
    resolved
  });

  const columns = [
    { key: 'type', label: 'Tipo' },
    { key: 'reason', label: 'Razón' },
    {
      key: 'reporter',
      label: 'Reportado por',
      render: (report: any) => report.reporter.email
    },
    {
      key: 'content',
      label: 'Contenido',
      render: (report: any) =>
        report.content.title || report.content.content?.substring(0, 50) + '...'
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      render: (report: any) => new Date(report.createdAt).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Moderación</h1>
        <p className="mt-2 text-gray-600">
          Reportes pendientes: {stats?.total || 0}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setResolved('false')}
          className={`px-4 py-2 rounded-lg ${
            resolved === 'false'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setResolved('true')}
          className={`px-4 py-2 rounded-lg ${
            resolved === 'true'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Resueltos
        </button>
      </div>

      <DataTable
        data={reports}
        columns={columns}
        pagination={pagination}
        onPageChange={setPage}
        loading={isLoading}
      />
    </div>
  );
}
