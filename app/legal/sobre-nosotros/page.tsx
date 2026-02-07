"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Target, Users, Sparkles, Globe, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SobreNosotrosPage() {
  const t = useTranslations("legal.about");

  const values = [
    {
      icon: Heart,
      title: t("values.innovation.title"),
      description: t("values.innovation.description"),
    },
    {
      icon: Users,
      title: t("values.community.title"),
      description: t("values.community.description"),
    },
    {
      icon: Shield,
      title: t("values.privacy.title"),
      description: t("values.privacy.description"),
    },
    {
      icon: Sparkles,
      title: t("values.quality.title"),
      description: t("values.quality.description"),
    },
    {
      icon: Globe,
      title: t("values.accessibility.title"),
      description: t("values.accessibility.description"),
    },
    {
      icon: Target,
      title: t("values.transparency.title"),
      description: t("values.transparency.description"),
    },
  ];

  const features = [
    t("features.item1"),
    t("features.item2"),
    t("features.item3"),
    t("features.item4"),
    t("features.item5"),
    t("features.item6"),
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← {t("backToHome")}
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-lg text-muted-foreground mt-1">{t("subtitle")}</p>
            </div>
          </div>
        </div>

        {/* Mission */}
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="text-2xl">{t("mission.title")}</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground">{t("mission.content")}</p>
          </CardContent>
        </Card>

        {/* Story */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("story.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t("story.paragraph1")}</p>
            <p className="text-muted-foreground">{t("story.paragraph2")}</p>
            <p className="text-muted-foreground">{t("story.paragraph3")}</p>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t("values.title")}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {values.map((value, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-2xl bg-primary/10">
                      <value.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{value.title}</CardTitle>
                      <CardDescription className="mt-2">{value.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("features.title")}</CardTitle>
            <CardDescription>{t("features.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 p-3 rounded-2xl bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold text-primary">10K+</CardTitle>
              <CardDescription>{t("stats.users")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold text-primary">50K+</CardTitle>
              <CardDescription>{t("stats.agents")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold text-primary">1M+</CardTitle>
              <CardDescription>{t("stats.conversations")}</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Team */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("team.title")}</CardTitle>
            <CardDescription>{t("team.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">AI Researchers</Badge>
              <Badge variant="secondary">Full-Stack Developers</Badge>
              <Badge variant="secondary">UX Designers</Badge>
              <Badge variant="secondary">Community Managers</Badge>
              <Badge variant="secondary">Data Scientists</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Join Us */}
        <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="text-2xl">{t("join.title")}</CardTitle>
            <CardDescription>{t("join.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Link href="/registro">
              <Button>
                <Sparkles className="h-4 w-4 mr-2" />
                {t("join.startButton")}
              </Button>
            </Link>
            <Link href="/community">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                {t("join.communityButton")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
