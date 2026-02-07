/**
 * GroupPageWrapper - Wrapper cliente para manejar invitaciones en la página de grupo
 */

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GroupInvitePrompt } from "./GroupInvitePrompt";

interface GroupPageWrapperProps {
  children: React.ReactNode;
  groupId: string;
}

export function GroupPageWrapper({ children, groupId }: GroupPageWrapperProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [invitation, setInvitation] = useState<any>(null);
  const [showInvitePrompt, setShowInvitePrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inviteCode = searchParams.get("invite");

  useEffect(() => {
    if (inviteCode) {
      fetchInvitation(inviteCode);
    }
  }, [inviteCode]);

  const fetchInvitation = async (code: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/invitations/code/${code}`);
      const data = await response.json();

      if (response.ok && data.invitation && !data.alreadyProcessed) {
        setInvitation(data.invitation);
        setShowInvitePrompt(true);
      } else {
        // Limpiar el parámetro de la URL si la invitación no es válida
        const url = new URL(window.location.href);
        url.searchParams.delete("invite");
        router.replace(url.pathname);
      }
    } catch (error) {
      console.error("Error fetching invitation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseInvite = () => {
    setShowInvitePrompt(false);
    // Limpiar parámetro de URL
    const url = new URL(window.location.href);
    url.searchParams.delete("invite");
    router.replace(url.pathname);
  };

  return (
    <>
      {children}
      {showInvitePrompt && invitation && (
        <GroupInvitePrompt
          invitation={invitation}
          onClose={handleCloseInvite}
          onAccepted={() => {
            // El componente maneja la redirección
          }}
        />
      )}
    </>
  );
}
