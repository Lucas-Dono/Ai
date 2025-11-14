"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Sparkles,
  Heart,
  Brain,
  Globe,
  Lightbulb,
  Home,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

interface DocLink {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface DocSection {
  title: string;
  links: DocLink[];
}

const docsSections: DocSection[] = [
  {
    title: "Inicio",
    links: [
      {
        title: "Documentación",
        href: "/docs",
        icon: Home,
      },
      {
        title: "Guía Rápida",
        href: "/docs/getting-started",
        icon: BookOpen,
      },
    ],
  },
  {
    title: "Conceptos Básicos",
    links: [
      {
        title: "Creación de Personajes",
        href: "/docs/character-creation",
        icon: Sparkles,
      },
      {
        title: "Memoria y Relaciones",
        href: "/docs/memory-relationships",
        icon: Heart,
      },
    ],
  },
  {
    title: "Funcionalidades",
    links: [
      {
        title: "Comportamientos",
        href: "/docs/behaviors",
        icon: Brain,
        badge: "13 tipos",
      },
      {
        title: "Mundos",
        href: "/docs/worlds",
        icon: Globe,
        badge: "Pro",
      },
    ],
  },
  {
    title: "Guías Avanzadas",
    links: [
      {
        title: "Mejores Prácticas",
        href: "/docs/best-practices",
        icon: Lightbulb,
      },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold">Documentación</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Aprende a usar Circuit Prompt
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-8">
          {docsSections.map((section) => (
            <div key={section.title}>
              <h3 className="px-2 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-2xl text-sm transition-all",
                        "hover:bg-muted/50",
                        isActive
                          ? "bg-muted text-foreground font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 flex-shrink-0",
                        isActive && "text-foreground"
                      )} />
                      <span className="flex-1">{link.title}</span>
                      {link.badge && (
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full",
                          isActive
                            ? "bg-foreground/10 text-foreground"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {link.badge}
                        </span>
                      )}
                      {isActive && (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <p className="mb-2">¿Necesitas ayuda?</p>
          <Link
            href="/support"
            className="text-foreground hover:underline font-medium"
          >
            Contacta soporte →
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-2xl bg-background border border-border shadow-lg"
        aria-label="Toggle documentation menu"
      >
        {isMobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-64 border-r border-border bg-background h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 z-40 w-64 h-screen bg-background border-r border-border transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
