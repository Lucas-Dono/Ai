"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { CharacterConfig, getAssetPath, LAYER_ORDER } from '@/lib/character-editor/sutemo-assets';
import { imageCache } from '@/lib/character-editor/image-cache';
import { Progress } from '@/components/ui/progress';

interface CharacterCanvasProps {
  config: CharacterConfig;
  width?: number;
  height?: number;
  onExport?: (dataUrl: string) => void;
  scale?: number; // Para zoom
  predefinedSpritePath?: string | null; // Para sprites prediseñados
}

export function CharacterCanvas({
  config,
  width = 750,  // 60% del tamaño original (1250)
  height = 900, // 60% del tamaño original (1500)
  onExport,
  scale = 1,
  predefinedSpritePath = null,
}: CharacterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentLayer, setCurrentLayer] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Usar useCallback para evitar re-renders innecesarios
  const handleExport = useCallback(() => {
    if (canvasRef.current && onExport) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onExport(dataUrl);
    }
  }, [onExport]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let isMounted = true;

    async function renderCharacter() {
      if (!ctx || !canvas) return;

      setIsLoading(true);
      setError(null);
      setLoadingProgress(0);

      try {
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Si hay un sprite predefinido, renderizarlo directamente
        if (predefinedSpritePath) {
          setCurrentLayer('Sprite predefinido');
          setLoadingProgress(50);

          try {
            const img = await imageCache.loadImage(predefinedSpritePath);

            if (!isMounted) return;

            // Calcular escala para centrar y ajustar el sprite en el canvas
            const imgAspect = img.width / img.height;
            const canvasAspect = canvas.width / canvas.height;

            let drawWidth, drawHeight, offsetX, offsetY;

            if (imgAspect > canvasAspect) {
              // La imagen es más ancha, ajustar al ancho del canvas
              drawWidth = canvas.width;
              drawHeight = canvas.width / imgAspect;
              offsetX = 0;
              offsetY = (canvas.height - drawHeight) / 2;
            } else {
              // La imagen es más alta, ajustar a la altura del canvas
              drawHeight = canvas.height;
              drawWidth = canvas.height * imgAspect;
              offsetX = (canvas.width - drawWidth) / 2;
              offsetY = 0;
            }

            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

            setLoadingProgress(100);
            setIsLoading(false);
            setCurrentLayer('');

            if (isMounted) {
              handleExport();
            }
            return;
          } catch (imgError) {
            console.error('Error loading predefined sprite:', imgError);
            throw new Error('Error al cargar el sprite predefinido');
          }
        }

        // Renderizado modular (Sutemo)
        // Filtrar capas que tienen assets
        const layersToLoad = LAYER_ORDER.filter(layer => {
          const path = getAssetPath(layer, config);
          return path !== null;
        });

        const totalLayers = layersToLoad.length;

        // Cargar y renderizar cada capa
        for (let i = 0; i < layersToLoad.length; i++) {
          const layer = layersToLoad[i];
          const assetPath = getAssetPath(layer, config);

          if (!assetPath) continue;

          if (!isMounted) return;

          setCurrentLayer(layer);
          setLoadingProgress(Math.floor((i / totalLayers) * 100));

          try {
            // Usar el caché para cargar la imagen
            const img = await imageCache.loadImage(assetPath);

            if (!isMounted) return;

            // Escalar las imágenes proporcionalmente para que quepan en el canvas
            // Los assets originales son 1250x1500, el canvas es 750x900 (60% del original)
            const scale = canvas.width / 1250; // 750 / 1250 = 0.6
            ctx.drawImage(img, 0, 0, 1250 * scale, 1500 * scale);
          } catch (imgError) {
            console.error(`Error loading layer ${layer}:`, imgError);
            throw new Error(`Error al cargar la capa: ${layer}`);
          }
        }

        setLoadingProgress(100);
        setIsLoading(false);
        setCurrentLayer('');

        // Exportar después de renderizar
        if (isMounted) {
          handleExport();
        }
      } catch (err) {
        console.error('Error rendering character:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error al cargar los assets del personaje');
          setIsLoading(false);
        }
      }
    }

    renderCharacter();

    return () => {
      isMounted = false;
    };
  }, [config, handleExport, predefinedSpritePath]); // Ahora incluye predefinedSpritePath

  const displayWidth = width * scale;
  const displayHeight = height * scale;

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-300 rounded-lg shadow-lg bg-white dark:bg-gray-800"
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          maxWidth: '100%',
          maxHeight: '70vh',
          objectFit: 'contain',
          imageRendering: scale > 1 ? 'pixelated' : 'auto',
        }}
      />

      {/* Loading overlay con progreso detallado */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-xs w-full mx-4">
            <div className="text-center mb-4">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Cargando personaje...
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {currentLayer && `Capa: ${currentLayer}`}
              </div>
            </div>
            <Progress value={loadingProgress} className="w-full" />
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              {loadingProgress}%
            </div>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-lg backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-xs mx-4">
            <div className="text-red-600 dark:text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
