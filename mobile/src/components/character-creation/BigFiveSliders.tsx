/**
 * Big Five Sliders Component - Controles para las 5 dimensiones de personalidad
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../../theme';

interface BigFiveData {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface BigFiveSlidersProps {
  values: BigFiveData;
  onChange: (values: BigFiveData) => void;
}

interface TraitConfig {
  key: keyof BigFiveData;
  label: string;
  lowLabel: string;
  highLabel: string;
  description: string;
}

const traits: TraitConfig[] = [
  {
    key: 'openness',
    label: 'Apertura a la Experiencia',
    lowLabel: 'Convencional',
    highLabel: 'Creativo',
    description: 'Curiosidad, imaginación, apertura a nuevas ideas',
  },
  {
    key: 'conscientiousness',
    label: 'Responsabilidad',
    lowLabel: 'Espontáneo',
    highLabel: 'Organizado',
    description: 'Disciplina, organización, cumplimiento de deberes',
  },
  {
    key: 'extraversion',
    label: 'Extraversión',
    lowLabel: 'Introvertido',
    highLabel: 'Extrovertido',
    description: 'Sociabilidad, energía, emociones positivas',
  },
  {
    key: 'agreeableness',
    label: 'Amabilidad',
    lowLabel: 'Competitivo',
    highLabel: 'Cooperativo',
    description: 'Empatía, confianza, altruismo',
  },
  {
    key: 'neuroticism',
    label: 'Neuroticismo',
    lowLabel: 'Estable',
    highLabel: 'Emocional',
    description: 'Tendencia a emociones negativas, ansiedad',
  },
];

const getTraitColor = (value: number): string => {
  if (value < 25) return colors.info.main;
  if (value < 50) return colors.primary[500];
  if (value < 75) return colors.warning.main;
  return colors.success.main;
};

const getTraitDescription = (key: keyof BigFiveData, value: number): string => {
  const descriptions: Record<keyof BigFiveData, { low: string; mid: string; high: string }> = {
    openness: {
      low: 'Práctico, tradicional, prefiere lo familiar',
      mid: 'Balance entre creatividad y practicidad',
      high: 'Imaginativo, curioso, busca nuevas experiencias',
    },
    conscientiousness: {
      low: 'Flexible, espontáneo, desorganizado',
      mid: 'Moderadamente organizado y planificador',
      high: 'Meticuloso, disciplinado, muy organizado',
    },
    extraversion: {
      low: 'Reservado, prefiere soledad, introspectivo',
      mid: 'Ambivertido, equilibrio social-soledad',
      high: 'Sociable, enérgico, busca estimulación',
    },
    agreeableness: {
      low: 'Directo, competitivo, escéptico',
      mid: 'Balance entre asertividad y cooperación',
      high: 'Empático, confiado, cooperativo',
    },
    neuroticism: {
      low: 'Calmado, seguro, emocionalmente estable',
      mid: 'Equilibrio emocional, ocasionalmente ansioso',
      high: 'Sensible, ansioso, emocionalmente reactivo',
    },
  };

  if (value < 35) return descriptions[key].low;
  if (value < 65) return descriptions[key].mid;
  return descriptions[key].high;
};

export function BigFiveSliders({ values, onChange }: BigFiveSlidersProps) {
  const handleChange = (key: keyof BigFiveData, value: number) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Big Five - Modelo de Personalidad</Text>
      <Text style={styles.subtitle}>
        Ajusta los 5 rasgos fundamentales de personalidad
      </Text>

      {traits.map((trait) => {
        const value = values[trait.key];
        const color = getTraitColor(value);

        return (
          <View key={trait.key} style={styles.traitContainer}>
            <View style={styles.traitHeader}>
              <Text style={styles.traitLabel}>{trait.label}</Text>
              <Text style={[styles.traitValue, { color }]}>{value}</Text>
            </View>

            <Text style={styles.traitDescription}>{trait.description}</Text>

            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={value}
              onValueChange={(val) => handleChange(trait.key, val)}
              minimumTrackTintColor={color}
              maximumTrackTintColor={colors.border.subtle}
              thumbTintColor={color}
            />

            <View style={styles.labelsRow}>
              <Text style={styles.extremeLabel}>{trait.lowLabel}</Text>
              <Text style={styles.extremeLabel}>{trait.highLabel}</Text>
            </View>

            <View style={styles.interpretationBox}>
              <Text style={styles.interpretationText}>
                {getTraitDescription(trait.key, value)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  traitContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 8,
  },
  traitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  traitLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  traitValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  traitDescription: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 8,
  },
  extremeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  interpretationBox: {
    backgroundColor: colors.background.primary,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
    padding: 8,
    borderRadius: 4,
  },
  interpretationText: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
});
