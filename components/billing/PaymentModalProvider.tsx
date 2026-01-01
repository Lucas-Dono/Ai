"use client";

import { PaymentModal } from "./PaymentModal";
import { usePaymentModal } from "@/hooks/usePaymentModal";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

/**
 * Provider que debe estar en el layout raíz para que el modal
 * esté disponible globalmente en toda la aplicación
 */
export function PaymentModalProvider() {
  const { isOpen, currentPlan, close } = usePaymentModal();
  const { data: session } = useSession();
  const router = useRouter();

  const handleSuccess = async () => {
    // Refresh the page to reload session data
    router.refresh();
    close();
  };

  // Obtener el plan actual del usuario desde la sesión
  const userPlan = (session?.user as any)?.plan || currentPlan;

  return (
    <PaymentModal
      open={isOpen}
      onOpenChange={close}
      currentPlan={userPlan}
      onSuccess={handleSuccess}
    />
  );
}
