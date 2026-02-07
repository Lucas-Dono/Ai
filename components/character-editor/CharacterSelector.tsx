"use client";

import { useState } from 'react';
import { CharacterConfig, BodyType, HairFrontStyle, HairBehindStyle, HairColor, Expression, Outfit, Blush, Accessory, LABELS, BODY_TYPE_NAMES, getAvailableHairFrontStyles, getAvailableOutfits } from '@/lib/character-editor/sutemo-assets';
import {
  CHARACTER_PRESETS,
  PRESET_LABELS,
  EXPRESSION_CATEGORIES,
  OUTFIT_CATEGORIES,
  HAIR_FRONT_NAMES,
  HAIR_BEHIND_NAMES
} from '@/lib/character-editor/presets';
import { PredefinedGallery } from './PredefinedGallery';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface CharacterSelectorProps {
  config: CharacterConfig;
  onChange: (config: CharacterConfig) => void;
  onSelectPredefinedSprite?: (path: string) => void;
  selectedPredefinedPath?: string;
}

export function CharacterSelector({
  config,
  onChange,
  onSelectPredefinedSprite,
  selectedPredefinedPath
}: CharacterSelectorProps) {
  const [activeTab, setActiveTab] = useState('basic');

  const updateConfig = <K extends keyof CharacterConfig>(
    key: K,
    value: CharacterConfig[K]
  ) => {
    const newConfig = { ...config, [key]: value };

    // Si se cambia el bodyType, verificar que hairFrontStyle y outfit sean válidos
    if (key === 'bodyType') {
      const availableStyles = getAvailableHairFrontStyles(value as BodyType);
      if (!availableStyles.includes(config.hairFrontStyle)) {
        // Si el estilo actual no está disponible, usar el primer estilo disponible
        newConfig.hairFrontStyle = availableStyles[0];
      }

      const availableOutfits = getAvailableOutfits(value as BodyType);
      if (!availableOutfits.includes(config.outfit)) {
        // Si el outfit actual no está disponible, usar el primer outfit disponible
        newConfig.outfit = availableOutfits[0];
      }
    }

    onChange(newConfig);
  };

  const loadPreset = (presetKey: string) => {
    const preset = CHARACTER_PRESETS[presetKey];
    if (preset) {
      onChange(preset);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="basic">Personalizar</TabsTrigger>
          <TabsTrigger value="gallery">Galería</TabsTrigger>
        </TabsList>

        {/* TAB: Presets */}
        <TabsContent value="presets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Personajes Predefinidos</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-4">
                  {Object.entries(CHARACTER_PRESETS).map(([key, preset]) => {
                    const label = PRESET_LABELS[key];
                    return (
                      <Button
                        key={key}
                        variant="outline"
                        className="h-auto py-4 flex flex-col items-start text-left space-y-2"
                        onClick={() => loadPreset(key)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <span className="text-2xl">{label.emoji}</span>
                          <span className="font-semibold text-sm">{label.name}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {label.description}
                        </p>
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Personalización */}
        <TabsContent value="basic" className="space-y-4">
          {/* Tipo de cuerpo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{LABELS.bodyType}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {(Object.entries(BODY_TYPE_NAMES) as [BodyType, string][]).map(([type, name]) => (
                  <Button
                    key={type}
                    variant={config.bodyType === type ? 'default' : 'outline'}
                    className="h-auto py-3"
                    onClick={() => updateConfig('bodyType', type)}
                  >
                    <span className="text-sm font-medium">{name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pelo frontal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{LABELS.hairFrontStyle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {getAvailableHairFrontStyles(config.bodyType).map((style) => (
                  <Button
                    key={style}
                    variant={config.hairFrontStyle === style ? 'default' : 'outline'}
                    className="h-auto py-3 flex flex-col items-center gap-1"
                    onClick={() => updateConfig('hairFrontStyle', style)}
                  >
                    <span className="text-xs font-medium">{HAIR_FRONT_NAMES[style]}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pelo trasero */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{LABELS.hairBehindStyle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {(Object.entries(HAIR_BEHIND_NAMES) as [HairBehindStyle, string][]).map(([style, name]) => (
                  <Button
                    key={style}
                    variant={config.hairBehindStyle === style ? 'default' : 'outline'}
                    className="h-auto py-3 flex flex-col items-center gap-1"
                    onClick={() => updateConfig('hairBehindStyle', style)}
                  >
                    <span className="text-xs font-medium">{name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Color de cabello */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{LABELS.hairColor}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {(['Black', 'Pink', 'Silver', 'Brown', 'Blonde'] as HairColor[]).map((color) => (
                  <Button
                    key={color}
                    variant={config.hairColor === color ? 'default' : 'outline'}
                    className="h-12 relative"
                    onClick={() => updateConfig('hairColor', color)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: getColorHex(color) }}
                      />
                      <span className="text-xs">{color}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expresiones agrupadas por categoría */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{LABELS.expression}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-4 pr-4">
                  {Object.entries(EXPRESSION_CATEGORIES).map(([categoryKey, category]) => (
                    <div key={categoryKey}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{category.emoji}</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {category.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {category.expressions.map((expression) => (
                          <Button
                            key={expression}
                            variant={config.expression === expression ? 'default' : 'outline'}
                            className="h-10 text-xs"
                            onClick={() => updateConfig('expression', expression)}
                          >
                            {expression.replace(/-/g, ' ')}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Outfits por categoría */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{LABELS.outfit}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-4 pr-4">
                  {Object.entries(OUTFIT_CATEGORIES).map(([categoryKey, category]) => {
                    // Filtrar outfits disponibles para el tipo de cuerpo actual
                    const availableOutfits = getAvailableOutfits(config.bodyType);
                    const visibleOutfits = category.outfits.filter(outfit =>
                      availableOutfits.includes(outfit)
                    );

                    // No mostrar la categoría si no tiene outfits disponibles
                    if (visibleOutfits.length === 0) return null;

                    return (
                      <div key={categoryKey}>
                        <Badge variant="outline" className="mb-2">
                          {category.label}
                        </Badge>
                        <div className="grid grid-cols-2 gap-2">
                          {visibleOutfits.map((outfit) => (
                            <Button
                              key={outfit}
                              variant={config.outfit === outfit ? 'default' : 'outline'}
                              className="h-10 text-xs"
                              onClick={() => updateConfig('outfit', outfit)}
                            >
                              {outfit.replace(/-/g, ' ')}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Rubor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{LABELS.blush}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {(['None', 'Blush1', 'Blush2'] as Blush[]).map((blush) => (
                  <Button
                    key={blush}
                    variant={config.blush === blush ? 'default' : 'outline'}
                    className="h-12"
                    onClick={() => updateConfig('blush', blush)}
                  >
                    {blush === 'None' ? 'Sin rubor' : blush}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Accesorios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{LABELS.accessory}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {(['None', 'glasses'] as Accessory[]).map((accessory) => (
                  <Button
                    key={accessory}
                    variant={config.accessory === accessory ? 'default' : 'outline'}
                    className="h-12"
                    onClick={() => updateConfig('accessory', accessory)}
                  >
                    {accessory === 'None' ? 'Sin accesorios' : accessory}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Galería */}
        <TabsContent value="gallery" className="space-y-4">
          {onSelectPredefinedSprite ? (
            <PredefinedGallery
              onSelect={onSelectPredefinedSprite}
              selectedPath={selectedPredefinedPath}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-600 dark:text-gray-400">
                La galería de personajes prediseñados no está disponible en este contexto.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Helper para obtener el color hexadecimal aproximado
 */
function getColorHex(color: HairColor): string {
  const colors: Record<HairColor, string> = {
    'Black': '#1a1a1a',
    'Pink': '#ff9ec8',
    'Silver': '#c0c0c0',
    'Brown': '#8b4513',
    'Blonde': '#f5d76e',
    'Dark': '#0d0d0d',
    'Blond': '#ffe680',
    'Red': '#c41e3a',
  };
  return colors[color];
}
