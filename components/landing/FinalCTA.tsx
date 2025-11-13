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
    <section className="py-24 sm:py-32 relative overflow-hidden bg-muted/30">
      {/* Subtle grid background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="relative overflow-hidden border border-border shadow-xl bg-card">
            <div className="p-8 md:p-12 lg:p-16">
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
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
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

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-center"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  {t("trust.users")}
                </p>

                {/* Avatar stack and stars */}
                <div className="flex justify-center items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-9 h-9 rounded-full bg-muted border-2 border-background"
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 fill-foreground"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                </div>
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
