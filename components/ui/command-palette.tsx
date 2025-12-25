/**
 * Command Palette - FASE 4: DELIGHT & POLISH
 *
 * Sistema de navegación rápida inspirado en VS Code, Raycast y Linear
 *
 * Características:
 * - Búsqueda fuzzy de comandos
 * - Navegación por teclado (↑↓ Enter Esc)
 * - Shortcuts personalizados
 * - Categorías organizadas
 * - Acciones rápidas
 * - Analytics tracking integrado
 * - Accesibilidad completa (ARIA)
 */

"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { trackEvent, EventType } from "@/lib/analytics/kpi-tracker";
import {
  Search,
  Home,
  MessageSquare,
  Users,
  Settings,
  CreditCard,
  Sparkles,
  Network,
  BarChart3,
  HelpCircle,
  LogOut,
  Plus,
  Globe,
  Activity,
  Book,
  Heart,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Definición de un comando
 */
interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  category: CommandCategory;
  action: () => void | Promise<void>;
  shortcut?: string[];
  keywords?: string[];
}

/**
 * Categorías de comandos
 */
type CommandCategory =
  | "navigation"
  | "creation"
  | "actions"
  | "settings"
  | "help";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Componente principal del Command Palette
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Track cuando se abre el command palette
  useEffect(() => {
    if (open && session?.user?.id) {
      trackEvent(EventType.COMMAND_PALETTE_OPENED, {
        userId: session.user.id,
      }).catch((error) => {
        console.warn("[CommandPalette] Failed to track open event:", error);
      });
    }
  }, [open, session?.user?.id]);

  /**
   * Definir todos los comandos disponibles
   */
  const allCommands: Command[] = useMemo(
    () => [
      // NAVIGATION
      {
        id: "nav-home",
        label: "Ir a Inicio",
        description: "Dashboard principal",
        icon: Home,
        category: "navigation",
        action: () => {
          router.push("/dashboard");
          onOpenChange(false);
        },
        shortcut: ["g", "h"],
        keywords: ["home", "dashboard", "inicio"],
      },
      {
        id: "nav-groups",
        label: "Ir a Grupos",
        description: "Explorar y crear grupos",
        icon: Network,
        category: "navigation",
        action: () => {
          router.push("/dashboard/grupos");
          onOpenChange(false);
        },
        shortcut: ["g", "w"],
        keywords: ["groups", "grupos"],
      },
      {
        id: "nav-community",
        label: "Ir a Comunidad",
        description: "Ver publicaciones y comunidad",
        icon: Users,
        category: "navigation",
        action: () => {
          router.push("/community");
          onOpenChange(false);
        },
        shortcut: ["g", "c"],
        keywords: ["community", "comunidad", "posts"],
      },
      {
        id: "nav-stats",
        label: "Ir a Mi Progreso",
        description: "Ver estadísticas personales",
        icon: BarChart3,
        category: "navigation",
        action: () => {
          router.push("/dashboard/my-stats");
          onOpenChange(false);
        },
        shortcut: ["g", "s"],
        keywords: ["stats", "progreso", "analytics"],
      },
      {
        id: "nav-billing",
        label: "Ir a Facturación",
        description: "Gestionar planes y pagos",
        icon: CreditCard,
        category: "navigation",
        action: () => {
          router.push("/dashboard/billing");
          onOpenChange(false);
        },
        shortcut: ["g", "b"],
        keywords: ["billing", "facturación", "pago", "planes"],
      },
      {
        id: "nav-settings",
        label: "Ir a Configuración",
        description: "Ajustes de cuenta",
        icon: Settings,
        category: "navigation",
        action: () => {
          router.push("/configuracion");
          onOpenChange(false);
        },
        shortcut: ["g", ","],
        keywords: ["settings", "configuración", "ajustes"],
      },
      {
        id: "nav-kpis",
        label: "Ir a Métricas",
        description: "Dashboard de KPIs y analytics",
        icon: Activity,
        category: "navigation",
        action: () => {
          router.push("/dashboard/kpis");
          onOpenChange(false);
        },
        shortcut: ["g", "k"],
        keywords: ["kpis", "metrics", "métricas", "analytics"],
      },

      // CREATION
      {
        id: "create-agent",
        label: "Crear Nueva IA",
        description: "Abrir constructor de agentes",
        icon: Sparkles,
        category: "creation",
        action: () => {
          router.push("/create-character");
          onOpenChange(false);
        },
        shortcut: ["c", "a"],
        keywords: ["create", "new", "agent", "ai", "crear", "nueva"],
      },
      {
        id: "create-group",
        label: "Crear Nuevo Grupo",
        description: "Crear grupo interactivo",
        icon: Globe,
        category: "creation",
        action: () => {
          router.push("/dashboard/grupos/crear");
          onOpenChange(false);
        },
        shortcut: ["c", "w"],
        keywords: ["create", "group", "grupo", "crear"],
      },
      {
        id: "create-post",
        label: "Crear Publicación",
        description: "Nueva publicación en comunidad",
        icon: MessageSquare,
        category: "creation",
        action: () => {
          router.push("/community/create");
          onOpenChange(false);
        },
        shortcut: ["c", "p"],
        keywords: ["create", "post", "publicación", "crear"],
      },

      // ACTIONS
      {
        id: "action-upgrade",
        label: "Mejorar Plan",
        description: "Ver planes premium",
        icon: Zap,
        category: "actions",
        action: () => {
          router.push("/pricing");
          onOpenChange(false);
        },
        keywords: ["upgrade", "premium", "plus", "ultra", "mejorar"],
      },
      {
        id: "action-favorites",
        label: "Ver Favoritos",
        description: "Tus agentes favoritos",
        icon: Heart,
        category: "actions",
        action: () => {
          router.push("/dashboard?filter=favorites");
          onOpenChange(false);
        },
        keywords: ["favorites", "favoritos", "guardados"],
      },

      // HELP
      {
        id: "help-docs",
        label: "Ver Documentación",
        description: "Guías y ayuda",
        icon: Book,
        category: "help",
        action: () => {
          window.open("https://docs.circuitprompt.ai", "_blank");
          onOpenChange(false);
        },
        keywords: ["help", "docs", "documentation", "ayuda", "guía"],
      },
      {
        id: "help-support",
        label: "Soporte",
        description: "Contactar soporte técnico",
        icon: HelpCircle,
        category: "help",
        action: () => {
          router.push("/support");
          onOpenChange(false);
        },
        keywords: ["help", "support", "soporte", "ayuda", "contacto"],
      },

      // SETTINGS
      {
        id: "action-logout",
        label: "Cerrar Sesión",
        description: "Salir de tu cuenta",
        icon: LogOut,
        category: "settings",
        action: async () => {
          const { signOut } = await import("@/lib/auth-client");
          await signOut();
          router.push("/login");
          onOpenChange(false);
        },
        keywords: ["logout", "sign out", "cerrar sesión", "salir"],
      },
    ],
    [router, onOpenChange]
  );

  /**
   * Filtrar comandos basados en búsqueda
   * Usa fuzzy matching simple
   */
  const filteredCommands = useMemo(() => {
    if (!search) return allCommands;

    const searchLower = search.toLowerCase();

    return allCommands.filter((command) => {
      // Buscar en label
      if (command.label.toLowerCase().includes(searchLower)) return true;

      // Buscar en description
      if (command.description?.toLowerCase().includes(searchLower)) return true;

      // Buscar en keywords
      if (command.keywords?.some((kw) => kw.includes(searchLower))) return true;

      // Buscar en shortcut
      if (command.shortcut?.some((sc) => sc.includes(searchLower))) return true;

      return false;
    });
  }, [search, allCommands]);

  /**
   * Agrupar comandos por categoría
   */
  const groupedCommands = useMemo(() => {
    const groups: Record<CommandCategory, Command[]> = {
      navigation: [],
      creation: [],
      actions: [],
      settings: [],
      help: [],
    };

    filteredCommands.forEach((command) => {
      groups[command.category].push(command);
    });

    return groups;
  }, [filteredCommands]);

  /**
   * Resetear selección cuando cambia el filtro
   */
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  /**
   * Focus automático en el input cuando se abre
   */
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [open]);

  /**
   * Navegación por teclado
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const command = filteredCommands[selectedIndex];
        if (command) {
          command.action();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    },
    [filteredCommands, selectedIndex, onOpenChange]
  );

  /**
   * Labels de categorías
   */
  const categoryLabels: Record<CommandCategory, string> = {
    navigation: "Navegación",
    creation: "Crear",
    actions: "Acciones",
    settings: "Configuración",
    help: "Ayuda",
  };

  /**
   * Calcular índice global a partir de categoría y índice local
   */
  const getGlobalIndex = (category: CommandCategory, localIndex: number): number => {
    let globalIndex = 0;
    const categories: CommandCategory[] = ["navigation", "creation", "actions", "settings", "help"];

    for (const cat of categories) {
      if (cat === category) {
        return globalIndex + localIndex;
      }
      globalIndex += groupedCommands[cat].length;
    }

    return 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl p-0 gap-0 overflow-hidden"
        aria-label="Command Palette"
        role="dialog"
      >
        {/* Header con búsqueda */}
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Buscar comandos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              aria-label="Buscar comandos"
              aria-controls="command-list"
              aria-activedescendant={
                filteredCommands[selectedIndex]
                  ? `command-${filteredCommands[selectedIndex].id}`
                  : undefined
              }
            />
          </div>
        </div>

        {/* Lista de comandos */}
        <div
          id="command-list"
          className="max-h-[400px] overflow-y-auto p-2"
          role="listbox"
          aria-label="Comandos disponibles"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No se encontraron comandos
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {(["navigation", "creation", "actions", "settings", "help"] as CommandCategory[]).map(
                (category) => {
                  const commands = groupedCommands[category];
                  if (commands.length === 0) return null;

                  return (
                    <div key={category} className="mb-4 last:mb-0">
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {categoryLabels[category]}
                      </div>
                      <div className="space-y-1">
                        {commands.map((command, localIndex) => {
                          const globalIndex = getGlobalIndex(category, localIndex);
                          const isSelected = globalIndex === selectedIndex;

                          return (
                            <motion.button
                              key={command.id}
                              id={`command-${command.id}`}
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => command.action()}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-accent"
                              )}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: localIndex * 0.02 }}
                            >
                              <command.icon
                                className={cn(
                                  "h-4 w-4 flex-shrink-0",
                                  isSelected ? "text-primary-foreground" : "text-muted-foreground"
                                )}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">{command.label}</div>
                                {command.description && (
                                  <div
                                    className={cn(
                                      "text-xs truncate",
                                      isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                                    )}
                                  >
                                    {command.description}
                                  </div>
                                )}
                              </div>
                              {command.shortcut && (
                                <div className="flex gap-1">
                                  {command.shortcut.map((key, i) => (
                                    <Badge
                                      key={i}
                                      variant={isSelected ? "secondary" : "outline"}
                                      className="px-1.5 py-0.5 text-[10px] font-mono"
                                    >
                                      {key}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Footer con hints */}
        <div className="border-t border-border px-4 py-2 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">↑↓</kbd> Navegar
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">Enter</kbd> Seleccionar
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">Esc</kbd> Cerrar
            </span>
          </div>
          <span>{filteredCommands.length} comandos</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook para controlar el Command Palette con shortcut global
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) o Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { open, setOpen };
}
