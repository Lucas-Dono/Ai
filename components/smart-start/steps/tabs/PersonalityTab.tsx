'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import type { BigFiveTraits } from '@/types/character-creation';

interface PersonalityTabProps {
  personality: string;
  traits: string;
  bigFive: BigFiveTraits;
  onUpdate: (field: string, value: string | BigFiveTraits) => void;
  onGenerateBigFive: () => Promise<void>;
  isGenerating?: boolean;
  disabled?: boolean;
}

const BIG_FIVE_TRAITS: {
  key: keyof BigFiveTraits;
  labelKey: string;
  lowKey: string;
  highKey: string;
}[] = [
  { key: 'openness', labelKey: 'openness', lowKey: 'conventional', highKey: 'creative' },
  { key: 'conscientiousness', labelKey: 'conscientiousness', lowKey: 'flexible', highKey: 'organized' },
  { key: 'extraversion', labelKey: 'extraversion', lowKey: 'introverted', highKey: 'extroverted' },
  { key: 'agreeableness', labelKey: 'agreeableness', lowKey: 'analytical', highKey: 'empathetic' },
  { key: 'neuroticism', labelKey: 'neuroticism', lowKey: 'stable', highKey: 'sensitive' },
];

export function PersonalityTab({
  personality,
  traits,
  bigFive,
  onUpdate,
  onGenerateBigFive,
  isGenerating = false,
  disabled = false,
}: PersonalityTabProps) {
  const t = useTranslations('smartStart.customize.personality');
  const [bigFiveOpen, setBigFiveOpen] = useState(false);

  const handleBigFiveChange = (key: keyof BigFiveTraits, value: number) => {
    onUpdate('bigFive', { ...bigFive, [key]: value });
  };

  return (
    <div className="space-y-5">
      {/* Personality Description */}
      <div className="space-y-2">
        <Label htmlFor="personality">{t('description.label')}</Label>
        <Textarea
          id="personality"
          value={personality}
          onChange={(e) => onUpdate('personality', e.target.value)}
          placeholder={t('description.placeholder')}
          rows={4}
          disabled={disabled}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">{t('description.help')}</p>
      </div>

      {/* Traits */}
      <div className="space-y-2">
        <Label htmlFor="traits">{t('traits.label')}</Label>
        <Input
          id="traits"
          value={traits}
          onChange={(e) => onUpdate('traits', e.target.value)}
          placeholder={t('traits.placeholder')}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">{t('traits.help')}</p>
      </div>

      {/* Big Five - Collapsible */}
      <Collapsible open={bigFiveOpen} onOpenChange={setBigFiveOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-3 h-auto border rounded-lg"
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{t('bigFive.title')}</span>
              <span className="text-xs text-muted-foreground">
                ({t('bigFive.optional')})
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${bigFiveOpen ? 'rotate-180' : ''}`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            {/* Auto-generate button */}
            <div className="flex items-center justify-between pb-3 border-b">
              <p className="text-sm text-muted-foreground">{t('bigFive.autoGenerate')}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerateBigFive}
                disabled={isGenerating || disabled || !personality}
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {t('bigFive.generateButton')}
              </Button>
            </div>

            {/* Sliders */}
            {BIG_FIVE_TRAITS.map(({ key, labelKey, lowKey, highKey }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{t(`bigFive.traits.${labelKey}`)}</Label>
                  <span className="text-sm text-muted-foreground font-mono">
                    {bigFive[key]}
                  </span>
                </div>
                <Slider
                  value={[bigFive[key]]}
                  onValueChange={([value]) => handleBigFiveChange(key, value)}
                  min={0}
                  max={100}
                  step={1}
                  disabled={disabled}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t(`bigFive.poles.${lowKey}`)}</span>
                  <span>{t(`bigFive.poles.${highKey}`)}</span>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
