/**
 * UsageCostTracker - Real-time cost tracking with refund calculator
 *
 * Shows users exactly what they've spent and what refund they'd get
 * PHASE 5: Honest monetization with full transparency
 */

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  MessageSquare,
  Image as ImageIcon,
  Mic,
  TrendingDown,
  Info,
  Calculator,
  AlertCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UsageCostData {
  subscriptionAmount: number; // Lo que pagó
  planName: string;
  subscriptionDate: string;
  daysElapsed: number;
  usage: {
    messages: {
      count: number;
      unitCost: number;
      totalCost: number;
    };
    images: {
      count: number;
      unitCost: number;
      totalCost: number;
    };
    voice: {
      count: number;
      unitCost: number;
      totalCost: number;
    };
  };
  totalCost: number;
  estimatedRefund: number;
  refundEligible: boolean;
  daysLeftForRefund: number;
}

export function UsageCostTracker() {
  const [data, setData] = useState<UsageCostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    fetchUsageCost();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUsageCost, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchUsageCost() {
    try {
      const response = await fetch("/api/billing/usage-cost");
      if (response.ok) {
        const costData = await response.json();
        setData(costData);
      }
    } catch (error) {
      console.error("[UsageCostTracker] Error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (!data || data.planName === "free") {
    return null; // No mostrar para plan free
  }

  const costPercentage = (data.totalCost / data.subscriptionAmount) * 100;
  const refundPercentage = (data.estimatedRefund / data.subscriptionAmount) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Main Cost Card */}
      <Card className="p-6 hover-lift-glow bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Uso y Costos en Tiempo Real</h3>
            <p className="text-sm text-muted-foreground">
              Transparencia total sobre tu consumo
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-xs">
                  Todos los costos se calculan en base al uso real de APIs de IA.
                  Incluye: Mistral Small ($0.001/mensaje), ElevenLabs ($0.17/voz),
                  Flux Ultra ($0.12/imagen generada), más infraestructura y mantenimiento.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-card/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm text-muted-foreground">Plan Pagado</span>
            </div>
            <div className="text-2xl font-bold">${data.subscriptionAmount.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Plan {data.planName}</div>
          </div>

          <div className="p-4 rounded-xl bg-card/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-sm text-muted-foreground">Costo Usado</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              ${data.totalCost.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {costPercentage.toFixed(1)}% del pago
            </div>
          </div>

          <div className={cn(
            "p-4 rounded-xl border border-border/50",
            data.estimatedRefund > 0 ? "bg-green-500/10" : "bg-red-500/10"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                data.estimatedRefund > 0 ? "bg-green-500/20" : "bg-red-500/20"
              )}>
                <Calculator className={cn(
                  "w-4 h-4",
                  data.estimatedRefund > 0 ? "text-green-600" : "text-red-600"
                )} />
              </div>
              <span className="text-sm text-muted-foreground">Reembolso Est.</span>
            </div>
            <div className={cn(
              "text-2xl font-bold",
              data.estimatedRefund > 0 ? "text-green-600" : "text-red-600"
            )}>
              ${Math.max(0, data.estimatedRefund).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {data.estimatedRefund > 0
                ? `${refundPercentage.toFixed(1)}% recuperable`
                : "Sin reembolso disponible"
              }
            </div>
          </div>
        </div>

        {/* Detailed Usage Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground mb-3">
            Desglose Detallado
          </h4>

          {/* Messages */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Mensajes de Texto</div>
                <div className="text-xs text-muted-foreground">
                  {data.usage.messages.count} mensajes × ${data.usage.messages.unitCost}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold">${data.usage.messages.totalCost.toFixed(2)}</div>
              <Badge variant="secondary" className="text-xs mt-1">
                {((data.usage.messages.totalCost / data.totalCost) * 100).toFixed(0)}%
              </Badge>
            </div>
          </div>

          {/* Images */}
          {data.usage.images.count > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium">Análisis de Imágenes</div>
                  <div className="text-xs text-muted-foreground">
                    {data.usage.images.count} imágenes × ${data.usage.images.unitCost}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">${data.usage.images.totalCost.toFixed(2)}</div>
                <Badge variant="secondary" className="text-xs mt-1">
                  {((data.usage.images.totalCost / data.totalCost) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          )}

          {/* Voice */}
          {data.usage.voice.count > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Mensajes de Voz</div>
                  <div className="text-xs text-muted-foreground">
                    {data.usage.voice.count} mensajes × ${data.usage.voice.unitCost}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">${data.usage.voice.totalCost.toFixed(2)}</div>
                <Badge variant="secondary" className="text-xs mt-1">
                  {((data.usage.voice.totalCost / data.totalCost) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Refund Eligibility Alert */}
        {data.refundEligible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30"
          >
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h5 className="font-semibold text-blue-700 dark:text-blue-400 mb-1">
                  Elegible para Reembolso Proporcional
                </h5>
                <p className="text-sm text-muted-foreground mb-2">
                  Tienes <strong>{data.daysLeftForRefund} días</strong> restantes para solicitar
                  reembolso proporcional. Si cancelas hoy, recuperarías aproximadamente{" "}
                  <strong>${Math.max(0, data.estimatedRefund).toFixed(2)}</strong>.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="mt-2"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  {showCalculator ? "Ocultar" : "Ver"} Cálculo Detallado
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {!data.refundEligible && data.daysElapsed > 14 && (
          <div className="mt-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-orange-700 dark:text-orange-400 mb-1">
                  Período de reembolso expirado
                </h5>
                <p className="text-sm text-muted-foreground">
                  El período de 14 días para solicitar reembolso proporcional ha finalizado.
                  Aún puedes cancelar tu suscripción en cualquier momento.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Calculator */}
        {showCalculator && data.refundEligible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-4 rounded-xl bg-card border border-border"
          >
            <h5 className="font-semibold mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Cálculo de Reembolso
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto pagado ({data.planName}):</span>
                <span className="font-medium">${data.subscriptionAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>Menos: Costo de uso real:</span>
                <span className="font-medium">-${data.totalCost.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Reembolso estimado:</span>
                <span className={data.estimatedRefund > 0 ? "text-green-600" : "text-red-600"}>
                  ${Math.max(0, data.estimatedRefund).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                * El reembolso se procesa en 3-5 días hábiles al método de pago original.
                Los costos finales pueden variar ligeramente según las tarifas de proveedores de IA.
              </p>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Info Card */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Actualización automática:</strong> Los costos se actualizan cada 30 segundos
              para reflejar tu uso en tiempo real.
            </p>
            <p>
              <strong>Política completa:</strong> Consulta nuestra{" "}
              <a
                href="/legal/refund-policy"
                className="text-primary hover:underline"
                target="_blank"
              >
                Política de Reembolso Proporcional
              </a>{" "}
              para más detalles.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
