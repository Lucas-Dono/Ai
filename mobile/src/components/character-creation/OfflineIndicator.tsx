/**
 * Offline Indicator
 *
 * Indicador compacto que solo aparece cuando el usuario está sin conexión
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';

interface OfflineIndicatorProps {
  isOnline: boolean;
}

export function OfflineIndicator({ isOnline }: OfflineIndicatorProps) {
  if (isOnline) return null;

  return (
    <View style={styles.container}>
      <WifiOff size={16} color="#f59e0b" />
      <Text style={styles.text}>Sin conexión</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
});
