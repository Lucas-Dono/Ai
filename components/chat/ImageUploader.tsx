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

import { useState, useRef, useEffect } from "react";
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

  // Auto-trigger file input when component mounts
  useEffect(() => {
    fileInputRef.current?.click();
  }, []);

  if (!selectedImage || !previewUrl) {
    return (
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/30 dark:border-gray-700/50 shadow-2xl">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">Seleccionando imagen...</p>
        <Button
          variant="outline"
          onClick={onCancel}
          className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-md border-white/30 hover:bg-white/70 dark:hover:bg-gray-700/70"
        >
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-4 space-y-3 max-w-2xl border border-white/30 dark:border-gray-700/50 shadow-2xl">
      {/* Preview */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full h-auto max-h-[400px] object-contain"
        />

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="absolute top-3 right-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md hover:bg-white/90 dark:hover:bg-gray-900/90 text-gray-700 dark:text-gray-300 rounded-full shadow-lg border border-white/30"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Caption input */}
      <Textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Añade un mensaje (opcional)..."
        className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-md border-white/30 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none rounded-xl"
        rows={2}
      />

      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
          {selectedImage.name} ({(selectedImage.size / 1024).toFixed(0)}KB)
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-md border-white/30 hover:bg-white/70 dark:hover:bg-gray-700/70"
          >
            Cambiar
          </Button>
          <Button
            onClick={handleSend}
            className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
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
