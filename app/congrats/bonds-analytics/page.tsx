import { Metadata } from "next";
import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import BondsAnalyticsDashboard from "@/components/admin/BondsAnalyticsDashboard";

export const metadata: Metadata = {
  title: "Bonds Analytics | Admin",
  description: "Panel de analytics y KPIs del sistema Symbolic Bonds",
};

export default async function BondsAnalyticsPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/admin/bonds-analytics");
  }

  // Check if user is admin (using ADMIN_EMAILS env var)
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  if (!adminEmails.includes(session.user.email)) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-600 bg-clip-text text-transparent mb-2">
          Bonds Analytics Dashboard
        </h1>
        <p className="text-gray-400 text-lg">
          KPIs y métricas en tiempo real del sistema Symbolic Bonds
        </p>
      </div>

      {/* Dashboard */}
      <Suspense fallback={<DashboardSkeleton />}>
        <BondsAnalyticsDashboard />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPIs skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-gray-800 rounded-xl h-32"></div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl h-96"></div>
        <div className="bg-gray-800 rounded-xl h-96"></div>
      </div>

      {/* Tables skeleton */}
      <div className="bg-gray-800 rounded-xl h-64"></div>
    </div>
  );
}
