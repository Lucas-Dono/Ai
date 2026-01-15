/**
 * Sección "Tu Círculo"
 * Conversaciones activas con tracking de mensajes sin leer
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { YourCircleCard } from './YourCircleCard';
import { Carousel } from '@/components/ui/carousel';
import { MobileAgentCard } from '@/components/mobile/MobileAgentCard';
import { Users } from 'lucide-react';
import { useSession } from '@/lib/auth-client';

interface ConversationWithAgent {
  agentId: string;
  agentName: string;
  agentAvatar: string | null;
  staticDescription: string;
  unreadCount: number;
  lastMessageAt: Date;
  isPinned: boolean;
}

export function YourCircleSection() {
  const { data: session } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationWithAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es mobile (< 1024px)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');

    // Set initial value
    setIsMobile(mediaQuery.matches);

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    fetchConversations();
  }, [session]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations/recent?limit=10');
      if (res.ok) {
        const data = await res.json();
        console.log('[YourCircle] Conversations fetched:', data);
        setConversations(data.conversations || []);
        setTotalUnread(data.totalUnread || 0);
      } else {
        console.error('[YourCircle] API error:', res.status, await res.text());
      }
    } catch (error) {
      console.error('[YourCircle] Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // No mostrar si el usuario no está autenticado
  if (!session?.user) {
    return null;
  }

  if (loading) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-purple-400 animate-pulse" />
          <h2 className="text-2xl font-bold">Tu Círculo</h2>
        </div>
        {isMobile ? (
          <div className="grid grid-cols-2 gap-4 px-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="w-full h-[280px] bg-gray-800/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="w-[280px] h-[200px] bg-gray-800/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}
      </section>
    );
  }

  // No mostrar la sección si no hay conversaciones
  if (conversations.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-6 h-6 text-purple-400" />
        <h2 className="text-2xl font-bold">Tu Círculo</h2>
        {totalUnread > 0 && (
          <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/30 animate-pulse">
            {totalUnread} {totalUnread === 1 ? 'mensaje nuevo' : 'mensajes nuevos'}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-400 mb-4">
        Tus conversaciones más recientes y activas
      </p>

      {isMobile ? (
        <div className="grid grid-cols-2 gap-4 px-4">
          {conversations.map((conv) => (
            <MobileAgentCard
              key={conv.agentId}
              id={conv.agentId}
              name={conv.agentName}
              description={conv.staticDescription}
              avatar={conv.agentAvatar || undefined}
              featured={conv.isPinned}
              onPress={() => router.push(`/chat/${conv.agentId}`)}
            />
          ))}
        </div>
      ) : (
        <Carousel itemWidth={280} gap={16}>
          {conversations.map((conv, idx) => (
            <YourCircleCard
              key={conv.agentId}
              agentId={conv.agentId}
              agentName={conv.agentName}
              agentAvatar={conv.agentAvatar}
              staticDescription={conv.staticDescription}
              unreadCount={conv.unreadCount}
              lastMessageAt={new Date(conv.lastMessageAt)}
              isPinned={conv.isPinned}
              index={idx}
            />
          ))}
        </Carousel>
      )}
    </section>
  );
}
