/**
 * Hooks personalizados para Admin API
 * Usar con SWR para caching y revalidación automática
 */

import useSWR from 'swr';
import { useState } from 'react';

const ADMIN_API_BASE = '/api/congrats-secure';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPE DEFINITIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface DashboardResponse {
  stats: {
    totalUsers: number;
    totalAgents: number;
    totalMessages: number;
    activeUsersToday: number;
    newUsersThisWeek: number;
    revenue?: number;
  };
  trends?: any;
  timeRange?: { start: string; end: string };
}

interface UsersResponse {
  users: Array<{
    id: string;
    email: string;
    name: string | null;
    plan: string;
    verified: boolean;
    adult: boolean;
    createdAt: string;
  }>;
  pagination: Pagination;
}

interface UserResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    plan: string;
    verified: boolean;
    adult: boolean;
    createdAt: string;
    agents?: any[];
    messages?: any[];
  };
}

interface AgentsResponse {
  agents: Array<{
    id: string;
    name: string;
    description: string | null;
    nsfwMode: boolean;
    visibility: string;
    userId: string | null;
    createdAt: string;
  }>;
  pagination: Pagination;
}

interface ReportsResponse {
  reports: Array<{
    id: string;
    type: 'post' | 'comment';
    reason: string;
    description: string | null;
    status: string;
    reviewedAt: string | null;
    reviewedBy: string | null;
    action: string | null;
    createdAt: string;
    content: any;
    reporter: any;
  }>;
  pagination: Pagination;
  stats: {
    totalPosts: number;
    totalComments: number;
    total: number;
  };
}

interface AuditLogsResponse {
  logs: Array<{
    id: string;
    action: string;
    targetType: string | null;
    targetId: string | null;
    details: any;
    createdAt: string;
    adminAccess: any;
  }>;
  pagination: Pagination;
}

interface CertificatesResponse {
  certificates: Array<{
    id: string;
    domain: string;
    expiresAt: string;
    status: string;
    createdAt: string;
  }>;
  stats?: {
    total: number;
    expiringSoon: number;
    expired: number;
  };
}

interface AnalyticsFunnelResponse {
  data: {
    visitors: number;
    signups: number;
    emailVerified: number;
    firstAgent: number;
    firstMessage: number;
    conversionRate: number;
  };
  timeRange: { start: string; end: string };
}

interface AnalyticsLandingResponse {
  data: {
    pageViews: number;
    uniqueVisitors: number;
    demoInteractions: number;
    signupClicks: number;
    bounceRate: number;
  };
  timeRange: { start: string; end: string };
}

interface AnalyticsConversionResponse {
  data: {
    freeToPaid: number;
    plusToUltra: number;
    churnRate: number;
    revenue: number;
    averageRevenuePerUser: number;
  };
  timeRange: { start: string; end: string };
}

/**
 * Obtener headers de desarrollo
 */
function getDevHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  // En desarrollo, agregar email del admin automáticamente
  if (process.env.NODE_ENV === 'development') {
    // Intentar obtener el email desde localStorage o usar un valor por defecto
    const devEmail = typeof window !== 'undefined'
      ? localStorage.getItem('dev-admin-email') || process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL
      : process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL;

    if (devEmail) {
      headers['X-Dev-Admin-Email'] = devEmail;
    }
  }

  return headers;
}

/**
 * Fetcher con manejo de errores
 */
async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: getDevHeaders()
  });

  if (!res.ok) {
    const error: any = new Error('Error en la API');
    error.status = res.status;
    error.info = await res.json();
    throw error;
  }

  return res.json();
}

/**
 * Hook para obtener datos del dashboard
 */
export function useDashboard(days: number = 30) {
  const { data, error, isLoading, mutate } = useSWR<DashboardResponse>(
    `${ADMIN_API_BASE}/dashboard?days=${days}`,
    fetcher
  );

  return {
    dashboard: data,
    isLoading,
    isError: error,
    refresh: mutate
  };
}

/**
 * Hook para listar usuarios
 */
export function useUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  plan?: string;
  verified?: string;
  adult?: string;
}) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) queryParams.set(key, String(value));
  });

  const { data, error, isLoading, mutate } = useSWR<UsersResponse>(
    `${ADMIN_API_BASE}/users?${queryParams.toString()}`,
    fetcher
  );

  return {
    users: data?.users || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    refresh: mutate
  };
}

/**
 * Hook para obtener detalles de un usuario
 */
export function useUser(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<UserResponse>(
    userId ? `${ADMIN_API_BASE}/users/${userId}` : null,
    fetcher
  );

  return {
    user: data?.user,
    isLoading,
    isError: error,
    refresh: mutate
  };
}

/**
 * Hook para listar agentes
 */
export function useAgents(params: {
  page?: number;
  limit?: number;
  search?: string;
  nsfwMode?: string;
  visibility?: string;
  creatorId?: string;
}) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) queryParams.set(key, String(value));
  });

  const { data, error, isLoading, mutate } = useSWR<AgentsResponse>(
    `${ADMIN_API_BASE}/agents?${queryParams.toString()}`,
    fetcher
  );

  return {
    agents: data?.agents || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    refresh: mutate
  };
}

/**
 * Hook para reportes de moderación
 */
export function useReports(params: {
  page?: number;
  limit?: number;
  resolved?: string;
  type?: string;
}) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) queryParams.set(key, String(value));
  });

  const { data, error, isLoading, mutate } = useSWR<ReportsResponse>(
    `${ADMIN_API_BASE}/moderation/reports?${queryParams.toString()}`,
    fetcher
  );

  return {
    reports: data?.reports || [],
    pagination: data?.pagination,
    stats: data?.stats,
    isLoading,
    isError: error,
    refresh: mutate
  };
}

/**
 * Hook para audit logs
 */
export function useAuditLogs(params: {
  page?: number;
  limit?: number;
  action?: string;
  targetType?: string;
  targetId?: string;
  adminAccessId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) queryParams.set(key, String(value));
  });

  const { data, error, isLoading, mutate } = useSWR<AuditLogsResponse>(
    `${ADMIN_API_BASE}/audit-logs?${queryParams.toString()}`,
    fetcher
  );

  return {
    logs: data?.logs || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    refresh: mutate
  };
}

/**
 * Hook para certificados
 */
export function useCertificates(all: boolean = false) {
  const { data, error, isLoading, mutate } = useSWR<CertificatesResponse>(
    `${ADMIN_API_BASE}/certificates${all ? '?all=true' : ''}`,
    fetcher
  );

  return {
    certificates: data?.certificates || [],
    stats: data?.stats,
    isLoading,
    isError: error,
    refresh: mutate
  };
}

/**
 * Hook para analytics - Funnel de conversión
 */
export function useAnalyticsFunnel(days: number = 30) {
  const { data, error, isLoading, mutate } = useSWR<AnalyticsFunnelResponse>(
    `${ADMIN_API_BASE}/analytics/funnel?days=${days}`,
    fetcher
  );

  return {
    funnel: data?.data,
    timeRange: data?.timeRange,
    isLoading,
    isError: error,
    refresh: mutate
  };
}

/**
 * Hook para analytics - Landing page
 */
export function useAnalyticsLanding(days: number = 30) {
  const { data, error, isLoading, mutate } = useSWR<AnalyticsLandingResponse>(
    `${ADMIN_API_BASE}/analytics/landing?days=${days}`,
    fetcher
  );

  return {
    landing: data?.data,
    timeRange: data?.timeRange,
    isLoading,
    isError: error,
    refresh: mutate
  };
}

/**
 * Hook para analytics - Conversión y monetización
 */
export function useAnalyticsConversion(days: number = 30) {
  const { data, error, isLoading, mutate } = useSWR<AnalyticsConversionResponse>(
    `${ADMIN_API_BASE}/analytics/conversion?days=${days}`,
    fetcher
  );

  return {
    conversion: data?.data,
    timeRange: data?.timeRange,
    isLoading,
    isError: error,
    refresh: mutate
  };
}

/**
 * Hook para mutaciones (POST, PATCH, DELETE)
 */
export function useAdminMutation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const mutate = async (
    url: string,
    method: 'POST' | 'PATCH' | 'DELETE',
    body?: any
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${ADMIN_API_BASE}${url}`, {
        method,
        headers: getDevHeaders(),
        body: body ? JSON.stringify(body) : undefined
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error en la operación');
      }

      const data = await res.json();
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}
