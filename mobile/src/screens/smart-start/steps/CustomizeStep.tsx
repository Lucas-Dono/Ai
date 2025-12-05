/**
 * Customize Step Component
 *
 * Fourth step: Customize character details (name, description, personality, appearance)
 * Redesigned: No auto-generation, no gradients, clean professional UI
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import type { SearchResult, GenreId, PersonalityCoreData, CharacterAppearanceData } from '@circuitpromptai/smart-start-core';
import { smartStartService } from '../../../services/smart-start.service';
import { EmotionSelector } from '../../../components/smart-start/EmotionSelector';
import {
  detectEmotion,
  getDetectionMessage,
  type EmotionType,
} from '../../../utils/emotion-detection';
import { colors } from '../../../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomizeStepProps {
  visible: boolean;
  completed: boolean;
  character?: SearchResult;
  genre: GenreId;
  onComplete: (data: {
    name: string;
    description: string;
    emotion: EmotionType;
    personality?: PersonalityCoreData;
    appearance?: CharacterAppearanceData;
  }) => void;
}

interface GenerationState {
  personality: boolean;
  appearance: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CustomizeStep({
  visible,
  completed,
  character,
  genre,
  onComplete,
}: CustomizeStepProps) {
  // Local state
  const [name, setName] = useState(character?.name || '');
  const [description, setDescription] = useState(character?.description || '');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [detectedEmotion, setDetectedEmotion] = useState<EmotionType | null>(null);
  const [detectionMessage, setDetectionMessage] = useState<string>('');

  const [personality, setPersonality] = useState<PersonalityCoreData | undefined>();
  const [appearance, setAppearance] = useState<CharacterAppearanceData | undefined>();
  const [hasGeneratedPersonality, setHasGeneratedPersonality] = useState(false);
  const [hasGeneratedAppearance, setHasGeneratedAppearance] = useState(false);
  const [isGenerating, setIsGenerating] = useState<GenerationState>({
    personality: false,
    appearance: false,
  });
  const [errors, setErrors] = useState<string[]>([]);

  // Animation
  const fadeIn = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      fadeIn.value = withSpring(1, { damping: 15, stiffness: 100 });

      // Auto-detect emotion from character
      if (character) {
        const detection = detectEmotion(character);
        if (detection) {
          setDetectedEmotion(detection.emotion);
          setDetectionMessage(
            getDetectionMessage(detection.emotion, detection.confidence)
          );

          // Auto-select detected emotion if no emotion is selected yet
          if (!selectedEmotion) {
            setSelectedEmotion(detection.emotion);
          }
        }
      }
    }
  }, [visible, character]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: fadeIn.value === 1 ? 0 : -20 }],
  }));

  if (!visible) return null;

  // ============================================================================
  // GENERATION HANDLERS
  // ============================================================================

  const handleGeneratePersonality = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Por favor ingresá un nombre de personaje primero');
      return;
    }

    setIsGenerating((prev) => ({ ...prev, personality: true }));
    setErrors([]);

    try {
      const personalityText = `${name}. ${description || 'Un personaje original.'}`;

      const result = await smartStartService.generatePersonality(personalityText, {
        characterName: name,
      } as any);

      if ((result as any).personality) {
        setPersonality((result as any).personality);
        setHasGeneratedPersonality(true);
      } else if ((result as any).error) {
        setErrors([(result as any).error]);
      }
    } catch (error) {
      console.error('[CustomizeStep] Personality generation error:', error);
      setErrors([error instanceof Error ? error.message : 'Generación de personalidad fallida']);
    } finally {
      setIsGenerating((prev) => ({ ...prev, personality: false }));
    }
  }, [name, description, genre]);

  const handleGenerateAppearance = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Por favor ingresá un nombre de personaje primero');
      return;
    }

    setIsGenerating((prev) => ({ ...prev, appearance: true }));
    setErrors([]);

    try {
      const result = await smartStartService.generateAppearance({
        characterName: name,
        personality: description,
      } as any);

      if ((result as any).appearance) {
        setAppearance((result as any).appearance);
        setHasGeneratedAppearance(true);
      } else if ((result as any).error) {
        setErrors([(result as any).error]);
      }
    } catch (error) {
      console.error('[CustomizeStep] Appearance generation error:', error);
      setErrors([error instanceof Error ? error.message : 'Generación de apariencia fallida']);
    } finally {
      setIsGenerating((prev) => ({ ...prev, appearance: false }));
    }
  }, [name, description, genre]);

  // ============================================================================
  // NAVIGATION HANDLERS
  // ============================================================================

  const handleContinue = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Por favor ingresá un nombre de personaje');
      return;
    }

    if (!selectedEmotion) {
      Alert.alert('Emoción requerida', 'Por favor seleccioná un tono emocional para el personaje');
      return;
    }

    onComplete({
      name,
      description,
      emotion: selectedEmotion,
      personality,
      appearance,
    });
  }, [name, description, selectedEmotion, personality, appearance, onComplete]);

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Character Header (if exists) */}
      {character && (
        <View style={styles.characterHeader}>
          {character.imageUrl ? (
            <Image source={{ uri: character.imageUrl }} style={styles.characterImage} />
          ) : (
            <View style={[styles.characterImage, styles.characterImagePlaceholder]}>
              <Feather name="user" size={40} color="#ffffff" />
            </View>
          )}
          <View style={styles.characterInfo}>
            <Text style={styles.characterName}>{character.name}</Text>
            {character.sourceTitle && (
              <View style={styles.characterSourceContainer}>
                <Feather name="book-open" size={14} color="#8b5cf6" />
                <Text style={styles.characterSource}>{character.sourceTitle}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Basic Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información básica</Text>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Nombre *</Text>
          <TextInput
            style={styles.fieldInput}
            value={name}
            onChangeText={setName}
            placeholder="Nombre del personaje"
            placeholderTextColor="#666666"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Descripción</Text>
          <TextInput
            style={[styles.fieldInput, styles.fieldInputMultiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descripción breve del personaje..."
            placeholderTextColor="#666666"
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      {/* Personality Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>⚡</Text>
          <Text style={styles.sectionTitle}>Personalidad</Text>
          {hasGeneratedPersonality && <StatusBadge text="Generado" />}
        </View>
        <Text style={styles.sectionDescription}>
          La IA creará rasgos únicos de personalidad, valores y profundidad emocional
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.generateButton,
            pressed && !isGenerating.personality && { opacity: 0.8 },
            isGenerating.personality && { opacity: 0.6 },
          ]}
          onPress={handleGeneratePersonality}
          disabled={isGenerating.personality}
        >
          {isGenerating.personality ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Feather
                name={hasGeneratedPersonality ? 'refresh-cw' : 'cpu'}
                size={18}
                color="#ffffff"
              />
              <Text style={styles.generateButtonText}>
                {hasGeneratedPersonality ? 'Regenerar personalidad' : 'Generar personalidad'}
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>📷</Text>
          <Text style={styles.sectionTitle}>Apariencia</Text>
          {hasGeneratedAppearance && <StatusBadge text="Generado" />}
        </View>
        <Text style={styles.sectionDescription}>
          La IA generará atributos físicos y características visuales detalladas
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.generateButton,
            pressed && !isGenerating.appearance && { opacity: 0.8 },
            isGenerating.appearance && { opacity: 0.6 },
          ]}
          onPress={handleGenerateAppearance}
          disabled={isGenerating.appearance}
        >
          {isGenerating.appearance ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Feather
                name={hasGeneratedAppearance ? 'refresh-cw' : 'camera'}
                size={18}
                color="#ffffff"
              />
              <Text style={styles.generateButtonText}>
                {hasGeneratedAppearance ? 'Regenerar apariencia' : 'Generar apariencia'}
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Emotion Selection Section */}
      <View style={styles.section}>
        <EmotionSelector
          selectedEmotion={selectedEmotion}
          onSelectEmotion={setSelectedEmotion}
          detectedEmotion={detectedEmotion}
          detectionMessage={detectionMessage}
          disabled={isGenerating.personality || isGenerating.appearance}
        />
      </View>

      {/* Errors */}
      {errors.length > 0 && (
        <View style={styles.errorsContainer}>
          <Feather name="alert-triangle" size={20} color="#ef4444" />
          <View style={styles.errorsContent}>
            {errors.map((error, index) => (
              <Text key={index} style={styles.errorText}>
                {error}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Continue Button */}
      <Pressable
        style={({ pressed }) => [
          styles.continueButton,
          pressed && { opacity: 0.85 },
          (isGenerating.personality || isGenerating.appearance) && { opacity: 0.5 },
        ]}
        onPress={handleContinue}
        disabled={isGenerating.personality || isGenerating.appearance}
      >
        <Text style={styles.continueButtonText}>Continuar a revisión</Text>
        <Feather name="arrow-right" size={18} color="#ffffff" />
      </Pressable>
    </Animated.View>
  );
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

function StatusBadge({ text }: { text: string }) {
  return (
    <View style={styles.statusBadge}>
      <Text style={styles.statusText}>{text}</Text>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  // Character Header
  characterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  characterImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  characterImagePlaceholder: {
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  characterSourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  characterSource: {
    fontSize: 14,
    color: '#a1a1a1',
    fontWeight: '500',
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    letterSpacing: 0.2,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#a1a1a1',
    lineHeight: 21,
    marginBottom: 16,
    fontWeight: '400',
  },

  // Field
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  fieldInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    fontWeight: '500',
  },
  fieldInputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Generate Button
  generateButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  generateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
  },

  // Errors
  errorsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 24,
  },
  errorsContent: {
    flex: 1,
    gap: 6,
  },
  errorText: {
    fontSize: 14,
    color: '#fca5a5',
    lineHeight: 20,
    fontWeight: '500',
  },

  // Continue Button
  continueButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
});
