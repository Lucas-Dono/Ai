"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  Network,
  Plus,
  Users,
  MessageCircle,
  Sparkles,
  Loader2,
  Globe
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateGradient, getInitials } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Agent {
  id: string;
  name: string;
  kind: string;
}

interface World {
  id: string;
  name: string;
  description?: string;
  worldAgents: { agent: Agent }[];
  _count?: {
    messages: number;
  };
}

export default function MundosPage() {
  const router = useRouter();
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // New world form
  const [newWorldName, setNewWorldName] = useState("");
  const [newWorldDescription, setNewWorldDescription] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);

  useEffect(() => {
    fetchWorlds();
    fetchAgents();
  }, []);

  const fetchWorlds = async () => {
    try {
      const res = await fetch("/api/worlds");
      if (res.ok) {
        const data = await res.json();
        setWorlds(data);
      }
    } catch (error) {
      console.error("Error fetching worlds:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents");
      if (res.ok) {
        const data = await res.json();
        setAvailableAgents(data);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const handleCreateWorld = async () => {
    if (!newWorldName.trim() || selectedAgents.length === 0) return;

    setCreating(true);
    try {
      const res = await fetch("/api/worlds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWorldName,
          description: newWorldDescription,
          agentIds: selectedAgents,
        }),
      });

      if (res.ok) {
        const newWorld = await res.json();
        setWorlds([...worlds, newWorld]);
        setDialogOpen(false);
        setNewWorldName("");
        setNewWorldDescription("");
        setSelectedAgents([]);
      }
    } catch (error) {
      console.error("Error creating world:", error);
    } finally {
      setCreating(false);
    }
  };

  const toggleAgent = (agentId: string) => {
    if (selectedAgents.includes(agentId)) {
      setSelectedAgents(selectedAgents.filter(id => id !== agentId));
    } else {
      setSelectedAgents([...selectedAgents, agentId]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Network className="h-10 w-10 text-primary" />
            Mundos Virtuales
          </h1>
          <p className="text-xl text-muted-foreground">
            Espacios donde múltiples IAs conviven e interactúan
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Crear Mundo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Mundo</DialogTitle>
              <DialogDescription>
                Un mundo es un espacio compartido donde múltiples IAs pueden interactuar entre sí
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nombre del Mundo</label>
                <Input
                  value={newWorldName}
                  onChange={(e) => setNewWorldName(e.target.value)}
                  placeholder="Ej: Oficina Virtual, Familia Digital..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Descripción (opcional)</label>
                <Textarea
                  value={newWorldDescription}
                  onChange={(e) => setNewWorldDescription(e.target.value)}
                  placeholder="Describe el propósito de este mundo..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">
                  Selecciona las IAs que habitarán este mundo (mínimo 1)
                </label>
                {availableAgents.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">
                      No tienes IAs creadas aún
                    </p>
                    <Link href="/constructor">
                      <Button variant="outline" size="sm">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Crear tu primera IA
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                    {availableAgents.map((agent) => (
                      <div
                        key={agent.id}
                        onClick={() => toggleAgent(agent.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedAgents.includes(agent.id)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Avatar
                          className="h-10 w-10 border-2"
                          style={{ background: generateGradient(agent.name) }}
                        >
                          <AvatarFallback className="text-white text-sm font-bold bg-transparent">
                            {getInitials(agent.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{agent.name}</div>
                          <Badge variant={agent.kind === "companion" ? "secondary" : "default"} className="text-xs">
                            {agent.kind === "companion" ? "Compañero" : "Asistente"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateWorld}
                  disabled={!newWorldName.trim() || selectedAgents.length === 0 || creating}
                  className="flex-1"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Crear Mundo
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Worlds Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : worlds.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No tienes mundos creados aún</p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear tu primer mundo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Mundo</DialogTitle>
                  <DialogDescription>
                    Un mundo es un espacio compartido donde múltiples IAs pueden interactuar entre sí
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nombre del Mundo</label>
                    <Input
                      value={newWorldName}
                      onChange={(e) => setNewWorldName(e.target.value)}
                      placeholder="Ej: Oficina Virtual, Familia Digital..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Descripción (opcional)</label>
                    <Textarea
                      value={newWorldDescription}
                      onChange={(e) => setNewWorldDescription(e.target.value)}
                      placeholder="Describe el propósito de este mundo..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Selecciona las IAs que habitarán este mundo (mínimo 1)
                    </label>
                    {availableAgents.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">
                          No tienes IAs creadas aún
                        </p>
                        <Link href="/constructor">
                          <Button variant="outline" size="sm">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Crear tu primera IA
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                        {availableAgents.map((agent) => (
                          <div
                            key={agent.id}
                            onClick={() => toggleAgent(agent.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedAgents.includes(agent.id)
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <Avatar
                              className="h-10 w-10 border-2"
                              style={{ background: generateGradient(agent.name) }}
                            >
                              <AvatarFallback className="text-white text-sm font-bold bg-transparent">
                                {getInitials(agent.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{agent.name}</div>
                              <Badge variant={agent.kind === "companion" ? "secondary" : "default"} className="text-xs">
                                {agent.kind === "companion" ? "Compañero" : "Asistente"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleCreateWorld}
                      disabled={!newWorldName.trim() || selectedAgents.length === 0 || creating}
                      className="flex-1"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Crear Mundo
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          worlds.map((world, idx) => (
            <motion.div
              key={world.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link href={`/mundos/${world.id}`}>
                <Card className="hover:shadow-xl transition-all border-2 hover:border-primary/50 cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Network className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl mb-2">{world.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {world.description || "Mundo virtual sin descripción"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {world.worldAgents.length} {world.worldAgents.length === 1 ? "agente" : "agentes"}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {world._count?.messages || 0} mensajes
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {world.worldAgents.slice(0, 3).map(({ agent }) => (
                        <Badge key={agent.id} variant="outline" className="text-xs">
                          {agent.name}
                        </Badge>
                      ))}
                      {world.worldAgents.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{world.worldAgents.length - 3}
                        </Badge>
                      )}
                    </div>

                    <Button className="w-full mt-4" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Entrar al mundo
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
