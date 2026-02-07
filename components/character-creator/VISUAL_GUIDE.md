# Character Creator - Visual Design Guide

Esta guía visual documenta los principios de diseño, componentes, y patrones visuales del Character Creator.

---

## 🎨 Color Palette

### Primary Colors

```css
/* Electric Violet - Innovation, AI, Future */
--brand-primary-50:  #FAF5FF  /* Lightest */
--brand-primary-100: #F3E8FF
--brand-primary-200: #E9D5FF
--brand-primary-300: #D8B4FE
--brand-primary-400: #C084FC  /* ⭐ Main */
--brand-primary-500: #A855F7
--brand-primary-600: #9333EA
--brand-primary-700: #7E22CE
--brand-primary-800: #6B21A8
--brand-primary-900: #581C87  /* Darkest */
```

```css
/* Cyan - Technology, Connection */
--brand-secondary-50:  #ECFEFF
--brand-secondary-100: #CFFAFE
--brand-secondary-200: #A5F3FC
--brand-secondary-300: #67E8F9
--brand-secondary-400: #22D3EE
--brand-secondary-500: #06B6D4  /* ⭐ Main */
--brand-secondary-600: #0891B2
--brand-secondary-700: #0E7490
--brand-secondary-800: #155E75
--brand-secondary-900: #164E63
```

```css
/* Amber - Emotions, Warmth */
--brand-accent-50:  #FFFBEB
--brand-accent-100: #FEF3C7
--brand-accent-200: #FDE68A
--brand-accent-300: #FCD34D
--brand-accent-400: #FBBF24
--brand-accent-500: #F59E0B  /* ⭐ Main */
--brand-accent-600: #D97706
--brand-accent-700: #B45309
--brand-accent-800: #92400E
--brand-accent-900: #78350F
```

### Gradients

```css
/* Hero Gradient - Violet to Cyan */
background: linear-gradient(135deg, #C084FC 0%, #06B6D4 100%);

/* Card Gradient - Subtle depth */
background: linear-gradient(145deg,
  rgba(192, 132, 252, 0.1) 0%,
  rgba(6, 182, 212, 0.05) 100%
);

/* Accent Gradient - Warm highlight */
background: linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%);

/* Text Gradient - Premium titles */
background: linear-gradient(135deg, #C084FC 0%, #06B6D4 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Usage Guidelines

| Element | Color | Rationale |
|---------|-------|-----------|
| Primary CTAs | Violet (#C084FC) | Premium, attention-grabbing |
| Secondary buttons | Cyan (#06B6D4) | Supporting actions |
| Accent badges | Amber (#F59E0B) | Highlight, energy |
| Success states | Green (system) | Universal convention |
| Error states | Red (system) | Universal convention |
| Neutral UI | Gray scale | Non-distracting |

---

## 📏 Spacing System

### Base Unit: 4px

```css
/* Spacing Scale */
space-1:  4px   /* 0.25rem */
space-2:  8px   /* 0.5rem */
space-3:  12px  /* 0.75rem */
space-4:  16px  /* 1rem */
space-5:  20px  /* 1.25rem */
space-6:  24px  /* 1.5rem */  ⭐ Default gap
space-8:  32px  /* 2rem */    ⭐ Section gap
space-10: 40px  /* 2.5rem */
space-12: 48px  /* 3rem */
space-16: 64px  /* 4rem */
space-20: 80px  /* 5rem */
space-24: 96px  /* 6rem */
```

### Application

```tsx
/* Component spacing */
<div className="space-y-8">  {/* 32px vertical gap between children */}
  <Section className="space-y-6">  {/* 24px within section */}
    <Field className="space-y-3" />  {/* 12px label to input */}
  </Section>
</div>

/* Layout padding */
<Container className="px-6 py-8">  {/* 24px horizontal, 32px vertical */}
```

---

## 🔤 Typography

### Font Family: Manrope

```css
font-family: 'Manrope', ui-sans-serif, system-ui, sans-serif;
```

### Type Scale

```css
/* Display - Marketing pages */
text-6xl: 60px / 1.0     font-weight: 800

/* Headings */
text-5xl: 48px / 1.0     font-weight: 700
text-4xl: 36px / 1.1     font-weight: 700
text-3xl: 30px / 1.2     font-weight: 700  ⭐ Step titles
text-2xl: 24px / 1.25    font-weight: 600  ⭐ Section titles
text-xl:  20px / 1.3     font-weight: 600

/* Body */
text-lg:   18px / 1.5    font-weight: 400  ⭐ Descriptions
text-base: 16px / 1.5    font-weight: 400  ⭐ Default body
text-sm:   14px / 1.5    font-weight: 400  ⭐ Help text
text-xs:   12px / 1.5    font-weight: 500  ⭐ Labels, badges
```

### Font Weights

```css
font-light:      300  /* Rarely used */
font-normal:     400  /* Body text */
font-medium:     500  /* Emphasis */
font-semibold:   600  /* Subheadings */
font-bold:       700  /* Headings */
font-extrabold:  800  /* Hero text */
```

### Usage Examples

```tsx
/* Step title */
<h2 className="text-3xl font-bold tracking-tight">
  Define their personality
</h2>

/* Section title */
<h3 className="text-xl font-semibold">
  Personality Traits
</h3>

/* Description */
<p className="text-muted-foreground text-lg">
  Tell us about your character's fundamental identity
</p>

/* Help text */
<p className="text-sm text-muted-foreground">
  Choose a name that feels authentic
</p>

/* Label */
<Label className="text-sm font-medium">
  Character Name
</Label>
```

---

## 🔲 Border Radius

### Radius Scale (Material Design 3)

```css
/* Border Radius Scale */
rounded-none:     0px      /* No rounding */
rounded-sm:       4px      /* Badges, tags */
rounded-lg:       8px      /* Small buttons */
rounded-xl:       12px     /* Dropdowns, tooltips */
rounded-2xl:      16px     /* ⭐ Standard (cards, panels) */
rounded-3xl:      28px     /* Hero elements */
rounded-full:     9999px   /* Avatars, pills */
```

### Component Guidelines

| Component | Radius | Example |
|-----------|--------|---------|
| Cards | `rounded-2xl` (16px) | Main content cards |
| Buttons | `rounded-full` (9999px) | All button types |
| Inputs | `rounded-xl` (12px) | Form fields |
| Badges | `rounded-full` (9999px) | Status indicators |
| Modals | `rounded-2xl` (16px) | Dialog containers |
| Avatars | `rounded-full` (9999px) | Profile pictures |
| Chips | `rounded-full` (9999px) | Tag pills |

```tsx
/* Examples */
<Card className="rounded-2xl">...</Card>
<Button className="rounded-full">...</Button>
<Input className="rounded-xl">...</Input>
<Badge className="rounded-full">...</Badge>
```

---

## 🌑 Shadows (Elevation)

### Shadow Scale

```css
/* MD3 Elevation System */
elevation-0: none
elevation-1: 0 1px 2px rgba(0, 0, 0, 0.05)
elevation-2: 0 2px 6px rgba(0, 0, 0, 0.06)  ⭐ Cards
elevation-3: 0 4px 8px rgba(0, 0, 0, 0.08)  ⭐ Raised cards
elevation-4: 0 6px 12px rgba(0, 0, 0, 0.10) ⭐ Modals
elevation-5: 0 8px 16px rgba(0, 0, 0, 0.12) ⭐ Popovers
```

### Brand Shadows (with color)

```css
/* Violet glow */
box-shadow:
  0 4px 12px rgba(192, 132, 252, 0.3),
  0 2px 4px rgba(0, 0, 0, 0.1);

/* Cyan glow */
box-shadow:
  0 4px 12px rgba(6, 182, 212, 0.3),
  0 2px 4px rgba(0, 0, 0, 0.1);

/* Combined brand glow */
box-shadow:
  0 8px 24px rgba(192, 132, 252, 0.4),
  0 4px 12px rgba(6, 182, 212, 0.3);
```

### Usage

```tsx
/* Default card */
<Card className="md-elevation-2">

/* Hover state */
<Card className="md-elevation-2 hover:md-elevation-3">

/* Brand glow for current step */
<div className="md-elevation-3 brand-glow">
```

---

## 🎭 Animation Tokens

### Duration

```css
/* Timing scale */
duration-75:   75ms   /* Instant feedback */
duration-100:  100ms  /* Micro-interactions */
duration-150:  150ms  /* Hover effects */
duration-200:  200ms  /* ⭐ Default transitions */
duration-300:  300ms  /* ⭐ Page transitions */
duration-500:  500ms  /* Major state changes */
duration-700:  700ms  /* Dramatic reveals */
duration-1000: 1000ms /* Rare, special effects */
```

### Easing

```css
/* Easing functions */
ease-linear:     linear
ease-in:         cubic-bezier(0.4, 0, 1, 1)
ease-out:        cubic-bezier(0, 0, 0.2, 1)
ease-in-out:     cubic-bezier(0.4, 0, 0.2, 1)  ⭐ Default

/* Material Design */
ease-standard:   cubic-bezier(0.4, 0, 0.2, 1)  ⭐ Recommended
ease-decelerate: cubic-bezier(0, 0, 0.2, 1)
ease-accelerate: cubic-bezier(0.4, 0, 1, 1)
```

### Spring Physics (Framer Motion)

```tsx
/* Default spring */
transition={{ type: 'spring', stiffness: 300, damping: 30 }}

/* Gentle spring */
transition={{ type: 'spring', stiffness: 200, damping: 25 }}

/* Bouncy spring */
transition={{ type: 'spring', stiffness: 400, damping: 20 }}
```

### Animation Guidelines

```tsx
/* Button hover */
whileHover={{ scale: 1.02 }}
transition={{ duration: 0.2 }}

/* Card entry */
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}

/* Page transition */
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -20 }}
transition={{ duration: 0.3 }}

/* Stagger children */
variants={{
  container: {
    animate: { transition: { staggerChildren: 0.1 } }
  },
  item: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 }
  }
}}
```

---

## 🎯 Component Patterns

### Card Styles

```tsx
/* Elevated card (default) */
<div className="
  bg-card
  rounded-2xl
  md-elevation-2
  p-6
  transition-all duration-200
  hover:md-elevation-3
">

/* Outlined card */
<div className="
  bg-card
  rounded-2xl
  border border-border
  p-6
">

/* Brand card (premium) */
<div className="
  bg-gradient-to-br from-brand-primary-400/10 to-brand-secondary-500/10
  border border-brand-primary-400/20
  rounded-2xl
  p-6
  backdrop-blur-sm
">

/* Glassmorphism card */
<div className="
  bg-background/95
  backdrop-blur-2xl
  rounded-2xl
  border border-border/50
  p-6
">
```

### Button Styles

```tsx
/* Primary CTA */
<button className="
  bg-gradient-to-r from-brand-primary-400 to-brand-secondary-500
  text-white
  rounded-full
  px-6 py-3
  font-semibold
  md-elevation-2
  hover:md-elevation-3
  transition-all duration-200
">

/* Secondary */
<button className="
  bg-muted
  text-foreground
  rounded-full
  px-6 py-3
  font-semibold
  hover:bg-muted/80
  transition-colors duration-200
">

/* Outline */
<button className="
  bg-transparent
  border-2 border-border
  text-foreground
  rounded-full
  px-6 py-3
  font-semibold
  hover:border-brand-primary-400
  hover:text-brand-primary-400
  transition-all duration-200
">

/* Ghost */
<button className="
  bg-transparent
  text-foreground
  rounded-full
  px-4 py-2
  font-medium
  hover:bg-muted
  transition-colors duration-200
">
```

### Input Styles

```tsx
/* Default input */
<input className="
  w-full
  h-12
  px-4
  bg-background
  border border-border
  rounded-xl
  text-foreground
  placeholder:text-muted-foreground
  focus:border-brand-primary-400
  focus:ring-2 focus:ring-brand-primary-400/20
  transition-all duration-200
" />

/* Error state */
<input className="
  border-destructive
  focus:border-destructive
  focus:ring-destructive/20
  animate-shake
" />

/* Success state */
<input className="
  border-green-500
  focus:border-green-500
  focus:ring-green-500/20
" />
```

---

## 🖼️ Layout Patterns

### Container

```tsx
<div className="
  container
  max-w-5xl
  mx-auto
  px-4 sm:px-6 lg:px-8
  py-8 lg:py-12
">
```

### Section

```tsx
<section className="space-y-8">
  <header className="space-y-2">
    <h2 className="text-2xl font-semibold">Section Title</h2>
    <p className="text-muted-foreground">Description</p>
  </header>

  <div className="space-y-6">
    {/* Section content */}
  </div>
</section>
```

### Grid

```tsx
/* Responsive grid */
<div className="
  grid
  grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
  gap-6
">

/* Auto-fit grid */
<div className="
  grid
  grid-cols-[repeat(auto-fit,minmax(250px,1fr))]
  gap-6
">
```

---

## 📱 Responsive Patterns

### Breakpoints

```css
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large desktops */
```

### Mobile-First Approach

```tsx
/* Mobile: Stack vertically */
<div className="flex flex-col gap-4">

/* Tablet+: Side by side */
<div className="flex flex-col md:flex-row gap-4">

/* Desktop: Three columns */
<div className="
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  gap-6
">
```

### Show/Hide Based on Size

```tsx
/* Hide on mobile */
<div className="hidden lg:block">

/* Show only on mobile */
<div className="lg:hidden">

/* Different content per breakpoint */
<div className="block lg:hidden">Mobile Nav</div>
<div className="hidden lg:block">Desktop Nav</div>
```

---

## ✨ Micro-interactions

### Hover States

```tsx
/* Scale up slightly */
className="transition-transform hover:scale-105"

/* Lift with shadow */
className="transition-all hover:-translate-y-1 hover:shadow-lg"

/* Color shift */
className="transition-colors hover:text-brand-primary-400"

/* Background fade */
className="transition-colors hover:bg-muted"
```

### Focus States

```tsx
/* Ring indicator */
className="
  focus:outline-none
  focus:ring-2
  focus:ring-brand-primary-400
  focus:ring-offset-2
"

/* Border highlight */
className="
  focus:border-brand-primary-400
  focus:shadow-lg
"
```

### Active States

```tsx
/* Press down */
className="
  transition-transform
  active:scale-95
"

/* Color shift */
className="
  active:bg-brand-primary-500
"
```

---

## 🎪 Loading States

### Skeleton

```tsx
<div className="
  h-12
  bg-muted
  rounded-xl
  animate-pulse
">

/* With shimmer */
<div className="relative overflow-hidden">
  <div className="h-12 bg-muted rounded-xl" />
  <div className="
    absolute inset-0
    bg-gradient-to-r from-transparent via-white/10 to-transparent
    animate-shimmer
  " />
</div>
```

### Spinner

```tsx
<Loader2 className="
  w-6 h-6
  animate-spin
  text-brand-primary-400
" />
```

---

## 🏁 Summary

**Core Principles**:
1. **Spacious**: Generous spacing (space-y-8) between sections
2. **Smooth**: 200-300ms transitions with Material easing
3. **Premium**: Glassmorphism, gradients, subtle shadows
4. **Accessible**: 44px touch targets, 4.5:1 contrast
5. **Responsive**: Mobile-first, collapses gracefully

**Quick Reference**:
- Cards: `rounded-2xl` + `md-elevation-2`
- Buttons: `rounded-full` + gradient
- Inputs: `rounded-xl` + `h-12`
- Gaps: `space-y-8` sections, `space-y-6` fields
- Typography: Manrope, `text-3xl` titles, `text-base` body

---

**Última actualización**: 2025-01-19
**Autor**: Blaniel Design Team
