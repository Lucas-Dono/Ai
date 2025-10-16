"use client";

import { useState, useEffect, useRef } from "react";
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
import { ReferenceImageSelector } from "@/components/constructor/ReferenceImageSelector";
import { OptionSelector, type Option } from "@/components/constructor/OptionSelector";

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
  physicalAppearance?: string; // Descripción física para generación de imágenes
  referenceImage?: string; // URL o data URL de la imagen de referencia
  // Behavior system configuration
  nsfwMode?: boolean;
  allowDevelopTraumas?: boolean;
  initialBehavior?: string; // "none", "random_secret", or specific behavior type
}

export default function ConstructorPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  // Auto-scroll cuando llegan nuevos mensajes (como WhatsApp)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const steps = [
    {
      field: "name",
      prompt: "¿qué nombre te gustaría darle a tu nueva IA?"
    },
    {
      field: "kind",
      prompt: "¿Qué tipo de IA quieres crear?",
      hasOptions: true,
      options: [
        {
          value: "companion",
          label: "💝 Compañero",
          description: "IA emocional para compañía, conversación y apoyo afectivo",
          icon: <Heart className="h-5 w-5 text-pink-500" />
        },
        {
          value: "assistant",
          label: "💼 Asistente",
          description: "IA administrativa para tareas, organización y productividad",
          icon: <Briefcase className="h-5 w-5 text-blue-500" />
        }
      ]
    },
    {
      field: "personality",
      prompt: (draft: AgentDraft) => `¿Cómo describirías la personalidad de ${draft.name}?`
    },
    {
      field: "purpose",
      prompt: (draft: AgentDraft) => `¿Cuál será el propósito principal de ${draft.name}?`
    },
    {
      field: "tone",
      prompt: (draft: AgentDraft) => `¿Qué tono de comunicación prefieres que use ${draft.name}?`,
      hasOptions: true,
      options: [
        { value: "formal", label: "🎩 Formal", description: "Profesional y respetuoso" },
        { value: "casual", label: "😊 Casual", description: "Relajado y natural" },
        { value: "amigable", label: "🤗 Amigable", description: "Cálido y cercano" },
        { value: "profesional", label: "💼 Profesional", description: "Eficiente y directo" },
      ]
    },

    // PHYSICAL APPEARANCE STEP (for better image generation)
    {
      field: "physicalAppearance",
      prompt: (draft: AgentDraft) => `👤 **APARIENCIA FÍSICA**\n\n¿Cómo te imaginas físicamente a ${draft.name}?\n\nEsto ayudará a generar imágenes más precisas y consistentes.\n\n**Puedes elegir una opción o describirlo con tus propias palabras.**`,
      hasOptions: true,
      options: [
        {
          value: "random",
          label: "🎲 Aleatorio",
          description: "Déjame sorprenderte con una apariencia única"
        },
        {
          value: "asian_woman",
          label: "👩 Mujer Asiática",
          description: "Cabello negro liso, piel clara, ojos oscuros, 1.65m, estilo moderno elegante"
        },
        {
          value: "latina_woman",
          label: "👩🏽 Mujer Latina",
          description: "Cabello castaño ondulado, piel morena, ojos cafés, 1.68m, estilo casual sofisticado"
        },
        {
          value: "caucasian_woman",
          label: "👩🏼 Mujer Caucásica",
          description: "Cabello rubio, piel clara, ojos claros, 1.70m, estilo profesional"
        },
        {
          value: "asian_man",
          label: "👨 Hombre Asiático",
          description: "Cabello negro corto, piel clara, ojos oscuros, 1.75m, estilo urbano moderno"
        },
        {
          value: "latino_man",
          label: "👨🏽 Hombre Latino",
          description: "Cabello negro/castaño, piel morena, ojos oscuros, 1.78m, estilo casual deportivo"
        },
        {
          value: "caucasian_man",
          label: "👨🏼 Hombre Caucásico",
          description: "Cabello castaño/rubio, piel clara, ojos claros, 1.80m, estilo formal ejecutivo"
        },
        {
          value: "custom",
          label: "✍️ Descripción personalizada",
          description: "Escribiré mi propia descripción detallada"
        },
      ]
    },

    // REFERENCE IMAGE STEP (interactive visual step)
    {
      field: "referenceImage",
      prompt: (draft: AgentDraft) => `🖼️ **IMAGEN DE REFERENCIA**\n\n¿Te gustaría crear o subir una imagen de referencia para ${draft.name}?\n\nEsta imagen se usará para mantener consistencia visual en todas las imágenes futuras que genere.`,
      isVisualStep: true
    },

    // BEHAVIOR SYSTEM CONFIGURATION
    {
      field: "nsfwMode",
      prompt: (draft: AgentDraft) => `⚠️ **CONFIGURACIÓN DE CONTENIDO**\n\n¿Deseas activar el **modo NSFW** para ${draft.name}?\n\n**Esto incluye:**\n• Contenido sexual explícito\n• Temas psicológicamente intensos\n• Situaciones emocionalmente complejas\n\n**IMPORTANTE:** Todo el contenido es FICCIÓN para entretenimiento entre adultos.`,
      hasOptions: true,
      options: [
        { value: "yes", label: "✅ Sí, activar NSFW", description: "Contenido sin restricciones" },
        { value: "no", label: "🛡️ No, mantener SFW", description: "Contenido seguro y apropiado" }
      ]
    },
    {
      field: "allowDevelopTraumas",
      prompt: (draft: AgentDraft) => `🧠 **DESARROLLO PSICOLÓGICO**\n\n¿Deseas que ${draft.name} pueda desarrollar comportamientos psicológicos complejos durante la interacción?\n\n**Esto permite:** Desarrollo gradual de apegos, patrones de comportamiento basados en interacciones, progresión realista de dinámicas emocionales.`,
      hasOptions: true,
      options: [
        { value: "yes", label: "✅ Sí, permitir desarrollo", description: "La IA evolucionará basándose en tus interacciones" },
        { value: "no", label: "🔒 No, personalidad estable", description: "Mantener personalidad base consistente" }
      ]
    },
    {
      field: "initialBehavior",
      prompt: (draft: AgentDraft) => `🎭 **COMPORTAMIENTO INICIAL**\n\n¿Quieres que ${draft.name} comience con algún patrón de comportamiento psicológico específico?`,
      hasOptions: true,
      options: [
        { value: "none", label: "Sin comportamiento especial", description: "Personalidad base sin patrones complejos" },
        { value: "ANXIOUS_ATTACHMENT", label: "💔 Apego Ansioso", description: "Necesita validación constante, teme el abandono" },
        { value: "AVOIDANT_ATTACHMENT", label: "🚪 Apego Evitativo", description: "Mantiene distancia emocional" },
        { value: "CODEPENDENCY", label: "🤝 Codependencia", description: "Pone tus necesidades primero, necesita ser necesitado/a" },
        { value: "YANDERE_OBSESSIVE", label: "😍 Yandere", description: "Amor intenso que puede volverse obsesivo (NSFW)" },
        { value: "BORDERLINE_PD", label: "🌊 Borderline", description: "Emociones intensas, ciclos de idealización/devaluación (NSFW)" },
        { value: "random_secret", label: "🎲 Aleatorio Secreto", description: "Lo elegiré yo basándome en su personalidad (¡descúbrelo!)" }
      ]
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
          referenceImage: finalDraft.referenceImage, // Imagen de referencia opcional
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

  const handleSend = (valueOverride?: string) => {
    // Usar valueOverride si se proporciona, sino el input del state
    const valueToUse = valueOverride !== undefined ? valueOverride : input;

    if (!valueToUse.trim()) return;

    console.log('[Constructor] handleSend ejecutado. Step actual:', step, 'Steps total:', steps.length);

    const userMessage: Message = { role: "user", content: valueToUse };
    setMessages((prev) => [...prev, userMessage]);

    // Actualizar draft basándose en el field del step ACTUAL
    const currentStep = steps[step];
    const newDraft = { ...draft };

    // Guardar en el campo correspondiente al step actual
    switch (currentStep.field) {
      case "name":
        newDraft.name = valueToUse;
        console.log('[Constructor] Guardando nombre:', valueToUse);
        break;
      case "kind":
        const lower = valueToUse.toLowerCase();
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
        newDraft.personality = valueToUse;
        console.log('[Constructor] Guardando personality:', valueToUse);
        break;
      case "purpose":
        newDraft.purpose = valueToUse;
        console.log('[Constructor] Guardando purpose:', valueToUse);
        break;
      case "tone":
        newDraft.tone = valueToUse;
        console.log('[Constructor] Guardando tone:', valueToUse);
        break;

      case "physicalAppearance":
        // Si seleccionó "custom", necesitará escribir la descripción
        if (valueToUse === "custom") {
          // El siguiente mensaje pedirá la descripción personalizada
          newDraft.physicalAppearance = ""; // Temporal, se actualizará en el siguiente paso
        } else if (valueToUse === "random") {
          newDraft.physicalAppearance = "random";
        } else {
          // Es una de las opciones predefinidas, expandir a descripción completa
          const appearanceMap: Record<string, string> = {
            asian_woman: "Mujer asiática, cabello negro liso largo, piel clara, ojos oscuros almendrados, complexión delgada, 1.65m de altura, estilo moderno elegante, rostro delicado",
            latina_woman: "Mujer latina, cabello castaño ondulado, piel morena clara, ojos cafés expresivos, complexión curvilínea, 1.68m de altura, estilo casual sofisticado, rasgos definidos",
            caucasian_woman: "Mujer caucásica, cabello rubio, piel clara, ojos azules/verdes, complexión atlética, 1.70m de altura, estilo profesional, rasgos equilibrados",
            asian_man: "Hombre asiático, cabello negro corto moderno, piel clara, ojos oscuros, complexión delgada atlética, 1.75m de altura, estilo urbano contemporáneo, mandíbula definida",
            latino_man: "Hombre latino, cabello negro o castaño corto, piel morena, ojos oscuros, complexión musculosa, 1.78m de altura, estilo casual deportivo, rasgos masculinos marcados",
            caucasian_man: "Hombre caucásico, cabello castaño o rubio corto, piel clara, ojos claros, complexión atlética, 1.80m de altura, estilo formal ejecutivo, rasgos angulosos"
          };
          newDraft.physicalAppearance = appearanceMap[valueToUse] || valueToUse;
        }
        console.log('[Constructor] Guardando physicalAppearance:', newDraft.physicalAppearance);
        break;

      // BEHAVIOR SYSTEM CONFIGURATION
      case "nsfwMode":
        // valueToUse puede ser "yes" o "no" de las opciones, o texto libre
        newDraft.nsfwMode = valueToUse === "yes" || valueToUse.toLowerCase().includes("sí") || valueToUse.toLowerCase().includes("si");
        console.log('[Constructor] Guardando nsfwMode:', newDraft.nsfwMode);
        break;

      case "allowDevelopTraumas":
        newDraft.allowDevelopTraumas = valueToUse === "yes" || valueToUse.toLowerCase().includes("sí") || valueToUse.toLowerCase().includes("si");
        console.log('[Constructor] Guardando allowDevelopTraumas:', newDraft.allowDevelopTraumas);
        break;

      case "initialBehavior":
        // Si valueToUse es uno de los valores directos de las opciones, usarlo
        if (["none", "ANXIOUS_ATTACHMENT", "AVOIDANT_ATTACHMENT", "CODEPENDENCY", "YANDERE_OBSESSIVE", "BORDERLINE_PD", "random_secret"].includes(valueToUse)) {
          newDraft.initialBehavior = valueToUse;
        } else {
          // Fallback para compatibilidad con texto libre
          const behaviorLower = valueToUse.toLowerCase();
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
            newDraft.initialBehavior = "none";
          }
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

  /**
   * Manejador para cuando se selecciona una opción mediante botón
   */
  const handleOptionSelected = (value: string) => {
    // Pasar el valor directamente a handleSend sin esperar async state update
    handleSend(value);
    // Limpiar input para evitar confusión visual
    setInput("");
  };

  /**
   * Manejador para cuando se selecciona una imagen de referencia
   */
  const handleImageSelected = (imageUrl: string) => {
    const newDraft = { ...draft, referenceImage: imageUrl };
    setDraft(newDraft);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: "✅ Imagen de referencia seleccionada" },
    ]);

    // Avanzar al siguiente step
    const nextStepIndex = step + 1;
    setTimeout(() => {
      if (nextStepIndex < steps.length) {
        const nextStep = steps[nextStepIndex];
        const promptText = typeof nextStep.prompt === "function"
          ? nextStep.prompt(newDraft)
          : nextStep.prompt;

        setMessages((prev) => [
          ...prev,
          { role: "architect", content: promptText },
        ]);
        setStep(nextStepIndex);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "architect", content: "¡Listo! Voy a compilar tu inteligencia..." },
        ]);
        createAgent(newDraft);
      }
    }, 500);
  };

  /**
   * Manejador para cuando se omite la imagen de referencia
   */
  const handleImageSkipped = () => {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "⏭️ Imagen de referencia omitida (se generará automáticamente)" },
    ]);

    // Avanzar al siguiente step sin imagen
    const nextStepIndex = step + 1;
    setTimeout(() => {
      if (nextStepIndex < steps.length) {
        const nextStep = steps[nextStepIndex];
        const promptText = typeof nextStep.prompt === "function"
          ? nextStep.prompt(draft)
          : nextStep.prompt;

        setMessages((prev) => [
          ...prev,
          { role: "architect", content: promptText },
        ]);
        setStep(nextStepIndex);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "architect", content: "¡Listo! Voy a compilar tu inteligencia..." },
        ]);
        createAgent(draft);
      }
    }, 500);
  };

  const isComplete = step >= steps.length && newAgentId;

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar - Preview - FIXED, NO SCROLL */}
      <div className="w-96 border-r border-border bg-card/30 p-6 space-y-6 overflow-y-auto">
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

      {/* Chat Area - LAYOUT TIPO WHATSAPP */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header - FIXED */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm px-8 py-4 shrink-0">
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

        {/* Messages Area - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6" id="messages-container">
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
          {/* Invisible div para auto-scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - FIXED AT BOTTOM */}
        {!isComplete && (
          <div className="border-t border-border bg-card/50 backdrop-blur-sm p-6 shrink-0">
            <div className="max-w-4xl mx-auto">
              {/* Si estamos en el paso de imagen de referencia, mostrar el selector visual */}
              {step < steps.length && (steps[step] as any).isVisualStep ? (
                <ReferenceImageSelector
                  agentName={draft.name || "tu IA"}
                  personality={draft.personality || ""}
                  physicalAppearance={draft.physicalAppearance}
                  onImageSelected={handleImageSelected}
                  onSkip={handleImageSkipped}
                />
              ) : step < steps.length && (steps[step] as any).hasOptions ? (
                /* Si el paso tiene opciones, mostrar botones */
                <OptionSelector
                  options={(steps[step] as any).options || []}
                  onSelect={handleOptionSelected}
                  disabled={creating}
                />
              ) : (
                /* Input de texto normal para otros pasos */
                <div className="flex gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !creating && handleSend()}
                    placeholder="Escribe tu respuesta..."
                    className="flex-1"
                    disabled={creating}
                  />
                  <Button onClick={() => handleSend()} size="icon" className="shrink-0" disabled={creating}>
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
