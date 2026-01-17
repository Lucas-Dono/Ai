/**
 * Página de invitación a grupo
 * /dashboard/grupos/invitaciones/[code]
 */

import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { GroupInvitePromptPage } from "@/components/groups/GroupInvitePromptPage";

async function getInvitationData(code: string, userId: string) {
  const invitation = await prisma.groupInvitation.findUnique({
    where: { inviteCode: code },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          _count: {
            select: { members: true },
          },
        },
      },
      inviter: {
        select: { id: true, name: true, image: true },
      },
      invitee: {
        select: { id: true, name: true },
      },
    },
  });

  if (!invitation) {
    return { error: "not_found" };
  }

  // Verificar que la invitación es para este usuario
  if (invitation.inviteeId !== userId) {
    return { error: "not_for_you" };
  }

  // Verificar expiración
  if (new Date() > invitation.expiresAt) {
    return { error: "expired" };
  }

  // Verificar si ya fue procesada
  if (invitation.status !== "pending") {
    if (invitation.status === "accepted") {
      // Ya aceptada, redirigir al grupo
      return { redirect: `/dashboard/grupos/${invitation.groupId}` };
    }
    return { error: "already_processed", status: invitation.status };
  }

  // Verificar si ya es miembro (por si acaso)
  const existingMember = await prisma.groupMember.findFirst({
    where: {
      groupId: invitation.groupId,
      userId,
      memberType: "user",
    },
  });

  if (existingMember) {
    // Ya es miembro, actualizar invitación y redirigir
    await prisma.groupInvitation.update({
      where: { id: invitation.id },
      data: { status: "accepted", acceptedAt: new Date() },
    });
    return { redirect: `/dashboard/grupos/${invitation.groupId}` };
  }

  return { invitation };
}

export default async function InvitacionPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const result = await getInvitationData(code, session.user.id);

  if ("redirect" in result && result.redirect) {
    redirect(result.redirect);
  }

  if ("error" in result) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          {result.error === "not_found" && (
            <>
              <h1 className="text-2xl font-bold mb-2">Invitación no encontrada</h1>
              <p className="text-muted-foreground mb-4">
                Esta invitación no existe o el enlace es incorrecto.
              </p>
            </>
          )}
          {result.error === "not_for_you" && (
            <>
              <h1 className="text-2xl font-bold mb-2">Invitación no válida</h1>
              <p className="text-muted-foreground mb-4">
                Esta invitación fue enviada a otra persona.
              </p>
            </>
          )}
          {result.error === "expired" && (
            <>
              <h1 className="text-2xl font-bold mb-2">Invitación expirada</h1>
              <p className="text-muted-foreground mb-4">
                Esta invitación ha expirado. Pide una nueva invitación al grupo.
              </p>
            </>
          )}
          {result.error === "already_processed" && (
            <>
              <h1 className="text-2xl font-bold mb-2">Invitación ya procesada</h1>
              <p className="text-muted-foreground mb-4">
                Esta invitación ya fue {result.status === "declined" ? "rechazada" : "procesada"}.
              </p>
            </>
          )}
          <a
            href="/dashboard/grupos"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Ir a mis grupos
          </a>
        </div>
      </div>
    );
  }

  // Si llegamos aquí, tenemos una invitación válida
  const { invitation } = result;

  return <GroupInvitePromptPage invitation={invitation as any} />;
}
