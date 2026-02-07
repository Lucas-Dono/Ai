/**
 * Generation Step Component
 *
 * Shows loading state while AI generates comprehensive character profile
 * Automatically proceeds to review step once generation completes
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useSmartStartContext } from '../../../contexts/SmartStartContext';
import { smartStartService } from '../../../services/smart-start.service';
import { colors } from '../../../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface GenerationStepProps {
  visible: boolean;
  completed: boolean;
  onComplete: (generatedProfile: any) => void;
  onError?: (error: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function GenerationStep({ visible, completed, onComplete, onError }: GenerationStepProps) {
  const { draft, setGenerating, setGeneratedProfile } = useSmartStartContext();
  const [generationPhase, setGenerationPhase] = useState<
    'initializing' | 'analyzing' | 'generating' | 'finalizing' | 'complete' | 'error'
  >('initializing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Animated progress
  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      // Start rotation animation
      rotation.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );

      // Start pulse animation
      pulseScale.value = withRepeat(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [visible]);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Start generation when step becomes visible
  useEffect(() => {
    if (visible && !completed && generationPhase === 'initializing') {
      startGeneration();
    }
  }, [visible, completed]);

  const startGeneration = useCallback(async () => {
    try {
      setGenerating(true);
      setGenerationPhase('analyzing');
      setProgress(10);

      // Validate required data
      if (!draft.name) {
        throw new Error('Nombre del personaje es requerido');
      }

      if (!draft.context) {
        throw new Error('Contexto del personaje es requerido');
      }

      if (!draft.genre) {
        throw new Error('Arquetipo/género es requerido');
      }

      // Simulate phase progression
      setTimeout(() => {
        setGenerationPhase('generating');
        setProgress(30);
      }, 1000);

      // Call generation API
      console.log('[GenerationStep] Starting profile generation...', {
        name: draft.name,
        context: draft.context,
        archetype: draft.genre,
      });

      const result = await smartStartService.generateProfile({
        name: draft.name!,
        context: draft.context!,
        archetype: draft.genre!,
        contextSubcategory: draft.contextSubcategory,
        contextOccupation: draft.contextOccupation,
        contextEra: draft.contextEra,
        searchResult: draft.searchResult,
        customDescription: draft.physicalAppearance,
        language: 'es',
      });

      setProgress(80);
      setGenerationPhase('finalizing');

      console.log('[GenerationStep] Profile generated successfully!', {
        generationTime: result.generationTime,
        sections: Object.keys(result.profile),
      });

      // Store generated profile
      setGeneratedProfile(result.profile);

      // Small delay for UX
      setTimeout(() => {
        setProgress(100);
        setGenerationPhase('complete');
        setGenerating(false);

        // Trigger completion
        onComplete(result.profile);
      }, 500);
    } catch (error) {
      console.error('[GenerationStep] Generation error:', error);

      const message = error instanceof Error ? error.message : 'Error al generar el perfil';
      setErrorMessage(message);
      setGenerationPhase('error');
      setGenerating(false);

      if (onError) {
        onError(message);
      }
    }
  }, [draft, setGenerating, setGeneratedProfile, onComplete, onError]);

  if (!visible) return null;

  const phaseMessages = {
    initializing: {
      title: 'Inicializando...',
      subtitle: 'Preparando la generación de tu personaje',
      icon: 'loader',
    },
    analyzing: {
      title: 'Analizando contexto',
      subtitle: 'Comprendiendo el tipo de personaje y relación',
      icon: 'search',
    },
    generating: {
      title: 'Generando perfil profundo',
      subtitle: 'Creando personalidad, emociones y trasfondo único',
      icon: 'cpu',
    },
    finalizing: {
      title: 'Finalizando...',
      subtitle: 'Puliendo los últimos detalles',
      icon: 'check-circle',
    },
    complete: {
      title: '¡Listo!',
      subtitle: 'Tu personaje ha sido generado exitosamente',
      icon: 'check-circle',
    },
    error: {
      title: 'Error',
      subtitle: errorMessage || 'No se pudo generar el perfil',
      icon: 'alert-circle',
    },
  };

  const currentPhase = phaseMessages[generationPhase];

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Generación con IA</Text>
        <Text style={styles.subtitle}>
          Estamos creando un perfil profundo y complejo para tu personaje
        </Text>
      </View>

      {/* Generation Card */}
      <View style={styles.generationCard}>
        {/* Icon/Loading Indicator */}
        <Animated.View style={[styles.iconContainer, pulseStyle]}>
          {generationPhase === 'error' ? (
            <Feather name="alert-circle" size={48} color="#ef4444" />
          ) : generationPhase === 'complete' ? (
            <Feather name="check-circle" size={48} color="#22c55e" />
          ) : (
            <Animated.View style={rotationStyle}>
              <Feather name={currentPhase.icon as any} size={48} color="#8b5cf6" />
            </Animated.View>
          )}
        </Animated.View>

        {/* Phase Title */}
        <Text style={styles.phaseTitle}>{currentPhase.title}</Text>
        <Text style={styles.phaseSubtitle}>{currentPhase.subtitle}</Text>

        {/* Progress Bar */}
        {generationPhase !== 'error' && generationPhase !== 'complete' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        )}

        {/* Generation Info */}
        {generationPhase === 'generating' && (
          <View style={styles.infoBox}>
            <View style={styles.infoItem}>
              <Feather name="user" size={16} color="#8b5cf6" />
              <Text style={styles.infoText}>{draft.name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Feather name="tag" size={16} color="#8b5cf6" />
              <Text style={styles.infoText}>{draft.context}</Text>
            </View>
            <View style={styles.infoItem}>
              <Feather name="heart" size={16} color="#8b5cf6" />
              <Text style={styles.infoText}>{draft.genre}</Text>
            </View>
          </View>
        )}

        {/* Features Being Generated */}
        {(generationPhase === 'generating' || generationPhase === 'finalizing') && (
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Generando:</Text>
            <View style={styles.featuresList}>
              {[
                '✨ Personalidad compleja con Big Five',
                '💭 Árbol emocional con triggers',
                '📖 Trasfondo detallado y pivotal moments',
                '💬 Estilo de comunicación y diálogos',
                '🎭 Mundo interior, deseos y miedos',
                '🌟 Detalles específicos y únicos',
              ].map((feature, index) => (
                <Text key={index} style={styles.featureItem}>
                  {feature}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Note */}
      {generationPhase !== 'error' && generationPhase !== 'complete' && (
        <View style={styles.noteContainer}>
          <Feather name="info" size={16} color="#a1a1a1" />
          <Text style={styles.noteText}>
            Este proceso puede tomar entre 10-30 segundos dependiendo de la complejidad
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  // Header
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: '#a1a1a1',
    lineHeight: 24,
    fontWeight: '400',
  },

  // Generation Card
  generationCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  phaseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  phaseSubtitle: {
    fontSize: 14,
    color: '#a1a1a1',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },

  // Progress
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b5cf6',
  },

  // Info Box
  infoBox: {
    width: '100%',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },

  // Features
  featuresContainer: {
    width: '100%',
  },
  featuresTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a1a1a1',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 13,
    color: '#ffffff',
    lineHeight: 20,
    opacity: 0.8,
  },

  // Note
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#a1a1a1',
    lineHeight: 18,
  },
});
