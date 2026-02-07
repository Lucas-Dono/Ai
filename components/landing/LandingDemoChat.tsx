"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Sparkles, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics/track-client";
import { LandingEventType } from "@/lib/analytics/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  emotion?: string;
  timestamp: number;
}

interface EmotionalState {
  mood: string;
  dominant: string[];
}

const DEMO_STORAGE_KEY = "luna_demo_session";

interface DemoSessionStorage {
  sessionId: string | null;
  messages: Message[];
  messagesRemaining: number;
  emotionalState: EmotionalState;
}

export function LandingDemoChat() {
  const t = useTranslations("landing.demoChat");

  // Track if first message was sent (for demo_start event)
  const [isFirstMessage, setIsFirstMessage] = useState(true);

  // Estado inicial desde localStorage o valores por defecto
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    if (stored) {
      try {
        const parsed: DemoSessionStorage = JSON.parse(stored);
        return parsed.sessionId;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') {
      return [
        {
          id: "0",
          role: "assistant",
          content: "¡Hola! Soy Luna 🌙. Estoy aquí para acompañarte y escucharte. ¿Cómo estás hoy?",
          emotion: "Alegría",
          timestamp: Date.now(),
        },
      ];
    }
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    if (stored) {
      try {
        const parsed: DemoSessionStorage = JSON.parse(stored);
        return parsed.messages;
      } catch {
        return [
          {
            id: "0",
            role: "assistant",
            content: "¡Hola! Soy Luna 🌙. Estoy aquí para acompañarte y escucharte. ¿Cómo estás hoy?",
            emotion: "Alegría",
            timestamp: Date.now(),
          },
        ];
      }
    }
    return [
      {
        id: "0",
        role: "assistant",
        content: "¡Hola! Soy Luna 🌙. Estoy aquí para acompañarte y escucharte. ¿Cómo estás hoy?",
        emotion: "Alegría",
        timestamp: Date.now(),
      },
    ];
  });

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [messagesRemaining, setMessagesRemaining] = useState(() => {
    if (typeof window === 'undefined') return 3;
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    if (stored) {
      try {
        const parsed: DemoSessionStorage = JSON.parse(stored);
        return parsed.messagesRemaining;
      } catch {
        return 3;
      }
    }
    return 3;
  });

  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  const [emotionalState, setEmotionalState] = useState<EmotionalState>(() => {
    if (typeof window === 'undefined') {
      return { mood: "amigable", dominant: ["alegría", "anticipación"] };
    }
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    if (stored) {
      try {
        const parsed: DemoSessionStorage = JSON.parse(stored);
        return parsed.emotionalState;
      } catch {
        return { mood: "amigable", dominant: ["alegría", "anticipación"] };
      }
    }
    return { mood: "amigable", dominant: ["alegría", "anticipación"] };
  });

  const [error, setError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom (only within chat container, not page)
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Guardar en localStorage cada vez que cambien los estados
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const demoData: DemoSessionStorage = {
      sessionId,
      messages,
      messagesRemaining,
      emotionalState,
    };

    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoData));
  }, [sessionId, messages, messagesRemaining, emotionalState]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping || cooldownSeconds > 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    // Track demo_start on first message
    if (isFirstMessage) {
      trackEvent({
        eventType: LandingEventType.DEMO_START,
        metadata: {
          firstMessageLength: input.length,
        },
      }).catch(() => {});
      setIsFirstMessage(false);
    }

    // Track each demo message
    trackEvent({
      eventType: LandingEventType.DEMO_MESSAGE,
      metadata: {
        messageCount: messages.filter(m => m.role === 'user').length + 1,
        messageLength: input.length,
        remainingMessages: messagesRemaining - 1,
      },
    }).catch(() => {});

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setError(null);

    // Expandir el chat al enviar el primer mensaje
    if (!isExpanded) {
      setIsExpanded(true);
    }

    try {
      const response = await fetch("/api/demo/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionId && { "X-Demo-Session": sessionId }),
        },
        body: JSON.stringify({
          content: userMessage.content,
          sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting and errors
        if (response.status === 429) {
          if (data.waitSeconds) {
            setCooldownSeconds(data.waitSeconds);
            setError(`Espera ${data.waitSeconds} segundos antes de enviar otro mensaje`);
          } else if (data.shouldShowSignup) {
            setShowSignupPrompt(true);
          }
        } else {
          setError(data.message || "Ha ocurrido un error");
        }
        setIsTyping(false);
        return;
      }

      // Update session ID if new
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      // Update messages remaining
      if (data.messagesRemaining !== undefined) {
        setMessagesRemaining(data.messagesRemaining);
      }

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        emotion: data.emotions?.mood,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Update emotional state
      if (data.emotions) {
        setEmotionalState({
          mood: data.emotions.mood,
          dominant: data.emotions.dominant || [],
        });
      }

      // Show signup prompt if limit reached
      if (data.shouldShowSignup) {
        // Track demo limit reached
        trackEvent({
          eventType: LandingEventType.DEMO_LIMIT_REACHED,
          metadata: {
            totalMessages: messages.filter(m => m.role === 'user').length,
          },
        }).catch(() => {});

        setTimeout(() => {
          setShowSignupPrompt(true);
        }, 1500);
      }

      // Set cooldown
      if (data.metadata?.cooldownSeconds) {
        setCooldownSeconds(data.metadata.cooldownSeconds);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      setError("Error de conexión. Por favor intenta de nuevo.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (showSignupPrompt) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-2xl border border-border shadow-2xl overflow-hidden bg-card"
      >
        <div className="aspect-[4/3] p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary/5 to-secondary/5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
          >
            <Heart className="w-10 h-10 text-primary" />
          </motion.div>

          <h3 className="text-2xl font-bold mb-3">
            ¡Has experimentado a Luna! 🌙
          </h3>

          <p className="text-muted-foreground mb-6 max-w-md">
            Regístrate gratis para continuar tu conversación y descubrir:
          </p>

          <ul className="text-left text-sm space-y-2 mb-8 max-w-md">
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span><strong>Conversaciones ilimitadas</strong> con Luna y otros personajes</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span><strong>Memoria a largo plazo</strong> - Luna recordará tus conversaciones</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span><strong>Inteligencia emocional completa</strong> con progresión de relación</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span><strong>Crea tus propios personajes</strong> con IA</span>
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/registro?fromDemo=true${sessionId ? `&demoSessionId=${sessionId}` : ''}`}
              onClick={() => {
                trackEvent({
                  eventType: LandingEventType.DEMO_SIGNUP,
                  metadata: {
                    action: 'create_account',
                    sessionId: sessionId || undefined,
                    messagesExchanged: messages.filter(m => m.role === 'user').length,
                  },
                }).catch(() => {});
              }}
            >
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Crear cuenta gratis
              </Button>
            </Link>
            <Link
              href={`/login?fromDemo=true${sessionId ? `&demoSessionId=${sessionId}` : ''}`}
              onClick={() => {
                trackEvent({
                  eventType: LandingEventType.DEMO_SIGNUP,
                  metadata: {
                    action: 'login',
                    sessionId: sessionId || undefined,
                    messagesExchanged: messages.filter(m => m.role === 'user').length,
                  },
                }).catch(() => {});
              }}
            >
              <Button size="lg" variant="outline">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            Sin tarjeta de crédito requerida • Acceso inmediato
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <Card className="relative rounded-2xl border-2 border-border shadow-2xl overflow-hidden bg-card">
      <motion.div
        className={`flex flex-col ${
          isExpanded
            ? "aspect-[5/3] md:aspect-[5/3]"
            : "aspect-square md:aspect-[4/3]"
        }`}
        initial={false}
        animate={{
          height: isExpanded ? "auto" : undefined,
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
              <img
                src="/personajes/luna/cara.webp"
                alt="Luna"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-semibold flex items-center gap-2">
                Luna 🌙
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-xs text-muted-foreground">
                {emotionalState.mood}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-muted-foreground">Demo</div>
            <div className="text-sm font-medium">
              {messagesRemaining} {messagesRemaining === 1 ? "mensaje" : "mensajes"}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-muted/10 to-transparent"
        >
          <AnimatePresence>
            {(isExpanded ? messages : messages.slice(0, 1)).map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  } rounded-2xl ${message.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"} px-4 py-2.5 shadow-sm`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  {message.emotion && message.role === "assistant" && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{message.emotion}</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-muted/20">
          {error && (
            <div className="mb-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                cooldownSeconds > 0
                  ? `Espera ${cooldownSeconds}s...`
                  : messagesRemaining === 0
                  ? "Límite alcanzado - Regístrate para continuar"
                  : "Escribe un mensaje..."
              }
              className="flex-1"
              disabled={isTyping || messagesRemaining === 0 || cooldownSeconds > 0}
              maxLength={500}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping || messagesRemaining === 0 || cooldownSeconds > 0}
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {messagesRemaining > 0 && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {messagesRemaining === 1
                ? "Último mensaje demo - Regístrate para continuar"
                : `${messagesRemaining} mensajes restantes`}
            </p>
          )}
        </div>
      </motion.div>
    </Card>
  );
}
