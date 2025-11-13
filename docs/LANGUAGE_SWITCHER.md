# Language Switcher Component

## Overview

El componente `LanguageSwitcher` es un selector de idioma profesional y minimalista que permite a los usuarios cambiar entre español e inglés. El componente está totalmente integrado con el sistema de internacionalización (i18n) del proyecto.

## Features

✅ **Dos variantes de diseño**: `default` (completo) y `compact` (compacto)
✅ **Banderas emoji**: 🇪🇸 Español y 🇺🇸 English
✅ **Persistencia**: Guarda preferencia en cookie por 1 año
✅ **Detección automática**: URL > Cookie > Navegador > Default
✅ **Animaciones suaves**: Usando Framer Motion
✅ **Responsive**: Mobile-friendly
✅ **Accesibilidad**: ARIA labels y manejo de teclado
✅ **Click outside**: Cierra automáticamente al hacer click fuera
✅ **Estado de carga**: Muestra feedback visual al cambiar idioma

## Installation & Setup

El componente ya está instalado y configurado en:

```
/components/language-switcher.tsx
```

### Dependencies

- `next-intl` (ya instalado en package.json)
- `framer-motion` (ya instalado)
- `lucide-react` (ya instalado)

### Configuration

La configuración de i18n está en:

```typescript
// /i18n/config.ts

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
export const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 año
```

## Usage Examples

### 1. Variant Compact (Recomendado para Navbars)

```tsx
import { LanguageSwitcher } from "@/components/language-switcher";

export function Navbar() {
  return (
    <nav>
      {/* Otros elementos del nav */}
      <LanguageSwitcher variant="compact" />
    </nav>
  );
}
```

**Características del variant compact:**
- Botón circular con solo la bandera
- Dropdown minimalista
- Ideal para espacios reducidos
- Mobile-friendly

### 2. Variant Default (Recomendado para Footers)

```tsx
import { LanguageSwitcher } from "@/components/language-switcher";

export function Footer() {
  return (
    <footer>
      {/* Otros elementos del footer */}
      <LanguageSwitcher variant="default" />
    </footer>
  );
}
```

**Características del variant default:**
- Botón con icono de globo, bandera y nombre del idioma
- Dropdown más detallado con nombres nativos e inglés
- Footer con información adicional
- Mejor para escritorio

### 3. Custom Styling

```tsx
<LanguageSwitcher
  variant="compact"
  className="custom-class"
/>
```

## Where It's Already Integrated

### ✅ Dashboard Navigation

```typescript
// /components/dashboard-nav.tsx

import { LanguageSwitcher } from "@/components/language-switcher";

export function DashboardNav() {
  return (
    <nav>
      {/* ... */}
      <div className="flex gap-2">
        <NotificationDropdown />
        <OnboardingMenu />
        <LanguageSwitcher variant="compact" />  {/* ← AQUÍ */}
        <ThemeToggle />
      </div>
    </nav>
  );
}
```

**Ubicación**: Sidebar izquierdo del dashboard, en la sección de controles (junto al tema y notificaciones)

### ✅ Landing Page Header

```typescript
// /app/(landing)/layout.tsx

import { LanguageSwitcher } from "@/components/language-switcher";

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <nav>
      {/* ... */}
      <div className="flex items-center gap-3">
        <LanguageSwitcher variant="compact" />  {/* ← AQUÍ */}
        <ThemeToggle />
        {/* Botones de login/register */}
      </div>
    </nav>
  );
}
```

**Ubicación**: Header de la landing page, junto al toggle de tema

### ✅ Landing Page Footer

```typescript
// /app/(landing)/layout.tsx

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <footer>
      {/* ... */}
      <div className="flex items-center gap-2">
        <LanguageSwitcher variant="compact" />  {/* ← AQUÍ */}
        <ThemeToggle />
      </div>
    </footer>
  );
}
```

**Ubicación**: Footer de la landing page, en la sección de redes sociales

## How It Works

### 1. Language Detection Priority

```
1. URL Path (/es/dashboard, /en/dashboard)
   ↓
2. Cookie (NEXT_LOCALE)
   ↓
3. Browser Language (navigator.language)
   ↓
4. Default (es)
```

### 2. Language Change Flow

```typescript
1. User clicks on language option
2. Component sets loading state (isPending)
3. Creates cookie with new locale (expires in 1 year)
4. Builds new URL with locale prefix
5. Router pushes new URL and refreshes
6. Cookie persists preference for future visits
```

### 3. URL Structure

```
Without locale:
/dashboard → Redirects to /es/dashboard (default)

With locale:
/es/dashboard → Spanish version
/en/dashboard → English version

Changing language:
/es/dashboard → /en/dashboard (replaces locale in URL)
```

## API Reference

### Props

```typescript
interface LanguageSwitcherProps {
  variant?: "default" | "compact";  // Variant de diseño
  className?: string;                // Clases CSS adicionales
}
```

### Variants

#### `compact`
- Botón circular pequeño (36x36px)
- Solo muestra bandera
- Dropdown simple
- **Uso**: Navbars, headers compactos

#### `default`
- Botón rectangular
- Muestra globo + bandera + nombre
- Dropdown detallado con info adicional
- **Uso**: Footers, sidebars amplios

## Styling & Customization

El componente usa Tailwind CSS y está diseñado para coincidir con el diseño existente del sitio:

```typescript
// Colores del sistema
bg-background/50       // Fondo semi-transparente
bg-accent             // Hover state
border-border         // Bordes normales
border-primary/50     // Bordes en hover
bg-primary/10         // Seleccionado
text-primary          // Texto activo
text-muted-foreground // Texto inactivo
```

### Dark Mode Support

El componente funciona automáticamente en modo claro y oscuro gracias a las variables CSS del sistema.

## Accessibility

- ✅ ARIA labels (`aria-label`, `aria-expanded`)
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus management
- ✅ Screen reader friendly
- ✅ Semantic HTML

## Mobile Responsiveness

```typescript
// Breakpoints
sm:inline    // Oculta texto en móvil, muestra en tablet+
hidden md:flex // Oculta en móvil, muestra en desktop
```

## Performance

- **Code splitting**: Component usa "use client" solo donde es necesario
- **Optimistic updates**: Actualiza UI antes de completar la navegación
- **Lazy rendering**: Dropdown solo se renderiza cuando está abierto
- **Minimal re-renders**: Usa refs y callbacks optimizados

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Posibles mejoras futuras:

1. **Más idiomas**: Agregar portugués, francés, etc.
2. **Auto-detection**: Detectar idioma por geolocalización IP
3. **Teclado shortcuts**: Ctrl+L para abrir selector
4. **Animaciones**: Transiciones de página al cambiar idioma
5. **Analytics**: Track language changes en Google Analytics

## Troubleshooting

### El idioma no cambia

1. Verifica que el middleware de next-intl esté configurado
2. Revisa que las rutas tengan el prefijo de locale
3. Comprueba que la cookie se esté guardando correctamente

### Las banderas no se muestran

Las banderas son emojis (Unicode), si no se ven:
1. Actualiza tu sistema operativo
2. Usa un navegador moderno
3. Considera usar iconos SVG como alternativa

### Errores de tipo TypeScript

Si hay errores de tipo:
1. Asegúrate de que `/i18n/config.ts` esté correctamente importado
2. Verifica que `Locale` esté definido como type
3. Regenera los tipos: `npm run build`

## Support

Para preguntas o issues:
1. Revisa esta documentación
2. Consulta el código fuente en `/components/language-switcher.tsx`
3. Revisa la configuración en `/i18n/config.ts`

---

**Created**: 2025-11-01
**Version**: 1.0.0
**Status**: Production Ready ✅
