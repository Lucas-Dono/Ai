'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { GenderType, AgeRange } from '@/types/character-creation';

interface BasicInfoTabProps {
  name: string;
  age: string;
  gender: string;
  occupation: string;
  onUpdate: (field: string, value: string) => void;
  disabled?: boolean;
}

const GENDER_OPTIONS: { value: GenderType; labelKey: string }[] = [
  { value: 'male', labelKey: 'male' },
  { value: 'female', labelKey: 'female' },
  { value: 'non-binary', labelKey: 'nonBinary' },
  { value: 'other', labelKey: 'other' },
];

const AGE_OPTIONS: { value: AgeRange; labelKey: string }[] = [
  { value: '18-22', labelKey: '18-22' },
  { value: '23-27', labelKey: '23-27' },
  { value: '28-35', labelKey: '28-35' },
  { value: '36-45', labelKey: '36-45' },
  { value: '46-60', labelKey: '46-60' },
  { value: '60+', labelKey: '60+' },
];

export function BasicInfoTab({
  name,
  age,
  gender,
  occupation,
  onUpdate,
  disabled = false,
}: BasicInfoTabProps) {
  const t = useTranslations('smartStart.customize.basic');

  return (
    <div className="space-y-5">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-1">
          {t('name.label')}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onUpdate('name', e.target.value)}
          placeholder={t('name.placeholder')}
          disabled={disabled}
          className="text-base"
        />
      </div>

      {/* Gender and Age Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender">{t('gender.label')}</Label>
          <Select
            value={gender}
            onValueChange={(value) => onUpdate('gender', value)}
            disabled={disabled}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder={t('gender.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(`gender.options.${option.labelKey}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age">{t('age.label')}</Label>
          <Select
            value={age}
            onValueChange={(value) => onUpdate('age', value)}
            disabled={disabled}
          >
            <SelectTrigger id="age">
              <SelectValue placeholder={t('age.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {AGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Occupation */}
      <div className="space-y-2">
        <Label htmlFor="occupation">{t('occupation.label')}</Label>
        <Input
          id="occupation"
          value={occupation}
          onChange={(e) => onUpdate('occupation', e.target.value)}
          placeholder={t('occupation.placeholder')}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">{t('occupation.help')}</p>
      </div>
    </div>
  );
}
