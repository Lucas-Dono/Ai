"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldAlert, Info } from "lucide-react";

const NSFW_CONSENT_VERSION = "v1.0";

interface NSFWConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConsent: () => void;
  onDecline: () => void;
  loading?: boolean;
}

export function NSFWConsentDialog({
  open,
  onOpenChange,
  onConsent,
  onDecline,
  loading = false,
}: NSFWConsentDialogProps) {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [understandFiction, setUnderstandFiction] = useState(false);

  const canProceed = ageConfirmed && termsAccepted && understandFiction;

  const handleConsent = () => {
    if (canProceed) {
      onConsent();
    }
  };

  const handleDecline = () => {
    setAgeConfirmed(false);
    setTermsAccepted(false);
    setUnderstandFiction(false);
    onDecline();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <DialogTitle className="text-2xl">
                Contenido NSFW/Adulto
              </DialogTitle>
              <DialogDescription className="text-base">
                Advertencia y Consentimiento Requerido
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Age Warning */}
          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-bold text-red-500">
                  ⚠️ SOLO PARA MAYORES DE 18 AÑOS
                </h3>
                <p className="text-sm text-muted-foreground">
                  El contenido NSFW (Not Safe For Work) incluye material adulto
                  que puede contener:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                  <li>Contenido sexual explícito o sugerente</li>
                  <li>Comportamientos psicológicos intensos o perturbadores</li>
                  <li>Temas maduros y situaciones para adultos</li>
                  <li>Lenguaje explícito y situaciones no aptas para menores</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold">Disclaimer Legal:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • Todo el contenido es <strong>FICCIÓN</strong> para
                    entretenimiento y roleplay creativo entre adultos
                  </li>
                  <li>
                    • NO es representación de relaciones saludables ni guía de
                    comportamiento
                  </li>
                  <li>
                    • Los comportamientos mostrados son personajes ficticios con
                    propósitos creativos
                  </li>
                  <li>
                    • Si experimentas situaciones similares en la vida real,
                    busca ayuda profesional
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
            <h4 className="font-semibold text-sm mb-2 text-blue-500">
              📞 Recursos de Ayuda (si los necesitas):
            </h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• National Domestic Violence Hotline: 1-800-799-7233</p>
              <p>• Crisis Text Line: Text HOME to 741741</p>
              <p>• National Suicide Prevention Lifeline: 988</p>
              <p>
                • SAMHSA National Helpline (substance/mental health):
                1-800-662-4357
              </p>
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-3 border-t pt-4">
            <p className="font-semibold text-sm mb-3">
              Para continuar, debes confirmar lo siguiente:
            </p>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-sm group-hover:text-primary transition-colors">
                <strong>Confirmo que tengo 18 años o más</strong> y soy legalmente
                adulto en mi jurisdicción
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={understandFiction}
                onChange={(e) => setUnderstandFiction(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-sm group-hover:text-primary transition-colors">
                <strong>Entiendo que todo el contenido es ficción</strong> para
                entretenimiento entre adultos y no representa relaciones
                saludables
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-sm group-hover:text-primary transition-colors">
                <strong>
                  Acepto los términos y condiciones de contenido NSFW
                </strong>{" "}
                (Versión {NSFW_CONSENT_VERSION}) y asumo total responsabilidad
                por acceder a este contenido
              </span>
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConsent}
            disabled={!canProceed || loading}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Procesando...
              </>
            ) : (
              "Dar Consentimiento y Continuar"
            )}
          </Button>
        </DialogFooter>

        {/* Version Info */}
        <div className="text-xs text-muted-foreground text-center mt-2">
          Versión de consentimiento: {NSFW_CONSENT_VERSION} | Puedes revocar
          este consentimiento en cualquier momento desde Configuración
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { NSFW_CONSENT_VERSION };
