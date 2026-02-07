# LanguageSwitcher Component - Quick Reference

## 🚀 Quick Start

```tsx
import { LanguageSwitcher } from "@/components/language-switcher";

// Compact variant (recommended)
<LanguageSwitcher variant="compact" />

// Default variant
<LanguageSwitcher variant="default" />
```

## 📦 Component Files

```
components/
  ├── language-switcher.tsx       # Main component
lib/
  └── i18n/
      └── config.ts                # i18n configuration
docs/
  └── LANGUAGE_SWITCHER.md        # Full documentation
```

## 🎨 Variants Comparison

### Compact Variant (36x36px button)
```
┌─────┐
│ 🇪🇸  │  ← Button (circular)
└─────┘
   ↓
┌──────────────┐
│ 🇪🇸 Español ✓│  ← Dropdown
│ 🇺🇸 English  │
└──────────────┘
```

**Best for**: Navbars, headers, mobile

### Default Variant (Full width button)
```
┌────────────────────┐
│ 🌐 🇪🇸 Español ▼  │  ← Button
└────────────────────┘
        ↓
┌─────────────────────────┐
│ SELECT LANGUAGE         │  ← Header
├─────────────────────────┤
│ 🇪🇸  Español            │
│      Spanish        ✓   │  ← Dropdown
├─────────────────────────┤
│ 🇺🇸  English            │
│      English            │
├─────────────────────────┤
│ Language preference... │  ← Footer
└─────────────────────────┘
```

**Best for**: Footers, sidebars, settings pages

## 📍 Already Integrated In

### 1. Dashboard Sidebar
```tsx
// /components/dashboard-nav.tsx (Line 138)

<div className="flex gap-2">
  <NotificationDropdown />
  <OnboardingMenu />
  <LanguageSwitcher variant="compact" />  // ✅ HERE
  <ThemeToggle />
</div>
```

**Location**: Bottom-left of dashboard, in controls row

### 2. Landing Header
```tsx
// /app/(landing)/layout.tsx (Line 52)

<div className="flex items-center gap-3">
  <LanguageSwitcher variant="compact" />  // ✅ HERE
  <ThemeToggle />
  <Link href="/login">...</Link>
</div>
```

**Location**: Top-right of landing page

### 3. Landing Footer
```tsx
// /app/(landing)/layout.tsx (Line 186)

<div className="flex items-center gap-2">
  <LanguageSwitcher variant="compact" />  // ✅ HERE
  <ThemeToggle />
</div>
```

**Location**: Bottom-right of landing page

## 🔧 Props API

```typescript
interface LanguageSwitcherProps {
  variant?: "default" | "compact";
  className?: string;
}
```

### Examples

```tsx
// Basic usage
<LanguageSwitcher />

// Compact variant
<LanguageSwitcher variant="compact" />

// With custom styling
<LanguageSwitcher
  variant="compact"
  className="ml-auto"
/>
```

## 🌍 Supported Languages

| Code | Language | Flag | Native Name |
|------|----------|------|-------------|
| `es` | Spanish  | 🇪🇸  | Español     |
| `en` | English  | 🇺🇸  | English     |

## 🎯 Features Checklist

- ✅ Auto-detects language from URL, cookie, or browser
- ✅ Saves preference in cookie (1 year expiration)
- ✅ Redirects to localized URLs
- ✅ Smooth animations with Framer Motion
- ✅ Click outside to close
- ✅ Loading states
- ✅ Dark mode support
- ✅ Mobile responsive
- ✅ Accessibility (ARIA)
- ✅ TypeScript support

## 💡 Usage Tips

### When to use `compact` variant:
- Navbars and headers
- Mobile layouts
- Limited horizontal space
- Quick access needed

### When to use `default` variant:
- Footers
- Settings pages
- Wide sidebars
- When you want to show more detail

### Custom positioning:
```tsx
// Right-aligned
<div className="flex justify-end">
  <LanguageSwitcher variant="compact" />
</div>

// Centered
<div className="flex justify-center">
  <LanguageSwitcher variant="default" />
</div>

// With margin
<LanguageSwitcher
  variant="compact"
  className="ml-auto mr-4"
/>
```

## 🎨 Styling

The component uses Tailwind CSS and matches your site's design system:

```css
/* Backgrounds */
bg-background/50       /* Semi-transparent background */
bg-accent             /* Hover state */
bg-primary/10         /* Selected state */

/* Borders */
border-border         /* Normal border */
border-primary/50     /* Hover border */

/* Text */
text-primary          /* Active text */
text-muted-foreground /* Inactive text */
```

## 🔄 How Language Switching Works

```
1. User clicks language option
   ↓
2. Cookie saved: NEXT_LOCALE=en
   ↓
3. URL updated: /es/dashboard → /en/dashboard
   ↓
4. Page redirects and refreshes
   ↓
5. New language loaded
```

## 📱 Mobile Behavior

```tsx
// On mobile, text is hidden
<span className="text-sm font-medium hidden sm:inline">
  {currentLanguage.nativeName}
</span>

// Shows:
// Mobile:  🇪🇸
// Tablet+: 🇪🇸 Español
```

## 🐛 Common Issues

### Language doesn't change?
1. Check middleware configuration
2. Verify cookie is being set
3. Ensure routes have locale prefix

### Dropdown doesn't open?
1. Check z-index conflicts
2. Verify Framer Motion is installed
3. Check console for errors

### TypeScript errors?
1. Import `Locale` type from config
2. Run `npm run build` to regenerate types

## 📊 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Full |
| Firefox | 88+     | ✅ Full |
| Safari  | 14+     | ✅ Full |
| Edge    | 90+     | ✅ Full |
| iOS     | 14+     | ✅ Full |
| Android | Latest  | ✅ Full |

## 🔐 Accessibility

```tsx
// ARIA labels
<button
  aria-label="Change language"
  aria-expanded={isOpen}
>

// Keyboard navigation
Tab       // Focus on button
Enter     // Open/close dropdown
Escape    // Close dropdown
Click out // Close dropdown
```

## 📈 Performance

- **Lazy dropdown**: Only renders when open
- **Optimistic updates**: UI updates immediately
- **Minimal re-renders**: Uses refs and callbacks
- **Code splitting**: Client-only where needed

## 🚀 Next Steps

1. **Test it**: Try both variants in different contexts
2. **Customize**: Add your own styling if needed
3. **Extend**: Add more languages in `/i18n/config.ts`
4. **Monitor**: Track language changes in analytics

## 📚 More Resources

- [Full Documentation](../docs/LANGUAGE_SWITCHER.md)
- [i18n Config](../i18n/config.ts)
- [Component Source](./language-switcher.tsx)

---

**Quick Import:**
```tsx
import { LanguageSwitcher } from "@/components/language-switcher";
```

**Quick Usage:**
```tsx
<LanguageSwitcher variant="compact" />
```

Done! 🎉
