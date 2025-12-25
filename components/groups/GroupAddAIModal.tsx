"use client";

import { useState, useEffect } from "react";
import { X, Bot, Search, Loader2, Plus, Sparkles } from "lucide-react";

interface GroupAddAIModalProps {
  groupId: string;
  groupName: string;
  isOpen: boolean;
  onClose: () => void;
  onAIAdded?: () => void;
}

export function GroupAddAIModal({
  groupId,
  groupName,
  isOpen,
  onClose,
  onAIAdded,
}: GroupAddAIModalProps) {
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [importanceLevel, setImportanceLevel] = useState<"main" | "secondary" | "filler">("secondary");

  useEffect(() => {
    if (isOpen) {
      loadAgents();
    }
  }, [isOpen]);

  const loadAgents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get user's agents
      const response = await fetch("/api/agents");
      if (!response.ok) {
        throw new Error("Error al cargar agentes");
      }
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAI = async (agentId: string) => {
    setIsAdding(agentId);
    setError(null);
    try {
      const response = await fetch(`/api/groups/${groupId}/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          importanceLevel,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al añadir IA");
      }

      // Success
      if (onAIAdded) {
        onAIAdded();
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAdding(null);
    }
  };

  const filteredAgents = agents.filter((agent) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return agent.name.toLowerCase().includes(query);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-lg shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
              <Bot className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Añadir IA al Grupo</h2>
              <p className="text-sm text-muted-foreground">{groupName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar IAs..."
              className="w-full pl-10 pr-4 py-3 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Importance level selector */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Nivel de importancia narrativa
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "main", label: "Principal", desc: "Rol central" },
                { value: "secondary", label: "Secundario", desc: "Rol importante" },
                { value: "filler", label: "Apoyo", desc: "Rol menor" },
              ].map((level) => (
                <button
                  key={level.value}
                  onClick={() => setImportanceLevel(level.value as any)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    importanceLevel === level.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium text-sm">{level.label}</div>
                  <div className="text-xs text-muted-foreground">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Agents list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery ? "No se encontraron IAs" : "No tienes IAs disponibles"}
              </p>
              {!searchQuery && (
                <a
                  href="/dashboard/agentes/crear"
                  className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Crear una IA
                </a>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-all bg-gradient-to-r from-transparent to-purple-500/5"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {agent.avatar ? (
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-purple-500" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{agent.name}</h3>
                      <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-semibold rounded">
                        IA
                      </span>
                    </div>
                    {agent.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {agent.description}
                      </p>
                    )}
                    {agent.personalityCore && (
                      <div className="flex items-center gap-2 mt-1">
                        <Sparkles className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {agent.personalityCore.traits?.slice(0, 3).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Add button */}
                  <button
                    onClick={() => handleAddAI(agent.id)}
                    disabled={isAdding === agent.id}
                    className="flex-shrink-0 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {isAdding === agent.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Añadiendo...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Añadir</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
