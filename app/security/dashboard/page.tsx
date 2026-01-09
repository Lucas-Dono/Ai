'use client';

/**
 * Security Dashboard
 *
 * Dashboard de seguridad con:
 * - Threat score en tiempo real
 * - Alertas recientes
 * - Honeypot hits
 * - Canary token triggers
 * - Top attackers
 * - Estadísticas y gráficos
 */

import { useState, useEffect } from 'react';
import { RefreshCw, Shield, AlertTriangle, Activity, Eye, Zap, Users } from 'lucide-react';

interface DashboardData {
  overview: {
    threatScore: number;
    totalAlerts: number;
    criticalAlerts: number;
    highAlerts: number;
    totalThreats: number;
    honeypotHits: number;
    canaryTriggers: number;
    uniqueAttackers: number;
    blockedRequests: number;
  };
  alerts: {
    stats: any;
    recent: any[];
  };
  threats: {
    stats: any;
    recent: any[];
  };
  honeypots: any;
  tarpit: any;
  canary: any;
  attackers: {
    top: any[];
  };
  timeRange: {
    from: string;
    to: string;
  };
}

export default function SecurityDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/security/dashboard?timeRange=${timeRange}`);
      const json = await response.json();
      setData(json);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching security data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 30000); // Refresh cada 30 segundos

    return () => clearInterval(interval);
  }, [autoRefresh, timeRange]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  const getThreatColor = (score: number) => {
    if (score >= 80) return 'text-red-500';
    if (score >= 50) return 'text-orange-500';
    if (score >= 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getThreatBgColor = (score: number) => {
    if (score >= 80) return 'bg-red-500/20';
    if (score >= 50) return 'bg-orange-500/20';
    if (score >= 30) return 'bg-yellow-500/20';
    return 'bg-green-500/20';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20';
      case 'low': return 'text-blue-500 bg-blue-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🛡️ Security Dashboard</h1>
            <p className="text-gray-400">Real-time threat monitoring and detection</p>
          </div>

          <div className="flex gap-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                autoRefresh ? 'bg-green-600' : 'bg-gray-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Threat Score - Hero Section */}
        <div className={`rounded-lg p-8 ${getThreatBgColor(data.overview.threatScore)} border border-gray-800`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Overall Threat Level</p>
              <div className="flex items-baseline gap-4">
                <h2 className={`text-6xl font-bold ${getThreatColor(data.overview.threatScore)}`}>
                  {data.overview.threatScore.toFixed(0)}
                </h2>
                <span className="text-2xl text-gray-400">/100</span>
              </div>
              <p className="text-gray-400 mt-2">
                {data.overview.threatScore >= 80 ? '🚨 Critical - Immediate action required' :
                 data.overview.threatScore >= 50 ? '⚠️ High - Monitor closely' :
                 data.overview.threatScore >= 30 ? '⚡ Medium - Normal activity' :
                 '✅ Low - System secure'}
              </p>
            </div>
            <Shield className={`w-24 h-24 ${getThreatColor(data.overview.threatScore)}`} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<AlertTriangle className="w-6 h-6" />}
            title="Critical Alerts"
            value={data.overview.criticalAlerts}
            color="red"
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            title="Total Threats"
            value={data.overview.totalThreats}
            color="orange"
          />
          <StatCard
            icon={<Eye className="w-6 h-6" />}
            title="Honeypot Hits"
            value={data.overview.honeypotHits}
            color="yellow"
          />
          <StatCard
            icon={<Zap className="w-6 h-6" />}
            title="Canary Triggers"
            value={data.overview.canaryTriggers}
            color="purple"
          />
        </div>

        {/* Recent Alerts */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-xl font-bold mb-4">🚨 Recent Alerts</h3>
          <div className="space-y-2">
            {data.alerts.recent.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No recent alerts</p>
            ) : (
              data.alerts.recent.map((alert: any) => (
                <div
                  key={alert.id}
                  className="bg-gray-800 rounded p-4 border border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="font-semibold mb-1">{alert.title}</h4>
                      <p className="text-sm text-gray-400 line-clamp-2">{alert.description}</p>
                    </div>
                    {alert.acknowledged ? (
                      <span className="text-xs text-green-500">✓ Acknowledged</span>
                    ) : (
                      <span className="text-xs text-yellow-500">⚠ Pending</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Attackers */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-xl font-bold mb-4">
            <Users className="w-5 h-5 inline mr-2" />
            Top Attackers
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
                  <th className="pb-2">IP Address</th>
                  <th className="pb-2">Country</th>
                  <th className="pb-2">Threat Score</th>
                  <th className="pb-2">Threats</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.attackers.top.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-8">
                      No attackers detected
                    </td>
                  </tr>
                ) : (
                  data.attackers.top.map((attacker: any) => (
                    <tr key={attacker.id} className="border-b border-gray-800">
                      <td className="py-3 font-mono text-sm">{attacker.ipAddress}</td>
                      <td className="py-3">{attacker.country || 'Unknown'}</td>
                      <td className="py-3">
                        <span className={getThreatColor(attacker.threatScore)}>
                          {attacker.threatScore.toFixed(0)}
                        </span>
                      </td>
                      <td className="py-3">{attacker.threatCount}</td>
                      <td className="py-3">
                        {attacker.isBlocked ? (
                          <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded">
                            BLOCKED
                          </span>
                        ) : attacker.isBot ? (
                          <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">
                            BOT
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded">
                            MONITORING
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Threat Stats */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-bold mb-4">Threat Statistics</h3>
            <div className="space-y-2">
              {Object.entries(data.threats.stats.byType).map(([type, count]: [string, any]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-gray-400">{type}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Honeypot Stats */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-bold mb-4">Honeypot Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Hits</span>
                <span className="font-semibold">{data.honeypots.totalHits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Automated</span>
                <span className="font-semibold">{data.honeypots.automatedHits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Unique IPs</span>
                <span className="font-semibold">{data.honeypots.uniqueIPs}</span>
              </div>
            </div>
          </div>

          {/* Tarpit Stats */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-bold mb-4">Tarpit Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Requests</span>
                <span className="font-semibold">{data.tarpit.totalRequests}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Delay</span>
                <span className="font-semibold">{data.tarpit.totalDelayMinutes}m</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Avg Delay</span>
                <span className="font-semibold">{(data.tarpit.avgDelayMs / 1000).toFixed(1)}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    red: 'text-red-500 bg-red-500/20',
    orange: 'text-orange-500 bg-orange-500/20',
    yellow: 'text-yellow-500 bg-yellow-500/20',
    purple: 'text-purple-500 bg-purple-500/20',
    green: 'text-green-500 bg-green-500/20',
    blue: 'text-blue-500 bg-blue-500/20',
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
