/**
 * Magic Button Component - Native version with AI generation animation
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

interface MagicButtonProps {
  onPress: () => void;
  loading: boolean;
  text: string;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'gradient';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

export function MagicButton({
  onPress,
  loading,
  text,
  fullWidth = false,
  variant = 'primary',
  icon = 'sparkles',
  disabled = false,
}: MagicButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'gradient' && styles.gradient,
        isDisabled && styles.disabled,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={colors.text.primary} size="small" />
        ) : (
          <Ionicons
            name={icon}
            size={16}
            color={variant === 'secondary' ? colors.text.secondary : colors.text.primary}
          />
        )}
        <Text
          style={[
            styles.text,
            variant === 'secondary' && styles.textSecondary,
            isDisabled && styles.textDisabled,
          ]}
        >
          {loading ? 'Procesando...' : text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primary: {
    backgroundColor: colors.primary[600],
  },
  secondary: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  gradient: {
    backgroundColor: colors.primary[600],
    // Note: For true gradient, you'd need react-native-linear-gradient
  },
  disabled: {
    backgroundColor: colors.background.elevated,
    opacity: 0.5,
  },
  text: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  textSecondary: {
    color: colors.text.secondary,
  },
  textDisabled: {
    color: colors.text.tertiary,
  },
});
