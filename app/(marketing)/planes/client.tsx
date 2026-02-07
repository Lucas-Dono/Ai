"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PricingTable } from "@/components/billing/PricingTable";
import { useToast } from "@/hooks/use-toast";

interface PlanesClientProps {
  currentPlan: "free" | "plus" | "ultra";
  isAuthenticated: boolean;
}

export function PlanesClient({ currentPlan, isAuthenticated }: PlanesClientProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSelectPlan = async (planId: "plus" | "ultra") => {
    if (!isAuthenticated) {
      router.push("/auth/signin?callbackUrl=/planes");
      return;
    }

    try {
      setLoading(true);

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
        toast({
          title: "Redirigiendo a Mercado Pago",
          description: "Serás redirigido para completar el pago de forma segura",
        });

        setTimeout(() => {
          window.location.href = data.initPoint;
        }, 1000);
      } else if (data.provider === "paddle") {
        toast({
          title: "Redirigiendo a Paddle",
          description: "Serás redirigido para completar el pago de forma segura",
        });

        setTimeout(() => {
          window.location.href = data.checkoutUrl;
        }, 1000);
      }
    } catch (err: any) {
      console.error("Error creating checkout:", err);
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
    <PricingTable
      currentPlan={currentPlan}
      onSelectPlan={handleSelectPlan}
      loading={loading}
    />
  );
}
