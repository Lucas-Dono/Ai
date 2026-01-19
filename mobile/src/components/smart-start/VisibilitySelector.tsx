/**
 * VisibilitySelector - Selector de visibilidad para React Native
 *
 * Permite elegir si un personaje será:
 * - private: Solo visible para el creador
 * - public: Visible en comunidad/marketplace
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

interface VisibilitySelectorProps {
  value: 'private' | 'public';
  onChange: (value: 'private' | 'public') => void;
  disabled?: boolean;
  nsfwMode?: boolean;
}

interface VisibilityOption {
  value: 'private' | 'public';
  label: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
}

const VISIBILITY_OPTIONS: VisibilityOption[] = [
  {
    value: 'private',
    label: 'Privado',
    description: 'Solo tú puedes ver y chatear',
    icon: 'lock',
  },
  {
    value: 'public',
    label: 'Público',
    description: 'Visible en la comunidad',
    icon: 'globe',
  },
];

export function VisibilitySelector({
  value,
  onChange,
  disabled = false,
  nsfwMode = false,
}: VisibilitySelectorProps) {
  // Si NSFW está activado, forzar a privado
  const effectiveValue = nsfwMode ? 'private' : value;
  const isPublicDisabled = disabled || nsfwMode;

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Feather
          name={effectiveValue === 'private' ? 'lock' : 'globe'}
          size={18}
          color="#8b5cf6"
        />
        <Text style={styles.title}>Visibilidad del personaje</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {VISIBILITY_OPTIONS.map((option) => {
          const isSelected = effectiveValue === option.value;
          const isDisabled = option.value === 'public' ? isPublicDisabled : disabled;

          return (
            <VisibilityOption
              key={option.value}
              option={option}
              isSelected={isSelected}
              isDisabled={isDisabled}
              onPress={() => !isDisabled && onChange(option.value)}
            />
          );
        })}
      </View>

      {/* NSFW Warning */}
      {nsfwMode && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.warningContainer}>
          <Feather name="alert-circle" size={16} color="#f59e0b" />
          <Text style={styles.warningText}>
            Los personajes NSFW solo pueden ser privados para cumplir con las políticas de la comunidad.
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

interface VisibilityOptionProps {
  option: VisibilityOption;
  isSelected: boolean;
  isDisabled: boolean;
  onPress: () => void;
}

function VisibilityOption({ option, isSelected, isDisabled, onPress }: VisibilityOptionProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
    >
      <Animated.View
        style={[
          styles.optionCard,
          isSelected && styles.optionCardSelected,
          isDisabled && styles.optionCardDisabled,
          animatedStyle,
        ]}
      >
        {/* Selected indicator */}
        {isSelected && <View style={styles.selectedIndicator} />}

        <View style={styles.optionContent}>
          <View
            style={[
              styles.iconContainer,
              isSelected && styles.iconContainerSelected,
            ]}
          >
            <Feather
              name={option.icon}
              size={20}
              color={isSelected ? '#ffffff' : '#a1a1a1'}
            />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.optionLabel,
                isSelected && styles.optionLabelSelected,
              ]}
            >
              {option.label}
            </Text>
            <Text style={styles.optionDescription}>{option.description}</Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    backgroundColor: '#1a1a1a',
    position: 'relative',
    overflow: 'hidden',
  },
  optionCardSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8b5cf6',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(161, 161, 161, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSelected: {
    backgroundColor: '#8b5cf6',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  optionLabelSelected: {
    color: '#8b5cf6',
  },
  optionDescription: {
    fontSize: 12,
    color: '#a1a1a1',
    lineHeight: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#f59e0b',
    lineHeight: 18,
  },
});

export default VisibilitySelector;
