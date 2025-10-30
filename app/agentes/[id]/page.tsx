"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ModernChat } from "@/components/chat/v2";
import { useTrackInteraction } from "@/hooks/use-track-interaction";

interface Agent {
  id: string;
  name: string;
  avatar?: string;
  referenceImageUrl?: string;
}

export default function AgentChatPage() {
  const params = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Auto-tracking de interacción para el sistema de recomendaciones
  useTrackInteraction({
    userId,
    itemType: "agent",
    itemId: params.id as string,
    interactionType: "chat",
  });

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const res = await fetch(`/api/agents/${params.id}`);
        if (!res.ok) throw new Error("Agent not found");
        const data = await res.json();
        setAgent(data);

        // Get userId from session
        const sessionRes = await fetch('/api/auth/session');
        if (sessionRes.ok) {
          const session = await sessionRes.json();
          if (session?.user?.id) {
            setUserId(session.user.id);
          }
        }
      } catch (error) {
        console.error(error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!agent) return null;

  return (
    <ModernChat
      agentId={agent.id}
      agentName={agent.name}
      agentAvatar={agent.avatar}
      userId={userId || "default-user"}
    />
  );
}
