"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface NSFWConsentStatus {
  isAdult: boolean;
  nsfwConsent: boolean;
  nsfwConsentAt: string | null;
  nsfwConsentVersion: string | null;
  canAccessNSFW: boolean;
}

interface UseNSFWConsentReturn {
  status: NSFWConsentStatus | null;
  loading: boolean;
  error: string | null;
  giveConsent: () => Promise<boolean>;
  revokeConsent: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

/**
 * Hook para manejar el consentimiento NSFW del usuario
 */
export function useNSFWConsent(): UseNSFWConsentReturn {
  const { data: session, status: sessionStatus } = useSession();
  const [status, setStatus] = useState<NSFWConsentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch consent status
  const fetchConsentStatus = useCallback(async () => {
    if (sessionStatus !== "authenticated") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/user/nsfw-consent");

      if (!response.ok) {
        throw new Error("Error al obtener estado de consentimiento");
      }

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error("Error fetching NSFW consent:", err);
      setError(
        err instanceof Error ? err.message : "Error desconocido"
      );
    } finally {
      setLoading(false);
    }
  }, [sessionStatus]);

  // Initial fetch
  useEffect(() => {
    fetchConsentStatus();
  }, [fetchConsentStatus]);

  // Give consent
  const giveConsent = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/user/nsfw-consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al dar consentimiento");
      }

      const data = await response.json();

      // Update local status
      if (status) {
        setStatus({
          ...status,
          nsfwConsent: true,
          nsfwConsentAt: data.nsfwConsentAt,
          nsfwConsentVersion: data.nsfwConsentVersion,
          canAccessNSFW: status.isAdult && true,
        });
      }

      return true;
    } catch (err) {
      console.error("Error giving NSFW consent:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      return false;
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Revoke consent
  const revokeConsent = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/user/nsfw-consent", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al revocar consentimiento");
      }

      // Update local status
      if (status) {
        setStatus({
          ...status,
          nsfwConsent: false,
          nsfwConsentAt: null,
          nsfwConsentVersion: null,
          canAccessNSFW: false,
        });
      }

      return true;
    } catch (err) {
      console.error("Error revoking NSFW consent:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      return false;
    } finally {
      setLoading(false);
    }
  }, [status]);

  return {
    status,
    loading,
    error,
    giveConsent,
    revokeConsent,
    refetch: fetchConsentStatus,
  };
}

/**
 * Función auxiliar para verificar si un usuario puede activar modo NSFW en un agente
 */
export function canEnableNSFWMode(consentStatus: NSFWConsentStatus | null): {
  allowed: boolean;
  reason?: string;
} {
  if (!consentStatus) {
    return {
      allowed: false,
      reason: "Cargando estado de consentimiento...",
    };
  }

  if (!consentStatus.isAdult) {
    return {
      allowed: false,
      reason:
        "Debes tener 18 años o más para acceder a contenido NSFW. Este contenido está restringido por edad.",
    };
  }

  if (!consentStatus.nsfwConsent) {
    return {
      allowed: false,
      reason:
        "Debes dar tu consentimiento explícito para acceder a contenido NSFW. Se te mostrará un diálogo de confirmación.",
    };
  }

  return {
    allowed: true,
  };
}
