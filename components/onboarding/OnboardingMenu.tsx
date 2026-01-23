"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useOnboardingTours } from "@/lib/onboarding/tours";
import {
  getUserExperienceLevel,
  getToursForLevel,
  levelDescriptions,
  getProgressToNextLevel,
  type UserStats,
} from "@/lib/onboarding/experience-levels";
import { GraduationCap, Check, PlayCircle, RotateCcw, TrendingUp, Sprout, Leaf, TreePine, Crown } from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';
import { cn } from "@/lib/utils";

// Mapping de iconos
const iconMap = {
  sprout: Sprout,
  leaf: Leaf,
  "tree-pine": TreePine,
  crown: Crown,
};

export function OnboardingMenu() {
  const router = useRouter();
  const { progress, isTourCompleted, resetOnboarding } = useOnboarding();
  const [open, setOpen] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [showAllTours, setShowAllTours] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('tours');
  const locale = useLocale();

  // Get translated tours
  const onboardingTours = useOnboardingTours();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  // Fetch user stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user/onboarding-stats');
        if (response.ok) {
          const data = await response.json();
          setUserStats(data);
        } else {
          console.error('Failed to fetch onboarding stats');
        }
      } catch (error) {
        console.error('Error fetching onboarding stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Determinar nivel de experiencia
  const experienceLevel = userStats ? getUserExperienceLevel(userStats) : 'beginner';
  const levelInfo = levelDescriptions[experienceLevel];
  const recommendedTourIds = getToursForLevel(experienceLevel);

  // Filtrar tours según nivel (o mostrar todos)
  const displayedTours = showAllTours
    ? onboardingTours
    : onboardingTours.filter(tour => recommendedTourIds.includes(tour.id));

  const completedCount = progress.completedTours.length;
  const totalCount = onboardingTours.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  // Progress to next level
  const nextLevelProgress = userStats ? getProgressToNextLevel(userStats, experienceLevel) : null;

  const handleStartTour = (tourId: string) => {
    router.push(`/tours/${tourId}`);
    setOpen(false);
  };

  const handleReset = () => {
    if (confirm(t("menu.resetConfirm"))) {
      resetOnboarding();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón trigger */}
      <Button
        variant="outline"
        size="sm"
        className="relative gap-2"
        onClick={() => setOpen(!open)}
      >
        <GraduationCap className="h-4 w-4" />
        {t("menu.title")}
        {!progress.isOnboardingComplete && (
          <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
            {completedCount}/{totalCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-0 w-96 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-semibold">{t("menu.heading")}</span>
              {progress.isOnboardingComplete && (
                <Badge variant="success" className="gap-1">
                  <Check className="h-3 w-3" />
                  {t("menu.complete")}
                </Badge>
              )}
            </div>

            {/* Experience Level Badge */}
            <div className="px-2 py-3">
              <div className={`p-3 rounded-2xl bg-gradient-to-r ${levelInfo.color} text-white relative overflow-hidden`}>
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const IconComponent = iconMap[levelInfo.icon as keyof typeof iconMap];
                    return IconComponent ? <IconComponent className="w-6 h-6" /> : null;
                  })()}
                  <div className="flex-1">
                    <div className="font-bold text-sm">
                      {locale === 'es' ? levelInfo.name : levelInfo.nameEn}
                    </div>
                    <div className="text-xs opacity-90">
                      {locale === 'es' ? levelInfo.description : levelInfo.descriptionEn}
                    </div>
                  </div>
                </div>

                {/* Next Level Progress */}
                {nextLevelProgress && nextLevelProgress.percentage < 100 && (
                  <div className="mt-2 pt-2 border-t border-white/20">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="opacity-90">
                        {locale === 'es' ? 'Progreso al siguiente nivel' : 'Next level progress'}
                      </span>
                      <span className="font-bold">{nextLevelProgress.percentage}%</span>
                    </div>
                    <Progress value={nextLevelProgress.percentage} className="h-1.5 bg-white/20" />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border" />

            {!progress.isOnboardingComplete && (
              <>
                <div className="px-2 py-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>{t("menu.overallProgress")}</span>
                    <span className="font-medium">{completionPercentage}%</span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>
                <div className="border-t border-border" />
              </>
            )}

            {/* Toggle para mostrar todos los tours */}
            <div className="px-2 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllTours(!showAllTours)}
                className="w-full justify-between"
              >
                <span className="text-xs">
                  {showAllTours
                    ? (locale === 'es' ? 'Mostrar recomendados' : 'Show recommended')
                    : (locale === 'es' ? 'Mostrar todos los tours' : 'Show all tours')}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {displayedTours.length}
                </Badge>
              </Button>
            </div>

            <div className="border-t border-border" />

            <div className="max-h-[400px] overflow-y-auto">
              {displayedTours.map((tour) => {
                const isCompleted = isTourCompleted(tour.id);
                const isRequired = tour.requiredForCompletion;
                const isRecommended = recommendedTourIds.includes(tour.id);

                return (
                  <div
                    key={tour.id}
                    onClick={() => handleStartTour(tour.id)}
                    className="flex items-start gap-3 py-3 px-4 cursor-pointer hover:bg-accent/50 transition-colors rounded-xl mx-2"
                  >
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <PlayCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{tour.name}</span>
                        {isRecommended && !isCompleted && (
                          <Badge variant="default" className="text-xs bg-blue-500">
                            {locale === 'es' ? 'Recomendado' : 'Recommended'}
                          </Badge>
                        )}
                        {isRequired && !isCompleted && (
                          <Badge variant="outline" className="text-xs">
                            {t("menu.required")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {tour.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {tour.steps.length} {t("menu.steps")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border" />

            <div
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-accent/50 transition-colors rounded-xl mx-2 my-2 text-destructive"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="text-sm">{t("menu.resetProgress")}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
