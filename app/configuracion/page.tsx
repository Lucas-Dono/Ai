"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
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
  Shield
} from "lucide-react";

export default function ConfiguracionPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);

  // User settings
  const [userName, setUserName] = useState("Usuario");
  const [userEmail, setUserEmail] = useState("usuario@ejemplo.com");
  const [userBio, setUserBio] = useState("");

  // API settings
  const [geminiApiKey, setGeminiApiKey] = useState("");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [agentUpdates, setAgentUpdates] = useState(true);

  const handleSave = async () => {
    setSaving(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Configuración</h1>
        <p className="text-xl text-muted-foreground">
          Administra tu cuenta y preferencias
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Perfil de Usuario */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil de Usuario
            </CardTitle>
            <CardDescription>
              Actualiza tu información personal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl font-bold">
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Button variant="outline" size="sm">
                  Cambiar avatar
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG o GIF. Máximo 2MB.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nombre</label>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Biografía</label>
                <Textarea
                  value={userBio}
                  onChange={(e) => setUserBio(e.target.value)}
                  placeholder="Cuéntanos sobre ti..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan y Cuenta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Plan Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <Badge variant="secondary" className="text-lg px-4 py-2 mb-3">
                Free
              </Badge>
              <p className="text-sm text-muted-foreground mb-4">
                Acceso básico a todas las funciones
              </p>
              <Button className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Mejorar a Pro
              </Button>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IAs creadas</span>
                <span className="font-medium">0 / 5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mundos activos</span>
                <span className="font-medium">0 / 2</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mensajes/mes</span>
                <span className="font-medium">0 / 1000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className="lg:col-span-2">
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
            <div>
              <label className="text-sm font-medium mb-2 block">
                Google Gemini API Key
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
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
                <Button variant="outline">
                  Verificar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
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

        {/* Apariencia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Apariencia
            </CardTitle>
            <CardDescription>
              Personaliza la interfaz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-3 block">Tema</label>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm">Modo oscuro/claro</span>
                <ThemeToggle />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Idioma</label>
              <Input value="Español" disabled />
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Gestiona cómo y cuándo recibes notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">Notificaciones por email</div>
                  <div className="text-xs text-muted-foreground">
                    Recibe actualizaciones importantes por correo
                  </div>
                </div>
              </div>
              <Button
                variant={emailNotifications ? "default" : "outline"}
                size="sm"
                onClick={() => setEmailNotifications(!emailNotifications)}
              >
                {emailNotifications ? "Activado" : "Desactivado"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">Actualizaciones de agentes</div>
                  <div className="text-xs text-muted-foreground">
                    Notificaciones sobre la actividad de tus IAs
                  </div>
                </div>
              </div>
              <Button
                variant={agentUpdates ? "default" : "outline"}
                size="sm"
                onClick={() => setAgentUpdates(!agentUpdates)}
              >
                {agentUpdates ? "Activado" : "Desactivado"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Zona de peligro */}
        <Card className="lg:col-span-3 border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
            <CardDescription>
              Acciones irreversibles relacionadas con tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
              Eliminar todas las conversaciones
            </Button>
            <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
              Eliminar todos los agentes
            </Button>
            <Button variant="destructive">
              Eliminar cuenta permanentemente
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Botón de guardar flotante */}
      <div className="fixed bottom-8 right-8">
        <Button size="lg" onClick={handleSave} disabled={saving} className="shadow-2xl">
          {saving ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
