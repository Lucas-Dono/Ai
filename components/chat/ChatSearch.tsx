"use client";

/**
 * Chat Search Component
 *
 * Búsqueda avanzada en el historial de chat:
 * - Buscar por texto
 * - Filtrar por fecha
 * - Filtrar por emisor (usuario/agente)
 * - Navegación entre resultados
 */

import { useState, useEffect } from "react";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Message } from "./WhatsAppChat";

interface ChatSearchProps {
  messages: Message[];
  onResultSelect: (messageId: string) => void;
  onClose: () => void;
}

export function ChatSearch({
  messages,
  onResultSelect,
  onClose,
}: ChatSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Message[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [filterSender, setFilterSender] = useState<"all" | "user" | "agent">(
    "all"
  );

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setCurrentResultIndex(0);
      return;
    }

    const filtered = messages.filter((msg) => {
      // Filtrar por texto
      const matchesText = msg.content.text
        ?.toLowerCase()
        .includes(query.toLowerCase());

      // Filtrar por emisor
      const matchesSender =
        filterSender === "all" || msg.type === filterSender;

      return matchesText && matchesSender;
    });

    setResults(filtered);
    setCurrentResultIndex(0);
  }, [query, messages, filterSender]);

  const goToNext = () => {
    if (results.length === 0) return;
    const nextIndex = (currentResultIndex + 1) % results.length;
    setCurrentResultIndex(nextIndex);
    onResultSelect(results[nextIndex].id);
  };

  const goToPrevious = () => {
    if (results.length === 0) return;
    const prevIndex =
      currentResultIndex === 0 ? results.length - 1 : currentResultIndex - 1;
    setCurrentResultIndex(prevIndex);
    onResultSelect(results[prevIndex].id);
  };

  return (
    <div className="bg-[#1f1f1f] border-b border-[#2a2a2a] px-4 py-2 space-y-2">
      {/* Barra de búsqueda principal */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#2a2a2a] rounded-2xl px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en la conversación..."
            className="flex-1 bg-transparent text-white placeholder:text-gray-500 outline-none text-sm"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navegación de resultados */}
        {results.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>
              {currentResultIndex + 1} / {results.length}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Botón cerrar */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterSender("all")}
          className={cn(
            "px-3 py-1 rounded-full text-xs transition-colors",
            filterSender === "all"
              ? "bg-green-600 text-white"
              : "bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]"
          )}
        >
          Todos
        </button>
        <button
          onClick={() => setFilterSender("user")}
          className={cn(
            "px-3 py-1 rounded-full text-xs transition-colors",
            filterSender === "user"
              ? "bg-green-600 text-white"
              : "bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]"
          )}
        >
          Mis mensajes
        </button>
        <button
          onClick={() => setFilterSender("agent")}
          className={cn(
            "px-3 py-1 rounded-full text-xs transition-colors",
            filterSender === "agent"
              ? "bg-green-600 text-white"
              : "bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]"
          )}
        >
          Mensajes del agente
        </button>
      </div>

      {/* Resultados */}
      {query && results.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-2">
          No se encontraron resultados
        </p>
      )}
    </div>
  );
}
