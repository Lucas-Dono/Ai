/**
 * Gestión de Certificados
 */

'use client';

import { useCertificates } from '@/lib/admin/hooks';
import { DataTable } from '@/components/admin/DataTable';

export default function CertificatesPage() {
  const { certificates, stats, isLoading } = useCertificates();

  const columns = [
    { key: 'deviceName', label: 'Dispositivo' },
    {
      key: 'serialNumber',
      label: 'Serial',
      render: (cert: any) => cert.serialNumber.substring(0, 16) + '...'
    },
    {
      key: 'status',
      label: 'Estado',
      render: (cert: any) => {
        if (cert.revokedAt) return <span className="text-red-600">Revocado</span>;
        if (new Date(cert.expiresAt) < new Date()) return <span className="text-orange-600">Expirado</span>;
        return <span className="text-green-600">Activo</span>;
      }
    },
    {
      key: 'expiresAt',
      label: 'Expira',
      render: (cert: any) => new Date(cert.expiresAt).toLocaleString()
    },
    {
      key: 'isEmergency',
      label: 'Emergencia',
      render: (cert: any) => cert.isEmergency ? '✓' : '✗'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Certificados</h1>
        <p className="mt-2 text-gray-600">Gestión de certificados mTLS</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Activos</p>
          <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Expirados</p>
          <p className="text-2xl font-bold text-orange-600">{stats?.expired || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Revocados</p>
          <p className="text-2xl font-bold text-red-600">{stats?.revoked || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={certificates}
        columns={columns}
        loading={isLoading}
      />
    </div>
  );
}
