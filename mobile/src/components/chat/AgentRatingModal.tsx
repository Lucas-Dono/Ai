/**
 * Modal de valoración de agente - Sistema de rating con estrellas y reseña
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useAlert } from '../../contexts/AlertContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface AgentRatingModalProps {
  visible: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  currentRating?: number;
  currentReview?: string;
  onSubmit: (rating: number, review: string) => Promise<void>;
}

const RATING_LABELS = {
  1: 'Muy malo',
  2: 'Malo',
  3: 'Regular',
  4: 'Bueno',
  5: 'Excelente',
};

export function AgentRatingModal({
  visible,
  onClose,
  agentId,
  agentName,
  currentRating = 0,
  currentReview = '',
  onSubmit,
}: AgentRatingModalProps) {
  const { showAlert } = useAlert();
  const [rating, setRating] = useState(currentRating);
  const [review, setReview] = useState(currentReview);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const starScales = React.useRef(
    Array.from({ length: 5 }, () => new Animated.Value(1))
  ).current;

  React.useEffect(() => {
    if (visible) {
      setRating(currentRating);
      setReview(currentReview);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const handleStarPress = (starRating: number) => {
    setRating(starRating);

    // Animar la estrella seleccionada
    Animated.sequence([
      Animated.timing(starScales[starRating - 1], {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(starScales[starRating - 1], {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      showAlert('Selecciona al menos una estrella para valorar', {
        type: 'warning',
        duration: 3000
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(rating, review.trim());

      // Resetear estado
      setRating(0);
      setReview('');

      showAlert('¡Gracias por tu valoración!', {
        type: 'success',
        duration: 2500
      });
      onClose();
    } catch (error) {
      console.error('Error al enviar valoración:', error);
      showAlert('No se pudo enviar tu valoración', {
        type: 'error',
        duration: 4000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      Keyboard.dismiss();
      onClose();
    }
  };

  const renderStar = (index: number) => {
    const starNumber = index + 1;
    const isFilled = starNumber <= (hoverRating || rating);
    const starColor = isFilled ? colors.warning.main : colors.text.tertiary;

    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleStarPress(starNumber)}
        onPressIn={() => setHoverRating(starNumber)}
        onPressOut={() => setHoverRating(0)}
        activeOpacity={0.7}
        style={styles.starButton}
      >
        <Animated.View
          style={{
            transform: [{ scale: starScales[index] }],
          }}
        >
          <Ionicons
            name={isFilled ? 'star' : 'star-outline'}
            size={48}
            color={starColor}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [{ translateY }],
                },
              ]}
            >
              {/* Handle indicator */}
              <View style={styles.handle} />

              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Icon */}
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={[colors.primary[500], colors.secondary[500]]}
                    style={styles.iconGradient}
                  >
                    <Ionicons
                      name="chatbubble-ellipses"
                      size={40}
                      color={colors.text.primary}
                    />
                  </LinearGradient>
                </View>

                {/* Header */}
                <Text style={styles.title}>¿Cómo valoras a {agentName}?</Text>
                <Text style={styles.subtitle}>
                  Tu opinión nos ayuda a mejorar la experiencia
                </Text>

                {/* Rating Stars */}
                <View style={styles.starsContainer}>
                  {Array.from({ length: 5 }, (_, i) => renderStar(i))}
                </View>

                {/* Rating Label */}
                {rating > 0 && (
                  <Animated.Text style={styles.ratingLabel}>
                    {RATING_LABELS[rating as keyof typeof RATING_LABELS]}
                  </Animated.Text>
                )}

                {/* Review Input */}
                <View style={styles.reviewContainer}>
                  <Text style={styles.reviewLabel}>
                    Cuéntanos más sobre tu experiencia{' '}
                    <Text style={styles.optionalText}>(opcional)</Text>
                  </Text>
                  <TextInput
                    style={styles.reviewInput}
                    placeholder="Escribe tu opinión aquí..."
                    placeholderTextColor={colors.text.tertiary}
                    value={review}
                    onChangeText={setReview}
                    multiline
                    maxLength={500}
                    textAlignVertical="top"
                    editable={!isSubmitting}
                  />
                  <Text style={styles.characterCount}>
                    {review.length}/500 caracteres
                  </Text>
                </View>

                {/* Suggested Tags */}
                {rating > 0 && (
                  <View style={styles.tagsContainer}>
                    <Text style={styles.tagsLabel}>Etiquetas rápidas:</Text>
                    <View style={styles.tagsGrid}>
                      {rating >= 4 ? (
                        <>
                          <TouchableOpacity
                            style={styles.tag}
                            onPress={() => setReview('Muy útil y servicial')}
                            disabled={isSubmitting}
                          >
                            <Text style={styles.tagText}>Útil</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.tag}
                            onPress={() => setReview('Respuestas rápidas y precisas')}
                            disabled={isSubmitting}
                          >
                            <Text style={styles.tagText}>Rápido</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.tag}
                            onPress={() => setReview('Conversaciones muy naturales')}
                            disabled={isSubmitting}
                          >
                            <Text style={styles.tagText}>Natural</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.tag}
                            onPress={() => setReview('Excelente personalidad')}
                            disabled={isSubmitting}
                          >
                            <Text style={styles.tagText}>Divertido</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <TouchableOpacity
                            style={styles.tag}
                            onPress={() => setReview('Las respuestas son muy lentas')}
                            disabled={isSubmitting}
                          >
                            <Text style={styles.tagText}>Lento</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.tag}
                            onPress={() => setReview('No entiende bien el contexto')}
                            disabled={isSubmitting}
                          >
                            <Text style={styles.tagText}>Confuso</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.tag}
                            onPress={() => setReview('Respuestas poco útiles')}
                            disabled={isSubmitting}
                          >
                            <Text style={styles.tagText}>Poco útil</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (rating === 0 || isSubmitting) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  activeOpacity={0.7}
                  disabled={rating === 0 || isSubmitting}
                >
                  <LinearGradient
                    colors={
                      rating === 0
                        ? [colors.background.elevated, colors.background.elevated]
                        : [colors.primary[500], colors.secondary[500]]
                    }
                    style={styles.submitButtonGradient}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color={colors.text.primary} />
                    ) : (
                      <Text
                        style={[
                          styles.submitText,
                          rating === 0 && styles.submitTextDisabled,
                        ]}
                      >
                        Enviar valoración
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.light,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  starButton: {
    padding: spacing.xs,
  },
  ratingLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning.main,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  reviewContainer: {
    marginBottom: spacing.lg,
  },
  reviewLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  optionalText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.regular,
  },
  reviewInput: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  characterCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  tagsContainer: {
    marginBottom: spacing.md,
  },
  tagsLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  tagText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  submitButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  submitTextDisabled: {
    color: colors.text.tertiary,
  },
});
