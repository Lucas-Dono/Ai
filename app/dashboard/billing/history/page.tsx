"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PaymentHistory, PaymentHistorySkeleton } from "@/components/billing/PaymentHistory";
import { ArrowLeft } from "lucide-react";
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

export default function BillingHistoryPage() {
  const router = useRouter();
  const t = useTranslations("billing.history");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    try {
      const response = await fetch("/api/billing/invoices");

      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }

      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/billing")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-grow">
            <h1 className="text-4xl font-bold mb-2">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <PaymentHistorySkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchInvoices}>{t("tryAgain")}</Button>
          </div>
        ) : (
          <PaymentHistory invoices={invoices} />
        )}
      </motion.div>
    </div>
  );
}
