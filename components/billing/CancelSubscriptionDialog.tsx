"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (reason: string, feedback: string) => Promise<void>;
  nextBillDate?: string;
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  onCancel,
  nextBillDate,
}: CancelSubscriptionDialogProps) {
  const t = useTranslations("billing.components.cancelDialog");
  const [step, setStep] = useState<"confirm" | "survey" | "processing" | "done">("confirm");
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);

  const CANCEL_REASONS = [
    { value: "too_expensive", label: t("survey.reasons.tooExpensive") },
    { value: "not_using", label: t("survey.reasons.notUsing") },
    { value: "missing_features", label: t("survey.reasons.missingFeatures") },
    { value: "technical_issues", label: t("survey.reasons.technicalIssues") },
    { value: "found_alternative", label: t("survey.reasons.foundAlternative") },
    { value: "temporary", label: t("survey.reasons.temporary") },
    { value: "other", label: t("survey.reasons.other") },
  ];

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after close animation
    setTimeout(() => {
      setStep("confirm");
      setReason("");
      setFeedback("");
      setError(null);
    }, 300);
  };

  const handleConfirm = () => {
    setStep("survey");
  };

  const handleSubmit = async () => {
    if (!reason) {
      setError(t("survey.selectReason"));
      return;
    }

    setStep("processing");
    setError(null);

    try {
      await onCancel(reason, feedback);
      setStep("done");
    } catch (err) {
      setError(t("survey.selectReason"));
      setStep("survey");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                {t("confirm.title")}
              </DialogTitle>
              <DialogDescription className="pt-4">
                {t("confirm.message")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert className="border-orange-500/20 bg-orange-500/10">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-sm">
                  {t("confirm.remainActive")}{" "}
                  <strong>
                    {nextBillDate
                      ? new Date(nextBillDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : t("confirm.downgrade")}
                  </strong>
                  {t("confirm.downgrade")}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">{t("confirm.loseAccess")}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t("confirm.features.feature1")}</li>
                  <li>{t("confirm.features.feature2")}</li>
                  <li>{t("confirm.features.feature3")}</li>
                  <li>{t("confirm.features.feature4")}</li>
                  <li>{t("confirm.features.feature5")}</li>
                  <li>{t("confirm.features.feature6")}</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-muted p-4">
                <h4 className="font-semibold text-sm mb-2">{t("confirm.beforeYouGo")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("confirm.improveMessage")}
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose}>
                {t("confirm.keepSubscription")}
              </Button>
              <Button variant="destructive" onClick={handleConfirm}>
                {t("confirm.continueCancellation")}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "survey" && (
          <>
            <DialogHeader>
              <DialogTitle>{t("survey.title")}</DialogTitle>
              <DialogDescription>
                {t("survey.message")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <Label>{t("survey.reasonLabel")}</Label>
                <RadioGroup value={reason} onValueChange={setReason}>
                  {CANCEL_REASONS.map((r) => (
                    <div key={r.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={r.value} id={r.value} />
                      <Label
                        htmlFor={r.value}
                        className="font-normal cursor-pointer"
                      >
                        {r.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">
                  {t("survey.feedbackLabel")}
                </Label>
                <Textarea
                  id="feedback"
                  placeholder={t("survey.feedbackPlaceholder")}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep("confirm")}>
                {t("survey.back")}
              </Button>
              <Button variant="destructive" onClick={handleSubmit} disabled={!reason}>
                {t("survey.cancel")}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "processing" && (
          <>
            <DialogHeader>
              <DialogTitle>{t("processing.title")}</DialogTitle>
              <DialogDescription>
                {t("processing.message")}
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          </>
        )}

        {step === "done" && (
          <>
            <DialogHeader>
              <DialogTitle>{t("done.title")}</DialogTitle>
              <DialogDescription>
                {t("done.message")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert className="border-green-500/20 bg-green-500/10">
                <AlertCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  {t("done.remainActive")}{" "}
                  <strong>
                    {nextBillDate
                      ? new Date(nextBillDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "the end of your billing period"}
                  </strong>
                  {t("done.reactivate")}
                </AlertDescription>
              </Alert>

              <div className="rounded-2xl bg-muted p-4">
                <h4 className="font-semibold text-sm mb-2">{t("done.thankYou")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("done.improve")}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>{t("done.close")}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
