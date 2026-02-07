/**
 * Agent Chat Layout - Layout para la página de chat con agentes
 * Sincronizado con el sistema de layouts móvil
 */

"use client";

import { useState } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import { MobileNav } from "@/components/mobile/MobileNav";
import { SearchOverlay } from "@/components/search/SearchOverlay";

export default function AgentChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <DashboardNav onSearchClick={() => setIsSearchOpen(true)} />

      {/* Mobile Layout Container */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen overflow-hidden min-w-0">
        {/* Main Content - El chat maneja su propio header en móvil */}
        <main className="flex-1 h-full overflow-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation - Oculto en chat para dar más espacio */}
      <div className="lg:hidden">
        <MobileNav />
      </div>

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
