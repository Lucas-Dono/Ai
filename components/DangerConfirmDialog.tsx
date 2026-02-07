"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface DangerConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
}

export function DangerConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Continuar",
  cancelText = "Cancelar",
  onConfirm,
}: DangerConfirmDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [countdown1, setCountdown1] = useState(5);
  const [countdown2, setCountdown2] = useState(5);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setStep(1);
      setCountdown1(5);
      setCountdown2(5);
    }
  }, [open]);

  // Countdown for step 1
  useEffect(() => {
    if (!open || step !== 1) return;

    if (countdown1 > 0) {
      const timer = setTimeout(() => setCountdown1(countdown1 - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [open, step, countdown1]);

  // Countdown for step 2
  useEffect(() => {
    if (!open || step !== 2) return;

    if (countdown2 > 0) {
      const timer = setTimeout(() => setCountdown2(countdown2 - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [open, step, countdown2]);

  const handleFirstConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep(2);
    setCountdown2(5); // Reset countdown for step 2
  };

  const handleFinalConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    await onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    setStep(1); // Reset to step 1
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={step === 1 ? "border-destructive/50" : "border-destructive"}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className={`h-5 w-5 ${step === 2 ? "animate-pulse" : ""}`} />
            {step === 1 ? title : "¿Estás completamente seguro?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-2">
            {step === 1 ? (
              description
            ) : (
              <>
                <span className="font-semibold text-destructive">
                  Esta acción es IRREVERSIBLE.
                </span>
                <br />
                No podrás recuperar los datos eliminados.
                <br />
                <br />
                ¿Realmente deseas continuar?
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2">
          {step === 1 ? (
            <>
              {/* First dialog: confirm button on LEFT */}
              <AlertDialogAction
                onClick={handleFirstConfirm}
                disabled={countdown1 > 0}
                className="bg-destructive hover:bg-destructive/90 disabled:opacity-50"
              >
                {countdown1 > 0 ? `Estoy de acuerdo (${countdown1}s)` : "Estoy de acuerdo"}
              </AlertDialogAction>
              <AlertDialogCancel onClick={handleCancel}>
                No quiero hacerlo
              </AlertDialogCancel>
            </>
          ) : (
            <>
              {/* Second dialog: cancel button on LEFT, confirm on RIGHT */}
              <AlertDialogCancel onClick={handleCancel}>
                No, cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleFinalConfirm}
                disabled={countdown2 > 0}
                className="bg-destructive hover:bg-destructive/90 disabled:opacity-50"
              >
                {countdown2 > 0 ? `Sí, eliminar (${countdown2}s)` : "Sí, eliminar definitivamente"}
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
