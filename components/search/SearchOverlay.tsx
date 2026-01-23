"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
}

interface Agent {
  id: string;
  name: string;
  avatar: string | null;
  description: string | null;
  kind: string;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Autofocus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Fetch results
  const fetchResults = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setUsers([]);
      setAgents([]);
      return;
    }

    setIsLoading(true);

    try {
      const [usersRes, agentsRes] = await Promise.all([
        fetch(`/api/explore/users?q=${encodeURIComponent(debouncedQuery)}&limit=5`),
        fetch(`/api/explore/agents?q=${encodeURIComponent(debouncedQuery)}&limit=5`),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      if (agentsRes.ok) {
        const data = await agentsRes.json();
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setDebouncedQuery("");
      setUsers([]);
      setAgents([]);
    }
  }, [isOpen]);

  const handleResultClick = () => {
    onClose();
  };

  const totalResults = users.length + agents.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Overlay Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header con input de búsqueda */}
              <div className="relative border-b border-border">
                <Search className="absolute left-4 top-4 text-muted-foreground w-5 h-5" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Buscar usuarios o IAs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                />
                {/* Botón de cierre */}
                <button
                  onClick={onClose}
                  className="absolute right-2 top-2 p-2 hover:bg-accent rounded-lg transition-colors"
                  aria-label="Cerrar búsqueda"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {isLoading && debouncedQuery ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : !debouncedQuery ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    Comienza a escribir para buscar...
                  </div>
                ) : totalResults === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground mb-2">No se encontraron resultados</p>
                    <p className="text-sm text-muted-foreground/70">
                      Intenta con otro término de búsqueda
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {/* Users */}
                    {users.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                          Usuarios
                        </div>
                        {users.map((user) => (
                          <Link
                            key={user.id}
                            href={`/profile/${user.id}`}
                            onClick={handleResultClick}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                          >
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={user.image || undefined} alt={user.name || "Usuario"} />
                              <AvatarFallback className="bg-primary/20 text-primary">
                                <User className="w-5 h-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {user.name || user.email.split("@")[0]}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Agents */}
                    {agents.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                          Inteligencias Artificiales
                        </div>
                        {agents.map((agent) => (
                          <Link
                            key={agent.id}
                            href={`/agentes/${agent.id}`}
                            onClick={handleResultClick}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                          >
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={agent.avatar || undefined} alt={agent.name} />
                              <AvatarFallback className="bg-primary/20 text-primary">
                                <Bot className="w-5 h-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm truncate">{agent.name}</p>
                                {agent.kind === "companion" && (
                                  <span className="text-xs px-1.5 py-0.5 bg-pink-500/20 text-pink-400 rounded-full">
                                    Companion
                                  </span>
                                )}
                              </div>
                              {agent.description && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {agent.description}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Ver más en Explorar */}
                    {totalResults > 0 && (
                      <div className="border-t border-border mt-2">
                        <Link
                          href={`/explore?q=${encodeURIComponent(debouncedQuery)}`}
                          onClick={handleResultClick}
                          className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-primary hover:bg-accent transition-colors font-medium"
                        >
                          Ver todos los resultados en Explorar
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
