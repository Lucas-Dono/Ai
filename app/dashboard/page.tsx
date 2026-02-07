"use client";

export const dynamic = 'force-dynamic';

/**
 * Dashboard Principal - Rediseñado para Simulación Social
 * Estructura:
 * 1. Tu Círculo - Conversaciones activas con mensajes sin leer
 * 2. Tus Personajes - Todos los agentes creados por el usuario
 * 3. Vibes - Categorías emocionales con ordenamiento dinámico
 * 4. Historias - Nichos de personajes históricos
 * 5. Feed de Descubrimiento - Scroll infinito
 */

import { Plus } from "lucide-react";
import Link from "next/link";
import { ErrorBoundary } from "@/components/error-boundary";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { ProactiveMessagesWidget } from "@/components/dashboard/ProactiveMessagesWidget";
import { YourCircleSection } from "@/components/dashboard/YourCircleSection";
import { YourAgentsSection } from "@/components/dashboard/YourAgentsSection";
import { VibesSections } from "@/components/dashboard/VibesSections";
import { StoriesSection } from "@/components/dashboard/StoriesSection";
import { DiscoveryFeed } from "@/components/dashboard/DiscoveryFeed";
import { useSession } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const handleRefresh = async () => {
    // Refresh será manejado por cada componente individual
    window.location.reload();
  };

  return (
    <ErrorBoundary variant="page">
      <div className="min-h-screen" data-tour="dashboard-main">
        {/* Proactive Messages Widget - Solo para usuarios autenticados */}
        {isAuthenticated && <ProactiveMessagesWidget />}

        {/* Main Content with Pull-to-Refresh */}
        <PullToRefresh onRefresh={handleRefresh} className="lg:h-auto">
          <div className="space-y-8 md:space-y-12">
            {/* 1. TU CÍRCULO - Conversaciones activas (solo autenticados) */}
            {isAuthenticated && <YourCircleSection />}

            {/* 2. TUS PERSONAJES - Todos los agentes creados por el usuario */}
            {isAuthenticated && <YourAgentsSection />}

            {/* 3. VIBES - Clasificación por emoción/personalidad */}
            <VibesSections />

            {/* 4. HISTORIAS - Nichos de personajes históricos */}
            <StoriesSection />

            {/* 5. FEED DE DESCUBRIMIENTO - Scroll infinito */}
            <DiscoveryFeed />
          </div>
        </PullToRefresh>

        {/* FAB - Floating Action Button */}
        <Link href="/create-character" data-tour="create-ai-button-fab">
          <button className="md-fab md-fab-extended" title={t("actions.createNewAI")}>
            <Plus className="h-6 w-6" />
            <span className="font-medium">{t("actions.newAI")}</span>
          </button>
        </Link>
      </div>
    </ErrorBoundary>
  );
}
