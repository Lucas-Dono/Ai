/**
 * Dashboard de Monitoreo del Sistema de Embeddings
 *
 * Panel administrativo para visualizar el rendimiento y estado
 * del sistema de embeddings en tiempo real.
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Layers,
  RefreshCw,
  TrendingUp,
  Zap,
  XCircle,
} from 'lucide-react';

interface EmbeddingStats {
  queue: {
    totalJobs: number;
    byPriority: Record<number, number>;
    processing: number;
    completed: number;
    failed: number;
    avgWaitTime: number;
  };
  rateLimit: Record<string, { currentMinute: number; currentHour: number }>;
  model: {
    loaded: boolean;
  };
  cache: {
    totalCached: number;
  };
  health: {
    score: number;
    status: 'healthy' | 'degraded' | 'critical';
    recommendations: string[];
  };
  timestamp: string;
}

export default function EmbeddingsMonitorPage() {
  const [stats, setStats] = useState<EmbeddingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchStats();

    // Auto-refresh cada 5 segundos
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/embeddings/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Error al cargar estadísticas</p>
      </div>
    );
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Activity className="h-8 w-8 text-gray-500" />;
    }
  };

  const priorityLabels: Record<number, string> = {
    0: 'Crítico',
    1: 'Alto',
    2: 'Normal',
    3: 'Bajo',
    4: 'Background',
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Monitor de Embeddings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sistema de gestión inteligente de embeddings con prioridades
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-500/10' : ''}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`}
              />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>

            <Button variant="outline" size="sm" onClick={fetchStats}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar Ahora
            </Button>
          </div>
        </div>

        {/* Health Status */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getHealthIcon(stats.health.status)}
              <div>
                <h2 className="text-2xl font-bold">
                  Estado:{' '}
                  <span className={getHealthColor(stats.health.status)}>
                    {stats.health.status === 'healthy' && 'Saludable'}
                    {stats.health.status === 'degraded' && 'Degradado'}
                    {stats.health.status === 'critical' && 'Crítico'}
                  </span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Puntuación de salud: {stats.health.score}/100
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground">Última actualización</p>
              <p className="text-sm font-mono">
                {new Date(stats.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Recomendaciones */}
          {stats.health.recommendations.length > 0 && (
            <div className="mt-4 p-4 bg-muted/50 rounded-2xl">
              <h3 className="text-sm font-semibold mb-2">Recomendaciones:</h3>
              <ul className="space-y-1">
                {stats.health.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total en Cola */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-2xl">
                <Layers className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Cola</p>
                <p className="text-2xl font-bold">{stats.queue.totalJobs}</p>
              </div>
            </div>
          </Card>

          {/* Procesando */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-2xl">
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Procesando</p>
                <p className="text-2xl font-bold">{stats.queue.processing}</p>
              </div>
            </div>
          </Card>

          {/* Completados */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-2xl">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completados</p>
                <p className="text-2xl font-bold">{stats.queue.completed}</p>
              </div>
            </div>
          </Card>

          {/* Fallidos */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-2xl">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fallidos</p>
                <p className="text-2xl font-bold">{stats.queue.failed}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Queue by Priority */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cola por Prioridad
          </h3>

          <div className="space-y-3">
            {Object.entries(stats.queue.byPriority).map(([priority, count]) => {
              const priorityNum = parseInt(priority);
              const colors = [
                'bg-red-500',
                'bg-orange-500',
                'bg-yellow-500',
                'bg-blue-500',
                'bg-gray-500',
              ];

              return (
                <div key={priority}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {priorityLabels[priorityNum]}
                    </span>
                    <span className="text-sm text-muted-foreground">{count} jobs</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={colors[priorityNum]}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(100, (count / Math.max(stats.queue.totalJobs, 1)) * 100)}%`,
                      }}
                      transition={{ duration: 0.5 }}
                      style={{ height: '100%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Rate Limits */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Rate Limits (uso actual)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(stats.rateLimit).map(([operation, limits]) => (
              <div key={operation} className="p-3 bg-muted/50 rounded-2xl">
                <p className="text-sm font-medium mb-2">{operation}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Por minuto:</span>
                    <span className="font-mono">{limits.currentMinute}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Por hora:</span>
                    <span className="font-mono">{limits.currentHour}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* System Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Modelo
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado</span>
                <span
                  className={`text-sm font-medium ${
                    stats.model.loaded ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {stats.model.loaded ? '✓ Cargado' : '✗ No cargado'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tipo</span>
                <span className="text-sm font-mono">Qwen3-0.6B Q8</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Caché
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Embeddings cacheados</span>
                <span className="text-sm font-medium">{stats.cache.totalCached}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">TTL</span>
                <span className="text-sm font-mono">7 días</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
