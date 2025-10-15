"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { WelcomeBanner } from "@/components/onboarding/WelcomeBanner";
import { motion } from "framer-motion";
import { Heart, Briefcase, MessageCircle, TrendingUp, Sparkles, Loader2, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { generateGradient, getInitials } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  kind: string;
  description?: string;
}

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents");
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleDelete = async (agentId: string, agentName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar a "${agentName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setDeleting(agentId);
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Actualizar la lista eliminando el agente
        setAgents(agents.filter(a => a.id !== agentId));
      } else {
        const error = await res.json();
        alert(error.error || "Error al eliminar la IA");
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      alert("Error al eliminar la IA");
    } finally {
      setDeleting(null);
    }
  };
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">
          Bienvenido de vuelta
        </h1>
        <p className="text-xl text-muted-foreground">
          Gestiona tus inteligencias y mundos virtuales
        </p>
      </div>

      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de IAs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +2 este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Interacciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">612</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de conversaciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mundos activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ecosistemas creados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tareas completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">212</div>
            <p className="text-xs text-muted-foreground mt-1">
              Por asistentes administrativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agents Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Tus Inteligencias</h2>
          <Link href="/constructor">
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Crear nueva IA
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : agents.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-muted-foreground mb-4">No tienes IAs creadas aún</p>
              <Link href="/constructor">
                <Button>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Crear tu primera IA
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {agents.map((agent, idx) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all border-2 hover:border-primary/50 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar
                          className="h-16 w-16 border-2"
                          style={{ background: generateGradient(agent.name) }}
                        >
                          <AvatarFallback className="text-white text-xl font-bold bg-transparent">
                            {getInitials(agent.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">{agent.name}</CardTitle>
                            <Badge variant={agent.kind === "companion" ? "secondary" : "default"}>
                              {agent.kind === "companion" ? (
                                <Heart className="h-3 w-3 mr-1" />
                              ) : (
                                <Briefcase className="h-3 w-3 mr-1" />
                              )}
                              {agent.kind === "companion" ? "Compañero" : "Asistente"}
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {agent.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Estado</span>
                        <Badge variant="outline" className="text-xs">Activo</Badge>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Link href={`/agentes/${agent.id}`} className="flex-1">
                          <Button className="w-full" variant="outline">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Abrir chat
                          </Button>
                        </Link>
                        <Link href={`/agentes/${agent.id}/edit`}>
                          <Button variant="outline" size="icon" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(agent.id, agent.name);
                          }}
                          disabled={deleting === agent.id}
                          title="Eliminar"
                        >
                          {deleting === agent.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Create New Card */}
              <Link href="/constructor">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: agents.length * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all border-2 border-dashed hover:border-primary cursor-pointer h-full flex items-center justify-center min-h-[300px]">
                    <CardContent className="text-center py-12">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="mb-2">Crear nueva IA</CardTitle>
                      <CardDescription>
                        Diseña un Compañero emocional o un Asistente administrativo
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
