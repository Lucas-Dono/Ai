/**
 * Audit Logs
 */

'use client';

import { useState } from 'react';
import { useAuditLogs } from '@/lib/admin/hooks';
import { DataTable } from '@/components/admin/DataTable';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const { logs, pagination, isLoading } = useAuditLogs({ page, limit: 100 });

  const columns = [
    {
      key: 'createdAt',
      label: 'Fecha',
      render: (log: any) => new Date(log.createdAt).toLocaleString(),
      width: '180px'
    },
    {
      key: 'admin',
      label: 'Admin',
      render: (log: any) => log.adminAccess?.user?.email || 'system'
    },
    { key: 'action', label: 'Acción' },
    { key: 'targetType', label: 'Tipo' },
    { key: 'ipAddress', label: 'IP' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-2 text-gray-600">
          Registro de todas las acciones administrativas
        </p>
      </div>

      <DataTable
        data={logs}
        columns={columns}
        pagination={pagination}
        onPageChange={setPage}
        loading={isLoading}
      />
    </div>
  );
}
