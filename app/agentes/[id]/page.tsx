"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ModernChat } from "@/components/chat/v2";
import { useTrackInteraction } from "@/hooks/use-track-interaction";
import { useTranslations } from "next-intl";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { ErrorBoundary } from "@/components/error-boundary";

interface Agent {
  id: string;
  name: string;
  avatar?: string;
  referenceImageUrl?: string;
}

export default function AgentChatPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("agents.chat");
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
      <LoadingIndicator
        variant="page"
        message={t("loading.agent")}
        submessage={t("loading.agentSubtitle")}
      />
    );
  }

  if (!agent) return null;

  return (
    <ErrorBoundary variant="page">
      <ModernChat
        agentId={agent.id}
        agentName={agent.name}
        agentAvatar={agent.avatar}
        userId={userId || "default-user"}
      />
    </ErrorBoundary>
  );
}
