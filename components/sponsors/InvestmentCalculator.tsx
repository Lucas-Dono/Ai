"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { DollarSign, TrendingUp, MessageCircle, Eye, Mail, Sparkles } from "lucide-react";

export function InvestmentCalculator() {
  const [investment, setInvestment] = useState(1000); // Default $1,000
  const [adType, setAdType] = useState<"conversation" | "image" | "both">("both");

  // Pricing logic based on ad type
  // Modelo competitivo para lanzamiento inicial (fase early adopter)
  const getPricing = () => {
    // Precio por paquete base de $20 USD
    const basePackagePrice = 20;

    const impressionsPerPackage = {
      conversation: 1250,  // $20 = 1,250 menciones de texto → $16 CPM
      image: 125,          // $20 = 125 apariciones en imagen → $160 CPM
      both: 220,           // $20 = 220 menciones mixtas → $91 CPM
    };

    const impressionsPerDollar = impressionsPerPackage[adType] / basePackagePrice;
    const totalImpressions = Math.floor(investment * impressionsPerDollar);

    // Métricas derivadas (basadas en benchmarks de industria)
    const viewRate = 0.85; // 85% de menciones son vistas (usuarios activos)
    const effectiveImpressions = Math.floor(totalImpressions * viewRate);
    const engagementRate = 0.12; // 12% generan engagement (continúan conversación relevante)
    const conversations = Math.floor(effectiveImpressions * engagementRate);

    // CPM (Costo por mil impresiones) - útil para comparar con industria
    const cpm = totalImpressions > 0 ? ((investment / totalImpressions) * 1000).toFixed(2) : "0";
    const costPerImpression = totalImpressions > 0 ? (investment / totalImpressions).toFixed(3) : "0";

    return {
      totalImpressions,
      effectiveImpressions,
      conversations,
      cpm,
      costPerImpression,
    };
  };

  const results = getPricing();
  const isEnterprise = investment >= 5000;

  return (
    <section id="investment-calculator" className="py-12 md:py-24 sm:md:py-32 relative overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-16 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              Precios Beta - Sujetos a cambio
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Pricing{" "}
            <span className="text-blue-600">
              Estimado
            </span>
          </h2>
          <p className="text-lg text-foreground/80">
            Precios de lanzamiento para primeros sponsors. Disponibilidad limitada.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-5xl mx-auto"
        >
          <Card className="p-3 md:p-4 lg:p-8 xl:p-12 border-2 border-foreground/10 bg-card shadow-2xl">
            {/* Investment Amount Slider */}
            <div className="mb-4 md:mb-6 lg:mb-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-2">
                <label className="text-base md:text-lg font-bold text-foreground">
                  Presupuesto Mensual
                </label>
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  ${investment.toLocaleString()}
                  {investment >= 5000 && <span className="text-sm md:text-lg text-foreground/60"> USD/mes</span>}
                </div>
              </div>
              <Slider
                value={[investment]}
                onValueChange={([value]) => setInvestment(value)}
                min={10}
                max={5000}
                step={10}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-foreground/60 font-medium">
                <span>$10</span>
                <span>$5,000+</span>
              </div>
            </div>

            {/* Ad Type Selection */}
            <div className="mb-4 md:mb-6 lg:mb-10">
              <label className="text-base md:text-lg font-bold text-foreground mb-3 md:mb-4 block">
                Tipo de Publicidad
              </label>
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <button
                  onClick={() => setAdType("conversation")}
                  className={`p-3 md:p-4 rounded-xl border-2 transition-all ${
                    adType === "conversation"
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-950/20"
                      : "border-border hover:border-foreground/30 bg-card"
                  }`}
                >
                  <MessageCircle
                    className={`w-6 h-6 md:w-8 md:h-8 mb-1 md:mb-2 mx-auto ${
                      adType === "conversation" ? "text-blue-600" : "text-foreground/60"
                    }`}
                  />
                  <div className="text-xs md:text-sm font-semibold text-foreground mb-0.5 md:mb-1">
                    Solo Mención
                  </div>
                  <div className="text-[10px] md:text-xs text-foreground/60 leading-tight">
                    Personaje habla de tu producto
                  </div>
                </button>

                <button
                  onClick={() => setAdType("image")}
                  className={`p-3 md:p-4 rounded-xl border-2 transition-all ${
                    adType === "image"
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-950/20"
                      : "border-border hover:border-foreground/30 bg-card"
                  }`}
                >
                  <Eye
                    className={`w-6 h-6 md:w-8 md:h-8 mb-1 md:mb-2 mx-auto ${
                      adType === "image" ? "text-blue-600" : "text-foreground/60"
                    }`}
                  />
                  <div className="text-xs md:text-sm font-semibold text-foreground mb-0.5 md:mb-1">
                    Solo Imagen
                  </div>
                  <div className="text-[10px] md:text-xs text-foreground/60 leading-tight">
                    Producto aparece en imágenes
                  </div>
                </button>

                <button
                  onClick={() => setAdType("both")}
                  className={`p-3 md:p-4 rounded-xl border-2 transition-all relative ${
                    adType === "both"
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-950/20"
                      : "border-border hover:border-foreground/30 bg-card"
                  }`}
                >
                  {adType === "both" && (
                    <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] md:text-xs px-1.5 md:px-2">
                      Recomendado
                    </Badge>
                  )}
                  <TrendingUp
                    className={`w-6 h-6 md:w-8 md:h-8 mb-1 md:mb-2 mx-auto ${
                      adType === "both" ? "text-blue-600" : "text-foreground/60"
                    }`}
                  />
                  <div className="text-xs md:text-sm font-semibold text-foreground mb-0.5 md:mb-1">
                    Ambos
                  </div>
                  <div className="text-[10px] md:text-xs text-foreground/60 leading-tight">
                    Máximo impacto visual + textual
                  </div>
                </button>
              </div>
            </div>

            {/* Results Display */}
            {!isEnterprise ? (
              <div className="pt-4 md:pt-6 lg:pt-8 border-t-2 border-border">
                <h3 className="text-base md:text-lg lg:text-xl font-bold text-foreground mb-3 md:mb-4 lg:mb-6">
                  Resultados Estimados
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-6">
                  <div className="p-2 md:p-3 lg:p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <div className="text-[10px] md:text-xs lg:text-sm text-foreground/70 mb-0.5 md:mb-1 font-medium">
                      Impresiones Totales
                    </div>
                    <div className="text-lg md:text-xl lg:text-3xl font-bold text-blue-600">
                      {results.totalImpressions.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2 md:p-3 lg:p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <div className="text-[10px] md:text-xs lg:text-sm text-foreground/70 mb-0.5 md:mb-1 font-medium">
                      Impresiones Efectivas
                    </div>
                    <div className="text-lg md:text-xl lg:text-3xl font-bold text-blue-600">
                      {results.effectiveImpressions.toLocaleString()}
                    </div>
                    <div className="hidden md:block text-xs text-blue-600/70 mt-1">
                      85% vista por usuarios activos
                    </div>
                  </div>

                  <div className="p-2 md:p-3 lg:p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <div className="text-[10px] md:text-xs lg:text-sm text-foreground/70 mb-0.5 md:mb-1 font-medium">
                      Engagement Esperado
                    </div>
                    <div className="text-lg md:text-xl lg:text-3xl font-bold text-blue-600">
                      ~{results.conversations.toLocaleString()}
                    </div>
                    <div className="hidden md:block text-xs text-blue-600/70 mt-1">
                      12% tasa de engagement
                    </div>
                  </div>

                  <div className="p-2 md:p-3 lg:p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <div className="text-[10px] md:text-xs lg:text-sm text-foreground/70 mb-0.5 md:mb-1 font-medium">
                      CPM
                    </div>
                    <div className="text-lg md:text-xl lg:text-3xl font-bold text-blue-600">
                      ${results.cpm}
                    </div>
                    <div className="hidden md:block text-xs text-blue-600/70 mt-1">
                      Costo por mil impresiones
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-6 lg:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                  <Button
                    size="lg"
                    className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
                    onClick={() => window.open("mailto:sponsors@blaniel.com?subject=Solicitud Early Access - $" + investment + "/mes", "_blank")}
                  >
                    <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Unirse a Lista de Espera
                  </Button>
                </div>
              </div>
            ) : (
              <div className="pt-4 md:pt-6 lg:pt-8 border-t-2 border-border">
                <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-3 md:p-4 lg:p-8 text-center">
                  <DollarSign className="w-12 md:w-16 h-12 md:h-16 mx-auto mb-3 md:mb-4 text-blue-600" />
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 md:mb-3">
                    Early Access Enterprise
                  </h3>
                  <p className="text-sm md:text-base text-foreground/80 mb-4 md:mb-6 max-w-2xl mx-auto">
                    Para presupuestos de <span className="font-bold text-foreground">$5,000+</span>, ofrecemos soluciones personalizadas con
                    dedicación exclusiva, personajes custom, y garantías de rendimiento.
                    <span className="block mt-3 text-sm font-semibold text-blue-600">
                      🎯 Solo 5 slots disponibles para fase beta
                    </span>
                  </p>
                  <Button
                    size="lg"
                    className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
                    onClick={() => window.open("mailto:sponsors@blaniel.com?subject=Solicitud Enterprise Early Access - $" + investment + "/mes", "_blank")}
                  >
                    <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Solicitar Slot Enterprise
                  </Button>
                </div>
              </div>
            )}

            {/* Bottom Note */}
            <div className="mt-4 md:mt-6 lg:mt-8 p-2 md:p-3 lg:p-4 bg-blue-50/50 dark:bg-blue-950/10 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-[10px] md:text-xs text-foreground/70 text-center">
                <span className="font-semibold text-blue-600">Precios Beta:</span> Estos son precios de lanzamiento para early adopters.
                Disponibilidad limitada. Los precios aumentarán gradualmente post-lanzamiento a medida que crezca la base de usuarios.
                <span className="block mt-1.5">Todas las campañas incluyen analytics completo y optimization continua.</span>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
