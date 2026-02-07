"use client";

import { useState } from 'react';
import { AvatarPicker } from '@/components/avatar/AvatarPicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AvatarPickerDemoPage() {
  const [characterName, setCharacterName] = useState('Anya');
  const [personality, setPersonality] = useState('Personalidad alegre, energética y aventurera. Le encanta explorar cosas nuevas y ayudar a los demás. Tiene un sentido del humor único y siempre está lista para una buena conversación.');
  const [gender, setGender] = useState<string>('female');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [avatarMethod, setAvatarMethod] = useState<string | null>(null);

  const handleAvatarSelected = (avatarUrl: string, method: 'manual' | 'ai' | 'upload') => {
    setSelectedAvatar(avatarUrl);
    setAvatarMethod(method);
    console.log('Avatar selected:', { avatarUrl, method });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">
            Demo: Avatar Picker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crea avatares de 3 formas diferentes: Manual, IA o Upload
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de configuración del personaje */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Personaje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Nombre del personaje"
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Género</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Femenino</SelectItem>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="androgynous">Andrógino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="personality">Personalidad</Label>
                  <Textarea
                    id="personality"
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    placeholder="Describe la personalidad del personaje..."
                    rows={6}
                    className="resize-none"
                  />
                </div>

                {/* Preview del avatar seleccionado */}
                {selectedAvatar && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <Label>Avatar Seleccionado</Label>
                      <Badge>
                        {avatarMethod === 'manual' && 'Manual'}
                        {avatarMethod === 'ai' && 'IA'}
                        {avatarMethod === 'upload' && 'Upload'}
                      </Badge>
                    </div>
                    <div className="rounded-2xl overflow-hidden border-2 border-green-500">
                      <img
                        src={selectedAvatar}
                        alt="Avatar seleccionado"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Avatar Picker */}
          <div className="lg:col-span-2">
            <AvatarPicker
              characterName={characterName}
              personality={personality}
              gender={gender}
              currentAvatar={selectedAvatar || undefined}
              onAvatarSelected={handleAvatarSelected}
              allowedMethods={['manual', 'ai', 'upload']}
            />
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            ℹ️ Cómo funciona
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>
              <strong>Manual:</strong> Usa el editor de personajes con assets prediseñados (estilo anime Sutemo Female)
            </li>
            <li>
              <strong>IA:</strong> Genera un avatar fotorealista usando AI Horde basado en la descripción
            </li>
            <li>
              <strong>Upload:</strong> Sube tu propia imagen (PNG, JPG, WEBP - máx 5MB)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
