'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  MEMORY_TEMPLATES,
  type SharedMemory,
  type MemoryType,
  type MemoryTemplate,
} from '@/types/god-mode';

interface MemoryInjectorProps {
  memories: SharedMemory[];
  onChange: (memories: SharedMemory[]) => void;
  characterName: string;
  locale?: 'en' | 'es';
  disabled?: boolean;
}

export function MemoryInjector({
  memories,
  onChange,
  characterName,
  locale = 'en',
  disabled = false,
}: MemoryInjectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<MemoryType | null>(null);
  const [newMemoryText, setNewMemoryText] = useState('');
  const [newMemoryWeight, setNewMemoryWeight] = useState(0.7);

  const t = {
    title: locale === 'es' ? 'Memorias Compartidas' : 'Shared Memories',
    subtitle:
      locale === 'es'
        ? `Crea historia entre tú y ${characterName}`
        : `Create history between you and ${characterName}`,
    addMemory: locale === 'es' ? 'Agregar memoria' : 'Add memory',
    noMemories:
      locale === 'es'
        ? 'Aún no hay memorias. Agrega algunas para crear historia.'
        : 'No memories yet. Add some to create history.',
    importance: locale === 'es' ? 'Importancia' : 'Importance',
    add: locale === 'es' ? 'Agregar' : 'Add',
    cancel: locale === 'es' ? 'Cancelar' : 'Cancel',
    nsfw: '+18',
    maxMemories: locale === 'es' ? 'Máximo 5 memorias' : 'Maximum 5 memories',
  };

  const addMemory = useCallback(() => {
    if (!selectedTemplate || !newMemoryText.trim() || memories.length >= 5) return;

    const newMemory: SharedMemory = {
      id: `memory-${Date.now()}`,
      type: selectedTemplate,
      description: newMemoryText.trim(),
      emotionalWeight: newMemoryWeight,
      isPositive: true,
    };

    onChange([...memories, newMemory]);
    setSelectedTemplate(null);
    setNewMemoryText('');
    setNewMemoryWeight(0.7);
  }, [selectedTemplate, newMemoryText, newMemoryWeight, memories, onChange]);

  const removeMemory = useCallback(
    (id: string) => {
      onChange(memories.filter((m) => m.id !== id));
    },
    [memories, onChange]
  );

  const getTemplateInfo = (type: MemoryType): MemoryTemplate | undefined => {
    return MEMORY_TEMPLATES.find((t) => t.type === type);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{t.title}</h3>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Existing memories */}
      <div className="space-y-2">
        <AnimatePresence>
          {memories.map((memory) => {
            const template = getTemplateInfo(memory.type);
            return (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative p-3 rounded-lg border bg-card"
              >
                <button
                  onClick={() => !disabled && removeMemory(memory.id)}
                  disabled={disabled}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="flex items-start gap-3 pr-8">
                  <span className="text-xl">{template?.icon || '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {locale === 'es' ? template?.labelEs : template?.label}
                      </span>
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden max-w-[100px]">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${memory.emotionalWeight * 100}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {memory.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {memories.length === 0 && (
          <div className="p-6 text-center text-muted-foreground border border-dashed rounded-lg">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t.noMemories}</p>
          </div>
        )}
      </div>

      {/* Add new memory */}
      {!selectedTemplate && memories.length < 5 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t.addMemory}</Label>
          <div className="grid grid-cols-3 gap-2">
            {MEMORY_TEMPLATES.map((template: MemoryTemplate) => {
              const label = locale === 'es' ? template.labelEs : template.label;
              return (
                <Button
                  key={template.type}
                  variant="outline"
                  size="sm"
                  onClick={() => !disabled && setSelectedTemplate(template.type)}
                  disabled={disabled}
                  className="h-auto py-2 px-3 flex-col items-start text-left gap-1"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span>{template.icon}</span>
                    <span className="text-xs font-medium truncate">{label}</span>
                    {template.nsfw && (
                      <Badge variant="destructive" className="text-[10px] px-1 py-0 ml-auto">
                        {t.nsfw}
                      </Badge>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Memory creation form */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 p-4 border rounded-lg bg-muted/30"
          >
            {(() => {
              const template = getTemplateInfo(selectedTemplate);
              const placeholder = locale === 'es' ? template?.placeholderEs : template?.placeholder;
              return (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{template?.icon}</span>
                    <span className="font-medium">
                      {locale === 'es' ? template?.labelEs : template?.label}
                    </span>
                  </div>
                  <Textarea
                    value={newMemoryText}
                    onChange={(e) => setNewMemoryText(e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    className="resize-none"
                    disabled={disabled}
                  />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{t.importance}</Label>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(newMemoryWeight * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[newMemoryWeight]}
                      onValueChange={([v]) => setNewMemoryWeight(v)}
                      min={0.1}
                      max={1}
                      step={0.1}
                      disabled={disabled}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(null);
                        setNewMemoryText('');
                      }}
                    >
                      {t.cancel}
                    </Button>
                    <Button
                      size="sm"
                      onClick={addMemory}
                      disabled={!newMemoryText.trim() || disabled}
                      className="bg-gradient-to-r from-purple-600 to-pink-500"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {t.add}
                    </Button>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {memories.length >= 5 && (
        <p className="text-sm text-muted-foreground text-center">{t.maxMemories}</p>
      )}
    </div>
  );
}
