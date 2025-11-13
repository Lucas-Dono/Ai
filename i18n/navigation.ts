import { createNavigation } from 'next-intl/navigation';
import { locales, pathnames, localePrefix } from './config';

/**
 * Navigation utilities para Next.js App Router con next-intl
 *
 * Estos hooks y funciones son versiones localizadas de las funciones
 * nativas de Next.js que automáticamente manejan el prefijo de locale.
 *
 * @example
 * ```tsx
 * import { Link, redirect, usePathname, useRouter } from '@/i18n/navigation';
 *
 * // Link automáticamente prefija con el locale actual
 * <Link href="/dashboard">Dashboard</Link>
 * // Renderiza: /es/panel o /dashboard dependiendo del locale
 *
 * // Router con soporte para locales
 * const router = useRouter();
 * router.push('/agents'); // Navega a /es/agentes o /agents
 *
 * // Pathname sin el prefijo de locale
 * const pathname = usePathname(); // Retorna "/dashboard" en lugar de "/es/panel"
 * ```
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation({
    locales,
    pathnames,
    localePrefix,
  });
