"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserPlus,
  UserMinus,
  UserCheck,
  Clock,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Ban,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";

export type FriendshipStatus =
  | "none"
  | "friends"
  | "pending_sent"
  | "pending_received"
  | "blocked"
  | "blocked_by";

interface UserCardProps {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    email?: string;
    bio?: string;
  };
  friendshipStatus: FriendshipStatus;
  friendshipId?: string | null;
  isFollowing?: boolean;
  showActions?: boolean;
  compact?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onAddFriend?: () => void;
  onCancelRequest?: () => void;
  onAcceptRequest?: () => void;
  onDeclineRequest?: () => void;
  onRemoveFriend?: () => void;
  onBlock?: () => void;
  onMessage?: () => void;
  className?: string;
}

export function UserCard({
  user,
  friendshipStatus,
  friendshipId,
  isFollowing = false,
  showActions = true,
  compact = false,
  onFollow,
  onUnfollow,
  onAddFriend,
  onCancelRequest,
  onAcceptRequest,
  onDeclineRequest,
  onRemoveFriend,
  onBlock,
  onMessage,
  className,
}: UserCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (action: () => void | undefined, actionName: string) => {
    if (!action) return;
    setIsLoading(true);
    setLoadingAction(actionName);
    try {
      await action();
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderFriendshipButton = () => {
    if (!showActions) return null;

    switch (friendshipStatus) {
      case "friends":
        return (
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            className="gap-2 text-green-500 border-green-500/30 hover:bg-green-500/10"
            onClick={() => handleAction(onRemoveFriend!, "remove")}
            disabled={isLoading}
          >
            {loadingAction === "remove" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
            {!compact && "Amigos"}
          </Button>
        );

      case "pending_sent":
        return (
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            className="gap-2 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10"
            onClick={() => handleAction(onCancelRequest!, "cancel")}
            disabled={isLoading}
          >
            {loadingAction === "cancel" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            {!compact && "Pendiente"}
          </Button>
        );

      case "pending_received":
        return (
          <div className="flex gap-2">
            <Button
              size={compact ? "sm" : "default"}
              className="gap-2"
              onClick={() => handleAction(onAcceptRequest!, "accept")}
              disabled={isLoading}
            >
              {loadingAction === "accept" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
              Aceptar
            </Button>
            <Button
              variant="outline"
              size={compact ? "sm" : "default"}
              onClick={() => handleAction(onDeclineRequest!, "decline")}
              disabled={isLoading}
            >
              {loadingAction === "decline" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserMinus className="w-4 h-4" />
              )}
            </Button>
          </div>
        );

      case "blocked":
      case "blocked_by":
        return (
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            className="gap-2 text-red-500 border-red-500/30"
            disabled
          >
            <Ban className="w-4 h-4" />
            {!compact && "Bloqueado"}
          </Button>
        );

      case "none":
      default:
        return (
          <Button
            size={compact ? "sm" : "default"}
            className="gap-2"
            onClick={() => handleAction(onAddFriend!, "add")}
            disabled={isLoading}
          >
            {loadingAction === "add" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {!compact && "Agregar"}
          </Button>
        );
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center justify-between p-3 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors",
          className
        )}
      >
        <Link
          href={`/profile/${user.id}`}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.image || undefined} alt={user.name || ""} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{user.name || "Usuario"}</h4>
            {user.email && (
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            )}
          </div>
        </Link>
        {renderFriendshipButton()}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col p-4 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all",
        className
      )}
    >
      {/* Header con avatar y menú */}
      <div className="flex items-start justify-between mb-3">
        <Link href={`/profile/${user.id}`} className="flex items-center gap-3">
          <Avatar className="w-14 h-14">
            <AvatarImage src={user.image || undefined} alt={user.name || ""} />
            <AvatarFallback className="bg-primary/20 text-primary text-lg">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-base">{user.name || "Usuario"}</h3>
            {user.email && (
              <p className="text-sm text-muted-foreground">{user.email}</p>
            )}
          </div>
        </Link>

        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/profile/${user.id}`}>Ver perfil</Link>
              </DropdownMenuItem>
              {onMessage && (
                <DropdownMenuItem onClick={onMessage}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar mensaje
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {friendshipStatus !== "blocked" && onBlock && (
                <DropdownMenuItem
                  onClick={onBlock}
                  className="text-red-500 focus:text-red-500"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Bloquear usuario
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{user.bio}</p>
      )}

      {/* Acciones */}
      {showActions && (
        <div className="flex gap-2 mt-auto">
          {renderFriendshipButton()}

          {isFollowing ? (
            <Button
              variant="outline"
              size="default"
              onClick={() => handleAction(onUnfollow!, "unfollow")}
              disabled={isLoading}
              className="flex-1"
            >
              {loadingAction === "unfollow" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Siguiendo"
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="default"
              onClick={() => handleAction(onFollow!, "follow")}
              disabled={isLoading}
              className="flex-1"
            >
              {loadingAction === "follow" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Seguir"
              )}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Versión skeleton para loading
export function UserCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-card border border-border rounded-xl animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-full" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-3 w-32 bg-muted rounded" />
          </div>
        </div>
        <div className="h-9 w-24 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 bg-card border border-border rounded-2xl animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-14 h-14 bg-muted rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="h-4 w-40 bg-muted rounded" />
        </div>
      </div>
      <div className="h-10 w-full bg-muted rounded-xl" />
    </div>
  );
}
