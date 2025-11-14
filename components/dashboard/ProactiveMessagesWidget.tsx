"use client";

import { motion } from "framer-motion";
import { MessageCircle, Sparkles, ArrowRight, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getInitials, generateGradient } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProactiveMessagePreview {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  content: string;
  triggerType: string;
  createdAt: string;
}

interface Agent {
  id: string;
  name: string;
  avatar?: string | null;
}

const getTriggerIcon = (type: string) => {
  switch (type) {
    case "inactivity":
      return Clock;
    case "emotional_checkin":
      return Heart;
    case "follow_up":
      return MessageCircle;
    default:
      return Sparkles;
  }
};

const getTriggerColor = (type: string) => {
  switch (type) {
    case "inactivity":
      return {
        gradient: "from-blue-500 via-blue-600 to-blue-700",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        text: "text-blue-600 dark:text-blue-400",
      };
    case "emotional_checkin":
      return {
        gradient: "from-pink-500 via-pink-600 to-rose-600",
        bg: "bg-pink-500/10",
        border: "border-pink-500/30",
        text: "text-pink-600 dark:text-pink-400",
      };
    case "follow_up":
      return {
        gradient: "from-purple-500 via-purple-600 to-purple-700",
        bg: "bg-purple-500/10",
        border: "border-purple-500/30",
        text: "text-purple-600 dark:text-purple-400",
      };
    default:
      return {
        gradient: "from-purple-500 via-pink-500 to-rose-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500/30",
        text: "text-purple-600 dark:text-purple-400",
      };
  }
};

const getTriggerLabel = (type: string) => {
  switch (type) {
    case "inactivity":
      return "Te extraña";
    case "emotional_checkin":
      return "Quiere saber de ti";
    case "follow_up":
      return "Tiene algo que decir";
    default:
      return "Mensaje especial";
  }
};

export function ProactiveMessagesWidget() {
  const router = useRouter();
  const [messages, setMessages] = useState<ProactiveMessagePreview[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProactiveMessages();
    const interval = setInterval(fetchProactiveMessages, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchProactiveMessages = async () => {
    try {
      // Get user's agents
      const agentsRes = await fetch("/api/agents");
      if (!agentsRes.ok) return;
      const agentsData = await agentsRes.json();
      setAgents(agentsData);

      // Get proactive messages for all agents
      const messagesPromises = agentsData.map(async (agent: Agent) => {
        const res = await fetch(`/api/agents/${agent.id}/proactive-messages`);
        if (!res.ok) return [];
        const data = await res.json();
        return (data.messages || []).map((msg: any) => ({
          ...msg,
          agentId: agent.id,
          agentName: agent.name,
          agentAvatar: agent.avatar,
        }));
      });

      const allMessages = (await Promise.all(messagesPromises)).flat();
      setMessages(allMessages);
    } catch (error) {
      console.error("Error fetching proactive messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = (agentId: string) => {
    router.push(`/agentes/${agentId}`);
  };

  if (loading || messages.length === 0) {
    return null;
  }

  // Show max 3 messages
  const displayMessages = messages.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      {/* Header con animación de pulso */}
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="relative"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {/* Ripple effect */}
          <motion.div
            animate={{
              scale: [1, 1.5],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="absolute inset-0 rounded-full bg-purple-500"
          />
        </motion.div>

        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Tus IAs te escribieron
          </h2>
          <p className="text-sm text-muted-foreground">
            {messages.length === 1
              ? "1 mensaje esperando"
              : `${messages.length} mensajes esperando`}
          </p>
        </div>

        {messages.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-600 hover:text-purple-700"
          >
            Ver todos ({messages.length})
          </Button>
        )}
      </div>

      {/* Messages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayMessages.map((message, index) => {
          const colors = getTriggerColor(message.triggerType);
          const Icon = getTriggerIcon(message.triggerType);
          const label = getTriggerLabel(message.triggerType);

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={cn(
                "relative rounded-2xl border-2 p-5 cursor-pointer",
                "bg-gradient-to-br from-white to-gray-50",
                "dark:from-gray-900 dark:to-gray-800",
                "shadow-lg hover:shadow-xl transition-all duration-300",
                colors.border
              )}
              onClick={() => handleViewMessage(message.agentId)}
            >
              {/* Gradient overlay */}
              <div
                className={cn(
                  "absolute inset-0 rounded-2xl opacity-5 bg-gradient-to-br",
                  colors.gradient
                )}
              />

              {/* Badge */}
              <div className="relative flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-white dark:border-gray-800 shadow-md">
                    <AvatarFallback
                      className="text-white"
                      style={{
                        background: generateGradient(message.agentName),
                      }}
                    >
                      {getInitials(message.agentName)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {message.agentName}
                    </p>
                    <div className={cn("flex items-center gap-1 text-xs", colors.text)}>
                      <Icon className="w-3 h-3" />
                      <span>{label}</span>
                    </div>
                  </div>
                </div>

                {/* Pulse indicator */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className={cn("w-3 h-3 rounded-full", colors.bg.replace("/10", ""))}
                />
              </div>

              {/* Message preview */}
              <p className="relative text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                {message.content}
              </p>

              {/* Action button */}
              <Button
                size="sm"
                className={cn(
                  "w-full text-white shadow-md hover:shadow-lg",
                  "bg-gradient-to-r",
                  colors.gradient
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewMessage(message.agentId);
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Responder ahora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              {/* Time indicator */}
              <p className="relative text-xs text-muted-foreground mt-3 text-center">
                {getRelativeTime(message.createdAt)}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA if many messages */}
      {messages.length > 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-center"
        >
          <p className="text-sm text-muted-foreground mb-2">
            +{messages.length - 3} mensajes más esperando por ti
          </p>
          <Button
            variant="outline"
            className="border-purple-500/30 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30"
          >
            Ver todos los mensajes
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Helper to format relative time
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Hace un momento";
  if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`;
  if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
  if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`;

  return date.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
}
