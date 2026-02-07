/**
 * RelationshipMeter Component
 * Visual meter for trust, affinity, and respect
 */

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Award } from "lucide-react";

interface RelationshipMeterProps {
  agentName: string;
  trust: number;
  affinity: number;
  respect: number;
  currentStage: string;
}

const stageLabels: Record<string, string> = {
  stranger: "Stranger",
  acquaintance: "Acquaintance",
  friend: "Friend",
  close: "Close Friend",
  intimate: "Intimate",
};

const stageColors: Record<string, string> = {
  stranger: "text-gray-500",
  acquaintance: "text-blue-500",
  friend: "text-green-500",
  close: "text-purple-500",
  intimate: "text-pink-500",
};

export function RelationshipMeter({
  agentName,
  trust,
  affinity,
  respect,
  currentStage,
}: RelationshipMeterProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>{agentName}</span>
          <span className={`text-sm ${stageColors[currentStage] || "text-gray-500"}`}>
            {stageLabels[currentStage] || currentStage}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Trust</span>
            </div>
            <span className="font-medium">{Math.round(trust * 100)}%</span>
          </div>
          <Progress value={trust * 100} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              <span>Affinity</span>
            </div>
            <span className="font-medium">{Math.round(affinity * 100)}%</span>
          </div>
          <Progress value={affinity * 100} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-orange-500" />
              <span>Respect</span>
            </div>
            <span className="font-medium">{Math.round(respect * 100)}%</span>
          </div>
          <Progress value={respect * 100} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
