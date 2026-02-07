/**
 * Notification Types and Utilities
 */

// Tipos de notificaciones
export enum NotificationType {
  NEW_POST = 'new_post',
  NEW_COMMENT = 'new_comment',
  COMMENT_REPLY = 'comment_reply',
  POST_MILESTONE = 'post_milestone',
  AWARD_RECEIVED = 'award_received',
  ANSWER_ACCEPTED = 'answer_accepted',
  NEW_FOLLOWER = 'new_follower',
  EVENT_INVITATION = 'event_invitation',
  EVENT_REMINDER = 'event_reminder',
  BADGE_EARNED = 'badge_earned',
  LEVEL_UP = 'level_up',
  DIRECT_MESSAGE = 'direct_message',
  PROJECT_ACCEPTED = 'project_accepted',
  MENTION = 'mention',
  UPVOTE = 'upvote',
}

// Interfaz de notificación
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

// Response de la API de notificaciones
export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  totalPages: number;
}

// Badge de tipo de notificación
export interface NotificationBadgeConfig {
  label: string;
  color: string;
  icon?: string;
}

// Configuración de badges por tipo
export const NOTIFICATION_BADGE_CONFIG: Record<string, NotificationBadgeConfig> = {
  [NotificationType.NEW_POST]: {
    label: 'Nuevo post',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  [NotificationType.NEW_COMMENT]: {
    label: 'Comentario',
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  [NotificationType.COMMENT_REPLY]: {
    label: 'Respuesta',
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  [NotificationType.POST_MILESTONE]: {
    label: 'Milestone',
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  [NotificationType.AWARD_RECEIVED]: {
    label: 'Award',
    color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  },
  [NotificationType.ANSWER_ACCEPTED]: {
    label: 'Aceptada',
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  [NotificationType.NEW_FOLLOWER]: {
    label: 'Seguidor',
    color: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  },
  [NotificationType.EVENT_INVITATION]: {
    label: 'Evento',
    color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  },
  [NotificationType.EVENT_REMINDER]: {
    label: 'Recordatorio',
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  },
  [NotificationType.BADGE_EARNED]: {
    label: 'Badge',
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  [NotificationType.LEVEL_UP]: {
    label: 'Level Up',
    color: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  },
  [NotificationType.DIRECT_MESSAGE]: {
    label: 'Mensaje',
    color: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  },
  [NotificationType.PROJECT_ACCEPTED]: {
    label: 'Proyecto',
    color: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
  },
  [NotificationType.MENTION]: {
    label: 'Mención',
    color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  },
  [NotificationType.UPVOTE]: {
    label: 'Upvote',
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  },
};

// Helper para obtener config de badge
export function getBadgeConfig(type: string): NotificationBadgeConfig {
  return NOTIFICATION_BADGE_CONFIG[type] || {
    label: 'Notificación',
    color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };
}

// Helper para formatear tiempo relativo
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Ahora mismo';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `Hace ${diffInWeeks} ${diffInWeeks === 1 ? 'semana' : 'semanas'}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `Hace ${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`;
}

// Helper para truncar texto
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
