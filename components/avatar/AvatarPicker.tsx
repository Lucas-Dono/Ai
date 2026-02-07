"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Pencil, Upload } from 'lucide-react';
import { CharacterEditor } from '@/components/character-editor/CharacterEditor';
import { AIAvatarGenerator } from './AIAvatarGenerator';
import { ImageUploader } from './ImageUploader';

interface AvatarPickerProps {
  /**
   * Nombre del personaje (para generación IA)
   */
  characterName?: string;

  /**
   * Personalidad del personaje (para generación IA)
   */
  personality?: string;

  /**
   * Género del personaje (opcional)
   */
  gender?: string;

  /**
   * Avatar actual (URL)
   */
  currentAvatar?: string;

  /**
   * Callback cuando se selecciona/genera un nuevo avatar
   * @param avatarUrl - URL de la imagen del avatar
   * @param method - Método usado (manual, ai, upload)
   */
  onAvatarSelected: (avatarUrl: string, method: 'manual' | 'ai' | 'upload') => void;

  /**
   * Mostrar solo opciones específicas
   */
  allowedMethods?: ('manual' | 'ai' | 'upload')[];
}

export function AvatarPicker({
  characterName = 'Personaje',
  personality = '',
  gender,
  currentAvatar,
  onAvatarSelected,
  allowedMethods = ['manual', 'ai', 'upload'],
}: AvatarPickerProps) {
  const [activeTab, setActiveTab] = useState(allowedMethods[0]);

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {allowedMethods.includes('manual') && (
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Manual</span>
            </TabsTrigger>
          )}

          {allowedMethods.includes('ai') && (
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">IA</span>
            </TabsTrigger>
          )}

          {allowedMethods.includes('upload') && (
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Subir</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* TAB: Editor Manual */}
        {allowedMethods.includes('manual') && (
          <TabsContent value="manual" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Editor Manual de Personaje</CardTitle>
                  <Badge variant="outline">Estilo Anime</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Crea tu avatar personalizado usando nuestros assets prediseñados
                </p>
              </CardHeader>
              <CardContent>
                <CharacterEditor
                  onSave={(config, imageData) => {
                    onAvatarSelected(imageData, 'manual');
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* TAB: Generación por IA */}
        {allowedMethods.includes('ai') && (
          <TabsContent value="ai" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Generación Automática con IA</CardTitle>
                  <Badge variant="secondary">AI Horde</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Genera un avatar realista basado en la descripción del personaje
                </p>
              </CardHeader>
              <CardContent>
                <AIAvatarGenerator
                  characterName={characterName}
                  personality={personality}
                  gender={gender}
                  onAvatarGenerated={(imageUrl) => {
                    onAvatarSelected(imageUrl, 'ai');
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* TAB: Upload de Imagen */}
        {allowedMethods.includes('upload') && (
          <TabsContent value="upload" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Subir Imagen Propia</CardTitle>
                  <Badge variant="outline">Personalizado</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sube una imagen que ya tengas (fanart, foto, dibujo, etc.)
                </p>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  currentImage={currentAvatar}
                  onImageUploaded={(imageUrl) => {
                    onAvatarSelected(imageUrl, 'upload');
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
