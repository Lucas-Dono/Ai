import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { GroupList } from "@/components/groups/GroupList";
import { Loader2 } from "lucide-react";

async function getGroups(userId: string) {
  const groups = await prisma.group.findMany({
    where: {
      status: "ACTIVE",
      members: {
        some: {
          userId,
          isActive: true,
        },
      },
    },
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
      },
      _count: {
        select: {
          messages: true,
          members: true,
        },
      },
    },
    orderBy: { lastActivityAt: "desc" },
  });

  // Add user-specific data (role, unreadCount, etc.)
  const groupsWithUserData = await Promise.all(
    groups.map(async (group) => {
      const currentMember = group.members.find(
        (m) => m.userId === userId && m.memberType === "user"
      );

      return {
        ...group,
        unreadCount: currentMember?.unreadCount || 0,
        lastSeenAt: currentMember?.lastSeenAt || null,
        role: currentMember?.role || "member",
        isMuted: currentMember?.isMuted || false,
      };
    })
  );

  return groupsWithUserData;
}

export default async function GruposPage() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const groups = await getGroups(session.user.id);

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <GroupList initialGroups={groups} />
      </Suspense>
    </div>
  );
}
