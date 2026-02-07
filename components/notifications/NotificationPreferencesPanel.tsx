"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, BellOff, Clock, Heart, Award, Save, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferences {
  id: string;
  userId: string;
  bondNotificationsEnabled: boolean;
  bondWarningFrequency: string;
  bondDormantFrequency: string;
  bondFragileFrequency: string;
  bondMilestoneNotifications: boolean;
  mutedBonds: string[];
  preferredNotificationHours: number[];
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  desktopNotifications: boolean;
  lastActiveHours: Record<string, number>;
}

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Diario", description: "Recibir notificaciones diarias" },
  { value: "weekly", label: "Semanal", description: "Recibir notificaciones semanales" },
  { value: "never", label: "Nunca", description: "No recibir notificaciones" },
];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${i.toString().padStart(2, "0")}:00`,
}));

export function NotificationPreferencesPanel() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/user/notification-preferences");
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las preferencias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const savePreferences = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      const response = await fetch("/api/user/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast({
          title: "✅ Guardado",
          description: "Tus preferencias han sido actualizadas",
        });
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las preferencias",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [key]: value,
    });
  };

  const toggleHour = (hour: number) => {
    if (!preferences) return;
    const hours = preferences.preferredNotificationHours || [];
    const newHours = hours.includes(hour)
      ? hours.filter((h) => h !== hour)
      : [...hours, hour].sort((a, b) => a - b);
    updatePreference("preferredNotificationHours", newHours);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No se pudieron cargar las preferencias</p>
            <Button onClick={fetchPreferences}>Reintentar</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificaciones Generales
          </CardTitle>
          <CardDescription>
            Configura cómo quieres recibir notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="push">Notificaciones Push</Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones en tu navegador o móvil
              </p>
            </div>
            <Switch
              id="push"
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) =>
                updatePreference("pushNotifications", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="email">Notificaciones por Email</Label>
              <p className="text-sm text-muted-foreground">
                Recibe resúmenes y alertas importantes por correo
              </p>
            </div>
            <Switch
              id="email"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) =>
                updatePreference("emailNotifications", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="desktop">Notificaciones de Escritorio</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar notificaciones en tu escritorio
              </p>
            </div>
            <Switch
              id="desktop"
              checked={preferences.desktopNotifications}
              onCheckedChange={(checked) =>
                updatePreference("desktopNotifications", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Bond Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Notificaciones de Vínculos
          </CardTitle>
          <CardDescription>
            Configura alertas para mantener tus vínculos activos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="bondEnabled">Habilitar Notificaciones de Vínculos</Label>
              <p className="text-sm text-muted-foreground">
                Recibir alertas cuando tus vínculos necesiten atención
              </p>
            </div>
            <Switch
              id="bondEnabled"
              checked={preferences.bondNotificationsEnabled}
              onCheckedChange={(checked) =>
                updatePreference("bondNotificationsEnabled", checked)
              }
            />
          </div>

          {preferences.bondNotificationsEnabled && (
            <>
              <Separator />

              <div className="space-y-4">
                <div>
                  <Label>⚠️ Vínculos en Advertencia (30+ días)</Label>
                  <Select
                    value={preferences.bondWarningFrequency}
                    onValueChange={(value) =>
                      updatePreference("bondWarningFrequency", value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>💔 Vínculos Inactivos (60+ días)</Label>
                  <Select
                    value={preferences.bondDormantFrequency}
                    onValueChange={(value) =>
                      updatePreference("bondDormantFrequency", value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>🔥 Vínculos Frágiles (90+ días)</Label>
                  <Select
                    value={preferences.bondFragileFrequency}
                    onValueChange={(value) =>
                      updatePreference("bondFragileFrequency", value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="milestones">Notificaciones de Hitos</Label>
                  <p className="text-sm text-muted-foreground">
                    Celebra cuando alcances nuevos hitos en tus vínculos
                  </p>
                </div>
                <Switch
                  id="milestones"
                  checked={preferences.bondMilestoneNotifications}
                  onCheckedChange={(checked) =>
                    updatePreference("bondMilestoneNotifications", checked)
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Smart Timing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Smart Timing
          </CardTitle>
          <CardDescription>
            Recibe notificaciones en tus horas preferidas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-3 block">Horas Preferidas para Notificaciones</Label>
            <div className="grid grid-cols-6 gap-2">
              {HOUR_OPTIONS.map((hour) => {
                const isSelected = preferences.preferredNotificationHours.includes(
                  hour.value
                );
                return (
                  <motion.button
                    key={hour.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleHour(hour.value)}
                    className={`p-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {hour.label}
                  </motion.button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Selecciona las horas en las que prefieres recibir notificaciones. El
              sistema intentará enviar alertas en estos horarios.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Muted Bonds */}
      {preferences.mutedBonds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellOff className="w-5 h-5 text-muted-foreground" />
              Vínculos Silenciados
            </CardTitle>
            <CardDescription>
              Vínculos de los que no recibirás notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {preferences.mutedBonds.map((bondId) => (
                <div
                  key={bondId}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <span className="text-sm text-muted-foreground font-mono">
                    {bondId}
                  </span>
                  <Badge variant="secondary">Silenciado</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={fetchPreferences} disabled={saving}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Descartar Cambios
        </Button>
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Preferencias
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
