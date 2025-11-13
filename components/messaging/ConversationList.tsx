'use client';

import { useState, useMemo } from 'react';
import { DirectConversation } from '@/types/messaging';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Archive, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ConversationListProps {
  conversations: DirectConversation[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
  loading?: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNewConversation,
  loading,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');

  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Aplicar filtro
    if (filter === 'unread') {
      filtered = filtered.filter((conv) => (conv.unreadCount || 0) > 0);
    } else if (filter === 'archived') {
      filtered = filtered.filter((conv) => conv.isArchived);
    } else {
      filtered = filtered.filter((conv) => !conv.isArchived);
    }

    // Aplicar búsqueda
    if (searchQuery) {
      filtered = filtered.filter((conv) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          conv.name?.toLowerCase().includes(searchLower) ||
          conv.lastMessagePreview?.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [conversations, filter, searchQuery]);

  const getConversationName = (conv: DirectConversation) => {
    if (conv.name) return conv.name;
    // Para conversaciones 1-on-1, mostrar "Conversación directa"
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageSquare className="h-8 w-8 animate-pulse mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Mensajes</h2>
          <Button onClick={onNewConversation} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva
          </Button>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              Todas
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              No leídas
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex-1">
              <Archive className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div>
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'No se encontraron conversaciones'
                  : filter === 'unread'
                  ? 'No tienes mensajes sin leer'
                  : filter === 'archived'
                  ? 'No tienes conversaciones archivadas'
                  : 'No tienes conversaciones'}
              </p>
              {!searchQuery && filter === 'all' && (
                <Button onClick={onNewConversation} className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear conversación
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => {
              const isSelected = selectedId === conversation.id;
              const unreadCount = conversation.unreadCount || 0;

              return (
                <Card
                  key={conversation.id}
                  className={cn(
                    'p-3 cursor-pointer transition-all hover:shadow-md',
                    isSelected && 'bg-accent border-primary'
                  )}
                  onClick={() => onSelect(conversation.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      {conversation.icon ? (
                        <AvatarImage src={conversation.icon} />
                      ) : null}
                      <AvatarFallback>
                        {getInitials(getConversationName(conversation))}
                      </AvatarFallback>
                    </Avatar>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm truncate">
                          {getConversationName(conversation)}
                        </h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p
                          className={cn(
                            'text-sm truncate',
                            unreadCount > 0
                              ? 'text-foreground font-medium'
                              : 'text-muted-foreground'
                          )}
                        >
                          {conversation.lastMessagePreview || 'No hay mensajes'}
                        </p>

                        {unreadCount > 0 && (
                          <Badge variant="default" className="ml-2 flex-shrink-0">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>

                      {/* Indicadores */}
                      <div className="flex items-center gap-2 mt-1">
                        {conversation.isMuted && (
                          <Badge variant="secondary" className="text-xs">
                            Silenciado
                          </Badge>
                        )}
                        {conversation.type === 'group' && (
                          <Badge variant="outline" className="text-xs">
                            Grupo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
