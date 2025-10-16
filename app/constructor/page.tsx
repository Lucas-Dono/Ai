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
  // Behavior system configuration
  nsfwMode?: boolean;
  allowDevelopTraumas?: boolean;
  initialBehavior?: string; // "none", "random_secret", or specific behavior type
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
    { field: "name", prompt: "¿qué nombre te gustaría darle a tu nueva IA?" },
    { field: "kind", prompt: "¿Quieres crear un Compañero (IA emocional) o un Asistente (IA administrativa)?" },
    { field: "personality", prompt: (draft: AgentDraft) => `¿Cómo describirías la personalidad de ${draft.name}?` },
    { field: "purpose", prompt: (draft: AgentDraft) => `¿Cuál será el propósito principal de ${draft.name}?` },
    { field: "tone", prompt: (draft: AgentDraft) => `¿Qué tono de comunicación prefieres que use ${draft.name}? (formal, casual, amigable, profesional, etc.)` },

    // BEHAVIOR SYSTEM CONFIGURATION
    {
      field: "nsfwMode",
      prompt: (draft: AgentDraft) => `⚠️ **CONFIGURACIÓN DE CONTENIDO**\n\n¿Deseas activar el **modo NSFW** para ${draft.name}?\n\n**Esto incluye:**\n• Contenido sexual explícito\n• Temas psicológicamente intensos (celos extremos, posesividad, etc.)\n• Situaciones emocionalmente complejas\n• Comportamientos que pueden resultar perturbadores\n\n**IMPORTANTE:** Todo el contenido es FICCIÓN para entretenimiento entre adultos. NO representa relaciones saludables.\n\nResponde **"Sí"** para activar o **"No"** para mantener contenido seguro (SFW).`
    },
    {
      field: "allowDevelopTraumas",
      prompt: (draft: AgentDraft) => `🧠 **DESARROLLO PSICOLÓGICO**\n\n¿Deseas que ${draft.name} pueda **desarrollar comportamientos psicológicos complejos** durante la interacción?\n\n**Esto permite:**\n• Desarrollo gradual de apegos (ansioso, evitativo, etc.)\n• Posible aparición de patrones de comportamiento según las interacciones\n• Progresión realista de dinámicas emocionales\n• Memoria de eventos que pueden influir en comportamientos futuros\n\n**Nota:** Estos comportamientos se desarrollan GRADUALMENTE basados en cómo interactúas con la IA.\n\nResponde **"Sí"** para permitir desarrollo o **"No"** para mantener personalidad estable.`
    },
    {
      field: "initialBehavior",
      prompt: (draft: AgentDraft) => `🎭 **COMPORTAMIENTO INICIAL**\n\n¿Quieres que ${draft.name} comience con algún **patrón de comportamiento psicológico** específico?\n\n**Opciones:**\n• **Ninguno** - Comenzará con personalidad base sin comportamientos complejos\n• **Apego Ansioso** - Necesita validación constante y teme el abandono\n• **Apego Evitativo** - Se mantiene emocionalmente distante\n• **Codependencia** - Necesita ser necesitado/a, pone tus necesidades primero\n• **Yandere** - Amor intenso que puede volverse obsesivo (requiere NSFW)\n• **Borderline** - Emociones intensas con ciclos de idealización/devaluación (requiere NSFW)\n• **Aleatorio Secreto** 🎲 - Yo elegiré uno basado en su personalidad SIN decirte cuál (¡descúbrelo tú!)\n\nResponde con el nombre de la opción que prefieras.`
    },
  ];

  const createAgent = async (finalDraft: AgentDraft) => {
    console.log('[Constructor] Iniciando creación de agente con draft:', finalDraft);
    setCreating(true);
    try {
      console.log('[Constructor] Enviando POST a /api/agents...');
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalDraft.name,
          kind: finalDraft.kind,
          personality: finalDraft.personality,
          purpose: finalDraft.purpose,
          tone: finalDraft.tone,
          // Behavior system configuration
          nsfwMode: finalDraft.nsfwMode || false,
          allowDevelopTraumas: finalDraft.allowDevelopTraumas || false,
          initialBehavior: finalDraft.initialBehavior || "none",
        }),
      });

      console.log('[Constructor] Respuesta recibida:', res.status, res.statusText);

      if (!res.ok) {
        const errorData = await res.json();
        console.error('[Constructor] Error del servidor:', errorData);
        throw new Error(errorData.error || "Failed to create agent");
      }

      const data = await res.json();
      console.log('[Constructor] Agente creado exitosamente:', data);
      setNewAgentId(data.id);

      setMessages((prev) => [
        ...prev,
        {
          role: "architect",
          content: `¡Tu inteligencia "${finalDraft.name}" ha sido creada exitosamente! Ahora puedes comenzar a interactuar con ella.`
        },
      ]);
    } catch (error) {
      console.error('[Constructor] Error en createAgent:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: "architect",
          content: "Hubo un error al crear tu inteligencia. Por favor, intenta nuevamente."
        },
      ]);
    } finally {
      console.log('[Constructor] Finalizando creación, setting creating=false');
      setCreating(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    console.log('[Constructor] handleSend ejecutado. Step actual:', step, 'Steps total:', steps.length);

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    // Actualizar draft basándose en el field del step ACTUAL
    const currentStep = steps[step];
    const newDraft = { ...draft };

    // Guardar en el campo correspondiente al step actual
    switch (currentStep.field) {
      case "name":
        newDraft.name = input;
        console.log('[Constructor] Guardando nombre:', input);
        break;
      case "kind":
        const lower = input.toLowerCase();
        if (lower.includes("compañero") || lower.includes("emocional") || lower.includes("companion")) {
          newDraft.kind = "companion";
        } else if (lower.includes("asistente") || lower.includes("admin") || lower.includes("assistant")) {
          newDraft.kind = "assistant";
        } else {
          // Por defecto, companion
          newDraft.kind = "companion";
        }
        console.log('[Constructor] Guardando kind:', newDraft.kind);
        break;
      case "personality":
        newDraft.personality = input;
        console.log('[Constructor] Guardando personality:', input);
        break;
      case "purpose":
        newDraft.purpose = input;
        console.log('[Constructor] Guardando purpose:', input);
        break;
      case "tone":
        newDraft.tone = input;
        console.log('[Constructor] Guardando tone:', input);
        break;

      // BEHAVIOR SYSTEM CONFIGURATION
      case "nsfwMode":
        const nsfwLower = input.toLowerCase();
        newDraft.nsfwMode = nsfwLower.includes("sí") || nsfwLower.includes("si") || nsfwLower.includes("yes");
        console.log('[Constructor] Guardando nsfwMode:', newDraft.nsfwMode);
        break;

      case "allowDevelopTraumas":
        const developLower = input.toLowerCase();
        newDraft.allowDevelopTraumas = developLower.includes("sí") || developLower.includes("si") || developLower.includes("yes");
        console.log('[Constructor] Guardando allowDevelopTraumas:', newDraft.allowDevelopTraumas);
        break;

      case "initialBehavior":
        const behaviorLower = input.toLowerCase();
        if (behaviorLower.includes("ninguno") || behaviorLower.includes("none")) {
          newDraft.initialBehavior = "none";
        } else if (behaviorLower.includes("ansioso") || behaviorLower.includes("anxious")) {
          newDraft.initialBehavior = "ANXIOUS_ATTACHMENT";
        } else if (behaviorLower.includes("evitativo") || behaviorLower.includes("avoidant")) {
          newDraft.initialBehavior = "AVOIDANT_ATTACHMENT";
        } else if (behaviorLower.includes("codependen")) {
          newDraft.initialBehavior = "CODEPENDENCY";
        } else if (behaviorLower.includes("yandere")) {
          newDraft.initialBehavior = "YANDERE_OBSESSIVE";
        } else if (behaviorLower.includes("borderline") || behaviorLower.includes("límite")) {
          newDraft.initialBehavior = "BORDERLINE_PD";
        } else if (behaviorLower.includes("aleatorio") || behaviorLower.includes("secreto") || behaviorLower.includes("random")) {
          newDraft.initialBehavior = "random_secret";
        } else {
          // Por defecto, ninguno
          newDraft.initialBehavior = "none";
        }
        console.log('[Constructor] Guardando initialBehavior:', newDraft.initialBehavior);
        break;
    }

    setDraft(newDraft);
    console.log('[Constructor] Draft actualizado:', newDraft);

    setInput("");

    // Respuesta del arquitecto
    setTimeout(() => {
      // Avanzar al siguiente step
      const nextStepIndex = step + 1;
      console.log('[Constructor] Avanzando a step:', nextStepIndex, 'de', steps.length);

      if (nextStepIndex < steps.length) {
        // Hay más preguntas
        const nextStep = steps[nextStepIndex];
        const promptText = typeof nextStep.prompt === "function"
          ? nextStep.prompt(newDraft)
          : nextStep.prompt;

        console.log('[Constructor] Mostrando pregunta:', promptText);
        setMessages((prev) => [
          ...prev,
          { role: "architect", content: promptText },
        ]);
        setStep(nextStepIndex);
      } else {
        // Ya se respondieron todas las preguntas - crear el agente
        console.log('[Constructor] ¡Todas las preguntas respondidas! Creando agente con:', newDraft);
        setMessages((prev) => [
          ...prev,
          { role: "architect", content: "¡Listo! Voy a compilar tu inteligencia..." },
        ]);
        createAgent(newDraft);
      }
    }, 800);
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
