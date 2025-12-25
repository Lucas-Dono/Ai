import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkFeature } from "@/lib/feature-flags";
import { Feature } from "@/lib/feature-flags/types";
import { GroupAnalyticsDashboard } from "@/components/groups/GroupAnalyticsDashboard";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

interface AnalyticsPageProps {
  params: Promise<{ id: string }>;
}

export default async function GroupAnalyticsPage({
  params,
}: AnalyticsPageProps) {
  const { id: groupId } = await params;

  // 1. Autenticación
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/login");
  }

  // 2. Verificar acceso a feature ULTRA
  const featureCheck = await checkFeature(user.id, Feature.GROUPS_ANALYTICS);

  // 3. Verificar membresía en el grupo
  const member = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId: user.id,
      memberType: "user",
      isActive: true,
    },
  });

  if (!member) {
    redirect("/dashboard/grupos");
  }

  // 4. Cargar info del grupo
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  if (!group) {
    redirect("/dashboard/grupos");
  }

  // 5. Si no tiene acceso a ULTRA, mostrar upgrade prompt
  if (!featureCheck.hasAccess) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/dashboard/grupos/${groupId}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al grupo
          </Link>

          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground mt-1">Analytics</p>
        </div>

        {/* Upgrade Prompt */}
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/20 rounded-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full mb-6">
            <Lock className="w-10 h-10 text-purple-500" />
          </div>

          <h2 className="text-2xl font-bold mb-4">
            Analytics solo disponible en ULTRA
          </h2>

          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Actualiza a ULTRA para acceder a analytics avanzadas de tus grupos,
            incluyendo métricas de participación, engagement, y visualización de
            relaciones entre miembros.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Ver Planes
            </Link>

            <Link
              href={`/dashboard/grupos/${groupId}`}
              className="px-8 py-3 bg-muted hover:bg-muted/80 font-semibold rounded-lg transition-colors"
            >
              Volver al Grupo
            </Link>
          </div>

          {/* Feature List */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-left">
              <h3 className="font-semibold mb-2">📊 Métricas Detalladas</h3>
              <p className="text-sm text-muted-foreground">
                Score de actividad, balance de participación, y engagement rate
              </p>
            </div>

            <div className="text-left">
              <h3 className="font-semibold mb-2">📈 Tendencias</h3>
              <p className="text-sm text-muted-foreground">
                Visualiza la actividad del grupo a lo largo del tiempo
              </p>
            </div>

            <div className="text-left">
              <h3 className="font-semibold mb-2">🤝 Relaciones</h3>
              <p className="text-sm text-muted-foreground">
                Analiza las interacciones entre miembros del grupo
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. Mostrar dashboard de analytics
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/dashboard/grupos/${groupId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al grupo
        </Link>

        <h1 className="text-3xl font-bold">{group.name}</h1>
        <p className="text-muted-foreground mt-1">
          {group.description || "Analytics del grupo"}
        </p>
      </div>

      {/* Analytics Dashboard */}
      <GroupAnalyticsDashboard groupId={groupId} />
    </div>
  );
}
