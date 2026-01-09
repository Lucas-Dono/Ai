"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";

export function FinalCTA() {
  const t = useTranslations("landing.finalCta");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const benefits = [0, 1, 2, 3];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Redirect to signup
    window.location.href = `/register?email=${encodeURIComponent(email)}`;
  };

  return (
    <section className="py-12 sm:py-16 md:py-24 lg:py-32 relative overflow-hidden bg-muted/30">
      {/* Subtle grid background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="relative overflow-hidden border border-border shadow-xl bg-card">
            <div className="p-6 sm:p-8 md:p-10 lg:p-12">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex justify-center mb-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium">
                    {t("badge")}
                  </span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center mb-8"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
                  {t("title")}{" "}
                  <span className="text-muted-foreground">
                    {t("titleHighlight")}
                  </span>
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  {t("subtitle")}
                </p>
              </motion.div>

              {/* Email Form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onSubmit={handleSignup}
                className="max-w-md mx-auto mb-8"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder={t("form.placeholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 h-12 text-base px-4 border-border"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 px-6 bg-foreground text-background hover:bg-foreground/90 text-base font-medium transition-colors"
                  >
                    {loading ? (
                      t("form.processing")
                    ) : (
                      <>
                        {t("form.button")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap justify-center gap-6 mb-8"
              >
                {benefits.map((index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-foreground/10 flex items-center justify-center">
                      <Check className="w-3 h-3" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-medium">{t(`benefits.benefit${index + 1}`)}</span>
                  </div>
                ))}
              </motion.div>

              {/* Mobile App Download */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-center"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  También disponible en dispositivos móviles
                </p>

                {/* Google Play Button */}
                <a
                  href={process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-black hover:bg-black/90 text-white transition-all duration-300 transform hover:scale-105"
                >
                  {/* Google Play Icon */}
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] leading-none opacity-80">Descárgalo en</span>
                    <span className="text-base font-semibold leading-tight">Google Play</span>
                  </div>
                </a>

                {process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL ? null : (
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    Próximamente disponible
                  </p>
                )}
              </motion.div>

              {/* Security note */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-8 pt-8 border-t border-border text-center"
              >
                <p className="text-xs text-muted-foreground">
                  {t("security.text")}{" "}
                  <a href="/privacy" className="underline hover:text-foreground">
                    {t("security.link")}
                  </a>
                </p>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Alternative CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground mb-4">
            {t("alternative.question")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              size="default"
              className="text-sm border-border hover:bg-muted"
              onClick={() => {
                document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t("alternative.demoButton")}
            </Button>
            <Button
              variant="outline"
              size="default"
              className="text-sm border-border hover:bg-muted"
              onClick={() => {
                window.location.href = "/pricing";
              }}
            >
              {t("alternative.plansButton")}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
