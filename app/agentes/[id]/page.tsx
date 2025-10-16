"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Briefcase, Loader2 } from "lucide-react";
import Link from "next/link";
import { generateGradient, getInitials } from "@/lib/utils";
import { ExportConversationButton } from "@/components/export-conversation-button";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageBubble } from "@/components/chat/MessageBubble";

interface Message {
  id: string;
  role: string;
  content: string;
  metadata?: any;
}

interface Agent {
  id: string;
  name: string;
  kind: string;
  description?: string;
  messagesAsAgent: Message[];
}

export default function AgentChatPage() {
  const params = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [emotions, setEmotions] = useState<any>(null);
  const [relationLevel, setRelationLevel] = useState("Relación neutral");
  const [relationState, setRelationState] = useState({ trust: 0.5, affinity: 0.5, respect: 0.5 });
  const [relationshipStage, setRelationshipStage] = useState<string>("stranger");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const res = await fetch(`/api/agents/${params.id}`);
        if (!res.ok) throw new Error("Agent not found");
        const data = await res.json();
        setAgent(data);
        setMessages(data.messagesAsAgent || []);
      } catch (error) {
        console.error(error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [params.id, router]);

  const handleSendMessage = async (
    content: string,
    type: "text" | "audio" | "gif" | "sticker" = "text",
    metadata?: any
  ) => {
    if (!content.trim() || sending) return;

    // Mensaje temporal para el usuario
    const tempMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      metadata: {
        messageType: type,
        ...metadata,
      },
    };

    setMessages((prev) => [...prev, tempMessage]);
    setSending(true);

    try {
      const res = await fetch(`/api/agents/${params.id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          messageType: type,
          metadata,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();

      // Reemplazar mensaje temporal con el real
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempMessage.id);
        return [...filtered, data.message];
      });

      // Actualizar estados emocionales
      setEmotions(data.emotions || null);
      setRelationLevel(data.relationLevel || "Relación neutral");
      setRelationState(data.state || { trust: 0.5, affinity: 0.5, respect: 0.5 });

      // Actualizar stage de relación si existe
      if (data.relationship) {
        setRelationshipStage(data.relationship.stage);
      }
    } catch (error) {
      console.error(error);
      // Remover mensaje temporal en caso de error
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    } finally {
      setSending(false);
    }
  };

  const handleSendAudio = async (audioBlob: Blob) => {
    // TODO: Implementar transcripción con Whisper
    console.log("Audio blob:", audioBlob);
    // Por ahora, placeholder
    handleSendMessage("[Mensaje de voz - transcripción pendiente]", "audio", {
      duration: 0,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) return null;

  return (
    <div className="flex h-screen">
      {/* Sidebar - Info del Agente */}
      <div className="w-80 border-r border-border bg-card/30 p-6 space-y-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="mb-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div className="text-center">
          <Avatar
            className="h-24 w-24 mx-auto mb-4 border-4 border-border"
            style={{ background: generateGradient(agent.name) }}
          >
            <AvatarFallback className="text-white text-3xl font-bold bg-transparent">
              {getInitials(agent.name)}
            </AvatarFallback>
          </Avatar>

          <h2 className="text-2xl font-bold mb-2">{agent.name}</h2>

          <Badge variant={agent.kind === "companion" ? "secondary" : "default"} className="mb-4">
            {agent.kind === "companion" ? (
              <Heart className="h-3 w-3 mr-1" />
            ) : (
              <Briefcase className="h-3 w-3 mr-1" />
            )}
            {agent.kind === "companion" ? "Compañero" : "Asistente"}
          </Badge>

          {agent.description && (
            <p className="text-sm text-muted-foreground">{agent.description}</p>
          )}
        </div>

        <div className="space-y-4">
          {/* Estado Emocional Mejorado */}
          <Card className="p-4">
            <div className="text-sm font-semibold text-muted-foreground mb-2">
              Estado Emocional
            </div>
            <div className="flex flex-wrap gap-2">
              {emotions?.dominant ? (
                emotions.dominant.map((emotion: string, idx: number) => (
                  <Badge key={idx} variant="outline">
                    {emotion}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline">Neutral</Badge>
              )}
            </div>
            {emotions?.mood && (
              <div className="mt-2 text-xs text-muted-foreground">
                Mood: {emotions.mood}
              </div>
            )}
          </Card>

          {/* Nivel de Relación */}
          <Card className="p-4">
            <div className="text-sm font-semibold text-muted-foreground mb-3">
              Nivel de Relación
            </div>
            <div className="text-sm mb-2">{relationLevel}</div>

            {/* Stage de relación */}
            <div className="mb-3">
              <Badge variant="secondary" className="text-xs">
                {relationshipStage === "stranger"
                  ? "🆕 Desconocido"
                  : relationshipStage === "acquaintance"
                  ? "👋 Conocido"
                  : relationshipStage === "friend"
                  ? "🤝 Amigo"
                  : relationshipStage === "close"
                  ? "💕 Cercano"
                  : "❤️ Íntimo"}
              </Badge>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Confianza</span>
                  <span>{Math.round(relationState.trust * 100)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${relationState.trust * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Afinidad</span>
                  <span>{Math.round(relationState.affinity * 100)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary"
                    style={{ width: `${relationState.affinity * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Respeto</span>
                  <span>{Math.round(relationState.respect * 100)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success"
                    style={{ width: `${relationState.respect * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border bg-card/50 backdrop-blur-sm px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Chat con {agent.name}</h1>
          <ExportConversationButton messages={messages} agentName={agent.name} />
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <AnimatePresence>
            {messages.map((message, idx) => (
              <MessageBubble
                key={message.id || idx}
                message={message as any}
                agentName={agent.name}
              />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Mejorado */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onSendAudio={handleSendAudio}
          disabled={sending}
          placeholder="Escribe tu mensaje..."
        />
      </div>
    </div>
  );
}
