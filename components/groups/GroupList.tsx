"use client";

import { useState, useEffect } from "react";
import { GroupCard } from "./GroupCard";
import { Search, Plus, Loader2 } from "lucide-react";
import Link from "next/link";

interface GroupListProps {
  initialGroups?: any[];
}

export function GroupList({ initialGroups = [] }: GroupListProps) {
  const [groups, setGroups] = useState(initialGroups);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load groups on mount if not provided
  useEffect(() => {
    if (initialGroups.length === 0) {
      loadGroups();
    }
  }, []);

  const loadGroups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/groups");
      if (!response.ok) {
        throw new Error("Error al cargar grupos");
      }
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (err) {
      console.error("Error loading groups:", err);
      setError("No se pudieron cargar los grupos");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter groups by search query
  const filteredGroups = groups.filter((group) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      group.name.toLowerCase().includes(query) ||
      group.description?.toLowerCase().includes(query)
    );
  });

  // Sort groups: unread first, then by last activity
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    // Unread first
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1;

    // Then by last activity
    return (
      new Date(b.lastActivityAt).getTime() -
      new Date(a.lastActivityAt).getTime()
    );
  });

  if (isLoading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-destructive mb-4">{error}</p>
        <button
          onClick={loadGroups}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Mis Grupos</h2>
        <Link
          href="/dashboard/grupos/crear"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Grupo</span>
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar grupos..."
          className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Groups list */}
      {sortedGroups.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border">
          {searchQuery ? (
            <>
              <p className="text-muted-foreground mb-2">
                No se encontraron grupos con "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm text-primary hover:underline"
              >
                Limpiar búsqueda
              </button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">
                No tienes grupos todavía
              </p>
              <Link
                href="/dashboard/grupos/crear"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Crear tu primer grupo</span>
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {sortedGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}

      {/* Stats */}
      {groups.length > 0 && (
        <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
          {filteredGroups.length !== groups.length
            ? `Mostrando ${filteredGroups.length} de ${groups.length} grupos`
            : `${groups.length} ${groups.length === 1 ? "grupo" : "grupos"} total${groups.length === 1 ? "" : "es"}`}
        </div>
      )}
    </div>
  );
}
