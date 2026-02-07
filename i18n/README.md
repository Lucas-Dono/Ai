# Sistema de Internacionalización (i18n)

Este proyecto utiliza **next-intl** para la internacionalización con Next.js 15 App Router.

## Configuración

### Idiomas Soportados
- **Español (es)**: Idioma por defecto
- **Inglés (en)**: Idioma alternativo

### Estructura de Archivos

```
/messages
  ├── es.json    # Traducciones en español
  └── en.json    # Traducciones en inglés

/i18n
  ├── config.ts       # Configuración de locales y rutas
  ├── request.ts      # Configuración de next-intl para App Router
  ├── navigation.ts   # Utilidades de navegación localizadas
  └── README.md       # Esta documentación
```

## Uso

### 1. En Componentes del Servidor (Server Components)

```tsx
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('common');

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button>{t('save')}</button>
    </div>
  );
}
```

### 2. En Componentes del Cliente (Client Components)

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function MyClientComponent() {
  const t = useTranslations('nav');

  return (
    <nav>
      <a href="/">{t('home')}</a>
      <a href="/dashboard">{t('dashboard')}</a>
    </nav>
  );
}
```

### 3. Navegación Localizada

Usa los componentes de navegación de `@/i18n/navigation` en lugar de `next/navigation`:

```tsx
import { Link, useRouter, usePathname } from '@/i18n/navigation';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div>
      {/* Link automáticamente usa el locale actual */}
      <Link href="/dashboard">Dashboard</Link>

      {/* Navegar programáticamente */}
      <button onClick={() => router.push('/agents')}>
        Ver Agentes
      </button>

      {/* Pathname actual sin prefijo de locale */}
      <p>Ruta actual: {pathname}</p>
    </div>
  );
}
```

### 4. Cambiar de Idioma

```tsx
'use client';

import { useRouter, usePathname } from '@/i18n/navigation';
import { locales } from '@/i18n/config';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (locale: string) => {
    router.push(pathname, { locale });
  };

  return (
    <select onChange={(e) => changeLanguage(e.target.value)}>
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {locale.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
```

### 5. Formateo de Fechas y Números

```tsx
import { useTranslations, useFormatter } from 'next-intl';

export default function FormattedContent() {
  const t = useTranslations('common');
  const format = useFormatter();

  const date = new Date();
  const price = 1234.56;

  return (
    <div>
      {/* Formateo de fecha */}
      <p>{format.dateTime(date, 'short')}</p>

      {/* Formateo de número */}
      <p>{format.number(price, { style: 'currency', currency: 'USD' })}</p>

      {/* Formateo de lista */}
      <p>{format.list(['item1', 'item2', 'item3'], { type: 'conjunction' })}</p>
    </div>
  );
}
```

## Agregar Nuevas Traducciones

1. Abre `/messages/es.json` y `/messages/en.json`
2. Agrega tus nuevas claves manteniendo la misma estructura en ambos archivos:

```json
{
  "newSection": {
    "title": "Título en español",
    "description": "Descripción en español"
  }
}
```

3. Usa las traducciones en tu componente:

```tsx
const t = useTranslations('newSection');
return <h1>{t('title')}</h1>;
```

## Rutas Localizadas

Las rutas se pueden localizar usando el objeto `pathnames` en `/i18n/config.ts`:

```typescript
export const pathnames = {
  '/dashboard': {
    es: '/panel',
    en: '/dashboard',
  },
  '/agents': {
    es: '/agentes',
    en: '/agents',
  },
};
```

Esto permite que la misma página se acceda con diferentes URLs según el idioma:
- Español: `/es/panel`
- Inglés: `/dashboard`

## Detección Automática de Idioma

El middleware detecta automáticamente el idioma preferido del usuario en el siguiente orden:

1. **Cookie de preferencia** (si el usuario ya seleccionó un idioma)
2. **Geolocalización por IP** (headers de Vercel/Cloudflare)
3. **Header Accept-Language** del navegador
4. **Idioma por defecto** (español)

## Configuración Adicional

### Zona Horaria

La zona horaria predeterminada es `America/Buenos_Aires`. Puedes cambiarla en `/i18n/request.ts`:

```typescript
timeZone: 'America/Buenos_Aires',
```

### Formatos Personalizados

Los formatos de fecha, número y lista se pueden personalizar en `/i18n/request.ts`:

```typescript
formats: {
  dateTime: {
    short: {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  },
  // ... más formatos
}
```

## Recursos

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
