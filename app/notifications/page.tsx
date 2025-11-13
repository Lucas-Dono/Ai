/**
 * Notifications Center Page
 * Página completa para gestionar notificaciones
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Trash2,
  Search,
  Filter,
  ExternalLink,
  Check,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNotifications } from '@/hooks/use-notifications';
import { getBadgeConfig, formatRelativeTime } from '@/types/notifications';
import type { Notification } from '@/types/notifications';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'unread' | 'mentions' | 'interactions';

export default function NotificationsPage() {
  const t = useTranslations('notifications');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    total,
    totalPages,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    isMarkingAsRead,
    isDeleting,
    isLoading,
  } = useNotifications({ page: currentPage, limit: 20, filter });

  // Filtrar por búsqueda
  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como leída
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navegar a la URL de acción
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteAll = async () => {
    if (confirm(t('deleteAllConfirm'))) {
      await deleteAllNotifications();
    }
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container max-w-5xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground">
                {unreadCount > 0
                  ? t('subtitle', {
                      count: unreadCount,
                      plural: unreadCount === 1 ? '' : 's'
                    })
                  : t('noUnread')}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAsRead}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                {t('markAllAsRead')}
              </Button>
            )}
            {total > 0 && (
              <Button
                variant="outline"
                onClick={handleDeleteAll}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('deleteAll')}
              </Button>
            )}
          </div>
        </div>

        {/* Tabs de filtro */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              {t('tabs.all')} {total > 0 && `(${total})`}
            </TabsTrigger>
            <TabsTrigger value="unread">
              {t('tabs.unread')} {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger value="mentions">{t('tabs.mentions')}</TabsTrigger>
            <TabsTrigger value="interactions">{t('tabs.interactions')}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Lista de notificaciones */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery
                  ? t('empty.noResults')
                  : t('empty.noNotifications')}
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {searchQuery
                  ? t('empty.tryAnother')
                  : t('empty.whenYouReceive')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  onMarkAsRead={() => markAsRead(notification.id)}
                  onDelete={() => handleDelete(notification.id)}
                  isDeleting={isDeleting}
                  t={t}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  {t('pagination.previous')}
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  {t('pagination.pageOf', { current: currentPage, total: totalPages })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('pagination.next')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Componente de tarjeta de notificación
function NotificationCard({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
  isDeleting,
  t,
}: {
  notification: Notification;
  onClick: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  t: any;
}) {
  const badgeConfig = getBadgeConfig(notification.type);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card
        className={cn(
          'transition-all hover:shadow-lg cursor-pointer',
          !notification.isRead && 'border-primary/50 bg-accent/20'
        )}
      >
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Indicador de no leída */}
            <div className="flex flex-col items-center gap-2">
              {!notification.isRead && (
                <div className="h-3 w-3 rounded-full bg-primary mt-1" />
              )}
            </div>

            {/* Contenido principal */}
            <div className="flex-1 min-w-0" onClick={onClick}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-base">{notification.title}</h3>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </div>

              <p
                className={cn(
                  'text-sm text-muted-foreground mb-3',
                  !expanded && 'line-clamp-2'
                )}
              >
                {notification.message}
              </p>

              {/* Badge de tipo */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={cn(
                    'text-xs px-3 py-1 rounded-full border font-medium',
                    badgeConfig.color
                  )}
                >
                  {badgeConfig.label}
                </span>
                {notification.actionUrl && (
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Metadata expandible */}
              {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                  }}
                  className="text-xs"
                >
                  {expanded ? t('card.viewLess') : t('card.viewMore')}
                </Button>
              )}

              {expanded && notification.metadata && (
                <div className="mt-3 p-3 bg-muted/50 rounded-2xl">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(notification.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-2">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead();
                  }}
                  title={t('card.markAsRead')}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                disabled={isDeleting}
                title={t('card.delete')}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
