"use client";

/**
 * Image Uploader Component
 *
 * Permite al usuario enviar imágenes:
 * - Seleccionar desde galería
 * - Preview antes de enviar
 * - Comprimir imagen
 * - Añadir caption opcional
 */

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onSend: (imageFile: File, caption?: string) => void;
  onCancel: () => void;
}

export function ImageUploader({ onSend, onCancel }: ImageUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida");
      return;
    }

    // Validar tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("La imagen es demasiado grande. Máximo 10MB");
      return;
    }

    setSelectedImage(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = () => {
    if (selectedImage) {
      onSend(selectedImage, caption.trim() || undefined);
    }
  };

  // Auto-trigger file input
  useState(() => {
    fileInputRef.current?.click();
  });

  if (!selectedImage || !previewUrl) {
    return (
      <div className="bg-[#1f1f1f] rounded-2xl p-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <ImageIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400 mb-4">Seleccionando imagen...</p>
        <Button
          variant="outline"
          onClick={onCancel}
          className="text-gray-400"
        >
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#1f1f1f] rounded-2xl p-4 space-y-3 max-w-2xl">
      {/* Preview */}
      <div className="relative rounded-lg overflow-hidden">
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full h-auto max-h-[400px] object-contain bg-black"
        />

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Caption input */}
      <Textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Añade un mensaje (opcional)..."
        className="bg-[#2a2a2a] border-none text-white placeholder:text-gray-500 resize-none"
        rows={2}
      />

      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-gray-400">
          {selectedImage.name} ({(selectedImage.size / 1024).toFixed(0)}KB)
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400"
          >
            Cambiar
          </Button>
          <Button
            variant="default"
            onClick={handleSend}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar
          </Button>
        </div>
      </div>

      {/* Hidden input for changing image */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
