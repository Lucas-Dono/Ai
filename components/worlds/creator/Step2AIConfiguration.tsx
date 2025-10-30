"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { WORLD_TYPE_CONFIG, type WorldType, type AIWorldGeneration } from "@/lib/worlds/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Step2Props {
  worldType: WorldType;
  onNext: () => void;
  onBack: () => void;
}

export function Step2AIConfiguration({ worldType, onNext, onBack }: Step2Props) {
  const [worldName, setWorldName] = useState("");
  const [description, setDescription] = useState("");
  const [characterCount, setCharacterCount] = useState(
    WORLD_TYPE_CONFIG[worldType].suggestedCharacterCount
  );
  const [generating, setGenerating] = useState(false);
  const [aiGeneration, setAiGeneration] = useState<AIWorldGeneration | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError("Por favor describe tu mundo antes de generar");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/worlds/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          worldType,
          complexity: WORLD_TYPE_CONFIG[worldType].complexity,
          characterCount,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al generar mundo");
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

  const config = WORLD_TYPE_CONFIG[worldType];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="text-4xl">{config.icon}</span>
          <Badge variant="outline" className="text-sm">
            {config.label}
          </Badge>
        </div>
        <h2 className="text-2xl font-bold md-text-primary mb-2">
          Cuéntame sobre tu mundo
        </h2>
        <p className="md-text-secondary">
          Describe tu mundo en lenguaje natural. La IA generará todo lo demás.
        </p>
      </div>

      {/* Form */}
      <Card className="p-6 space-y-6">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del mundo *</Label>
          <Input
            id="name"
            value={worldName}
            onChange={(e) => setWorldName(e.target.value)}
            placeholder='Ej: "Oficina de Detectives", "Academia de Magia"'
            maxLength={100}
          />
          <p className="text-xs md-text-secondary">
            {worldName.length}/100 caracteres
          </p>
        </div>

        {/* Descripción para IA */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Describe tu mundo 🤖 *
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={getPlaceholderForType(worldType)}
            rows={6}
            maxLength={2000}
            className="resize-none"
          />
          <p className="text-xs md-text-secondary">
            {description.length}/2000 caracteres · Usa lenguaje natural, sé específico
          </p>
        </div>

        {/* Character count */}
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
            onChange={(e) => setCharacterCount(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs md-text-secondary">
            <span>1 (mínimo)</span>
            <span>15 (máximo)</span>
          </div>
        </div>

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={!worldName.trim() || !description.trim() || generating}
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
              Generar con IA
            </>
          )}
        </Button>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success */}
        {aiGeneration && (
          <Alert className="border-green-500 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              ¡Mundo generado exitosamente! Revisa los resultados abajo.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* AI Generation Results */}
      {aiGeneration && (
        <Card className="p-6 space-y-6">
          <h3 className="text-xl font-bold md-text-primary">
            Configuración Generada ✨
          </h3>

          {/* Scenario */}
          <div>
            <Label className="text-sm font-semibold">Escenario</Label>
            <p className="mt-2 text-sm md-text-secondary">
              {aiGeneration.scenario}
            </p>
          </div>

          {/* Initial Context */}
          <div>
            <Label className="text-sm font-semibold">Contexto Inicial</Label>
            <p className="mt-2 text-sm md-text-secondary">
              {aiGeneration.initialContext}
            </p>
          </div>

          {/* Characters */}
          <div>
            <Label className="text-sm font-semibold">
              Personajes Sugeridos ({aiGeneration.suggestedAgents.length})
            </Label>
            <div className="mt-3 space-y-3">
              {aiGeneration.suggestedAgents.map((agent, idx) => (
                <Card key={idx} className="p-4 bg-muted/50">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                      {agent.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{agent.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {agent.role}
                        </Badge>
                        <Badge
                          variant={
                            agent.importanceLevel === "main"
                              ? "default"
                              : agent.importanceLevel === "secondary"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {agent.importanceLevel === "main"
                            ? "Principal"
                            : agent.importanceLevel === "secondary"
                            ? "Secundario"
                            : "Relleno"}
                        </Badge>
                      </div>
                      <p className="text-xs md-text-secondary mb-2">
                        {agent.description}
                      </p>
                      {agent.personality && (
                        <div className="flex flex-wrap gap-1">
                          {agent.personality.traits.map((trait, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Events (si aplica) */}
          {aiGeneration.suggestedEvents && aiGeneration.suggestedEvents.length > 0 && (
            <div>
              <Label className="text-sm font-semibold">
                Eventos Sugeridos ({aiGeneration.suggestedEvents.length})
              </Label>
              <div className="mt-3 space-y-2">
                {aiGeneration.suggestedEvents.map((event, idx) => (
                  <Card key={idx} className="p-3 bg-muted/50">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">🎬</span>
                      <div>
                        <span className="font-medium text-sm">{event.name}</span>
                        <p className="text-xs md-text-secondary mt-1">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {aiGeneration.tips && aiGeneration.tips.length > 0 && (
            <div>
              <Label className="text-sm font-semibold">Consejos</Label>
              <ul className="mt-2 space-y-1">
                {aiGeneration.tips.map((tip, idx) => (
                  <li key={idx} className="text-sm md-text-secondary flex gap-2">
                    <span>💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleGenerate}
              disabled={generating}
            >
              🔄 Regenerar
            </Button>
            <Button
              className="flex-1 md-button md-button-filled"
              onClick={onNext}
            >
              Continuar con estos resultados →
            </Button>
          </div>
        </Card>
      )}

      {/* Manual mode link */}
      {!aiGeneration && (
        <div className="text-center p-4">
          <p className="text-sm md-text-secondary">
            ¿Prefieres configurar todo manualmente?{" "}
            <button
              className="text-primary underline"
              onClick={() => {
                /* TODO: Switch to manual mode */
              }}
            >
              Cambiar a modo avanzado
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

function getPlaceholderForType(type: WorldType): string {
  const placeholders: Record<WorldType, string> = {
    chat: `Ejemplo: "Quiero una sala de chat donde tres amigos hablan sobre videojuegos, anime y tecnología. Uno es el experto técnico, otro el gamer hardcore, y el tercero es el otaku que siempre recomienda series."`,

    story: `Ejemplo: "Quiero una oficina de detectives en los años 40. Hay un detective duro, su asistente inteligente, y un cliente misterioso que llega con un caso de asesinato. La historia debe tener giros, pistas falsas, y una revelación final."`,

    professional: `Ejemplo: "Una startup tecnológica con un CEO visionario, una CTO técnica brillante, y un inversor exigente. Se reúnen para decidir el futuro de la compañía después de una crisis."`,

    roleplay: `Ejemplo: "Una taberna en un mundo de fantasía medieval. Un guerrero veterano, una maga joven, un pícaro ladrón, y el posadero. Se encuentran por casualidad y forman un grupo de aventureros."`,

    educational: `Ejemplo: "Una clase de ciencias donde un profesor entusiasta enseña física cuántica a dos estudiantes curiosos con diferentes estilos de aprendizaje. Uno es visual, el otro prefiere fórmulas."`,
  };

  return placeholders[type];
}
