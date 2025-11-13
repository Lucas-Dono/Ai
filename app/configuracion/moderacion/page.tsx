/**
 * Configuración de Moderación Personal
 * Gestiona posts ocultos, usuarios bloqueados y preferencias de contenido
 */

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  EyeOff,
  UserX,
  XCircle,
  Trash2,
  Download,
  Upload,
  TrendingUp,
  Shield,
  Eye,
  Users,
  Hash,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ModerationSuggestions } from "@/components/moderation/ModerationSuggestions";

interface HiddenPost {
  id: string;
  postId: string;
  reason?: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
    createdAt: string;
  };
}

interface BlockedUser {
  id: string;
  blockedId: string;
  reason?: string;
  createdAt: string;
  blockedUser: {
    id: string;
    name: string;
    image?: string;
  };
}

interface ContentPreference {
  id: string;
  type: string;
  value: string;
  action: string;
  createdAt: string;
}

interface ModerationStats {
  hiddenPosts: number;
  blockedUsers: number;
  contentPreferences: number;
}

export default function ModerationSettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"hidden" | "blocked" | "preferences" | "stats">("stats");

  const [hiddenPosts, setHiddenPosts] = useState<HiddenPost[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [preferences, setPreferences] = useState<ContentPreference[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      loadAllData();
    }
  }, [session]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadHiddenPosts(),
        loadBlockedUsers(),
        loadPreferences(),
        loadStats(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadHiddenPosts = async () => {
    try {
      const response = await fetch("/api/user/moderation/hide-post");
      if (response.ok) {
        const data = await response.json();
        setHiddenPosts(data.hiddenPosts || []);
      }
    } catch (error) {
      console.error("Error loading hidden posts:", error);
    }
  };

  const loadBlockedUsers = async () => {
    try {
      const response = await fetch("/api/user/moderation/block-user");
      if (response.ok) {
        const data = await response.json();
        setBlockedUsers(data.blockedUsers || []);
      }
    } catch (error) {
      console.error("Error loading blocked users:", error);
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await fetch("/api/user/moderation/content-preference");
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences || []);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch("/api/user/moderation/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleUnhidePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/user/moderation/hide-post?postId=${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setHiddenPosts((prev) => prev.filter((p) => p.postId !== postId));
        loadStats();
      } else {
        alert("Error al desocultar post");
      }
    } catch (error) {
      console.error("Error unhiding post:", error);
      alert("Error al desocultar post");
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/moderation/block-user?userId=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBlockedUsers((prev) => prev.filter((u) => u.blockedId !== userId));
        loadStats();
      } else {
        alert("Error al desbloquear usuario");
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      alert("Error al desbloquear usuario");
    }
  };

  const handleRemovePreference = async (type: string, value: string) => {
    try {
      const response = await fetch(
        `/api/user/moderation/content-preference?type=${type}&value=${encodeURIComponent(value)}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setPreferences((prev) =>
          prev.filter((p) => !(p.type === type && p.value === value))
        );
        loadStats();
      } else {
        alert("Error al eliminar preferencia");
      }
    } catch (error) {
      console.error("Error removing preference:", error);
      alert("Error al eliminar preferencia");
    }
  };

  const handleExportSettings = () => {
    const data = {
      hiddenPosts: hiddenPosts.map(p => ({ postId: p.postId, reason: p.reason })),
      blockedUsers: blockedUsers.map(u => ({ userId: u.blockedId, reason: u.reason })),
      preferences: preferences.map(p => ({ type: p.type, value: p.value, action: p.action })),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moderation-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!confirm("¿Importar configuración? Esto agregará los filtros del archivo.")) {
        return;
      }

      // Importar posts ocultos
      if (data.hiddenPosts) {
        for (const item of data.hiddenPosts) {
          await fetch("/api/user/moderation/hide-post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId: item.postId, reason: item.reason }),
          });
        }
      }

      // Importar usuarios bloqueados
      if (data.blockedUsers) {
        for (const item of data.blockedUsers) {
          await fetch("/api/user/moderation/block-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: item.userId, reason: item.reason }),
          });
        }
      }

      // Importar preferencias
      if (data.preferences) {
        for (const item of data.preferences) {
          await fetch("/api/user/moderation/content-preference", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });
        }
      }

      alert("Configuración importada correctamente");
      loadAllData();
    } catch (error) {
      console.error("Error importing settings:", error);
      alert("Error al importar configuración. Verifica que el archivo sea válido.");
    }
  };

  const getPreferenceIcon = (type: string) => {
    switch (type) {
      case "tag":
        return <Hash className="h-4 w-4" />;
      case "postType":
        return <FileText className="h-4 w-4" />;
      case "community":
        return <Users className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getPreferenceLabel = (type: string, value: string) => {
    switch (type) {
      case "tag":
        return `#${value}`;
      case "postType":
        return `Tipo: ${value}`;
      case "community":
        return `Comunidad: ${value}`;
      default:
        return value;
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Debes iniciar sesión para ver esta página</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/configuracion">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Moderación Personal</h1>
                <p className="text-sm text-muted-foreground">
                  Gestiona tu contenido y preferencias del feed
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportSettings} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <label>
                <Button variant="outline" size="sm" className="gap-2 cursor-pointer" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Importar
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            variant={activeTab === "stats" ? "default" : "outline"}
            onClick={() => setActiveTab("stats")}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Estadísticas
          </Button>
          <Button
            variant={activeTab === "hidden" ? "default" : "outline"}
            onClick={() => setActiveTab("hidden")}
            className="gap-2"
          >
            <EyeOff className="h-4 w-4" />
            Posts Ocultos ({hiddenPosts.length})
          </Button>
          <Button
            variant={activeTab === "blocked" ? "default" : "outline"}
            onClick={() => setActiveTab("blocked")}
            className="gap-2"
          >
            <UserX className="h-4 w-4" />
            Usuarios Bloqueados ({blockedUsers.length})
          </Button>
          <Button
            variant={activeTab === "preferences" ? "default" : "outline"}
            onClick={() => setActiveTab("preferences")}
            className="gap-2"
          >
            <Shield className="h-4 w-4" />
            Preferencias ({preferences.length})
          </Button>
        </div>

        {/* Stats Tab */}
        {activeTab === "stats" && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 md:grid-cols-3"
          >
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/10 rounded-2xl">
                  <EyeOff className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.hiddenPosts}</p>
                  <p className="text-sm text-muted-foreground">Posts Ocultos</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Posts que has ocultado manualmente de tu feed
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-500/10 rounded-2xl">
                  <UserX className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.blockedUsers}</p>
                  <p className="text-sm text-muted-foreground">Usuarios Bloqueados</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Usuarios cuyo contenido no verás
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-2xl">
                  <Shield className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.contentPreferences}</p>
                  <p className="text-sm text-muted-foreground">Preferencias Activas</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Filtros automáticos de contenido
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-6 md:col-span-3">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-2xl">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Impacto en tu Feed</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Estás filtrando activamente{" "}
                    <span className="font-bold text-foreground">
                      {stats.hiddenPosts + stats.blockedUsers + stats.contentPreferences}
                    </span>{" "}
                    elementos. Esto mejora la calidad de tu feed mostrándote solo contenido relevante.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Feed más relevante</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Menos distracciones</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sugerencias Inteligentes */}
            <div className="md:col-span-3 mt-6">
              <ModerationSuggestions maxSuggestions={5} showOnEmpty={true} />
            </div>
          </motion.div>
        )}

        {/* Hidden Posts Tab */}
        {activeTab === "hidden" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {hiddenPosts.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-2xl">
                <EyeOff className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No has ocultado ningún post</p>
              </div>
            ) : (
              hiddenPosts.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <Link
                      href={`/community/post/${item.postId}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {item.post.title}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ocultado el {new Date(item.createdAt).toLocaleDateString("es-ES")}
                      {item.reason && ` • ${item.reason}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/community/post/${item.postId}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnhidePost(item.postId)}
                      className="gap-2 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Desocultar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Blocked Users Tab */}
        {activeTab === "blocked" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {blockedUsers.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-2xl">
                <UserX className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No has bloqueado a ningún usuario</p>
              </div>
            ) : (
              blockedUsers.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      {item.blockedUser.image ? (
                        <img
                          src={item.blockedUser.image}
                          alt={item.blockedUser.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-primary">
                          {item.blockedUser.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{item.blockedUser.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Bloqueado el {new Date(item.createdAt).toLocaleDateString("es-ES")}
                        {item.reason && ` • ${item.reason}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblockUser(item.blockedId)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Desbloquear
                  </Button>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Content Preferences Tab */}
        {activeTab === "preferences" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {preferences.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-2xl">
                <Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  No tienes preferencias de contenido configuradas
                </p>
              </div>
            ) : (
              preferences.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-accent rounded-2xl">
                      {getPreferenceIcon(item.type)}
                    </div>
                    <div>
                      <p className="font-medium">{getPreferenceLabel(item.type, item.value)}</p>
                      <p className="text-sm text-muted-foreground">
                        Acción: {item.action === "hide" ? "Ocultar" : item.action} • Agregado el{" "}
                        {new Date(item.createdAt).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePreference(item.type, item.value)}
                    className="gap-2 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
