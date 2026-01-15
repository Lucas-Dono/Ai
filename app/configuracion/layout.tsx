/**
 * Configuracion Layout - Layout para páginas de configuración
 * Sincronizado con el layout de dashboard para soporte móvil
 */

import { DashboardNav } from "@/components/dashboard-nav";
import { MobileNav } from "@/components/mobile/MobileNav";
import { MobileHeader } from "@/components/mobile/MobileHeader";

export default function ConfiguracionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <DashboardNav />

      {/* Mobile Layout Container */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen overflow-x-hidden min-w-0">
        {/* Mobile Header */}
        <MobileHeader />

        {/* Main Content */}
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
