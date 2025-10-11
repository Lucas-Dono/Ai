"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Heart, Briefcase, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { generateGradient, getInitials } from "@/lib/utils";

interface Message {
  role: "architect" | "user";
  content: string;
}

interface AgentDraft {
  name?: string;
  kind?: "companion" | "assistant";
  personality?: string;
  purpose?: string;
  tone?: string;
}

export default function ConstructorPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "architect",
      content: "¡Hola! Soy El Arquitecto, tu guía para crear inteligencias únicas. Empecemos con lo básico: ¿qué nombre te gustaría darle a tu nueva IA?",
    },
  ]);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState<AgentDraft>({});
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [newAgentId, setNewAgentId] = useState<string | null>(null);

  const steps = [
    { field: "name", prompt: "¡Perfecto! ¿Quieres crear un Compañero (IA emocional) o un Asistente (IA administrativa)?" },
    { field: "kind", prompt: (draft: AgentDraft) => `Excelente elección. Ahora, ¿cómo describirías la personalidad de ${draft.name}?` },
    { field: "personality", prompt: (draft: AgentDraft) => `Interesante. ¿Cuál será el propósito principal de ${draft.name}?` },
    { field: "purpose", prompt: (draft: AgentDraft) => `Perfecto. Por último, ¿qué tono de comunicación prefieres que use ${draft.name}? (formal, casual, amigable, profesional, etc.)` },
    { field: "tone", prompt: () => "¡Listo! Voy a compilar tu inteligencia..." },
  ];

  const createAgent = async (finalDraft: AgentDraft) => {
    setCreating(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalDraft.name,
          kind: finalDraft.kind,
          personality: finalDraft.personality,
          purpose: finalDraft.purpose,
          tone: finalDraft.tone,
        }),
      });

      if (!res.ok) throw new Error("Failed to create agent");

      const data = await res.json();
      setNewAgentId(data.id);

      setMessages((prev) => [
        ...prev,
        {
          role: "architect",
          content: `¡Tu inteligencia "${finalDraft.name}" ha sido creada exitosamente! Ahora puedes comenzar a interactuar con ella.`
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "architect",
          content: "Hubo un error al crear tu inteligencia. Por favor, intenta nuevamente."
        },
      ]);
    } finally {
      setCreating(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    // Actualizar draft según el paso
    const currentStep = steps[step];
    const newDraft = { ...draft };

    if (step === 0) {
      newDraft.name = input;
    } else if (step === 1) {
      const lower = input.toLowerCase();
      if (lower.includes("compañero") || lower.includes("emocional")) {
        newDraft.kind = "companion";
      } else if (lower.includes("asistente") || lower.includes("admin")) {
        newDraft.kind = "assistant";
      } else {
        newDraft.kind = "companion";
      }
    } else if (step === 2) {
      newDraft.personality = input;
    } else if (step === 3) {
      newDraft.purpose = input;
    } else if (step === 4) {
      newDraft.tone = input;
    }

    setDraft(newDraft);

    // Respuesta del arquitecto
    setTimeout(() => {
      if (step < steps.length - 1) {
        const nextStep = steps[step + 1];
        const promptText = typeof nextStep.prompt === "function"
          ? nextStep.prompt(newDraft)
          : nextStep.prompt;

        setMessages((prev) => [
          ...prev,
          { role: "architect", content: promptText },
        ]);
        setStep(step + 1);
      } else {
        // Último paso - crear el agente
        createAgent(newDraft);
      }
    }, 800);

    setInput("");
  };

  const isComplete = step >= steps.length && newAgentId;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Preview */}
      <div className="w-96 border-r border-border bg-card/30 p-6 space-y-6">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" disabled={creating}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-xl font-bold">Perfil en construcción</h2>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar
                className="h-20 w-20 border-2"
                style={{ background: draft.name ? generateGradient(draft.name) : "linear-gradient(135deg, #94a3b8, #64748b)" }}
              >
                <AvatarFallback className="text-white text-2xl font-bold bg-transparent">
                  {draft.name ? getInitials(draft.name) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="mb-2">
                  {draft.name || "Sin nombre"}
                </CardTitle>
                {draft.kind && (
                  <Badge variant={draft.kind === "companion" ? "secondary" : "default"}>
                    {draft.kind === "companion" ? (
                      <Heart className="h-3 w-3 mr-1" />
                    ) : (
                      <Briefcase className="h-3 w-3 mr-1" />
                    )}
                    {draft.kind === "companion" ? "Compañero" : "Asistente"}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {draft.personality && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">
                  Personalidad
                </div>
                <div className="text-sm">{draft.personality}</div>
              </div>
            )}

            {draft.purpose && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">
                  Propósito
                </div>
                <div className="text-sm">{draft.purpose}</div>
              </div>
            )}

            {draft.tone && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">
                  Tono
                </div>
                <div className="text-sm capitalize">{draft.tone}</div>
              </div>
            )}

            {!draft.name && (
              <CardDescription className="text-center py-8">
                Responde las preguntas del Arquitecto para crear tu IA
              </CardDescription>
            )}
          </CardContent>
        </Card>

        {creating && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="text-sm">Creando tu inteligencia...</div>
            </div>
          </Card>
        )}

        {isComplete && newAgentId && (
          <div className="space-y-2">
            <Button className="w-full" onClick={() => router.push(`/agentes/${newAgentId}`)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Abrir chat con {draft.name}
            </Button>
            <Link href="/dashboard" className="block">
              <Button variant="outline" className="w-full">
                Ir al Dashboard
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border bg-card/50 backdrop-blur-sm px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">El Arquitecto</h1>
              <p className="text-sm text-muted-foreground">
                Guía de creación de inteligencias
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <AnimatePresence>
            {messages.map((message, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className={message.role === "architect" ? "border-2 border-primary" : ""}>
                  <AvatarFallback
                    className={
                      message.role === "architect"
                        ? "bg-gradient-to-br from-primary to-secondary text-white"
                        : "bg-muted"
                    }
                  >
                    {message.role === "architect" ? <Sparkles className="h-5 w-5" /> : "U"}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`flex-1 max-w-2xl ${
                    message.role === "user" ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`inline-block rounded-2xl px-6 py-3 ${
                      message.role === "architect"
                        ? "bg-card border border-border"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!isComplete && (
          <div className="border-t border-border bg-card/50 backdrop-blur-sm p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !creating && handleSend()}
                  placeholder="Escribe tu respuesta..."
                  className="flex-1"
                  disabled={creating}
                />
                <Button onClick={handleSend} size="icon" className="shrink-0" disabled={creating}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
