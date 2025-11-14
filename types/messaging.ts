/**
 * Types for Messaging System
 */

export type ConversationType = 'direct' | 'group';

export type MessageContentType = 'text' | 'image' | 'file' | 'shared_post' | 'shared_item';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;

  // Contenido
  content: string;
  contentType: MessageContentType;

  // Metadata para tipos especiales
  attachmentUrl?: string | null;
  sharedItemId?: string | null;
  sharedItemType?: string | null;

  // Estado
  isRead: boolean;
  isEdited: boolean;
  isDeleted: boolean;

  // Reacciones
  reactions: Array<{ emoji: string; userId: string }>;

  createdAt: Date | string;
  updatedAt: Date | string;
  readAt?: Date | string | null;

  // Relaciones (opcional)
  sender?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface DirectConversation {
  id: string;

  // Tipo
  type: ConversationType;

  // Nombre (para grupos)
  name?: string | null;
  icon?: string | null;

  // Participantes (array de user IDs)
  participants: string[];

  // Metadata
  lastMessageAt: Date | string;
  lastMessagePreview?: string | null;

  // Configuración
  isMuted: boolean;
  isArchived: boolean;

  createdAt: Date | string;
  updatedAt: Date | string;

  // Relaciones (opcional)
  messages?: DirectMessage[];
  unreadCount?: number;
}

export interface ConversationWithDetails extends DirectConversation {
  otherParticipants?: Array<{
    id: string;
    name: string | null;
    image: string | null;
    email?: string | null;
  }>;
  lastMessage?: DirectMessage;
}

export interface MessagesResponse {
  messages: DirectMessage[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateConversationRequest {
  participants: string[];
  type?: ConversationType;
  name?: string;
  icon?: string;
}

export interface SendMessageRequest {
  content: string;
  recipientId: string;
  contentType?: MessageContentType;
  attachmentUrl?: string;
  sharedItemId?: string;
  sharedItemType?: string;
}

export interface UpdateConversationRequest {
  isMuted?: boolean;
  isArchived?: boolean;
  name?: string;
  icon?: string;
}

export interface EditMessageRequest {
  content: string;
}
