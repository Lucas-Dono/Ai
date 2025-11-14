/**
 * Hook para manejar notificaciones de bonds en tiempo real
 */

import { useEffect, useState, useCallback } from "react";
import { useBondSocket } from "./useBondSocket";
import { BondEventType } from "@/lib/websocket/bonds-events";
import { toast } from "sonner"; // Using sonner for toast notifications

interface BondNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
  link?: string;
  priority: "low" | "medium" | "high" | "urgent";
  read: boolean;
  createdAt: string;
}

export function useBondNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<BondNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const { connected, on, off } = useBondSocket();

  // Fetch initial notifications
  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
  }, [userId]);

  // Subscribe to real-time events
  useEffect(() => {
    if (!connected || !userId) return;

    // Handler for slot available
    const handleSlotAvailable = (event: any) => {
      showToast({
        type: "slot_available",
        title: "🎉 ¡Slot Disponible!",
        message: `Un slot está disponible. ¡Reclámalo ahora!`,
        link: "/bonds/queue",
        priority: "urgent",
      });
      fetchNotifications();
    };

    // Handler for rank changed
    const handleRankChanged = (event: any) => {
      const improved = event.newRank < event.oldRank;
      showToast({
        type: "rank_changed",
        title: improved ? "📈 Ranking Mejorado" : "📉 Cambio en Ranking",
        message: `Ahora estás en #${event.newRank}`,
        link: `/bonds/${event.bondId}`,
        priority: event.newRank <= 10 ? "high" : "medium",
      });
      fetchNotifications();
    };

    // Handler for milestone reached
    const handleMilestoneReached = (event: any) => {
      showToast({
        type: "milestone_reached",
        title: "🏆 Logro Desbloqueado",
        message: event.milestoneName,
        link: `/bonds/${event.bondId}`,
        priority: "medium",
      });
      fetchNotifications();
    };

    // Handler for bond at risk
    const handleBondAtRisk = (event: any) => {
      showToast({
        type: "bond_at_risk",
        title: event.status === "at_risk" ? "🚨 Vínculo en Riesgo" : "⚠️ Atención Requerida",
        message: "Tu vínculo necesita interacción pronto",
        link: `/bonds/${event.bondId}`,
        priority: event.status === "at_risk" ? "urgent" : "high",
      });
      fetchNotifications();
    };

    // Handler for queue position changed
    const handleQueuePositionChanged = (event: any) => {
      if (event.position === 1) {
        showToast({
          type: "queue_first",
          title: "🎉 ¡Eres el Siguiente!",
          message: "Estás primero en la cola",
          link: "/bonds/queue",
          priority: "high",
        });
      }
      fetchNotifications();
    };

    on(BondEventType.SLOT_AVAILABLE, handleSlotAvailable);
    on(BondEventType.RANK_CHANGED, handleRankChanged);
    on(BondEventType.MILESTONE_REACHED, handleMilestoneReached);
    on(BondEventType.BOND_AT_RISK, handleBondAtRisk);
    on(BondEventType.QUEUE_POSITION_CHANGED, handleQueuePositionChanged);

    return () => {
      off(BondEventType.SLOT_AVAILABLE, handleSlotAvailable);
      off(BondEventType.RANK_CHANGED, handleRankChanged);
      off(BondEventType.MILESTONE_REACHED, handleMilestoneReached);
      off(BondEventType.BOND_AT_RISK, handleBondAtRisk);
      off(BondEventType.QUEUE_POSITION_CHANGED, handleQueuePositionChanged);
    };
  }, [connected, userId, on, off]);

  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/bonds/notifications?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching bond notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await fetch(`/api/bonds/notifications/${notificationId}/read`, {
          method: "POST",
        });
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await fetch(`/api/bonds/notifications/mark-all-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }, [userId]);

  const showToast = (notification: Partial<BondNotification>) => {
    const { title, message, link, priority } = notification;

    // Determine toast styling based on priority
    const toastOptions: any = {
      duration: priority === "urgent" ? 10000 : priority === "high" ? 7000 : 5000,
    };

    if (link) {
      toastOptions.action = {
        label: "Ver",
        onClick: () => {
          window.location.href = link;
        },
      };
    }

    // Show toast with appropriate styling
    if (priority === "urgent") {
      toast.error(message, { ...toastOptions, description: title });
    } else if (priority === "high") {
      toast.warning(message, { ...toastOptions, description: title });
    } else {
      toast.success(message, { ...toastOptions, description: title });
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
