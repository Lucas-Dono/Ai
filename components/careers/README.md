# Careers Page Components

Componentes para la página de Careers (Bolsa de Trabajo) de Blaniel. La página sigue el mismo estilo visual y arquitectura que la landing page, utilizando Framer Motion para animaciones, Tailwind CSS para estilos y componentes shadcn.

## Estructura de Componentes

### `CareersWrapper.tsx`
Wrapper principal que envuelve todo el contenido de la página de careers. Reutiliza la navegación y footer de la landing page.

```tsx
<CareersWrapper>
  <CareersHero />
  <WhyBlaniel />
  <OpenPositions />
  <HowToApply />
  <CareersCTA />
</CareersWrapper>
```

### `CareersHero.tsx`
Hero section con:
- Badge de estado ("Construyendo el futuro...")
- Headline principal
- Subtítulo descriptivo
- Animaciones de entrada con Framer Motion

### `WhyBlaniel.tsx`
Grid de 6 cards con beneficios de trabajar en Blaniel:
- Impacto Real
- Tecnología de Punta
- Autonomía
- Compensación
- Equipo Global
- Comunidad

Utiliza icons de lucide-react y animaciones con scroll-triggered animations.

### `OpenPositions.tsx`
Componente expandible con las posiciones abiertas:
- Full-Stack Engineer (React Native + Node.js)
- UX/UI Designer
- Community Manager (ES + EN)

Cada posición es una tarjeta expandible que muestra:
- Información básica (título, tipo, ubicación, compensación)
- Descripción completa
- Responsabilidades
- Requisitos
- Skills necesarias
- Botón de aplicación por email

### `HowToApply.tsx`
Sección de 3 pasos para aplicar:
1. Envía tu CV/Portfolio
2. Cuéntanos por qué te interesa Blaniel
3. Comparte tu mejor proyecto

Incluye CTA alternativo para talento sin posición específica.

### `CareersCTA.tsx`
Call-to-action final con:
- Badge
- Headline y subtítulo
- Botones primarios (Email) y secundarios
- Información de soporte
- Accent glow visual

## Animaciones

Todos los componentes utilizan:
- `initial`, `animate`, `whileInView` de Framer Motion
- Transiciones suaves de entrada (`opacity: 0 → 1`, `y: 20 → 0`)
- Stagger delays para efectos en cascada
- Hover effects en cards y botones

## Traducciones

Las traducciones están en `messages/es.json` bajo la clave `careers` con las siguientes secciones:

```json
{
  "careers": {
    "hero": {...},
    "why": {...},
    "positions": {...},
    "howToApply": {...},
    "finalCta": {...}
  }
}
```

## Estilos

- **Border Radius**: `rounded-2xl` (SHAPE.lg) por defecto
- **Colores**: Usa la paleta de diseño estándar (foreground, background, muted, border)
- **Shadows**: Elevation levels de `ELEVATION` tokens
- **Spacing**: Usa tokens de `SPACING` para consistencia
- **Responsive**: Mobile-first design con breakpoints sm, md, lg

## Uso

Para acceder a la página de careers:
```
/careers
```

La página incluye metadata SEO completa y está optimizada para búsqueda:
- Title: "Careers | Únete al Equipo - Blaniel"
- Description: Información sobre posiciones remotas
- Open Graph tags
- Canonical URL

## Características Especiales

### Posiciones Expandibles
Las tarjetas de posiciones son expandibles con animación suave de altura. Al hacer click, revelan todos los detalles de la posición.

### Email Links
Los botones de aplicación se vinculan directamente a `jobs@blaniel.com` con subject prefilled.

### Responsive Design
- En mobile: Stack vertical, botones full-width
- En tablet: Grid de 2 columnas para algunas secciones
- En desktop: Grid de 3 columnas, layout completo

## Internacionalización (i18n)

Todos los textos usan `useTranslations()` de next-intl. Para agregar otro idioma:

1. Duplica la sección `careers` en `messages/es.json`
2. Crea un nuevo archivo `messages/[lang].json`
3. Traduce los valores manteniendo la estructura de claves

## Integración con Otros Componentes

- Usa `LandingNav` y `LandingFooter` para navegación y pie
- Reutiliza `Card` y `Button` de shadcn
- Sigue el mismo sistema de diseño que landing page

## Performance

- Animaciones trigger en scroll con `whileInView`
- `viewport={{ once: true }}` para animaciones que solo se ejecutan una vez
- Lazy rendering de contenido expandible
