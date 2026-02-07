"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, ArrowLeft, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { generateGradient, getInitials, cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/useHaptic";
import { ReferenceImageSelector } from "@/components/constructor/ReferenceImageSelector";
import { AvatarImageSelector } from "@/components/constructor/AvatarImageSelector";
import { OptionSelector, type Option } from "@/components/constructor/OptionSelector";
import { CharacterSearchSelector } from "@/components/constructor/CharacterSearchSelector";
import ReactMarkdown from "react-markdown";
import { useOnboardingTracking } from "@/hooks/useOnboardingTracking";
import { useTranslations } from 'next-intl';
import {
  searchCharacterMultiSource,
  getCharacterDetails,
  searchCustomUrl,
  type CharacterSearchResult
} from "@/lib/profile/multi-source-character-search";
import { SuccessCelebration } from "@/components/celebration/SuccessCelebration";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { ErrorBoundary } from "@/components/error-boundary";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";
import { useSession } from "@/lib/auth-client";
import { useRouter as useNextRouter } from "next/navigation";

interface Message {
  role: "architect" | "user";
  content: string;
}

interface AgentDraft {
  name?: string;
  kind?: "companion" | "assistant";
  personality?: string;
  purpose?: string;
  physicalAppearance?: string; // Descripción física para generación de imágenes
  avatar?: string; // Foto de cara cuadrada para previews y UI
  referenceImage?: string; // Imagen de cuerpo completo para generación img2img
  // Behavior system configuration
  nsfwMode?: boolean;
  allowDevelopTraumas?: boolean;
  initialBehavior?: string; // "none", "random_secret", or specific behavior type
  // Character research data
  characterSearchResult?: CharacterSearchResult; // Resultado seleccionado de búsqueda
  characterBiography?: string; // Biografía/información detallada del personaje
}

export default function ConstructorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { trackFirstAI, trackCustomization } = useOnboardingTracking();
  const t = useTranslations('constructor');
  const { light } = useHaptic();
  const { data: session } = useSession();
  const nextRouter = useNextRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "architect",
      content: t('architect.welcome'),
    },
  ]);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState<AgentDraft>({});
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [newAgentId, setNewAgentId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [waitingForCustomDescription, setWaitingForCustomDescription] = useState(false);

  // Character search states
  const [characterSearchResults, setCharacterSearchResults] = useState<CharacterSearchResult[]>([]);
  const [isSearchingCharacter, setIsSearchingCharacter] = useState(false);
  const [showCharacterSearch, setShowCharacterSearch] = useState(false);
  const [canGoBackToSearch, setCanGoBackToSearch] = useState(false);

  // Upgrade modal states (PHASE 5: Monetization)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeContext, setUpgradeContext] = useState<{
    type: "limit_reached" | "feature_locked" | "voluntary";
    message?: string;
    limitType?: "messages" | "agents" | "worlds" | "images";
  } | undefined>(undefined);

  // Auto-scroll cuando llegan nuevos mensajes (como WhatsApp)
  // IMPORTANTE: Solo hacer scroll DENTRO del contenedor de mensajes, NO de toda la página
  useEffect(() => {
    const hasTour = searchParams.get('tour');
    if (hasTour) {
      // Durante el tour, NO hacer auto-scroll de mensajes
      return;
    }

    // Agregar pequeño delay para evitar conflictos con otros scrolls
    const timeoutId = setTimeout(() => {
      // Hacer scroll SOLO del contenedor de mensajes, no de toda la página
      const messagesContainer = document.getElementById('messages-container');
      if (messagesContainer && messagesEndRef.current) {
        // Scroll suave dentro del contenedor de mensajes
        messagesContainer.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, searchParams]);

  const steps = [
    {
      field: "name",
      prompt: t('steps.name.prompt')
    },
    {
      field: "personality",
      prompt: (draft: AgentDraft) => t('steps.personality.prompt', { name: draft.name || '' })
    },
    {
      field: "purpose",
      prompt: (draft: AgentDraft) => t('steps.purpose.prompt', { name: draft.name || '' })
    },

    // PHYSICAL APPEARANCE STEP (for better image generation)
    {
      field: "physicalAppearance",
      prompt: (draft: AgentDraft) => t('steps.physicalAppearance.prompt', { name: draft.name || '' }),
      hasOptions: true,
      options: [
        {
          value: "random",
          label: t('steps.physicalAppearance.options.random.label'),
          description: t('steps.physicalAppearance.options.random.description')
        },
        {
          value: "asian_woman",
          label: t('steps.physicalAppearance.options.asianWoman.label'),
          description: t('steps.physicalAppearance.options.asianWoman.description')
        },
        {
          value: "latina_woman",
          label: t('steps.physicalAppearance.options.latinaWoman.label'),
          description: t('steps.physicalAppearance.options.latinaWoman.description')
        },
        {
          value: "caucasian_woman",
          label: t('steps.physicalAppearance.options.caucasianWoman.label'),
          description: t('steps.physicalAppearance.options.caucasianWoman.description')
        },
        {
          value: "asian_man",
          label: t('steps.physicalAppearance.options.asianMan.label'),
          description: t('steps.physicalAppearance.options.asianMan.description')
        },
        {
          value: "latino_man",
          label: t('steps.physicalAppearance.options.latinoMan.label'),
          description: t('steps.physicalAppearance.options.latinoMan.description')
        },
        {
          value: "caucasian_man",
          label: t('steps.physicalAppearance.options.caucasianMan.label'),
          description: t('steps.physicalAppearance.options.caucasianMan.description')
        },
        {
          value: "custom",
          label: t('steps.physicalAppearance.options.custom.label'),
          description: t('steps.physicalAppearance.options.custom.description')
        },
      ]
    },

    // AVATAR IMAGE STEP (foto de cara para previews)
    {
      field: "avatar",
      prompt: (draft: AgentDraft) => t('steps.avatar.prompt', { name: draft.name || '' }),
      isVisualStep: true
    },

    // REFERENCE IMAGE STEP (imagen de cuerpo completo para generación)
    {
      field: "referenceImage",
      prompt: (draft: AgentDraft) => t('steps.referenceImage.prompt', { name: draft.name || '' }),
      isVisualStep: true
    },

    // BEHAVIOR SYSTEM CONFIGURATION
    {
      field: "nsfwMode",
      prompt: (draft: AgentDraft) => t('steps.nsfwMode.prompt', { name: draft.name || '' }),
      hasOptions: true,
      options: [
        { value: "yes", label: t('steps.nsfwMode.options.yes.label'), description: t('steps.nsfwMode.options.yes.description') },
        { value: "no", label: t('steps.nsfwMode.options.no.label'), description: t('steps.nsfwMode.options.no.description') }
      ]
    },
    {
      field: "allowDevelopTraumas",
      prompt: (draft: AgentDraft) => t('steps.allowDevelopTraumas.prompt', { name: draft.name || '' }),
      hasOptions: true,
      options: [
        { value: "yes", label: t('steps.allowDevelopTraumas.options.yes.label'), description: t('steps.allowDevelopTraumas.options.yes.description') },
        { value: "no", label: t('steps.allowDevelopTraumas.options.no.label'), description: t('steps.allowDevelopTraumas.options.no.description') }
      ]
    },
    {
      field: "initialBehavior",
      prompt: (draft: AgentDraft) => t('steps.initialBehavior.prompt', { name: draft.name || '' }),
      hasOptions: true,
      options: [
        { value: "none", label: t('steps.initialBehavior.options.none.label'), description: t('steps.initialBehavior.options.none.description') },
        { value: "ANXIOUS_ATTACHMENT", label: t('steps.initialBehavior.options.anxious.label'), description: t('steps.initialBehavior.options.anxious.description') },
        { value: "AVOIDANT_ATTACHMENT", label: t('steps.initialBehavior.options.avoidant.label'), description: t('steps.initialBehavior.options.avoidant.description') },
        { value: "CODEPENDENCY", label: t('steps.initialBehavior.options.codependency.label'), description: t('steps.initialBehavior.options.codependency.description') },
        { value: "YANDERE_OBSESSIVE", label: t('steps.initialBehavior.options.yandere.label'), description: t('steps.initialBehavior.options.yandere.description') },
        { value: "BORDERLINE_PD", label: t('steps.initialBehavior.options.borderline.label'), description: t('steps.initialBehavior.options.borderline.description') },
        { value: "random_secret", label: t('steps.initialBehavior.options.random.label'), description: t('steps.initialBehavior.options.random.description') }
      ]
    },
  ];

  /**
   * Realiza búsqueda de personaje en múltiples fuentes
   */
  const performCharacterSearch = async (name: string) => {
    console.log('[Constructor] Iniciando búsqueda de personaje:', name);
    setIsSearchingCharacter(true);
    setShowCharacterSearch(true);

    try {
      const searchResult = await searchCharacterMultiSource(name, {
        includeWikipedia: true,
        includeAniList: true,
        includeFandom: true,
        limit: 5,
      });

      setCharacterSearchResults(searchResult.results);
      console.log('[Constructor] Búsqueda completada:', searchResult.totalFound, 'resultados');
    } catch (error) {
      console.error('[Constructor] Error en búsqueda:', error);
      setCharacterSearchResults([]);
    } finally {
      setIsSearchingCharacter(false);
    }
  };

  /**
   * Maneja la selección de un resultado de búsqueda
   */
  const handleCharacterSelect = async (result: CharacterSearchResult) => {
    console.log('[Constructor] Personaje seleccionado:', result.name);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: `Seleccioné: ${result.name} (${sourceLabels[result.source]})`
      }
    ]);

    // Obtener detalles completos del personaje
    const details = await getCharacterDetails(result);

    // Actualizar draft con el resultado
    const newDraft = {
      ...draft,
      characterSearchResult: result,
      characterBiography: details,
    };
    setDraft(newDraft);

    // Ocultar búsqueda y continuar al siguiente paso
    setShowCharacterSearch(false);

    // Avanzar al siguiente paso
    setTimeout(() => {
      const nextStepIndex = step + 1;
      if (nextStepIndex < steps.length) {
        const nextStep = steps[nextStepIndex];
        const promptText = typeof nextStep.prompt === "function"
          ? nextStep.prompt(newDraft)
          : nextStep.prompt;

        setMessages((prev) => [
          ...prev,
          {
            role: "architect",
            content: `¡Perfecto! Veo que ${result.name} es ${result.description.substring(0, 100)}...\n\n${promptText}`
          },
        ]);
        setStep(nextStepIndex);
      }
    }, 500);
  };

  /**
   * Maneja URL personalizada
   */
  const handleCustomUrl = async (url: string) => {
    console.log('[Constructor] URL personalizada:', url);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: `Buscar en: ${url}`
      }
    ]);

    setIsSearchingCharacter(true);

    try {
      const result = await searchCustomUrl(url);

      if (result) {
        // Tratar como selección de personaje
        const details = await getCharacterDetails(result);

        const newDraft = {
          ...draft,
          characterSearchResult: result,
          characterBiography: details,
        };
        setDraft(newDraft);

        setShowCharacterSearch(false);

        setTimeout(() => {
          const nextStepIndex = step + 1;
          if (nextStepIndex < steps.length) {
            const nextStep = steps[nextStepIndex];
            const promptText = typeof nextStep.prompt === "function"
              ? nextStep.prompt(newDraft)
              : nextStep.prompt;

            setMessages((prev) => [
              ...prev,
              {
                role: "architect",
                content: `¡Encontré información! ${promptText}`
              },
            ]);
            setStep(nextStepIndex);
          }
        }, 500);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "architect",
            content: "No pude extraer información de esa URL. ¿Querés intentar con otra o describir manualmente?"
          },
        ]);
      }
    } catch (error) {
      console.error('[Constructor] Error con URL personalizada:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: "architect",
          content: "Hubo un error al buscar en esa URL. ¿Querés intentar con otra?"
        },
      ]);
    } finally {
      setIsSearchingCharacter(false);
    }
  };

  /**
   * Maneja descripción manual (sin búsqueda)
   */
  const handleManualDescription = () => {
    console.log('[Constructor] Usuario eligió descripción manual');

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: "Quiero describir manualmente"
      }
    ]);

    // No guardar información de búsqueda, continuar con el flujo normal
    setShowCharacterSearch(false);
    setCanGoBackToSearch(true); // Allow going back

    setTimeout(() => {
      const nextStepIndex = step + 1;
      if (nextStepIndex < steps.length) {
        const nextStep = steps[nextStepIndex];
        const promptText = typeof nextStep.prompt === "function"
          ? nextStep.prompt(draft)
          : nextStep.prompt;

        setMessages((prev) => [
          ...prev,
          {
            role: "architect",
            content: `¡Perfecto! Vamos a crear un personaje original. ${promptText}`
          },
        ]);
        setStep(nextStepIndex);
      }
    }, 500);
  };

  /**
   * Volver a mostrar la búsqueda de personajes
   */
  const handleGoBackToSearch = () => {
    console.log('[Constructor] Volviendo a búsqueda de personajes');

    // Remove last 2 messages (user selection + architect response)
    setMessages((prev) => prev.slice(0, -2));

    // Show search again
    setShowCharacterSearch(true);
    setCanGoBackToSearch(false);
  };

  // Labels para las fuentes (helper para mensajes)
  const sourceLabels: Record<string, string> = {
    wikipedia: 'Wikipedia',
    anilist: 'AniList',
    fandom: 'Fandom Wiki',
    custom: 'Personalizado',
  };

  const createAgent = async (finalDraft: AgentDraft) => {
    console.log('[Constructor] Iniciando creación de agente con draft:', finalDraft);
    setCreating(true);
    try {
      console.log('[Constructor] Enviando POST a /api/agents...');
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalDraft.name,
          kind: "companion", // Siempre companion (sentimental)
          personality: finalDraft.personality,
          purpose: finalDraft.purpose,
          avatar: finalDraft.avatar, // Foto de cara para previews
          referenceImage: finalDraft.referenceImage, // Imagen de cuerpo completo para generación
          // Behavior system configuration
          nsfwMode: finalDraft.nsfwMode || false,
          allowDevelopTraumas: finalDraft.allowDevelopTraumas || false,
          initialBehavior: finalDraft.initialBehavior || "none",
          // Character research data (si existe)
          characterBiography: finalDraft.characterBiography,
        }),
      });

      console.log('[Constructor] Respuesta recibida:', res.status, res.statusText);

      if (!res.ok) {
        const errorData = await res.json();
        console.error('[Constructor] Error del servidor:', errorData);

        // PHASE 5: Check if it's a limit reached error
        if (res.status === 429 || errorData.error?.includes("límite") || errorData.error?.includes("limit") || errorData.error?.includes("agents")) {
          setUpgradeContext({
            type: "limit_reached",
            limitType: "agents",
            message: errorData.error || "Has alcanzado tu límite de agentes para tu plan",
          });
          setShowUpgradeModal(true);
          throw new Error(errorData.error || "Límite de agentes alcanzado");
        }

        throw new Error(errorData.error || "Failed to create agent");
      }

      const data = await res.json();
      console.log('[Constructor] Agente creado exitosamente:', data);
      setNewAgentId(data.id);
      setShowCelebration(true); // Show celebration modal

      // Track onboarding progress
      trackFirstAI();

      setMessages((prev) => [
        ...prev,
        {
          role: "architect",
          content: t('completion.message', { name: finalDraft.name || '' })
        },
      ]);
    } catch (error) {
      console.error('[Constructor] Error en createAgent:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: "architect",
          content: t('completion.error')
        },
      ]);
    } finally {
      console.log('[Constructor] Finalizando creación, setting creating=false');
      setCreating(false);
    }
  };

  const handleSend = (valueOverride?: string) => {
    // Usar valueOverride si se proporciona, sino el input del state
    const valueToUse = valueOverride !== undefined ? valueOverride : input;

    if (!valueToUse.trim()) return;

    console.log('[Constructor] handleSend ejecutado. Step actual:', step, 'Steps total:', steps.length);

    const userMessage: Message = { role: "user", content: valueToUse };
    setMessages((prev) => [...prev, userMessage]);

    // Actualizar draft basándose en el field del step ACTUAL
    const currentStep = steps[step];
    const newDraft = { ...draft };

    // Guardar en el campo correspondiente al step actual
    switch (currentStep.field) {
      case "name":
        newDraft.name = valueToUse;
        console.log('[Constructor] Guardando nombre:', valueToUse);

        // IMPORTANTE: Después de guardar el nombre, iniciar búsqueda de personaje
        setDraft(newDraft);
        setInput("");

        // Disparar búsqueda automáticamente
        setTimeout(() => {
          performCharacterSearch(valueToUse);
        }, 500);

        // NO continuar con el flujo normal aquí, la búsqueda manejará el siguiente paso
        return;
      // El resto de casos continúan normalmente
      case "kind":
        const lower = valueToUse.toLowerCase();
        if (lower.includes("compañero") || lower.includes("emocional") || lower.includes("companion")) {
          newDraft.kind = "companion";
        } else if (lower.includes("asistente") || lower.includes("admin") || lower.includes("assistant")) {
          newDraft.kind = "assistant";
        } else {
          // Por defecto, companion
          newDraft.kind = "companion";
        }
        console.log('[Constructor] Guardando kind:', newDraft.kind);
        break;
      case "personality":
        newDraft.personality = valueToUse;
        console.log('[Constructor] Guardando personality:', valueToUse);
        break;
      case "purpose":
        newDraft.purpose = valueToUse;
        console.log('[Constructor] Guardando purpose:', valueToUse);
        break;

      case "physicalAppearance":
        // Si estábamos esperando descripción personalizada y ahora la recibimos
        if (waitingForCustomDescription) {
          newDraft.physicalAppearance = valueToUse;
          console.log('[Constructor] Guardando physicalAppearance personalizada:', valueToUse);
        }
        // Si seleccionó "custom", marcar que esperamos la descripción en el siguiente paso
        else if (valueToUse === "custom") {
          console.log('[Constructor] Modo custom activado, esperando descripción del usuario');
          // No guardar nada todavía, esperamos el siguiente mensaje
          // No incrementar step aquí, se hará en el setTimeout de abajo
        } else if (valueToUse === "random") {
          newDraft.physicalAppearance = "random";
          console.log('[Constructor] Guardando physicalAppearance: random');
        } else {
          // Es una de las opciones predefinidas, expandir a descripción completa
          const appearanceMap: Record<string, string> = {
            asian_woman: "Mujer asiática, cabello negro liso largo, piel clara, ojos oscuros almendrados, complexión delgada, 1.65m de altura, estilo moderno elegante, rostro delicado",
            latina_woman: "Mujer latina, cabello castaño ondulado, piel morena clara, ojos cafés expresivos, complexión curvilínea, 1.68m de altura, estilo casual sofisticado, rasgos definidos",
            caucasian_woman: "Mujer caucásica, cabello rubio, piel clara, ojos azules/verdes, complexión atlética, 1.70m de altura, estilo profesional, rasgos equilibrados",
            asian_man: "Hombre asiático, cabello negro corto moderno, piel clara, ojos oscuros, complexión delgada atlética, 1.75m de altura, estilo urbano contemporáneo, mandíbula definida",
            latino_man: "Hombre latino, cabello negro o castaño corto, piel morena, ojos oscuros, complexión musculosa, 1.78m de altura, estilo casual deportivo, rasgos masculinos marcados",
            caucasian_man: "Hombre caucásico, cabello castaño o rubio corto, piel clara, ojos claros, complexión atlética, 1.80m de altura, estilo formal ejecutivo, rasgos angulosos"
          };
          newDraft.physicalAppearance = appearanceMap[valueToUse] || valueToUse;
          console.log('[Constructor] Guardando physicalAppearance:', newDraft.physicalAppearance);
        }
        break;

      // BEHAVIOR SYSTEM CONFIGURATION
      case "nsfwMode":
        // valueToUse puede ser "yes" o "no" de las opciones, o texto libre
        newDraft.nsfwMode = valueToUse === "yes" || valueToUse.toLowerCase().includes("sí") || valueToUse.toLowerCase().includes("si");
        console.log('[Constructor] Guardando nsfwMode:', newDraft.nsfwMode);
        break;

      case "allowDevelopTraumas":
        newDraft.allowDevelopTraumas = valueToUse === "yes" || valueToUse.toLowerCase().includes("sí") || valueToUse.toLowerCase().includes("si");
        console.log('[Constructor] Guardando allowDevelopTraumas:', newDraft.allowDevelopTraumas);
        break;

      case "initialBehavior":
        // Si valueToUse es uno de los valores directos de las opciones, usarlo
        if (["none", "ANXIOUS_ATTACHMENT", "AVOIDANT_ATTACHMENT", "CODEPENDENCY", "YANDERE_OBSESSIVE", "BORDERLINE_PD", "random_secret"].includes(valueToUse)) {
          newDraft.initialBehavior = valueToUse;
        } else {
          // Fallback para compatibilidad con texto libre
          const behaviorLower = valueToUse.toLowerCase();
          if (behaviorLower.includes("ninguno") || behaviorLower.includes("none")) {
            newDraft.initialBehavior = "none";
          } else if (behaviorLower.includes("ansioso") || behaviorLower.includes("anxious")) {
            newDraft.initialBehavior = "ANXIOUS_ATTACHMENT";
          } else if (behaviorLower.includes("evitativo") || behaviorLower.includes("avoidant")) {
            newDraft.initialBehavior = "AVOIDANT_ATTACHMENT";
          } else if (behaviorLower.includes("codependen")) {
            newDraft.initialBehavior = "CODEPENDENCY";
          } else if (behaviorLower.includes("yandere")) {
            newDraft.initialBehavior = "YANDERE_OBSESSIVE";
          } else if (behaviorLower.includes("borderline") || behaviorLower.includes("límite")) {
            newDraft.initialBehavior = "BORDERLINE_PD";
          } else if (behaviorLower.includes("aleatorio") || behaviorLower.includes("secreto") || behaviorLower.includes("random")) {
            newDraft.initialBehavior = "random_secret";
          } else {
            newDraft.initialBehavior = "none";
          }
        }
        console.log('[Constructor] Guardando initialBehavior:', newDraft.initialBehavior);
        break;
    }

    setDraft(newDraft);
    console.log('[Constructor] Draft actualizado:', newDraft);

    setInput("");

    // Respuesta del arquitecto
    setTimeout(() => {
      // Si seleccionaron "custom" para physicalAppearance, pedir descripción
      if (currentStep.field === "physicalAppearance" && valueToUse === "custom") {
        setWaitingForCustomDescription(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "architect",
            content: t('steps.physicalAppearance.customPrompt', { name: newDraft.name || '' })
          }
        ]);
        // NO avanzar el step, quedarse esperando la descripción del usuario
        return;
      }

      // Si acabamos de recibir la descripción personalizada, desactivar el flag y continuar
      if (waitingForCustomDescription && currentStep.field === "physicalAppearance") {
        setWaitingForCustomDescription(false);
      }

      // Avanzar al siguiente step
      const nextStepIndex = step + 1;
      console.log('[Constructor] Avanzando a step:', nextStepIndex, 'de', steps.length);

      if (nextStepIndex < steps.length) {
        // Hay más preguntas
        const nextStep = steps[nextStepIndex];
        const promptText = typeof nextStep.prompt === "function"
          ? nextStep.prompt(newDraft)
          : nextStep.prompt;

        console.log('[Constructor] Mostrando pregunta:', promptText);
        setMessages((prev) => [
          ...prev,
          { role: "architect", content: promptText },
        ]);
        setStep(nextStepIndex);
      } else {
        // Ya se respondieron todas las preguntas - crear el agente
        console.log('[Constructor] ¡Todas las preguntas respondidas! Creando agente con:', newDraft);
        setMessages((prev) => [
          ...prev,
          { role: "architect", content: t('completion.compiling') },
        ]);
        createAgent(newDraft);
      }
    }, 800);
  };

  /**
   * Manejador para cuando se selecciona una opción mediante botón
   */
  const handleOptionSelected = (value: string) => {
    // Pasar el valor directamente a handleSend sin esperar async state update
    handleSend(value);
    // Limpiar input para evitar confusión visual
    setInput("");
  };

  /**
   * Manejador para cuando se selecciona una imagen (avatar o referencia)
   */
  const handleImageSelected = (imageUrl: string) => {
    const currentStep = steps[step];
    const field = currentStep.field as 'avatar' | 'referenceImage';

    const newDraft = { ...draft, [field]: imageUrl };
    setDraft(newDraft);

    const message = field === 'avatar'
      ? t('steps.avatar.selected')
      : t('steps.referenceImage.selected');

    setMessages((prev) => [
      ...prev,
      { role: "user", content: message },
    ]);

    // Avanzar al siguiente step
    const nextStepIndex = step + 1;
    setTimeout(() => {
      if (nextStepIndex < steps.length) {
        const nextStep = steps[nextStepIndex];
        const promptText = typeof nextStep.prompt === "function"
          ? nextStep.prompt(newDraft)
          : nextStep.prompt;

        setMessages((prev) => [
          ...prev,
          { role: "architect", content: promptText },
        ]);
        setStep(nextStepIndex);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "architect", content: t('completion.compiling') },
        ]);
        createAgent(newDraft);
      }
    }, 500);
  };

  /**
   * Manejador para cuando se omite una imagen (avatar o referencia)
   */
  const handleImageSkipped = () => {
    const currentStep = steps[step];
    const field = currentStep.field as 'avatar' | 'referenceImage';

    const message = field === 'avatar'
      ? t('steps.avatar.skipped')
      : t('steps.referenceImage.skipped');

    setMessages((prev) => [
      ...prev,
      { role: "user", content: message },
    ]);

    // Avanzar al siguiente step sin imagen
    const nextStepIndex = step + 1;
    setTimeout(() => {
      if (nextStepIndex < steps.length) {
        const nextStep = steps[nextStepIndex];
        const promptText = typeof nextStep.prompt === "function"
          ? nextStep.prompt(draft)
          : nextStep.prompt;

        setMessages((prev) => [
          ...prev,
          { role: "architect", content: promptText },
        ]);
        setStep(nextStepIndex);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "architect", content: t('completion.compiling') },
        ]);
        createAgent(draft);
      }
    }, 500);
  };

  // El proceso está completo cuando el agente fue creado exitosamente
  const isComplete = !!newAgentId;

  // State para mostrar/ocultar preview en mobile
  const [showPreview, setShowPreview] = useState(false);

  // Handler para toggle preview con haptic feedback
  const togglePreview = () => {
    light(); // Haptic feedback al abrir/cerrar preview
    setShowPreview(!showPreview);
  };

  // PHASE 5: Handle upgrade - redirect to checkout
  const handleUpgrade = async (planId: "plus" | "ultra") => {
    try {
      const response = await fetch("/api/billing/checkout-unified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          interval: "monthly",
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to checkout page
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error initiating upgrade:", error);
      alert("Error al procesar la actualización. Por favor intenta de nuevo.");
    }
  };

  return (
    <ErrorBoundary variant="page">
    <div className="h-screen flex overflow-hidden">
      {/* Backdrop para preview en mobile */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={togglePreview}
            className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Preview - RESPONSIVE */}
      <div className={cn(
        "w-96 border-r border-border bg-card/30 p-6 space-y-6 overflow-y-auto",
        // Mobile: Oculto por defecto, se muestra como overlay
        "hidden lg:block",
        // En mobile, mostrar como overlay cuando showPreview=true
        showPreview && "fixed inset-0 z-50 w-full lg:relative lg:w-96 lg:z-auto"
      )}>
        <div className="flex items-center gap-2 mb-8">
          {/* Botón cerrar preview en mobile */}
          {showPreview && (
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePreview}
              className="lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          <Link href="/dashboard">
            <Button variant="ghost" size="icon" disabled={creating} className="hidden lg:flex">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-xl font-bold">{t('header.title')}</h2>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar
                data-tour="agent-avatar"
                className="h-20 w-20 border-2"
                style={{ background: draft.name ? generateGradient(draft.name) : "linear-gradient(135deg, #94a3b8, #64748b)" }}
              >
                <AvatarFallback className="text-white text-2xl font-bold bg-transparent">
                  {draft.name ? getInitials(draft.name) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle data-tour="agent-name-input" className="mb-2">
                  {draft.name || t('preview.unnamed')}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {t('preview.badge')}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {draft.personality && (
              <div data-tour="agent-personality">
                <div className="text-xs font-semibold text-muted-foreground mb-1">
                  {t('preview.personality')}
                </div>
                <div className="text-sm">{draft.personality}</div>
              </div>
            )}

            {draft.purpose && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">
                  {t('preview.purpose')}
                </div>
                <div className="text-sm">{draft.purpose}</div>
              </div>
            )}

            {!draft.name && (
              <CardDescription className="text-center py-8">
                {t('preview.emptyDescription')}
              </CardDescription>
            )}
          </CardContent>
        </Card>

        {creating && (
          <LoadingIndicator
            variant="inline"
            message={t('creating.title')}
            submessage={`${t('creating.steps.profile')} • ${t('creating.steps.personality')} • ${t('creating.steps.voice')}`}
          />
        )}

        {isComplete && newAgentId && (
          <div className="space-y-2">
            <Button className="w-full" onClick={() => router.push(`/agentes/${newAgentId}`)}>
              <Sparkles className="h-4 w-4 mr-2" />
              {t('completion.openChat', { name: draft.name || '' })}
            </Button>
            <Link href="/dashboard" className="block">
              <Button variant="outline" className="w-full">
                {t('completion.goToDashboard')}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Chat Area - LAYOUT TIPO WHATSAPP */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header - FIXED */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm px-8 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{t('architect.name')}</h1>
              <p className="text-sm text-muted-foreground">
                {t('architect.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6" id="messages-container">
          <AnimatePresence>
            {messages.map((message, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className={message.role === "architect" ? "border-2 border-primary" : ""}>
                  <AvatarFallback
                    className={
                      message.role === "architect"
                        ? "bg-gradient-to-br from-primary to-secondary text-white"
                        : "bg-muted"
                    }
                  >
                    {message.role === "architect" ? <Sparkles className="h-5 w-5" /> : "U"}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`flex-1 max-w-2xl ${
                    message.role === "user" ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`inline-block rounded-2xl px-6 py-3 ${
                      message.role === "architect"
                        ? "bg-card border border-border"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {message.role === "architect" ? (
                      <ReactMarkdown
                        components={{
                          // Personalizar estilos de elementos markdown
                          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                          ul: ({ children }) => <ul className="space-y-1.5 my-3">{children}</ul>,
                          li: ({ children }) => <li className="flex items-start gap-2 text-sm"><span className="mt-1.5 text-primary">•</span><span className="flex-1">{children}</span></li>,
                          em: ({ children }) => <em className="text-muted-foreground text-xs block mt-2">{children}</em>,
                          h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-base font-bold mb-2">{children}</h3>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {/* Invisible div para auto-scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - FIXED AT BOTTOM */}
        {!isComplete ? (
          <div className="border-t border-border bg-card/50 backdrop-blur-sm p-6 shrink-0">
            <div className="max-w-4xl mx-auto">
              {/* Botón flotante para abrir preview en mobile */}
              {!showPreview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePreview}
                  className="lg:hidden mb-3 w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('preview.showPreview', { defaultValue: 'Ver Preview' })}
                </Button>
              )}

              {/* Si estamos mostrando búsqueda de personaje */}
              {showCharacterSearch ? (
                <div data-tour="character-search-selector">
                  <CharacterSearchSelector
                    characterName={draft.name || ''}
                    results={characterSearchResults}
                    isLoading={isSearchingCharacter}
                    onSelect={handleCharacterSelect}
                    onCustomUrl={handleCustomUrl}
                    onManualDescription={handleManualDescription}
                    disabled={creating || isSearchingCharacter}
                  />
                </div>
              ) : step < steps.length && (steps[step] as any).isVisualStep ? (
                steps[step].field === 'avatar' ? (
                  <AvatarImageSelector
                    agentName={draft.name || "tu IA"}
                    personality={draft.personality || ""}
                    physicalAppearance={draft.physicalAppearance}
                    onImageSelected={handleImageSelected}
                    onSkip={handleImageSkipped}
                  />
                ) : (
                  <ReferenceImageSelector
                    agentName={draft.name || "tu IA"}
                    personality={draft.personality || ""}
                    physicalAppearance={draft.physicalAppearance}
                    onImageSelected={handleImageSelected}
                    onSkip={handleImageSkipped}
                  />
                )
              ) : waitingForCustomDescription ? (
                /* Si estamos esperando descripción personalizada, mostrar input de texto */
                <div className="flex gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !creating && handleSend()}
                    placeholder={t('steps.physicalAppearance.placeholder')}
                    className="flex-1"
                    disabled={creating}
                    autoFocus
                  />
                  <Button onClick={() => handleSend()} size="icon" className="shrink-0" disabled={creating}>
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              ) : step < steps.length && (steps[step] as any).hasOptions ? (
                /* Si el paso tiene opciones, mostrar botones */
                <OptionSelector
                  options={(steps[step] as any).options || []}
                  onSelect={handleOptionSelected}
                  disabled={creating}
                />
              ) : (
                /* Input de texto normal para otros pasos */
                <div className="space-y-2">
                  {/* Back button to return to character search */}
                  {canGoBackToSearch && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGoBackToSearch}
                      className="w-full"
                      data-tour="back-to-search-button"
                    >
                      ← Volver a opciones de búsqueda
                    </Button>
                  )}
                  <div className="flex gap-3">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !creating && handleSend()}
                      placeholder={t('input.placeholder')}
                      className="flex-1"
                      disabled={creating}
                      data-tour="agent-input"
                    />
                    <Button onClick={() => handleSend()} size="icon" className="shrink-0" disabled={creating} data-tour="agent-submit">
                      {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Mensaje de finalización cuando el agente fue creado */
          <div className="border-t border-border bg-gradient-to-r from-primary/10 to-purple-500/10 backdrop-blur-sm p-6 shrink-0">
            <div className="max-w-4xl mx-auto text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <p className="font-semibold">{t('completion.completed')}</p>
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t('completion.completedDescription')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Success Celebration Modal */}
      <SuccessCelebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        title={t('celebration.title')}
        message={t('celebration.message', { name: draft.name || '' })}
        agentName={draft.name}
        agentAvatar={draft.avatar}
        primaryAction={{
          label: t('celebration.startChatting'),
          onClick: () => newAgentId && router.push(`/agentes/${newAgentId}`),
        }}
        secondaryAction={{
          label: t('celebration.viewDashboard'),
          onClick: () => router.push('/dashboard'),
        }}
        type="agent-created"
      />

      {/* PHASE 5: Upgrade Modal for when user hits agent limit */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        currentPlan={(session?.user as any)?.plan || "free"}
        onUpgrade={handleUpgrade}
        context={upgradeContext}
      />
    </div>
    </ErrorBoundary>
  );
}
