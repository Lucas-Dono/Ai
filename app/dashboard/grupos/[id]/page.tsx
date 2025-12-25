import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GroupMessageThread } from "@/components/groups/GroupMessageThread";
import { GroupMemberList } from "@/components/groups/GroupMemberList";
import {
  Users,
  Settings,
  ArrowLeft,
  Bot,
  Crown,
  Shield,
  Loader2,
} from "lucide-react";
import Link from "next/link";

async function getGroupData(groupId: string, userId: string) {
  // Verificar membresía
  const member = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId,
      memberType: "user",
      isActive: true,
    },
  });

  if (!member) {
    return null;
  }

  // Obtener grupo completo
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      members: {
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          agent: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: [{ role: "desc" }, { joinedAt: "asc" }],
      },
    },
  });

  if (!group || group.status !== "ACTIVE") {
    return null;
  }

  // Obtener mensajes iniciales
  const messages = await prisma.groupMessage.findMany({
    where: { groupId },
    orderBy: { createdAt: "asc" },
    take: 50,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      agent: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      replyTo: {
        select: {
          id: true,
          content: true,
          authorType: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          agent: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return {
    group,
    messages,
    currentMember: member,
  };
}

export default async function GrupoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: groupId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const data = await getGroupData(groupId, session.user.id);

  if (!data) {
    redirect("/dashboard/grupos");
  }

  const { group, messages, currentMember } = data;

  const userCount = group.members.filter((m) => m.memberType === "user").length;
  const aiCount = group.members.filter((m) => m.memberType === "agent").length;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-background">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left side */}
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/grupos"
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold">{group.name}</h1>
                  {currentMember.role === "owner" && (
                    <Crown
                      className="w-4 h-4 text-yellow-500"
                      title="Owner"
                    />
                  )}
                  {currentMember.role === "moderator" && (
                    <Shield
                      className="w-4 h-4 text-blue-500"
                      title="Moderador"
                    />
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {userCount} usuarios
                  </span>
                  <span className="flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    {aiCount} IAs
                  </span>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {currentMember.canEditSettings && (
                <Link
                  href={`/dashboard/grupos/${groupId}/configuracion`}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Configuración"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        <div className="container max-w-7xl mx-auto flex gap-4 p-4">
          {/* Chat area */}
          <div className="flex-1 flex flex-col bg-card border border-border rounded-lg overflow-hidden">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              }
            >
              <GroupMessageThread
                groupId={groupId}
                currentUserId={session.user.id}
                initialMessages={messages}
              />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="w-80 flex-shrink-0 bg-card border border-border rounded-lg p-4 overflow-y-auto">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              }
            >
              <GroupMemberList
                groupId={groupId}
                members={group.members}
                currentUserRole={currentMember.role}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
