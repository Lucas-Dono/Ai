"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, Send, Loader2, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ContactoPage() {
  const t = useTranslations("legal.contact");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setLoading(false);
    setSubmitted(true);
    toast.success(t("form.success"));

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← {t("backToHome")}
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-lg text-muted-foreground mt-1">{t("subtitle")}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Contact Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("info.email.title")}</CardTitle>
                <CardDescription>{t("info.email.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href="mailto:support@creadorinteligencias.com"
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  support@creadorinteligencias.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("info.community.title")}</CardTitle>
                <CardDescription>{t("info.community.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/community">
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t("info.community.button")}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("info.help.title")}</CardTitle>
                <CardDescription>{t("info.help.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/legal/ayuda">
                  <Button variant="outline" className="w-full">
                    {t("info.help.button")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t("form.title")}</CardTitle>
              <CardDescription>{t("form.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{t("form.successTitle")}</h3>
                    <p className="text-muted-foreground">{t("form.successMessage")}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("form.fields.name")}</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t("form.placeholders.name")}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("form.fields.email")}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t("form.placeholders.email")}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t("form.fields.subject")}</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder={t("form.placeholders.subject")}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t("form.fields.message")}</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t("form.placeholders.message")}
                      rows={6}
                      required
                    />
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{t("form.note")}</p>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("form.sending")}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t("form.submit")}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
