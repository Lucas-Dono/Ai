"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, User } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  personality?: string;
  description?: string;
  avatar?: string | null;
  referenceImageUrl?: string | null;
}

interface AgentSelectorProps {
  selectedAgentIds: string[];
  onSelectionChange: (agentIds: string[]) => void;
  maxSelection?: number;
}

export function AgentSelector({
  selectedAgentIds,
  onSelectionChange,
  maxSelection,
}: AgentSelectorProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch("/api/agents");
        if (res.ok) {
          const data = await res.json();
          // La API devuelve el array directamente, no un objeto con propiedad agents
          const agentsList = Array.isArray(data) ? data : (data.agents || []);
          console.log("[AgentSelector] Agentes encontrados:", agentsList.length);

          // Ordenar: primero agentes del usuario, luego destacados, luego públicos
          const sortedAgents = agentsList.sort((a: any, b: any) => {
            // Verificar si tienen userId (los del usuario tienen userId)
            const aIsUser = !!a.userId;
            const bIsUser = !!b.userId;

            // Si ambos son del usuario o ambos no lo son, mantener orden
            if (aIsUser && bIsUser) return 0;
            if (!aIsUser && !bIsUser) {
              // Entre públicos, priorizar destacados
              const aIsFeatured = a.isFeatured || false;
              const bIsFeatured = b.isFeatured || false;
              if (aIsFeatured && !bIsFeatured) return -1;
              if (!aIsFeatured && bIsFeatured) return 1;
              return 0;
            }

            // Los del usuario van primero
            if (aIsUser) return -1;
            if (bIsUser) return 1;

            return 0;
          });

          setAgents(sortedAgents);
        } else {
          console.error("[AgentSelector] Error response:", await res.text());
        }
      } catch (error) {
        console.error("[AgentSelector] Error fetching agents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const handleToggle = (agentId: string) => {
    const isSelected = selectedAgentIds.includes(agentId);

    if (isSelected) {
      // Deseleccionar
      onSelectionChange(selectedAgentIds.filter((id) => id !== agentId));
    } else {
      // Seleccionar (respetando el máximo si existe)
      if (maxSelection && selectedAgentIds.length >= maxSelection) {
        return; // No permitir más selecciones
      }
      onSelectionChange([...selectedAgentIds, agentId]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Cargando tus personajes...
        </span>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <Card className="p-6 text-center">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm md-text-secondary mb-2">
          No tienes personajes creados aún
        </p>
        <p className="text-xs text-muted-foreground">
          Crea tu primer personaje en el Constructor
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>
          Selecciona personajes ({selectedAgentIds.length}
          {maxSelection ? `/${maxSelection}` : ""})
        </Label>
        {maxSelection && selectedAgentIds.length >= maxSelection && (
          <Badge variant="secondary" className="text-xs">
            Máximo alcanzado
          </Badge>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => {
          const isSelected = selectedAgentIds.includes(agent.id);
          const isDisabled =
            maxSelection &&
            selectedAgentIds.length >= maxSelection &&
            !isSelected;

          return (
            <Card
              key={agent.id}
              className={`p-4 cursor-pointer transition-all ${
                isSelected
                  ? "border-primary border-2 bg-primary/5"
                  : isDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-primary/50"
              }`}
              onClick={() => !isDisabled && handleToggle(agent.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={isSelected}
                  disabled={isDisabled}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {agent.avatar || agent.referenceImageUrl ? (
                      <img
                        src={agent.avatar || agent.referenceImageUrl || ''}
                        alt={agent.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                        {agent.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-semibold text-sm truncate">
                      {agent.name}
                    </span>
                  </div>
                  {(agent.personality || agent.description) && (
                    <p className="text-xs md-text-secondary line-clamp-2">
                      {agent.personality || agent.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
