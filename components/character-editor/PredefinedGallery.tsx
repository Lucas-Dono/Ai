"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  PREDEFINED_SPRITES,
  PredefinedSprite,
  CharacterPack,
  OutfitCategory,
  PACK_INFO,
  OUTFIT_CATEGORY_INFO,
  getSpritesByPack,
  getSpritesByCategory,
} from '@/lib/character-editor/predefined-sprites';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PredefinedGalleryProps {
  onSelect: (spritePath: string) => void;
  selectedPath?: string;
}

export function PredefinedGallery({ onSelect, selectedPath }: PredefinedGalleryProps) {
  const [selectedPack, setSelectedPack] = useState<CharacterPack | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<OutfitCategory | 'all'>('all');

  // Filtrar sprites según selecciones
  const filteredSprites = useMemo(() => {
    let sprites = PREDEFINED_SPRITES;

    if (selectedPack !== 'all') {
      sprites = getSpritesByPack(selectedPack);
    }

    if (selectedCategory !== 'all') {
      sprites = sprites.filter(s => s.outfitCategory === selectedCategory);
    }

    return sprites;
  }, [selectedPack, selectedCategory]);

  // Agrupar por outfit
  const groupedByOutfit = useMemo(() => {
    const groups: Record<string, PredefinedSprite[]> = {};
    filteredSprites.forEach(sprite => {
      const key = `${sprite.pack}_${sprite.outfit}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(sprite);
    });
    return groups;
  }, [filteredSprites]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Galería de Personajes Prediseñados</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            126 sprites de Aiko, Miki y Sumi
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPack} onValueChange={(v) => setSelectedPack(v as CharacterPack | 'all')} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="aiko">
                {PACK_INFO.aiko.emoji} Aiko
              </TabsTrigger>
              <TabsTrigger value="miki">
                {PACK_INFO.miki.emoji} Miki
              </TabsTrigger>
              <TabsTrigger value="sumi">
                {PACK_INFO.sumi.emoji} Sumi
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 space-y-4">
              {/* Filtro por categoría */}
              <div>
                <h4 className="text-sm font-medium mb-2">Categoría de Outfit</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('all')}
                  >
                    Todos
                  </Button>
                  {(Object.entries(OUTFIT_CATEGORY_INFO) as [OutfitCategory, typeof OUTFIT_CATEGORY_INFO[OutfitCategory]][]).map(([key, info]) => (
                    <Button
                      key={key}
                      size="sm"
                      variant={selectedCategory === key ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(key)}
                    >
                      {info.emoji} {info.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Contador de resultados */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredSprites.length} sprites encontrados
              </div>

              {/* Grid de sprites */}
              <ScrollArea className="h-[600px]">
                <div className="space-y-6 pr-4">
                  {Object.entries(groupedByOutfit).map(([groupKey, sprites]) => {
                    const firstSprite = sprites[0];
                    return (
                      <div key={groupKey}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{firstSprite.emoji}</span>
                          <h3 className="text-sm font-semibold">
                            {firstSprite.name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {sprites.length} variantes
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {sprites.map((sprite) => (
                            <SpriteCard
                              key={sprite.id}
                              sprite={sprite}
                              isSelected={selectedPath === sprite.path}
                              onSelect={() => onSelect(sprite.path)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface SpriteCardProps {
  sprite: PredefinedSprite;
  isSelected: boolean;
  onSelect: () => void;
}

function SpriteCard({ sprite, isSelected, onSelect }: SpriteCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <button
      onClick={onSelect}
      className={`
        relative rounded-2xl border-2 overflow-hidden transition-all
        hover:scale-105 hover:shadow-lg cursor-pointer
        ${isSelected
          ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2'
          : 'border-gray-200 dark:border-gray-700'
        }
      `}
    >
      <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 relative">
        {!imageError ? (
          <Image
            src={sprite.path}
            alt={`${sprite.name} - ${sprite.description}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
            <div className="text-center p-2">
              <div className="text-2xl mb-1">{sprite.emoji}</div>
              <div>Error al cargar</div>
            </div>
          </div>
        )}
      </div>

      <div className="p-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs font-medium truncate">
          {sprite.description}
        </p>
        <div className="flex items-center gap-1 mt-1">
          {sprite.hasClosedEyes && (
            <Badge variant="secondary" className="text-[10px] px-1 py-0">
              👁️
            </Badge>
          )}
          {sprite.hasBlush && (
            <Badge variant="secondary" className="text-[10px] px-1 py-0">
              😊
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
