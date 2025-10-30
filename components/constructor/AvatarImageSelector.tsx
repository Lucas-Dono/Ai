"use client";

/**
 * Componente para seleccionar foto de cara (avatar) del personaje
 *
 * A diferencia de ReferenceImageSelector que es para imagen de cuerpo completo,
 * este componente está optimizado para fotos de cara cuadradas que se usarán
 * en previews, cards y UI del sistema.
 *
 * Permite:
 * - Generar foto de cara con IA basada en la descripción del personaje
 * - Subir foto propia con crop estilo Instagram (1:1)
 * - Vista previa de la foto seleccionada
 */

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Upload, X, Check } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface AvatarImageSelectorProps {
  agentName: string;
  personality: string;
  physicalAppearance?: string;
  onImageSelected: (imageUrl: string) => void;
  onSkip: () => void;
}

export function AvatarImageSelector({
  agentName,
  personality,
  physicalAppearance,
  onImageSelected,
  onSkip,
}: AvatarImageSelectorProps) {
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estados para el crop
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  /**
   * Genera foto de cara con IA usando la personalidad del agente
   */
  const handleGenerateWithAI = async () => {
    setGenerating(true);
    setError(null);

    try {
      console.log("[AvatarImageSelector] Generating avatar with AI...");

      const response = await fetch("/api/agents/generate-reference-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: agentName,
          personality,
          physicalAppearance,
          imageType: "avatar", // Especificar que es avatar (cara)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate avatar");
      }

      const data = await response.json();

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        console.log("[AvatarImageSelector] Avatar generated successfully");
      } else {
        throw new Error("No image URL returned");
      }
    } catch (error) {
      console.error("[AvatarImageSelector] Error generating avatar:", error);
      setError(error instanceof Error ? error.message : "Error al generar avatar");
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Maneja la subida de foto propia del usuario
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
      // Convertir a base64 data URL para preview y crop
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedImage(result);
        console.log("[AvatarImageSelector] Image loaded for cropping");
      };
      reader.onerror = () => {
        throw new Error("Error al leer el archivo");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("[AvatarImageSelector] Error uploading avatar:", error);
      setError(error instanceof Error ? error.message : "Error al subir avatar");
    } finally {
      setUploading(false);
    }
  };

  /**
   * Genera la imagen recortada en formato 1:1
   */
  const getCroppedImg = useCallback(async (): Promise<string | null> => {
    if (!completedCrop || !imgRef.current) return null;

    const canvas = document.createElement("canvas");
    const image = imgRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Tamaño del canvas: siempre cuadrado 1:1
    const size = Math.min(crop.width * scaleX, crop.height * scaleY);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      size,
      size
    );

    return canvas.toDataURL("image/jpeg", 0.9);
  }, [completedCrop]);

  /**
   * Confirma el crop y guarda la imagen
   */
  const handleConfirmCrop = async () => {
    const croppedImage = await getCroppedImg();
    if (croppedImage) {
      setImageUrl(croppedImage);
      setUploadedImage(null); // Cerrar el modo de crop
      console.log("[AvatarImageSelector] Image cropped successfully");
    }
  };

  /**
   * Callback cuando la imagen se carga en el elemento img
   */
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;

    // Inicializar crop centrado y cuadrado
    const minDimension = Math.min(width, height);
    const size = (minDimension / Math.max(width, height)) * 100;

    setCrop({
      unit: "%",
      width: size,
      height: size,
      x: (100 - size) / 2,
      y: (100 - size) / 2,
    });
  }, []);

  /**
   * Confirma la selección de foto
   */
  const handleConfirm = () => {
    if (imageUrl) {
      onImageSelected(imageUrl);
    }
  };

  /**
   * Elimina la foto seleccionada
   */
  const handleClear = () => {
    setImageUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Modo de recorte de imagen */}
      {uploadedImage && !imageUrl ? (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="text-sm font-medium mb-2">
              Ajusta la imagen para mostrar la zona que deseas (1:1)
            </div>

            {/* Herramienta de crop */}
            <div className="relative bg-black/5 rounded-lg overflow-hidden">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1} // Forzar aspecto 1:1 (cuadrado)
                className="max-h-[500px]"
              >
                <img
                  ref={imgRef}
                  src={uploadedImage}
                  alt="Imagen para recortar"
                  onLoad={onImageLoad}
                  className="max-w-full"
                />
              </ReactCrop>
            </div>

            {/* Preview del crop en tamaño de avatar */}
            {completedCrop && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground">Vista previa:</div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary">
                    <canvas
                      ref={(canvas) => {
                        if (canvas && completedCrop && imgRef.current) {
                          const image = imgRef.current;
                          const crop = completedCrop;
                          const scaleX = image.naturalWidth / image.width;
                          const scaleY = image.naturalHeight / image.height;
                          const size = Math.min(crop.width * scaleX, crop.height * scaleY);

                          canvas.width = size;
                          canvas.height = size;

                          const ctx = canvas.getContext("2d");
                          if (ctx) {
                            ctx.drawImage(
                              image,
                              crop.x * scaleX,
                              crop.y * scaleY,
                              crop.width * scaleX,
                              crop.height * scaleY,
                              0,
                              0,
                              size,
                              size
                            );
                          }
                        }
                      }}
                      className="w-full h-full"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">Así se verá en el chat</span>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button onClick={handleConfirmCrop} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Confirmar recorte
              </Button>
              <Button variant="outline" onClick={() => setUploadedImage(null)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      ) : imageUrl ? (
        /* Vista previa del avatar final */
        <Card className="p-4">
          <div className="space-y-4">
            {/* Preview grande cuadrado */}
            <div className="relative w-full aspect-square max-w-md mx-auto rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              <Image
                src={imageUrl}
                alt={`Avatar de ${agentName}`}
                fill
                className="object-cover"
                unoptimized
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Preview en tamaño de avatar */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar className="w-16 h-16 border-2 border-border">
                <AvatarImage src={imageUrl} alt={agentName} />
                <AvatarFallback>{agentName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Vista previa</p>
                <p>Así se verá en las previews y tarjetas</p>
              </div>
            </div>

            {/* Botones de confirmación */}
            <div className="flex gap-2">
              <Button onClick={handleConfirm} className="flex-1">
                Usar este avatar
              </Button>
              <Button variant="outline" onClick={onSkip}>
                Omitir
              </Button>
            </div>
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
                Generando avatar...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generar foto de cara con IA
              </>
            )}
          </Button>

          {/* Subir foto propia */}
          <div>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={generating || uploading}
              className="hidden"
            />
            <label htmlFor="avatar-upload">
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
                      Subir mi propia foto
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
            Omitir (usar iniciales por ahora)
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
      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md space-y-2">
        <div>
          <p className="font-medium mb-1">📸 Foto de cara (Avatar)</p>
          <p>
            Esta foto se usará para mostrar a {agentName} en previews, tarjetas y la interfaz.
            <span className="font-semibold"> Se recomienda una foto cuadrada centrada en la cara.</span>
          </p>
        </div>

        <div className="pt-2 border-t border-border/50">
          <p className="font-medium mb-1">💡 Siguiente paso</p>
          <p>
            Después de esto, podrás agregar una imagen de cuerpo completo opcional que se usará
            para generar imágenes consistentes en conversaciones.
          </p>
        </div>
      </div>
    </div>
  );
}
