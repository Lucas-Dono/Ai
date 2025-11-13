import { DashboardNav } from "@/components/dashboard-nav";
import { ContextualHint } from "@/components/onboarding/ContextualHint";
import { MobileNav } from "@/components/mobile/MobileNav";
import { MobileHeader } from "@/components/mobile/MobileHeader";

export default function DashboardLayout({
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

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-8 pb-20 lg:pb-8 min-h-screen">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Contextual Hints - TourOverlay y OnboardingRewardHandler ahora están en Providers (root layout) */}
      <ContextualHint />
    </div>
  );
}
