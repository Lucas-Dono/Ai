import { useEffect, useRef } from 'react';
import { useBondProgress } from './useBondProgress';
import type { BondMilestone } from '@/components/bonds/BondMilestoneNotification';

interface BondMilestoneDetectorOptions {
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  onMilestone: (milestone: BondMilestone) => void;
  enabled?: boolean;
}

/**
 * Hook que detecta milestones en el bond progress comparando valores anteriores
 * con nuevos valores. Dispara callback cuando detecta un milestone.
 */
export function useBondMilestoneDetector({
  agentId,
  agentName,
  agentAvatar,
  onMilestone,
  enabled = true,
}: BondMilestoneDetectorOptions) {
  const { bondProgress } = useBondProgress(agentId);

  // Refs para almacenar valores anteriores
  const prevTierRef = useRef<string | null>(null);
  const prevAffinityRef = useRef<number>(0);
  const prevDaysRef = useRef<number>(0);
  const prevInteractionsRef = useRef<number>(0);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !bondProgress || !bondProgress.hasBond) {
      return;
    }

    // Skip first render - just initialize refs
    if (!hasInitializedRef.current) {
      prevTierRef.current = bondProgress.currentTier;
      prevAffinityRef.current = bondProgress.currentAffinityLevel;
      prevDaysRef.current = bondProgress.durationDays;
      prevInteractionsRef.current = bondProgress.totalInteractions;
      hasInitializedRef.current = true;
      return;
    }

    // Detect tier upgrade
    if (
      bondProgress.currentTier &&
      prevTierRef.current &&
      bondProgress.currentTier !== prevTierRef.current
    ) {
      onMilestone({
        type: 'tier_upgrade',
        tier: bondProgress.currentTier,
        oldTier: prevTierRef.current,
        agentName,
        agentAvatar,
        rarityTier: bondProgress.rarityTier || undefined,
      });
    }

    // Detect affinity milestones (50, 75, 90, 100)
    const affinityMilestones = [25, 50, 75, 90, 100];
    for (const milestone of affinityMilestones) {
      if (
        bondProgress.currentAffinityLevel >= milestone &&
        prevAffinityRef.current < milestone
      ) {
        onMilestone({
          type: 'affinity_milestone',
          affinityLevel: milestone,
          agentName,
          agentAvatar,
        });
        break; // Only one affinity milestone per update
      }
    }

    // Detect time milestones (7, 30, 100, 365 days)
    const timeMilestones = [7, 30, 100, 365];
    for (const milestone of timeMilestones) {
      if (
        bondProgress.durationDays >= milestone &&
        prevDaysRef.current < milestone
      ) {
        onMilestone({
          type: 'time_milestone',
          durationDays: milestone,
          agentName,
          agentAvatar,
        });
        break; // Only one time milestone per update
      }
    }

    // Detect interaction milestones (50, 100, 500, 1000)
    const interactionMilestones = [50, 100, 500, 1000, 5000];
    for (const milestone of interactionMilestones) {
      if (
        bondProgress.totalInteractions >= milestone &&
        prevInteractionsRef.current < milestone
      ) {
        onMilestone({
          type: 'interaction_milestone',
          totalInteractions: milestone,
          agentName,
          agentAvatar,
        });
        break; // Only one interaction milestone per update
      }
    }

    // Update refs for next comparison
    prevTierRef.current = bondProgress.currentTier;
    prevAffinityRef.current = bondProgress.currentAffinityLevel;
    prevDaysRef.current = bondProgress.durationDays;
    prevInteractionsRef.current = bondProgress.totalInteractions;
  }, [
    bondProgress,
    enabled,
    agentName,
    agentAvatar,
    onMilestone,
  ]);
}
