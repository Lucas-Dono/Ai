import { DashboardNav } from "@/components/dashboard-nav";
import { TourOverlay } from "@/components/onboarding/TourOverlay";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <main className="flex-1 ml-64 p-8">{children}</main>
      <TourOverlay />
    </div>
  );
}
