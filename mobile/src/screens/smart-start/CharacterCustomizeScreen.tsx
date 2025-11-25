/**
 * Character Customize Screen
 *
 * Fourth step in Smart Start wizard - customize character details
 * Features: AI generation, editable fields, personality & appearance
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { SmartStartStackParamList } from '../../navigation/SmartStartStack';
import { useSmartStartContext } from '../../contexts/SmartStartContext';
import { smartStartService } from '../../services/smart-start.service';
import type { SearchResult } from '@circuitpromptai/smart-start-core';

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

  // Animation
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    setCurrentStep('customize');
    fadeIn.value = withSpring(1, { damping: 15, stiffness: 100 });

    // If we have a selected character, auto-generate
    if (character) {
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
        genre,
        characterName: character.name,
        sourceTitle: character.sourceTitle,
      });

      if (result.personality) {
        setPersonality(result.personality);
        setHasGeneratedPersonality(true);
      }

      if (result.appearance) {
        setAppearance(result.appearance);
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
        genre,
        characterName: name,
      });

      if (result.personality) {
        setPersonality(result.personality);
        setHasGeneratedPersonality(true);
      } else if (result.error) {
        setErrors([result.error]);
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
        genre,
        characterName: name,
        personality: description,
      });

      if (result.appearance) {
        setAppearance(result.appearance);
        setHasGeneratedAppearance(true);
      } else if (result.error) {
        setErrors([result.error]);
      }
    } catch (error) {
      console.error('[CharacterCustomize] Appearance generation error:', error);
      setErrors([error instanceof Error ? error.message : 'Appearance generation failed']);
    } finally {
      setIsGenerating((prev) => ({ ...prev, appearance: false }));
    }
  }, [name, description, genre]);

  // ============================================================================
  // NAVIGATION HANDLERS
  // ============================================================================

  const handleContinue = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter a character name');
      return;
    }

    // Update draft with final data
    updateDraft({
      name,
      physicalAppearance: description,
    });

    // Mark step complete
    markStepComplete('customize');

    // Navigate to review
    navigation.navigate('CharacterReview', { draft });
  }, [name, description, draft, updateDraft, markStepComplete, navigation]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, containerAnimatedStyle]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Character Header */}
          {character && (
            <View style={styles.characterHeader}>
              {character.imageUrl ? (
                <Image source={{ uri: character.imageUrl }} style={styles.characterImage} />
              ) : (
                <View style={[styles.characterImage, styles.characterImagePlaceholder]}>
                  <Text style={styles.characterImagePlaceholderText}>
                    {(character.name || 'C').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.characterName}>{character.name}</Text>
              {character.sourceTitle && (
                <Text style={styles.characterSource}>From: {character.sourceTitle}</Text>
              )}
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

          {/* Personality Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personality</Text>
              {hasGeneratedPersonality && <StatusBadge text="Generated" type="success" />}
            </View>
            <Text style={styles.sectionDescription}>
              AI will analyze and generate personality traits, values, and emotional baselines
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.generateButton,
                isGenerating.personality && styles.generateButtonDisabled,
                pressed && !isGenerating.personality && styles.generateButtonPressed,
              ]}
              onPress={handleGeneratePersonality}
              disabled={isGenerating.personality}
            >
              {isGenerating.personality ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.generateButtonText}>
                  {hasGeneratedPersonality ? 'Regenerate Personality' : 'Generate Personality'}
                </Text>
              )}
            </Pressable>
          </View>

          {/* Appearance Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Appearance</Text>
              {hasGeneratedAppearance && <StatusBadge text="Generated" type="success" />}
            </View>
            <Text style={styles.sectionDescription}>
              AI will generate detailed appearance attributes and image prompts
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.generateButton,
                isGenerating.appearance && styles.generateButtonDisabled,
                pressed && !isGenerating.appearance && styles.generateButtonPressed,
              ]}
              onPress={handleGenerateAppearance}
              disabled={isGenerating.appearance}
            >
              {isGenerating.appearance ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.generateButtonText}>
                  {hasGeneratedAppearance ? 'Regenerate Appearance' : 'Generate Appearance'}
                </Text>
              )}
            </Pressable>
          </View>

          {/* Errors */}
          {errors.length > 0 && (
            <View style={styles.errorsContainer}>
              {errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>
                  ⚠️ {error}
                </Text>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.continueButton, pressed && { opacity: 0.8 }]}
            onPress={handleContinue}
            disabled={isGenerating.personality || isGenerating.appearance}
          >
            <Text style={styles.continueButtonText}>Continue to Review</Text>
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
    backgroundColor: '#0f0f1e',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 100,
  },

  // Character Header
  characterHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  characterImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  characterImagePlaceholder: {
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterImagePlaceholderText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#9ca3af',
  },
  characterName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  characterSource: {
    fontSize: 14,
    color: '#9ca3af',
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
    marginBottom: 16,
  },

  // Field
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: 8,
  },
  fieldInput: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#374151',
  },
  fieldInputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Generate Button
  generateButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  generateButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Errors
  errorsContainer: {
    backgroundColor: '#7f1d1d',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#fca5a5',
    lineHeight: 20,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#0f0f1e',
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  continueButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
