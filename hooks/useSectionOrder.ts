"use client";

import { useState, useCallback, useEffect } from "react";
import {
  SectionOrderManager,
  type SectionId,
} from "@/lib/dashboard/section-order-manager";

interface UseSectionOrderReturn {
  sectionOrder: SectionId[];
  trackSectionView: (sectionId: SectionId) => void;
  trackSectionExpansion: (sectionId: SectionId) => void;
  trackSectionClick: (sectionId: SectionId) => void;
  resetOrder: () => void;
}

/**
 * Hook para manejar el orden dinámico de secciones del dashboard
 */
export function useSectionOrder(userId?: string): UseSectionOrderReturn {
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(() => {
    if (!userId) return SectionOrderManager.getDefaultOrder();
    return SectionOrderManager.getOptimalOrder(userId);
  });

  // Recalcular orden cuando cambia el userId
  useEffect(() => {
    if (userId) {
      const newOrder = SectionOrderManager.getOptimalOrder(userId);
      setSectionOrder(newOrder);
    } else {
      setSectionOrder(SectionOrderManager.getDefaultOrder());
    }
  }, [userId]);

  /**
   * Trackear cuando el usuario ve una sección (entra en viewport)
   */
  const trackSectionView = useCallback(
    (sectionId: SectionId) => {
      if (!userId) return;
      SectionOrderManager.trackInteraction(userId, sectionId, "view");
    },
    [userId]
  );

  /**
   * Trackear cuando el usuario expande una sección colapsable
   */
  const trackSectionExpansion = useCallback(
    (sectionId: SectionId) => {
      if (!userId) return;
      SectionOrderManager.trackInteraction(userId, sectionId, "expansion");
    },
    [userId]
  );

  /**
   * Trackear cuando el usuario clickea un agente de la sección
   */
  const trackSectionClick = useCallback(
    (sectionId: SectionId) => {
      if (!userId) return;
      SectionOrderManager.trackInteraction(userId, sectionId, "click");

      // Recalcular orden después de cada click (las interacciones más frecuentes)
      const newOrder = SectionOrderManager.getOptimalOrder(userId);
      setSectionOrder(newOrder);
    },
    [userId]
  );

  /**
   * Resetear orden a valores por defecto
   */
  const resetOrder = useCallback(() => {
    if (!userId) return;
    SectionOrderManager.resetStats(userId);
    setSectionOrder(SectionOrderManager.getDefaultOrder());
  }, [userId]);

  return {
    sectionOrder,
    trackSectionView,
    trackSectionExpansion,
    trackSectionClick,
    resetOrder,
  };
}
