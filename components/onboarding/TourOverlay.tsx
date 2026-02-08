"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TourCard } from "./TourCard";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useOnboardingTours, getTourById } from "@/lib/onboarding/tours";
import { OnboardingStep } from "@/lib/onboarding/types";

export function TourOverlay() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { markStepCompleted, markTourCompleted } = useOnboarding();

  const [currentStep, setCurrentStep] = useState(0);
  const [targetElements, setTargetElements] = useState<HTMLElement[]>([]);
  const [cardPosition, setCardPosition] = useState<any>({});
  const [targetRects, setTargetRects] = useState<DOMRect[]>([]);
  const [isInteractive, setIsInteractive] = useState(false);
  const scrollCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get translated tours
  const onboardingTours = useOnboardingTours();

  // Get tour from URL query params
  const tourId = searchParams.get('tour');
  const currentTour = tourId ? getTourById(onboardingTours, tourId) : null;
  const currentStepData: OnboardingStep | undefined = currentTour?.steps[currentStep];

  // Reset step when tour ID changes (use ref to track previous tourId)
  const prevTourIdRef = useRef<string | null>(null);
  useEffect(() => {
    // Only reset if tourId actually changed (not just re-render)
    if (tourId !== prevTourIdRef.current) {
      prevTourIdRef.current = tourId;
      if (tourId) {
        setCurrentStep(0);
      }
    }
  }, [tourId]);

  // Log when tour state changes (only log, don't include mutable objects in deps)
  useEffect(() => {
    console.log('🎨 [OVERLAY] Tour state changed:', {
      hasTour: !!currentTour,
      tourId: tourId,
      currentStep: currentStep,
      hasStepData: !!currentStepData,
      target: currentStepData?.target,
      targets: currentStepData?.targets,
      pathname
    });
  }, [tourId, currentStep, pathname]);

  // Función para verificar si un elemento está completamente visible en el viewport
  const isElementFullyVisible = useCallback((element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    // Considerar un margen para asegurar que el elemento esté cómodamente visible
    const margin = 100;

    return (
      rect.top >= margin &&
      rect.left >= margin &&
      rect.bottom <= windowHeight - margin &&
      rect.right <= windowWidth - margin
    );
  }, []);

  // Función para hacer scroll hacia el elemento target
  const scrollToTarget = useCallback((element: HTMLElement, position?: string) => {
    // Usar scrollIntoView que es más confiable
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
  }, []);

  // Función para calcular posición - no usar useCallback para evitar loops
  const calculatePosition = (element: HTMLElement | null, stepPosition?: string) => {
    if (!element) {
      // Center the card if no target
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const rect = element.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;
    const cardWidth = isMobile ? window.innerWidth - 32 : 400;
    const cardHeight = 320; // Increased to account for content
    const spacing = isMobile ? 12 : 20;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let position: any = {};

    switch (stepPosition) {
      case "top":
        // Para position="top", posicionar el cartel en la parte superior fija de la pantalla
        // independientemente de dónde esté el elemento target
        // Esto evita que se posicione abajo cuando el elemento está muy arriba

        // Calcular posición izquierda relativa al ancho de pantalla
        // Usar aproximadamente el 15% del ancho de la ventana como offset
        // pero con límites mínimos y máximos para mantener buena UX
        const leftOffset = Math.max(spacing, Math.min(
          viewportWidth * 0.15, // 15% del ancho de pantalla
          300 // Máximo 300px para pantallas muy grandes
        ));

        position = {
          top: spacing * 2, // Posición fija arriba de la pantalla
          left: leftOffset,
        };
        break;
      case "bottom":
        // Intentar posicionar abajo del elemento
        const topPosBelow = rect.bottom + spacing;

        if (topPosBelow + cardHeight > viewportHeight - spacing) {
          // No hay espacio abajo, posicionar arriba
          position = {
            top: Math.max(spacing, rect.top - cardHeight - spacing),
            left: Math.max(spacing, Math.min(
              rect.left + rect.width / 2 - cardWidth / 2,
              viewportWidth - cardWidth - spacing
            )),
          };
        } else {
          // Hay espacio abajo
          position = {
            top: topPosBelow,
            left: Math.max(spacing, Math.min(
              rect.left + rect.width / 2 - cardWidth / 2,
              viewportWidth - cardWidth - spacing
            )),
          };
        }
        break;
      case "left":
        // Calculate left position
        const leftPos = rect.left - cardWidth - spacing;

        if (leftPos < spacing) {
          // Not enough space on left, try right
          position = {
            top: Math.max(spacing, Math.min(
              rect.top + rect.height / 2 - cardHeight / 2,
              viewportHeight - cardHeight - spacing
            )),
            left: rect.right + spacing,
          };
        } else {
          position = {
            top: Math.max(spacing, Math.min(
              rect.top + rect.height / 2 - cardHeight / 2,
              viewportHeight - cardHeight - spacing
            )),
            left: leftPos,
          };
        }
        break;
      case "right":
        // Calculate right position
        const rightPos = rect.right + spacing;

        if (rightPos + cardWidth > viewportWidth - spacing) {
          // Not enough space on right, try left
          position = {
            top: Math.max(spacing, Math.min(
              rect.top + rect.height / 2 - cardHeight / 2,
              viewportHeight - cardHeight - spacing
            )),
            left: rect.left - cardWidth - spacing,
          };
        } else {
          position = {
            top: Math.max(spacing, Math.min(
              rect.top + rect.height / 2 - cardHeight / 2,
              viewportHeight - cardHeight - spacing
            )),
            left: rightPos,
          };
        }
        break;
      default:
        position = {
          top: rect.bottom + spacing,
          left: Math.max(spacing, Math.min(
            rect.left + rect.width / 2 - cardWidth / 2,
            viewportWidth - cardWidth - spacing
          )),
        };
    }

    // Final safety check - ensure card is fully visible
    if (position.left !== undefined) {
      position.left = Math.max(spacing, Math.min(position.left, viewportWidth - cardWidth - spacing));
    }
    if (position.top !== undefined) {
      position.top = Math.max(spacing, Math.min(position.top, viewportHeight - cardHeight - spacing));
    }

    return position;
  };

  useEffect(() => {
    console.log('🔍 [OVERLAY] Target element effect triggered');

    if (!currentStepData) {
      console.log('❌ [OVERLAY] No current step data, cleaning up');
      // Limpiar intervalo de scroll check si no hay step activo
      if (scrollCheckIntervalRef.current) {
        clearInterval(scrollCheckIntervalRef.current);
        scrollCheckIntervalRef.current = null;
      }
      return;
    }

    console.log('✅ [OVERLAY] Current step data exists:', currentStepData.id);

    // Capture step properties at the start of the effect to avoid referencing currentStepData in closures
    const stepInteractive = currentStepData.interactive || false;
    const stepPosition = currentStepData.position;
    const targetSelectors = currentStepData.targets || (currentStepData.target ? [currentStepData.target] : []);

    // Set interactive mode
    setIsInteractive(stepInteractive);

    if (targetSelectors.length === 0) {
      console.log('⚪ [OVERLAY] No target elements (centered card)');
      setTargetElements([]);
      setTargetRects([]);
      const centeredPosition = {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
      console.log('🎯 [OVERLAY] Setting centered position:', centeredPosition);
      setCardPosition(centeredPosition);
      return;
    }

    console.log('🎯 [OVERLAY] Looking for targets:', targetSelectors);

    // Find all target elements
    const elements: HTMLElement[] = [];
    for (const selector of targetSelectors) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        elements.push(element);
        console.log('✅ [OVERLAY] Target element found:', selector);
      } else {
        console.log('❌ [OVERLAY] Target element NOT found:', selector);
      }
    }

    if (elements.length === 0) {
      console.log('❌ [OVERLAY] No target elements found');
      setTargetElements([]);
      setTargetRects([]);
      setCardPosition({
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
      return;
    }

    console.log('✅ [OVERLAY] Total elements found:', elements.length);

    setTargetElements(elements);
    const rects = elements.map(el => el.getBoundingClientRect());
    setTargetRects(rects);

    // Position card relative to the first element
    const calculatedPosition = calculatePosition(elements[0], stepPosition);
    console.log('🎯 [OVERLAY] Calculated card position:', calculatedPosition);
    setCardPosition(calculatedPosition);

    // Scroll inicial hacia el primer target si no está completamente visible
    // PERO SOLO si no es un input o área que cambia dinámicamente
    const isVisible = isElementFullyVisible(elements[0]);
    console.log('👁️ [OVERLAY] First element visibility:', isVisible);

    const isDynamicTarget = targetSelectors.some(sel =>
      sel.includes('messages-container') ||
      sel.includes('agent-input')
    );

    if (!isVisible && !isDynamicTarget) {
      console.log('📜 [OVERLAY] Scrolling to first target');
      scrollToTarget(elements[0], stepPosition);
    }

    // Enable interactive mode for all target elements
    if (stepInteractive) {
      elements.forEach(element => {
        element.style.pointerEvents = 'auto';
        element.style.zIndex = '10002'; // Above overlay but below tour card
        element.style.position = 'relative';
        element.setAttribute('data-tour-interactive', 'true');
      });
    }

    // Monitorear si el usuario hace scroll y el elemento sale de vista
    const checkVisibility = () => {
      // Solo hacer scroll si el elemento está COMPLETAMENTE fuera de vista
      // No si está parcialmente visible (esto causa el scroll molesto)
      if (elements[0]) {
        const rect = elements[0].getBoundingClientRect();
        const completelyOutOfView =
          rect.bottom < 0 ||
          rect.top > window.innerHeight ||
          rect.right < 0 ||
          rect.left > window.innerWidth;

        if (completelyOutOfView) {
          scrollToTarget(elements[0], stepPosition);
        }
      }

      // Actualizar posición del card y rects
      const updatedRects = elements.map(el => el.getBoundingClientRect());
      setTargetRects(updatedRects);
      setCardPosition(calculatePosition(elements[0], stepPosition));
    };

    // Recalculate position on window resize
    const handleResize = () => {
      const updatedRects = elements.map(el => el.getBoundingClientRect());
      setTargetRects(updatedRects);
      setCardPosition(calculatePosition(elements[0], stepPosition));
    };

    // Verificar visibilidad cada 500ms
    // PERO SOLO si el target NO es el área de mensajes (que cambia constantemente)
    // y NO durante pasos interactivos donde el usuario está escribiendo
    const shouldMonitorScroll = !stepInteractive || !targetSelectors.some(sel =>
      sel.includes('messages-container') ||
      sel.includes('agent-input') ||
      sel.includes('agent-submit')
    );

    if (shouldMonitorScroll) {
      scrollCheckIntervalRef.current = setInterval(checkVisibility, 500);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      // Limpiar intervalo
      if (scrollCheckIntervalRef.current) {
        clearInterval(scrollCheckIntervalRef.current);
        scrollCheckIntervalRef.current = null;
      }

      // Clean up interactive mode
      if (stepInteractive) {
        elements.forEach(element => {
          element.style.pointerEvents = '';
          element.style.zIndex = '';
          element.style.position = '';
          element.removeAttribute('data-tour-interactive');
        });
      }
    };
    // Only depend on currentStep to re-run this effect when the step index changes
    // This prevents the effect from re-running when currentStepData reference changes but content is the same
  }, [currentStep, isElementFullyVisible, scrollToTarget]);

  // Prevenir scroll manual del usuario (pero permitir scroll programático del tour)
  useEffect(() => {
    if (!currentTour) return;

    let allowScroll = false;
    let scrollTimeout: number;

    const handleWheel = (e: WheelEvent) => {
      // Bloquear scroll manual del usuario
      if (!allowScroll) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Bloquear scroll táctil del usuario
      if (!allowScroll) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Permitir scroll temporalmente cuando el tour lo necesita
    const enableScrollTemporarily = () => {
      allowScroll = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        allowScroll = false;
      }, 1000); // Permitir scroll por 1 segundo
    };

    // Interceptar scrollIntoView para permitir scroll del tour
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function(arg?: boolean | ScrollIntoViewOptions) {
      enableScrollTemporarily();
      originalScrollIntoView.call(this, arg);
    };

    // Agregar event listeners con passive: false para poder preventDefault
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchmove', handleTouchMove);
      clearTimeout(scrollTimeout);
      // Restaurar scrollIntoView original
      Element.prototype.scrollIntoView = originalScrollIntoView;
    };
  }, [currentTour]);

  // Navigation handlers - simplified to avoid circular dependencies
  const handleNext = () => {
    if (!currentTour || !tourId) return;

    const nextStepIndex = currentStep + 1;

    if (nextStepIndex < currentTour.steps.length) {
      // Move to next step
      setCurrentStep(nextStepIndex);

      // Track step completion
      if (currentStepData?.id) {
        markStepCompleted(currentStepData.id);
      }
    } else {
      // Tour completed
      markTourCompleted(tourId);
      router.push(pathname);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (!tourId) return;

    // Clean up tour-specific localStorage/sessionStorage
    if (tourId === 'community-interaction') {
      localStorage.removeItem('tour_post_created');
      sessionStorage.removeItem('community_tour_active');
      sessionStorage.removeItem('returned_from_create');
    }

    router.push(pathname);
  };

  const handleComplete = () => {
    if (!tourId) return;

    // Clean up tour-specific localStorage/sessionStorage
    if (tourId === 'community-interaction') {
      localStorage.removeItem('tour_post_created');
      sessionStorage.removeItem('community_tour_active');
      sessionStorage.removeItem('returned_from_create');
    }

    markTourCompleted(tourId);
    router.push(pathname);
  };

  return (
    <AnimatePresence mode="wait">
      {currentTour && currentStepData && (
        <>
          {/* Overlay backdrop - sin blur para mantener visibilidad */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20"
            style={{
              zIndex: 10000,
              // Allow clicks through on interactive elements
              pointerEvents: isInteractive ? 'none' : 'auto'
            }}
            onClick={!isInteractive ? handleSkip : undefined}
          />

          {/* Spotlight on target elements - highlight sutil */}
          {targetElements.length > 0 && targetRects.length > 0 && targetRects.map((rect, index) => (
            <div key={`spotlight-${index}`}>
              {/* Fondo claro detrás del elemento para resaltarlo */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed bg-white/5 rounded-2xl"
                style={{
                  zIndex: 10000,
                  top: rect.top - 8,
                  left: rect.left - 8,
                  width: rect.width + 16,
                  height: rect.height + 16,
                  pointerEvents: 'none',
                }}
              />
              {/* Borde animado */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  boxShadow: [
                    "0 0 0 0 rgba(139, 92, 246, 0.6)",
                    "0 0 0 8px rgba(139, 92, 246, 0)",
                    "0 0 0 0 rgba(139, 92, 246, 0.6)",
                  ]
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                className="fixed border-2 border-purple-500 rounded-2xl pointer-events-none"
                style={{
                  zIndex: 10001,
                  top: rect.top - 4,
                  left: rect.left - 4,
                  width: rect.width + 8,
                  height: rect.height + 8,
                }}
              />
            </div>
          ))}

          {/* Tour card */}
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <TourCard
              step={currentStepData}
              currentStep={currentStep}
              totalSteps={currentTour.steps.length}
              onNext={handleNext}
              onPrev={handlePrev}
              onSkip={handleSkip}
              onComplete={handleComplete}
              position={cardPosition}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
