"use client";

import { useState } from "react";
import { User, Bot, Crown, Shield, MoreVertical, UserX, Settings, UserPlus, CheckCircle2 } from "lucide-react";

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
  onAddClick?: () => void;
}

export function GroupMemberList({
  groupId,
  members,
  currentUserRole = "member",
  onRemoveMember,
  onUpdateMember,
  onAddClick,
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
        <h3 className="font-bold text-neutral-300 text-sm uppercase tracking-wider">Miembros</h3>
        <span className="bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded text-xs">{members.filter(m => m.isActive).length}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Add button */}
        <button
          onClick={onAddClick}
          className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-neutral-700 text-neutral-400 hover:border-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <div className="bg-neutral-800 p-1 rounded-full group-hover:bg-indigo-500 group-hover:text-white transition-colors">
            <UserPlus size={16} />
          </div>
          <span className="font-medium text-sm">Añadir Persona/IA</span>
        </button>

        {/* AIs section */}
        {aiMembers.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-3 px-2">Inteligencias Artificiales</h4>
            <div className="space-y-1">
              {aiMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-neutral-800 rounded-lg cursor-pointer group transition-colors">
                  <div className="relative">
                    {member.agent?.avatar ? (
                      <img src={member.agent.avatar} alt={member.agent.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-purple-500" />
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-neutral-900"></span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-neutral-200 group-hover:text-white">{member.agent?.name}</p>
                      <CheckCircle2 size={12} className="text-indigo-400" fill="currentColor" />
                    </div>
                    <p className="text-[10px] text-neutral-500 truncate w-32">IA - {member.agent?.name?.split(' ')[0] || 'Artista'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users section */}
        {userMembers.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-3 px-2">Humanos</h4>
            <div className="space-y-1">
              {sortedUserMembers.map((member) => {
                const isOwner = member.role === "owner";
                const isModerator = member.role === "moderator";

                return (
                  <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-neutral-800 rounded-lg cursor-pointer group transition-colors">
                    <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-400 border border-neutral-600">
                      {member.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium text-neutral-200 group-hover:text-white">{member.user?.name || 'Usuario'}</p>
                        {isOwner && <Crown size={12} className="text-yellow-500" />}
                        {isModerator && <Shield size={12} className="text-blue-500" />}
                      </div>
                      <p className="text-[10px] text-neutral-500">{isOwner ? 'Admin' : isModerator ? 'Moderador' : 'Miembro'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
