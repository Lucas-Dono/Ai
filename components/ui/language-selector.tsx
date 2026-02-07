"use client";

/**
 * Componente para seleccionar el idioma de la aplicación
 *
 * Muestra un dropdown/botón para cambiar entre español e inglés.
 * Sincroniza la preferencia en cookie y redirige a la ruta con el nuevo locale.
 */

import { Globe } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const languages = {
  es: { name: 'Español', flag: '🇪🇸' },
  en: { name: 'English', flag: '🇺🇸' },
} as const;

interface LanguageSelectorProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export function LanguageSelector({
  variant = 'ghost',
  size = 'default',
  showLabel = true,
}: LanguageSelectorProps) {
  const { locale, changeLocale } = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Globe className="h-4 w-4" />
          {showLabel && (
            <span className="ml-2">
              {languages[locale].flag} {languages[locale].name}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => changeLocale('es')}
          disabled={locale === 'es'}
        >
          <span className="mr-2">{languages.es.flag}</span>
          {languages.es.name}
          {locale === 'es' && (
            <span className="ml-2 text-xs text-muted-foreground">(actual)</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLocale('en')}
          disabled={locale === 'en'}
        >
          <span className="mr-2">{languages.en.flag}</span>
          {languages.en.name}
          {locale === 'en' && (
            <span className="ml-2 text-xs text-muted-foreground">(current)</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
