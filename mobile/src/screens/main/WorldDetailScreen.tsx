import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WorldDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>World Detail Screen (En desarrollo)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#FFFFFF' },
});
