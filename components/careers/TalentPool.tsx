"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Loader2, Shield } from "lucide-react";
import { useTranslations } from "next-intl";

type FormState = "idle" | "submitting" | "success" | "error";

export function TalentPool() {
  const t = useTranslations("careers.talentPool");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    area: "",
    portfolioUrl: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/talent-pool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "EMAIL_EXISTS") {
          setErrorMessage(t("errors.emailExists"));
        } else {
          setErrorMessage(data.error || t("errors.generic"));
        }
        setFormState("error");
        return;
      }

      setFormState("success");
    } catch {
      setErrorMessage(t("errors.generic"));
      setFormState("error");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      area: "",
      portfolioUrl: "",
      message: "",
    });
    setFormState("idle");
    setErrorMessage("");
  };

  if (formState === "success") {
    return (
      <section id="talent-pool" className="py-24 sm:py-32 relative overflow-hidden bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto"
          >
            <Card className="p-8 md:p-12 border-border bg-card/50 backdrop-blur-sm text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t("success.title")}</h3>
              <p className="text-muted-foreground mb-8">{t("success.message")}</p>
              <Button
                variant="outline"
                onClick={resetForm}
                className="border-border hover:bg-muted"
              >
                {t("success.another")}
              </Button>
            </Card>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="talent-pool" className="py-24 sm:py-32 relative overflow-hidden bg-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-xl mx-auto"
        >
          <Card className="p-6 md:p-8 border-border bg-card/50 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t("form.name")}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t("form.namePlaceholder")}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="bg-background"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t("form.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("form.emailPlaceholder")}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="bg-background"
                />
              </div>

              {/* Area */}
              <div className="space-y-2">
                <Label htmlFor="area">{t("form.area")}</Label>
                <Select
                  value={formData.area}
                  onValueChange={(value) =>
                    setFormData({ ...formData, area: value })
                  }
                  required
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={t("form.areaPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">
                      {t("form.areaEngineering")}
                    </SelectItem>
                    <SelectItem value="design">{t("form.areaDesign")}</SelectItem>
                    <SelectItem value="community">
                      {t("form.areaCommunity")}
                    </SelectItem>
                    <SelectItem value="other">{t("form.areaOther")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Portfolio URL */}
              <div className="space-y-2">
                <Label htmlFor="portfolioUrl">{t("form.portfolio")}</Label>
                <Input
                  id="portfolioUrl"
                  type="url"
                  placeholder={t("form.portfolioPlaceholder")}
                  value={formData.portfolioUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, portfolioUrl: e.target.value })
                  }
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  {t("form.portfolioHelper")}
                </p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">{t("form.message")}</Label>
                <Textarea
                  id="message"
                  placeholder={t("form.messagePlaceholder")}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  maxLength={500}
                  rows={3}
                  className="bg-background resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {t("form.messageHelper")}
                </p>
              </div>

              {/* Error message */}
              {formState === "error" && errorMessage && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {errorMessage}
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                disabled={formState === "submitting" || !formData.area}
                className="w-full bg-foreground text-background hover:bg-foreground/90 h-12"
              >
                {formState === "submitting" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("form.submitting")}
                  </>
                ) : (
                  t("form.submit")
                )}
              </Button>

              {/* Privacy note */}
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{t("privacy")}</p>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
