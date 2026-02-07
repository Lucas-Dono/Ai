/**
 * @deprecated This screen is deprecated. Use SmartStartWizardScreen with CustomizeStep instead.
 * Kept for reference only. Do not use in active navigation.
 *
 * Character Customize Screen
 *
 * Fourth step in Smart Start wizard - customize character details
 * Features: Vibrant gradients, prominent character preview, professional AI generation UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { SmartStartStackParamList } from '../../navigation/SmartStartStack';
import { useSmartStartContext } from '../../contexts/SmartStartContext';
import { smartStartService } from '../../services/smart-start.service';
import type { SearchResult } from '@circuitpromptai/smart-start-core';
import { EmotionSelector } from '../../components/smart-start/EmotionSelector';
import {
  detectEmotion,
  getDetectionMessage,
  type EmotionType,
} from '../../utils/emotion-detection';

// ============================================================================
// TYPES
// ============================================================================

type CharacterCustomizeScreenNavigationProp = StackNavigationProp<
  SmartStartStackParamList,
  'CharacterCustomize'
>;

type CharacterCustomizeScreenRouteProp = RouteProp<
  SmartStartStackParamList,
  'CharacterCustomize'
>;

interface Props {
  navigation: CharacterCustomizeScreenNavigationProp;
  route: CharacterCustomizeScreenRouteProp;
}

interface GenerationState {
  personality: boolean;
  appearance: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function CharacterCustomizeScreen({ navigation, route }: Props) {
  const { character, genre, characterType } = route.params;
  const {
    draft,
    updateDraft,
    setPersonality,
    setAppearance,
    markStepComplete,
    setCurrentStep,
  } = useSmartStartContext();

  // Local state
  const [name, setName] = useState(character?.name || draft.name || '');
  const [description, setDescription] = useState(
    character?.description || draft.physicalAppearance || ''
  );
  const [hasGeneratedPersonality, setHasGeneratedPersonality] = useState(false);
  const [hasGeneratedAppearance, setHasGeneratedAppearance] = useState(false);
  const [isGenerating, setIsGenerating] = useState<GenerationState>({
    personality: false,
    appearance: false,
  });
  const [errors, setErrors] = useState<string[]>([]);

  // Emotion detection state
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(
    (draft.emotionalTone as EmotionType) || null
  );
  const [detectedEmotion, setDetectedEmotion] = useState<EmotionType | null>(null);
  const [detectionMessage, setDetectionMessage] = useState<string>('');

  // Animation
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    setCurrentStep('depth');
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

        console.log(
          `[CharacterCustomize] Auto-detected emotion: ${detection.emotion} (${detection.confidence}) from [${detection.detectedFrom.join(', ')}]`
        );
      }

      // Auto-generate personality and appearance
      handleAutoGenerate();
    }
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  // ============================================================================
  // GENERATION HANDLERS
  // ============================================================================

  const handleAutoGenerate = useCallback(async () => {
    if (!character) return;

    setIsGenerating({ personality: true, appearance: true });
    setErrors([]);

    try {
      const personalityText = `${character.name}${
        character.sourceTitle ? ` from ${character.sourceTitle}` : ''
      }. ${character.description || ''}`;

      const result = await smartStartService.generateCompleteProfile(personalityText, {
        characterName: character.name,
        sourceTitle: character.sourceTitle,
      } as any);

      if ((result as any).personality) {
        setPersonality((result as any).personality);
        setHasGeneratedPersonality(true);
      }

      if ((result as any).appearance) {
        setAppearance((result as any).appearance);
        setHasGeneratedAppearance(true);
      }

      if (result.errors.length > 0) {
        setErrors(result.errors);
      }

      console.log(
        `[CharacterCustomize] Generated profile. Tokens: ${result.tokensUsed.input}/${result.tokensUsed.output}`
      );
    } catch (error) {
      console.error('[CharacterCustomize] Auto-generate error:', error);
      setErrors([error instanceof Error ? error.message : 'Generation failed']);
    } finally {
      setIsGenerating({ personality: false, appearance: false });
    }
  }, [character, genre]);

  const handleGeneratePersonality = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter a character name first');
      return;
    }

    setIsGenerating((prev) => ({ ...prev, personality: true }));
    setErrors([]);

    try {
      const personalityText = `${name}. ${description || 'An original character.'}`;

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
      console.error('[CharacterCustomize] Personality generation error:', error);
      setErrors([error instanceof Error ? error.message : 'Personality generation failed']);
    } finally {
      setIsGenerating((prev) => ({ ...prev, personality: false }));
    }
  }, [name, description, genre]);

  const handleGenerateAppearance = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter a character name first');
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
      console.error('[CharacterCustomize] Appearance generation error:', error);
      setErrors([error instanceof Error ? error.message : 'Appearance generation failed']);
    } finally {
      setIsGenerating((prev) => ({ ...prev, appearance: false }));
    }
  }, [name, description, genre]);

  // ============================================================================
  // EMOTION HANDLERS
  // ============================================================================

  const handleEmotionChange = useCallback((emotion: EmotionType) => {
    setSelectedEmotion(emotion);

    // Update draft with selected emotion
    updateDraft({
      emotionalTone: emotion,
    });

    console.log(`[CharacterCustomize] Emotion changed to: ${emotion}`);
  }, [updateDraft]);

  // ============================================================================
  // NAVIGATION HANDLERS
  // ============================================================================

  const handleContinue = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter a character name');
      return;
    }

    if (!selectedEmotion) {
      Alert.alert('Emotion Required', 'Please select an emotional tone for the character');
      return;
    }

    // Update draft with final data
    updateDraft({
      name,
      physicalAppearance: description,
      emotionalTone: selectedEmotion,
    });

    // Mark step complete
    markStepComplete('customize');

    // Navigate to review
    navigation.navigate('CharacterReview', { draft });
  }, [name, description, selectedEmotion, draft, updateDraft, markStepComplete, navigation]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#1a0b2e', '#2d1b4e', '#4a2472']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.content, containerAnimatedStyle]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Character Header - Prominent & Emotional */}
          {character && (
            <View style={styles.characterHeader}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.2)', 'rgba(124, 58, 237, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.characterHeaderGradient}
              >
                <BlurView intensity={20} tint="dark" style={styles.characterHeaderBlur}>
                  {/* Image with Gradient Border */}
                  <View style={styles.characterImageContainer}>
                    <LinearGradient
                      colors={['#8b5cf6', '#ec4899', '#06b6d4']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.characterImageBorder}
                    >
                      {character.imageUrl ? (
                        <Image source={{ uri: character.imageUrl }} style={styles.characterImage} />
                      ) : (
                        <LinearGradient
                          colors={['#8b5cf6', '#7c3aed']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.characterImagePlaceholder}
                        >
                          <Feather name="user" size={56} color="#ffffff" />
                        </LinearGradient>
                      )}
                    </LinearGradient>
                  </View>

                  {/* Character Info */}
                  <Text style={styles.characterName}>{character.name}</Text>
                  {character.sourceTitle && (
                    <View style={styles.characterSourceContainer}>
                      <Feather name="book-open" size={16} color="#a78bfa" />
                      <Text style={styles.characterSource}>{character.sourceTitle}</Text>
                    </View>
                  )}
                </BlurView>
              </LinearGradient>
            </View>
          )}

          {/* Basic Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Name *</Text>
              <TextInput
                style={styles.fieldInput}
                value={name}
                onChangeText={setName}
                placeholder="Character name"
                placeholderTextColor="#6b7280"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldInputMultiline]}
                value={description}
                onChangeText={setDescription}
                placeholder="Brief description of the character..."
                placeholderTextColor="#6b7280"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Emotion Selection Section */}
          <View style={styles.section}>
            <EmotionSelector
              selectedEmotion={selectedEmotion}
              onSelectEmotion={handleEmotionChange}
              detectedEmotion={detectedEmotion}
              detectionMessage={detectionMessage}
              disabled={isGenerating.personality || isGenerating.appearance}
            />
          </View>

          {/* Personality Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="zap" size={22} color="#f59e0b" />
              <Text style={styles.sectionTitle}>Personality</Text>
              {hasGeneratedPersonality && <StatusBadge text="Generated" type="success" />}
            </View>
            <Text style={styles.sectionDescription}>
              AI will analyze and create unique personality traits, values, and emotional depth
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.generateButtonPressable,
                pressed && !isGenerating.personality && { opacity: 0.8 },
              ]}
              onPress={handleGeneratePersonality}
              disabled={isGenerating.personality}
            >
              <LinearGradient
                colors={hasGeneratedPersonality ? ['#f59e0b', '#fbbf24'] : ['#8b5cf6', '#7c3aed']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.generateButtonGradient,
                  isGenerating.personality && { opacity: 0.6 },
                ]}
              >
                {isGenerating.personality ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Feather
                      name={hasGeneratedPersonality ? 'refresh-cw' : 'cpu'}
                      size={20}
                      color="#ffffff"
                    />
                    <Text style={styles.generateButtonText}>
                      {hasGeneratedPersonality ? 'Regenerate Personality' : 'Generate Personality'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* Appearance Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="image" size={22} color="#ec4899" />
              <Text style={styles.sectionTitle}>Appearance</Text>
              {hasGeneratedAppearance && <StatusBadge text="Generated" type="success" />}
            </View>
            <Text style={styles.sectionDescription}>
              AI will generate detailed physical attributes and visual characteristics
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.generateButtonPressable,
                pressed && !isGenerating.appearance && { opacity: 0.8 },
              ]}
              onPress={handleGenerateAppearance}
              disabled={isGenerating.appearance}
            >
              <LinearGradient
                colors={hasGeneratedAppearance ? ['#10b981', '#34d399'] : ['#ec4899', '#f472b6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.generateButtonGradient,
                  isGenerating.appearance && { opacity: 0.6 },
                ]}
              >
                {isGenerating.appearance ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Feather
                      name={hasGeneratedAppearance ? 'refresh-cw' : 'camera'}
                      size={20}
                      color="#ffffff"
                    />
                    <Text style={styles.generateButtonText}>
                      {hasGeneratedAppearance ? 'Regenerate Appearance' : 'Generate Appearance'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* Errors - Redesigned */}
          {errors.length > 0 && (
            <View style={styles.errorsContainer}>
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.2)', 'rgba(248, 113, 113, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.errorsGradient}
              >
                <BlurView intensity={15} tint="dark" style={styles.errorsBlur}>
                  <Feather name="alert-triangle" size={24} color="#ef4444" />
                  <View style={styles.errorsContent}>
                    {errors.map((error, index) => (
                      <Text key={index} style={styles.errorText}>
                        {error}
                      </Text>
                    ))}
                  </View>
                </BlurView>
              </LinearGradient>
            </View>
          )}
        </ScrollView>

        {/* Continue Button - Redesigned */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.continueButtonPressable,
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleContinue}
            disabled={isGenerating.personality || isGenerating.appearance}
          >
            <LinearGradient
              colors={['#06b6d4', '#22d3ee']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.continueButtonGradient,
                (isGenerating.personality || isGenerating.appearance) && { opacity: 0.5 },
              ]}
            >
              <Text style={styles.continueButtonText}>Continue to Review</Text>
              <Feather name="arrow-right" size={20} color="#ffffff" />
            </LinearGradient>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

interface StatusBadgeProps {
  text: string;
  type: 'success' | 'warning' | 'error';
}

function StatusBadge({ text, type }: StatusBadgeProps) {
  const colors = {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  };

  return (
    <View style={[styles.statusBadge, { backgroundColor: `${colors[type]}20` }]}>
      <View style={[styles.statusDot, { backgroundColor: colors[type] }]} />
      <Text style={[styles.statusText, { color: colors[type] }]}>{text}</Text>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0b2e',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 120,
  },

  // Character Header - Prominent & Emotional
  characterHeader: {
    marginBottom: 32,
  },
  characterHeaderGradient: {
    borderRadius: 24,
    padding: 2,
  },
  characterHeaderBlur: {
    borderRadius: 22,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  characterImageContainer: {
    marginBottom: 20,
  },
  characterImageBorder: {
    width: 136,
    height: 136,
    borderRadius: 68,
    padding: 4,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  characterImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
  },
  characterImagePlaceholder: {
    width: 128,
    height: 128,
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  characterSourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  characterSource: {
    fontSize: 15,
    color: '#cbd5e1',
    fontWeight: '500',
  },

  // Section
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    letterSpacing: 0.2,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 22,
    marginBottom: 18,
    fontWeight: '400',
  },

  // Field
  field: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  fieldInput: {
    backgroundColor: 'rgba(30, 27, 75, 0.4)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
    fontWeight: '500',
  },
  fieldInputMultiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },

  // Generate Button - Redesigned with Gradients
  generateButtonPressable: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  generateButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Errors - Redesigned
  errorsContainer: {
    marginBottom: 24,
    borderRadius: 18,
    overflow: 'hidden',
  },
  errorsGradient: {
    borderRadius: 18,
    padding: 2,
  },
  errorsBlur: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 14,
    overflow: 'hidden',
  },
  errorsContent: {
    flex: 1,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#fca5a5',
    lineHeight: 21,
    fontWeight: '500',
  },

  // Footer - Redesigned
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(26, 11, 46, 0.95)',
  },
  continueButtonPressable: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});
