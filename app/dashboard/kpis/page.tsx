/**
 * Dashboard de KPIs - FASE 6
 *
 * Dashboard centralizado para monitoreo de todas las métricas clave:
 * - Compliance & Safety
 * - User Experience
 * - Engagement
 * - Monetization
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Users,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Activity,
  Target,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

interface KPIMetric {
  current: number;
  target?: number;
  baseline?: number;
  targetMin?: number;
  targetMax?: number;
  unit?: string;
  status: "good" | "warning" | "critical";
}

interface ComplianceMetrics {
  ageVerification: KPIMetric & { total: number; completed: number; failed: number; rate: number };
  nsfwConsent: KPIMetric & { total: number; accepted: number; declined: number; rate: number };
  moderation: KPIMetric & { total: number; falsePositives: number; falsePositiveRate: number };
  piiProtection: KPIMetric & { detected: number; redacted: number; rate: number };
}

interface UserExperienceMetrics {
  timeToFirstAgent: KPIMetric;
  signupToMessage: KPIMetric;
  mobileBounce: KPIMetric;
  d7Retention: KPIMetric;
}

interface EngagementMetrics {
  avgMessagesPerSession: KPIMetric;
  sessionsPerWeek: KPIMetric;
  commandPaletteDiscovery: KPIMetric;
}

interface MonetizationMetrics {
  conversion: KPIMetric;
  mrr: KPIMetric;
  churn: KPIMetric;
  upgradeModalCtr: KPIMetric;
}

interface AlertItem {
  level: "critical" | "warning";
  category: string;
  metric: string;
  message: string;
}

interface KPIData {
  compliance: ComplianceMetrics;
  userExperience: UserExperienceMetrics;
  engagement: EngagementMetrics;
  monetization: MonetizationMetrics;
  alerts: AlertItem[];
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
}

const statusColors = {
  good: "text-green-500 bg-green-500/10",
  warning: "text-orange-500 bg-orange-500/10",
  critical: "text-red-500 bg-red-500/10",
};

const statusIcons = {
  good: CheckCircle,
  warning: AlertTriangle,
  critical: XCircle,
};

function MetricCard({
  title,
  metric,
  icon: Icon,
}: {
  title: string;
  metric: KPIMetric;
  icon: any;
}) {
  const StatusIcon = statusIcons[metric.status];

  return (
    <Card className="hover-lift-glow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {title}
          </CardTitle>
          <Badge variant="outline" className={statusColors[metric.status]}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {metric.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            {metric.current}
            {metric.unit || ""}
          </div>
          {metric.target && (
            <div className="text-xs text-muted-foreground">
              Target: {metric.target}
              {metric.unit || ""}
            </div>
          )}
          {metric.targetMin && metric.targetMax && (
            <div className="text-xs text-muted-foreground">
              Target: {metric.targetMin}-{metric.targetMax}
              {metric.unit || ""}
            </div>
          )}
          {metric.baseline && (
            <div className="text-xs text-muted-foreground">
              Baseline: {metric.baseline}
              {metric.unit || ""}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function KPIsPage() {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKPIs();
  }, []);

  async function fetchKPIs() {
    try {
      setLoading(true);
      const response = await fetch("/api/analytics/kpis");
      if (!response.ok) {
        throw new Error("Failed to fetch KPIs");
      }
      const result = await response.json();
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando KPIs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Error al cargar KPIs
            </CardTitle>
            <CardDescription>{error || "No se pudieron cargar los datos"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchKPIs} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard de KPIs</h1>
            <p className="text-muted-foreground">
              Métricas clave del negocio - Última actualización:{" "}
              {new Date(data.generatedAt).toLocaleString()}
            </p>
          </div>
          <Button onClick={fetchKPIs} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>

        {/* Alertas Críticas */}
        {data.alerts.length > 0 && (
          <div className="space-y-2">
            {data.alerts.map((alert, index) => (
              <Alert
                key={index}
                variant={alert.level === "critical" ? "destructive" : "default"}
                className="border-2"
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  {alert.level === "critical" ? "🚨 CRÍTICO" : "⚠️ ADVERTENCIA"} - {alert.category}:{" "}
                  {alert.metric}
                </AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Tabs de Métricas */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <Shield className="h-4 w-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="ux">
              <Users className="h-4 w-4 mr-2" />
              UX
            </TabsTrigger>
            <TabsTrigger value="engagement">
              <MessageSquare className="h-4 w-4 mr-2" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="monetization">
              <DollarSign className="h-4 w-4 mr-2" />
              Monetización
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Age Verification Rate"
                metric={data.compliance.ageVerification}
                icon={Shield}
              />
              <MetricCard
                title="Signup → First Message"
                metric={data.userExperience.signupToMessage}
                icon={Target}
              />
              <MetricCard
                title="Avg Messages/Session"
                metric={data.engagement.avgMessagesPerSession}
                icon={MessageSquare}
              />
              <MetricCard
                title="Free → Plus Conversion"
                metric={data.monetization.conversion}
                icon={DollarSign}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Estado General del Sistema</CardTitle>
                <CardDescription>Vista rápida de todas las métricas clave</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Compliance & Safety
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Age Verification:</span>
                        <Badge className={statusColors[data.compliance.ageVerification.status]}>
                          {data.compliance.ageVerification.rate}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>NSFW Consent:</span>
                        <Badge className={statusColors[data.compliance.nsfwConsent.status]}>
                          {data.compliance.nsfwConsent.rate}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Moderation False Positives:</span>
                        <Badge className={statusColors[data.compliance.moderation.status]}>
                          {data.compliance.moderation.falsePositiveRate}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      User Experience
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Time to First Agent:</span>
                        <Badge className={statusColors[data.userExperience.timeToFirstAgent.status]}>
                          {data.userExperience.timeToFirstAgent.current} min
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>D7 Retention:</span>
                        <Badge className={statusColors[data.userExperience.d7Retention.status]}>
                          {data.userExperience.d7Retention.current}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Mobile Bounce:</span>
                        <Badge className={statusColors[data.userExperience.mobileBounce.status]}>
                          {data.userExperience.mobileBounce.current}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Engagement
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Avg Messages/Session:</span>
                        <Badge className={statusColors[data.engagement.avgMessagesPerSession.status]}>
                          {data.engagement.avgMessagesPerSession.current}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Sessions/Week:</span>
                        <Badge className={statusColors[data.engagement.sessionsPerWeek.status]}>
                          {data.engagement.sessionsPerWeek.current}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Command Palette Discovery:</span>
                        <Badge className={statusColors[data.engagement.commandPaletteDiscovery.status]}>
                          {data.engagement.commandPaletteDiscovery.current}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Monetization
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>MRR:</span>
                        <Badge className={statusColors[data.monetization.mrr.status]}>
                          ${data.monetization.mrr.current}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Churn Rate:</span>
                        <Badge className={statusColors[data.monetization.churn.status]}>
                          {data.monetization.churn.current}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Upgrade Modal CTR:</span>
                        <Badge className={statusColors[data.monetization.upgradeModalCtr.status]}>
                          {data.monetization.upgradeModalCtr.current}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMPLIANCE */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard
                title="Age Verification Rate"
                metric={data.compliance.ageVerification}
                icon={Shield}
              />
              <MetricCard
                title="NSFW Consent Rate"
                metric={data.compliance.nsfwConsent}
                icon={Shield}
              />
              <MetricCard
                title="Moderation False Positives"
                metric={data.compliance.moderation}
                icon={Shield}
              />
              <MetricCard
                title="PII Redaction Rate"
                metric={data.compliance.piiProtection}
                icon={Shield}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Compliance & Safety - Detalles</CardTitle>
                <CardDescription>Estadísticas detalladas de cumplimiento y seguridad</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Age Verification</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Signups</p>
                        <p className="text-2xl font-bold">{data.compliance.ageVerification.total}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold text-green-500">
                          {data.compliance.ageVerification.completed}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Failed</p>
                        <p className="text-2xl font-bold text-red-500">
                          {data.compliance.ageVerification.failed}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Content Moderation</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Moderated</p>
                        <p className="text-2xl font-bold">{data.compliance.moderation.total}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">False Positives</p>
                        <p className="text-2xl font-bold text-orange-500">
                          {data.compliance.moderation.falsePositives}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* USER EXPERIENCE */}
          <TabsContent value="ux" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard
                title="Time to First Agent"
                metric={data.userExperience.timeToFirstAgent}
                icon={Clock}
              />
              <MetricCard
                title="Signup → First Message"
                metric={data.userExperience.signupToMessage}
                icon={Target}
              />
              <MetricCard
                title="Mobile Bounce Rate"
                metric={data.userExperience.mobileBounce}
                icon={TrendingUp}
              />
              <MetricCard title="D7 Retention" metric={data.userExperience.d7Retention} icon={Users} />
            </div>
          </TabsContent>

          {/* ENGAGEMENT */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Avg Messages per Session"
                metric={data.engagement.avgMessagesPerSession}
                icon={MessageSquare}
              />
              <MetricCard
                title="Sessions per Week"
                metric={data.engagement.sessionsPerWeek}
                icon={Activity}
              />
              <MetricCard
                title="Command Palette Discovery"
                metric={data.engagement.commandPaletteDiscovery}
                icon={Target}
              />
            </div>
          </TabsContent>

          {/* MONETIZATION */}
          <TabsContent value="monetization" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Free → Plus Conversion"
                metric={data.monetization.conversion}
                icon={TrendingUp}
              />
              <MetricCard
                title="Monthly Recurring Revenue"
                metric={data.monetization.mrr}
                icon={DollarSign}
              />
              <MetricCard title="Churn Rate" metric={data.monetization.churn} icon={AlertTriangle} />
              <MetricCard
                title="Upgrade Modal CTR"
                metric={data.monetization.upgradeModalCtr}
                icon={Target}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Estado actual de monetización</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">MRR Progress</span>
                      <span className="text-sm text-muted-foreground">
                        ${data.monetization.mrr.current.toLocaleString()} / $
                        {data.monetization.mrr.targetMax?.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            (data.monetization.mrr.current / (data.monetization.mrr.targetMax || 48000)) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
