/**
 * Panel Admin - Gestión de Versiones del Mod de Minecraft
 *
 * Permite:
 * - Ver todas las versiones del mod
 * - Subir nuevas versiones
 * - Marcar versiones como "latest"
 * - Eliminar versiones antiguas
 * - Ver estadísticas de descargas
 */

'use client';

import { useState, useEffect } from 'react';
import {
  PackageIcon,
  UploadIcon,
  DownloadIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  AlertTriangleIcon,
  InfoIcon,
} from 'lucide-react';

interface ModVersion {
  version: string;
  releaseDate: Date;
  fileSize: bigint;
  required: boolean;
  isLatest: boolean;
  downloadCount: number;
}

interface DownloadStats {
  totalVersions: number;
  totalDownloads: number;
  latestVersion: string;
  latestDownloads: number;
  versions: Array<{
    version: string;
    downloads: number;
    releaseDate: Date;
    isLatest: boolean;
  }>;
}

export default function MinecraftModPage() {
  const [versions, setVersions] = useState<ModVersion[]>([]);
  const [stats, setStats] = useState<DownloadStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Cargar versiones
  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/minecraft/mod/upload');

      if (!response.ok) {
        throw new Error('Error al cargar versiones');
      }

      const data = await response.json();
      setVersions(data.versions);
      setStats(data.stats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertTriangleIcon className="w-5 h-5 text-red-600" />
          <p className="text-red-800 font-medium">Error al cargar versiones</p>
        </div>
        <p className="text-red-600 text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mod de Minecraft</h1>
          <p className="mt-2 text-gray-600">Gestión de versiones y distribución</p>
        </div>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UploadIcon className="w-5 h-5" />
          Subir Nueva Versión
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Versiones</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalVersions}
                </p>
              </div>
              <PackageIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Descargas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalDownloads.toLocaleString()}
                </p>
              </div>
              <DownloadIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Versión Latest</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.latestVersion}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Descargas Latest</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.latestDownloads.toLocaleString()}
                </p>
              </div>
              <DownloadIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <InfoIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-blue-900 font-medium">Sistema de Distribución Propio</p>
            <p className="text-blue-700 text-sm mt-1">
              El mod se descarga desde tu servidor (Cloudflare R2) en lugar de GitHub.
              Esto te da control total, métricas de descarga y verificación SHA-256 automática.
            </p>
            <div className="mt-2 flex gap-2">
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                300 KB por versión
              </span>
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Cache de 1 año
              </span>
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Verificación SHA-256
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Versions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Versiones Disponibles</h2>
        </div>

        {versions.length === 0 ? (
          <div className="p-12 text-center">
            <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No hay versiones del mod almacenadas</p>
            <p className="text-gray-500 text-sm mb-4">
              Para comenzar, sube la primera versión usando el botón de arriba o ejecuta:
            </p>
            <code className="inline-block px-4 py-2 bg-gray-100 text-gray-800 rounded text-sm">
              npx tsx scripts/minecraft/upload-initial-version.ts
            </code>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Versión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descargas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {versions.map((version) => (
                  <tr key={version.version} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          v{version.version}
                        </span>
                        {version.isLatest && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            LATEST
                          </span>
                        )}
                        {version.required && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            REQUERIDA
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(version.releaseDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatBytes(Number(version.fileSize))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {version.downloadCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-sm text-green-600">
                        <CheckCircleIcon className="w-4 h-4" />
                        Activa
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => window.open(`/api/v1/minecraft/mod/download/${version.version}`)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Descargar"
                        >
                          <DownloadIcon className="w-4 h-4" />
                        </button>
                        {!version.isLatest && (
                          <button
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CLI Commands */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comandos CLI</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">Listar versiones:</p>
            <code className="block px-4 py-2 bg-gray-900 text-gray-100 rounded text-sm">
              npx tsx scripts/minecraft/list-mod-versions.ts
            </code>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Subir nueva versión:</p>
            <code className="block px-4 py-2 bg-gray-900 text-gray-100 rounded text-sm">
              npx tsx scripts/minecraft/upload-mod-version.ts --jar path/to/mod.jar --version 0.2.0
              --changelog "Descripción..."
            </code>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Eliminar versión:</p>
            <code className="block px-4 py-2 bg-gray-900 text-gray-100 rounded text-sm">
              npx tsx scripts/minecraft/delete-mod-version.ts --version 0.1.5
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
