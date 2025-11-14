import { useState, useEffect, useCallback } from 'react';

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messages/conversations');

      if (!response.ok) {
        throw new Error('Error al obtener contador');
      }

      const conversations = await response.json();
      const total = conversations.reduce(
        (acc: number, conv: any) => acc + (conv.unreadCount || 0),
        0
      );

      setUnreadCount(total);
    } catch (err: any) {
      console.error('Error fetching unread count:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    loading,
    refresh: fetchUnreadCount,
  };
}
