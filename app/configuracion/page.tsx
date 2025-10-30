"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { DangerConfirmDialog } from "@/components/DangerConfirmDialog";
import { signOut } from "next-auth/react";
import {
  User,
  Key,
  Bell,
  Palette,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  Mail,
  Shield,
  AlertTriangle,
  Check,
  Loader2,
  Crown,
  MessageSquare,
  Users,
  Trash2,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  plan: string;
  createdAt: string;
}

interface UserStats {
  agentsCount: number;
  worldsCount: number;
  messagesThisMonth: number;
}

export default function ConfiguracionPage() {
  const { data: session, update: updateSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // User data
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({ agentsCount: 0, worldsCount: 0, messagesThisMonth: 0 });

  // Form states
  const [userName, setUserName] = useState("");

  // Danger zone dialogs
  const [deleteMessagesDialog, setDeleteMessagesDialog] = useState(false);
  const [deleteAgentsDialog, setDeleteAgentsDialog] = useState(false);
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);

  // API settings
  const [geminiApiKey, setGeminiApiKey] = useState("");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [agentUpdates, setAgentUpdates] = useState(true);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          console.log("Profile loaded:", data.user);
          console.log("Plan from DB:", data.user.plan);
          setProfile(data.user);
          setStats(data.stats);
          setUserName(data.user.name || "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        await updateSession();
        toast.success("Perfil actualizado exitosamente");
      } else {
        toast.error("Error al guardar los cambios");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const planLabels: Record<string, { name: string; color: string; icon: any }> = {
    free: { name: "Free", color: "bg-gray-500", icon: Sparkles },
    plus: { name: "Plus", color: "bg-blue-500", icon: Sparkles },
    ultra: { name: "Ultra", color: "bg-gradient-to-r from-purple-600 to-pink-600", icon: Crown },
  };

  const currentPlan = profile ? (planLabels[profile.plan] || { name: profile.plan, color: "bg-gray-500", icon: Sparkles }) : planLabels.free;

  // Danger zone actions
  const handleDeleteMessages = async () => {
    try {
      const res = await fetch("/api/messages/delete-all", {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        // Refresh stats
        const profileRes = await fetch("/api/user/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setStats(profileData.stats);
        }
      } else {
        toast.error("Error al eliminar los mensajes");
      }
    } catch (error) {
      console.error("Error deleting messages:", error);
      toast.error("Error al eliminar los mensajes");
    }
  };

  const handleDeleteAgents = async () => {
    try {
      const res = await fetch("/api/agents/delete-all", {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        // Refresh stats
        const profileRes = await fetch("/api/user/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setStats(profileData.stats);
        }
      } else {
        toast.error("Error al eliminar los agentes");
      }
    } catch (error) {
      console.error("Error deleting agents:", error);
      toast.error("Error al eliminar los agentes");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Cuenta eliminada. Redirigiendo...");
        // Sign out and redirect to home
        setTimeout(() => {
          signOut({ callbackUrl: "/" });
        }, 1500);
      } else {
        toast.error("Error al eliminar la cuenta");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Error al eliminar la cuenta");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Configuración
          </h1>
          <p className="text-lg text-muted-foreground">
            Administra tu cuenta, preferencias y configuración de la plataforma
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="plan" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Plan</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Preferencias</span>
            </TabsTrigger>
            <TabsTrigger value="danger" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Avanzado</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tu información de perfil visible para otros usuarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 pb-6 border-b">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={profile?.image || undefined} alt={userName} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl font-bold">
                      {userName ? userName.charAt(0).toUpperCase() : session?.user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">{userName || "Sin nombre"}</h3>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    <Button variant="outline" size="sm" disabled>
                      Cambiar avatar
                      <span className="ml-2 text-xs text-muted-foreground">(Próximamente)</span>
                    </Button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      El email no se puede cambiar en este momento
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar cambios
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plan Tab */}
          <TabsContent value="plan" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <currentPlan.icon className="h-5 w-5" />
                    Plan Actual
                  </CardTitle>
                  <CardDescription>Tu plan de suscripción activo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-6">
                    <Badge className={`${currentPlan.color} text-white text-lg px-6 py-2 mb-4`}>
                      {currentPlan.name}
                    </Badge>
                    <p className="text-sm text-muted-foreground mb-6">
                      {profile?.plan === "ultra"
                        ? "Acceso completo e ilimitado a todas las funciones"
                        : "Actualiza tu plan para desbloquear más funciones"}
                    </p>
                    {profile?.plan !== "ultra" && (
                      <Button className="w-full">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Mejorar Plan
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Usage Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Uso del Plan</CardTitle>
                  <CardDescription>Tu uso actual de recursos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">IAs creadas</span>
                      <span className="text-sm font-bold">
                        {stats.agentsCount} {profile?.plan === "ultra" ? "/ ∞" : profile?.plan === "plus" ? "/ 10" : "/ 3"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">Mundos activos</span>
                      <span className="text-sm font-bold">
                        {stats.worldsCount} {profile?.plan === "ultra" ? "/ ∞" : profile?.plan === "plus" ? "/ 5" : "/ 1"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">Mensajes este mes</span>
                      <span className="text-sm font-bold">
                        {stats.messagesThisMonth.toLocaleString()} {profile?.plan !== "free" ? "/ ∞" : "/ 600"}
                      </span>
                    </div>
                  </div>

                  {profile?.plan === "ultra" && (
                    <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                        <Crown className="h-5 w-5" />
                        <span className="font-semibold">Plan Ultra</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Disfrutas de recursos ilimitados y acceso prioritario a nuevas funciones.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* API Keys */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  Configura tus claves de API para integrar servicios externos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gemini-key">Google Gemini API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="gemini-key"
                        type={showApiKey ? "text" : "password"}
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        placeholder="AIza..."
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button variant="outline" disabled>
                      Verificar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Obtén tu API key en{" "}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Apariencia
                </CardTitle>
                <CardDescription>
                  Personaliza la interfaz de la aplicación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                    <div>
                      <p className="font-medium">Modo oscuro / claro</p>
                      <p className="text-xs text-muted-foreground">
                        Cambia entre modo oscuro y claro
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Input id="language" value="Español" disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">
                    Más idiomas disponibles próximamente
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificaciones
                </CardTitle>
                <CardDescription>
                  Gestiona cómo y cuándo recibes notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Notificaciones por email</p>
                      <p className="text-xs text-muted-foreground">
                        Recibe actualizaciones importantes por correo
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={emailNotifications ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEmailNotifications(!emailNotifications)}
                  >
                    {emailNotifications ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Activado
                      </>
                    ) : (
                      "Desactivado"
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Actualizaciones de agentes</p>
                      <p className="text-xs text-muted-foreground">
                        Notificaciones sobre la actividad de tus IAs
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={agentUpdates ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAgentUpdates(!agentUpdates)}
                  >
                    {agentUpdates ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Activado
                      </>
                    ) : (
                      "Desactivado"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-6">
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Zona de Peligro
                </CardTitle>
                <CardDescription>
                  Acciones irreversibles relacionadas con tu cuenta y datos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                    <div className="flex items-start gap-3 mb-3">
                      <MessageSquare className="h-5 w-5 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Eliminar todas las conversaciones</h4>
                        <p className="text-sm text-muted-foreground">
                          Esto eliminará permanentemente {stats.messagesThisMonth > 0 ? `${stats.messagesThisMonth.toLocaleString()} mensajes de este mes y ` : ""}todas tus conversaciones con las IAs
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setDeleteMessagesDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar conversaciones
                    </Button>
                  </div>

                  <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                    <div className="flex items-start gap-3 mb-3">
                      <Users className="h-5 w-5 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Eliminar todos los agentes</h4>
                        <p className="text-sm text-muted-foreground">
                          Esto eliminará permanentemente {stats.agentsCount > 0 ? `${stats.agentsCount} ${stats.agentsCount === 1 ? "agente" : "agentes"} y ` : ""}todas las IAs que has creado, incluyendo sus memorias y configuraciones
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setDeleteAgentsDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar agentes
                    </Button>
                  </div>

                  <div className="p-4 rounded-lg border border-destructive bg-destructive/10">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 animate-pulse" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1 text-destructive">Eliminar cuenta permanentemente</h4>
                        <p className="text-sm text-muted-foreground">
                          Una vez eliminada, no podrás recuperar tu cuenta ni tus datos. Se eliminarán todos tus agentes, conversaciones, mundos y configuraciones.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteAccountDialog(true)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Eliminar cuenta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Danger Zone Confirmation Dialogs */}
        <DangerConfirmDialog
          open={deleteMessagesDialog}
          onOpenChange={setDeleteMessagesDialog}
          title="¿Eliminar todas las conversaciones?"
          description={`Estás a punto de eliminar TODAS tus conversaciones. ${
            stats.messagesThisMonth > 0
              ? `Esto incluye ${stats.messagesThisMonth.toLocaleString()} mensajes de este mes.`
              : ""
          } Esta acción no se puede deshacer y perderás todo el historial de chats con tus IAs.`}
          onConfirm={handleDeleteMessages}
        />

        <DangerConfirmDialog
          open={deleteAgentsDialog}
          onOpenChange={setDeleteAgentsDialog}
          title="¿Eliminar todos los agentes?"
          description={`Estás a punto de eliminar TODAS tus IAs. ${
            stats.agentsCount > 0
              ? `Esto incluye ${stats.agentsCount} ${stats.agentsCount === 1 ? "agente" : "agentes"}.`
              : ""
          } Se perderán todas sus memorias, configuraciones, personalidades y datos asociados. Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteAgents}
        />

        <DangerConfirmDialog
          open={deleteAccountDialog}
          onOpenChange={setDeleteAccountDialog}
          title="¿ELIMINAR TU CUENTA PERMANENTEMENTE?"
          description="Estás a punto de ELIMINAR COMPLETAMENTE tu cuenta. Se eliminarán TODOS tus datos: agentes, conversaciones, mundos, configuraciones y cualquier contenido asociado. NO HAY FORMA DE RECUPERAR ESTA INFORMACIÓN. Esta es una acción PERMANENTE e IRREVERSIBLE."
          onConfirm={handleDeleteAccount}
        />
      </div>
    </div>
  );
}
