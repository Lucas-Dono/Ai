/**
 * useTokenUsage Hook
 * Fetches and manages token usage statistics for the current user
 *
 * Features:
 * - Real-time token usage tracking
 * - Message count estimation (user-friendly)
 * - Automatic refresh every 30 seconds
 * - Shows rewarded tokens separately
 * - Tier-aware (free/plus/business)
 */

import useSWR from "swr";

interface TokenLimitInfo {
  used: number;
  limit: number;
  remaining: number;
}

interface TokenInfo {
  input: TokenLimitInfo;
  output: TokenLimitInfo;
  total: TokenLimitInfo;
  rewarded: {
    input: number;
    output: number;
    total: number;
  };
}

interface MessageInfo {
  used: number;
  limit: number;
  remaining: number;
}

export interface TokenUsageStats {
  tokens: TokenInfo;
  messages: MessageInfo;
  tier: string;
}

interface TokenUsageResponse {
  success: boolean;
  data: TokenUsageStats;
}

/**
 * Hook to fetch and manage token usage statistics
 *
 * @param autoRefresh - Enable automatic refresh every 30 seconds (default: true)
 * @returns Token usage stats, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * function UsageDisplay() {
 *   const { data, isLoading, error, refetch } = useTokenUsage();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error loading usage</div>;
 *
 *   return (
 *     <div>
 *       <p>{data.messages.used} / {data.messages.limit} messages used</p>
 *       <p>Tier: {data.tier}</p>
 *       <button onClick={() => refetch()}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTokenUsage(autoRefresh: boolean = true) {
  const { data, error, isLoading, mutate } = useSWR<TokenUsageResponse>(
    "/api/user/token-usage",
    {
      refreshInterval: autoRefresh ? 30 * 1000 : 0, // Refresh every 30 seconds if enabled
      keepPreviousData: true, // Keep showing old data while fetching new
      revalidateOnFocus: true, // Refresh when user returns to tab
      revalidateOnReconnect: true, // Refresh when internet reconnects
    }
  );

  return {
    data: data?.data,
    error,
    isLoading,
    refetch: mutate,
  };
}

/**
 * Helper function to calculate percentage used
 */
export function getUsagePercentage(used: number, limit: number): number {
  if (limit === -1) return 0; // Unlimited
  if (limit === 0) return 100;
  return Math.min(100, Math.round((used / limit) * 100));
}

/**
 * Helper function to get usage status color
 */
export function getUsageStatusColor(percentage: number): string {
  if (percentage >= 90) return "text-red-600 dark:text-red-400";
  if (percentage >= 70) return "text-yellow-600 dark:text-yellow-400";
  return "text-green-600 dark:text-green-400";
}

/**
 * Helper function to format limit display
 */
export function formatLimit(limit: number): string {
  if (limit === -1) return "∞";
  return limit.toLocaleString();
}
