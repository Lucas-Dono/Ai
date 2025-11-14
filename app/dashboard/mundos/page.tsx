"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network,
  Plus,
  Users,
  MessageCircle,
  Globe,
  Star,
  Copy,
  Play,
  Settings,
  Trash2,
  Crown,
  Search,
  MoreVertical,
  UserCircle2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateGradient, getInitials } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { LoadingButton } from "@/components/ui/loading-button";
import { ErrorBoundary } from "@/components/error-boundary";

interface Agent {
  id: string;
  name: string;
  kind: string;
  description?: string;
  avatar?: string;
  role?: string;
}

interface World {
  id: string;
  name: string;
  description?: string;
  category?: string;
  difficulty?: string;
  featured?: boolean;
  isPredefined?: boolean;
  status?: string;
  visibility?: string;
  agents?: Agent[];
  worldAgents?: { agent: Agent }[];
  agentCount?: number;
  messageCount?: number;
  interactionCount?: number;
  _count?: {
    messages: number;
  };
}

const categoryColors = {
  social: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  profesional: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  fantasia: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  ciencia: "bg-green-500/10 text-green-500 border-green-500/20",
  educacion: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

export default function MundosPage() {
  const router = useRouter();
  const t = useTranslations("worlds");
  const { data: session, status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === "authenticated";

  const difficultyLabels = {
    beginner: { label: t("difficulty.beginner"), color: "bg-green-500" },
    intermediate: { label: t("difficulty.intermediate"), color: "bg-yellow-500" },
    advanced: { label: t("difficulty.advanced"), color: "bg-red-500" },
  };
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // New world form
  const [newWorldName, setNewWorldName] = useState("");
  const [newWorldDescription, setNewWorldDescription] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);

  useEffect(() => {
    fetchWorlds();
    fetchAgents();
  }, []);

  const fetchWorlds = async () => {
    try {
      const res = await fetch("/api/worlds");
      if (res.ok) {
        const data = await res.json();
        setWorlds(data.worlds || []);
      }
    } catch (error) {
      console.error("Error fetching worlds:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents");
      if (res.ok) {
        const data = await res.json();
        setAvailableAgents(data);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const handleCreateWorld = async () => {
    if (!newWorldName.trim() || selectedAgents.length === 0) return;

    setCreating(true);
    try {
      const res = await fetch("/api/worlds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWorldName,
          description: newWorldDescription,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        const newWorld = result.world;

        // Add agents to the world
        for (const agentId of selectedAgents) {
          await fetch(`/api/worlds/${newWorld.id}/agents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agentId }),
          });
        }

        alert(t("create.successMessage", { name: newWorld.name }));
        setDialogOpen(false);
        setNewWorldName("");
        setNewWorldDescription("");
        setSelectedAgents([]);
        fetchWorlds();
      }
    } catch (error) {
      console.error("Error creating world:", error);
      alert(t("create.errorMessage"));
    } finally {
      setCreating(false);
    }
  };

  const handleCloneWorld = async (worldId: string, worldName: string) => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/clone`, {
        method: "POST",
      });

      if (res.ok) {
        alert(t("actions.cloneSuccess", { name: worldName }));
        fetchWorlds();
      } else {
        throw new Error("Failed to clone");
      }
    } catch (error) {
      console.error("Error cloning world:", error);
      alert(t("actions.cloneError"));
    }
  };

  const handleDeleteWorld = async (worldId: string, worldName: string) => {
    if (!confirm(t("actions.deleteConfirm", { name: worldName }))) return;

    try {
      const res = await fetch(`/api/worlds/${worldId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert(t("actions.deleteSuccess", { name: worldName }));
        fetchWorlds();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting world:", error);
      alert(t("actions.deleteError"));
    }
  };

  const toggleAgent = (agentId: string) => {
    if (selectedAgents.includes(agentId)) {
      setSelectedAgents(selectedAgents.filter((id) => id !== agentId));
    } else {
      setSelectedAgents([...selectedAgents, agentId]);
    }
  };

  // Separate worlds into categories
  const predefinedWorlds = worlds.filter((w) => w.isPredefined);
  const featuredWorlds = predefinedWorlds.filter((w) => w.featured);
  const userWorlds = worlds.filter((w) => !w.isPredefined);

  // Filter worlds based on search and category
  const filterWorlds = (worldsList: World[]) => {
    return worldsList.filter((world) => {
      const matchesSearch =
        !searchQuery ||
        world.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        world.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || world.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  };

  const filteredPredefined = filterWorlds(predefinedWorlds);
  const filteredUser = filterWorlds(userWorlds);

  // Get unique categories
  const categories = Array.from(new Set(predefinedWorlds.map((w) => w.category).filter(Boolean)));

  const WorldCard = ({ world, showClone = false }: { world: World; showClone?: boolean }) => {
    const agents = world.agents || world.worldAgents?.map((wa) => wa.agent) || [];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0.95 }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="md-animate-slide-up"
      >
        <div className="md-card p-6 group relative hover-lift-glow">
          {/* Featured badge */}
          {world.featured && (
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-xs px-2 py-1">
                <Crown className="h-3 w-3 mr-1" />
                {t("card.featured")}
              </Badge>
            </div>
          )}

          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 md-shape-lg"
              style={{ background: generateGradient(world.name) }}
            >
              <Network className="h-7 w-7 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold md-text-primary truncate mb-1">{world.name}</h3>
              <p className="text-sm md-text-secondary line-clamp-2">
                {world.description || t("card.noDescription")}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-2">
                {world.category && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${categoryColors[world.category as keyof typeof categoryColors] || ""}`}
                  >
                    {t(`categories.${world.category}`)}
                  </Badge>
                )}
                {world.difficulty && (
                  <Badge variant="outline" className="text-xs">
                    <div
                      className={`w-2 h-2 rounded-full mr-1.5 ${
                        difficultyLabels[world.difficulty as keyof typeof difficultyLabels]?.color
                      }`}
                    />
                    {difficultyLabels[world.difficulty as keyof typeof difficultyLabels]?.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm md-text-secondary mb-4">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {world.agentCount || agents.length}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" />
              {world.interactionCount || world.messageCount || world._count?.messages || 0}
            </span>
          </div>

          {/* Agents */}
          {agents.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {agents.slice(0, 4).map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-muted/50 text-xs"
                >
                  <Avatar className="h-5 w-5" style={{ background: generateGradient(agent.name) }}>
                    <AvatarFallback className="text-[10px] text-white bg-transparent">
                      {getInitials(agent.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium md-text-primary">{agent.name}</span>
                </div>
              ))}
              {agents.length > 4 && (
                <div className="flex items-center justify-center px-2.5 py-1.5 rounded-full bg-muted/50 text-xs font-medium md-text-secondary">
                  +{agents.length - 4}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {showClone ? (
            <div className="flex gap-2">
              <Link href={isAuthenticated ? `/dashboard/mundos/${world.id}` : `/login?callbackUrl=/dashboard/mundos/${world.id}`} className="flex-1">
                <Button variant="outline" className="w-full md-button-tonal py-2.5">
                  <Play className="h-4 w-4 mr-2" />
                  {t("card.viewWorld")}
                </Button>
              </Link>
              {isAuthenticated ? (
                <Button
                  className="flex-1 md-button md-button-filled py-2.5"
                  onClick={() => handleCloneWorld(world.id, world.name)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t("card.clone")}
                </Button>
              ) : (
                <Link href="/login?callbackUrl=/dashboard/mundos" className="flex-1">
                  <Button className="w-full md-button md-button-filled py-2.5">
                    <Copy className="h-4 w-4 mr-2" />
                    Registrarse para clonar
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href={isAuthenticated ? `/dashboard/mundos/${world.id}` : `/login?callbackUrl=/dashboard/mundos/${world.id}`} className="flex-1">
                <Button className="w-full md-button md-button-tonal py-2.5">
                  <Play className="h-4 w-4 mr-2" />
                  {isAuthenticated ? t("card.enter") : "Registrarse para entrar"}
                </Button>
              </Link>
              {isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="md-list-item p-2.5 rounded-2xl h-10 w-10 flex items-center justify-center hover:bg-accent transition-colors">
                      <MoreVertical className="h-4 w-4 md-text-secondary" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="md-card p-1">
                    <DropdownMenuItem
                      className="md-list-item cursor-pointer"
                      onClick={() => router.push(`/dashboard/mundos/${world.id}`)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {t("card.open")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="md-list-item cursor-pointer"
                      onClick={() => router.push(`/dashboard/mundos/${world.id}/settings`)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {t("card.configure")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="md-list-item cursor-pointer text-destructive"
                      onClick={() => handleDeleteWorld(world.id, world.name)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("card.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <ErrorBoundary variant="page">
    <div className="min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold md-text-primary mb-2">{t("title")}</h1>
            <p className="text-lg md-text-secondary">
              {t("subtitle")}
            </p>
          </div>

          <Link href={isAuthenticated ? "/dashboard/mundos/crear" : "/login?callbackUrl=/dashboard/mundos/crear"} data-tour="create-world-button">
            <Button className="md-button md-button-filled px-6 py-2.5">
              <Plus className="h-5 w-5 mr-2" />
              {isAuthenticated ? t("createButton") : "Registrarse para crear"}
            </Button>
          </Link>

          {/* Dialog viejo - mantenido por compatibilidad pero oculto */}
          <Dialog open={false} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild className="hidden">
              <Button className="md-button md-button-filled px-6 py-2.5">
                <Plus className="h-5 w-5 mr-2" />
                {t("create.buttonOld")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl md-card">
              <DialogHeader>
                <DialogTitle>{t("create.dialogTitle")}</DialogTitle>
                <DialogDescription>
                  {t("create.dialogDescription")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("create.nameLabel")}</label>
                  <Input
                    value={newWorldName}
                    onChange={(e) => setNewWorldName(e.target.value)}
                    placeholder={t("create.namePlaceholder")}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t("create.descriptionLabel")}</label>
                  <Textarea
                    value={newWorldDescription}
                    onChange={(e) => setNewWorldDescription(e.target.value)}
                    placeholder={t("create.descriptionPlaceholder")}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">
                    {t("create.selectAgentsLabel")}
                  </label>
                  {availableAgents.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-2xl">
                      <p className="text-sm md-text-secondary mb-3">{t("create.noAgentsYet")}</p>
                      <Link href="/constructor">
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          {t("create.createFirstAgent")}
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                      {availableAgents.map((agent) => (
                        <div
                          key={agent.id}
                          onClick={() => toggleAgent(agent.id)}
                          className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                            selectedAgents.includes(agent.id)
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Avatar
                            className="h-10 w-10 border-2"
                            style={{ background: generateGradient(agent.name) }}
                          >
                            <AvatarFallback className="text-white text-sm font-bold bg-transparent">
                              {getInitials(agent.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{agent.name}</div>
                            <Badge variant={agent.kind === "companion" ? "secondary" : "default"} className="text-xs">
                              {agent.kind === "companion" ? t("create.companion") : t("create.assistant")}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <LoadingButton
                    onClick={handleCreateWorld}
                    disabled={!newWorldName.trim() || selectedAgents.length === 0}
                    loading={creating}
                    loadingText={t("create.creating")}
                    className="flex-1 md-button md-button-filled"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("create.createButton")}
                  </LoadingButton>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    {t("create.cancel")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Anonymous User Banner */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                <UserCircle2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Explorando mundos como invitado
                </p>
                <p className="text-xs text-muted-foreground">
                  Regístrate para crear y participar en mundos
                </p>
              </div>
              <Link href="/login?callbackUrl=/dashboard/mundos">
                <Button size="sm" variant="outline" className="hidden sm:flex">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Search and Filters */}
      {worlds.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md-text-secondary" />
            <Input placeholder={t("search")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>

          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                {t("filters.all")}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category as string)}
                  className={
                    selectedCategory === category ? "" : categoryColors[category as keyof typeof categoryColors]
                  }
                >
                  {t(`categories.${category}`)}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingIndicator
            variant="inline"
            size="lg"
            message={t("loading.worlds")}
          />
        </div>
      ) : worlds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="md-card md-card-outlined p-12 text-center max-w-md">
            <div className="h-20 w-20 rounded-full md-surface-container-highest flex items-center justify-center mx-auto mb-6">
              <Globe className="h-10 w-10 md-text-secondary" />
            </div>
            <h2 className="text-xl font-semibold md-text-primary mb-2">{t("empty.title")}</h2>
            <p className="md-text-secondary mb-6">
              {t("empty.description")}
            </p>
            <Button onClick={() => setDialogOpen(true)} className="md-button md-button-filled px-6 py-2.5">
              <Plus className="h-5 w-5 mr-2" />
              {t("empty.createButton")}
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="predefined" className="space-y-6">
          <TabsList className="md-surface-container-high p-1 rounded-2xl">
            <TabsTrigger
              value="predefined"
              className="px-6 py-2.5 rounded-2xl data-[state=active]:md-surface-container-highest data-[state=active]:shadow-sm"
            >
              <Star className="h-4 w-4 mr-2" />
              {t("tabs.explore")} ({predefinedWorlds.length})
            </TabsTrigger>
            <TabsTrigger
              value="my-worlds"
              className="px-6 py-2.5 rounded-2xl data-[state=active]:md-surface-container-highest data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4 mr-2" />
              {t("tabs.myWorlds")} ({userWorlds.length})
            </TabsTrigger>
          </TabsList>

          {/* Predefined Worlds */}
          <TabsContent value="predefined" className="space-y-6">
            {featuredWorlds.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-2xl font-bold md-text-primary">{t("sections.featured")}</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredWorlds.map((world) => (
                    <WorldCard key={world.id} world={world} showClone />
                  ))}
                </div>
              </div>
            )}

            {filteredPredefined.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold md-text-primary mb-4">{t("sections.allWorlds")}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {filteredPredefined.map((world) => (
                      <WorldCard key={world.id} world={world} showClone />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="md-text-secondary">{t("sections.noResults")}</p>
              </div>
            )}
          </TabsContent>

          {/* User Worlds */}
          <TabsContent value="my-worlds">
            {filteredUser.length === 0 ? (
              <div className="md-card md-card-outlined p-12 text-center">
                <div className="h-16 w-16 rounded-full md-surface-container-highest flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 md-text-secondary" />
                </div>
                <h3 className="text-xl font-bold md-text-primary mb-2">{t("sections.noOwnWorlds")}</h3>
                <p className="md-text-secondary mb-4">{t("sections.noOwnWorldsDescription")}</p>
                <Button onClick={() => setDialogOpen(true)} className="md-button md-button-filled">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("createButton")}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filteredUser.map((world) => (
                    <WorldCard key={world.id} world={world} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* FAB - Floating Action Button */}
      {isAuthenticated && (
        <Link href="/dashboard/mundos/crear">
          <button
            className="md-fab md-fab-extended"
            title={t("fab.title")}
          >
            <Plus className="h-6 w-6" />
            <span className="font-medium">{t("fab.label")}</span>
          </button>
        </Link>
      )}
    </div>
    </ErrorBoundary>
  );
}
