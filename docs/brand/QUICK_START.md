# Blaniel - Brand Quick Start

## 🚀 Get Started in 5 Minutes

This is a quick reference guide for developers and designers to start using the Blaniel brand system immediately.

---

## ✅ Brand Essentials

### Product Names
```
Full Name:  Blaniel
Short Name: Blaniel
Slug:       blaniel
Twitter:    @circuitpromptai
```

### Tagline
```
"Create emotional AIs with real memory"
```

---

## 🎨 Colors (Copy & Paste)

### Primary: Electric Violet
```css
/* Light */
#C084FC  /* Main - Use this for CTAs, primary actions */
#D8B4FE  /* Lighter - For hover states */
#581C87  /* Darker - For dark mode */

/* RGB */
rgb(192, 132, 252)  /* Main */
rgba(192, 132, 252, 0.1)  /* 10% opacity for backgrounds */
```

### Secondary: Cyan
```css
/* Light */
#06B6D4  /* Main - Use for secondary actions, links */
#67E8F9  /* Lighter - For hover states */
#164E63  /* Darker - For dark mode */

/* RGB */
rgb(6, 182, 212)  /* Main */
rgba(6, 182, 212, 0.1)  /* 10% opacity */
```

### Accent: Amber
```css
/* Light */
#F59E0B  /* Main - Use for highlights, badges */
#FBBF24  /* Lighter - For hover states */
#78350F  /* Darker - For dark mode */

/* RGB */
rgb(245, 158, 11)  /* Main */
rgba(245, 158, 11, 0.1)  /* 10% opacity */
```

---

## 📝 Typography

### Font
```html
<!-- Import in <head> -->
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

```css
/* Use in CSS */
font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Scale
```
Display:  64px (4rem)   font-weight: 800
H1:       48px (3rem)   font-weight: 700
H2:       36px (2.25rem) font-weight: 700
H3:       28px (1.75rem) font-weight: 600
H4:       24px (1.5rem)  font-weight: 600
Body Lg:  18px (1.125rem) font-weight: 400
Body:     16px (1rem)    font-weight: 400
Small:    14px (0.875rem) font-weight: 400
Caption:  12px (0.75rem)  font-weight: 500
```

---

## 🧩 Quick Components

### Hero Title
```tsx
<h1 className="text-6xl font-extrabold brand-gradient-text">
  Blaniel
</h1>
```

### Primary Button (CTA)
```tsx
<button className="brand-button-primary">
  Start Creating Free
</button>
```

### Secondary Button
```tsx
<button className="brand-button-secondary">
  Learn More
</button>
```

### Outline Button
```tsx
<button className="brand-button-outline">
  Explore Features
</button>
```

### Feature Card
```tsx
<div className="brand-card p-6">
  <h3 className="text-2xl font-semibold text-brand-primary mb-3">
    Real Emotions
  </h3>
  <p className="text-neutral-700 dark:text-neutral-300">
    OCC + Plutchik system for authentic emotions
  </p>
</div>
```

### Badge
```tsx
<span className="brand-badge">
  New Feature
</span>
```

---

## 🎨 Gradients

### Hero Background
```css
background: linear-gradient(135deg, rgb(192, 132, 252) 0%, rgb(6, 182, 212) 100%);
```

Or use the utility class:
```tsx
<div className="brand-gradient-bg">
  {/* Hero content */}
</div>
```

### Gradient Text
```tsx
<h1 className="brand-gradient-text">
  Amazing Title
</h1>
```

### Card Gradient Background
```css
background: linear-gradient(145deg, rgba(192, 132, 252, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%);
```

Or use:
```tsx
<div className="brand-card">
  {/* Auto-applies gradient background */}
</div>
```

---

## 🔧 Utility Classes Reference

### Text Colors
```tsx
<p className="text-brand-primary">Electric Violet text</p>
<p className="text-brand-secondary">Cyan text</p>
<p className="text-brand-accent">Amber text</p>
```

### Background Colors
```tsx
<div className="bg-brand-primary">Electric Violet background</div>
<div className="bg-brand-secondary">Cyan background</div>
<div className="bg-brand-accent">Amber background</div>
```

### Border Colors
```tsx
<div className="border-2 border-brand-primary">Violet border</div>
<div className="border-2 border-brand-secondary">Cyan border</div>
<div className="border-2 border-brand-accent">Amber border</div>
```

### Effects
```tsx
<div className="brand-glow">Glowing effect</div>
<div className="brand-pulse">Pulsing animation</div>
```

---

## 📐 Spacing Quick Reference

```
4px:   p-1   m-1
8px:   p-2   m-2
12px:  p-3   m-3
16px:  p-4   m-4
20px:  p-5   m-5
24px:  p-6   m-6
32px:  p-8   m-8
48px:  p-12  m-12
64px:  p-16  m-16
```

---

## 🖼️ Common Patterns

### Landing Hero Section
```tsx
<section className="brand-gradient-bg py-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
      <button className="brand-button-outline bg-white/10 border-white text-white">
        Watch Demo
      </button>
    </div>
  </div>
</section>
```

### Features Grid
```tsx
<section className="py-24">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-4xl font-bold text-center mb-16">
      Features that make the <span className="brand-gradient-text">difference</span>
    </h2>

    <div className="grid md:grid-cols-3 gap-8">
      {features.map(feature => (
        <div key={feature.id} className="brand-card p-6">
          <h3 className="text-xl font-semibold text-brand-primary mb-2">
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
<section className="py-20 brand-gradient-bg">
  <div className="max-w-4xl mx-auto text-center px-4">
    <h2 className="text-5xl font-bold text-white mb-6">
      Ready to start your journey?
    </h2>
    <p className="text-xl text-white/90 mb-8">
      Join thousands of creators building the future of AI
    </p>
    <button className="brand-button-primary bg-white text-brand-primary-600">
      Create Your First AI Free
    </button>
  </div>
</section>
```

---

## 📱 Responsive Design

### Breakpoints
```
sm:  640px   (Tablets)
md:  768px   (Tablets landscape)
lg:  1024px  (Laptops)
xl:  1280px  (Desktops)
2xl: 1536px  (Large desktops)
```

### Responsive Text
```tsx
<h1 className="
  text-3xl      /* Mobile: 30px */
  md:text-5xl   /* Tablet: 48px */
  lg:text-6xl   /* Desktop: 64px */
">
  Responsive heading
</h1>
```

### Responsive Spacing
```tsx
<section className="
  py-12        /* Mobile: 48px */
  md:py-16     /* Tablet: 64px */
  lg:py-24     /* Desktop: 96px */
">
  Content
</section>
```

---

## 🌙 Dark Mode

All components automatically support dark mode:

```tsx
<html className="dark">
  {/* Entire app in dark mode */}
</html>
```

Colors automatically adjust:
- Primary becomes lighter in dark mode
- Backgrounds become darker
- Text becomes lighter

---

## ✅ Quick Checklist

Before deploying any page:

- [ ] Uses "Blaniel" (not "Creador" or "AI Creator")
- [ ] Brand colors used (Violet, Cyan, Amber)
- [ ] Manrope font family applied
- [ ] Responsive on mobile, tablet, desktop
- [ ] Dark mode tested and working
- [ ] Proper spacing (consistent with scale)
- [ ] CTAs use brand-button-primary class
- [ ] Feature cards use brand-card class
- [ ] Gradient text on hero title

---

## 🔗 Full Documentation

- **Complete Brand Guidelines:** `/docs/brand/BRAND_GUIDELINES.md`
- **Technical Design System:** `/docs/brand/DESIGN_SYSTEM.md`
- **Implementation Summary:** `/docs/brand/IMPLEMENTATION_SUMMARY.md`

---

## 💡 Pro Tips

1. **Always use utility classes** instead of inline styles for consistency
2. **Use brand-card** for any feature/content cards
3. **Use brand-gradient-text** for hero titles and important headings
4. **Use brand-button-primary** for main CTAs (only 1-2 per page)
5. **Test in dark mode** before considering work complete
6. **Check mobile first** then enhance for desktop

---

## 🆘 Common Issues

**Q: Colors not showing?**
A: Make sure you're using `className="bg-brand-primary"` not inline styles

**Q: Gradient text not working?**
A: Use `className="brand-gradient-text"` utility class

**Q: Buttons look wrong?**
A: Use the pre-built button classes: `brand-button-primary`, etc.

**Q: Dark mode broken?**
A: Ensure `<html className="dark">` is applied

---

**Ready to build? Start with the Landing Hero pattern above! 🚀**
