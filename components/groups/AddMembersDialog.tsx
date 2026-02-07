"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bot, UserPlus, Loader2, CheckCircle2, Users, Send, UserCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  onMemberAdded?: () => void;
}

interface Agent {
  id: string;
  name: string;
  avatar: string | null;
  description?: string;
  category?: string;
}

interface PendingInvitation {
  invitationId: string;
  inviteCode: string;
  createdAt: string;
  expiresAt: string;
}

interface UserToInvite {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
  isFriend: boolean;
  pendingInvitation: PendingInvitation | null;
}

export function AddMembersDialog({
  open,
  onOpenChange,
  groupId,
  onMemberAdded,
}: AddMembersDialogProps) {
  const [activeTab, setActiveTab] = useState<"ai" | "friends">("ai");
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [friends, setFriends] = useState<UserToInvite[]>([]);
  const [otherUsers, setOtherUsers] = useState<UserToInvite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [addingAgentId, setAddingAgentId] = useState<string | null>(null);
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null);
  const [cancelingInvitationId, setCancelingInvitationId] = useState<string | null>(null);

  // Fetch available agents
  useEffect(() => {
    if (open && activeTab === "ai") {
      fetchAgents();
    }
  }, [open, activeTab]);

  // Fetch users when friends tab is active
  useEffect(() => {
    if (open && activeTab === "friends") {
      fetchUsers();
    }
  }, [open, activeTab, groupId]);

  // Debounced search for users
  useEffect(() => {
    if (activeTab !== "friends") return;

    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setUserSearchQuery("");
    }
  }, [open]);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/agents/available");
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const params = new URLSearchParams();
      if (userSearchQuery) {
        params.set("q", userSearchQuery);
      }

      const response = await fetch(`/api/groups/${groupId}/invite/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
        setOtherUsers(data.others || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [groupId, userSearchQuery]);

  const handleAddAgent = async (agentId: string) => {
    setAddingAgentId(agentId);
    try {
      const response = await fetch(`/api/groups/${groupId}/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });

      if (response.ok) {
        toast.success("IA añadida al grupo");
        onMemberAdded?.();
        onOpenChange(false);
        setSearchQuery("");
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al añadir IA");
      }
    } catch (error) {
      console.error("Error adding agent:", error);
      toast.error("Error al añadir IA");
    } finally {
      setAddingAgentId(null);
    }
  };

  const handleInviteUser = async (userId: string, userName: string | null) => {
    setInvitingUserId(userId);
    try {
      const response = await fetch(`/api/groups/${groupId}/invite/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Invitación enviada a ${userName || "usuario"}`);

        // Actualizar el estado local para reflejar la invitación
        const updateUserList = (users: UserToInvite[]) =>
          users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  pendingInvitation: {
                    invitationId: data.invitation.id,
                    inviteCode: data.invitation.inviteCode,
                    createdAt: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                  },
                }
              : u
          );

        setFriends(updateUserList);
        setOtherUsers(updateUserList);
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al enviar invitación");
      }
    } catch (error) {
      console.error("Error inviting user:", error);
      toast.error("Error al enviar invitación");
    } finally {
      setInvitingUserId(null);
    }
  };

  const handleCancelInvitation = async (userId: string, invitationId: string, userName: string | null) => {
    setCancelingInvitationId(invitationId);
    try {
      const response = await fetch(
        `/api/groups/${groupId}/invite/users?invitationId=${invitationId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        toast.success(`Invitación a ${userName || "usuario"} cancelada`);

        // Actualizar el estado local para reflejar la cancelación
        const updateUserList = (users: UserToInvite[]) =>
          users.map((u) =>
            u.id === userId ? { ...u, pendingInvitation: null } : u
          );

        setFriends(updateUserList);
        setOtherUsers(updateUserList);
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al cancelar invitación");
      }
    } catch (error) {
      console.error("Error canceling invitation:", error);
      toast.error("Error al cancelar invitación");
    } finally {
      setCancelingInvitationId(null);
    }
  };

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderUserItem = (user: UserToInvite) => {
    const isInvited = !!user.pendingInvitation;
    const isInviting = invitingUserId === user.id;
    const isCanceling = cancelingInvitationId === user.pendingInvitation?.invitationId;

    return (
      <div
        key={user.id}
        className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-xl hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.image || undefined} alt={user.name || ""} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">{user.name || "Usuario"}</h4>
              {user.isFriend && (
                <span className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-full flex-shrink-0">
                  Amigo
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>

        {isInvited ? (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-green-500 flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              Invitado
            </span>
            <Button
              onClick={() =>
                handleCancelInvitation(
                  user.id,
                  user.pendingInvitation!.invitationId,
                  user.name
                )
              }
              disabled={isCanceling}
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              title="Cancelar invitación"
            >
              {isCanceling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => handleInviteUser(user.id, user.name)}
            disabled={isInviting}
            size="sm"
            className="ml-2 gap-1"
          >
            {isInviting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Invitar
              </>
            )}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Añadir al Grupo</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "ai" | "friends")} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot size={16} />
              Buscar IA
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <UserPlus size={16} />
              Invitar Usuarios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="flex-1 flex flex-col overflow-hidden mt-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Buscar personaje (ej. Einstein, Mario...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Agents List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    {searchQuery
                      ? "No se encontraron IAs con ese nombre"
                      : "No hay IAs disponibles"}
                  </p>
                </div>
              ) : (
                filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {agent.avatar ? (
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                          <Bot size={20} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">{agent.name}</h4>
                          <CheckCircle2 size={12} className="text-indigo-400 flex-shrink-0" fill="currentColor" />
                        </div>
                        {agent.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {agent.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAddAgent(agent.id)}
                      disabled={addingAgentId === agent.id}
                      size="sm"
                      className="ml-2"
                    >
                      {addingAgentId === agent.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Añadir"
                      )}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="friends" className="flex-1 flex flex-col overflow-hidden mt-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Buscar usuarios para invitar..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : friends.length === 0 && otherUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    {userSearchQuery
                      ? "No se encontraron usuarios"
                      : "No tienes amigos disponibles para invitar"}
                  </p>
                  <p className="text-xs mt-1">
                    Busca usuarios por nombre o email
                  </p>
                </div>
              ) : (
                <>
                  {/* Friends section */}
                  {friends.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Tus amigos
                      </h3>
                      <div className="space-y-2">
                        {friends.map(renderUserItem)}
                      </div>
                    </div>
                  )}

                  {/* Other users section */}
                  {otherUsers.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Otros usuarios
                      </h3>
                      <div className="space-y-2">
                        {otherUsers.map(renderUserItem)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
