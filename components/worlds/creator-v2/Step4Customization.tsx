"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { getTemplateById, type WorldFormat, type UserTier } from "@/lib/worlds/templates";
import type { AIWorldGeneration } from "@/lib/worlds/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AgentSelector } from "@/components/worlds/AgentSelector";

interface Step4Props {
  format: WorldFormat;
  userTier: UserTier;
  templateId: string;
  onNext: (worldName: string, generation: AIWorldGeneration) => void;
  onBack: () => void;
}

export function Step4Customization({
  format,
  userTier,
  templateId,
  onNext,
  onBack
}: Step4Props) {
  const template = getTemplateById(templateId);

  const [worldName, setWorldName] = useState("");
  const [customization, setCustomization] = useState("");
  const [characterCount, setCharacterCount] = useState(
    template?.suggestedCharacterCount || 4
  );
  const [generating, setGenerating] = useState(false);
  const [aiGeneration, setAiGeneration] = useState<AIWorldGeneration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [useExistingAgents, setUseExistingAgents] = useState(false);

  // Nuevo: modo detallado vs automático
  const [useDetailedMode, setUseDetailedMode] = useState(false);
  const [characterDescriptions, setCharacterDescriptions] = useState<string[]>(
    Array(template?.suggestedCharacterCount || 4).fill("")
  );

  if (!template) {
    return (
      <div className="text-center py-12">
        <p className="text-lg md-text-secondary">Template no encontrado</p>
        <Button onClick={onBack} className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  // Actualizar array de descripciones cuando cambia characterCount
  const handleCharacterCountChange = (newCount: number) => {
    setCharacterCount(newCount);
    setCharacterDescriptions(prev => {
      const newDescriptions = [...prev];
      if (newCount > prev.length) {
        // Agregar campos vacíos
        return [...newDescriptions, ...Array(newCount - prev.length).fill("")];
      } else {
        // Recortar
        return newDescriptions.slice(0, newCount);
      }
    });
  };

  const handleGenerate = async () => {
    if (!worldName.trim()) {
      setError("Por favor ingresa un nombre para tu mundo");
      return;
    }

    // Validar descripciones en modo detallado
    if (useDetailedMode) {
      const filledDescriptions = characterDescriptions.filter(d => d.trim());
      if (filledDescriptions.length === 0) {
        setError("Por favor describe al menos un personaje");
        return;
      }
    }

    setGenerating(true);
    setError(null);

    try {
      const description = customization.trim() || template.aiPromptTemplate.replace(
        '{characterCount}',
        String(characterCount)
      );

      const response = await fetch("/api/worlds/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          templateId: template.id,
          format,
          complexity: template.complexity,
          characterCount,
          // Nuevo: enviar descripciones individuales si están disponibles
          detailedMode: useDetailedMode,
          characterDescriptions: useDetailedMode
            ? characterDescriptions.filter(d => d.trim())
            : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al generar mundo");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Error al generar mundo");
      }

      setAiGeneration(result.data);
    } catch (err) {
      console.error("Error generating world:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setGenerating(false);
    }
  };

  const handleContinue = () => {
    if (useExistingAgents && selectedAgentIds.length > 0 && worldName.trim()) {
      // Usar agentes existentes
      const simpleGeneration: AIWorldGeneration = {
        scenario: customization.trim() || template.description,
        initialContext: `Bienvenido a ${worldName}`,
        suggestedAgents: [],
        existingAgentIds: selectedAgentIds,
      };
      onNext(worldName, simpleGeneration);
    } else if (aiGeneration && worldName.trim()) {
      // Usar generación de IA
      onNext(worldName, aiGeneration);
    }
  };

  const canContinue = worldName.trim() && (
    (useExistingAgents && selectedAgentIds.length > 0) ||
    (!useExistingAgents && aiGeneration)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <Badge variant="outline" className="mb-4">
          Template: {template.name}
        </Badge>
        <h2 className="text-2xl font-bold md-text-primary mb-2">
          Personaliza tu mundo
        </h2>
        <p className="md-text-secondary">
          El template proporciona la base. Añade tus propios detalles.
        </p>
      </div>

      {/* Template Info */}
      <Card className="p-5 max-w-3xl mx-auto bg-muted/30">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-1">Base del Template</h3>
            <p className="text-sm md-text-secondary mb-3">
              {template.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {template.tags.slice(0, 5).map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Form */}
      <Card className="p-6 space-y-6 max-w-3xl mx-auto">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del mundo *</Label>
          <Input
            id="name"
            value={worldName}
            onChange={(e) => setWorldName(e.target.value)}
            placeholder={`Ej: "${template.name} - Mi Versión"`}
            maxLength={100}
          />
          <p className="text-xs md-text-secondary">
            {worldName.length}/100 caracteres
          </p>
        </div>

        {/* Selector de modo */}
        <div className="space-y-3">
          <Label>Personajes del mundo</Label>
          <div className="flex gap-3">
            <Button
              variant={!useExistingAgents ? "default" : "outline"}
              onClick={() => setUseExistingAgents(false)}
              className="flex-1"
              type="button"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generar con IA
            </Button>
            <Button
              variant={useExistingAgents ? "default" : "outline"}
              onClick={() => setUseExistingAgents(true)}
              className="flex-1"
              type="button"
            >
              Usar mis personajes
            </Button>
          </div>
        </div>

        {/* Contenido según modo */}
        {!useExistingAgents ? (
          <>
            {/* Modo IA */}
            <div className="space-y-2">
              <Label htmlFor="customization">
                Descripción del mundo (opcional) 💡
              </Label>
              <Textarea
                id="customization"
                value={customization}
                onChange={(e) => setCustomization(e.target.value)}
                placeholder={`El template ya incluye: "${template.aiPromptTemplate.substring(0, 150)}..."\n\nAñade detalles sobre el escenario, ambiente, trama, etc.`}
                rows={4}
                maxLength={2000}
                className="resize-none"
              />
              <p className="text-xs md-text-secondary">
                {customization.length}/2000 caracteres
              </p>
            </div>

            {/* Selector de modo: Automático vs Detallado */}
            <div className="space-y-3">
              <Label>Creación de personajes</Label>
              <div className="flex gap-3">
                <Button
                  variant={!useDetailedMode ? "default" : "outline"}
                  onClick={() => setUseDetailedMode(false)}
                  className="flex-1"
                  type="button"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Dejar a la suerte
                </Button>
                <Button
                  variant={useDetailedMode ? "default" : "outline"}
                  onClick={() => setUseDetailedMode(true)}
                  className="flex-1"
                  type="button"
                >
                  Describir cada uno
                </Button>
              </div>
              <p className="text-xs md-text-secondary">
                {useDetailedMode
                  ? "Describe cada personaje individualmente para mayor control"
                  : "La IA decidirá los personajes automáticamente basándose en el template"}
              </p>
            </div>

            {!useDetailedMode ? (
              // Modo automático: solo slider
              <div className="space-y-2">
                <Label htmlFor="characterCount">
                  Número de personajes: {characterCount}
                </Label>
                <input
                  type="range"
                  id="characterCount"
                  min="1"
                  max="15"
                  value={characterCount}
                  onChange={(e) => handleCharacterCountChange(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs md-text-secondary">
                  <span>1 (mínimo)</span>
                  <span className="text-primary font-semibold">
                    {template.suggestedCharacterCount} (sugerido)
                  </span>
                  <span>15 (máximo)</span>
                </div>
              </div>
            ) : (
              // Modo detallado: campos individuales
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Personajes ({characterCount})</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCharacterCountChange(Math.max(1, characterCount - 1))}
                      disabled={characterCount <= 1}
                      type="button"
                    >
                      -
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCharacterCountChange(Math.min(15, characterCount + 1))}
                      disabled={characterCount >= 15}
                      type="button"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {Array.from({ length: characterCount }).map((_, idx) => (
                    <div key={idx} className="space-y-1">
                      <Label htmlFor={`char-${idx}`} className="text-sm">
                        Personaje {idx + 1}
                      </Label>
                      <Textarea
                        id={`char-${idx}`}
                        value={characterDescriptions[idx] || ""}
                        onChange={(e) => {
                          const newDescriptions = [...characterDescriptions];
                          newDescriptions[idx] = e.target.value;
                          setCharacterDescriptions(newDescriptions);
                        }}
                        placeholder={`Ej: "Un detective cínico en sus 40s, experto en crímenes sobrenaturales"`}
                        rows={2}
                        maxLength={200}
                        className="resize-none text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={!worldName.trim() || generating}
              className="w-full md-button md-button-filled py-6"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generando con IA...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generar Mundo
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            {/* Modo Agentes Existentes */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descripción del mundo (opcional)
              </Label>
              <Textarea
                id="description"
                value={customization}
                onChange={(e) => setCustomization(e.target.value)}
                placeholder="Describe brevemente tu mundo..."
                rows={4}
                maxLength={500}
                className="resize-none"
              />
            </div>

            <AgentSelector
              selectedAgentIds={selectedAgentIds}
              onSelectionChange={setSelectedAgentIds}
              maxSelection={15}
            />
          </>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success */}
        {aiGeneration && !useExistingAgents && (
          <Alert className="border-green-500 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              ¡Mundo generado exitosamente! Revisa los resultados abajo.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* AI Generation Results */}
      {aiGeneration && !useExistingAgents && (
        <Card className="p-6 space-y-6 max-w-5xl mx-auto">
          <h3 className="text-xl font-bold md-text-primary flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Tu Mundo Generado
          </h3>

          <div>
            <Label className="text-sm font-semibold">Escenario</Label>
            <p className="mt-2 text-sm md-text-secondary">
              {aiGeneration.scenario}
            </p>
          </div>

          <div>
            <Label className="text-sm font-semibold">Contexto Inicial</Label>
            <p className="mt-2 text-sm md-text-secondary">
              {aiGeneration.initialContext}
            </p>
          </div>

          <div>
            <Label className="text-sm font-semibold">
              Personajes ({aiGeneration.suggestedAgents.length})
            </Label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {aiGeneration.suggestedAgents.map((agent, idx) => (
                <Card key={idx} className="p-4 bg-muted/50">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {agent.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold truncate">{agent.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {agent.role}
                        </Badge>
                      </div>
                      <p className="text-xs md-text-secondary line-clamp-2">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1"
            >
              🔄 Regenerar
            </Button>
            <Button
              className="flex-1 md-button md-button-filled"
              onClick={handleContinue}
              disabled={!canContinue}
            >
              Crear Mundo →
            </Button>
          </div>
        </Card>
      )}

      {/* Continue button for existing agents mode */}
      {useExistingAgents && selectedAgentIds.length > 0 && (
        <div className="flex justify-center">
          <Button
            className="md-button md-button-filled px-8"
            size="lg"
            onClick={handleContinue}
            disabled={!canContinue}
          >
            Crear Mundo con {selectedAgentIds.length} personaje{selectedAgentIds.length !== 1 ? 's' : ''} →
          </Button>
        </div>
      )}

      {/* Navigation (sin generación aún) */}
      {!aiGeneration && !useExistingAgents && (
        <div className="flex gap-4 justify-center pt-6">
          <Button
            variant="outline"
            onClick={onBack}
          >
            ← Cambiar Template
          </Button>
        </div>
      )}
    </div>
  );
}
