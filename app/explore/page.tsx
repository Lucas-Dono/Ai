"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Users,
  Bot,
  Sparkles,
  TrendingUp,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { UserCard, UserCardSkeleton, FriendshipStatus } from "@/components/social/UserCard";
import { useFriendship } from "@/hooks/useFriendship";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
  friendshipStatus: FriendshipStatus;
  friendshipId: string | null;
  isFollowing: boolean;
}

interface Agent {
  id: string;
  name: string;
  avatar: string | null;
  description: string | null;
  categories: string[];
  kind: string;
  rating: number | null;
  cloneCount: number;
  featured: boolean;
  user: {
    id: string;
    name: string | null;
  } | null;
}

// Componente para card de usuario con acciones
function UserCardWithActions({ user, onUpdate }: { user: User; onUpdate: () => void }) {
  const friendship = useFriendship({
    userId: user.id,
    initialStatus: user.friendshipStatus,
    initialFriendshipId: user.friendshipId,
    initialIsFollowing: user.isFollowing,
    onStatusChange: onUpdate,
  });

  return (
    <UserCard
      user={user}
      friendshipStatus={friendship.status}
      friendshipId={friendship.friendshipId}
      isFollowing={friendship.isFollowing}
      onAddFriend={friendship.sendFriendRequest}
      onCancelRequest={friendship.cancelFriendRequest}
      onAcceptRequest={friendship.acceptFriendRequest}
      onDeclineRequest={friendship.declineFriendRequest}
      onRemoveFriend={friendship.removeFriend}
      onFollow={friendship.follow}
      onUnfollow={friendship.unfollow}
      onBlock={friendship.blockUser}
      compact
    />
  );
}

// Componente para card de agente
function AgentCard({ agent }: { agent: Agent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors"
    >
      <Link
        href={`/agentes/${agent.id}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <Avatar className="w-10 h-10">
          <AvatarImage src={agent.avatar || undefined} alt={agent.name} />
          <AvatarFallback className="bg-primary/20 text-primary">
            <Bot className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm truncate">{agent.name}</h4>
            {agent.kind === "companion" && (
              <span className="text-xs px-1.5 py-0.5 bg-pink-500/20 text-pink-400 rounded-full">
                Companion
              </span>
            )}
          </div>
          {agent.description && (
            <p className="text-xs text-muted-foreground truncate">
              {agent.description}
            </p>
          )}
        </div>
      </Link>
      <Link href={`/agentes/${agent.id}`}>
        <Button size="sm" variant="outline">
          Ver
        </Button>
      </Link>
    </motion.div>
  );
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<"all" | "users" | "agents">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [agentsPage, setAgentsPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [hasMoreAgents, setHasMoreAgents] = useState(true);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination when query changes
  useEffect(() => {
    setUsersPage(1);
    setAgentsPage(1);
    setUsers([]);
    setAgents([]);
    setHasMoreUsers(true);
    setHasMoreAgents(true);
  }, [debouncedQuery]);

  // Fetch users
  const fetchUsers = useCallback(async (page: number, reset = false) => {
    if (isLoadingUsers) return;
    setIsLoadingUsers(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(debouncedQuery && { q: debouncedQuery }),
      });

      const response = await fetch(`/api/explore/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (reset) {
          setUsers(data.users);
        } else {
          setUsers((prev) => [...prev, ...data.users]);
        }
        setHasMoreUsers(page < data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [debouncedQuery, isLoadingUsers]);

  // Fetch agents
  const fetchAgents = useCallback(async (page: number, reset = false) => {
    if (isLoadingAgents) return;
    setIsLoadingAgents(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(debouncedQuery && { q: debouncedQuery }),
      });

      const response = await fetch(`/api/explore/agents?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (reset) {
          setAgents(data.agents);
        } else {
          setAgents((prev) => [...prev, ...data.agents]);
        }
        setHasMoreAgents(page < data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setIsLoadingAgents(false);
    }
  }, [debouncedQuery, isLoadingAgents]);

  // Initial fetch
  useEffect(() => {
    if (activeTab === "users" || activeTab === "all") {
      fetchUsers(1, true);
    }
    if (activeTab === "agents" || activeTab === "all") {
      fetchAgents(1, true);
    }
  }, [debouncedQuery, activeTab]);

  const handleLoadMoreUsers = () => {
    const nextPage = usersPage + 1;
    setUsersPage(nextPage);
    fetchUsers(nextPage);
  };

  const handleLoadMoreAgents = () => {
    const nextPage = agentsPage + 1;
    setAgentsPage(nextPage);
    fetchAgents(nextPage);
  };

  const handleRefresh = () => {
    setUsers([]);
    setAgents([]);
    setUsersPage(1);
    setAgentsPage(1);
    if (activeTab === "users" || activeTab === "all") {
      fetchUsers(1, true);
    }
    if (activeTab === "agents" || activeTab === "all") {
      fetchAgents(1, true);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Explorar
        </h1>
        <p className="text-muted-foreground">
          Descubre usuarios e inteligencias artificiales
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder="Buscar usuarios o IAs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-base"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={handleRefresh}
        >
          <RefreshCw className={cn("w-4 h-4", (isLoadingUsers || isLoadingAgents) && "animate-spin")} />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Todos
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            IAs
          </TabsTrigger>
        </TabsList>

        {/* All tab */}
        <TabsContent value="all" className="space-y-6">
          {/* Users section */}
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Users className="w-5 h-5" />
              Usuarios
            </h2>
            <div className="space-y-3">
              {isLoadingUsers && users.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <UserCardSkeleton key={i} compact />
                ))
              ) : users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No se encontraron usuarios
                </p>
              ) : (
                <>
                  {users.slice(0, 5).map((user) => (
                    <UserCardWithActions
                      key={user.id}
                      user={user}
                      onUpdate={() => {}}
                    />
                  ))}
                  {users.length > 5 && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setActiveTab("users")}
                    >
                      Ver todos los usuarios
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Agents section */}
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5" />
              Inteligencias Artificiales
            </h2>
            <div className="space-y-3">
              {isLoadingAgents && agents.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <UserCardSkeleton key={i} compact />
                ))
              ) : agents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No se encontraron IAs
                </p>
              ) : (
                <>
                  {agents.slice(0, 5).map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                  {agents.length > 5 && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setActiveTab("agents")}
                    >
                      Ver todas las IAs
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Users tab */}
        <TabsContent value="users" className="space-y-3">
          <AnimatePresence mode="popLayout">
            {isLoadingUsers && users.length === 0 ? (
              Array.from({ length: 10 }).map((_, i) => (
                <UserCardSkeleton key={i} compact />
              ))
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No se encontraron usuarios</p>
                {debouncedQuery && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Intenta con otro término de búsqueda
                  </p>
                )}
              </div>
            ) : (
              users.map((user) => (
                <UserCardWithActions
                  key={user.id}
                  user={user}
                  onUpdate={() => {}}
                />
              ))
            )}
          </AnimatePresence>

          {hasMoreUsers && users.length > 0 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLoadMoreUsers}
              disabled={isLoadingUsers}
            >
              {isLoadingUsers ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Cargar más usuarios
            </Button>
          )}
        </TabsContent>

        {/* Agents tab */}
        <TabsContent value="agents" className="space-y-3">
          <AnimatePresence mode="popLayout">
            {isLoadingAgents && agents.length === 0 ? (
              Array.from({ length: 10 }).map((_, i) => (
                <UserCardSkeleton key={i} compact />
              ))
            ) : agents.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No se encontraron IAs</p>
                {debouncedQuery && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Intenta con otro término de búsqueda
                  </p>
                )}
              </div>
            ) : (
              agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))
            )}
          </AnimatePresence>

          {hasMoreAgents && agents.length > 0 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLoadMoreAgents}
              disabled={isLoadingAgents}
            >
              {isLoadingAgents ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Cargar más IAs
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
