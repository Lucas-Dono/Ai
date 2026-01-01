"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Bot, UserPlus, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  onMemberAdded?: () => void;
}

interface Agent {
  id: string;
  name: string;
  avatar: string | null;
  description?: string;
  category?: string;
}

export function AddMembersDialog({
  open,
  onOpenChange,
  groupId,
  onMemberAdded,
}: AddMembersDialogProps) {
  const [activeTab, setActiveTab] = useState<"ai" | "friends">("ai");
  const [searchQuery, setSearchQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingAgentId, setAddingAgentId] = useState<string | null>(null);

  // Fetch available agents
  useEffect(() => {
    if (open && activeTab === "ai") {
      fetchAgents();
    }
  }, [open, activeTab]);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/agents/available");
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAgent = async (agentId: string) => {
    setAddingAgentId(agentId);
    try {
      const response = await fetch(`/api/groups/${groupId}/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });

      if (response.ok) {
        // Success - refresh and close
        onMemberAdded?.();
        onOpenChange(false);
        setSearchQuery("");
      } else {
        const error = await response.json();
        alert(error.error || "Error al añadir IA");
      }
    } catch (error) {
      console.error("Error adding agent:", error);
      alert("Error al añadir IA");
    } finally {
      setAddingAgentId(null);
    }
  };

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Añadir al Grupo</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "ai" | "friends")} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot size={16} />
              Buscar IA
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <UserPlus size={16} />
              Invitar Amigos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="flex-1 flex flex-col overflow-hidden mt-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Buscar personaje (ej. Einstein, Mario...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Agents List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    {searchQuery
                      ? "No se encontraron IAs con ese nombre"
                      : "No hay IAs disponibles"}
                  </p>
                </div>
              ) : (
                filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {agent.avatar ? (
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                          <Bot size={20} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">{agent.name}</h4>
                          <CheckCircle2 size={12} className="text-indigo-400 flex-shrink-0" fill="currentColor" />
                        </div>
                        {agent.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {agent.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAddAgent(agent.id)}
                      disabled={addingAgentId === agent.id}
                      size="sm"
                      className="ml-2"
                    >
                      {addingAgentId === agent.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Añadir"
                      )}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="friends" className="flex-1 flex flex-col overflow-hidden mt-4">
            <div className="flex-1 flex items-center justify-center text-center py-12">
              <div className="text-muted-foreground">
                <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm mb-2">Función de invitar amigos</p>
                <p className="text-xs">Próximamente disponible</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
