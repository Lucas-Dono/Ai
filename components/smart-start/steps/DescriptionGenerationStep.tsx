/**
 * Description Generation Step
 * NEW LEGAL FLOW: User describes character freely, AI generates original character
 * Replaces old CharacterSearch component
 */

'use client';

import { useState, useRef } from 'react';
import { Sparkles, Wand2, Loader2, AlertCircle, Upload, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DescriptionGenerationStepProps {
  sessionId: string;
  userTier: 'FREE' | 'PLUS' | 'ULTRA';
  onCharacterGenerated: (draft: any) => void;
  onBack?: () => void;
}

export function DescriptionGenerationStep({
  sessionId,
  userTier,
  onCharacterGenerated,
  onBack,
}: DescriptionGenerationStepProps) {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Optional refinement options
  const [genreHint, setGenreHint] = useState<string>('');
  const [archetypeHint, setArchetypeHint] = useState<string>('');
  const [era, setEra] = useState<string>('');

  // Avatar management
  const [avatarMode, setAvatarMode] = useState<'generate' | 'upload' | null>('generate'); // Default to generate
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const [uploadedAvatarFile, setUploadedAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen (PNG, JPG, WEBP, GIF)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen es demasiado grande. Tamaño máximo: 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    setError(null);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Store file for later upload
      setUploadedAvatarFile(file);
      setAvatarMode('upload');
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Error al procesar la imagen');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setUploadedAvatar(null);
    setUploadedAvatarFile(null);
    setAvatarMode('generate');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (description.trim().length < 10) {
      setError('Por favor, escribe al menos 10 caracteres para describir tu personaje');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // If user uploaded avatar, upload it first
      let uploadedAvatarUrl: string | undefined = undefined;

      if (avatarMode === 'upload' && uploadedAvatarFile) {
        const formData = new FormData();
        formData.append('avatar', uploadedAvatarFile);

        const uploadResponse = await fetch('/api/smart-start/upload-avatar', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || 'Error al subir la imagen');
        }

        uploadedAvatarUrl = uploadData.avatarUrl;
        console.log('[DescriptionGen] Avatar uploaded:', uploadedAvatarUrl);
      }

      const response = await fetch('/api/smart-start/generate-from-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          description,
          uploadedAvatarUrl, // Pass uploaded avatar URL if exists
          options: showAdvanced
            ? {
                genreHint: genreHint || undefined,
                archetypeHint: archetypeHint || undefined,
                era: era || undefined,
              }
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar personaje');
      }

      // Success - pass generated character to parent
      onCharacterGenerated(data.draft);
    } catch (err) {
      console.error('Error generating character:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSurpriseMe = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/smart-start/generate-random', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar personaje aleatorio');
      }

      onCharacterGenerated(data.draft);
    } catch (err) {
      console.error('Error generating random character:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsGenerating(false);
    }
  };

  const examplePrompts = [
    'un detective noir de los años 40, cínico pero con buen corazón',
    'una hacker rebelde con mohawk morado, experta en ciberseguridad',
    'un chef francés obsesionado con la perfección culinaria',
    'una piloto de drones de carreras con actitud desafiante',
    'un profesor de filosofía con teorías poco convencionales',
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Wand2 className="w-8 h-8 text-purple-500" />
          <h2 className="text-3xl font-bold">Describe tu Personaje</h2>
        </div>
        <p className="text-gray-400">
          Escribe libremente cómo imaginas tu personaje y la IA lo creará para ti
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300">Plan {userTier}</span>
        </div>
      </div>

      {/* Main Description Input */}
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ej: una guerrera elfa con cicatrices de batalla, valiente pero con trauma de guerra..."
            className="w-full h-40 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            disabled={isGenerating}
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-500">
            {description.length}/2000
          </div>
        </div>

        {/* Example Prompts */}
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Ejemplos rápidos:</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, i) => (
              <button
                key={i}
                onClick={() => setDescription(example)}
                className="text-xs px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-full transition-colors"
                disabled={isGenerating}
              >
                {example.slice(0, 40)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Options (Optional) */}
      <div className="space-y-3">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          {showAdvanced ? '▼' : '▶'} Opciones avanzadas (opcional)
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-3 gap-4 overflow-hidden"
            >
              <div>
                <label className="block text-sm text-gray-400 mb-1">Género</label>
                <select
                  value={genreHint}
                  onChange={e => setGenreHint(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  disabled={isGenerating}
                >
                  <option value="">Sin especificar</option>
                  <option value="romance">Romance</option>
                  <option value="roleplay">Roleplay</option>
                  <option value="gaming">Gaming</option>
                  <option value="professional">Professional</option>
                  <option value="friendship">Amistad</option>
                  <option value="wellness">Bienestar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Época</label>
                <input
                  type="text"
                  value={era}
                  onChange={e => setEra(e.target.value)}
                  placeholder="Ej: Moderna, Victoriana..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Arquetipo</label>
                <input
                  type="text"
                  value={archetypeHint}
                  onChange={e => setArchetypeHint(e.target.value)}
                  placeholder="Ej: Héroe, Rebelde..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  disabled={isGenerating}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Avatar Section */}
      <div className="space-y-4 p-5 bg-gray-800/30 border border-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-400" />
              Foto de Perfil (Avatar)
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Elige entre subir tu propia foto o dejar que la IA la genere
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Upload Option */}
          <div className="space-y-2">
            <button
              onClick={() => {
                setAvatarMode('upload');
                fileInputRef.current?.click();
              }}
              disabled={isGenerating || isUploadingAvatar}
              className={`w-full h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg transition-all ${
                avatarMode === 'upload' && uploadedAvatar
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
              } ${isGenerating || isUploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploadedAvatar ? (
                <div className="relative w-full h-full">
                  <img
                    src={uploadedAvatar}
                    alt="Avatar preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveAvatar();
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium">Subir Foto</span>
                  <span className="text-xs text-gray-500">PNG, JPG, WEBP, GIF</span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center">
              Máx: 5MB, Min: 256x256px
            </p>
          </div>

          {/* Generate Option */}
          <div className="space-y-2">
            <button
              onClick={() => {
                setAvatarMode('generate');
                handleRemoveAvatar();
              }}
              disabled={isGenerating || isUploadingAvatar}
              className={`w-full h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg transition-all ${
                avatarMode === 'generate'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
              } ${isGenerating || isUploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Wand2 className="w-8 h-8 text-purple-400" />
              <span className="text-sm font-medium">Generar con IA</span>
              <span className="text-xs text-gray-500">Basado en descripción</span>
            </button>
            <p className="text-xs text-gray-500 text-center">
              {avatarMode === 'generate' ? '✓ Seleccionado (por defecto)' : 'Generar automáticamente'}
            </p>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Info about full-body image */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <ImageIcon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-blue-300 font-medium">Foto de cuerpo completo</p>
              <p className="text-xs text-blue-400/80 mt-1">
                La IA generará automáticamente una foto de cuerpo completo basada en tu descripción
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || description.trim().length < 10}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Generar con IA
            </>
          )}
        </button>

        <button
          onClick={handleSurpriseMe}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-all"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Sorpréndeme
            </>
          )}
        </button>
      </div>

      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          disabled={isGenerating}
          className="w-full py-2 text-gray-400 hover:text-gray-300 transition-colors text-sm"
        >
          ← Volver
        </button>
      )}

      {/* Tier Benefits Info */}
      <div className="mt-8 p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">Tu plan {userTier} incluye:</h3>
        <ul className="text-xs text-gray-400 space-y-1">
          {userTier === 'FREE' && (
            <>
              <li>✓ Perfil básico (~60 campos)</li>
              <li>✓ 2,000 tokens de generación</li>
              <li>✓ Biografía de 200-300 palabras</li>
            </>
          )}
          {userTier === 'PLUS' && (
            <>
              <li>✓ Perfil enriquecido (~160 campos)</li>
              <li>✓ 8,000 tokens de generación</li>
              <li>✓ Biografía de 400-600 palabras</li>
              <li>✓ Relaciones y metas detalladas</li>
            </>
          )}
          {userTier === 'ULTRA' && (
            <>
              <li>✓ Perfil psicológico completo (~240+ campos)</li>
              <li>✓ 20,000 tokens de generación</li>
              <li>✓ Biografía épica de 600-800 palabras</li>
              <li>✓ Análisis Big Five, arcos narrativos, traumas</li>
              <li>✓ Red de relaciones compleja</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
