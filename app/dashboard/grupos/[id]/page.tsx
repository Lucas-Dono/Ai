import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { GroupChatLayout } from "@/components/groups/GroupChatLayout";
import { randomBytes } from "crypto";

async function getGroupData(groupId: string, userId: string) {
  // Verificar membresía y obtener apiKey del usuario
  const [member, user] = await Promise.all([
    prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
        memberType: "user",
        isActive: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { apiKey: true, name: true },
    }),
  ]);

  if (!member) {
    return null;
  }

  // Auto-generar apiKey si el usuario no tiene una (necesaria para WebSocket)
  let socketToken = user?.apiKey;
  if (!socketToken) {
    socketToken = `sk_${randomBytes(32).toString("hex")}`;
    await prisma.user.update({
      where: { id: userId },
      data: { apiKey: socketToken },
    });
  }

  // Obtener grupo completo
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      User: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      GroupMember: {
        where: { isActive: true },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          Agent: {
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
      User: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      Agent: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      GroupMessage: {
        select: {
          id: true,
          content: true,
          authorType: true,
          User: {
            select: {
              id: true,
              name: true,
            },
          },
          Agent: {
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
    socketToken, // Auto-generado si no existía
    userName: user?.name || null,
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

  const { group, messages, currentMember, socketToken, userName } = data;

  return (
    <GroupChatLayout
      group={group}
      members={group.GroupMember}
      currentMember={currentMember}
      currentUserId={session.user.id}
      currentUserName={userName}
      initialMessages={messages}
      socketToken={socketToken}
    />
  );
}
