import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { GroupChatLayout } from "@/components/groups/GroupChatLayout";

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
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const data = await getGroupData(groupId, session.user.id);

  if (!data) {
    redirect("/dashboard/grupos");
  }

  const { group, messages, currentMember } = data;

  return (
    <GroupChatLayout
      group={group}
      members={group.members}
      currentMember={currentMember}
      currentUserId={session.user.id}
      initialMessages={messages}
    />
  );
}
