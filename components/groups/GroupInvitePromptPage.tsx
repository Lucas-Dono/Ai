/**
 * GroupInvitePromptPage - Página completa para procesar invitaciones a grupos
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Check,
  X,
  Clock,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

interface GroupInvitePromptPageProps {
  invitation: {
    id: string;
    inviteCode: string;
    expiresAt: Date;
    createdAt: Date;
    group: {
      id: string;
      name: string;
      description: string | null;
      createdAt: Date;
      _count: {
        members: number;
      };
    };
    inviter: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
}

export function GroupInvitePromptPage({
  invitation,
}: GroupInvitePromptPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"pending" | "accepted" | "declined">(
    "pending"
  );

  const handleAccept = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/groups/invitations/${invitation.id}/accept`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al aceptar invitación");
      }

      setStatus("accepted");

      // Redirigir al grupo después de un momento
      setTimeout(() => {
        router.push(`/dashboard/grupos/${invitation.group.id}`);
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/groups/invitations/${invitation.id}/decline`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al rechazar invitación");
      }

      setStatus("declined");

      // Redirigir a grupos después de un momento
      setTimeout(() => {
        router.push("/dashboard/grupos");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const expiresIn = Math.max(
    0,
    Math.floor(
      (new Date(invitation.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)
    )
  );

  const expiresInDays = Math.floor(expiresIn / 24);
  const expiresInHours = expiresIn % 24;

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[80vh]">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg"
      >
        {/* Back button */}
        <Link
          href="/dashboard/grupos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a grupos
        </Link>

        <div className="rounded-2xl bg-card border border-border shadow-xl overflow-hidden">
          {/* Header con gradiente */}
          <div className="relative h-40 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent">
            {/* Group avatar */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
                  <AvatarFallback className="bg-primary/20 text-primary text-3xl">
                    <Users className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <UserPlus className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-16 pb-8 px-8 text-center">
            <h1 className="text-2xl font-bold mb-2">{invitation.group.name}</h1>

            {invitation.group.description && (
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {invitation.group.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{invitation.group._count.members} miembros</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  Expira en{" "}
                  {expiresInDays > 0
                    ? `${expiresInDays}d ${expiresInHours}h`
                    : `${expiresInHours}h`}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border my-6" />

            {/* Inviter info */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <Avatar className="h-10 w-10">
                {invitation.inviter.image ? (
                  <AvatarImage
                    src={invitation.inviter.image}
                    alt={invitation.inviter.name || ""}
                  />
                ) : (
                  <AvatarFallback>
                    {invitation.inviter.name?.charAt(0) || "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-left">
                <p className="font-medium">{invitation.inviter.name}</p>
                <p className="text-sm text-muted-foreground">
                  Te invitó a unirte a este grupo
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Status messages */}
            {status === "accepted" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-6 rounded-xl bg-green-500/10 border border-green-500/20"
              >
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <p className="font-semibold text-green-600 mb-1">
                  ¡Te uniste al grupo!
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirigiendo al chat...
                </p>
              </motion.div>
            )}

            {status === "declined" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-6 rounded-xl bg-muted border border-border"
              >
                <div className="h-12 w-12 rounded-full bg-muted-foreground/20 flex items-center justify-center mx-auto mb-3">
                  <X className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Invitación rechazada
                </p>
              </motion.div>
            )}

            {/* Actions */}
            {status === "pending" && (
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={handleDecline}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAccept}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Procesando...
                    </span>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Unirme al grupo
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
