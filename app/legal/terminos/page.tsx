"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, FileText, Shield, AlertTriangle, Users, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TerminosPage() {
  const t = useTranslations("legal.terms");

  const sections = [
    {
      icon: FileText,
      title: t("sections.acceptance.title"),
      content: t("sections.acceptance.content"),
    },
    {
      icon: Users,
      title: t("sections.userAccounts.title"),
      content: t("sections.userAccounts.content"),
    },
    {
      icon: Shield,
      title: t("sections.usage.title"),
      content: t("sections.usage.content"),
    },
    {
      icon: AlertTriangle,
      title: t("sections.contentPolicy.title"),
      content: t("sections.contentPolicy.content"),
    },
    {
      icon: Scale,
      title: t("sections.intellectualProperty.title"),
      content: t("sections.intellectualProperty.content"),
    },
    {
      icon: Clock,
      title: t("sections.modifications.title"),
      content: t("sections.modifications.content"),
    },
  ];

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
              <Scale className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("lastUpdated")}: {t("updateDate")}
              </p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>{t("introduction.title")}</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p className="text-muted-foreground">{t("introduction.content")}</p>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <section.icon className="h-5 w-5 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-muted-foreground whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>{t("contact.title")}</CardTitle>
            <CardDescription>{t("contact.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/legal/contacto">
              <Button className="w-full sm:w-auto">
                {t("contact.button")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
