"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Database, Eye, Lock, Cookie, UserCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacidadPage() {
  const t = useTranslations("legal.privacy");

  const sections = [
    {
      icon: Database,
      title: t("sections.dataCollection.title"),
      content: t("sections.dataCollection.content"),
    },
    {
      icon: Eye,
      title: t("sections.dataUsage.title"),
      content: t("sections.dataUsage.content"),
    },
    {
      icon: Lock,
      title: t("sections.dataSecurity.title"),
      content: t("sections.dataSecurity.content"),
    },
    {
      icon: Cookie,
      title: t("sections.cookies.title"),
      content: t("sections.cookies.content"),
    },
    {
      icon: UserCheck,
      title: t("sections.userRights.title"),
      content: t("sections.userRights.content"),
    },
    {
      icon: Shield,
      title: t("sections.thirdParty.title"),
      content: t("sections.thirdParty.content"),
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
              <Shield className="h-8 w-8 text-primary" />
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
