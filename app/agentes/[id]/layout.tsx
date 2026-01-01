import { DashboardNav } from "@/components/dashboard-nav";
import { MobileNav } from "@/components/mobile/MobileNav";
import { MobileHeader } from "@/components/mobile/MobileHeader";

export default function AgentChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <DashboardNav />

      {/* Mobile Header */}
      <div className="lg:hidden w-full">
        <MobileHeader />
      </div>

      {/* Main Content - Sin padding ya que el chat maneja su propio layout */}
      <main className="flex-1 lg:ml-64 h-screen overflow-hidden min-w-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
