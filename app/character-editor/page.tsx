"use client";

import { CharacterEditor } from '@/components/character-editor/CharacterEditor';
import { CharacterConfig } from '@/lib/character-editor/sutemo-assets';

export default function CharacterEditorPage() {
  const handleSave = (config: CharacterConfig, imageData: string) => {
    console.log('Character saved:', config);
    console.log('Image data length:', imageData.length);

    // Aquí puedes implementar la lógica para guardar el personaje
    // Por ejemplo, enviarlo a una API o guardarlo en localStorage

    alert('¡Personaje guardado exitosamente!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">
            Editor de Personajes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crea tu personaje anime personalizado con Sutemo Female
          </p>
        </div>

        <CharacterEditor onSave={handleSave} />
      </div>
    </div>
  );
}
