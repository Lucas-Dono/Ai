'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, User, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface NewConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateConversation: (participants: string[], options?: { name?: string; type?: 'direct' | 'group' }) => Promise<void>;
}

export function NewConversationModal({
  open,
  onOpenChange,
  onCreateConversation,
}: NewConversationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [conversationType, setConversationType] = useState<'direct' | 'group'>('direct');

  // Buscar usuarios
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);

        if (!response.ok) {
          throw new Error('Error al buscar usuarios');
        }

        const data = await response.json();
        setSearchResults(data.users || []);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelectUser = (user: User) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      if (conversationType === 'direct' && selectedUsers.length >= 1) {
        // Solo 1 usuario para conversaciones directas
        setSelectedUsers([user]);
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;

    try {
      setCreating(true);
      const participantIds = selectedUsers.map((u) => u.id);

      const options: any = {
        type: conversationType,
      };

      if (conversationType === 'group' && groupName.trim()) {
        options.name = groupName.trim();
      }

      await onCreateConversation(participantIds, options);

      // Reset y cerrar
      setSelectedUsers([]);
      setSearchQuery('');
      setGroupName('');
      setConversationType('direct');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setCreating(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isValid =
    selectedUsers.length > 0 &&
    (conversationType === 'direct' || (conversationType === 'group' && selectedUsers.length >= 2));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Nueva conversación</DialogTitle>
        </DialogHeader>

        <Tabs value={conversationType} onValueChange={(v) => setConversationType(v as any)}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="direct" className="flex-1">
              <User className="h-4 w-4 mr-2" />
              Directa
            </TabsTrigger>
            <TabsTrigger value="group" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Grupo
            </TabsTrigger>
          </TabsList>

          <TabsContent value={conversationType} className="space-y-4">
            {/* Usuarios seleccionados */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-accent rounded-2xl">
                {selectedUsers.map((user) => (
                  <Badge key={user.id} variant="secondary" className="px-3 py-1.5">
                    <span className="mr-2">{user.name || user.email}</span>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Nombre de grupo (solo si es grupo) */}
            {conversationType === 'group' && (
              <div className="space-y-2">
                <Label>Nombre del grupo (opcional)</Label>
                <Input
                  placeholder="Ej: Equipo de desarrollo"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
            )}

            {/* Búsqueda de usuarios */}
            <div className="space-y-2">
              <Label>
                Buscar usuarios {conversationType === 'direct' ? '(1)' : '(mínimo 2)'}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Resultados de búsqueda */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => {
                  const isSelected = selectedUsers.find((u) => u.id === user.id);

                  return (
                    <Card
                      key={user.id}
                      className={cn(
                        'p-3 cursor-pointer transition-all hover:shadow-md',
                        isSelected && 'bg-primary/10 border-primary'
                      )}
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {user.image && <AvatarImage src={user.image} />}
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{user.name || 'Sin nombre'}</p>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                        {isSelected && <Badge variant="default">Seleccionado</Badge>}
                      </div>
                    </Card>
                  );
                })
              ) : searchQuery.length >= 2 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron usuarios
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Escribe al menos 2 caracteres para buscar
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={!isValid || creating}>
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear conversación'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
