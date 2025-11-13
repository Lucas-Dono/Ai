"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Server,
  Database,
  Cloud,
  Zap,
  Globe,
  MessageSquare,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ServiceStatus = "operational" | "degraded" | "partial_outage" | "major_outage";

interface Service {
  name: string;
  status: ServiceStatus;
  icon: any;
  uptime: string;
  responseTime?: string;
  lastChecked: string;
}

interface Incident {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "minor" | "major" | "critical";
  timestamp: string;
  updates: {
    time: string;
    message: string;
  }[];
}

export default function StatusPage() {
  const t = useTranslations("status");
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos - En producción, esto vendría de una API real
    const mockServices: Service[] = [
      {
        name: t("services.webApp"),
        status: "operational",
        icon: Globe,
        uptime: "99.98%",
        responseTime: "145ms",
        lastChecked: new Date().toISOString(),
      },
      {
        name: t("services.api"),
        status: "operational",
        icon: Server,
        uptime: "99.95%",
        responseTime: "89ms",
        lastChecked: new Date().toISOString(),
      },
      {
        name: t("services.database"),
        status: "operational",
        icon: Database,
        uptime: "99.99%",
        responseTime: "12ms",
        lastChecked: new Date().toISOString(),
      },
      {
        name: t("services.aiModels"),
        status: "operational",
        icon: MessageSquare,
        uptime: "99.92%",
        responseTime: "2.3s",
        lastChecked: new Date().toISOString(),
      },
      {
        name: t("services.imageGeneration"),
        status: "operational",
        icon: ImageIcon,
        uptime: "99.87%",
        responseTime: "8.5s",
        lastChecked: new Date().toISOString(),
      },
      {
        name: t("services.cdn"),
        status: "operational",
        icon: Cloud,
        uptime: "99.99%",
        responseTime: "34ms",
        lastChecked: new Date().toISOString(),
      },
    ];

    const mockIncidents: Incident[] = [
      // Vacío si no hay incidentes activos
    ];

    setServices(mockServices);
    setIncidents(mockIncidents);
    setLoading(false);
  }, [t]);

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case "operational":
        return "text-green-500";
      case "degraded":
        return "text-yellow-500";
      case "partial_outage":
        return "text-orange-500";
      case "major_outage":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "partial_outage":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "major_outage":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">{t("statusLabels.operational")}</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">{t("statusLabels.degraded")}</Badge>;
      case "partial_outage":
        return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20">{t("statusLabels.partialOutage")}</Badge>;
      case "major_outage":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">{t("statusLabels.majorOutage")}</Badge>;
      default:
        return <Badge variant="secondary">{t("statusLabels.unknown")}</Badge>;
    }
  };

  const overallStatus = services.every(s => s.status === "operational")
    ? "operational"
    : services.some(s => s.status === "major_outage")
    ? "major_outage"
    : services.some(s => s.status === "partial_outage")
    ? "partial_outage"
    : "degraded";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← {t("backToHome")}
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Overall Status */}
        <Card className={overallStatus === "operational" ? "border-green-500/50" : "border-orange-500/50"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(overallStatus)}
                <div>
                  <CardTitle>
                    {overallStatus === "operational"
                      ? t("overall.allSystemsOperational")
                      : t("overall.systemsExperiencingIssues")
                    }
                  </CardTitle>
                  <CardDescription>
                    {t("overall.lastUpdated")}: {new Date().toLocaleString()}
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge(overallStatus)}
            </div>
          </CardHeader>
        </Card>

        {/* Active Incidents */}
        {incidents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              {t("incidents.title")}
            </h2>
            <div className="space-y-3">
              {incidents.map((incident) => (
                <Card key={incident.id} className="border-orange-500/50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{incident.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {new Date(incident.timestamp).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge variant={incident.severity === "critical" ? "destructive" : "secondary"}>
                        {incident.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {incident.updates.map((update, index) => (
                        <div key={index} className="flex gap-3 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">{new Date(update.time).toLocaleString()}</p>
                            <p className="text-muted-foreground">{update.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Services Status */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Server className="h-6 w-6" />
            {t("services.title")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-2xl bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-base">{service.name}</CardTitle>
                      </div>
                      {getStatusIcon(service.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("services.uptime")}</span>
                      <span className="font-medium">{service.uptime}</span>
                    </div>
                    {service.responseTime && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("services.responseTime")}</span>
                        <span className="font-medium">{service.responseTime}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("services.status")}</span>
                      {getStatusBadge(service.status)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Uptime History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {t("uptime.title")}
            </CardTitle>
            <CardDescription>{t("uptime.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-500">99.96%</p>
                  <p className="text-sm text-muted-foreground">{t("uptime.last30Days")}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500">99.94%</p>
                  <p className="text-sm text-muted-foreground">{t("uptime.last90Days")}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500">99.92%</p>
                  <p className="text-sm text-muted-foreground">{t("uptime.lastYear")}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscribe to Updates */}
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>{t("subscribe.title")}</CardTitle>
            <CardDescription>{t("subscribe.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/legal/contacto">
              <Button className="w-full sm:w-auto">
                {t("subscribe.button")}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>{t("footer.updateFrequency")}</p>
          <p className="mt-2">
            {t("footer.questions")}{" "}
            <Link href="/legal/contacto" className="text-primary hover:underline">
              {t("footer.contactUs")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
