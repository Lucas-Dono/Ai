"use client";

import { EmailPreferencesPanel } from '@/components/community/EmailPreferencesPanel';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotificationSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/community/following"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Posts Seguidos
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Configuración de Notificaciones
          </h1>
          <p className="text-muted-foreground">
            Personaliza cómo y cuándo quieres recibir notificaciones sobre los posts que sigues
          </p>
        </div>

        <EmailPreferencesPanel />
      </div>
    </div>
  );
}
