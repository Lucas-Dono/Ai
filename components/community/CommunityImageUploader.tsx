"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link2, Image as ImageIcon, Loader2, Check, X, Circle, Square, RectangleHorizontal, RectangleVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type ImageShape = 'circle' | 'square' | 'vertical' | 'horizontal' | 'banner';

interface CommunityImageUploaderProps {
  label: string;
  currentImage?: string;
  currentShape?: ImageShape;
  onImageChange: (imageUrl: string, shape: ImageShape) => void;
  placeholder?: string;
  hint?: string;
  type?: 'icon' | 'banner';
  onPendingChange?: (isPending: boolean) => void;
}

const SHAPE_OPTIONS: { value: ImageShape; aspect: number }[] = [
  { value: 'circle', aspect: 1 },      // 1:1 circular
  { value: 'square', aspect: 1 },      // 1:1 cuadrado
  { value: 'vertical', aspect: 3/4 },  // 3:4 vertical
  { value: 'horizontal', aspect: 16/9 }, // 16:9 horizontal
  { value: 'banner', aspect: 4/1 },    // 4:1 banner (estándar web)
];

export function CommunityImageUploader({
  label,
  currentImage,
  currentShape,
  onImageChange,
  placeholder,
  hint,
  type = 'icon',
  onPendingChange
}: CommunityImageUploaderProps) {
  const t = useTranslations('community.communities.imageUploader');
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [urlValue, setUrlValue] = useState(currentImage || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedShape, setSelectedShape] = useState<ImageShape>(
    currentShape || (type === 'icon' ? 'circle' : 'banner')
  );

  // Estados para el crop
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calcular aspect ratio basado en la forma seleccionada
  const aspect = SHAPE_OPTIONS.find(opt => opt.value === selectedShape)?.aspect || 1;
  const maxSizeMB = type === 'banner' ? 10 : 5;

  // Notificar al padre cuando hay una imagen pendiente de confirmar
  useEffect(() => {
    if (onPendingChange) {
      onPendingChange(!!uploadedImage && !finalImage);
    }
  }, [uploadedImage, finalImage, onPendingChange]);

  /**
   * Procesa un archivo de imagen
   */
  const processImageFile = async (file: File) => {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError(t('errors.invalidType'));
      return;
    }

    // Validar tamaño
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(t('errors.tooLarge', { max: maxSizeMB }));
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
      };
      reader.onerror = () => {
        throw new Error(t('errors.readError'));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : t('errors.uploadError'));
    } finally {
      setUploading(false);
    }
  };

  /**
   * Maneja la subida de archivo desde input
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
  };

  /**
   * Maneja drag & drop
   */
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

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processImageFile(files[0]);
    }
  };

  /**
   * Obtiene los estilos de visualización según la forma
   */
  const getShapeStyles = useCallback((isPreview = false) => {
    const baseClasses = isPreview ? '' : 'w-full h-full object-cover';

    switch (selectedShape) {
      case 'circle':
        return {
          containerClass: isPreview ? 'w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-primary' : 'w-32 h-32 mx-auto rounded-full overflow-hidden',
          imageClass: `${baseClasses} rounded-full`
        };
      case 'square':
        return {
          containerClass: isPreview ? 'w-32 h-32 mx-auto rounded-lg overflow-hidden border-2 border-primary' : 'w-32 h-32 mx-auto rounded-lg overflow-hidden',
          imageClass: `${baseClasses}`
        };
      case 'vertical':
        return {
          containerClass: isPreview ? 'w-32 h-40 mx-auto rounded-lg overflow-hidden border-2 border-primary' : 'w-32 h-40 mx-auto rounded-lg overflow-hidden',
          imageClass: `${baseClasses}`
        };
      case 'horizontal':
        return {
          containerClass: isPreview ? 'w-48 h-28 mx-auto rounded-lg overflow-hidden border-2 border-primary' : 'w-full h-32 rounded-lg overflow-hidden',
          imageClass: `${baseClasses}`
        };
      case 'banner':
        return {
          containerClass: isPreview ? 'w-64 h-16 mx-auto rounded-lg overflow-hidden border-2 border-primary' : 'w-full aspect-[4/1] rounded-lg overflow-hidden',
          imageClass: `${baseClasses}`
        };
      default:
        return {
          containerClass: isPreview ? 'w-32 h-32 mx-auto rounded-lg overflow-hidden border-2 border-primary' : 'w-32 h-32 mx-auto rounded-lg overflow-hidden',
          imageClass: `${baseClasses}`
        };
    }
  }, [selectedShape]);

  /**
   * Callback cuando la imagen se carga en el elemento img
   */
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    let newCrop: Crop;

    // Calcular crop inicial centrado basado en aspect ratio
    if (aspect === 1) {
      // Para formas cuadradas (círculo y cuadrado)
      const minDimension = Math.min(width, height);
      const size = (minDimension / Math.max(width, height)) * 100;

      newCrop = {
        unit: '%',
        width: size,
        height: size,
        x: (100 - size) / 2,
        y: (100 - size) / 2,
      };
    } else if (aspect > 1) {
      // Para formas horizontales (horizontal y banner)
      const cropWidth = 100;
      const cropHeight = (cropWidth / aspect) * (width / height) * 100;

      newCrop = {
        unit: '%',
        width: cropWidth,
        height: Math.min(cropHeight, 100),
        x: 0,
        y: cropHeight > 100 ? 0 : (100 - cropHeight) / 2,
      };
    } else {
      // Para formas verticales
      const cropHeight = 100;
      const cropWidth = (cropHeight * aspect) * (height / width) * 100;

      newCrop = {
        unit: '%',
        width: Math.min(cropWidth, 100),
        height: cropHeight,
        x: cropWidth > 100 ? 0 : (100 - cropWidth) / 2,
        y: 0,
      };
    }

    setCrop(newCrop);

    // Establecer completedCrop automáticamente para permitir guardar sin interacción
    const pixelCrop: PixelCrop = {
      unit: 'px',
      x: (newCrop.x / 100) * width,
      y: (newCrop.y / 100) * height,
      width: (newCrop.width / 100) * width,
      height: (newCrop.height / 100) * height,
    };
    setCompletedCrop(pixelCrop);
  }, [aspect]);

  /**
   * Genera la imagen recortada
   */
  const getCroppedImg = useCallback(async (): Promise<string | null> => {
    if (!completedCrop || !imgRef.current) return null;

    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  }, [completedCrop]);

  /**
   * Confirma el crop y sube la imagen
   */
  const handleConfirmCrop = async () => {
    const croppedImage = await getCroppedImg();
    if (!croppedImage) return;

    setUploading(true);
    try {
      // Convertir data URL a Blob
      const response = await fetch(croppedImage);
      const blob = await response.blob();

      // Crear FormData
      const formData = new FormData();
      formData.append('file', blob, 'community-image.jpg');

      // Subir al servidor
      const uploadResponse = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || t('errors.uploadError'));
      }

      const { url } = await uploadResponse.json();
      setFinalImage(url);
      onImageChange(url, selectedShape);
      setUploadedImage(null); // Cerrar el modo de crop
    } catch (error) {
      console.error('Error uploading cropped image:', error);
      setError(error instanceof Error ? error.message : t('errors.uploadError'));
    } finally {
      setUploading(false);
    }
  };

  /**
   * Usa la URL proporcionada
   */
  const handleUrlSubmit = () => {
    if (urlValue.trim()) {
      setFinalImage(urlValue.trim());
      onImageChange(urlValue.trim(), selectedShape);
    }
  };

  /**
   * Limpia la imagen seleccionada
   */
  const handleClear = () => {
    setFinalImage(null);
    setUploadedImage(null);
    setUrlValue('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">
        <ImageIcon className="h-4 w-4 inline mr-1" />
        {label}
      </label>

      {/* Modo de recorte de imagen */}
      {uploadedImage && !finalImage ? (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="text-sm font-medium mb-2">
              {t('cropTitle', { type: type === 'icon' ? t('icon') : t('banner') })}
            </div>

            {/* Selector de forma */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                {t('shapeSelector.label')}
              </label>
              <div className="grid grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedShape('circle')}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all",
                    selectedShape === 'circle'
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Circle className="h-5 w-5 mb-1" />
                  <span className="text-xs">{t('shapeSelector.circle')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedShape('square')}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all",
                    selectedShape === 'square'
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Square className="h-5 w-5 mb-1" />
                  <span className="text-xs">{t('shapeSelector.square')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedShape('vertical')}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all",
                    selectedShape === 'vertical'
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RectangleVertical className="h-5 w-5 mb-1" />
                  <span className="text-xs">{t('shapeSelector.vertical')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedShape('horizontal')}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all",
                    selectedShape === 'horizontal'
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RectangleHorizontal className="h-5 w-5 mb-1" />
                  <span className="text-xs">{t('shapeSelector.horizontal')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedShape('banner')}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all",
                    selectedShape === 'banner'
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RectangleHorizontal className="h-5 w-5 mb-1" />
                  <span className="text-xs">{t('shapeSelector.banner')}</span>
                </button>
              </div>
            </div>

            {/* Herramienta de crop */}
            <div className="relative bg-black/5 rounded-2xl overflow-hidden">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                className="max-h-[500px]"
              >
                <img
                  ref={imgRef}
                  src={uploadedImage}
                  alt={t('cropAlt')}
                  onLoad={onImageLoad}
                  className="max-w-full"
                />
              </ReactCrop>
            </div>

            {/* Preview del crop */}
            {completedCrop && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl border border-border">
                <div className="text-xs text-muted-foreground">{t('preview')}:</div>
                <div className={getShapeStyles(true).containerClass}>
                  <canvas
                    ref={(canvas) => {
                      if (canvas && completedCrop && imgRef.current) {
                        const image = imgRef.current;
                        const crop = completedCrop;
                        const scaleX = image.naturalWidth / image.width;
                        const scaleY = image.naturalHeight / image.height;

                        canvas.width = crop.width * scaleX;
                        canvas.height = crop.height * scaleY;

                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          ctx.drawImage(
                            image,
                            crop.x * scaleX,
                            crop.y * scaleY,
                            crop.width * scaleX,
                            crop.height * scaleY,
                            0,
                            0,
                            canvas.width,
                            canvas.height
                          );
                        }
                      }
                    }}
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button type="button" onClick={handleConfirmCrop} disabled={uploading} className="flex-1">
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('uploading')}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {t('confirmCrop')}
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setUploadedImage(null)} disabled={uploading}>
                <X className="h-4 w-4 mr-2" />
                {t('cancel')}
              </Button>
            </div>
          </div>
        </Card>
      ) : finalImage ? (
        /* Vista previa de la imagen final */
        <Card className="p-4">
          <div className="space-y-3">
            <div className={getShapeStyles(false).containerClass}>
              <img
                src={finalImage}
                alt={t('preview')}
                className={getShapeStyles(false).imageClass}
              />
            </div>
            <Button type="button" variant="outline" onClick={handleClear} className="w-full">
              <X className="h-4 w-4 mr-2" />
              {t('change')}
            </Button>
          </div>
        </Card>
      ) : (
        /* Selector de método */
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              {t('upload')}
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-2">
              <Link2 className="h-4 w-4" />
              {t('url')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                  isDragging ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  <ImageIcon className={`w-8 h-8 transition-colors ${
                    isDragging ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">
                    {isDragging ? t('dropzone.drop') : t('dropzone.title')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('dropzone.formats')} - {t('dropzone.maxSize', { max: maxSizeMB })}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  variant="outline"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('uploading')}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {t('selectFile')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-4 space-y-3">
            <Input
              type="url"
              placeholder={placeholder}
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              variant="outline"
              className="w-full"
            >
              {t('useUrl')}
            </Button>

            {urlValue && (
              <div className="border rounded-2xl p-4">
                <p className="text-xs text-muted-foreground mb-2">{t('preview')}:</p>
                <div className={getShapeStyles(false).containerClass}>
                  <img
                    src={urlValue}
                    alt={t('preview')}
                    className={getShapeStyles(false).imageClass}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3EError%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-2xl">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Hint */}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
