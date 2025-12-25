"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { PricingTable } from "./PricingTable";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: "free" | "plus" | "ultra";
  onSuccess?: () => void;
}

export function PaymentModal({
  open,
  onOpenChange,
  currentPlan = "free",
  onSuccess,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSelectPlan = async (planId: "plus" | "ultra") => {
    try {
      setLoading(true);
      setError(null);

      // Llamar al endpoint de checkout unificado
      const response = await fetch("/api/billing/checkout-unified", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          interval: "month",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el checkout");
      }

      // Redirigir según el proveedor
      if (data.provider === "mercadopago") {
        // Mercado Pago - Redirigir al init_point
        toast({
          title: "Redirigiendo a Mercado Pago",
          description: "Serás redirigido para completar el pago de forma segura",
        });

        // Redirigir después de un pequeño delay para que el usuario vea el mensaje
        setTimeout(() => {
          window.location.href = data.initPoint;
        }, 1000);
      } else if (data.provider === "paddle") {
        // Paddle - Redirigir al checkout
        toast({
          title: "Redirigiendo a Paddle",
          description: "Serás redirigido para completar el pago de forma segura",
        });

        setTimeout(() => {
          window.location.href = data.checkoutUrl;
        }, 1000);
      } else {
        throw new Error("Proveedor de pago desconocido");
      }
    } catch (err: any) {
      console.error("Error creating checkout:", err);
      setError(err.message || "Error al procesar el pago");
      toast({
        title: "Error",
        description: err.message || "No se pudo procesar el pago. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mejora tu experiencia
          </DialogTitle>
          <DialogDescription className="text-base">
            Elige el plan que mejor se adapte a tus necesidades y desbloquea todo el potencial de la plataforma
          </DialogDescription>
        </DialogHeader>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Pricing Table */}
        <div className="py-6">
          <PricingTable
            currentPlan={currentPlan}
            onSelectPlan={handleSelectPlan}
            loading={loading}
          />
        </div>

        {/* Security & Payment Info */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Pago Seguro</h4>
                <p className="text-xs text-muted-foreground">
                  Procesado por Mercado Pago con encriptación de grado bancario
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Cancela cuando quieras</h4>
                <p className="text-xs text-muted-foreground">
                  Sin compromisos. Cancela tu suscripción en cualquier momento
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Múltiples métodos</h4>
                <p className="text-xs text-muted-foreground">
                  Tarjetas, débito, Mercado Pago y más opciones disponibles
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-semibold">Preparando tu checkout...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Esto solo tomará un momento
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
