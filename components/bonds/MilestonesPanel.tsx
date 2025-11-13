"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircleIcon, LockIcon, TrophyIcon } from "lucide-react";

interface Milestone {
  id: string;
  name: string;
  description: string;
  requirement: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  reward?: string;
  icon?: string;
}

// Milestones definitions (in production, fetch from API)
const ALL_MILESTONES: Milestone[] = [
  {
    id: "first_week",
    name: "Primera Semana",
    description: "Mantén tu vínculo activo durante 7 días",
    requirement: "7 días de duración",
    progress: 0,
    maxProgress: 7,
    completed: false,
    icon: "🌱",
  },
  {
    id: "first_month",
    name: "Un Mes Juntos",
    description: "Celebra tu primer mes de vínculo",
    requirement: "30 días de duración",
    progress: 0,
    maxProgress: 30,
    completed: false,
    reward: "Badge especial",
    icon: "🎉",
  },
  {
    id: "fifty_messages",
    name: "Conversador",
    description: "Intercambia 50 mensajes significativos",
    requirement: "50 interacciones",
    progress: 0,
    maxProgress: 50,
    completed: false,
    icon: "💬",
  },
  {
    id: "high_affinity",
    name: "Conexión Profunda",
    description: "Alcanza nivel 75 de afinidad",
    requirement: "Afinidad 75+",
    progress: 0,
    maxProgress: 75,
    completed: false,
    icon: "💝",
  },
  {
    id: "top_100",
    name: "Elite Global",
    description: "Entra al top 100 del ranking global",
    requirement: "Rank #100 o mejor",
    progress: 0,
    maxProgress: 1,
    completed: false,
    reward: "Título especial",
    icon: "🏆",
  },
  {
    id: "five_narratives",
    name: "Explorador de Historias",
    description: "Desbloquea 5 arcos narrativos",
    requirement: "5 narrativas desbloqueadas",
    progress: 0,
    maxProgress: 5,
    completed: false,
    icon: "📚",
  },
  {
    id: "legendary_rarity",
    name: "Vínculo Legendario",
    description: "Alcanza rareza Legendaria o superior",
    requirement: "Rareza Legendary+",
    progress: 0,
    maxProgress: 1,
    completed: false,
    reward: "Efecto visual especial",
    icon: "✨",
  },
  {
    id: "six_months",
    name: "Medio Año",
    description: "Mantén tu vínculo durante 6 meses",
    requirement: "180 días de duración",
    progress: 0,
    maxProgress: 180,
    completed: false,
    reward: "Badge de veterano",
    icon: "🌟",
  },
];

export default function MilestonesPanel({
  bondId,
  milestonesReached,
}: {
  bondId: string;
  milestonesReached: string[];
}) {
  // In production, fetch actual progress from API
  // For now, we'll mark the reached milestones as completed
  const milestones = ALL_MILESTONES.map((milestone) => ({
    ...milestone,
    completed: milestonesReached.includes(milestone.id),
    progress: milestonesReached.includes(milestone.id)
      ? milestone.maxProgress
      : 0,
  }));

  const completedCount = milestones.filter((m) => m.completed).length;
  const totalCount = milestones.length;
  const completionPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrophyIcon className="h-5 w-5 text-amber-500" />
                Logros y Milestones
              </CardTitle>
              <CardDescription>
                Progreso: {completedCount}/{totalCount} completados
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-amber-400">
                {completedCount}
              </p>
              <p className="text-sm text-gray-400">logros</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progreso general</span>
              <span className="font-semibold">
                {completionPercentage.toFixed(0)}%
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Milestones Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {milestones.map((milestone, index) => (
          <MilestoneCard key={milestone.id} milestone={milestone} index={index} />
        ))}
      </div>
    </div>
  );
}

function MilestoneCard({
  milestone,
  index,
}: {
  milestone: Milestone;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={`relative overflow-hidden ${
          milestone.completed
            ? "border-amber-500/50 bg-gradient-to-br from-amber-900/20 to-orange-900/20"
            : "border-gray-700"
        }`}
      >
        {milestone.completed && (
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/20 transform translate-x-8 -translate-y-8 rotate-45"></div>
        )}

        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={`text-4xl flex-shrink-0 ${
                milestone.completed ? "grayscale-0" : "grayscale opacity-50"
              }`}
            >
              {milestone.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4
                  className={`font-semibold ${
                    milestone.completed ? "text-white" : "text-gray-400"
                  }`}
                >
                  {milestone.name}
                </h4>
                {milestone.completed ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <LockIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
              </div>

              <p
                className={`text-sm mb-3 ${
                  milestone.completed ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {milestone.description}
              </p>

              {/* Progress bar (only for incomplete milestones) */}
              {!milestone.completed && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{milestone.requirement}</span>
                    <span>
                      {milestone.progress}/{milestone.maxProgress}
                    </span>
                  </div>
                  <Progress
                    value={(milestone.progress / milestone.maxProgress) * 100}
                    className="h-2"
                  />
                </div>
              )}

              {/* Reward badge */}
              {milestone.reward && (
                <Badge
                  variant={milestone.completed ? "default" : "outline"}
                  className="mt-3 text-xs"
                >
                  🎁 {milestone.reward}
                </Badge>
              )}

              {/* Completed badge */}
              {milestone.completed && (
                <Badge
                  variant="outline"
                  className="mt-3 text-xs border-green-500 text-green-400"
                >
                  ✓ Completado
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
