/**
 * Customization Step - React Native
 * Allows users to edit generated character details
 * Similar to web CharacterCustomization component
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { DEV_API_URL } from '@env';
import { colors } from '../../../theme';

const API_URL = DEV_API_URL || 'http://localhost:3000';

// Types
interface BigFiveTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface CharacterDraft {
  name?: string;
  age?: number;
  gender?: string;
  occupation?: string;
  personality?: string;
  traits?: string[];
  personalityCore?: BigFiveTraits;
  characterAppearance?: {
    hairColor?: string;
    hairStyle?: string;
    eyeColor?: string;
    clothing?: string;
    style?: string;
    ethnicity?: string;
  };
}

interface CustomizationStepProps {
  visible: boolean;
  completed: boolean;
  draft: CharacterDraft;
  onUpdate: (updates: Partial<CharacterDraft>) => void;
  onContinue: () => void;
}

type TabType = 'basic' | 'personality' | 'appearance';

const DEFAULT_BIG_FIVE: BigFiveTraits = {
  openness: 50,
  conscientiousness: 50,
  extraversion: 50,
  agreeableness: 50,
  neuroticism: 50,
};

export function CustomizationStep({
  visible,
  completed,
  draft,
  onUpdate,
  onContinue,
}: CustomizationStepProps) {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [isGeneratingBigFive, setIsGeneratingBigFive] = useState(false);
  const [isGeneratingAppearance, setIsGeneratingAppearance] = useState(false);
  const [showBigFive, setShowBigFive] = useState(false);

  // Local state
  const [localDraft, setLocalDraft] = useState<CharacterDraft>({
    name: draft.name || '',
    age: draft.age || 25,
    gender: draft.gender || '',
    occupation: draft.occupation || '',
    personality: draft.personality || '',
    traits: draft.traits || [],
    personalityCore: draft.personalityCore || DEFAULT_BIG_FIVE,
    characterAppearance: draft.characterAppearance || {
      hairColor: '',
      hairStyle: '',
      eyeColor: '',
      clothing: '',
      style: 'realistic',
      ethnicity: '',
    },
  });

  // Sync from parent when draft changes
  useEffect(() => {
    if (draft.name) {
      setLocalDraft({
        name: draft.name,
        age: draft.age || 25,
        gender: draft.gender,
        occupation: draft.occupation,
        personality: draft.personality,
        traits: draft.traits || [],
        personalityCore: draft.personalityCore || DEFAULT_BIG_FIVE,
        characterAppearance: draft.characterAppearance || localDraft.characterAppearance,
      });
    }
  }, [draft]);

  const handleUpdate = useCallback((field: string, value: any) => {
    setLocalDraft(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleAppearanceUpdate = useCallback((field: string, value: string) => {
    setLocalDraft(prev => ({
      ...prev,
      characterAppearance: {
        ...prev.characterAppearance,
        [field]: value,
      },
    }));
  }, []);

  const handleBigFiveUpdate = useCallback((trait: keyof BigFiveTraits, value: number) => {
    setLocalDraft(prev => ({
      ...prev,
      personalityCore: {
        ...(prev.personalityCore || DEFAULT_BIG_FIVE),
        [trait]: value,
      },
    }));
  }, []);

  const handleGenerateBigFive = useCallback(async () => {
    if (!localDraft.personality) {
      Alert.alert('Error', 'Agrega una descripción de personalidad primero');
      return;
    }

    setIsGeneratingBigFive(true);
    try {
      const response = await fetch(`${API_URL}/api/smart-start/generate-personality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalityText: localDraft.personality,
          context: {
            name: localDraft.name,
            age: String(localDraft.age),
            gender: localDraft.gender,
            occupation: localDraft.occupation,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar Big Five');
      }

      const data = await response.json();
      handleUpdate('personalityCore', data.bigFive);
    } catch (error) {
      console.error('Error generating Big Five:', error);
      Alert.alert('Error', 'No se pudo generar el análisis de personalidad');
    } finally {
      setIsGeneratingBigFive(false);
    }
  }, [localDraft, handleUpdate]);

  const handleGenerateAppearance = useCallback(async () => {
    setIsGeneratingAppearance(true);
    try {
      const response = await fetch(`${API_URL}/api/smart-start/generate-appearance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: localDraft.name,
          age: String(localDraft.age),
          gender: localDraft.gender,
          personality: localDraft.personality,
          occupation: localDraft.occupation,
          ethnicity: localDraft.characterAppearance?.ethnicity,
          style: localDraft.characterAppearance?.style,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar apariencia');
      }

      const data = await response.json();
      setLocalDraft(prev => ({
        ...prev,
        characterAppearance: {
          ...prev.characterAppearance,
          hairColor: data.hairColor,
          hairStyle: data.hairStyle,
          eyeColor: data.eyeColor,
          clothing: data.clothing,
        },
      }));
    } catch (error) {
      console.error('Error generating appearance:', error);
      Alert.alert('Error', 'No se pudo generar la apariencia');
    } finally {
      setIsGeneratingAppearance(false);
    }
  }, [localDraft]);

  const handleContinue = useCallback(() => {
    // Sync to parent
    onUpdate(localDraft);
    onContinue();
  }, [localDraft, onUpdate, onContinue]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Personalizar Detalles</Text>
        <Text style={styles.subtitle}>
          Ajusta los detalles generados por la IA
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'basic' && styles.tabActive]}
          onPress={() => setActiveTab('basic')}
        >
          <Ionicons
            name="person"
            size={18}
            color={activeTab === 'basic' ? '#8b5cf6' : colors.text.secondary}
          />
          <Text style={[styles.tabText, activeTab === 'basic' && styles.tabTextActive]}>
            Básico
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'personality' && styles.tabActive]}
          onPress={() => setActiveTab('personality')}
        >
          <Ionicons
            name="brain"
            size={18}
            color={activeTab === 'personality' ? '#8b5cf6' : colors.text.secondary}
          />
          <Text style={[styles.tabText, activeTab === 'personality' && styles.tabTextActive]}>
            Personalidad
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'appearance' && styles.tabActive]}
          onPress={() => setActiveTab('appearance')}
        >
          <Ionicons
            name="color-palette"
            size={18}
            color={activeTab === 'appearance' ? '#8b5cf6' : colors.text.secondary}
          />
          <Text style={[styles.tabText, activeTab === 'appearance' && styles.tabTextActive]}>
            Apariencia
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <View style={styles.tabContent}>
            <View style={styles.field}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                value={localDraft.name}
                onChangeText={(text) => handleUpdate('name', text)}
                placeholder="Nombre del personaje"
                placeholderTextColor={colors.text.tertiary}
                style={styles.input}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, styles.fieldHalf]}>
                <Text style={styles.label}>Edad</Text>
                <TextInput
                  value={String(localDraft.age)}
                  onChangeText={(text) => handleUpdate('age', parseInt(text) || 25)}
                  placeholder="25"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <View style={[styles.field, styles.fieldHalf]}>
                <Text style={styles.label}>Género</Text>
                <TextInput
                  value={localDraft.gender}
                  onChangeText={(text) => handleUpdate('gender', text)}
                  placeholder="Masculino, Femenino..."
                  placeholderTextColor={colors.text.tertiary}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Ocupación</Text>
              <TextInput
                value={localDraft.occupation}
                onChangeText={(text) => handleUpdate('occupation', text)}
                placeholder="¿A qué se dedica?"
                placeholderTextColor={colors.text.tertiary}
                style={styles.input}
              />
            </View>
          </View>
        )}

        {/* Personality Tab */}
        {activeTab === 'personality' && (
          <View style={styles.tabContent}>
            <View style={styles.field}>
              <Text style={styles.label}>Descripción de Personalidad</Text>
              <TextInput
                value={localDraft.personality}
                onChangeText={(text) => handleUpdate('personality', text)}
                placeholder="Describe su personalidad..."
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={4}
                style={[styles.input, styles.textArea]}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Rasgos (separados por coma)</Text>
              <TextInput
                value={Array.isArray(localDraft.traits) ? localDraft.traits.join(', ') : ''}
                onChangeText={(text) => handleUpdate('traits', text.split(',').map(t => t.trim()))}
                placeholder="valiente, leal, curioso..."
                placeholderTextColor={colors.text.tertiary}
                style={styles.input}
              />
            </View>

            {/* Big Five Collapsible */}
            <TouchableOpacity
              style={styles.collapsibleHeader}
              onPress={() => setShowBigFive(!showBigFive)}
            >
              <View style={styles.collapsibleTitleRow}>
                <Text style={styles.collapsibleTitle}>Big Five (Opcional)</Text>
                <Ionicons
                  name={showBigFive ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.text.secondary}
                />
              </View>
            </TouchableOpacity>

            {showBigFive && (
              <View style={styles.bigFiveContainer}>
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={handleGenerateBigFive}
                  disabled={isGeneratingBigFive || !localDraft.personality}
                >
                  {isGeneratingBigFive ? (
                    <ActivityIndicator size="small" color="#8b5cf6" />
                  ) : (
                    <Ionicons name="sparkles" size={16} color="#8b5cf6" />
                  )}
                  <Text style={styles.generateButtonText}>Generar con IA</Text>
                </TouchableOpacity>

                {['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'].map((trait) => {
                  const traitKey = trait as keyof BigFiveTraits;
                  const value = localDraft.personalityCore?.[traitKey] || 50;
                  const labels = {
                    openness: { name: 'Apertura', low: 'Convencional', high: 'Creativo' },
                    conscientiousness: { name: 'Responsabilidad', low: 'Flexible', high: 'Organizado' },
                    extraversion: { name: 'Extraversión', low: 'Introvertido', high: 'Extrovertido' },
                    agreeableness: { name: 'Amabilidad', low: 'Analítico', high: 'Empático' },
                    neuroticism: { name: 'Neuroticismo', low: 'Estable', high: 'Sensible' },
                  };

                  return (
                    <View key={trait} style={styles.sliderField}>
                      <View style={styles.sliderHeader}>
                        <Text style={styles.sliderLabel}>{labels[traitKey].name}</Text>
                        <Text style={styles.sliderValue}>{value}</Text>
                      </View>
                      <Slider
                        value={value}
                        onValueChange={(val) => handleBigFiveUpdate(traitKey, Math.round(val))}
                        minimumValue={0}
                        maximumValue={100}
                        step={1}
                        minimumTrackTintColor="#8b5cf6"
                        maximumTrackTintColor={colors.border.light}
                        thumbTintColor="#8b5cf6"
                        style={styles.slider}
                      />
                      <View style={styles.sliderLabels}>
                        <Text style={styles.sliderPole}>{labels[traitKey].low}</Text>
                        <Text style={styles.sliderPole}>{labels[traitKey].high}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <View style={styles.tabContent}>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerateAppearance}
              disabled={isGeneratingAppearance}
            >
              {isGeneratingAppearance ? (
                <ActivityIndicator size="small" color="#8b5cf6" />
              ) : (
                <Ionicons name="sparkles" size={16} color="#8b5cf6" />
              )}
              <Text style={styles.generateButtonText}>Generar Apariencia con IA</Text>
            </TouchableOpacity>

            <View style={styles.field}>
              <Text style={styles.label}>Color de Cabello</Text>
              <TextInput
                value={localDraft.characterAppearance?.hairColor}
                onChangeText={(text) => handleAppearanceUpdate('hairColor', text)}
                placeholder="Negro, Rubio, Castaño..."
                placeholderTextColor={colors.text.tertiary}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Estilo de Cabello</Text>
              <TextInput
                value={localDraft.characterAppearance?.hairStyle}
                onChangeText={(text) => handleAppearanceUpdate('hairStyle', text)}
                placeholder="Largo, Corto, Rizado..."
                placeholderTextColor={colors.text.tertiary}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Color de Ojos</Text>
              <TextInput
                value={localDraft.characterAppearance?.eyeColor}
                onChangeText={(text) => handleAppearanceUpdate('eyeColor', text)}
                placeholder="Marrones, Azules, Verdes..."
                placeholderTextColor={colors.text.tertiary}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Vestimenta Típica</Text>
              <TextInput
                value={localDraft.characterAppearance?.clothing}
                onChangeText={(text) => handleAppearanceUpdate('clothing', text)}
                placeholder="Casual, Formal, Deportiva..."
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Etnia</Text>
              <TextInput
                value={localDraft.characterAppearance?.ethnicity}
                onChangeText={(text) => handleAppearanceUpdate('ethnicity', text)}
                placeholder="Caucásico, Asiático, Latino..."
                placeholderTextColor={colors.text.tertiary}
                style={styles.input}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !localDraft.name && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!localDraft.name}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  tabActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#8b5cf6',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: '#8b5cf6',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    gap: 16,
    paddingBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  fieldHalf: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  collapsibleHeader: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    marginBottom: 12,
  },
  collapsibleTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsibleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  bigFiveContainer: {
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    gap: 16,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 8,
  },
  generateButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  sliderField: {
    gap: 8,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sliderValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderPole: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  footer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
