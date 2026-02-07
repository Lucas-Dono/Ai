'use client';

import { useState } from 'react';
import { DirectMessage } from '@/types/messaging';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit2, Trash2, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MessageBubbleProps {
  message: DirectMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  const getInitials = (senderId: string) => {
    return senderId.slice(0, 2).toUpperCase();
  };

  const formatTime = (date: Date | string) => {
    return format(new Date(date), 'HH:mm', { locale: es });
  };

  if (message.isDeleted) {
    return (
      <div
        className={cn('flex gap-2 mb-4', isOwn ? 'justify-end' : 'justify-start')}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {!isOwn && showAvatar && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            {message.sender?.image && <AvatarImage src={message.sender.image} />}
            <AvatarFallback>{getInitials(message.senderId)}</AvatarFallback>
          </Avatar>
        )}

        <div
          className={cn(
            'max-w-[70%] px-4 py-2 rounded-2xl',
            isOwn
              ? 'bg-muted text-muted-foreground italic'
              : 'bg-muted text-muted-foreground italic'
          )}
        >
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex gap-2 mb-4 group', isOwn ? 'justify-end' : 'justify-start')}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar izquierda (otros usuarios) */}
      {!isOwn && showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          {message.sender?.image && <AvatarImage src={message.sender.image} />}
          <AvatarFallback>
            {message.sender?.name ? getInitials(message.sender.name) : getInitials(message.senderId)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Contenido del mensaje */}
      <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
        {/* Nombre del remitente (solo si no es propio) */}
        {!isOwn && message.sender?.name && (
          <span className="text-xs text-muted-foreground mb-1 px-3">
            {message.sender.name}
          </span>
        )}

        {/* Burbuja */}
        <div className="flex items-end gap-2">
          {/* Menú de acciones (izquierda para mensajes propios) */}
          {isOwn && showActions && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(message.id)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(message.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div
            className={cn(
              'px-4 py-2 rounded-2xl shadow-sm max-w-[70%]',
              isOwn
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-card border border-border rounded-bl-sm'
            )}
          >
            {/* Contenido */}
            {message.contentType === 'text' && (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            )}

            {message.contentType === 'image' && message.attachmentUrl && (
              <div className="space-y-2">
                <img
                  src={message.attachmentUrl}
                  alt="Imagen adjunta"
                  className="rounded-2xl max-w-full h-auto"
                />
                {message.content && (
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                )}
              </div>
            )}

            {/* Metadata */}
            <div
              className={cn(
                'flex items-center gap-1 mt-1',
                isOwn ? 'justify-end' : 'justify-start'
              )}
            >
              {message.isEdited && (
                <span
                  className={cn(
                    'text-xs',
                    isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}
                >
                  editado
                </span>
              )}
              <span
                className={cn(
                  'text-xs',
                  isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}
              >
                {formatTime(message.createdAt)}
              </span>

              {/* Estado de lectura (solo mensajes propios) */}
              {isOwn && (
                <span className="ml-1">
                  {message.isRead ? (
                    <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                  ) : (
                    <Check className="h-3 w-3 text-primary-foreground/70" />
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Menú de acciones (derecha para mensajes de otros) */}
          {!isOwn && showActions && (
            <div className="h-6 w-6"></div> // Espaciador para simetría
          )}
        </div>
      </div>

      {/* Avatar derecha (mensajes propios) - opcional */}
      {isOwn && showAvatar && <div className="h-8 w-8 flex-shrink-0"></div>}
    </div>
  );
}
