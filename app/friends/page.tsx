"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Users,
  UserPlus,
  Clock,
  Loader2,
  MessageCircle,
  UserMinus,
  UserCheck,
  Ban,
} from "lucide-react";
import { UserCard, UserCardSkeleton, FriendshipStatus } from "@/components/social/UserCard";
import { useFriendship } from "@/hooks/useFriendship";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Friend {
  id: string;
  status: string;
  createdAt: string;
  respondedAt: string | null;
  friend: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
  };
}

interface FriendRequest {
  id: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
  };
}

// Componente para card de amigo con acciones
function FriendCard({ friendship, onRemove }: { friendship: Friend; onRemove: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRemove = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar a este amigo?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/friends/${friendship.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        onRemove();
      }
    } catch (error) {
      console.error("Error removing friend:", error);
    } finally {
      setIsLoading(false);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors"
    >
      <Link
        href={`/profile/${friendship.friend.id}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <Avatar className="w-12 h-12">
          <AvatarImage src={friendship.friend.image || undefined} alt={friendship.friend.name || ""} />
          <AvatarFallback className="bg-primary/20 text-primary">
            {getInitials(friendship.friend.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{friendship.friend.name || "Usuario"}</h4>
          <p className="text-sm text-muted-foreground truncate">{friendship.friend.email}</p>
        </div>
      </Link>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/messages?user=${friendship.friend.id}`}>
            <MessageCircle className="w-4 h-4" />
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemove}
          disabled={isLoading}
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserMinus className="w-4 h-4" />
          )}
        </Button>
      </div>
    </motion.div>
  );
}

// Componente para solicitud de amistad
function RequestCard({
  request,
  type,
  onAction,
}: {
  request: FriendRequest;
  type: "received" | "sent";
  onAction: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAccept = async () => {
    setIsLoading(true);
    setLoadingAction("accept");
    try {
      const response = await fetch(`/api/friends/requests/${request.id}/accept`, {
        method: "POST",
      });
      if (response.ok) {
        onAction();
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    setLoadingAction("decline");
    try {
      const response = await fetch(`/api/friends/requests/${request.id}/decline`, {
        method: "POST",
      });
      if (response.ok) {
        onAction();
      }
    } catch (error) {
      console.error("Error declining request:", error);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    setLoadingAction("cancel");
    try {
      const response = await fetch(`/api/friends/${request.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        onAction();
      }
    } catch (error) {
      console.error("Error canceling request:", error);
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "ahora";
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`;
    return `hace ${Math.floor(seconds / 86400)}d`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col p-4 bg-card border border-border rounded-xl"
    >
      <div className="flex items-center gap-3 mb-3">
        <Link href={`/profile/${request.user.id}`}>
          <Avatar className="w-12 h-12">
            <AvatarImage src={request.user.image || undefined} alt={request.user.name || ""} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {getInitials(request.user.name)}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${request.user.id}`}>
            <h4 className="font-medium truncate hover:underline">
              {request.user.name || "Usuario"}
            </h4>
          </Link>
          <p className="text-sm text-muted-foreground">{getTimeAgo(request.createdAt)}</p>
        </div>
      </div>

      {type === "received" ? (
        <div className="flex gap-2">
          <Button
            className="flex-1 gap-2"
            onClick={handleAccept}
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
            className="flex-1 gap-2"
            onClick={handleDecline}
            disabled={isLoading}
          >
            {loadingAction === "decline" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserMinus className="w-4 h-4" />
            )}
            Rechazar
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleCancel}
          disabled={isLoading}
        >
          {loadingAction === "cancel" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Clock className="w-4 h-4" />
          )}
          Cancelar solicitud
        </Button>
      )}
    </motion.div>
  );
}

export default function FriendsPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "friends";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch friends
  const fetchFriends = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
      });
      const response = await fetch(`/api/friends?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const [receivedRes, sentRes] = await Promise.all([
        fetch("/api/friends/requests?type=received"),
        fetch("/api/friends/requests?type=sent"),
      ]);

      if (receivedRes.ok) {
        const data = await receivedRes.json();
        setReceivedRequests(data.requests);
      }

      if (sentRes.ok) {
        const data = await sentRes.json();
        setSentRequests(data.requests);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (activeTab === "friends") {
      fetchFriends();
    } else {
      fetchRequests();
    }
  }, [activeTab, fetchFriends, fetchRequests]);

  // Search debounce
  useEffect(() => {
    if (activeTab === "friends") {
      const timer = setTimeout(fetchFriends, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, activeTab, fetchFriends]);

  const filteredFriends = friends.filter((f) =>
    searchQuery
      ? f.friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.friend.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="container max-w-3xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
            <Users className="w-6 h-6 text-primary" />
            Amigos
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus amigos y solicitudes
          </p>
        </div>
        <Button asChild>
          <Link href="/explore">
            <UserPlus className="w-4 h-4 mr-2" />
            Buscar personas
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Mis amigos
            {friends.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-muted rounded-full">
                {friends.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Solicitudes
            {receivedRequests.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {receivedRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Friends tab */}
        <TabsContent value="friends" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar amigos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Friends list */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {isLoading && friends.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <UserCardSkeleton key={i} compact />
                ))
              ) : filteredFriends.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "No se encontraron amigos con ese nombre"
                      : "Aún no tienes amigos"}
                  </p>
                  {!searchQuery && (
                    <Button asChild className="mt-4">
                      <Link href="/explore">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Buscar personas
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                filteredFriends.map((friendship) => (
                  <FriendCard
                    key={friendship.id}
                    friendship={friendship}
                    onRemove={fetchFriends}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Requests tab */}
        <TabsContent value="requests" className="space-y-6">
          {/* Received requests */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Solicitudes recibidas
              {receivedRequests.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {receivedRequests.length}
                </span>
              )}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {isLoading && receivedRequests.length === 0 ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <UserCardSkeleton key={i} />
                  ))
                ) : receivedRequests.length === 0 ? (
                  <p className="text-muted-foreground col-span-2 text-center py-8">
                    No tienes solicitudes pendientes
                  </p>
                ) : (
                  receivedRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      type="received"
                      onAction={fetchRequests}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sent requests */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Solicitudes enviadas
              {sentRequests.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-muted rounded-full">
                  {sentRequests.length}
                </span>
              )}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {isLoading && sentRequests.length === 0 ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <UserCardSkeleton key={i} />
                  ))
                ) : sentRequests.length === 0 ? (
                  <p className="text-muted-foreground col-span-2 text-center py-8">
                    No has enviado solicitudes
                  </p>
                ) : (
                  sentRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      type="sent"
                      onAction={fetchRequests}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
