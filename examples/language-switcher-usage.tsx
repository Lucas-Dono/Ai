/**
 * Language Switcher - Usage Examples
 *
 * Este archivo contiene ejemplos prácticos de cómo usar el componente
 * LanguageSwitcher en diferentes contextos.
 */

import { LanguageSwitcher } from "@/components/language-switcher";

// ============================================================================
// EJEMPLO 1: Navbar Compacto (Dashboard)
// ============================================================================

export function DashboardNavbar() {
  return (
    <nav className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <h1>Dashboard</h1>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Notificaciones */}
        <button className="h-9 w-9 rounded-lg">🔔</button>

        {/* Language Switcher - Variant Compact */}
        <LanguageSwitcher variant="compact" />

        {/* Theme Toggle */}
        <button className="h-9 w-9 rounded-lg">🌙</button>

        {/* User Avatar */}
        <div className="h-9 w-9 rounded-full bg-primary">👤</div>
      </div>
    </nav>
  );
}

// ============================================================================
// EJEMPLO 2: Header de Landing Page
// ============================================================================

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              AI
            </div>
            <span className="font-bold text-lg">Creator</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#community">Community</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher - Compact */}
            <LanguageSwitcher variant="compact" />

            {/* Theme Toggle */}
            <button>🌙</button>

            {/* CTA Buttons */}
            <button className="px-4 py-2">Login</button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// EJEMPLO 3: Footer Completo
// ============================================================================

export function LandingFooter() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Main footer content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3>Product</h3>
            {/* Links */}
          </div>
          <div>
            <h3>Community</h3>
            {/* Links */}
          </div>
          <div>
            <h3>Company</h3>
            {/* Links */}
          </div>
          <div>
            <h3>Legal</h3>
            {/* Links */}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 AI Creator. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {/* Language & Theme Controls */}
            <div className="flex items-center gap-2">
              {/* Language Switcher - Default o Compact */}
              <LanguageSwitcher variant="compact" />

              {/* Theme Toggle */}
              <button>🌙</button>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#">GitHub</a>
              <a href="#">Twitter</a>
              <a href="#">Discord</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// EJEMPLO 4: Settings Page (Variant Default)
// ============================================================================

export function SettingsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* Settings sections */}
      <div className="space-y-6">
        {/* Language Section */}
        <div className="bg-card p-6 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">Language Preferences</h2>
          <p className="text-muted-foreground mb-4">
            Choose your preferred language for the interface.
          </p>

          {/* Language Switcher - Default Variant */}
          <LanguageSwitcher variant="default" />
        </div>

        {/* Theme Section */}
        <div className="bg-card p-6 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">Theme</h2>
          <p className="text-muted-foreground mb-4">
            Choose your preferred theme.
          </p>
          {/* Theme Toggle */}
        </div>

        {/* Other settings... */}
      </div>
    </div>
  );
}

// ============================================================================
// EJEMPLO 5: Mobile Menu
// ============================================================================

export function MobileMenu() {
  return (
    <div className="fixed inset-0 bg-background z-50 lg:hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-bold">Menu</h2>
        <button>✕</button>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 space-y-2">
        <a href="/dashboard" className="block p-3 rounded-lg hover:bg-accent">
          Dashboard
        </a>
        <a href="/agents" className="block p-3 rounded-lg hover:bg-accent">
          My Agents
        </a>
        <a href="/community" className="block p-3 rounded-lg hover:bg-accent">
          Community
        </a>
      </nav>

      {/* Footer with controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Settings</span>
          <div className="flex items-center gap-2">
            {/* Language Switcher - Compact */}
            <LanguageSwitcher variant="compact" />

            {/* Theme Toggle */}
            <button className="h-9 w-9 rounded-lg">🌙</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EJEMPLO 6: Custom Styling
// ============================================================================

export function CustomStyledLanguageSwitcher() {
  return (
    <div className="flex flex-col gap-4">
      {/* Con margen personalizado */}
      <LanguageSwitcher variant="compact" className="ml-auto" />

      {/* Con ancho completo */}
      <div className="w-full">
        <LanguageSwitcher variant="default" className="w-full" />
      </div>

      {/* Centrado */}
      <div className="flex justify-center">
        <LanguageSwitcher variant="default" />
      </div>

      {/* En un grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">{/* Otro contenido */}</div>
        <div className="flex justify-end">
          <LanguageSwitcher variant="compact" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EJEMPLO 7: Con otros controles
// ============================================================================

export function ControlsBar() {
  return (
    <div className="flex items-center gap-2 p-4 bg-card rounded-xl border">
      {/* Search */}
      <input
        type="search"
        placeholder="Search..."
        className="flex-1 px-4 py-2 rounded-lg bg-background"
      />

      {/* Filters */}
      <button className="px-4 py-2 rounded-lg bg-background">Filters</button>

      {/* Sort */}
      <button className="px-4 py-2 rounded-lg bg-background">Sort</button>

      {/* Divider */}
      <div className="w-px h-6 bg-border" />

      {/* Language */}
      <LanguageSwitcher variant="compact" />

      {/* Theme */}
      <button className="h-9 w-9 rounded-lg bg-background">🌙</button>
    </div>
  );
}

// ============================================================================
// EJEMPLO 8: Responsive Layout
// ============================================================================

export function ResponsiveHeader() {
  return (
    <header className="flex items-center justify-between p-4">
      {/* Logo */}
      <div className="flex items-center gap-2">Logo</div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-6">
        <a href="/features">Features</a>
        <a href="/pricing">Pricing</a>
        <a href="/docs">Docs</a>
      </nav>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Language - Always visible */}
        <LanguageSwitcher variant="compact" />

        {/* Theme - Hidden on small mobile */}
        <button className="hidden sm:flex h-9 w-9 rounded-lg">🌙</button>

        {/* User Menu - Hidden on mobile, show hamburger */}
        <button className="lg:hidden h-9 w-9">☰</button>
        <button className="hidden lg:flex h-9 w-9 rounded-full bg-primary">
          👤
        </button>
      </div>
    </header>
  );
}

// ============================================================================
// EJEMPLO 9: Authentication Layout
// ============================================================================

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary">AI</div>
          <span className="font-bold">Creator</span>
        </div>

        {/* Language & Theme in auth pages */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="compact" />
          <button className="h-9 w-9 rounded-lg">🌙</button>
        </div>
      </header>

      {/* Auth Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-4 border-t text-center text-sm text-muted-foreground">
        © 2025 AI Creator. All rights reserved.
      </footer>
    </div>
  );
}

// ============================================================================
// EJEMPLO 10: Admin Panel
// ============================================================================

export function AdminSidebar() {
  return (
    <aside className="w-64 h-screen border-r bg-card/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-bold">Admin Panel</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <a href="/admin/users" className="block p-3 rounded-lg hover:bg-accent">
          Users
        </a>
        <a href="/admin/agents" className="block p-3 rounded-lg hover:bg-accent">
          Agents
        </a>
        <a href="/admin/analytics" className="block p-3 rounded-lg hover:bg-accent">
          Analytics
        </a>
      </nav>

      {/* Footer with controls */}
      <div className="p-4 border-t space-y-4">
        {/* Settings Row */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium flex-1">Interface</span>
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="compact" />
            <button className="h-9 w-9 rounded-lg">🌙</button>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary">👤</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">Admin User</div>
            <div className="text-xs text-muted-foreground">admin@example.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ============================================================================
// NOTAS DE IMPLEMENTACIÓN
// ============================================================================

/*
TIPS IMPORTANTES:

1. Usa "compact" para espacios reducidos (navbars, headers, controles)
2. Usa "default" para espacios amplios (settings, footers, sidebars)
3. El componente detecta automáticamente el idioma actual
4. Los cambios se guardan en cookie por 1 año
5. La URL se actualiza automáticamente con el locale
6. Compatible con dark mode out of the box
7. Responsive y mobile-friendly
8. Accesible (ARIA labels, keyboard navigation)
9. Animaciones suaves con Framer Motion
10. TypeScript type-safe

UBICACIONES YA INTEGRADAS:
- ✅ Dashboard Sidebar (/components/dashboard-nav.tsx)
- ✅ Landing Header (/app/(landing)/layout.tsx)
- ✅ Landing Footer (/app/(landing)/layout.tsx)

PRÓXIMOS PASOS:
1. Considera agregar más idiomas en /i18n/config.ts
2. Configura next-intl para traducciones completas
3. Añade el selector en más páginas si es necesario
4. Trackea cambios de idioma en analytics
*/
