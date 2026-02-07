/**
 * @deprecated This screen is deprecated. Use SmartStartWizardScreen with ReviewStep instead.
 * Kept for reference only. Do not use in active navigation.
 *
 * Character Review Screen
 *
 * Final step in Smart Start wizard - review all data before creating
 * Features: Celebratory design, vibrant gradients, polished review sections
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
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

// ============================================================================
// TYPES
// ============================================================================

type CharacterReviewScreenNavigationProp = StackNavigationProp<
  SmartStartStackParamList,
  'CharacterReview'
>;

type CharacterReviewScreenRouteProp = RouteProp<SmartStartStackParamList, 'CharacterReview'>;

interface Props {
  navigation: CharacterReviewScreenNavigationProp;
  route: CharacterReviewScreenRouteProp;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function CharacterReviewScreen({ navigation, route }: Props) {
  const { draft, resetDraft, markStepComplete, setCurrentStep } = useSmartStartContext();

  const [isCreating, setIsCreating] = useState(false);

  // Animation
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    setCurrentStep('review');
    fadeIn.value = withSpring(1, { damping: 15, stiffness: 100 });
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreate = useCallback(async () => {
    setIsCreating(true);

    try {
      // TODO: Call API to create character
      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mark step complete
      markStepComplete('review');

      // Show success
      Alert.alert(
        'Character Created! ✨',
        `${draft.name || 'Your character'} has been created successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset draft
              resetDraft();

              // Navigate back to home or character list
              // For now, just go back
              navigation.navigate('CharacterTypeSelection');
            },
          },
        ]
      );
    } catch (error) {
      console.error('[CharacterReview] Create error:', error);
      Alert.alert('Error', 'Failed to create character. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, [draft, markStepComplete, resetDraft, navigation]);

  const handleEdit = useCallback(
    (section: 'type' | 'genre' | 'search' | 'customize') => {
      // Navigate back to specific step to edit
      switch (section) {
        case 'type':
          navigation.navigate('CharacterTypeSelection');
          break;
        case 'genre':
          if (draft.characterType) {
            navigation.navigate('GenreSelection', { characterType: draft.characterType });
          }
          break;
        case 'search':
          if (draft.characterType && draft.genre) {
            navigation.navigate('CharacterSearch', {
              characterType: draft.characterType,
              genre: draft.genre,
              subgenre: draft.subgenre,
            });
          }
          break;
        case 'customize':
          if (draft.characterType && draft.genre) {
            navigation.navigate('CharacterCustomize', {
              characterType: draft.characterType,
              genre: draft.genre,
              character: draft.searchResult as any,
            });
          }
          break;
      }
    },
    [draft, navigation]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  const hasPersonality = !!(draft as any).personality;
  const hasAppearance = !!(draft as any).physicalAppearance;

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
          {/* Header - Celebratory */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#10b981', '#34d399', '#6ee7b7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerIconGradient}
            >
              <Feather name="check-circle" size={40} color="#ffffff" />
            </LinearGradient>
            <Text style={styles.headerTitle}>Almost There!</Text>
            <Text style={styles.headerSubtitle}>
              Review your character details before bringing them to life
            </Text>
          </View>

          {/* Basic Info Section */}
          <ReviewSection
            title="Basic Information"
            onEdit={() => handleEdit('customize')}
            items={[
              { label: 'Name', value: draft.name || 'Not set' },
              { label: 'Type', value: draft.characterType || 'Not set' },
              { label: 'Genre', value: draft.genre || 'Not set' },
              ...(draft.subgenre ? [{ label: 'Subgenre', value: draft.subgenre }] : []),
              ...(draft.physicalAppearance
                ? [{ label: 'Description', value: draft.physicalAppearance }]
                : []),
            ]}
          />

          {/* Search Result Section */}
          {draft.searchResult && (
            <ReviewSection
              title="Selected Character"
              onEdit={() => handleEdit('search')}
              items={[
                { label: 'Character', value: draft.searchResult.name },
                ...(draft.searchResult.sourceTitle
                  ? [{ label: 'Source', value: draft.searchResult.sourceTitle }]
                  : []),
                ...(draft.searchResult.sourceId
                  ? [{ label: 'Database', value: draft.searchResult.sourceId }]
                  : []),
              ]}
            />
          )}

          {/* Personality Section */}
          <ReviewSection
            title="Personality"
            status={hasPersonality ? 'Generated' : 'Not generated'}
            statusType={hasPersonality ? 'success' : 'warning'}
            onEdit={() => handleEdit('customize')}
            items={
              hasPersonality
                ? [
                    {
                      label: 'Big Five Traits',
                      value: (draft as any).personality?.openness
                        ? `O:${(draft as any).personality.openness} C:${(draft as any).personality.conscientiousness} E:${(draft as any).personality.extraversion} A:${(draft as any).personality.agreeableness} N:${(draft as any).personality.neuroticism}`
                        : 'Generated',
                    },
                    {
                      label: 'Core Values',
                      value: `${(draft as any).personality?.coreValues?.length || 0} values`,
                    },
                    {
                      label: 'Moral Schemas',
                      value: `${(draft as any).personality?.moralSchemas?.length || 0} schemas`,
                    },
                  ]
                : [{ label: 'Status', value: 'Personality not generated yet' }]
            }
          />

          {/* Appearance Section */}
          <ReviewSection
            title="Appearance"
            status={hasAppearance ? 'Generated' : 'Not generated'}
            statusType={hasAppearance ? 'success' : 'warning'}
            onEdit={() => handleEdit('customize')}
            items={
              hasAppearance
                ? [
                    { label: 'Gender', value: (draft as any).physicalAppearance?.gender || 'Not set' },
                    { label: 'Age', value: (draft as any).physicalAppearance?.age || 'Not set' },
                    {
                      label: 'Hair',
                      value: `${(draft as any).physicalAppearance?.hairColor || ''} ${(draft as any).physicalAppearance?.hairStyle || ''}`,
                    },
                    { label: 'Eyes', value: (draft as any).physicalAppearance?.eyeColor || 'Not set' },
                    { label: 'Style', value: (draft as any).physicalAppearance?.style || 'Not set' },
                  ]
                : [{ label: 'Status', value: 'Appearance not generated yet' }]
            }
          />

          {/* Warnings - Redesigned */}
          {(!hasPersonality || !hasAppearance) && (
            <View style={styles.warningContainer}>
              <LinearGradient
                colors={['rgba(245, 158, 11, 0.2)', 'rgba(251, 191, 36, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.warningGradient}
              >
                <BlurView intensity={15} tint="dark" style={styles.warningBlur}>
                  <Feather name="info" size={24} color="#fbbf24" />
                  <View style={styles.warningContent}>
                    <Text style={styles.warningTitle}>Almost Perfect</Text>
                    <Text style={styles.warningText}>
                      Some sections are incomplete. You can still create the character, but
                      generating all data provides the best experience.
                    </Text>
                  </View>
                </BlurView>
              </LinearGradient>
            </View>
          )}
        </ScrollView>

        {/* Create Button - Celebratory Design */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.createButtonPressable,
              pressed && !isCreating && { opacity: 0.85 },
            ]}
            onPress={handleCreate}
            disabled={isCreating}
          >
            <LinearGradient
              colors={['#8b5cf6', '#ec4899', '#06b6d4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.createButtonGradient, isCreating && { opacity: 0.6 }]}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather name="star" size={22} color="#ffffff" />
                  <Text style={styles.createButtonText}>Create Character</Text>
                  <Feather name="arrow-right" size={22} color="#ffffff" />
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

// ============================================================================
// REVIEW SECTION COMPONENT - Redesigned with Glassmorphism
// ============================================================================

interface ReviewSectionProps {
  title: string;
  status?: string;
  statusType?: 'success' | 'warning' | 'error';
  onEdit?: () => void;
  items: Array<{ label: string; value: string }>;
}

function ReviewSection({ title, status, statusType, onEdit, items }: ReviewSectionProps) {
  const getStatusColors = (type: 'success' | 'warning' | 'error') => {
    const colors = {
      success: { gradient: ['rgba(16, 185, 129, 0.2)', 'rgba(52, 211, 153, 0.1)'] as const, text: '#10b981' },
      warning: { gradient: ['rgba(245, 158, 11, 0.2)', 'rgba(251, 191, 36, 0.1)'] as const, text: '#f59e0b' },
      error: { gradient: ['rgba(239, 68, 68, 0.2)', 'rgba(248, 113, 113, 0.1)'] as const, text: '#ef4444' },
    };
    return colors[type];
  };

  return (
    <View style={styles.sectionContainer}>
      <LinearGradient
        colors={['rgba(167, 139, 250, 0.1)', 'rgba(124, 58, 237, 0.05)'] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.sectionGradient}
      >
        <BlurView intensity={15} tint="dark" style={styles.sectionBlur}>
          {/* Header */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>{title}</Text>
              {status && statusType && (
                <LinearGradient
                  colors={getStatusColors(statusType).gradient as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statusBadge}
                >
                  <Feather
                    name={statusType === 'success' ? 'check' : statusType === 'warning' ? 'alert-circle' : 'x'}
                    size={12}
                    color={getStatusColors(statusType).text}
                  />
                  <Text style={[styles.statusText, { color: getStatusColors(statusType).text }]}>
                    {status}
                  </Text>
                </LinearGradient>
              )}
            </View>
            {onEdit && (
              <Pressable onPress={onEdit} style={styles.editButton}>
                <Feather name="edit-2" size={16} color="#a78bfa" />
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
            )}
          </View>

          {/* Content */}
          <View style={styles.sectionContent}>
            {items.map((item, index) => (
              <View key={index} style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>{item.label}</Text>
                <Text style={styles.reviewValue} numberOfLines={2}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </BlurView>
      </LinearGradient>
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

  // Header - Celebratory
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  headerIconGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    fontWeight: '400',
  },

  // Section - Redesigned
  sectionContainer: {
    marginBottom: 18,
  },
  sectionGradient: {
    borderRadius: 20,
    padding: 2,
  },
  sectionBlur: {
    borderRadius: 18,
    padding: 20,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  sectionContent: {
    gap: 14,
  },

  // Status Badge - Redesigned
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Edit Button - Redesigned
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a78bfa',
    letterSpacing: 0.2,
  },

  // Review Item
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    flex: 1,
    letterSpacing: 0.2,
  },
  reviewValue: {
    fontSize: 14,
    color: '#ffffff',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },

  // Warning Box - Redesigned
  warningContainer: {
    marginBottom: 24,
    borderRadius: 18,
    overflow: 'hidden',
  },
  warningGradient: {
    borderRadius: 18,
    padding: 2,
  },
  warningBlur: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 14,
    overflow: 'hidden',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fbbf24',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  warningText: {
    fontSize: 14,
    color: '#fde68a',
    lineHeight: 21,
    fontWeight: '400',
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
  createButtonPressable: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  createButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  createButtonText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});
