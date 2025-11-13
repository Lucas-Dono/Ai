import { Metadata } from "next";
import { Suspense } from "react";
import BondsDashboard from "@/components/bonds/BondsDashboard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Vínculos Simbólicos | Symbolic Bonds",
  description:
    "Gestiona tus vínculos exclusivos con personajes de IA. Consulta tu progreso, rareza y rankings globales.",
};

export default async function BondsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/bonds");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-600 bg-clip-text text-transparent mb-2">
          Vínculos Simbólicos
        </h1>
        <p className="text-gray-400 text-lg">
          Conexiones únicas y exclusivas con personajes de IA
        </p>
      </div>

      {/* Main Dashboard */}
      <Suspense fallback={<DashboardSkeleton />}>
        <BondsDashboard userId={session.user.id} />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-6 h-32"></div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="flex gap-4">
        <div className="bg-gray-800 rounded-lg h-10 w-32"></div>
        <div className="bg-gray-800 rounded-lg h-10 w-32"></div>
        <div className="bg-gray-800 rounded-lg h-10 w-32"></div>
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-6 h-64"></div>
        ))}
      </div>
    </div>
  );
}
