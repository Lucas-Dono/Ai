"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import type { WorldFormat, UserTier, AIWorldGeneration } from "@/lib/worlds/types";

// Componentes de los pasos
import { Step1FormatSelection } from "@/components/worlds/creator-v2/Step1FormatSelection";
import { Step2GenreSelection } from "@/components/worlds/creator-v2/Step2GenreSelection";
import { Step3TemplateSelection } from "@/components/worlds/creator-v2/Step3TemplateSelection";
import { Step4Customization } from "@/components/worlds/creator-v2/Step4Customization";

export default function SimpleWorldCreatorPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Normalizar el plan a UserTier válido (solo free, plus, ultra)
  const normalizeTier = (plan: string): UserTier => {
    const normalized = plan.toLowerCase();
    if (normalized === 'ultra') return 'ultra';
    if (normalized === 'plus') return 'plus';
    return 'free';
  };

  // Obtener el plan actualizado desde la API (no desde la sesión JWT)
  const [userTier, setUserTier] = useState<UserTier>('free');

  // Fetch del plan actualizado desde la base de datos
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch('/api/user/plan');
          if (res.ok) {
            const data = await res.json();
            setUserTier(normalizeTier(data.plan || 'free'));
          }
        } catch (error) {
          console.error('[WorldCreator] Error fetching user plan:', error);
        }
      }
    };

    fetchUserPlan();
  }, [session?.user?.id]);

  // Estados - Todos empiezan en paso 1
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFormat, setSelectedFormat] = useState<WorldFormat | null>(null);
  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [worldName, setWorldName] = useState("");
  const [aiGeneration, setAiGeneration] = useState<AIWorldGeneration | null>(null);
  const [creating, setCreating] = useState(false);

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateWorld = async () => {
    if (!aiGeneration || !worldName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("/api/worlds/create-from-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worldName,
          format: selectedFormat,
          templateId: selectedTemplateId,
          generation: aiGeneration,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear mundo");
      }

      const result = await response.json();

      if (result.success) {
        // Redirigir al mundo creado
        router.push(`/dashboard/mundos/${result.worldId}`);
      } else {
        throw new Error(result.error || "Error desconocido");
      }
    } catch (error) {
      console.error("Error creating world:", error);
      alert(error instanceof Error ? error.message : "Error al crear mundo");
    } finally {
      setCreating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1FormatSelection
            selectedFormat={selectedFormat}
            userTier={userTier}
            onSelect={(format) => {
              console.log('[Step1] Format selected:', format);
              setSelectedFormat(format);
              // Avanzar después de que el estado se actualice
              setTimeout(() => {
                console.log('[Step1] Moving to step 2 with format:', format);
                handleNext();
              }, 0);
            }}
          />
        );

      case 2:
        console.log('[Step2] Rendering with format:', selectedFormat);
        if (!selectedFormat) {
          console.error('[Step2] ERROR: No format selected!');
          return (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">Error: No hay formato seleccionado</p>
              <Button onClick={() => setCurrentStep(1)}>Volver al paso 1</Button>
            </div>
          );
        }
        return (
          <Step2GenreSelection
            format={selectedFormat}
            userTier={userTier}
            selectedGenreId={selectedGenreId}
            onSelect={(genreId) => {
              setSelectedGenreId(genreId);
              handleNext();
            }}
            onBack={handleBack}
          />
        );

      case 3:
        return (
          <Step3TemplateSelection
            format={selectedFormat!}
            userTier={userTier}
            genreId={selectedGenreId!}
            selectedTemplateId={selectedTemplateId}
            onSelect={(templateId) => {
              setSelectedTemplateId(templateId);
              handleNext();
            }}
            onBack={handleBack}
          />
        );

      case 4:
        return (
          <Step4Customization
            format={selectedFormat!}
            userTier={userTier}
            templateId={selectedTemplateId!}
            onNext={(name, generation) => {
              setWorldName(name);
              setAiGeneration(generation);
              handleCreateWorld();
            }}
            onBack={handleBack}
          />
        );

      default:
        return <div>Paso desconocido</div>;
    }
  };

  // Textos descriptivos para cada paso
  const stepTitles = [
    "Selecciona el Formato",
    "Elige un Género",
    "Escoge un Template",
    "Personaliza tu Mundo"
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/dashboard/mundos">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a mundos
          </Button>
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold md-text-primary">Crear Nuevo Mundo</h1>
            <p className="text-lg md-text-secondary">
              Modo Simple - Asistido por IA
              {userTier !== 'free' && (
                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  Plan {userTier.toUpperCase()}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-2 rounded-full transition-all ${
                  idx + 1 < currentStep
                    ? "bg-primary"
                    : idx + 1 === currentStep
                    ? "bg-primary animate-pulse"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between items-center text-sm md-text-secondary">
            <span>Paso {currentStep} de {totalSteps}: {stepTitles[currentStep - 1]}</span>
            <span className="font-semibold text-primary">
              {Math.round((currentStep / totalSteps) * 100)}% completado
            </span>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Loading overlay para creación */}
      {creating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-8 rounded-2xl shadow-2xl text-center max-w-md">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold md-text-primary mb-2">
              Creando tu mundo...
            </h3>
            <p className="md-text-secondary">
              Estamos configurando {worldName} con todos sus personajes y eventos.
              Esto puede tomar unos segundos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
