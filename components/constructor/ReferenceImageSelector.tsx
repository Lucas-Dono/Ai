"use client";

/**
 * Componente para seleccionar o generar imagen de referencia del personaje
 *
 * Permite:
 * - Generar imagen con IA basada en la descripción del personaje
 * - Subir imagen propia
 * - Vista previa de la imagen seleccionada
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Upload, X } from "lucide-react";
import Image from "next/image";

interface ReferenceImageSelectorProps {
  agentName: string;
  personality: string;
  onImageSelected: (imageUrl: string) => void;
  onSkip: () => void;
}

export function ReferenceImageSelector({
  agentName,
  personality,
  onImageSelected,
  onSkip,
}: ReferenceImageSelectorProps) {
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Genera imagen de referencia con IA usando la personalidad del agente
   */
  const handleGenerateWithAI = async () => {
    setGenerating(true);
    setError(null);

    try {
      console.log("[ReferenceImageSelector] Generating reference image with AI...");

      const response = await fetch("/api/agents/generate-reference-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: agentName,
          personality,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data = await response.json();

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        console.log("[ReferenceImageSelector] Image generated successfully");
      } else {
        throw new Error("No image URL returned");
      }
    } catch (error) {
      console.error("[ReferenceImageSelector] Error generating image:", error);
      setError(error instanceof Error ? error.message : "Error al generar imagen");
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Maneja la subida de imagen propia del usuario
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen válido");
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen debe ser menor a 5MB");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Convertir a base64 data URL para preview inmediato
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageUrl(result);
        console.log("[ReferenceImageSelector] Image uploaded successfully");
      };
      reader.onerror = () => {
        throw new Error("Error al leer el archivo");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("[ReferenceImageSelector] Error uploading image:", error);
      setError(error instanceof Error ? error.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  /**
   * Confirma la selección de imagen
   */
  const handleConfirm = () => {
    if (imageUrl) {
      onImageSelected(imageUrl);
    }
  };

  /**
   * Elimina la imagen seleccionada
   */
  const handleClear = () => {
    setImageUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Vista previa de la imagen */}
      {imageUrl ? (
        <Card className="p-4">
          <div className="relative">
            <div className="relative w-full h-96 rounded-lg overflow-hidden bg-muted">
              <Image
                src={imageUrl}
                alt={`Imagen de referencia de ${agentName}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleConfirm} className="flex-1">
              Usar esta imagen
            </Button>
            <Button variant="outline" onClick={onSkip}>
              Omitir
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Generar con IA */}
          <Button
            onClick={handleGenerateWithAI}
            disabled={generating || uploading}
            className="w-full"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando imagen...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generar con IA
              </>
            )}
          </Button>

          {/* Subir imagen propia */}
          <div>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={generating || uploading}
              className="hidden"
            />
            <label htmlFor="image-upload">
              <Button
                variant="outline"
                disabled={generating || uploading}
                className="w-full"
                size="lg"
                asChild
              >
                <span>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Subir mi propia imagen
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>

          {/* Omitir paso */}
          <Button
            variant="ghost"
            onClick={onSkip}
            disabled={generating || uploading}
            className="w-full"
          >
            Omitir (generar automáticamente después)
          </Button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Información */}
      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
        <p className="font-medium mb-1">💡 ¿Para qué sirve esto?</p>
        <p>
          La imagen de referencia se usa para mantener consistencia visual en todas las imágenes que {agentName} genere en el futuro.
          Siempre mantendrá la misma apariencia (cara, cabello, cuerpo), solo cambiarán poses y expresiones.
        </p>
      </div>
    </div>
  );
}
