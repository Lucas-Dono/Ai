"use client";

import { NotificationPreferencesPanel } from "@/components/notifications/NotificationPreferencesPanel";

export default function NotificationSettingsPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🔔 Configuración de Notificaciones</h1>
        <p className="text-muted-foreground mt-2">
          Personaliza cómo y cuándo quieres recibir notificaciones
        </p>
      </div>

      <NotificationPreferencesPanel />
    </div>
  );
}
