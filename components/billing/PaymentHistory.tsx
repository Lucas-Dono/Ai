"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  description: string;
  invoiceUrl?: string;
}

interface PaymentHistoryProps {
  invoices: Invoice[];
}

export function PaymentHistory({ invoices }: PaymentHistoryProps) {
  const t = useTranslations("billing.components.paymentHistory");

  const getStatusConfig = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return {
          icon: CheckCircle,
          label: t("status.paid"),
          variant: "default" as const,
          className: "bg-green-500/10 text-green-600 border-green-500/20",
        };
      case "pending":
        return {
          icon: Clock,
          label: t("status.pending"),
          variant: "secondary" as const,
          className: "bg-orange-500/10 text-orange-600 border-orange-500/20",
        };
      case "failed":
        return {
          icon: XCircle,
          label: t("status.failed"),
          variant: "destructive" as const,
          className: "bg-red-500/10 text-red-600 border-red-500/20",
        };
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    // Detectar locale apropiado según la moneda
    const locale =
      currency === "ARS" ? "es-AR" :
      currency === "USD" ? "en-US" :
      currency === "EUR" ? "es-ES" :
      currency === "BRL" ? "pt-BR" :
      currency === "MXN" ? "es-MX" :
      currency === "CLP" ? "es-CL" :
      "en-US"; // Fallback

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(amount / 100); // Amount is in cents
  };

  if (invoices.length === 0) {
    return (
      <Card className="p-8">
        <h3 className="text-xl font-semibold mb-6">{t("title")}</h3>
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t("noHistory")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("noHistoryMessage")}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h3 className="text-xl font-semibold mb-6">{t("title")}</h3>
      <div className="space-y-4">
        {invoices.map((invoice, index) => {
          const statusConfig = getStatusConfig(invoice.status);
          const StatusIcon = statusConfig.icon;

          return (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 border rounded-2xl hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-grow">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{invoice.description}</p>
                    <Badge variant={statusConfig.variant} className={statusConfig.className}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(invoice.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <span>•</span>
                    <span className="font-semibold">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </span>
                  </div>
                </div>
              </div>
              {invoice.invoiceUrl && invoice.status === "paid" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(invoice.invoiceUrl, "_blank")}
                  className="flex-shrink-0"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t("invoice")}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

export function PaymentHistorySkeleton() {
  return (
    <Card className="p-8">
      <div className="h-7 w-40 bg-muted rounded animate-pulse mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 border rounded-2xl"
          >
            <div className="flex items-center gap-4 flex-grow">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-grow space-y-2">
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                <div className="h-3 w-32 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="h-8 w-24 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </Card>
  );
}
