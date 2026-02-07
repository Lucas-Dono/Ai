/**
 * Community Layout - Layout para todas las páginas de Community
 * Sincronizado con el layout de dashboard para soporte móvil
 */

"use client";

import { useState } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import { MobileNav } from "@/components/mobile/MobileNav";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { SearchOverlay } from "@/components/search/SearchOverlay";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <DashboardNav onSearchClick={() => setIsSearchOpen(true)} />

      {/* Mobile Layout Container - Columnar for header + content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen overflow-x-hidden min-w-0">
        {/* Mobile Header */}
        <MobileHeader onSearchClick={() => setIsSearchOpen(true)} />

        {/* Main Content */}
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
