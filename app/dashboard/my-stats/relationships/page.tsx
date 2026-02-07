/**
 * Relationship Progress Page
 * Track bonds, trust, and milestones with AI companions
 */

"use client";

import { useMyStats } from "@/hooks/useMyStats";
import { useClientLocale } from "@/hooks/useClientLocale";
import { RelationshipMeter } from "@/components/analytics/RelationshipMeter";
import { ProgressRing } from "@/components/analytics/ProgressRing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, Award, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function RelationshipsPage() {
  const { data, isLoading, error } = useMyStats("relationships");
  const { t, locale } = useClientLocale();

  // Define stageInfo AFTER getting the translation function
  const stageInfo: Record<
    string,
    {
      label: string;
      color: string;
      description: string;
    }
  > = {
    stranger: {
      label: t("myStats.relationships.relationshipStages.stranger.label"),
      color: "bg-gray-500",
      description: t("myStats.relationships.relationshipStages.stranger.description"),
    },
    acquaintance: {
      label: t("myStats.relationships.relationshipStages.acquaintance.label"),
      color: "bg-blue-500",
      description: t("myStats.relationships.relationshipStages.acquaintance.description"),
    },
    friend: {
      label: t("myStats.relationships.relationshipStages.friend.label"),
      color: "bg-green-500",
      description: t("myStats.relationships.relationshipStages.friend.description"),
    },
    close: {
      label: t("myStats.relationships.relationshipStages.close.label"),
      color: "bg-purple-500",
      description: t("myStats.relationships.relationshipStages.close.description"),
    },
    intimate: {
      label: t("myStats.relationships.relationshipStages.intimate.label"),
      color: "bg-pink-500",
      description: t("myStats.relationships.relationshipStages.intimate.description"),
    },
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !data?.relationships) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">{t("myStats.relationships.errorLoading")}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { relationships } = data.relationships;

  const totalRelationships = relationships.length;
  const stageDistribution = relationships.reduce(
    (acc, rel) => {
      acc[rel.currentStage] = (acc[rel.currentStage] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const avgTrust =
    relationships.reduce((sum, rel) => sum + rel.trust, 0) / Math.max(relationships.length, 1);
  const avgAffinity =
    relationships.reduce((sum, rel) => sum + rel.affinity, 0) / Math.max(relationships.length, 1);
  const avgRespect =
    relationships.reduce((sum, rel) => sum + rel.respect, 0) / Math.max(relationships.length, 1);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/my-stats">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t("myStats.relationships.title")}</h1>
          <p className="text-muted-foreground">
            {t("myStats.relationships.subtitle")}
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("myStats.relationships.totalRelationships")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRelationships}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("myStats.relationships.avgTrust")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(avgTrust * 100)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("myStats.relationships.avgAffinity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(avgAffinity * 100)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("myStats.relationships.avgRespect")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(avgRespect * 100)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Stage Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>{t("myStats.relationships.stages")}</CardTitle>
          <CardDescription>{t("myStats.relationships.distribution")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(stageInfo).map(([stage, info]) => {
            const count = stageDistribution[stage] || 0;
            const percentage = (count / Math.max(totalRelationships, 1)) * 100;

            return (
              <div key={stage} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${info.color}`} />
                    <span className="font-medium">{info.label}</span>
                    <span className="text-muted-foreground">- {info.description}</span>
                  </div>
                  <span className="font-bold">{count}</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Individual Relationships */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{t("myStats.relationships.yourCompanions")}</h2>

        {relationships.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {t("myStats.relationships.noRelationships")}
              </p>
              <Button asChild>
                <Link href="/dashboard">{t("myStats.relationships.startChatting")}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {relationships.map((rel) => (
              <Card key={rel.agentId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{rel.agentName}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {t("myStats.relationships.daysTogether").replace("{days}", rel.daysSinceCreation.toString())}
                      </CardDescription>
                    </div>
                    <Badge
                      className={`${stageInfo[rel.currentStage]?.color || "bg-gray-500"} text-white`}
                    >
                      {stageInfo[rel.currentStage]?.label || rel.currentStage}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress to Next Stage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("myStats.relationships.progressToNext")}</span>
                      <span className="font-medium">{Math.round(rel.progressToNext)}%</span>
                    </div>
                    <Progress value={rel.progressToNext} className="h-2" />
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <ProgressRing progress={rel.trust * 100} size={60} strokeWidth={4}>
                        <span className="text-xs font-bold">{Math.round(rel.trust * 100)}</span>
                      </ProgressRing>
                      <p className="text-xs text-muted-foreground mt-1">{t("myStats.relationships.trust")}</p>
                    </div>
                    <div className="text-center">
                      <ProgressRing progress={rel.affinity * 100} size={60} strokeWidth={4} color="#ec4899">
                        <span className="text-xs font-bold">{Math.round(rel.affinity * 100)}</span>
                      </ProgressRing>
                      <p className="text-xs text-muted-foreground mt-1">{t("myStats.relationships.affinity")}</p>
                    </div>
                    <div className="text-center">
                      <ProgressRing progress={rel.respect * 100} size={60} strokeWidth={4} color="#f59e0b">
                        <span className="text-xs font-bold">{Math.round(rel.respect * 100)}</span>
                      </ProgressRing>
                      <p className="text-xs text-muted-foreground mt-1">{t("myStats.relationships.respect")}</p>
                    </div>
                  </div>

                  {/* Milestones */}
                  {rel.milestones.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Award className="h-4 w-4 text-yellow-500" />
                        {t("myStats.relationships.milestones")}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rel.milestones.map((milestone, index) => (
                          <Badge key={index} variant="secondary">
                            {milestone}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/agentes/${rel.agentId}`}>{t("myStats.relationships.continueChatting")}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
