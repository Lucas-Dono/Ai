"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, Heart, Briefcase, Loader2 } from "lucide-react";
import Link from "next/link";
import { generateGradient, getInitials } from "@/lib/utils";
import { ExportConversationButton } from "@/components/export-conversation-button";

interface Message {
  id: string;
  role: string;
  content: string;
  metadata?: {
    emotions?: string[];
    relationLevel?: string;
  };
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
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [relationLevel, setRelationLevel] = useState("Relación neutral");
  const [relationState, setRelationState] = useState({ trust: 0.5, affinity: 0.5, respect: 0.5 });
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

    try {
      const res = await fetch(`/api/agents/${params.id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setEmotions(data.emotions || []);
      setRelationLevel(data.relationLevel || "Relación neutral");
      setRelationState(data.state || { trust: 0.5, affinity: 0.5, respect: 0.5 });
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
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
          <Card className="p-4">
            <div className="text-sm font-semibold text-muted-foreground mb-2">
              Estado Emocional
            </div>
            <div className="flex flex-wrap gap-2">
              {emotions.length > 0 ? (
                emotions.map((emotion, idx) => (
                  <Badge key={idx} variant="outline">
                    {emotion}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline">Neutral</Badge>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm font-semibold text-muted-foreground mb-3">
              Nivel de Relación
            </div>
            <div className="text-sm mb-2">{relationLevel}</div>
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
              <motion.div
                key={message.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className={message.role === "assistant" ? "border-2 border-primary" : ""}>
                  <AvatarFallback
                    className={
                      message.role === "assistant"
                        ? "bg-gradient-to-br from-primary to-secondary text-white"
                        : "bg-muted"
                    }
                    style={
                      message.role === "assistant"
                        ? { background: generateGradient(agent.name) }
                        : undefined
                    }
                  >
                    {message.role === "assistant" ? getInitials(agent.name) : "U"}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex-1 max-w-2xl ${message.role === "user" ? "text-right" : ""}`}>
                  <div
                    className={`inline-block rounded-2xl px-6 py-3 ${
                      message.role === "assistant"
                        ? "bg-card border border-border"
                        : "bg-primary text-primary-foreground"
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
            ))}
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
                placeholder="Escribe tu mensaje..."
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
