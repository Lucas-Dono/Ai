"use client";

/**
 * Página de Chat Multimodal con Agente
 *
 * Chat estilo WhatsApp con respuestas multimodales:
 * - Texto, audio e imágenes
 * - Experiencia natural y fluida
 * - Indicadores en tiempo real
 */

import { use } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { WhatsAppChat } from "@/components/chat/WhatsAppChat";
import { useEffect, useState } from "react";

interface Agent {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
}

export default function AgentChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }

    if (status === "authenticated") {
      fetchAgent();
    }
  }, [status]);

  const fetchAgent = async () => {
    try {
      const response = await fetch(`/api/agents/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setAgent(data);
      } else {
        console.error("Failed to fetch agent");
      }
    } catch (error) {
      console.error("Error fetching agent:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white">Cargando chat...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Agente no encontrado</h2>
          <p className="text-gray-400">El agente que buscas no existe</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header con información del agente */}
      <div className="bg-[#1f1f1f] border-b border-[#2a2a2a] px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{agent.name}</h1>
              {agent.description && (
                <p className="text-sm text-gray-400">{agent.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 max-w-6xl w-full mx-auto">
        <WhatsAppChat
          agentId={agent.id}
          agentName={agent.name}
          agentAvatar={agent.avatar}
          userId={session?.user?.id || ""}
        />
      </div>
    </div>
  );
}
