import { useState, useEffect, useCallback, useRef } from 'react';
import { DirectMessage, SendMessageRequest, MessagesResponse } from '@/types/messaging';

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(
    async (pageNum: number = 1) => {
      if (!conversationId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/messages/conversations/${conversationId}/messages?page=${pageNum}&limit=50`
        );

        if (!response.ok) {
          throw new Error('Error al obtener mensajes');
        }

        const data: MessagesResponse = await response.json();

        if (pageNum === 1) {
          setMessages(data.messages);
        } else {
          setMessages((prev) => [...data.messages, ...prev]);
        }

        setHasMore(data.page < data.totalPages);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    },
    [conversationId]
  );

  const sendMessage = useCallback(
    async (data: SendMessageRequest) => {
      if (!conversationId) return;

      try {
        setSending(true);

        const response = await fetch(
          `/api/messages/conversations/${conversationId}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al enviar mensaje');
        }

        const message = await response.json();
        setMessages((prev) => [...prev, message]);

        // Scroll al final
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        return message;
      } catch (err: any) {
        console.error('Error sending message:', err);
        throw err;
      } finally {
        setSending(false);
      }
    },
    [conversationId]
  );

  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!conversationId) return;

      try {
        const response = await fetch(
          `/api/messages/conversations/${conversationId}/messages/${messageId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
          }
        );

        if (!response.ok) {
          throw new Error('Error al editar mensaje');
        }

        const updated = await response.json();
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? updated : msg))
        );
        return updated;
      } catch (err: any) {
        console.error('Error editing message:', err);
        throw err;
      }
    },
    [conversationId]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!conversationId) return;

      try {
        const response = await fetch(
          `/api/messages/conversations/${conversationId}/messages/${messageId}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error('Error al eliminar mensaje');
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, isDeleted: true, content: '[Mensaje eliminado]' }
              : msg
          )
        );
      } catch (err: any) {
        console.error('Error deleting message:', err);
        throw err;
      }
    },
    [conversationId]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage);
    }
  }, [loading, hasMore, page, fetchMessages]);

  useEffect(() => {
    if (conversationId) {
      setPage(1);
      setMessages([]);
      setHasMore(true);
      fetchMessages(1);
    }
  }, [conversationId, fetchMessages]);

  // Auto-scroll al último mensaje en carga inicial
  useEffect(() => {
    if (messages.length > 0 && page === 1) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    }
  }, [messages.length, page]);

  return {
    messages,
    loading,
    error,
    sending,
    hasMore,
    sendMessage,
    editMessage,
    deleteMessage,
    loadMore,
    refresh: () => fetchMessages(1),
    messagesEndRef,
  };
}
