/**
 * Behavior Settings Component
 *
 * Configuración avanzada de behaviors:
 * - Reset completo
 * - Eliminar behaviors individuales
 * - Ajustar parámetros de intensidad
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, RotateCcw, Settings2, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface BehaviorProfileSettings {
  id: string;
  behaviorType: string;
  baseIntensity: number;
  volatility?: number;
  escalationRate?: number;
  deEscalationRate?: number;
  thresholdForDisplay?: number;
  currentPhase: number;
  // Campos opcionales de la página
  phaseStartedAt?: string;
  interactionsSincePhaseStart?: number;
  phaseHistory?: any[];
}

interface BehaviorSettingsProps {
  agentId: string;
  agentName: string;
  behaviors: BehaviorProfileSettings[];
}

const behaviorLabels: Record<string, string> = {
  YANDERE_OBSESSIVE: "Yandere Obsesivo",
  ANXIOUS_ATTACHMENT: "Apego Ansioso",
  AVOIDANT_ATTACHMENT: "Apego Evitativo",
  DISORGANIZED_ATTACHMENT: "Apego Desorganizado",
  BPD_SPLITTING: "TLP (Splitting)",
  NPD_GRANDIOSE: "TNP Grandioso",
  CODEPENDENCY: "Codependencia",
  OCD_PATTERNS: "Patrones TOC",
};

export function BehaviorSettings({
  agentId,
  agentName,
  behaviors,
}: BehaviorSettingsProps) {
  const router = useRouter();
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [deletingBehavior, setDeletingBehavior] = useState<string | null>(null);
  const [editingBehavior, setEditingBehavior] = useState<string | null>(null);
  const [behaviorSettings, setBehaviorSettings] = useState<
    Record<string, Partial<BehaviorProfileSettings>>
  >({});

  const handleResetAll = async () => {
    setResetting(true);
    setResetSuccess(false);

    try {
      const response = await fetch(`/api/agents/${agentId}/behaviors/reset`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reset behaviors");
      }

      setResetSuccess(true);

      // Recargar página después de 1.5 segundos
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error("Error resetting behaviors:", error);
      alert("Error al resetear behaviors. Intenta de nuevo.");
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteBehavior = async (behaviorId: string) => {
    setDeletingBehavior(behaviorId);

    try {
      const response = await fetch(
        `/api/agents/${agentId}/behaviors/${behaviorId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete behavior");
      }

      // Recargar página
      router.refresh();
    } catch (error) {
      console.error("Error deleting behavior:", error);
      alert("Error al eliminar behavior. Intenta de nuevo.");
    } finally {
      setDeletingBehavior(null);
    }
  };

  const handleUpdateBehavior = async (behaviorId: string) => {
    const settings = behaviorSettings[behaviorId];
    if (!settings) return;

    try {
      const response = await fetch(
        `/api/agents/${agentId}/behaviors/${behaviorId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update behavior");
      }

      setEditingBehavior(null);
      router.refresh();
    } catch (error) {
      console.error("Error updating behavior:", error);
      alert("Error al actualizar behavior. Intenta de nuevo.");
    }
  };

  const updateBehaviorSetting = (
    behaviorId: string,
    field: keyof BehaviorProfileSettings,
    value: number
  ) => {
    setBehaviorSettings((prev) => ({
      ...prev,
      [behaviorId]: {
        ...prev[behaviorId],
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Reset All */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Reset Completo
          </CardTitle>
          <CardDescription>
            Elimina todos los behaviors y reinicia el agente a su estado inicial
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetSuccess ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">¡Behaviors reseteados exitosamente!</span>
            </div>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={resetting || behaviors.length === 0}>
                  {resetting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reseteando...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Resetear Todos los Behaviors
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente todos los behaviors de{" "}
                    <strong>{agentName}</strong>, incluyendo:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>{behaviors.length} behavior profile(s)</li>
                      <li>Todo el historial de triggers</li>
                      <li>Progresión de fases</li>
                      <li>Estadísticas acumuladas</li>
                    </ul>
                    <p className="mt-2 font-semibold">
                      Esta acción no se puede deshacer.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetAll}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Sí, resetear todo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardContent>
      </Card>

      {/* Individual Behavior Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Configuración por Behavior
          </CardTitle>
          <CardDescription>
            Ajusta parámetros o elimina behaviors individuales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {behaviors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay behaviors activos para configurar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {behaviors.map((behavior) => {
                const isEditing = editingBehavior === behavior.id;
                const settings = behaviorSettings[behavior.id] || behavior;

                return (
                  <div
                    key={behavior.id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {behaviorLabels[behavior.behaviorType] ||
                            behavior.behaviorType}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Fase {behavior.currentPhase}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={isEditing ? "default" : "outline"}
                          onClick={() => {
                            if (isEditing) {
                              handleUpdateBehavior(behavior.id);
                            } else {
                              setEditingBehavior(behavior.id);
                              setBehaviorSettings({
                                [behavior.id]: { ...behavior },
                              });
                            }
                          }}
                        >
                          {isEditing ? "Guardar" : "Editar"}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deletingBehavior === behavior.id}
                            >
                              {deletingBehavior === behavior.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar Behavior</AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de que quieres eliminar el behavior{" "}
                                <strong>
                                  {behaviorLabels[behavior.behaviorType]}
                                </strong>
                                ? Esto eliminará su historial y progresión.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteBehavior(behavior.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="space-y-4 pt-4 border-t">
                        {/* Base Intensity */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-sm font-medium">
                              Intensidad Base
                            </label>
                            <span className="text-sm text-muted-foreground">
                              {((settings.baseIntensity || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Slider
                            value={[(settings.baseIntensity || 0) * 100]}
                            onValueChange={([value]) =>
                              updateBehaviorSetting(
                                behavior.id,
                                "baseIntensity",
                                value / 100
                              )
                            }
                            max={100}
                            step={1}
                          />
                        </div>

                        {/* Volatility */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-sm font-medium">
                              Volatilidad
                            </label>
                            <span className="text-sm text-muted-foreground">
                              {((settings.volatility ?? 0.5) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Slider
                            value={[(settings.volatility ?? 0.5) * 100]}
                            onValueChange={([value]) =>
                              updateBehaviorSetting(
                                behavior.id,
                                "volatility",
                                value / 100
                              )
                            }
                            max={100}
                            step={1}
                          />
                        </div>

                        {/* Escalation Rate */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-sm font-medium">
                              Velocidad de Escalación
                            </label>
                            <span className="text-sm text-muted-foreground">
                              {((settings.escalationRate ?? 0.1) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Slider
                            value={[(settings.escalationRate ?? 0.1) * 100]}
                            onValueChange={([value]) =>
                              updateBehaviorSetting(
                                behavior.id,
                                "escalationRate",
                                value / 100
                              )
                            }
                            max={100}
                            step={1}
                          />
                        </div>

                        {/* De-escalation Rate */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-sm font-medium">
                              Velocidad de De-escalación
                            </label>
                            <span className="text-sm text-muted-foreground">
                              {((settings.deEscalationRate ?? 0.05) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Slider
                            value={[(settings.deEscalationRate ?? 0.05) * 100]}
                            onValueChange={([value]) =>
                              updateBehaviorSetting(
                                behavior.id,
                                "deEscalationRate",
                                value / 100
                              )
                            }
                            max={100}
                            step={1}
                          />
                        </div>

                        {/* Threshold */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-sm font-medium">
                              Umbral de Visualización
                            </label>
                            <span className="text-sm text-muted-foreground">
                              {((settings.thresholdForDisplay ?? 0.3) * 100).toFixed(
                                0
                              )}
                              %
                            </span>
                          </div>
                          <Slider
                            value={[(settings.thresholdForDisplay ?? 0.3) * 100]}
                            onValueChange={([value]) =>
                              updateBehaviorSetting(
                                behavior.id,
                                "thresholdForDisplay",
                                value / 100
                              )
                            }
                            max={100}
                            step={1}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
