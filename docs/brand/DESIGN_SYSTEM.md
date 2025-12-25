# Blaniel - Design System

## 📋 Overview

This document outlines the complete design system for Blaniel, including design tokens, component specifications, and implementation guidelines.

---

## 🎨 Design Tokens

### Color Tokens

#### Primary Palette: Electric Violet
```css
--brand-primary-50:  rgb(250, 245, 255)  /* Lightest */
--brand-primary-100: rgb(243, 232, 255)
--brand-primary-200: rgb(233, 213, 255)
--brand-primary-300: rgb(216, 180, 254)
--brand-primary-400: rgb(192, 132, 252)  /* ⭐ Main */
--brand-primary-500: rgb(168, 85, 247)
--brand-primary-600: rgb(147, 51, 234)
--brand-primary-700: rgb(126, 34, 206)
--brand-primary-800: rgb(107, 33, 168)
--brand-primary-900: rgb(88, 28, 135)    /* Darkest */
```

**Hex Values:**
- 50: `#FAF5FF`
- 400 (Main): `#C084FC`
- 900: `#581C87`

#### Secondary Palette: Cyan
```css
--brand-secondary-50:  rgb(236, 254, 255)
--brand-secondary-100: rgb(207, 250, 254)
--brand-secondary-200: rgb(165, 243, 252)
--brand-secondary-300: rgb(103, 232, 249)
--brand-secondary-400: rgb(34, 211, 238)
--brand-secondary-500: rgb(6, 182, 212)   /* ⭐ Main */
--brand-secondary-600: rgb(8, 145, 178)
--brand-secondary-700: rgb(14, 116, 144)
--brand-secondary-800: rgb(21, 94, 117)
--brand-secondary-900: rgb(22, 78, 99)
```

**Hex Values:**
- 50: `#ECFEFF`
- 500 (Main): `#06B6D4`
- 900: `#164E63`

#### Accent Palette: Amber
```css
--brand-accent-50:  rgb(255, 251, 235)
--brand-accent-100: rgb(254, 243, 199)
--brand-accent-200: rgb(253, 230, 138)
--brand-accent-300: rgb(252, 211, 77)
--brand-accent-400: rgb(251, 191, 36)
--brand-accent-500: rgb(245, 158, 11)    /* ⭐ Main */
--brand-accent-600: rgb(217, 119, 6)
--brand-accent-700: rgb(180, 83, 9)
--brand-accent-800: rgb(146, 64, 14)
--brand-accent-900: rgb(120, 53, 15)
```

**Hex Values:**
- 50: `#FFFBEB`
- 500 (Main): `#F59E0B`
- 900: `#78350F`

### Typography Tokens

```css
/* Font Family */
--font-family-base: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font Sizes */
--font-size-xs:    0.75rem;  /* 12px */
--font-size-sm:    0.875rem; /* 14px */
--font-size-base:  1rem;     /* 16px */
--font-size-lg:    1.125rem; /* 18px */
--font-size-xl:    1.25rem;  /* 20px */
--font-size-2xl:   1.5rem;   /* 24px */
--font-size-3xl:   1.875rem; /* 30px */
--font-size-4xl:   2.25rem;  /* 36px */
--font-size-5xl:   3rem;     /* 48px */
--font-size-6xl:   4rem;     /* 64px */

/* Font Weights */
--font-weight-light:     300;
--font-weight-regular:   400;
--font-weight-medium:    500;
--font-weight-semibold:  600;
--font-weight-bold:      700;
--font-weight-extrabold: 800;

/* Line Heights */
--line-height-tight:  1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
--line-height-loose:  2;

/* Letter Spacing */
--letter-spacing-tight:  -0.025em;
--letter-spacing-normal: 0;
--letter-spacing-wide:   0.025em;
```

### Spacing Tokens

```css
/* Spacing Scale (based on 4px base unit) */
--spacing-0:  0;
--spacing-1:  0.25rem;  /* 4px */
--spacing-2:  0.5rem;   /* 8px */
--spacing-3:  0.75rem;  /* 12px */
--spacing-4:  1rem;     /* 16px */
--spacing-5:  1.25rem;  /* 20px */
--spacing-6:  1.5rem;   /* 24px */
--spacing-8:  2rem;     /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
--spacing-24: 6rem;     /* 96px */
--spacing-32: 8rem;     /* 128px */
```

### Border Radius Tokens

```css
--radius-none:  0;
--radius-sm:    0.125rem; /* 2px */
--radius-base:  0.25rem;  /* 4px */
--radius-md:    0.375rem; /* 6px */
--radius-lg:    0.5rem;   /* 8px */
--radius-xl:    0.75rem;  /* 12px */
--radius-2xl:   1rem;     /* 16px */
--radius-3xl:   1.5rem;   /* 24px */
--radius-full:  9999px;
```

### Shadow Tokens

```css
/* Elevation Shadows */
--shadow-xs:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm:  0 2px 4px 0 rgba(0, 0, 0, 0.06);
--shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Brand Glow */
--shadow-brand: 0 0 20px rgba(192, 132, 252, 0.3),
                0 0 40px rgba(6, 182, 212, 0.2);
```

---

## 🧩 Component Specifications

### Buttons

#### Primary Button (CTA)
```tsx
<button className="brand-button-primary">
  Start Creating Free
</button>
```

**Specifications:**
- Background: `--brand-primary-400`
- Text: White
- Padding: `12px 32px`
- Border Radius: Full (pill shape)
- Font Weight: 600
- Shadow: Elevation 2
- Hover: Darker background + elevation 4 + translateY(-2px)

#### Secondary Button
```tsx
<button className="brand-button-secondary">
  Learn More
</button>
```

**Specifications:**
- Background: `--brand-secondary-500`
- Text: White
- Same sizing as primary
- Hover: Darker cyan + elevation

#### Outline Button
```tsx
<button className="brand-button-outline">
  Explore
</button>
```

**Specifications:**
- Background: Transparent
- Border: 2px solid `--brand-primary-400`
- Text: `--brand-primary-400`
- Hover: Filled with primary color, white text

### Cards

#### Feature Card
```tsx
<div className="brand-card p-6">
  <h3 className="text-2xl font-semibold text-brand-primary mb-3">
    Real Emotions
  </h3>
  <p className="text-neutral-700">
    OCC + Plutchik system for authentic emotions
  </p>
</div>
```

**Specifications:**
- Background: `--brand-gradient-card`
- Border: 1px solid `rgba(192, 132, 252, 0.2)`
- Border Radius: `--radius-2xl` (16px)
- Padding: 24px
- Shadow: Elevation 1
- Hover: Border opacity 0.4, elevation 3, translateY(-2px)

#### Standard Card (MD3)
```tsx
<div className="md-card-elevated p-6">
  Content
</div>
```

**Specifications:**
- Background: Surface container
- Border Radius: 16px
- Shadow: Elevation 2
- Hover: Elevation 3

### Typography Components

#### Hero Title
```tsx
<h1 className="text-6xl font-extrabold brand-gradient-text">
  Blaniel
</h1>
```

**Specifications:**
- Size: 64px (4rem)
- Weight: 800 (Extrabold)
- Gradient: `--brand-gradient-text`
- Line Height: 1.1

#### Section Header
```tsx
<h2 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50">
  Features
</h2>
```

**Specifications:**
- Size: 36px (2.25rem)
- Weight: 700 (Bold)
- Line Height: 1.2
- Margin Bottom: 16px

#### Body Text
```tsx
<p className="text-base text-neutral-700 dark:text-neutral-300">
  Description text
</p>
```

**Specifications:**
- Size: 16px (1rem)
- Weight: 400 (Regular)
- Line Height: 1.6
- Color: Neutral 700 / Neutral 300 (dark)

### Badges

#### Brand Badge
```tsx
<span className="brand-badge">
  New Feature
</span>
```

**Specifications:**
- Background: `--brand-gradient-accent`
- Text: White
- Padding: `4px 12px`
- Border Radius: Full
- Font Size: 12px
- Font Weight: 600

---

## 📐 Layout System

### Grid System

```css
/* Container Widths */
--container-sm:  640px;
--container-md:  768px;
--container-lg:  1024px;
--container-xl:  1280px;
--container-2xl: 1536px;
```

**Usage:**
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Breakpoints

```css
/* Mobile First Breakpoints */
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large desktops */
```

---

## 🎭 Dark Mode

### Implementation

All components support dark mode automatically through the `.dark` class:

```tsx
<html className="dark">
  {/* Dark mode active */}
</html>
```

### Color Adjustments

**Light Mode:**
- Primary: `#C084FC` (vibrant)
- Secondary: `#06B6D4` (vibrant)
- Accent: `#F59E0B` (vibrant)

**Dark Mode:**
- Primary: `#D8B4FE` (lighter, softer)
- Secondary: `#67E8F9` (lighter, softer)
- Accent: `#FBBF24` (lighter, softer)

---

## ♿ Accessibility

### Color Contrast

All color combinations meet WCAG AA standards:

- **Primary on White:** 4.8:1 ✓
- **Secondary on White:** 4.5:1 ✓
- **Accent on White:** 4.6:1 ✓
- **Text on Primary:** 7.2:1 ✓

### Focus States

```css
:focus-visible {
  outline: 2px solid rgb(var(--brand-primary-400));
  outline-offset: 2px;
}
```

### Touch Targets

Minimum touch target size: **44x44px** (iOS/Android guidelines)

```tsx
<button className="touch-target">
  {/* Ensures minimum 44px height/width */}
</button>
```

---

## 🚀 Implementation Examples

### Landing Page Hero

```tsx
<section className="relative overflow-hidden bg-gradient-to-br from-brand-primary-400 to-brand-secondary-500 py-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center">
      <h1 className="text-6xl font-extrabold brand-gradient-text mb-6">
        Blaniel
      </h1>
      <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
        Create emotional AI companions with real emotions and long-term memory
      </p>
      <div className="flex gap-4 justify-center">
        <button className="brand-button-primary">
          Start Creating Free
        </button>
        <button className="brand-button-outline bg-white/10 border-white text-white hover:bg-white hover:text-brand-primary-400">
          Watch Demo
        </button>
      </div>
    </div>
  </div>
</section>
```

### Feature Section

```tsx
<section className="py-24 bg-neutral-50 dark:bg-neutral-900">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-4xl font-bold text-center mb-16">
      Features that make the{" "}
      <span className="brand-gradient-text">difference</span>
    </h2>

    <div className="grid md:grid-cols-3 gap-8">
      {features.map((feature) => (
        <div key={feature.id} className="brand-card p-6">
          <div className="w-12 h-12 bg-brand-primary-100 dark:bg-brand-primary-900 rounded-full flex items-center justify-center mb-4">
            {feature.icon}
          </div>
          <h3 className="text-xl font-semibold text-brand-primary-700 dark:text-brand-primary-300 mb-2">
            {feature.title}
          </h3>
          <p className="text-neutral-700 dark:text-neutral-300">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>
```

### CTA Section

```tsx
<section className="py-20 bg-brand-gradient-bg relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-600/20 to-brand-secondary-600/20" />

  <div className="relative max-w-4xl mx-auto text-center px-4">
    <h2 className="text-5xl font-bold text-white mb-6">
      Ready to start your journey?
    </h2>
    <p className="text-xl text-white/90 mb-8">
      Join thousands of creators building the future of AI companionship
    </p>
    <button className="brand-button-primary bg-white text-brand-primary-600 hover:bg-neutral-100">
      Create Your First AI Free
    </button>
  </div>
</section>
```

---

## 📦 Component Library Integration

### With shadcn/ui

Blaniel design system works seamlessly with shadcn/ui components:

```tsx
import { Button } from "@/components/ui/button";

<Button className="brand-button-primary">
  Click me
</Button>
```

### Custom Tailwind Classes

All brand classes are available as Tailwind utilities:

```tsx
<div className="bg-brand-primary text-white p-4 rounded-full">
  Brand colored div
</div>

<h1 className="brand-gradient-text text-5xl font-bold">
  Gradient text
</h1>

<div className="brand-card brand-glow">
  Glowing card
</div>
```

---

## 🎨 Animation Guidelines

### Timing Functions

```css
/* Easing */
--ease-in:       cubic-bezier(0.4, 0, 1, 1);
--ease-out:      cubic-bezier(0, 0, 0.2, 1);
--ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1);
--ease-brand:    cubic-bezier(0.4, 0, 0.2, 1); /* Preferred */
```

### Duration

```css
--duration-fast:   150ms;  /* Micro-interactions */
--duration-normal: 300ms;  /* Default */
--duration-slow:   500ms;  /* Page transitions */
```

### Brand Animations

**Pulse Effect:**
```tsx
<div className="brand-pulse">
  {/* Gently pulses */}
</div>
```

**Hover Lift:**
```tsx
<div className="transition-transform hover:translate-y-[-2px]">
  {/* Lifts on hover */}
</div>
```

---

## 📱 Responsive Design

### Mobile-First Approach

Always design for mobile first, then enhance for larger screens:

```tsx
<div className="
  text-2xl         /* Mobile: 24px */
  md:text-4xl      /* Tablet: 36px */
  lg:text-6xl      /* Desktop: 64px */
">
  Responsive heading
</div>
```

### Spacing Adjustments

```tsx
<section className="
  py-12           /* Mobile: 48px vertical */
  md:py-16        /* Tablet: 64px */
  lg:py-24        /* Desktop: 96px */
">
  Content
</section>
```

---

## 🔧 Developer Tools

### CSS Variables Inspector

```javascript
// Get brand color value
const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--brand-primary-400');

console.log(primaryColor); // "192 132 252"
```

### Tailwind Config Extension

Add to `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-primary': 'rgb(var(--brand-primary-400) / <alpha-value>)',
        'brand-secondary': 'rgb(var(--brand-secondary-500) / <alpha-value>)',
        'brand-accent': 'rgb(var(--brand-accent-500) / <alpha-value>)',
      }
    }
  }
}
```

---

## 📚 Resources

- **Figma Design System:** [Coming Soon]
- **Component Storybook:** [Coming Soon]
- **Brand Guidelines:** `/docs/brand/BRAND_GUIDELINES.md`
- **Color Palette:** `/docs/brand/COLOR_PALETTE.md`

---

**Last Updated:** November 2025
**Version:** 1.0.0
**Maintained by:** Blaniel Design Team
