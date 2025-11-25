/**
 * Character Review Screen
 *
 * Final step in Smart Start wizard - review all data before creating
 * Features: Comprehensive review, edit buttons, create action
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

  const hasPersonality = !!draft.personalityCore;
  const hasAppearance = !!draft.characterAppearance;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, containerAnimatedStyle]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Review Your Character</Text>
            <Text style={styles.headerSubtitle}>
              Make sure everything looks good before creating
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
                      value: draft.personalityCore?.openness
                        ? `O:${draft.personalityCore.openness} C:${draft.personalityCore.conscientiousness} E:${draft.personalityCore.extraversion} A:${draft.personalityCore.agreeableness} N:${draft.personalityCore.neuroticism}`
                        : 'Generated',
                    },
                    {
                      label: 'Core Values',
                      value: `${draft.personalityCore?.coreValues?.length || 0} values`,
                    },
                    {
                      label: 'Moral Schemas',
                      value: `${draft.personalityCore?.moralSchemas?.length || 0} schemas`,
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
                    { label: 'Gender', value: draft.characterAppearance?.gender || 'Not set' },
                    { label: 'Age', value: draft.characterAppearance?.age || 'Not set' },
                    {
                      label: 'Hair',
                      value: `${draft.characterAppearance?.hairColor} ${draft.characterAppearance?.hairStyle}`,
                    },
                    { label: 'Eyes', value: draft.characterAppearance?.eyeColor || 'Not set' },
                    { label: 'Style', value: draft.characterAppearance?.style || 'Not set' },
                  ]
                : [{ label: 'Status', value: 'Appearance not generated yet' }]
            }
          />

          {/* Warnings */}
          {(!hasPersonality || !hasAppearance) && (
            <View style={styles.warningBox}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningText}>
                Some sections are incomplete. You can still create the character, but it's
                recommended to generate all data for the best experience.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Create Button */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.createButton,
              isCreating && styles.createButtonDisabled,
              pressed && !isCreating && { opacity: 0.8 },
            ]}
            onPress={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Character ✨</Text>
            )}
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

// ============================================================================
// REVIEW SECTION COMPONENT
// ============================================================================

interface ReviewSectionProps {
  title: string;
  status?: string;
  statusType?: 'success' | 'warning' | 'error';
  onEdit?: () => void;
  items: Array<{ label: string; value: string }>;
}

function ReviewSection({ title, status, statusType, onEdit, items }: ReviewSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {status && statusType && (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    statusType === 'success'
                      ? '#10b98120'
                      : statusType === 'warning'
                      ? '#f59e0b20'
                      : '#ef444420',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      statusType === 'success'
                        ? '#10b981'
                        : statusType === 'warning'
                        ? '#f59e0b'
                        : '#ef4444',
                  },
                ]}
              >
                {status}
              </Text>
            </View>
          )}
        </View>
        {onEdit && (
          <Pressable onPress={onEdit} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        )}
      </View>

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

  // Header
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },

  // Section
  section: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  sectionContent: {
    gap: 12,
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Edit Button
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#374151',
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
  },

  // Review Item
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    flex: 1,
  },
  reviewValue: {
    fontSize: 14,
    color: '#fff',
    flex: 2,
    textAlign: 'right',
  },

  // Warning Box
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#78350f20',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  warningIcon: {
    fontSize: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#fbbf24',
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
  createButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
