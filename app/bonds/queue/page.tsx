import { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import QueueDashboard from "@/components/bonds/QueueDashboard";

export const metadata: Metadata = {
  title: "Cola de Espera | Symbolic Bonds",
  description:
    "Gestiona tus posiciones en cola y reclama slots disponibles para establecer nuevos vínculos.",
};

export default async function QueuePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/bonds/queue");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-600 bg-clip-text text-transparent mb-2">
          Cola de Espera
        </h1>
        <p className="text-gray-400 text-lg">
          Cuando un vínculo está lleno, puedes unirte a la cola y esperar tu turno
        </p>
      </div>

      {/* Main Dashboard */}
      <Suspense fallback={<QueueSkeleton />}>
        <QueueDashboard userId={session.user.id} />
      </Suspense>
    </div>
  );
}

function QueueSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-6 h-32"></div>
        ))}
      </div>

      {/* Offers skeleton */}
      <div className="bg-gray-800 rounded-xl p-6 h-48"></div>

      {/* Queue positions skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-6 h-32"></div>
        ))}
      </div>
    </div>
  );
}
