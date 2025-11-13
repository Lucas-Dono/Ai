"use client";

export const dynamic = 'force-dynamic';

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
import { useTranslations } from "next-intl";
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
  Accessibility,
} from "lucide-react";
import { AccessibilitySettings } from "@/components/accessibility/AccessibilitySettings";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { ErrorBoundary } from "@/components/error-boundary";

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
  const t = useTranslations("settings");
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
        toast.error(t("profile.toasts.loadError"));
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
        toast.success(t("profile.toasts.saveSuccess"));
      } else {
        toast.error(t("profile.toasts.saveError"));
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(t("profile.toasts.saveError"));
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
        toast.success(data.message || t("danger.toasts.deleteMessagesSuccess"));
        // Refresh stats
        const profileRes = await fetch("/api/user/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setStats(profileData.stats);
        }
      } else {
        toast.error(t("danger.toasts.deleteMessagesError"));
      }
    } catch (error) {
      console.error("Error deleting messages:", error);
      toast.error(t("danger.toasts.deleteMessagesError"));
    }
  };

  const handleDeleteAgents = async () => {
    try {
      const res = await fetch("/api/agents/delete-all", {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || t("danger.toasts.deleteAgentsSuccess"));
        // Refresh stats
        const profileRes = await fetch("/api/user/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setStats(profileData.stats);
        }
      } else {
        toast.error(t("danger.toasts.deleteAgentsError"));
      }
    } catch (error) {
      console.error("Error deleting agents:", error);
      toast.error(t("danger.toasts.deleteAgentsError"));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(t("danger.deleteAccount.toast"));
        // Sign out and redirect to home
        setTimeout(() => {
          signOut({ callbackUrl: "/" });
        }, 1500);
      } else {
        toast.error(t("danger.deleteAccount.toastError"));
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(t("danger.deleteAccount.toastError"));
    }
  };

  if (loading) {
    return (
      <LoadingIndicator
        variant="page"
        message={t("loading")}
        submessage={t("loadingSettings")}
      />
    );
  }

  return (
    <ErrorBoundary variant="page">
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.profile")}</span>
            </TabsTrigger>
            <TabsTrigger value="plan" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.plan")}</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.preferences")}</span>
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="gap-2">
              <Accessibility className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.accessibility")}</span>
            </TabsTrigger>
            <TabsTrigger value="danger" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.danger")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.title")}</CardTitle>
                <CardDescription>
                  {t("profile.description")}
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
                    <h3 className="font-semibold text-lg">{userName || t("profile.avatar.noName")}</h3>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    <Button variant="outline" size="sm" disabled>
                      {t("profile.avatar.changeAvatar")}
                      <span className="ml-2 text-xs text-muted-foreground">{t("profile.avatar.comingSoon")}</span>
                    </Button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("profile.form.nameLabel")}</Label>
                    <Input
                      id="name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder={t("profile.form.namePlaceholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("profile.form.emailLabel")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("profile.form.emailReadonly")}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("profile.actions.saving")}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {t("profile.actions.save")}
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
                    {t("plan.current.title")}
                  </CardTitle>
                  <CardDescription>{t("plan.current.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-6">
                    <Badge className={`${currentPlan.color} text-white text-lg px-6 py-2 mb-4`}>
                      {currentPlan.name}
                    </Badge>
                    <p className="text-sm text-muted-foreground mb-6">
                      {profile?.plan === "ultra"
                        ? t("plan.current.ultraMessage")
                        : t("plan.current.upgradeMessage")}
                    </p>
                    {profile?.plan !== "ultra" && (
                      <Button className="w-full">
                        <Sparkles className="h-4 w-4 mr-2" />
                        {t("plan.current.upgradeButton")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Usage Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("plan.usage.title")}</CardTitle>
                  <CardDescription>{t("plan.usage.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50">
                      <span className="text-sm font-medium">{t("plan.usage.agentsCreated")}</span>
                      <span className="text-sm font-bold">
                        {stats.agentsCount} {profile?.plan === "ultra" ? `/ ${t("plan.usage.unlimited")}` : profile?.plan === "plus" ? "/ 10" : "/ 3"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50">
                      <span className="text-sm font-medium">{t("plan.usage.worldsActive")}</span>
                      <span className="text-sm font-bold">
                        {stats.worldsCount} {profile?.plan === "ultra" ? `/ ${t("plan.usage.unlimited")}` : profile?.plan === "plus" ? "/ 5" : "/ 1"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50">
                      <span className="text-sm font-medium">{t("plan.usage.messagesThisMonth")}</span>
                      <span className="text-sm font-bold">
                        {stats.messagesThisMonth.toLocaleString()} {profile?.plan !== "free" ? `/ ${t("plan.usage.unlimited")}` : "/ 600"}
                      </span>
                    </div>
                  </div>

                  {profile?.plan === "ultra" && (
                    <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                        <Crown className="h-5 w-5" />
                        <span className="font-semibold">{t("plan.usage.ultraBadge.title")}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("plan.usage.ultraBadge.message")}
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
                  {t("plan.apiKeys.title")}
                </CardTitle>
                <CardDescription>
                  {t("plan.apiKeys.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gemini-key">{t("plan.apiKeys.geminiLabel")}</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="gemini-key"
                        type={showApiKey ? "text" : "password"}
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        placeholder={t("plan.apiKeys.geminiPlaceholder")}
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
                      {t("plan.apiKeys.verifyButton")}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("plan.apiKeys.getKeyMessage")}{" "}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {t("plan.apiKeys.getKeyLink")}
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
                  {t("preferences.appearance.title")}
                </CardTitle>
                <CardDescription>
                  {t("preferences.appearance.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("preferences.appearance.theme.label")}</Label>
                  <div className="flex items-center justify-between p-4 rounded-2xl border bg-muted/50">
                    <div>
                      <p className="font-medium">{t("preferences.appearance.theme.title")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("preferences.appearance.theme.description")}
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="language">{t("preferences.appearance.language.label")}</Label>
                  <Input id="language" value={t("preferences.appearance.language.current")} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">
                    {t("preferences.appearance.language.comingSoon")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  {t("preferences.notifications.title")}
                </CardTitle>
                <CardDescription>
                  {t("preferences.notifications.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-2xl border">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{t("preferences.notifications.email.title")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("preferences.notifications.email.description")}
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
                        {t("preferences.notifications.email.enabled")}
                      </>
                    ) : (
                      t("preferences.notifications.email.disabled")
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl border">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{t("preferences.notifications.agentUpdates.title")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("preferences.notifications.agentUpdates.description")}
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
                        {t("preferences.notifications.email.enabled")}
                      </>
                    ) : (
                      t("preferences.notifications.email.disabled")
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accessibility Tab */}
          <TabsContent value="accessibility" className="space-y-6">
            <AccessibilitySettings />
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-6">
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {t("danger.title")}
                </CardTitle>
                <CardDescription>
                  {t("danger.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/5">
                    <div className="flex items-start gap-3 mb-3">
                      <MessageSquare className="h-5 w-5 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{t("danger.deleteMessages.title")}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t("danger.deleteMessages.description")} {stats.messagesThisMonth > 0 ? t("danger.deleteMessages.messagesCount", { count: stats.messagesThisMonth.toLocaleString() }) : ""}{t("danger.deleteMessages.descriptionSuffix")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setDeleteMessagesDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("danger.deleteMessages.button")}
                    </Button>
                  </div>

                  <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/5">
                    <div className="flex items-start gap-3 mb-3">
                      <Users className="h-5 w-5 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{t("danger.deleteAgents.title")}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t("danger.deleteAgents.description")} {stats.agentsCount > 0 ? t("danger.deleteAgents.agentsCount", {
                            count: stats.agentsCount,
                            plural: stats.agentsCount === 1 ? t("danger.deleteAgents.agentSingular") : t("danger.deleteAgents.agentPlural")
                          }) + " " : ""}{t("danger.deleteAgents.descriptionSuffix")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setDeleteAgentsDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("danger.deleteAgents.button")}
                    </Button>
                  </div>

                  <div className="p-4 rounded-2xl border border-destructive bg-destructive/10">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 animate-pulse" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1 text-destructive">{t("danger.deleteAccount.title")}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t("danger.deleteAccount.description")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteAccountDialog(true)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {t("danger.deleteAccount.button")}
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
          title={t("danger.deleteMessages.dialogTitle")}
          description={`${t("danger.deleteMessages.dialogDescription")} ${
            stats.messagesThisMonth > 0
              ? t("danger.deleteMessages.dialogInclude", { count: stats.messagesThisMonth.toLocaleString() })
              : ""
          } ${t("danger.deleteMessages.dialogWarning")}`}
          onConfirm={handleDeleteMessages}
        />

        <DangerConfirmDialog
          open={deleteAgentsDialog}
          onOpenChange={setDeleteAgentsDialog}
          title={t("danger.deleteAgents.dialogTitle")}
          description={`${t("danger.deleteAgents.dialogDescription")} ${
            stats.agentsCount > 0
              ? t("danger.deleteAgents.dialogInclude", {
                  count: stats.agentsCount,
                  plural: stats.agentsCount === 1 ? t("danger.deleteAgents.agentSingular") : t("danger.deleteAgents.agentPlural")
                })
              : ""
          } ${t("danger.deleteAgents.dialogWarning")}`}
          onConfirm={handleDeleteAgents}
        />

        <DangerConfirmDialog
          open={deleteAccountDialog}
          onOpenChange={setDeleteAccountDialog}
          title={t("danger.deleteAccount.dialogTitle")}
          description={t("danger.deleteAccount.dialogDescription")}
          onConfirm={handleDeleteAccount}
        />
      </div>
    </div>
    </ErrorBoundary>
  );
}
