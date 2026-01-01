import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { GroupSettingsPanel } from "@/components/groups/GroupSettingsPanel";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

async function getGroupSettings(groupId: string, userId: string) {
  // Verificar permisos
  const member = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId,
      memberType: "user",
      isActive: true,
    },
  });

  if (!member || !member.canEditSettings) {
    return null;
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      creator: {
        select: {
          plan: true,
        },
      },
    },
  });

  if (!group || group.status !== "ACTIVE") {
    return null;
  }

  return {
    group,
    userPlan: group.creator.plan || "free",
  };
}

export default async function GroupConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: groupId } = await params;
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const data = await getGroupSettings(groupId, session.user.id);

  if (!data) {
    redirect(`/dashboard/grupos/${groupId}`);
  }

  const { group, userPlan } = data;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/dashboard/grupos/${groupId}`}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Configuración del Grupo</h1>
          <p className="text-sm text-muted-foreground">{group.name}</p>
        </div>
      </div>

      {/* Settings */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <GroupSettingsPanel
          groupId={groupId}
          initialSettings={{
            name: group.name,
            description: group.description,
            visibility: group.visibility,
            allowUserMessages: group.allowUserMessages,
            autoAIResponses: group.autoAIResponses,
            responseDelay: group.responseDelay,
            storyMode: group.storyMode,
            directorEnabled: group.directorEnabled,
            emergentEventsEnabled: group.emergentEventsEnabled,
            allowEmotionalBonds: group.allowEmotionalBonds,
            allowConflicts: group.allowConflicts,
          }}
          userPlan={userPlan}
        />
      </Suspense>
    </div>
  );
}
