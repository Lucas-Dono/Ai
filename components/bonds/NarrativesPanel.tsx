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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BookOpenIcon,
  LockIcon,
  SparklesIcon,
  MessageCircleIcon,
} from "lucide-react";

interface NarrativeArc {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  requiredAffinity: number;
  category: "romance" | "friendship" | "adventure" | "drama" | "mystery";
  chapters: number;
  completedChapters: number;
}

// Narratives definitions (in production, fetch from API based on agent)
const NARRATIVE_ARCS: NarrativeArc[] = [
  {
    id: "first_meeting",
    title: "Primer Encuentro",
    description:
      "La historia de cómo vuestra conexión comenzó. Recuerda esos primeros momentos especiales.",
    unlocked: true,
    requiredAffinity: 0,
    category: "friendship",
    chapters: 3,
    completedChapters: 3,
  },
  {
    id: "shared_dreams",
    title: "Sueños Compartidos",
    description:
      "Descubre aspiraciones y deseos ocultos mientras vuestra confianza crece.",
    unlocked: true,
    requiredAffinity: 25,
    category: "friendship",
    chapters: 5,
    completedChapters: 2,
  },
  {
    id: "hidden_past",
    title: "Sombras del Pasado",
    description:
      "Secretos enterrados salen a la luz. ¿Podrás enfrentar la verdad?",
    unlocked: false,
    requiredAffinity: 40,
    category: "mystery",
    chapters: 6,
    completedChapters: 0,
  },
  {
    id: "romantic_tension",
    title: "Entre Líneas",
    description:
      "La tensión romántica crece. Momentos íntimos que cambiarán vuestra relación.",
    unlocked: false,
    requiredAffinity: 50,
    category: "romance",
    chapters: 8,
    completedChapters: 0,
  },
  {
    id: "critical_choice",
    title: "Decisión Crítica",
    description:
      "Una situación desesperada requiere una decisión imposible que definirá vuestro futuro.",
    unlocked: false,
    requiredAffinity: 65,
    category: "drama",
    chapters: 7,
    completedChapters: 0,
  },
  {
    id: "grand_adventure",
    title: "La Gran Aventura",
    description:
      "Un viaje épico juntos hacia lo desconocido. La prueba definitiva de vuestro vínculo.",
    unlocked: false,
    requiredAffinity: 75,
    category: "adventure",
    chapters: 10,
    completedChapters: 0,
  },
  {
    id: "deepest_truth",
    title: "La Verdad Más Profunda",
    description:
      "El misterio final se revela. Todo tiene sentido, pero nada será igual.",
    unlocked: false,
    requiredAffinity: 85,
    category: "mystery",
    chapters: 5,
    completedChapters: 0,
  },
  {
    id: "eternal_bond",
    title: "Vínculo Eterno",
    description:
      "El capítulo final. Vuestra historia alcanza su clímax emocional definitivo.",
    unlocked: false,
    requiredAffinity: 95,
    category: "romance",
    chapters: 4,
    completedChapters: 0,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  romance: "bg-pink-500/20 border-pink-500/50 text-pink-400",
  friendship: "bg-blue-500/20 border-blue-500/50 text-blue-400",
  adventure: "bg-orange-500/20 border-orange-500/50 text-orange-400",
  drama: "bg-purple-500/20 border-purple-500/50 text-purple-400",
  mystery: "bg-indigo-500/20 border-indigo-500/50 text-indigo-400",
};

const CATEGORY_ICONS: Record<string, string> = {
  romance: "💕",
  friendship: "🤝",
  adventure: "⚔️",
  drama: "🎭",
  mystery: "🔍",
};

export default function NarrativesPanel({
  bondId,
  narrativesUnlocked,
  agentName,
}: {
  bondId: string;
  narrativesUnlocked: string[];
  agentName: string;
}) {
  // Mark narratives as unlocked based on the array
  const narratives = NARRATIVE_ARCS.map((arc) => ({
    ...arc,
    unlocked: narrativesUnlocked.includes(arc.id),
  }));

  const unlockedCount = narratives.filter((n) => n.unlocked).length;
  const totalCount = narratives.length;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpenIcon className="h-5 w-5 text-purple-500" />
                Arcos Narrativos
              </CardTitle>
              <CardDescription>
                Historia exclusiva con {agentName}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-purple-400">
                {unlockedCount}/{totalCount}
              </p>
              <p className="text-sm text-gray-400">desbloqueados</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            Las narrativas se desbloquean al aumentar tu nivel de afinidad.
            Cada arco revela aspectos únicos de la historia y profundiza tu
            conexión.
          </p>
        </CardContent>
      </Card>

      {/* Narratives List */}
      <div className="space-y-4">
        {narratives.map((narrative, index) => (
          <NarrativeCard
            key={narrative.id}
            narrative={narrative}
            index={index}
            agentName={agentName}
            bondId={bondId}
          />
        ))}
      </div>
    </div>
  );
}

function NarrativeCard({
  narrative,
  index,
  agentName,
  bondId,
}: {
  narrative: NarrativeArc;
  index: number;
  agentName: string;
  bondId: string;
}) {
  const categoryColor = CATEGORY_COLORS[narrative.category];
  const categoryIcon = CATEGORY_ICONS[narrative.category];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card
        className={`relative overflow-hidden ${
          narrative.unlocked
            ? "border-purple-500/50 hover:border-purple-500 transition-colors cursor-pointer"
            : "border-gray-700 opacity-60"
        }`}
      >
        {/* Decorative gradient */}
        <div
          className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl ${
            narrative.unlocked
              ? "bg-gradient-to-br from-purple-500 to-pink-500"
              : "bg-gray-500"
          }`}
        ></div>

        <CardContent className="pt-6 relative">
          <div className="flex gap-4">
            {/* Icon */}
            <div
              className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl flex-shrink-0 ${
                narrative.unlocked
                  ? "bg-gradient-to-br from-purple-600 to-pink-600"
                  : "bg-gray-700"
              }`}
            >
              {narrative.unlocked ? categoryIcon : <LockIcon className="h-8 w-8 text-gray-500" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4
                    className={`font-bold text-lg mb-1 ${
                      narrative.unlocked ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {narrative.unlocked ? (
                      narrative.title
                    ) : (
                      <>
                        <LockIcon className="inline h-4 w-4 mr-1" />
                        ???
                      </>
                    )}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${categoryColor}`}
                    >
                      {categoryIcon} {narrative.category}
                    </Badge>
                    {!narrative.unlocked && (
                      <Badge variant="outline" className="text-xs text-gray-400">
                        Requiere {narrative.requiredAffinity} afinidad
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Chapters progress */}
                {narrative.unlocked && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-purple-400">
                      {narrative.completedChapters}/{narrative.chapters}
                    </p>
                    <p className="text-xs text-gray-400">capítulos</p>
                  </div>
                )}
              </div>

              <p
                className={`text-sm mb-4 ${
                  narrative.unlocked ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {narrative.unlocked
                  ? narrative.description
                  : "Este arco narrativo se desbloqueará cuando alcances mayor afinidad."}
              </p>

              {/* Progress bar for unlocked narratives */}
              {narrative.unlocked && narrative.completedChapters > 0 && (
                <div className="mb-4">
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          (narrative.completedChapters / narrative.chapters) * 100
                        }%`,
                      }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    ></motion.div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {narrative.unlocked ? (
                <div className="flex gap-2">
                  {narrative.completedChapters < narrative.chapters && (
                    <Button size="sm" asChild>
                      <Link href={`/agentes/${bondId}`}>
                        <MessageCircleIcon className="h-4 w-4 mr-2" />
                        Continuar Historia
                      </Link>
                    </Button>
                  )}
                  {narrative.completedChapters === narrative.chapters && (
                    <Badge
                      variant="outline"
                      className="border-green-500 text-green-400"
                    >
                      ✓ Completado
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <SparklesIcon className="h-4 w-4" />
                  <span>
                    Sigue interactuando con {agentName} para desbloquear
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
