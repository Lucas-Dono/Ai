'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { locales } from '@/i18n/config';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * LanguageSwitcher Component
 *
 * Componente para cambiar entre idiomas soportados.
 * Usa el locale actual y navega a la misma ruta con el nuevo locale.
 *
 * @example
 * ```tsx
 * import LanguageSwitcher from '@/components/LanguageSwitcher';
 *
 * export default function Header() {
 *   return (
 *     <header>
 *       <LanguageSwitcher />
 *     </header>
 *   );
 * }
 * ```
 */
export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLocale: string) => {
    // Navega a la misma ruta pero con el nuevo locale
    router.replace(pathname, { locale: newLocale });
  };

  const localeNames: Record<string, string> = {
    es: 'Español',
    en: 'English',
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={locale} onValueChange={changeLanguage}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Idioma" />
        </SelectTrigger>
        <SelectContent>
          {locales.map((loc) => (
            <SelectItem key={loc} value={loc}>
              {localeNames[loc]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Versión Simple del LanguageSwitcher (sin UI components)
 *
 * Si prefieres no usar los componentes de UI, puedes usar esta versión simple:
 */
export function SimpleLanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <select
      value={locale}
      onChange={(e) => changeLanguage(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="es">🇪🇸 Español</option>
      <option value="en">🇬🇧 English</option>
    </select>
  );
}

/**
 * Versión con Botones Toggle
 *
 * Selector de idioma con botones en lugar de dropdown
 */
export function ToggleLanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => changeLanguage(loc)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            locale === loc
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
