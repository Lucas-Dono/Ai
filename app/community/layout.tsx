/**
 * Community Layout - Layout para todas las páginas de Community
 */

import { DashboardNav } from "@/components/dashboard-nav";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <main className="flex-1 ml-64">{children}</main>
    </div>
  );
}
