"use client";

/**
 * Hook para manejar la configuración de idioma
 *
 * Permite cambiar el idioma del usuario de forma programática
 * y sincroniza la preferencia en cookie y URL.
 */

import { usePathname, useRouter } from 'next/navigation';
import { LOCALE_COOKIE_NAME } from '@/i18n/config';
import type { Locale } from '@/i18n/config';

export function useLocale() {
  const pathname = usePathname();
  const router = useRouter();

  /**
   * Obtiene el locale actual desde la URL
   */
  const getCurrentLocale = (): Locale => {
    const match = pathname.match(/^\/([a-z]{2})(\/|$)/);
    return (match?.[1] as Locale) || 'es';
  };

  /**
   * Cambia el idioma del usuario
   *
   * @param newLocale - Nuevo idioma a establecer
   */
  const changeLocale = (newLocale: Locale) => {
    const currentLocale = getCurrentLocale();

    if (currentLocale === newLocale) {
      return; // Ya está en ese idioma
    }

    // Crear la nueva ruta con el nuevo locale
    const newPathname = pathname.replace(/^\/[a-z]{2}/, `/${newLocale}`);

    // Guardar preferencia en cookie
    document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;

    // Navegar a la nueva ruta
    router.push(newPathname);
  };

  return {
    locale: getCurrentLocale(),
    changeLocale,
  };
}
