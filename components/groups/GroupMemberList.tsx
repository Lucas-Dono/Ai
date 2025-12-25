"use client";

import { useState } from "react";
import { User, Bot, Crown, Shield, MoreVertical, UserX, Settings } from "lucide-react";

interface GroupMemberListProps {
  groupId: string;
  members: Array<{
    id: string;
    memberType: string;
    role: string;
    isActive: boolean;
    isMuted: boolean;
    totalMessages: number;
    user?: {
      id: string;
      name: string | null;
      image: string | null;
    } | null;
    agent?: {
      id: string;
      name: string;
      avatar: string | null;
    } | null;
  }>;
  currentUserRole?: string;
  onRemoveMember?: (memberId: string) => Promise<void>;
  onUpdateMember?: (memberId: string, updates: any) => Promise<void>;
}

export function GroupMemberList({
  groupId,
  members,
  currentUserRole = "member",
  onRemoveMember,
  onUpdateMember,
}: GroupMemberListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const canManageMembers = currentUserRole === "owner" || currentUserRole === "moderator";

  const handleRemoveMember = async (memberId: string) => {
    if (!onRemoveMember) return;
    if (!confirm("¿Estás seguro de que quieres remover a este miembro?")) return;

    setIsLoading(memberId);
    try {
      await onRemoveMember(memberId);
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error removing member:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleToggleMute = async (memberId: string, currentlyMuted: boolean) => {
    if (!onUpdateMember) return;

    setIsLoading(memberId);
    try {
      await onUpdateMember(memberId, { isMuted: !currentlyMuted });
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error updating member:", error);
    } finally {
      setIsLoading(null);
    }
  };

  // Group members by type
  const userMembers = members.filter((m) => m.memberType === "user" && m.isActive);
  const aiMembers = members.filter((m) => m.memberType === "agent" && m.isActive);

  // Sort by role
  const sortedUserMembers = [...userMembers].sort((a, b) => {
    const roleOrder = { owner: 0, moderator: 1, member: 2 };
    return (
      roleOrder[a.role as keyof typeof roleOrder] -
      roleOrder[b.role as keyof typeof roleOrder]
    );
  });

  return (
    <div className="space-y-6">
      {/* Users section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">
            Usuarios ({userMembers.length})
          </h3>
        </div>

        <div className="space-y-2">
          {sortedUserMembers.map((member) => {
            const isMenuOpen = openMenuId === member.id;
            const isOwner = member.role === "owner";
            const isModerator = member.role === "moderator";

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {member.user?.image ? (
                    <img
                      src={member.user.image}
                      alt={member.user.name || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  )}

                  {/* Role badge */}
                  {isOwner && (
                    <div
                      className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-background"
                      title="Owner"
                    >
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {isModerator && (
                    <div
                      className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-background"
                      title="Moderador"
                    >
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {member.user?.name || "Usuario"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {member.totalMessages} mensajes
                    {member.isMuted && (
                      <span className="ml-2 text-yellow-600">• Silenciado</span>
                    )}
                  </div>
                </div>

                {/* Actions menu */}
                {canManageMembers && !isOwner && (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(isMenuOpen ? null : member.id)
                      }
                      className="p-2 hover:bg-muted rounded transition-colors"
                      disabled={isLoading === member.id}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />

                        {/* Menu */}
                        <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                          <button
                            onClick={() =>
                              handleToggleMute(member.id, member.isMuted)
                            }
                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
                          >
                            {member.isMuted ? "Desilenciar" : "Silenciar"}
                          </button>

                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <UserX className="w-4 h-4" />
                              <span>Remover</span>
                            </div>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AIs section */}
      {aiMembers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">
              Inteligencias Artificiales ({aiMembers.length})
            </h3>
          </div>

          <div className="space-y-2">
            {aiMembers.map((member) => {
              const isMenuOpen = openMenuId === member.id;

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {member.agent?.avatar ? (
                      <img
                        src={member.agent.avatar}
                        alt={member.agent.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-purple-500" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {member.agent?.name}
                      </span>
                      <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-semibold rounded">
                        IA
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {member.totalMessages} mensajes
                    </div>
                  </div>

                  {/* Actions menu */}
                  {canManageMembers && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(isMenuOpen ? null : member.id)
                        }
                        className="p-2 hover:bg-muted rounded transition-colors"
                        disabled={isLoading === member.id}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <>
                          {/* Backdrop */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />

                          {/* Menu */}
                          <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <UserX className="w-4 h-4" />
                                <span>Remover IA</span>
                              </div>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
