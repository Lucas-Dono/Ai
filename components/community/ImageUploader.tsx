"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 4,
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Verificar límite de imágenes
    if (images.length + files.length > maxImages) {
      setError(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validar tipo
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} no es una imagen válida`);
        }

        // Validar tamaño
        if (file.size > maxSizeMB * 1024 * 1024) {
          throw new Error(`${file.name} es demasiado grande (máx ${maxSizeMB}MB)`);
        }

        // Subir imagen
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al subir imagen');
        }

        const { url } = await response.json();
        return url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...uploadedUrls]);
    } catch (err) {
      console.error('Error uploading images:', err);
      setError(err instanceof Error ? err.message : 'Error al subir imágenes');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    await handleFileSelect(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {images.length < maxImages && (
        <div
          className={cn(
            "border-2 border-dashed rounded-2xl p-6 text-center transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border",
            uploading && "opacity-50 pointer-events-none"
          )}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              isDragging ? "bg-primary/20" : "bg-muted"
            )}>
              <ImageIcon className={cn(
                "w-6 h-6 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
            </div>

            <div>
              <p className="text-sm font-medium mb-1">
                {isDragging ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz click para seleccionar'}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF, WEBP - Máx {maxSizeMB}MB por imagen
              </p>
            </div>

            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              variant="outline"
              size="sm"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar imágenes
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-2xl">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Preview de imágenes subidas */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Imagen ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-border"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {images.length} de {maxImages} imágenes
        </p>
      )}
    </div>
  );
}
