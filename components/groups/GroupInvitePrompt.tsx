/**
 * GroupInvitePrompt - Componente para mostrar y procesar invitaciones a grupos
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, X, Check, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface GroupInvitePromptProps {
  invitation: {
    id: string;
    inviteCode: string;
    expiresAt: string;
    createdAt: string;
    group: {
      id: string;
      name: string;
      description: string | null;
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
  onClose: () => void;
  onAccepted?: () => void;
}

export function GroupInvitePrompt({
  invitation,
  onClose,
  onAccepted,
}: GroupInvitePromptProps) {
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
      onAccepted?.();

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

      // Cerrar después de un momento
      setTimeout(() => {
        onClose();
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/50 hover:bg-background/80"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Group avatar */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-card">
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                    <Users className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-14 pb-6 px-6 text-center">
            <h2 className="text-xl font-semibold mb-1">
              {invitation.group.name}
            </h2>
            {invitation.group.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {invitation.group.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {invitation.group._count.members} miembros
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Expira en {expiresIn}h
              </span>
            </div>

            {/* Inviter */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Avatar className="h-6 w-6">
                {invitation.inviter.image ? (
                  <AvatarImage
                    src={invitation.inviter.image}
                    alt={invitation.inviter.name || ""}
                  />
                ) : (
                  <AvatarFallback className="text-xs">
                    {invitation.inviter.name?.charAt(0) || "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-sm">
                <span className="font-medium">{invitation.inviter.name}</span>{" "}
                te invitó a unirte
              </span>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Status messages */}
            {status === "accepted" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600"
              >
                <Check className="h-6 w-6 mx-auto mb-2" />
                <p className="font-medium">¡Te uniste al grupo!</p>
                <p className="text-sm opacity-80">Redirigiendo...</p>
              </motion.div>
            )}

            {status === "declined" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 rounded-lg bg-muted border border-border"
              >
                <X className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Invitación rechazada</p>
              </motion.div>
            )}

            {/* Actions */}
            {status === "pending" && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDecline}
                  disabled={isLoading}
                >
                  Rechazar
                </Button>
                <Button
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
