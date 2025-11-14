import { Pathnames, LocalePrefix } from 'next-intl/routing';

// Locales soportados
export const locales = ['es', 'en'] as const;

// Tipo para los locales
export type Locale = (typeof locales)[number];

// Locale por defecto
export const defaultLocale: Locale = 'es';

// Configuración de prefijos de locale en URLs
// 'never' = no usar prefijos en URLs (solo cookies)
// Las URLs son las mismas para todos los idiomas
export const localePrefix = 'never' as const;

// Configuración de pathnames (rutas localizadas)
export const pathnames: Pathnames<typeof locales> = {
  '/': '/',
  '/dashboard': {
    es: '/panel',
    en: '/dashboard',
  },
  '/agents': {
    es: '/agentes',
    en: '/agents',
  },
  '/worlds': {
    es: '/mundos',
    en: '/worlds',
  },
  '/community': {
    es: '/comunidad',
    en: '/community',
  },
  '/profile': {
    es: '/perfil',
    en: '/profile',
  },
  '/settings': {
    es: '/configuracion',
    en: '/settings',
  },
};

// Puerto para el servidor de desarrollo
export const port = process.env.PORT || 3000;
export const host = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${port}`;

/**
 * Códigos de países de Latinoamérica y España
 * Usados para determinar si un usuario debe ver español por defecto
 */
export const SPANISH_SPEAKING_COUNTRIES = [
  // Latinoamérica
  'AR', // Argentina
  'BO', // Bolivia
  'CL', // Chile
  'CO', // Colombia
  'CR', // Costa Rica
  'CU', // Cuba
  'DO', // República Dominicana
  'EC', // Ecuador
  'SV', // El Salvador
  'GT', // Guatemala
  'HN', // Honduras
  'MX', // México
  'NI', // Nicaragua
  'PA', // Panamá
  'PY', // Paraguay
  'PE', // Perú
  'PR', // Puerto Rico
  'UY', // Uruguay
  'VE', // Venezuela
  // España
  'ES', // España
] as const;

/**
 * Nombre del cookie donde se guarda la preferencia de idioma
 */
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Duración del cookie de idioma (1 año)
 */
export const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 año en segundos
