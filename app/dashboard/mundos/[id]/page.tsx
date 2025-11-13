"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { generateGradient, getInitials } from "@/lib/utils";
import { ExportConversationButton } from "@/components/export-conversation-button";
import { VisualNovelViewer } from "@/components/worlds/visual-novel/VisualNovelViewer";
import { useTrackInteraction } from "@/hooks/use-track-interaction";
import { useSession } from "next-auth/react";

interface Message {
  id: string;
  role: string;
  content: string;
  agentId?: string;
  metadata?: {
    agentName?: string;
    emotions?: string[];
  };
}

interface Agent {
  id: string;
  name: string;
  kind: string;
}

interface World {
  id: string;
  name: string;
  description?: string;
  scenario?: string;
  storyMode?: boolean;
  simulationState?: any;
  worldAgents: { agent: Agent }[];
  messages: Message[];
}

export default function WorldPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [world, setWorld] = useState<World | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<'RUNNING' | 'PAUSED' | 'STOPPED'>('STOPPED');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-tracking de interacción para el sistema de recomendaciones
  const { incrementMessageCount } = useTrackInteraction({
    userId: session?.user?.id || null,
    itemType: "world",
    itemId: params.id as string,
    interactionType: "chat",
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchWorld = async () => {
      try {
        const res = await fetch(`/api/worlds/${params.id}`);
        if (!res.ok) throw new Error("World not found");
        const data = await res.json();

        const worldData = data.world || data;
        setWorld(worldData);
        setMessages(worldData.messages || []);

        // Detectar estado de simulación
        // Si isRunning es true (desde el engine), el estado es RUNNING
        // Sino, usar el status del mundo
        const actualStatus = worldData.isRunning
          ? 'RUNNING'
          : (worldData.status || worldData.simulationState?.status || 'STOPPED');

        setSimulationStatus(actualStatus);

        console.log('World data loaded:', {
          id: worldData.id,
          name: worldData.name,
          status: worldData.status,
          isRunning: worldData.isRunning,
          actualStatus,
          agentCount: worldData.worldAgents?.length || worldData.agents?.length || 0,
        });
      } catch (error) {
        console.error(error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchWorld();
  }, [params.id, router]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    // Incrementar contador de mensajes para tracking
    incrementMessageCount();

    try {
      const res = await fetch(`/api/worlds/${params.id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();

      // Añadir las respuestas de cada agente
      for (const response of data.responses) {
        setMessages((prev) => [...prev, response.message]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const getAgentColor = (agentName: string) => {
    return generateGradient(agentName);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!world) return null;

  // Detectar si es un mundo con Visual Novel View
  // Academia Sakura o mundos con storyMode habilitado
  const isVisualNovelWorld =
    world.name.toLowerCase().includes('academia') ||
    world.name.toLowerCase().includes('sakura') ||
    world.storyMode === true;

  // Si es Visual Novel, renderizar el viewer especial
  if (isVisualNovelWorld) {
    return (
      <VisualNovelViewer
        worldId={world.id}
        worldName={world.name}
        worldDescription={world.description}
        scenario={world.scenario}
        status={simulationStatus}
        onStatusChange={setSimulationStatus}
      />
    );
  }

  // Para el chat normal, verificar que worldAgents exista
  const agents = world.worldAgents?.map((wa) => wa.agent) || [];

  // Si no, renderizar el chat normal
  return (
    <div className="flex h-screen">
      {/* Sidebar - Agentes del Mundo */}
      <div className="w-80 border-r border-border bg-card/30 p-6 space-y-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="mb-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{world.name}</h2>
              <p className="text-sm text-muted-foreground">
                {agents.length} {agents.length === 1 ? "agente" : "agentes"}
              </p>
            </div>
          </div>

          {world.description && (
            <p className="text-sm text-muted-foreground mb-4">{world.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-muted-foreground mb-3">
            Agentes en este mundo
          </div>
          {agents.map((agent) => (
            <Card key={agent.id} className="p-3">
              <div className="flex items-center gap-3">
                <Avatar
                  className="h-10 w-10 border-2"
                  style={{ background: getAgentColor(agent.name) }}
                >
                  <AvatarFallback className="text-white text-sm font-bold bg-transparent">
                    {getInitials(agent.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{agent.name}</div>
                  <Badge variant={agent.kind === "companion" ? "secondary" : "default"} className="text-xs">
                    {agent.kind === "companion" ? "Compañero" : "Asistente"}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-background to-muted/20">
        <div className="border-b border-border bg-card/50 backdrop-blur-sm px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Mundo: {world.name}</h1>
            <p className="text-sm text-muted-foreground">Conversación grupal</p>
          </div>
          <ExportConversationButton messages={messages} worldName={world.name} />
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <AnimatePresence>
            {messages.map((message, idx) => {
              const isUser = message.role === "user";
              const agentName = message.metadata?.agentName || "Agente";
              const agentColor = isUser ? undefined : getAgentColor(agentName);

              return (
                <motion.div
                  key={message.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className={!isUser ? "border-2" : ""} style={!isUser ? { borderColor: agentColor } : undefined}>
                    <AvatarFallback
                      className={!isUser ? "text-white bg-transparent" : "bg-muted"}
                      style={!isUser ? { background: agentColor } : undefined}
                    >
                      {isUser ? "U" : getInitials(agentName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`flex-1 max-w-2xl ${isUser ? "text-right" : ""}`}>
                    {!isUser && (
                      <div className="text-xs font-semibold mb-1 text-muted-foreground">
                        {agentName}
                      </div>
                    )}
                    <div
                      className={`inline-block rounded-2xl px-6 py-3 ${
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border"
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.metadata?.emotions && message.metadata.emotions.length > 0 && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {message.metadata.emotions.map((emotion: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {emotion}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border bg-card/50 backdrop-blur-sm p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Enviar mensaje al mundo..."
                className="flex-1"
                disabled={sending}
              />
              <Button onClick={handleSend} size="icon" disabled={sending}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
