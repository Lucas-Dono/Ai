'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useConversations } from '@/hooks/useConversations';
import { ConversationList } from '@/components/messaging/ConversationList';
import { MessageThread } from '@/components/messaging/MessageThread';
import { NewConversationModal } from '@/components/messaging/NewConversationModal';
import { Button } from '@/components/ui/button';
import { MessageSquare, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MessagesPage() {
  const t = useTranslations("messages");
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    conversations,
    loading,
    error,
    createConversation,
    updateConversation,
    deleteConversation,
    markAsRead,
  } = useConversations();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [mobileListOpen, setMobileListOpen] = useState(true);

  // Redirect si no está autenticado
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <MessageSquare className="h-8 w-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId) || null;

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    // En mobile, cerrar lista al seleccionar
    setMobileListOpen(false);
  };

  const handleCreateConversation = async (
    participants: string[],
    options?: { name?: string; type?: 'direct' | 'group' }
  ) => {
    const conversation = await createConversation({
      participants,
      ...options,
    });
    setSelectedConversationId(conversation.id);
    setMobileListOpen(false);
  };

  const handleDeleteConversation = async (id: string) => {
    await deleteConversation(id);
    if (selectedConversationId === id) {
      setSelectedConversationId(null);
      setMobileListOpen(true);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header mobile */}
      <div className="lg:hidden border-b border-border p-4 flex items-center justify-between bg-background">
        <h1 className="text-xl font-bold">{t("title")}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileListOpen(!mobileListOpen)}
        >
          {mobileListOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List - Sidebar */}
        <div
          className={cn(
            'w-full lg:w-[380px] border-r border-border bg-background',
            'lg:block',
            mobileListOpen ? 'block' : 'hidden'
          )}
        >
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelect={handleSelectConversation}
            onNewConversation={() => setNewConversationOpen(true)}
            loading={loading}
          />
        </div>

        {/* Message Thread - Main area */}
        <div
          className={cn(
            'flex-1 bg-background',
            'lg:block',
            !mobileListOpen ? 'block' : 'hidden'
          )}
        >
          <MessageThread
            conversation={selectedConversation}
            onUpdateConversation={updateConversation}
            onDeleteConversation={handleDeleteConversation}
            onMarkAsRead={markAsRead}
          />
        </div>
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        open={newConversationOpen}
        onOpenChange={setNewConversationOpen}
        onCreateConversation={handleCreateConversation}
      />
    </div>
  );
}
