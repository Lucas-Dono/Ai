"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AIAvatarGeneratorProps {
  characterName: string;
  personality: string;
  gender?: string;
  onAvatarGenerated: (imageUrl: string) => void;
}

export function AIAvatarGenerator({
  characterName,
  personality,
  gender,
  onAvatarGenerated,
}: AIAvatarGeneratorProps) {
  const [physicalAppearance, setPhysicalAppearance] = useState('');
  const [selectedGender, setSelectedGender] = useState(gender || 'random');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setGeneratedImage(null);

    try {
      // Simulación de progreso
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 2000);

      const startTime = Date.now();

      const response = await fetch('/api/agents/generate-reference-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: characterName,
          personality: personality || 'Personaje único y creativo',
          physicalAppearance: physicalAppearance || 'random',
          gender: selectedGender !== 'random' ? selectedGender : undefined,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Error al generar imagen');
      }

      const data = await response.json();
      const endTime = Date.now();

      setGeneratedImage(data.imageUrl);
      setGenerationTime(Math.round((endTime - startTime) / 1000));
      setProgress(100);

      // Auto-llamar callback después de medio segundo
      setTimeout(() => {
        onAvatarGenerated(data.imageUrl);
      }, 500);
    } catch (err) {
      console.error('Error generating avatar:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulario */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="character-name">Nombre del personaje</Label>
          <Input
            id="character-name"
            value={characterName}
            disabled
            className="bg-gray-100 dark:bg-gray-800"
          />
          <p className="text-xs text-gray-500 mt-1">
            Heredado de la configuración del agente
          </p>
        </div>

        <div>
          <Label htmlFor="gender">Género</Label>
          <Select value={selectedGender} onValueChange={setSelectedGender}>
            <SelectTrigger id="gender">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="random">Aleatorio</SelectItem>
              <SelectItem value="female">Femenino</SelectItem>
              <SelectItem value="male">Masculino</SelectItem>
              <SelectItem value="androgynous">Andrógino</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="physical-appearance">
            Apariencia física (opcional)
          </Label>
          <Textarea
            id="physical-appearance"
            value={physicalAppearance}
            onChange={(e) => setPhysicalAppearance(e.target.value)}
            placeholder="Ej: Cabello largo y rubio, ojos azules, complexión atlética, ropa casual..."
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Si lo dejas vacío, la IA creará una apariencia aleatoria basada en la personalidad
          </p>
        </div>

        <div>
          <Label>Personalidad (referencia)</Label>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm text-gray-700 dark:text-gray-300 max-h-24 overflow-y-auto">
            {personality || 'No especificada'}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            La IA usará esto como contexto para generar el avatar
          </p>
        </div>
      </div>

      {/* Botón de generar */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !characterName}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generar Avatar con IA
          </>
        )}
      </Button>

      {/* Barra de progreso */}
      {isGenerating && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            {progress < 30 && 'Enviando solicitud a AI Horde...'}
            {progress >= 30 && progress < 60 && 'En cola de generación...'}
            {progress >= 60 && progress < 90 && 'Generando imagen...'}
            {progress >= 90 && 'Finalizando...'}
          </p>
        </div>
      )}

      {/* Preview de imagen generada */}
      {generatedImage && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">
              ¡Avatar generado exitosamente!
              {generationTime && ` (${generationTime}s)`}
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border-2 border-green-500/50">
            <img
              src={generatedImage}
              alt="Avatar generado"
              className="w-full h-auto"
            />
          </div>

          <p className="text-xs text-center text-gray-600 dark:text-gray-400">
            El avatar ha sido guardado automáticamente
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Error al generar avatar
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Info sobre AI Horde */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <strong>Nota:</strong> La generación usa AI Horde, un servicio gratuito.
          El tiempo de generación puede variar (30s - 5min) según la carga del sistema.
        </p>
      </div>
    </div>
  );
}
