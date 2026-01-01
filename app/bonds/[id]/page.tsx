import { Metadata } from "next";
import { Suspense } from "react";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import BondDetailView from "@/components/bonds/BondDetailView";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const bond = await prisma.symbolicBond.findUnique({
    where: { id },
    include: {
      agent: {
        select: { name: true },
      },
    },
  });

  if (!bond) {
    return {
      title: "Vínculo no encontrado",
    };
  }

  return {
    title: `${bond.agent.name} - Vínculo ${bond.tier}`,
    description: `Detalles de tu vínculo ${bond.tier} con ${bond.agent.name}. Rareza: ${bond.rarityTier}.`,
  };
}

export default async function BondDetailPage({ params }: Props) {
  const session = await getServerSession();
  const { id } = await params;

  if (!session?.user) {
    redirect("/login?callbackUrl=/bonds/" + id);
  }

  // Verify bond ownership
  const bond = await prisma.symbolicBond.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!bond) {
    notFound();
  }

  if (bond.userId !== session.user.id) {
    redirect("/bonds");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Suspense fallback={<DetailSkeleton />}>
        <BondDetailView bondId={id} userId={session.user.id} />
      </Suspense>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-gray-800 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-8 bg-gray-800 rounded w-64"></div>
          <div className="h-4 bg-gray-800 rounded w-32"></div>
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-6 h-32"></div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-gray-800 rounded-xl p-6 h-96"></div>

      {/* Timeline skeleton */}
      <div className="bg-gray-800 rounded-xl p-6 h-64"></div>
    </div>
  );
}
