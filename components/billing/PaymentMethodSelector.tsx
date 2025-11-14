"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Wallet, Info, Check } from "lucide-react";
import { motion } from "framer-motion";

export type PaymentProvider = "mercadopago" | "stripe";

interface PaymentMethodSelectorProps {
  value: PaymentProvider;
  onChange: (value: PaymentProvider) => void;
  className?: string;
  userCountry?: string; // Para recomendar según ubicación
}

export function PaymentMethodSelector({
  value,
  onChange,
  className = "",
  userCountry = "AR",
}: PaymentMethodSelectorProps) {
  const isMercadoPagoRecommended = ["AR", "BR", "CL", "CO", "MX", "PE", "UY"].includes(userCountry);

  return (
    <div className={className}>
      <Label className="text-sm font-medium mb-3 block">
        Método de Pago
      </Label>
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as PaymentProvider)}
        className="grid gap-3"
      >
        {/* MercadoPago Option */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <Card
            className={`relative cursor-pointer transition-all ${
              value === "mercadopago"
                ? "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                : "hover:border-blue-300 dark:hover:border-blue-700"
            }`}
            onClick={() => onChange("mercadopago")}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <RadioGroupItem
                  value="mercadopago"
                  id="mercadopago"
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="h-5 w-5 text-blue-600" />
                    <Label
                      htmlFor="mercadopago"
                      className="text-base font-semibold cursor-pointer"
                    >
                      MercadoPago
                    </Label>
                    {isMercadoPagoRecommended && (
                      <Badge variant="default" className="text-xs">
                        Recomendado
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Ideal para pagos en Argentina y Latinoamérica
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <FeatureBadge icon={<Check className="h-3 w-3" />}>
                      Pesos argentinos
                    </FeatureBadge>
                    <FeatureBadge icon={<Check className="h-3 w-3" />}>
                      Cuotas sin interés
                    </FeatureBadge>
                    <FeatureBadge icon={<Check className="h-3 w-3" />}>
                      Rapipago/Pago Fácil
                    </FeatureBadge>
                    <FeatureBadge icon={<Check className="h-3 w-3" />}>
                      Transferencia bancaria
                    </FeatureBadge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stripe Option */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <Card
            className={`relative cursor-pointer transition-all ${
              value === "stripe"
                ? "ring-2 ring-purple-500 bg-purple-50/50 dark:bg-purple-950/20"
                : "hover:border-purple-300 dark:hover:border-purple-700"
            }`}
            onClick={() => onChange("stripe")}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <RadioGroupItem
                  value="stripe"
                  id="stripe"
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <Label
                      htmlFor="stripe"
                      className="text-base font-semibold cursor-pointer"
                    >
                      Stripe
                    </Label>
                    {!isMercadoPagoRecommended && (
                      <Badge variant="default" className="text-xs">
                        Recomendado
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Tarjetas de crédito/débito internacionales
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <FeatureBadge icon={<Check className="h-3 w-3" />}>
                      Visa, Mastercard, Amex
                    </FeatureBadge>
                    <FeatureBadge icon={<Check className="h-3 w-3" />}>
                      Google Pay / Apple Pay
                    </FeatureBadge>
                    <FeatureBadge icon={<Check className="h-3 w-3" />}>
                      Pagos en USD/EUR
                    </FeatureBadge>
                    <FeatureBadge icon={<Check className="h-3 w-3" />}>
                      Aceptado globalmente
                    </FeatureBadge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </RadioGroup>

      {/* Info Footer */}
      <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-2xl">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          {value === "mercadopago" ? (
            <>
              <strong>MercadoPago:</strong> Aceptamos todos los métodos de pago
              locales. El precio se mostrará en pesos argentinos (ARS).
            </>
          ) : (
            <>
              <strong>Stripe:</strong> Pago seguro en dólares (USD). La
              conversión a tu moneda local la realiza tu banco.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function FeatureBadge({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-background/50 border rounded-full text-xs">
      {icon}
      {children}
    </span>
  );
}
