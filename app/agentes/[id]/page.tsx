"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DirectMessageChat } from "@/components/chat/v2";
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
  const searchParams = useSearchParams();
  const t = useTranslations("agents.chat");
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [fromDemo, setFromDemo] = useState(false);

  // Detectar si viene de demo
  useEffect(() => {
    const isFromDemo = searchParams.get('fromDemo') === 'true';
    setFromDemo(isFromDemo);
  }, [searchParams]);

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

  // Marcar conversación como leída cuando se abre el chat
  useEffect(() => {
    if (!userId || !params.id) return;

    const markAsRead = async () => {
      try {
        await fetch(`/api/conversations/${params.id}/mark-read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('[Conversation] Marked as read');
      } catch (error) {
        console.error('[Conversation] Failed to mark as read:', error);
      }
    };

    markAsRead();
  }, [userId, params.id]);

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
      <DirectMessageChat
        agentId={agent.id}
        agentName={agent.name}
        agentAvatar={agent.avatar}
        userId={userId || "default-user"}
        fromDemo={fromDemo}
      />
    </ErrorBoundary>
  );
}
