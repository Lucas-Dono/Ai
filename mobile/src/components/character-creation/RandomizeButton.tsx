/**
 * Randomize Button
 *
 * Botón de aleatorización para inputs con opciones predefinidas
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Dices } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface RandomizeButtonProps {
  onPress: () => void;
  loading?: boolean;
  size?: number;
}

export function RandomizeButton({ onPress, loading, size = 20 }: RandomizeButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#8b5cf6" />
      ) : (
        <Dices size={size} color="#8b5cf6" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 10,
  },
});
