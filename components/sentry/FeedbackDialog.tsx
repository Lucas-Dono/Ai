"use client";

/**
 * Sentry User Feedback Dialog Component
 *
 * Allows users to report bugs and issues directly from the UI
 */

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId?: string;
}

export function FeedbackDialog({
  open,
  onOpenChange,
  eventId,
}: FeedbackDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit feedback to Sentry
      const feedbackEventId = eventId || Sentry.captureMessage("User Feedback");

      await Sentry.captureFeedback({
        name,
        email,
        message: comments,
        associatedEventId: feedbackEventId,
      });

      toast({
        title: "Feedback enviado",
        description:
          "Gracias por tu reporte. Lo revisaremos lo antes posible.",
      });

      // Reset form
      setName("");
      setEmail("");
      setComments("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el feedback. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Reportar un problema</DialogTitle>
          <DialogDescription>
            Describe el problema que encontraste. Tu feedback nos ayuda a mejorar
            la aplicación.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre (opcional)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="comments">
                Descripción del problema <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="¿Qué sucedió? ¿Qué esperabas que sucediera?"
                rows={5}
                required
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !comments.trim()}>
              {isSubmitting ? "Enviando..." : "Enviar reporte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
