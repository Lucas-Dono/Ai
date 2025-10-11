"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Bot,
  Activity,
  Database,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Shield,
  Eye
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AdministracionPage() {
  // Mock data para el panel de administración
  const stats = {
    totalUsers: 124,
    activeUsers: 87,
    totalAgents: 342,
    activeAgents: 298,
    totalMessages: 15420,
    systemHealth: "healthy",
  };

  const recentUsers = [
    { id: 1, name: "Ana García", email: "ana@ejemplo.com", plan: "Pro", status: "active" },
    { id: 2, name: "Carlos López", email: "carlos@ejemplo.com", plan: "Free", status: "active" },
    { id: 3, name: "María Rodríguez", email: "maria@ejemplo.com", plan: "Pro", status: "inactive" },
    { id: 4, name: "Juan Martínez", email: "juan@ejemplo.com", plan: "Free", status: "active" },
  ];

  const recentLogs = [
    { id: 1, type: "success", message: "Usuario ana@ejemplo.com creó nuevo agente 'Asistente Personal'", timestamp: "Hace 5 min" },
    { id: 2, type: "warning", message: "Límite de mensajes alcanzado para usuario carlos@ejemplo.com", timestamp: "Hace 12 min" },
    { id: 3, type: "error", message: "Error en API de Gemini para agente ID: ag_123", timestamp: "Hace 20 min" },
    { id: 4, type: "success", message: "Nuevo usuario registrado: maria@ejemplo.com", timestamp: "Hace 35 min" },
  ];

  const topAgents = [
    { id: 1, name: "Asistente Virtual Pro", owner: "Ana García", messages: 1245, type: "assistant" },
    { id: 2, name: "Compañero Emma", owner: "Carlos López", messages: 892, type: "companion" },
    { id: 3, name: "Bot de Productividad", owner: "María Rodríguez", messages: 654, type: "assistant" },
  ];

  // Datos para gráficos
  const messagesByDay = [
    { day: "Lun", messages: 420 },
    { day: "Mar", messages: 680 },
    { day: "Mié", messages: 550 },
    { day: "Jue", messages: 780 },
    { day: "Vie", messages: 920 },
    { day: "Sáb", messages: 640 },
    { day: "Dom", messages: 380 },
  ];

  const agentsByType = [
    { name: "Compañeros", value: 156, color: "#F6B922" },
    { name: "Asistentes", value: 186, color: "#122841" },
  ];

  const userGrowth = [
    { month: "Ene", users: 45 },
    { month: "Feb", users: 62 },
    { month: "Mar", users: 78 },
    { month: "Abr", users: 95 },
    { month: "May", users: 110 },
    { month: "Jun", users: 124 },
  ];

  const getLogIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" />
            Panel de Administración
          </h1>
          <p className="text-xl text-muted-foreground">
            Monitoreo y gestión del sistema
          </p>
        </div>
        <Button>
          <BarChart3 className="h-4 w-4 mr-2" />
          Exportar Reportes
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              {stats.activeUsers} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Agentes Creados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAgents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeAgents} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Mensajes Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={stats.systemHealth === "healthy" ? "default" : "destructive"} className="text-sm">
              {stats.systemHealth === "healthy" ? "Saludable" : "Problemas"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Todos los servicios operativos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuarios Recientes
            </CardTitle>
            <CardDescription>
              Últimos usuarios registrados en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.plan === "Pro" ? "default" : "outline"}>
                      {user.plan}
                    </Badge>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Agents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Agentes Populares
            </CardTitle>
            <CardDescription>
              Por número de interacciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topAgents.map((agent, idx) => (
                <div key={agent.id} className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-muted-foreground">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm truncate">{agent.name}</div>
                    <div className="text-xs text-muted-foreground">{agent.owner}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {agent.messages}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Logs */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Registro de Actividad del Sistema
            </CardTitle>
            <CardDescription>
              Eventos y alertas recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                >
                  <div className="mt-0.5">{getLogIcon(log.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm">{log.message}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {log.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Charts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Mensajes por Día
            </CardTitle>
            <CardDescription>
              Actividad de conversaciones en la última semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={messagesByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="messages" fill="#122841" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Agentes por Tipo
            </CardTitle>
            <CardDescription>
              Distribución de tipos de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={agentsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {agentsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Crecimiento de Usuarios
            </CardTitle>
            <CardDescription>
              Evolución de usuarios en los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#F6B922" strokeWidth={3} dot={{ fill: "#F6B922", r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
