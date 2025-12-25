"use client";

import { useState } from "react";
import { Search, X, Loader2, MessageCircle, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface GroupMessageSearchProps {
  groupId: string;
  onMessageClick?: (messageId: string) => void;
}

export function GroupMessageSearch({
  groupId,
  onMessageClick,
}: GroupMessageSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length < 3) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/groups/${groupId}/messages/search?q=${encodeURIComponent(
          searchQuery
        )}`
      );

      if (!response.ok) {
        throw new Error("Error al buscar mensajes");
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);

    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-muted rounded-lg transition-colors"
        title="Buscar mensajes"
      >
        <Search className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="absolute inset-0 z-20 bg-background">
      {/* Search header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button
          onClick={() => {
            setIsOpen(false);
            setQuery("");
            setResults([]);
          }}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Buscar en mensajes..."
            className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            autoFocus
          />
        </div>
      </div>

      {/* Results */}
      <div className="overflow-y-auto h-[calc(100%-73px)]">
        {isSearching && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="p-4 text-center text-destructive">{error}</div>
        )}

        {!isSearching && !error && query.length >= 3 && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground opacity-50 mb-3" />
            <p className="text-muted-foreground">
              No se encontraron mensajes con "{query}"
            </p>
          </div>
        )}

        {!isSearching && !error && query.length < 3 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground opacity-50 mb-3" />
            <p className="text-muted-foreground">
              Escribe al menos 3 caracteres para buscar
            </p>
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <div className="divide-y divide-border">
            {results.map((result) => {
              const authorName =
                result.authorType === "user"
                  ? result.user?.name
                  : result.agent?.name;

              return (
                <button
                  key={result.id}
                  onClick={() => {
                    if (onMessageClick) {
                      onMessageClick(result.id);
                    }
                    setIsOpen(false);
                  }}
                  className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Author info */}
                    <div className="flex-shrink-0">
                      {result.authorType === "agent" ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-purple-500" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Message content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {authorName || "Usuario"}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(result.createdAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>

                      {/* Highlight matching text */}
                      <p className="text-sm text-foreground/80 line-clamp-2">
                        {highlightText(result.content, query)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Results count */}
        {!isSearching && results.length > 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground border-t border-border">
            {results.length} {results.length === 1 ? "resultado" : "resultados"}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to highlight matching text
function highlightText(text: string, query: string) {
  if (!query) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
