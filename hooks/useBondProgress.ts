import { useState, useEffect } from 'react';

export interface BondProgress {
  hasBond: boolean;
  currentTier: string | null;
  currentAffinityLevel: number;
  durationDays: number;
  totalInteractions: number;
  nextTier: {
    tier: string;
    requiredAffinity: number;
    requiredDays: number;
    requiredInteractions: number;
    progress: {
      affinity: number; // 0-100
      days: number; // 0-100
      interactions: number; // 0-100
      overall: number; // 0-100
    };
  } | null;
  status: 'active' | 'warned' | 'dormant' | 'fragile' | null;
  rarityTier: string | null;
}

export function useBondProgress(agentId: string) {
  const [bondProgress, setBondProgress] = useState<BondProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) return;

    const fetchBondProgress = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/bonds/progress/${agentId}`);

        if (!res.ok) {
          if (res.status === 404) {
            // No bond exists yet
            setBondProgress({
              hasBond: false,
              currentTier: null,
              currentAffinityLevel: 0,
              durationDays: 0,
              totalInteractions: 0,
              nextTier: null,
              status: null,
              rarityTier: null,
            });
            return;
          }
          throw new Error('Failed to fetch bond progress');
        }

        const data = await res.json();
        setBondProgress(data);
      } catch (err) {
        console.error('Error fetching bond progress:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchBondProgress();

    // Refresh every minute
    const interval = setInterval(fetchBondProgress, 60000);
    return () => clearInterval(interval);
  }, [agentId]);

  return { bondProgress, loading, error };
}
