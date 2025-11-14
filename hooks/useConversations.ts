import { useState, useEffect, useCallback } from 'react';
import { DirectConversation, CreateConversationRequest } from '@/types/messaging';

export function useConversations() {
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messages/conversations');

      if (!response.ok) {
        throw new Error('Error al obtener conversaciones');
      }

      const data = await response.json();
      setConversations(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createConversation = useCallback(async (data: CreateConversationRequest) => {
    try {
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear conversación');
      }

      const conversation = await response.json();
      setConversations((prev) => [conversation, ...prev]);
      return conversation;
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      throw err;
    }
  }, []);

  const updateConversation = useCallback(
    async (conversationId: string, data: { isMuted?: boolean; isArchived?: boolean }) => {
      try {
        const response = await fetch(`/api/messages/conversations/${conversationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Error al actualizar conversación');
        }

        const updated = await response.json();
        setConversations((prev) =>
          prev.map((conv) => (conv.id === conversationId ? updated : conv))
        );
        return updated;
      } catch (err: any) {
        console.error('Error updating conversation:', err);
        throw err;
      }
    },
    []
  );

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar conversación');
      }

      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
    } catch (err: any) {
      console.error('Error deleting conversation:', err);
      throw err;
    }
  }, []);

  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}/read`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al marcar como leído');
      }

      // Actualizar unreadCount localmente
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (err: any) {
      console.error('Error marking as read:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refresh: fetchConversations,
    createConversation,
    updateConversation,
    deleteConversation,
    markAsRead,
  };
}
