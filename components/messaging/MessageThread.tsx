'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useMessages } from '@/hooks/useMessages';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MoreVertical,
  Archive,
  Volume2,
  VolumeX,
  Trash2,
  MessageSquare,
  Loader2,
  ChevronUp,
} from 'lucide-react';
import { DirectConversation } from '@/types/messaging';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageThreadProps {
  conversation: DirectConversation | null;
  onUpdateConversation?: (id: string, data: any) => Promise<void>;
  onDeleteConversation?: (id: string) => Promise<void>;
  onMarkAsRead?: (id: string) => Promise<void>;
}

export function MessageThread({
  conversation,
  onUpdateConversation,
  onDeleteConversation,
  onMarkAsRead,
}: MessageThreadProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const {
    messages,
    loading,
    sending,
    hasMore,
    sendMessage,
    editMessage,
    deleteMessage,
    loadMore,
    messagesEndRef,
  } = useMessages(conversation?.id || null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  // Marcar como leído cuando se abre la conversación
  useEffect(() => {
    if (conversation?.id && onMarkAsRead) {
      onMarkAsRead(conversation.id);
    }
  }, [conversation?.id, onMarkAsRead]);

  // Detectar scroll para mostrar botón "ir al final"
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 200;
    setShowScrollButton(!isNearBottom && messages.length > 0);

    // Load more cuando llega al top
    if (target.scrollTop === 0 && hasMore && !loading) {
      const previousHeight = target.scrollHeight;
      loadMore();

      // Restaurar posición después de cargar más
      setTimeout(() => {
        const newHeight = target.scrollHeight;
        target.scrollTop = newHeight - previousHeight;
      }, 100);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!conversation || !userId) return;

    // Determinar recipientId
    const participants = conversation.participants as string[];
    const recipientId = participants.find((p) => p !== userId) || participants[0];

    await sendMessage({
      content,
      recipientId,
      contentType: 'text',
    });
  };

  const handleEditMessage = async (messageId: string) => {
    // Endpoint disponible: PUT /api/messages/[id] con body: { content: string }
    // Para implementar la UI de edición:
    // 1. Mostrar un input inline en el MessageBubble cuando editingMessageId === messageId
    // 2. Al confirmar, llamar a: await editMessage(messageId, newContent)
    // 3. El hook useMessages ya tiene la función editMessage lista para usar
    console.log('Edit message:', messageId);
    setEditingMessageId(messageId);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (confirm('¿Eliminar este mensaje?')) {
      await deleteMessage(messageId);
    }
  };

  const handleToggleMute = async () => {
    if (!conversation || !onUpdateConversation) return;
    await onUpdateConversation(conversation.id, {
      isMuted: !conversation.isMuted,
    });
  };

  const handleToggleArchive = async () => {
    if (!conversation || !onUpdateConversation) return;
    await onUpdateConversation(conversation.id, {
      isArchived: !conversation.isArchived,
    });
  };

  const handleDeleteConversation = async () => {
    if (!conversation || !onDeleteConversation) return;
    await onDeleteConversation(conversation.id);
    setDeleteDialogOpen(false);
  };

  const getConversationName = (conv: DirectConversation) => {
    if (conv.name) return conv.name;
    return conv.type === 'group' ? 'Grupo sin nombre' : 'Conversación directa';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Empty state
  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20">
        <div className="text-center space-y-4">
          <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-xl font-semibold mb-2">Selecciona una conversación</h3>
            <p className="text-muted-foreground">
              Elige una conversación de la lista o crea una nueva
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <Card className="p-4 rounded-none border-x-0 border-t-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {conversation.icon && <AvatarImage src={conversation.icon} />}
            <AvatarFallback>{getInitials(getConversationName(conversation))}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{getConversationName(conversation)}</h2>
            <p className="text-sm text-muted-foreground">
              {conversation.type === 'group'
                ? `${(conversation.participants as string[]).length} miembros`
                : 'Conversación directa'}
            </p>
          </div>
        </div>

        {/* Menú de opciones */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleToggleMute}>
              {conversation.isMuted ? (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Activar notificaciones
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4 mr-2" />
                  Silenciar
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleArchive}>
              <Archive className="h-4 w-4 mr-2" />
              {conversation.isArchived ? 'Desarchivar' : 'Archivar'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar conversación
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>

      {/* Messages area */}
      <ScrollArea className="flex-1 relative" onScrollCapture={handleScroll}>
        <div ref={scrollContainerRef} className="p-4 space-y-2">
          {/* Loading más mensajes */}
          {loading && hasMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Mensajes */}
          {messages.map((message, index) => {
            const isOwn = message.senderId === userId;
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
                onEdit={isOwn ? handleEditMessage : undefined}
                onDelete={isOwn ? handleDeleteMessage : undefined}
              />
            );
          })}

          {/* Indicador de "escribiendo..." (futuro) */}
          {/* <TypingIndicator /> */}

          {/* Ref para scroll automático */}
          <div ref={messagesEndRef} />
        </div>

        {/* Botón scroll to bottom */}
        {showScrollButton && (
          <Button
            onClick={scrollToBottom}
            size="icon"
            className="absolute bottom-4 right-4 rounded-full shadow-lg"
          >
            <ChevronUp className="h-5 w-5 rotate-180" />
          </Button>
        )}
      </ScrollArea>

      {/* Composer */}
      <MessageComposer onSend={handleSendMessage} sending={sending} />

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los mensajes de esta
              conversación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConversation} className="bg-destructive">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
