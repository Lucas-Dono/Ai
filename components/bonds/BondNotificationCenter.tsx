"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useBondNotifications } from "@/hooks/useBondNotifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BellIcon,
  CheckCheckIcon,
  SparklesIcon,
  TrophyIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  BookOpenIcon,
  UsersIcon,
  HeartIcon,
  ClockIcon,
  XIcon,
} from "lucide-react";

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

const NOTIFICATION_ICONS: Record<string, any> = {
  bond_slot_available: SparklesIcon,
  bond_slot_expiring: ClockIcon,
  bond_established: HeartIcon,
  bond_at_risk: AlertTriangleIcon,
  bond_critical: AlertTriangleIcon,
  bond_rank_changed: TrendingUpIcon,
  bond_rank_top_10: TrophyIcon,
  bond_milestone_reached: TrophyIcon,
  bond_narrative_unlocked: BookOpenIcon,
  bond_queue_improved: UsersIcon,
  bond_affinity_milestone: HeartIcon,
  bond_rarity_upgraded: SparklesIcon,
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-500/20 border-red-500/50 text-red-400",
  high: "bg-orange-500/20 border-orange-500/50 text-orange-400",
  medium: "bg-blue-500/20 border-blue-500/50 text-blue-400",
  low: "bg-gray-500/20 border-gray-500/50 text-gray-400",
};

export default function BondNotificationCenter({ userId }: { userId: string }) {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useBondNotifications(userId);

  return (
    <Card className="border-purple-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellIcon className="h-5 w-5 text-purple-500" />
            <CardTitle>Notificaciones de Vínculos</CardTitle>
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="animate-pulse"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <CheckCheckIcon className="h-4 w-4 mr-1" />
              Marcar todas leídas
            </Button>
          )}
        </div>
        <CardDescription>
          Mantente al tanto de tus vínculos y eventos importantes
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-800 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <BellIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tienes notificaciones de vínculos</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: BondNotification;
  onMarkAsRead: (id: string) => void;
}) {
  const Icon = NOTIFICATION_ICONS[notification.type] || BellIcon;
  const priorityColor = PRIORITY_COLORS[notification.priority] || PRIORITY_COLORS.medium;

  const timeAgo = getTimeAgo(notification.createdAt);

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.01, x: 4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {notification.link ? (
        <Link href={notification.link} onClick={handleClick}>
          <NotificationContent
            notification={notification}
            Icon={Icon}
            priorityColor={priorityColor}
            timeAgo={timeAgo}
          />
        </Link>
      ) : (
        <div onClick={handleClick}>
          <NotificationContent
            notification={notification}
            Icon={Icon}
            priorityColor={priorityColor}
            timeAgo={timeAgo}
          />
        </div>
      )}
    </motion.div>
  );
}

function NotificationContent({
  notification,
  Icon,
  priorityColor,
  timeAgo,
}: {
  notification: BondNotification;
  Icon: any;
  priorityColor: string;
  timeAgo: string;
}) {
  return (
    <div
      className={`relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
        notification.read
          ? "border-gray-700 bg-gray-800/30 opacity-70 hover:opacity-100"
          : `${priorityColor} hover:bg-opacity-80`
      }`}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
      )}

      {/* Icon */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full ${
          notification.read ? "bg-gray-700" : "bg-purple-600"
        } flex items-center justify-center`}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4
            className={`font-semibold text-sm ${
              notification.read ? "text-gray-400" : "text-white"
            }`}
          >
            {notification.title}
          </h4>
          {notification.priority === "urgent" && !notification.read && (
            <Badge variant="destructive" className="text-xs">
              Urgente
            </Badge>
          )}
        </div>

        <p
          className={`text-sm mb-2 ${
            notification.read ? "text-gray-500" : "text-gray-300"
          }`}
        >
          {notification.message}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{timeAgo}</span>
          {notification.link && !notification.read && (
            <span className="text-xs text-purple-400 font-medium">
              Ver detalles →
            </span>
          )}
        </div>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Ahora";
  if (diffMinutes < 60) return `Hace ${diffMinutes}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;

  return date.toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
  });
}
