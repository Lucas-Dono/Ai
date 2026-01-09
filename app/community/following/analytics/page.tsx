"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, TrendingUp, MessageSquare, ThumbsUp, Eye,
  BarChart3, PieChart, Download, Calendar, Filter
} from 'lucide-react';
import Link from 'next/link';
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  totalFollowedPosts: number;
  activePostsLast7Days: number;
  totalNewComments: number;
  totalEngagement: number;
  engagementByType: Array<{ type: string; count: number }>;
  engagementByCommunity: Array<{ community: string; count: number }>;
  engagementByTag: Array<{ tag: string; count: number }>;
  activityTimeline: Array<{ date: string; comments: number; follows: number }>;
  recentActions: Array<{
    id: string;
    action: string;
    targetType: string;
    targetTitle?: string;
    createdAt: string;
  }>;
}

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community/posts/following/analytics?range=${timeRange}`);
      if (response.ok) {
        const analytics = await response.json();
        setData(analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = (format: 'json' | 'csv') => {
    if (!data) return;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString()}.json`;
      a.click();
    } else {
      // Crear CSV simple con estadísticas principales
      const csv = [
        ['Métrica', 'Valor'],
        ['Posts Seguidos', data.totalFollowedPosts],
        ['Posts Activos (últimos 7 días)', data.activePostsLast7Days],
        ['Nuevos Comentarios', data.totalNewComments],
        ['Engagement Total', data.totalEngagement],
        [],
        ['Engagement por Tipo'],
        ...data.engagementByType.map(item => [item.type, item.count]),
        [],
        ['Engagement por Comunidad'],
        ...data.engagementByCommunity.map(item => [item.community, item.count])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString()}.csv`;
      a.click();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No se pudo cargar los datos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/community/following"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Posts Seguidos
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Analytics de Posts Seguidos</h1>
              <p className="text-muted-foreground">
                Análisis detallado de tu actividad y engagement
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="7days">Últimos 7 días</option>
                <option value="30days">Últimos 30 días</option>
                <option value="90days">Últimos 90 días</option>
              </select>

              {/* Export Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => exportData('json')}
                  className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <Download className="h-4 w-4" />
                  JSON
                </button>
                <button
                  onClick={() => exportData('csv')}
                  className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Posts Seguidos</span>
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">{data.totalFollowedPosts}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Posts Activos</span>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">{data.activePostsLast7Days}</div>
            <div className="text-xs text-muted-foreground mt-1">Últimos 7 días</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Nuevos Comentarios</span>
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">{data.totalNewComments}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Engagement Total</span>
              <ThumbsUp className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">{data.totalEngagement}</div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Engagement por Tipo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Engagement por Tipo
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={data.engagementByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.type}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.engagementByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Engagement por Comunidad */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Engagement por Comunidad
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.engagementByCommunity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="community" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Línea de Tiempo de Actividad
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.activityTimeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="comments" stroke="#667eea" name="Comentarios" />
              <Line type="monotone" dataKey="follows" stroke="#764ba2" name="Follows" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Acciones Recientes</h3>
          <div className="space-y-3">
            {data.recentActions.map((action) => (
              <div key={action.id} className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground capitalize">{action.action.replace('_', ' ')}</span>
                    <span className="text-xs text-muted-foreground">{action.targetType}</span>
                  </div>
                  {action.targetTitle && (
                    <p className="text-sm text-muted-foreground">{action.targetTitle}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(action.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
