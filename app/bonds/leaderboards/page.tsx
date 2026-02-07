import { Metadata } from "next";
import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-server";
import LeaderboardsView from "@/components/bonds/LeaderboardsView";

export const metadata: Metadata = {
  title: "Rankings & Leaderboards | Symbolic Bonds",
  description:
    "Consulta los rankings globales y por tipo de vínculo. Descubre los bonds más raros y valiosos.",
};

export default async function LeaderboardsPage() {
  const session = await getServerSession();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent mb-2">
          Rankings & Leaderboards
        </h1>
        <p className="text-gray-400 text-lg">
          Los vínculos más raros y valiosos de la comunidad
        </p>
      </div>

      {/* Main View */}
      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardsView userId={session?.user?.id} />
      </Suspense>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Tabs skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg h-10 w-32"></div>
        ))}
      </div>

      {/* Podium skeleton */}
      <div className="grid grid-cols-3 gap-4 h-64">
        <div className="bg-gray-800 rounded-xl"></div>
        <div className="bg-gray-800 rounded-xl"></div>
        <div className="bg-gray-800 rounded-xl"></div>
      </div>

      {/* List skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg h-20"></div>
        ))}
      </div>
    </div>
  );
}
