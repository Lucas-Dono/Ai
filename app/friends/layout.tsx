"use client";

import { useState } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import { MobileNav } from "@/components/mobile/MobileNav";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { SearchOverlay } from "@/components/search/SearchOverlay";

export default function FriendsLayout({
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
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen overflow-x-hidden min-w-0">
        {/* Mobile Header */}
        <MobileHeader onSearchClick={() => setIsSearchOpen(true)} />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
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
