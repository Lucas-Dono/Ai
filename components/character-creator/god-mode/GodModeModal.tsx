'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Lock,
  Globe,
  Heart,
  Brain,
  Flame,
  Sparkles,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { RelationshipSelector } from './RelationshipSelector';
import { MemoryInjector } from './MemoryInjector';
import { FeelingsSelector } from './FeelingsSelector';
import { ScenarioSelector } from './ScenarioSelector';
import { NSFWSettings } from './NSFWSettings';

import type {
  GodModeConfig,
  InitialRelationshipTier,
  FeelingType,
  PowerDynamic,
  ScenarioId,
  NSFWLevel,
  SharedMemory,
} from '@/types/god-mode';
import {
  DEFAULT_GOD_MODE_CONFIG,
  requiresPrivateMode,
  isConfigValid,
} from '@/types/god-mode';

interface GodModeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: GodModeConfig;
  onConfigChange: (config: GodModeConfig) => void;
  characterName?: string;
  locale?: 'en' | 'es';
}

export function GodModeModal({
  open,
  onOpenChange,
  config,
  onConfigChange,
  characterName = 'Character',
  locale = 'en',
}: GodModeModalProps) {
  const [activeTab, setActiveTab] = useState('visibility');

  // Update config helper
  const updateConfig = useCallback(
    (updates: Partial<GodModeConfig>) => {
      const newConfig = { ...config, ...updates };

      // Auto-enable god mode if any advanced feature is used
      if (
        updates.initialRelationship ||
        updates.sharedMemories ||
        updates.characterFeelings ||
        updates.powerDynamic ||
        updates.scenario ||
        updates.nsfwLevel
      ) {
        newConfig.enabled = true;
      }

      // Auto-switch to private if required
      if (requiresPrivateMode(newConfig) && newConfig.visibility === 'public') {
        newConfig.visibility = 'private';
      }

      onConfigChange(newConfig);
    },
    [config, onConfigChange]
  );

  // Toggle visibility
  const handleVisibilityToggle = useCallback(
    (isPrivate: boolean) => {
      if (!isPrivate && requiresPrivateMode(config)) {
        // Can't switch to public with NSFW content
        return;
      }
      updateConfig({ visibility: isPrivate ? 'private' : 'public' });
    },
    [config, updateConfig]
  );

  // Validation
  const validation = isConfigValid(config);
  const isPrivate = config.visibility === 'private';

  const t = {
    title: locale === 'es' ? 'Modo Dios' : 'God Mode',
    subtitle:
      locale === 'es'
        ? 'Personalización avanzada de tu personaje'
        : 'Advanced character customization',
    visibility: locale === 'es' ? 'Visibilidad' : 'Visibility',
    public: locale === 'es' ? 'Público' : 'Public',
    private: locale === 'es' ? 'Privado' : 'Private',
    publicDesc:
      locale === 'es'
        ? 'Otros pueden ver y clonar este personaje'
        : 'Others can see and clone this character',
    privateDesc:
      locale === 'es'
        ? 'Solo tú puedes ver este personaje'
        : 'Only you can see this character',
    relationship: locale === 'es' ? 'Relación' : 'Relationship',
    memories: locale === 'es' ? 'Memorias' : 'Memories',
    feelings: locale === 'es' ? 'Sentimientos' : 'Feelings',
    scenario: locale === 'es' ? 'Escenario' : 'Scenario',
    nsfw: 'NSFW',
    apply: locale === 'es' ? 'Aplicar' : 'Apply',
    cancel: locale === 'es' ? 'Cancelar' : 'Cancel',
    privateRequired:
      locale === 'es'
        ? 'Las opciones seleccionadas requieren modo privado'
        : 'Selected options require private mode',
    unlockFeatures:
      locale === 'es'
        ? 'Activa modo privado para desbloquear todas las opciones'
        : 'Enable private mode to unlock all options',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-white">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Crown className="w-6 h-6" />
              </div>
              {t.title}
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                BETA
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-white/80 mt-1">
              {t.subtitle}
            </DialogDescription>
          </DialogHeader>

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visibility Toggle - Always visible at top */}
        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`p-2 rounded-lg ${
                  isPrivate ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                }`}
              >
                {isPrivate ? (
                  <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div>
                <Label className="text-base font-medium">
                  {isPrivate ? t.private : t.public}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isPrivate ? t.privateDesc : t.publicDesc}
                </p>
              </div>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={handleVisibilityToggle}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>

          {/* Private mode unlock message */}
          {!isPrivate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
            >
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-purple-700 dark:text-purple-300">
                  {t.unlockFeatures}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Main content with tabs */}
        <ScrollArea className="flex-1 max-h-[50vh]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start gap-1 px-6 py-2 bg-transparent border-b rounded-none h-auto">
              <TabsTrigger
                value="relationship"
                disabled={!isPrivate}
                className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30 gap-2"
              >
                <Heart className="w-4 h-4" />
                {t.relationship}
              </TabsTrigger>
              <TabsTrigger
                value="memories"
                disabled={!isPrivate}
                className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30 gap-2"
              >
                <Brain className="w-4 h-4" />
                {t.memories}
              </TabsTrigger>
              <TabsTrigger
                value="feelings"
                disabled={!isPrivate}
                className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30 gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {t.feelings}
              </TabsTrigger>
              <TabsTrigger
                value="scenario"
                disabled={!isPrivate}
                className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30 gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                {t.scenario}
              </TabsTrigger>
              <TabsTrigger
                value="nsfw"
                disabled={!isPrivate}
                className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30 gap-2"
              >
                <Flame className="w-4 h-4" />
                {t.nsfw}
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <AnimatePresence mode="wait">
                <TabsContent value="relationship" className="mt-0">
                  <RelationshipSelector
                    value={config.initialRelationship}
                    onChange={(value: InitialRelationshipTier) =>
                      updateConfig({ initialRelationship: value })
                    }
                    characterName={characterName}
                    locale={locale}
                    disabled={!isPrivate}
                  />
                </TabsContent>

                <TabsContent value="memories" className="mt-0">
                  <MemoryInjector
                    memories={config.sharedMemories}
                    onChange={(memories: SharedMemory[]) =>
                      updateConfig({ sharedMemories: memories })
                    }
                    characterName={characterName}
                    locale={locale}
                    disabled={!isPrivate}
                  />
                </TabsContent>

                <TabsContent value="feelings" className="mt-0">
                  <FeelingsSelector
                    feeling={config.characterFeelings}
                    intensity={config.feelingIntensity}
                    powerDynamic={config.powerDynamic}
                    onFeelingChange={(feeling: FeelingType) =>
                      updateConfig({ characterFeelings: feeling })
                    }
                    onIntensityChange={(intensity: number) =>
                      updateConfig({ feelingIntensity: intensity })
                    }
                    onDynamicChange={(dynamic: PowerDynamic) =>
                      updateConfig({ powerDynamic: dynamic })
                    }
                    characterName={characterName}
                    locale={locale}
                    disabled={!isPrivate}
                  />
                </TabsContent>

                <TabsContent value="scenario" className="mt-0">
                  <ScenarioSelector
                    scenario={config.scenario}
                    customScenario={config.customScenario}
                    onScenarioChange={(scenario: ScenarioId) =>
                      updateConfig({ scenario })
                    }
                    onCustomScenarioChange={(customScenario: string) =>
                      updateConfig({ customScenario })
                    }
                    locale={locale}
                    disabled={!isPrivate}
                  />
                </TabsContent>

                <TabsContent value="nsfw" className="mt-0">
                  <NSFWSettings
                    level={config.nsfwLevel}
                    onChange={(level: NSFWLevel) => updateConfig({ nsfwLevel: level })}
                    locale={locale}
                    disabled={!isPrivate}
                  />
                </TabsContent>
              </AnimatePresence>
            </div>
          </Tabs>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
          {/* Validation errors */}
          {!validation.valid && (
            <div className="text-sm text-destructive flex items-center gap-2">
              <X className="w-4 h-4" />
              {validation.errors[0]}
            </div>
          )}

          {/* Config summary */}
          {validation.valid && config.enabled && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-green-500" />
              <span>God Mode configurado</span>
            </div>
          )}

          {!config.enabled && <div />}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t.cancel}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
              disabled={!validation.valid}
            >
              <Check className="w-4 h-4 mr-2" />
              {t.apply}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { DEFAULT_GOD_MODE_CONFIG };
