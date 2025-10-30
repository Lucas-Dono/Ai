"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Sliders,
  Users,
  Settings as SettingsIcon,
  Calendar,
  Globe,
  Save,
  Plus,
  X,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { AgentSelector } from "@/components/worlds/AgentSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Event {
  id: string;
  name: string;
  description: string;
  triggerType: "automatic" | "manual" | "progress";
  requiredProgress?: number;
}

export default function AdvancedWorldCreatorPage() {
  const router = useRouter();

  // Basic Info
  const [worldName, setWorldName] = useState("");
  const [description, setDescription] = useState("");
  const [scenario, setScenario] = useState("");

  // Format & Settings
  const [format, setFormat] = useState<"chat" | "visual_novel">("chat");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [autoMode, setAutoMode] = useState(false);
  const [turnsPerCycle, setTurnsPerCycle] = useState(3);

  // Agents
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

  // Events (for visual novels)
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);

  // Story Script (for visual novels)
  const [storyTitle, setStoryTitle] = useState("");
  const [storyGenre, setStoryGenre] = useState("");
  const [totalActs, setTotalActs] = useState(3);

  // Loading & Errors
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddEvent = () => {
    const newEvent: Event = {
      id: `event-${Date.now()}`,
      name: "",
      description: "",
      triggerType: "automatic",
      requiredProgress: 0.5,
    };
    setEvents([...events, newEvent]);
    setShowEventForm(true);
  };

  const handleRemoveEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const handleUpdateEvent = (id: string, field: keyof Event, value: any) => {
    setEvents(
      events.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      )
    );
  };

  const handleCreate = async () => {
    if (!worldName.trim()) {
      setError("Por favor ingresa un nombre para tu mundo");
      return;
    }

    if (selectedAgentIds.length === 0) {
      setError("Por favor selecciona al menos un agente");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/worlds/create-advanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: worldName,
          description,
          scenario,
          format,
          visibility,
          autoMode,
          turnsPerCycle,
          agentIds: selectedAgentIds,
          events: format === "visual_novel" ? events.filter((e) => e.name.trim()) : [],
          storyScript:
            format === "visual_novel"
              ? {
                  title: storyTitle || worldName,
                  genre: storyGenre || "General",
                  totalActs,
                }
              : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear mundo");
      }

      const result = await response.json();

      if (result.success) {
        router.push(`/dashboard/mundos/${result.worldId}`);
      } else {
        throw new Error(result.error || "Error al crear mundo");
      }
    } catch (err) {
      console.error("Error creating world:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/dashboard/mundos/crear">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cambiar modo
          </Button>
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sliders className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold md-text-primary">Modo Avanzado</h1>
            <p className="text-lg md-text-secondary">
              Control total sobre cada aspecto de tu mundo
            </p>
          </div>
        </div>

        <Alert className="border-purple-500/30 bg-purple-500/5">
          <AlertCircle className="h-4 w-4 text-purple-500" />
          <AlertDescription className="text-purple-700 dark:text-purple-400">
            En modo avanzado, tú configuras todo manualmente. No hay asistencia de IA.
          </AlertDescription>
        </Alert>
      </div>

      {/* Form */}
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="basic">
              <Globe className="h-4 w-4 mr-2" />
              Básico
            </TabsTrigger>
            <TabsTrigger value="agents">
              <Users className="h-4 w-4 mr-2" />
              Agentes
            </TabsTrigger>
            <TabsTrigger value="events" disabled={format !== "visual_novel"}>
              <Calendar className="h-4 w-4 mr-2" />
              Eventos
            </TabsTrigger>
            <TabsTrigger value="settings">
              <SettingsIcon className="h-4 w-4 mr-2" />
              Config
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: BÁSICO */}
          <TabsContent value="basic" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Información Básica</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del mundo *</Label>
                  <Input
                    id="name"
                    value={worldName}
                    onChange={(e) => setWorldName(e.target.value)}
                    placeholder="Ej: Academia Mágica de Sakura"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción corta *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Una breve descripción que aparecerá en la lista de mundos..."
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs md-text-secondary">
                    {description.length}/200 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scenario">Escenario detallado *</Label>
                  <Textarea
                    id="scenario"
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="Describe el escenario completo: ambiente, época, ubicación, atmósfera, reglas del mundo, etc. Sé específico, esto define todo el contexto."
                    rows={8}
                    maxLength={2000}
                  />
                  <p className="text-xs md-text-secondary">
                    {scenario.length}/2000 caracteres
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Formato del mundo</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={format === "chat" ? "default" : "outline"}
                      onClick={() => setFormat("chat")}
                      className="h-28 flex-col"
                      type="button"
                    >
                      <span className="text-2xl mb-1">💬</span>
                      <span>Chat Interactivo</span>
                      <span className="text-xs opacity-70">Conversaciones libres</span>
                    </Button>
                    <Button
                      variant={format === "visual_novel" ? "default" : "outline"}
                      onClick={() => setFormat("visual_novel")}
                      className="h-28 flex-col"
                      type="button"
                    >
                      <span className="text-2xl mb-1">🎭</span>
                      <span>Novela Visual</span>
                      <span className="text-xs opacity-70">Con eventos y arcos</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 2: AGENTES */}
          <TabsContent value="agents" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">
                Selecciona los Agentes ({selectedAgentIds.length})
              </h2>
              <p className="text-sm md-text-secondary mb-4">
                Elige qué agentes participarán en este mundo. Puedes seleccionar tus
                propios agentes o agentes públicos.
              </p>

              <AgentSelector
                selectedAgentIds={selectedAgentIds}
                onSelectionChange={setSelectedAgentIds}
              />
            </Card>
          </TabsContent>

          {/* TAB 3: EVENTOS (Solo Visual Novel) */}
          <TabsContent value="events" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Eventos de Historia</h2>
                  <p className="text-sm md-text-secondary">
                    Define eventos que sucederán durante la novela visual
                  </p>
                </div>
                <Button onClick={handleAddEvent} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Evento
                </Button>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="md-text-secondary">
                    No hay eventos configurados aún
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleAddEvent}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Evento
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event, idx) => (
                    <Card key={event.id} className="p-4 relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemoveEvent(event.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      <div className="space-y-3 pr-8">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Evento {idx + 1}</Badge>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`event-name-${event.id}`}>
                            Nombre del evento
                          </Label>
                          <Input
                            id={`event-name-${event.id}`}
                            value={event.name}
                            onChange={(e) =>
                              handleUpdateEvent(event.id, "name", e.target.value)
                            }
                            placeholder="Ej: Primera clase de magia"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`event-desc-${event.id}`}>
                            Descripción
                          </Label>
                          <Textarea
                            id={`event-desc-${event.id}`}
                            value={event.description}
                            onChange={(e) =>
                              handleUpdateEvent(
                                event.id,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="¿Qué sucede en este evento?"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Tipo de activación</Label>
                            <Select
                              value={event.triggerType}
                              onValueChange={(value: any) =>
                                handleUpdateEvent(event.id, "triggerType", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="automatic">
                                  Automático
                                </SelectItem>
                                <SelectItem value="progress">
                                  Por progreso
                                </SelectItem>
                                <SelectItem value="manual">Manual</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {event.triggerType === "progress" && (
                            <div className="space-y-2">
                              <Label>Progreso requerido (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={(event.requiredProgress || 0) * 100}
                                onChange={(e) =>
                                  handleUpdateEvent(
                                    event.id,
                                    "requiredProgress",
                                    parseInt(e.target.value) / 100
                                  )
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>

            {/* Story Script */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Configuración de Historia</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="story-title">Título de la historia</Label>
                  <Input
                    id="story-title"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    placeholder="Deja vacío para usar el nombre del mundo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story-genre">Género</Label>
                  <Input
                    id="story-genre"
                    value={storyGenre}
                    onChange={(e) => setStoryGenre(e.target.value)}
                    placeholder="Ej: Fantasía, Romance, Misterio"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total-acts">Número de actos</Label>
                  <Input
                    id="total-acts"
                    type="number"
                    min="1"
                    max="10"
                    value={totalActs}
                    onChange={(e) => setTotalActs(parseInt(e.target.value) || 3)}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: CONFIGURACIÓN */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Configuración Avanzada</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Visibilidad</Label>
                    <p className="text-sm md-text-secondary">
                      Controla quién puede ver este mundo
                    </p>
                  </div>
                  <Select value={visibility} onValueChange={(v: any) => setVisibility(v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">🔒 Privado</SelectItem>
                      <SelectItem value="public">🌍 Público</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo automático</Label>
                    <p className="text-sm md-text-secondary">
                      Los agentes interactúan automáticamente sin tu intervención
                    </p>
                  </div>
                  <Switch checked={autoMode} onCheckedChange={setAutoMode} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="turns">Turnos por ciclo</Label>
                  <p className="text-sm md-text-secondary mb-2">
                    Cuántos mensajes se generan en cada ciclo automático
                  </p>
                  <Input
                    id="turns"
                    type="number"
                    min="1"
                    max="10"
                    value={turnsPerCycle}
                    onChange={(e) => setTurnsPerCycle(parseInt(e.target.value) || 3)}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end mt-8">
          <Link href="/dashboard/mundos">
            <Button variant="outline" disabled={creating}>
              Cancelar
            </Button>
          </Link>
          <Button
            onClick={handleCreate}
            disabled={creating || !worldName.trim() || selectedAgentIds.length === 0}
            className="md-button md-button-filled px-8"
          >
            {creating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Crear Mundo
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
