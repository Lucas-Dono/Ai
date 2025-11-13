# Guía de Integración con next-intl

Esta guía te ayudará a integrar completamente el sistema de detección de idioma con `next-intl` para manejar traducciones en tu aplicación.

## Paso 1: Configuración de next-intl

### Crear archivo de configuración i18n

Crear `/i18n.ts`:

```typescript
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from './lib/i18n/config';

export default getRequestConfig(async ({ locale }) => {
  // Validar que el locale es soportado
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
```

## Paso 2: Crear Archivos de Traducción

### Estructura de carpetas

```
messages/
├── es.json    # Español
└── en.json    # Inglés
```

### Ejemplo: `messages/es.json`

```json
{
  "common": {
    "welcome": "Bienvenido a Circuit Prompt AI",
    "login": "Iniciar sesión",
    "logout": "Cerrar sesión",
    "loading": "Cargando...",
    "error": "Error",
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar"
  },
  "navigation": {
    "home": "Inicio",
    "dashboard": "Panel",
    "community": "Comunidad",
    "marketplace": "Mercado",
    "profile": "Perfil"
  },
  "dashboard": {
    "title": "Panel de Control",
    "myAgents": "Mis Agentes",
    "createAgent": "Crear Agente",
    "stats": {
      "totalAgents": "Total de Agentes",
      "totalChats": "Total de Conversaciones",
      "totalMessages": "Total de Mensajes"
    }
  },
  "chat": {
    "typeMessage": "Escribe un mensaje...",
    "send": "Enviar",
    "newChat": "Nueva conversación",
    "deleteChat": "Eliminar conversación"
  },
  "errors": {
    "unauthorized": "No autorizado",
    "notFound": "No encontrado",
    "serverError": "Error del servidor",
    "networkError": "Error de conexión"
  }
}
```

### Ejemplo: `messages/en.json`

```json
{
  "common": {
    "welcome": "Welcome to AI Creator",
    "login": "Log in",
    "logout": "Log out",
    "loading": "Loading...",
    "error": "Error",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit"
  },
  "navigation": {
    "home": "Home",
    "dashboard": "Dashboard",
    "community": "Community",
    "marketplace": "Marketplace",
    "profile": "Profile"
  },
  "dashboard": {
    "title": "Dashboard",
    "myAgents": "My Agents",
    "createAgent": "Create Agent",
    "stats": {
      "totalAgents": "Total Agents",
      "totalChats": "Total Chats",
      "totalMessages": "Total Messages"
    }
  },
  "chat": {
    "typeMessage": "Type a message...",
    "send": "Send",
    "newChat": "New chat",
    "deleteChat": "Delete chat"
  },
  "errors": {
    "unauthorized": "Unauthorized",
    "notFound": "Not found",
    "serverError": "Server error",
    "networkError": "Network error"
  }
}
```

## Paso 3: Actualizar next.config.ts

```typescript
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // ... resto de la configuración existente
};

// Aplicar plugins en orden
export default withSentryConfig(
  withNextIntl(nextConfig),
  sentryWebpackPluginOptions
);
```

## Paso 4: Reestructurar Layout con Locale

### Crear `app/[locale]/layout.tsx`

```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n/config';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validar locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Cargar mensajes del locale actual
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// Generar metadata para cada locale
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const titles = {
    es: 'Circuit Prompt AI - IA Personalizada',
    en: 'AI Creator - Personalized AI',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.es,
  };
}

// Pre-generar rutas para cada locale
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

### Mover páginas a `app/[locale]/`

```
app/
├── [locale]/
│   ├── layout.tsx           # Layout con traducciones
│   ├── page.tsx             # Home
│   ├── dashboard/
│   │   └── page.tsx
│   ├── community/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   └── ...
├── api/                     # API sin prefijo de locale
│   └── ...
└── layout.tsx               # Root layout (sin next-intl)
```

## Paso 5: Usar Traducciones en Componentes

### Server Components

```typescript
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('dashboard');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('myAgents')}</p>
      <button>{t('createAgent')}</button>

      <div>
        <h2>{t('stats.totalAgents')}</h2>
        <h2>{t('stats.totalChats')}</h2>
      </div>
    </div>
  );
}
```

### Client Components

```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function ChatInput() {
  const t = useTranslations('chat');

  return (
    <div>
      <input
        type="text"
        placeholder={t('typeMessage')}
      />
      <button>{t('send')}</button>
    </div>
  );
}
```

### Traducciones con Parámetros

```json
// messages/es.json
{
  "greeting": "Hola, {name}!",
  "itemCount": "Tienes {count} {count, plural, one {item} other {items}}"
}
```

```typescript
const t = useTranslations();

t('greeting', { name: 'Juan' }); // "Hola, Juan!"
t('itemCount', { count: 1 }); // "Tienes 1 item"
t('itemCount', { count: 5 }); // "Tienes 5 items"
```

### Traducciones con HTML

```json
{
  "richText": "Visita <link>nuestro blog</link> para más información"
}
```

```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations();

t.rich('richText', {
  link: (chunks) => <a href="/blog">{chunks}</a>
});
```

## Paso 6: Formateo de Fechas y Números

### Fechas

```typescript
import { useFormatter } from 'next-intl';

export default function DateDisplay({ date }: { date: Date }) {
  const format = useFormatter();

  return (
    <div>
      {/* Fecha completa */}
      <p>{format.dateTime(date, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</p>

      {/* Fecha relativa */}
      <p>{format.relativeTime(date)}</p>
      {/* Output: "hace 2 horas" / "2 hours ago" */}
    </div>
  );
}
```

### Números y Moneda

```typescript
import { useFormatter } from 'next-intl';

export default function PriceDisplay({ price }: { price: number }) {
  const format = useFormatter();

  return (
    <div>
      {/* Número */}
      <p>{format.number(price)}</p>
      {/* Output: "1.234,56" (es) / "1,234.56" (en) */}

      {/* Moneda */}
      <p>{format.number(price, {
        style: 'currency',
        currency: 'USD'
      })}</p>
      {/* Output: "USD 1.234,56" (es) / "$1,234.56" (en) */}
    </div>
  );
}
```

## Paso 7: Navegación entre Locales

### Componente Link Traducido

```typescript
import { Link } from '@/navigation';

export default function Navigation() {
  return (
    <nav>
      {/* Link automáticamente prefija el locale actual */}
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/community">Community</Link>

      {/* Cambiar locale manualmente */}
      <Link href="/dashboard" locale="en">English</Link>
      <Link href="/dashboard" locale="es">Español</Link>
    </nav>
  );
}
```

### Crear archivo `/navigation.ts`

```typescript
import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales } from './lib/i18n/config';

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales });
```

## Paso 8: Validación de Formularios con Zod

### Traducciones para errores de Zod

```typescript
import { z } from 'zod';
import { useTranslations } from 'next-intl';

export function useLoginSchema() {
  const t = useTranslations('validation');

  return z.object({
    email: z
      .string()
      .email(t('invalidEmail'))
      .min(1, t('required')),
    password: z
      .string()
      .min(8, t('passwordTooShort'))
      .min(1, t('required')),
  });
}
```

```json
// messages/es.json
{
  "validation": {
    "required": "Este campo es obligatorio",
    "invalidEmail": "Email inválido",
    "passwordTooShort": "La contraseña debe tener al menos 8 caracteres"
  }
}
```

## Paso 9: SEO Multiidioma

### Metadata Dinámica

```typescript
import { getTranslations } from 'next-intl/server';
import { type Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    alternates: {
      languages: {
        'es': '/es',
        'en': '/en',
      },
    },
  };
}
```

### Sitemap Multiidioma

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { locales } from './lib/i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://circuit-prompt-ai.vercel.app';

  const routes = ['', '/dashboard', '/community', '/marketplace'];

  const sitemapEntries = routes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    }))
  );

  return sitemapEntries;
}
```

## Paso 10: Testing

### Test con Traducciones

```typescript
import { NextIntlClientProvider } from 'next-intl';
import { render } from '@testing-library/react';
import messages from '@/messages/es.json';

function renderWithIntl(component: React.ReactElement, locale = 'es') {
  return render(
    <NextIntlClientProvider messages={messages} locale={locale}>
      {component}
    </NextIntlClientProvider>
  );
}

describe('DashboardPage', () => {
  it('renders in Spanish', () => {
    const { getByText } = renderWithIntl(<DashboardPage />);
    expect(getByText('Panel de Control')).toBeInTheDocument();
  });

  it('renders in English', async () => {
    const messagesEn = await import('@/messages/en.json');
    const { getByText } = render(
      <NextIntlClientProvider messages={messagesEn} locale="en">
        <DashboardPage />
      </NextIntlClientProvider>
    );
    expect(getByText('Dashboard')).toBeInTheDocument();
  });
});
```

## Migración Gradual

No necesitas migrar todo de una vez. Puedes empezar por:

### Fase 1: Setup básico
- ✅ Instalar next-intl (ya está)
- ✅ Crear archivos de configuración
- ✅ Crear archivos de mensajes básicos

### Fase 2: Migrar componentes críticos
- 🔄 Navigation
- 🔄 Login/Auth
- 🔄 Dashboard principal

### Fase 3: Migrar resto de la app
- ⏳ Páginas de comunidad
- ⏳ Marketplace
- ⏳ Chat

### Durante la migración

Puedes tener componentes sin traducir:

```typescript
// Componente viejo (sin traducir)
<h1>Bienvenido</h1>

// Componente nuevo (con traducciones)
<h1>{t('welcome')}</h1>
```

## Mejores Prácticas

### 1. Organizar traducciones por namespace

```json
{
  "common": { ... },      // Textos compartidos
  "navigation": { ... },  // Navegación
  "dashboard": { ... },   // Dashboard
  "chat": { ... }         // Chat
}
```

### 2. Usar keys descriptivas

❌ Malo:
```json
{
  "btn1": "Guardar",
  "txt2": "Cancelar"
}
```

✅ Bueno:
```json
{
  "save": "Guardar",
  "cancel": "Cancelar"
}
```

### 3. Mantener sincronizados es.json y en.json

Usa un script para verificar:

```typescript
// scripts/check-translations.ts
import esMessages from '../messages/es.json';
import enMessages from '../messages/en.json';

function getKeys(obj: any, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      return getKeys(value, fullKey);
    }
    return [fullKey];
  });
}

const esKeys = new Set(getKeys(esMessages));
const enKeys = new Set(getKeys(enMessages));

const missingInEn = [...esKeys].filter(key => !enKeys.has(key));
const missingInEs = [...enKeys].filter(key => !esKeys.has(key));

if (missingInEn.length) {
  console.error('Missing in en.json:', missingInEn);
}
if (missingInEs.length) {
  console.error('Missing in es.json:', missingInEs);
}

process.exit(missingInEn.length + missingInEs.length);
```

Agregar a `package.json`:

```json
{
  "scripts": {
    "check-translations": "tsx scripts/check-translations.ts"
  }
}
```

## Recursos Adicionales

- [next-intl Docs](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Lokalise](https://lokalise.com/) - Herramienta para gestionar traducciones
- [i18n Ally](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally) - Extensión VS Code
