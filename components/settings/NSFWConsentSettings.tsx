"use client";

import { useState } from "react";
import { useNSFWConsent } from "@/hooks/useNSFWConsent";
import { NSFWConsentDialog } from "@/components/nsfw/NSFWConsentDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ShieldAlert,
} from "lucide-react";

export function NSFWConsentSettings() {
  const { status, loading, giveConsent, revokeConsent, refetch } =
    useNSFWConsent();
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleGiveConsent = async () => {
    setActionLoading(true);
    const success = await giveConsent();
    setActionLoading(false);

    if (success) {
      setShowConsentDialog(false);
      await refetch();
    }
  };

  const handleRevokeConsent = async () => {
    if (
      !confirm(
        "¿Estás seguro de que deseas revocar tu consentimiento NSFW? Esto desactivará el acceso a contenido adulto."
      )
    ) {
      return;
    }

    setActionLoading(true);
    const success = await revokeConsent();
    setActionLoading(false);

    if (success) {
      await refetch();
    }
  };

  if (loading && !status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Contenido NSFW</CardTitle>
          <CardDescription>Cargando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isAdult = status?.isAdult ?? false;
  const hasConsent = status?.nsfwConsent ?? false;
  const canAccess = status?.canAccessNSFW ?? false;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                canAccess
                  ? "bg-green-500/20"
                  : isAdult
                  ? "bg-yellow-500/20"
                  : "bg-red-500/20"
              }`}
            >
              <ShieldAlert
                className={`h-5 w-5 ${
                  canAccess
                    ? "text-green-500"
                    : isAdult
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              />
            </div>
            <div>
              <CardTitle>Configuración de Contenido NSFW</CardTitle>
              <CardDescription>
                Gestiona tu consentimiento para contenido adulto (18+)
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Estado Actual:</h3>

            {/* Age Status */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50">
              {isAdult ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {isAdult
                    ? "✓ Eres mayor de 18 años"
                    : "✗ Menor de 18 años"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAdult
                    ? "Cumples con el requisito de edad para contenido NSFW"
                    : "Debes tener 18 años o más para acceder a contenido NSFW"}
                </p>
              </div>
            </div>

            {/* Consent Status */}
            {isAdult && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50">
                {hasConsent ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {hasConsent
                      ? "✓ Consentimiento NSFW activo"
                      : "✗ Sin consentimiento NSFW"}
                  </p>
                  {hasConsent && status?.nsfwConsentAt && (
                    <p className="text-xs text-muted-foreground">
                      Otorgado el:{" "}
                      {new Date(status.nsfwConsentAt).toLocaleDateString(
                        "es-ES",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                      {status.nsfwConsentVersion && (
                        <span className="ml-2">
                          (Versión: {status.nsfwConsentVersion})
                        </span>
                      )}
                    </p>
                  )}
                  {!hasConsent && (
                    <p className="text-xs text-muted-foreground">
                      Debes dar tu consentimiento explícito para acceder a
                      contenido NSFW
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Access Status */}
            <div
              className={`flex items-center gap-3 p-3 rounded-2xl border-2 ${
                canAccess
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              {canAccess ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm font-bold">
                  {canAccess
                    ? "✓ Acceso a contenido NSFW: PERMITIDO"
                    : "✗ Acceso a contenido NSFW: BLOQUEADO"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {canAccess
                    ? "Puedes activar modo NSFW en tus agentes y ver contenido adulto"
                    : isAdult
                    ? "Necesitas dar tu consentimiento para acceder a contenido NSFW"
                    : "Debes tener 18 años o más para acceder a contenido NSFW"}
                </p>
              </div>
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm space-y-1">
                <p className="font-semibold text-blue-500">
                  Sobre el contenido NSFW:
                </p>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside ml-2">
                  <li>
                    NSFW (Not Safe For Work) incluye contenido adulto, sexual o
                    psicológicamente intenso
                  </li>
                  <li>
                    Solo disponible para usuarios mayores de 18 años con
                    consentimiento explícito
                  </li>
                  <li>
                    Todo el contenido es ficción para entretenimiento entre
                    adultos
                  </li>
                  <li>Puedes revocar tu consentimiento en cualquier momento</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {isAdult && !hasConsent && (
              <Button
                onClick={() => setShowConsentDialog(true)}
                disabled={actionLoading}
                className="flex-1"
              >
                <ShieldAlert className="h-4 w-4 mr-2" />
                Dar Consentimiento NSFW
              </Button>
            )}

            {isAdult && hasConsent && (
              <Button
                variant="destructive"
                onClick={handleRevokeConsent}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Revocando...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Revocar Consentimiento
                  </>
                )}
              </Button>
            )}
          </div>

          {!isAdult && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-red-500 mb-1">
                    Restricción de Edad
                  </p>
                  <p className="text-muted-foreground">
                    Debes tener 18 años o más para acceder a contenido NSFW.
                    Esta restricción se basa en tu fecha de nacimiento y no
                    puede modificarse. Cuando cumplas 18 años, tu cuenta se
                    actualizará automáticamente.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consent Dialog */}
      <NSFWConsentDialog
        open={showConsentDialog}
        onOpenChange={setShowConsentDialog}
        onConsent={handleGiveConsent}
        onDecline={() => setShowConsentDialog(false)}
        loading={actionLoading}
      />
    </>
  );
}
