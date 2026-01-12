/**
 * Hooks personalizados para Analytics API
 * Usar con SWR para caching y revalidación automática
 */

import useSWR from 'swr';

const ADMIN_API_BASE = '/api/congrats-secure';

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
 * Hook para obtener datos del funnel de conversión
 */
export function useAnalyticsFunnel(days: number = 30) {
  const { data, error, isLoading, mutate } = useSWR(
    `${ADMIN_API_BASE}/analytics/funnel?days=${days}`,
    fetcher,
    {
      refreshInterval: 300000, // 5 minutos
      revalidateOnFocus: false
    }
  );

  return {
    data,
    isLoading,
    isError: error,
    refresh: mutate
  };
}

/**
 * Hook para obtener analytics de la landing page
 */
export function useAnalyticsLanding(days: number = 30) {
  const { data, error, isLoading, mutate } = useSWR(
    `${ADMIN_API_BASE}/analytics/landing?days=${days}`,
    fetcher,
    {
      refreshInterval: 300000, // 5 minutos
      revalidateOnFocus: false
    }
  );

  return {
    data,
    isLoading,
    isError: error,
    refresh: mutate
  };
}

/**
 * Hook para obtener analytics de conversión y monetización
 */
export function useAnalyticsConversion(days: number = 30) {
  const { data, error, isLoading, mutate } = useSWR(
    `${ADMIN_API_BASE}/analytics/conversion?days=${days}`,
    fetcher,
    {
      refreshInterval: 300000, // 5 minutos
      revalidateOnFocus: false
    }
  );

  return {
    data,
    isLoading,
    isError: error,
    refresh: mutate
  };
}

/**
 * Hook para obtener analytics de un usuario específico
 */
export function useUserAnalytics(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `${ADMIN_API_BASE}/analytics/users/${userId}` : null,
    fetcher,
    {
      refreshInterval: 60000, // 1 minuto
      revalidateOnFocus: true
    }
  );

  return {
    data,
    isLoading,
    isError: error,
    refresh: mutate
  };
}
