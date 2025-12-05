'use client';

import { useTranslations } from 'next-intl';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CharacterStyle } from '@/types/character-creation';

interface AppearanceTabProps {
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  clothing: string;
  style: CharacterStyle;
  ethnicity: string;
  onUpdate: (field: string, value: string) => void;
  onGenerateAppearance: () => Promise<void>;
  isGenerating?: boolean;
  disabled?: boolean;
}

const STYLE_OPTIONS: { value: CharacterStyle; labelKey: string }[] = [
  { value: 'realistic', labelKey: 'realistic' },
  { value: 'semi-realistic', labelKey: 'semiRealistic' },
  { value: 'anime', labelKey: 'anime' },
];

const ETHNICITY_OPTIONS = [
  'caucasian',
  'asian',
  'hispanic',
  'african',
  'middle-eastern',
  'mixed',
  'other',
];

const HAIR_COLORS = [
  'black',
  'brown',
  'blonde',
  'red',
  'auburn',
  'gray',
  'white',
  'other',
];

const EYE_COLORS = [
  'brown',
  'blue',
  'green',
  'hazel',
  'gray',
  'amber',
  'other',
];

export function AppearanceTab({
  hairColor,
  hairStyle,
  eyeColor,
  clothing,
  style,
  ethnicity,
  onUpdate,
  onGenerateAppearance,
  isGenerating = false,
  disabled = false,
}: AppearanceTabProps) {
  const t = useTranslations('smartStart.customize.appearance');

  return (
    <div className="space-y-5">
      {/* Auto-generate button */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div>
          <p className="text-sm font-medium">{t('autoGenerate.title')}</p>
          <p className="text-xs text-muted-foreground">{t('autoGenerate.description')}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onGenerateAppearance}
          disabled={isGenerating || disabled}
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          {t('autoGenerate.button')}
        </Button>
      </div>

      {/* Style Selection */}
      <div className="space-y-2">
        <Label htmlFor="style">{t('style.label')}</Label>
        <Select
          value={style}
          onValueChange={(value) => onUpdate('style', value)}
          disabled={disabled}
        >
          <SelectTrigger id="style">
            <SelectValue placeholder={t('style.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {STYLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(`style.options.${option.labelKey}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{t('style.help')}</p>
      </div>

      {/* Ethnicity */}
      <div className="space-y-2">
        <Label htmlFor="ethnicity">{t('ethnicity.label')}</Label>
        <Select
          value={ethnicity}
          onValueChange={(value) => onUpdate('ethnicity', value)}
          disabled={disabled}
        >
          <SelectTrigger id="ethnicity">
            <SelectValue placeholder={t('ethnicity.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {ETHNICITY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {t(`ethnicity.options.${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hair Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Hair Color */}
        <div className="space-y-2">
          <Label htmlFor="hairColor">{t('hair.color.label')}</Label>
          <Select
            value={hairColor}
            onValueChange={(value) => onUpdate('hairColor', value)}
            disabled={disabled}
          >
            <SelectTrigger id="hairColor">
              <SelectValue placeholder={t('hair.color.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {HAIR_COLORS.map((color) => (
                <SelectItem key={color} value={color}>
                  {t(`hair.color.options.${color}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Eye Color */}
        <div className="space-y-2">
          <Label htmlFor="eyeColor">{t('eyes.color.label')}</Label>
          <Select
            value={eyeColor}
            onValueChange={(value) => onUpdate('eyeColor', value)}
            disabled={disabled}
          >
            <SelectTrigger id="eyeColor">
              <SelectValue placeholder={t('eyes.color.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {EYE_COLORS.map((color) => (
                <SelectItem key={color} value={color}>
                  {t(`eyes.color.options.${color}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hair Style */}
      <div className="space-y-2">
        <Label htmlFor="hairStyle">{t('hair.style.label')}</Label>
        <Input
          id="hairStyle"
          value={hairStyle}
          onChange={(e) => onUpdate('hairStyle', e.target.value)}
          placeholder={t('hair.style.placeholder')}
          disabled={disabled}
        />
      </div>

      {/* Clothing */}
      <div className="space-y-2">
        <Label htmlFor="clothing">{t('clothing.label')}</Label>
        <Textarea
          id="clothing"
          value={clothing}
          onChange={(e) => onUpdate('clothing', e.target.value)}
          placeholder={t('clothing.placeholder')}
          rows={2}
          disabled={disabled}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">{t('clothing.help')}</p>
      </div>
    </div>
  );
}
