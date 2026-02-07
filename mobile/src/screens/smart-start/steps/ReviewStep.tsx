/**
 * Review Step Component
 *
 * Final step: Review AI-generated profile before creating character
 * Shows comprehensive generated data including emotional tree
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import type { CharacterDraft } from '@circuitpromptai/smart-start-core';
import { useSmartStartContext } from '../../../contexts/SmartStartContext';
import { colors } from '../../../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface ReviewStepProps {
  visible: boolean;
  completed: boolean;
  draft: CharacterDraft;
  onCreateCharacter: () => Promise<void>;
  onEdit: (section: 'description' | 'customize' | 'depth' | 'review') => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ReviewStep({
  visible,
  completed,
  draft,
  onCreateCharacter,
  onEdit,
}: ReviewStepProps) {
  const { generatedProfile } = useSmartStartContext();
  const [isCreating, setIsCreating] = useState(false);

  // Animation
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      fadeIn.value = withSpring(1, { damping: 15, stiffness: 100 });
    }
  }, [visible]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: fadeIn.value === 1 ? 0 : -20 }],
  }));

  if (!visible) return null;

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      await onCreateCharacter();
    } catch (error) {
      console.error('[ReviewStep] Create error:', error);
      Alert.alert('Error', 'No se pudo crear el personaje. Por favor intentá de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  const hasGeneratedProfile = !!generatedProfile;

  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.container, containerAnimatedStyle]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>✓</Text>
          <Text style={styles.headerTitle}>¡Perfil generado!</Text>
          <Text style={styles.headerSubtitle}>
            Revisá el perfil profundo creado por IA antes de confirmar
          </Text>
        </View>

        {hasGeneratedProfile ? (
          <>
            {/* Basic Info */}
            <ReviewSection
              title="Información Básica"
              icon="user"
              onEdit={() => onEdit('customize')}
              items={[
                { label: 'Nombre', value: generatedProfile.basicInfo?.name || draft.name || 'No establecido' },
                { label: 'Edad', value: String(generatedProfile.basicInfo?.age || 'No establecido') },
                { label: 'Género', value: generatedProfile.basicInfo?.gender || 'No establecido' },
                { label: 'Ocupación', value: generatedProfile.basicInfo?.occupation || 'No establecido' },
                {
                  label: 'Ubicación',
                  value: generatedProfile.basicInfo?.location
                    ? `${generatedProfile.basicInfo.location.city}, ${generatedProfile.basicInfo.location.country}`
                    : 'No establecido',
                },
              ]}
            />

            {/* Description & Appearance */}
            <ReviewSection
              title="Descripción y Apariencia"
              icon="eye"
              items={[
                {
                  label: 'Resumen',
                  value: generatedProfile.description?.summary || 'No generado',
                  multiline: true,
                },
                {
                  label: 'Apariencia física',
                  value: generatedProfile.description?.physicalAppearance || 'No generado',
                  multiline: true,
                },
                {
                  label: 'Frase característica',
                  value: generatedProfile.description?.signature?.phrase || 'No generado',
                },
              ]}
            />

            {/* Personality (Big Five) */}
            <ReviewSection
              title="Personalidad (Big Five)"
              icon="activity"
              items={[
                {
                  label: 'Apertura',
                  value: `${generatedProfile.personality?.openness || 50}/100`,
                },
                {
                  label: 'Responsabilidad',
                  value: `${generatedProfile.personality?.conscientiousness || 50}/100`,
                },
                {
                  label: 'Extraversión',
                  value: `${generatedProfile.personality?.extraversion || 50}/100`,
                },
                {
                  label: 'Amabilidad',
                  value: `${generatedProfile.personality?.agreeableness || 50}/100`,
                },
                {
                  label: 'Neuroticismo',
                  value: `${generatedProfile.personality?.neuroticism || 50}/100`,
                },
              ]}
            />

            {/* Emotional Profile (Árbol Emocional) */}
            <ReviewSection
              title="Perfil Emocional (Árbol Emocional)"
              icon="heart"
              items={[
                {
                  label: 'Alegría base',
                  value: `${Math.round((generatedProfile.emotionalProfile?.baselineEmotions?.joy || 0.5) * 100)}%`,
                },
                {
                  label: 'Curiosidad',
                  value: `${Math.round((generatedProfile.emotionalProfile?.baselineEmotions?.curiosity || 0.5) * 100)}%`,
                },
                {
                  label: 'Ansiedad',
                  value: `${Math.round((generatedProfile.emotionalProfile?.baselineEmotions?.anxiety || 0.3) * 100)}%`,
                },
                {
                  label: 'Afecto',
                  value: `${Math.round((generatedProfile.emotionalProfile?.baselineEmotions?.affection || 0.5) * 100)}%`,
                },
                {
                  label: 'Confianza',
                  value: `${Math.round((generatedProfile.emotionalProfile?.baselineEmotions?.confidence || 0.5) * 100)}%`,
                },
                {
                  label: 'Emociones positivas',
                  value: generatedProfile.emotionalProfile?.emotionalRange?.positive?.slice(0, 3).join(', ') || 'No generado',
                  multiline: true,
                },
                {
                  label: 'Emociones complejas',
                  value: generatedProfile.emotionalProfile?.emotionalRange?.complex?.slice(0, 2).join(', ') || 'No generado',
                  multiline: true,
                },
              ]}
            />

            {/* Backstory */}
            <ReviewSection
              title="Trasfondo"
              icon="book"
              items={[
                {
                  label: 'Situación actual',
                  value: generatedProfile.backstory?.currentSituation || 'No generado',
                  multiline: true,
                },
                {
                  label: 'Momentos pivotales',
                  value: generatedProfile.backstory?.pivotalMoments?.length
                    ? `${generatedProfile.backstory.pivotalMoments.length} eventos importantes`
                    : 'No generado',
                },
              ]}
            />

            {/* Interests */}
            <ReviewSection
              title="Intereses y Pasiones"
              icon="star"
              items={[
                {
                  label: 'Pasiones',
                  value: generatedProfile.interests?.passions?.slice(0, 3).join(', ') || 'No generado',
                  multiline: true,
                },
                {
                  label: 'Hobbies',
                  value: generatedProfile.interests?.hobbies?.slice(0, 3).join(', ') || 'No generado',
                  multiline: true,
                },
                {
                  label: 'Obsesión actual',
                  value: generatedProfile.interests?.currentObsession || 'No generado',
                },
              ]}
            />

            {/* Communication Style */}
            <ReviewSection
              title="Estilo de Comunicación"
              icon="message-circle"
              items={[
                {
                  label: 'Patrones de habla',
                  value: generatedProfile.communication?.speechPatterns?.slice(0, 2).join(', ') || 'No generado',
                  multiline: true,
                },
                {
                  label: 'Estilo de mensajería',
                  value: generatedProfile.communication?.textingStyle || 'No generado',
                  multiline: true,
                },
                {
                  label: 'Diálogos de ejemplo',
                  value: generatedProfile.communication?.exampleDialogues?.length
                    ? `${generatedProfile.communication.exampleDialogues.length} ejemplos generados`
                    : 'No generado',
                },
              ]}
            />

            {/* Relationship Style */}
            <ReviewSection
              title="Estilo Relacional"
              icon="users"
              items={[
                {
                  label: 'Arquetipo',
                  value: generatedProfile.relationshipStyle?.archetype || draft.genre || 'No establecido',
                },
                {
                  label: 'Enfoque hacia ti',
                  value: generatedProfile.relationshipStyle?.approachToUser || 'No generado',
                  multiline: true,
                },
                {
                  label: 'Estilo de afecto',
                  value: generatedProfile.relationshipStyle?.affectionStyle || 'No generado',
                  multiline: true,
                },
              ]}
            />

            {/* Inner World */}
            <ReviewSection
              title="Mundo Interior"
              icon="sunrise"
              items={[
                {
                  label: 'Deseos',
                  value: generatedProfile.innerWorld?.desires?.slice(0, 2).join(', ') || 'No generado',
                  multiline: true,
                },
                {
                  label: 'Miedos',
                  value: generatedProfile.innerWorld?.fears?.slice(0, 2).join(', ') || 'No generado',
                  multiline: true,
                },
                {
                  label: 'Filosofía de vida',
                  value: generatedProfile.innerWorld?.philosophyOfLife || 'No generado',
                  multiline: true,
                },
              ]}
            />

            {/* Generation Info */}
            <View style={styles.infoBox}>
              <Feather name="cpu" size={16} color="#8b5cf6" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Generado con IA</Text>
                <Text style={styles.infoText}>
                  Perfil profundo y complejo generado por Gemini 2.0 Flash
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Feather name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.emptyTitle}>No hay perfil generado</Text>
            <Text style={styles.emptyText}>
              Algo salió mal durante la generación. Por favor, intentá nuevamente.
            </Text>
          </View>
        )}

        {/* Create Button */}
        {hasGeneratedProfile && (
          <Pressable
            style={({ pressed }) => [
              styles.createButton,
              pressed && !isCreating && { opacity: 0.85 },
              isCreating && { opacity: 0.6 },
            ]}
            onPress={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Feather name="star" size={20} color="#ffffff" />
                <Text style={styles.createButtonText}>Crear personaje</Text>
                <Feather name="arrow-right" size={20} color="#ffffff" />
              </>
            )}
          </Pressable>
        )}
      </ScrollView>
    </Animated.View>
  );
}

// ============================================================================
// REVIEW SECTION COMPONENT
// ============================================================================

interface ReviewSectionProps {
  title: string;
  icon: string;
  onEdit?: () => void;
  items: Array<{ label: string; value: string; multiline?: boolean }>;
}

function ReviewSection({ title, icon, onEdit, items }: ReviewSectionProps) {
  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Feather name={icon as any} size={18} color="#8b5cf6" />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {onEdit && (
          <Pressable onPress={onEdit} style={styles.editButton}>
            <Feather name="edit-2" size={14} color="#8b5cf6" />
            <Text style={styles.editButtonText}>Regenerar</Text>
          </Pressable>
        )}
      </View>

      {/* Content */}
      <View style={styles.sectionContent}>
        {items.map((item, index) => (
          <View key={index} style={[styles.reviewItem, item.multiline && styles.reviewItemMultiline]}>
            <Text style={styles.reviewLabel}>{item.label}</Text>
            <Text style={[styles.reviewValue, item.multiline && styles.reviewValueMultiline]}>
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
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#a1a1a1',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    fontWeight: '400',
  },

  // Section
  section: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  sectionContent: {
    gap: 14,
  },

  // Edit Button
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b5cf6',
    letterSpacing: 0.2,
  },

  // Review Item
  reviewItem: {
    gap: 6,
  },
  reviewItemMultiline: {
    gap: 8,
  },
  reviewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a1a1a1',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  reviewValue: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '500',
    lineHeight: 22,
  },
  reviewValueMultiline: {
    lineHeight: 24,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8b5cf6',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  infoText: {
    fontSize: 14,
    color: '#a1a1a1',
    lineHeight: 20,
    fontWeight: '400',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  emptyText: {
    fontSize: 15,
    color: '#a1a1a1',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Create Button
  createButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});
