"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Users, Bot, MessageCircle, Crown, Shield } from "lucide-react";

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description?: string | null;
    lastActivityAt: Date;
    totalMessages: number;
    unreadCount?: number;
    role?: string;
    isMuted?: boolean;
    members: Array<{
      id: string;
      memberType: string;
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
    _count?: {
      messages: number;
      members: number;
    };
  };
}

export function GroupCard({ group }: GroupCardProps) {
  const userCount = group.members.filter((m) => m.memberType === "user").length;
  const aiCount = group.members.filter((m) => m.memberType === "agent").length;
  const unreadCount = group.unreadCount || 0;
  const hasUnread = unreadCount > 0;

  // Get first few member avatars for preview
  const previewMembers = group.members.slice(0, 4);

  return (
    <Link href={`/dashboard/grupos/${group.id}`}>
      <div
        className={`
        group relative overflow-hidden rounded-lg border bg-card p-4
        transition-all hover:shadow-md hover:border-primary/50
        ${hasUnread ? "border-primary/30 bg-primary/5" : "border-border"}
        ${group.isMuted ? "opacity-60" : ""}
      `}
      >
        {/* Unread badge */}
        {hasUnread && (
          <div className="absolute top-2 right-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Group icon/avatars */}
          <div className="relative flex-shrink-0">
            {previewMembers.length > 0 ? (
              <div className="grid grid-cols-2 gap-0.5 w-12 h-12 rounded-lg overflow-hidden bg-muted">
                {previewMembers.slice(0, 4).map((member, idx) => {
                  const avatar =
                    member.memberType === "user"
                      ? member.user?.image
                      : member.agent?.avatar;
                  const name =
                    member.memberType === "user"
                      ? member.user?.name
                      : member.agent?.name;

                  return (
                    <div
                      key={member.id}
                      className="w-full h-full bg-muted flex items-center justify-center"
                    >
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={name || "Member"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-[8px] font-semibold text-primary">
                          {name?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            )}
          </div>

          {/* Group info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">{group.name}</h3>
              {/* Role badge */}
              {group.role === "owner" && (
                <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" title="Owner" />
              )}
              {group.role === "moderator" && (
                <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" title="Moderador" />
              )}
            </div>

            {group.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {group.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1" title="Usuarios">
                <Users className="w-3 h-3" />
                <span>{userCount}</span>
              </div>
              <div className="flex items-center gap-1" title="IAs">
                <Bot className="w-3 h-3" />
                <span>{aiCount}</span>
              </div>
              <div className="flex items-center gap-1" title="Mensajes">
                <MessageCircle className="w-3 h-3" />
                <span>{group._count?.messages || group.totalMessages || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <span>
            {formatDistanceToNow(new Date(group.lastActivityAt), {
              addSuffix: true,
              locale: es,
            })}
          </span>

          {group.isMuted && (
            <span className="text-xs bg-muted px-2 py-0.5 rounded">Silenciado</span>
          )}
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </Link>
  );
}
