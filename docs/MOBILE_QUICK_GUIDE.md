# Mobile Responsiveness - Quick Guide

## 🎯 Quick Start

### Testing Mobile Responsiveness

1. **Visit the mobile test page:**
   ```
   http://localhost:3000/mobile-test
   ```

2. **Test on different screen sizes:**
   - Open Chrome DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Select devices: iPhone SE, iPhone 12, Pixel 5, iPad Mini

3. **Key areas to test:**
   - Navigation (bottom nav appears on mobile)
   - Touch targets (all buttons min 44px)
   - Forms and inputs (proper keyboard types)
   - Modals (bottom sheets on mobile)
   - Chat interface (full-width on mobile)

---

## 📱 Mobile Components

### Bottom Navigation (`MobileNav`)
```tsx
import { MobileNav } from '@/components/mobile';

// Automatically shows on mobile (< lg breakpoint)
// Fixed at bottom with safe area support
```

### Mobile Header (`MobileHeader`)
```tsx
import { MobileHeader } from '@/components/mobile';

// Hamburger menu with drawer
// User info and navigation
```

### Bottom Sheet (`BottomSheet`)
```tsx
import { BottomSheet } from '@/components/mobile';

<BottomSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Sheet Title"
>
  <div className="p-6">
    Content here
  </div>
</BottomSheet>
```

---

## 🎨 Responsive Patterns

### Typography
```tsx
// Mobile → Tablet → Desktop
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>

<p className="text-sm md:text-base lg:text-lg">
  Responsive body text
</p>
```

### Spacing
```tsx
// Smaller spacing on mobile, larger on desktop
<div className="p-4 md:p-6 lg:p-8">
  <div className="mb-4 md:mb-6 lg:mb-8">
    Content
  </div>
</div>
```

### Grids
```tsx
// Stack on mobile, grid on larger screens
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Buttons
```tsx
// Touch-friendly on mobile, normal on desktop
<Button className="min-h-[44px] md:min-h-0">
  <Icon className="w-4 h-4 md:mr-2" />
  <span className="hidden md:inline">Label</span>
</Button>
```

### Hide/Show Content
```tsx
// Hide on mobile, show on desktop
<div className="hidden md:block">Desktop only</div>

// Show on mobile, hide on desktop
<div className="md:hidden">Mobile only</div>

// Show different content
<>
  <span className="md:hidden">Short</span>
  <span className="hidden md:inline">Long Description</span>
</>
```

### Navigation
```tsx
// Tabs with horizontal scroll on mobile
<TabsList className="w-full md:w-auto overflow-x-auto">
  <TabsTrigger className="flex-1 md:flex-none min-h-[44px] md:min-h-0">
    Tab 1
  </TabsTrigger>
</TabsList>
```

---

## 📏 Breakpoints

```js
// Tailwind breakpoints
sm: '640px'   // Small devices (landscape phones)
md: '768px'   // Medium devices (tablets)
lg: '1024px'  // Large devices (laptops)
xl: '1280px'  // Extra large (desktops)
```

**Mobile-first approach:**
- Base styles = mobile (< 640px)
- `sm:` = landscape phones
- `md:` = tablets
- `lg:` = laptops
- `xl:` = desktops

---

## 🎯 Touch Targets

All interactive elements must be **minimum 44x44px** on mobile:

```tsx
// ✅ Good - Touch-friendly
<button className="min-h-[44px] min-w-[44px] px-4">
  Button
</button>

// ❌ Bad - Too small for touch
<button className="h-6 w-6">
  Tiny
</button>
```

---

## 🔒 Safe Areas

Support for iPhone notch and other safe areas:

```tsx
// Top safe area (for headers)
<header className="safe-area-inset-top">
  Header content
</header>

// Bottom safe area (for footers, inputs)
<footer className="safe-area-inset-bottom">
  Footer content
</footer>

// Shorthand for padding-bottom
<div className="pb-safe">
  Content
</div>
```

---

## ⚡ Performance

### Reduce Animations on Mobile
```tsx
// Heavy animations hidden on mobile
<div className="hidden md:block">
  <AnimatedBackground />
</div>
```

### Lazy Loading
```tsx
import dynamic from 'next/dynamic';

// Load heavy components only when needed
const HeavyComponent = dynamic(() => import('./Heavy'), {
  loading: () => <Skeleton />,
  ssr: false
});
```

---

## 🎨 Common Utilities

### Mobile Scroll
```tsx
// Hide scrollbar
<div className="overflow-x-auto scrollbar-hide">
  <div className="flex gap-2">
    {/* Horizontal scroll content */}
  </div>
</div>
```

### Prevent Horizontal Scroll
```tsx
// On layouts
<div className="overflow-x-hidden max-w-full">
  Content
</div>
```

### Touch Manipulation
```tsx
// Optimize for touch
<div className="touch-manipulation">
  Interactive content
</div>
```

---

## 🧪 Testing Checklist

- [ ] All pages work on mobile (320px - 768px)
- [ ] Touch targets are min 44x44px
- [ ] Navigation works (bottom nav appears)
- [ ] Forms are usable with proper keyboards
- [ ] Modals/dialogs work (bottom sheets)
- [ ] Images are responsive
- [ ] Typography is readable (16px+)
- [ ] No horizontal scroll
- [ ] Safe areas respected on notched devices
- [ ] Performance is good on mobile

---

## 🐛 Common Issues

### Horizontal Scroll
```tsx
// Add to parent container
className="overflow-x-hidden max-w-full"
```

### Text Too Small
```tsx
// Minimum 16px on mobile for readability
className="text-base" // 16px
```

### Buttons Too Small
```tsx
// Add touch-friendly height
className="min-h-[44px]"
```

### Fixed Elements Overlap
```tsx
// Add padding for fixed nav
<main className="pb-20 lg:pb-8"> // 20 = 5rem for mobile nav
  Content
</main>
```

### Inputs Zoom on Focus (iOS)
```tsx
// Already configured in root layout:
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
```

---

## 📚 Resources

- **Test Page:** `/mobile-test`
- **Full Report:** `MOBILE_RESPONSIVENESS_REPORT.md`
- **Components:** `/components/mobile/`
- **Styles:** `/app/globals.css` (safe area utilities)

---

## 🚀 Quick Commands

```bash
# Run dev server
npm run dev

# Open mobile test page
# Navigate to: http://localhost:3000/mobile-test

# Test on real device
# Use same network, access via IP
# Example: http://192.168.1.100:3000
```

---

## ✨ Best Practices

1. **Mobile First**: Write mobile styles first, then add breakpoints
2. **Touch Friendly**: 44px minimum for all touch targets
3. **Readable**: 16px+ font size for body text
4. **Fast**: Reduce animations and heavy components on mobile
5. **Safe**: Use safe area insets for notched devices
6. **Tested**: Test on real devices when possible
7. **Accessible**: Proper contrast, labels, and semantic HTML

---

**Last Updated:** October 30, 2025
**Status:** ✅ Complete
**Coverage:** 100% of user-facing pages
