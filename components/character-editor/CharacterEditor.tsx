"use client";

import { useState, useEffect, useCallback } from 'react';
import { CharacterConfig, DEFAULT_CHARACTER } from '@/lib/character-editor/sutemo-assets';
import { randomizeCharacter } from '@/lib/character-editor/presets';
import { encodeConfigToURL, decodeConfigFromURL, copyConfigURL } from '@/lib/character-editor/url-sharing';
import { CharacterCanvas } from './CharacterCanvas';
import { CharacterSelector } from './CharacterSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Download, RotateCcw, Shuffle, Share2, Undo2, Redo2, ZoomIn, ZoomOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CharacterEditorProps {
  initialConfig?: CharacterConfig;
  onSave?: (config: CharacterConfig, imageData: string) => void;
}

export function CharacterEditor({ initialConfig, onSave }: CharacterEditorProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState<CharacterConfig>(initialConfig || DEFAULT_CHARACTER);
  const [exportedImage, setExportedImage] = useState<string>('');
  const [history, setHistory] = useState<CharacterConfig[]>([initialConfig || DEFAULT_CHARACTER]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [predefinedSpritePath, setPredefinedSpritePath] = useState<string | null>(null);

  // Cargar config desde URL al montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlConfig = decodeConfigFromURL(window.location.search);
      if (urlConfig) {
        const mergedConfig = { ...DEFAULT_CHARACTER, ...urlConfig };
        setConfig(mergedConfig);
        setHistory([mergedConfig]);
      }
    }
  }, []);

  // Actualizar URL cuando cambia la config
  useEffect(() => {
    if (typeof window !== 'undefined' && history.length > 1) {
      const encoded = encodeConfigToURL(config);
      const newURL = `${window.location.pathname}?${encoded}`;
      window.history.replaceState({}, '', newURL);
    }
  }, [config, history.length]);

  const handleConfigChange = useCallback((newConfig: CharacterConfig) => {
    setConfig(newConfig);
    setPredefinedSpritePath(null); // Limpiar sprite predefinido cuando se cambia config

    // Agregar a historial (eliminar estados futuros si estamos en el medio del historial)
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newConfig);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const handleSelectPredefinedSprite = useCallback((path: string) => {
    setPredefinedSpritePath(path);
    toast({
      title: 'Sprite seleccionado',
      description: 'Sprite prediseñado cargado correctamente',
    });
  }, [toast]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setConfig(history[newIndex]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setConfig(history[newIndex]);
    }
  }, [historyIndex, history]);

  const handleReset = () => {
    setConfig(DEFAULT_CHARACTER);
    setHistory([DEFAULT_CHARACTER]);
    setHistoryIndex(0);
  };

  const handleRandomize = () => {
    const randomConfig = randomizeCharacter();
    handleConfigChange(randomConfig);
    toast({
      title: 'Personaje aleatorio generado',
      description: '¡Mira tu nuevo personaje!',
    });
  };

  const handleExport = () => {
    if (!exportedImage) return;

    const link = document.createElement('a');
    link.download = `character-${Date.now()}.png`;
    link.href = exportedImage;
    link.click();

    toast({
      title: 'Imagen descargada',
      description: 'El personaje ha sido exportado correctamente',
    });
  };

  const handleShare = async () => {
    const success = await copyConfigURL(config);

    if (success) {
      toast({
        title: 'URL copiada',
        description: 'El enlace para compartir ha sido copiado al portapapeles',
      });
    } else {
      toast({
        title: 'Error',
        description: 'No se pudo copiar el enlace',
        variant: 'destructive',
      });
    }
  };

  const handleSave = () => {
    if (onSave && exportedImage) {
      onSave(config, exportedImage);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Preview del personaje */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vista previa</CardTitle>

                {/* Controles de zoom */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 min-w-16 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleZoomIn}
                    disabled={zoom >= 2}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex justify-center overflow-auto max-h-[70vh]">
              <CharacterCanvas
                config={config}
                onExport={setExportedImage}
                scale={zoom}
                predefinedSpritePath={predefinedSpritePath}
              />
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <Button
              onClick={handleUndo}
              variant="outline"
              disabled={!canUndo}
              className="w-full"
            >
              <Undo2 className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Deshacer</span>
            </Button>

            <Button
              onClick={handleRedo}
              variant="outline"
              disabled={!canRedo}
              className="w-full"
            >
              <Redo2 className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Rehacer</span>
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Reiniciar</span>
            </Button>

            <Button
              onClick={handleRandomize}
              variant="outline"
              className="w-full"
            >
              <Shuffle className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Aleatorio</span>
            </Button>

            <Button
              onClick={handleShare}
              variant="outline"
              className="w-full"
            >
              <Share2 className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Compartir</span>
            </Button>

            <Button
              onClick={handleExport}
              variant="outline"
              disabled={!exportedImage}
              className="w-full"
            >
              <Download className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Descargar</span>
            </Button>
          </div>

          {onSave && (
            <Button
              onClick={handleSave}
              className="w-full"
              size="lg"
              disabled={!exportedImage}
            >
              Guardar personaje
            </Button>
          )}
        </div>

        {/* Panel de personalización */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Personalización</CardTitle>
            </CardHeader>
            <CardContent>
              <CharacterSelector
                config={config}
                onChange={handleConfigChange}
                onSelectPredefinedSprite={handleSelectPredefinedSprite}
                selectedPredefinedPath={predefinedSpritePath || undefined}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
