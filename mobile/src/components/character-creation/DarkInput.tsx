/**
 * Dark Input Component - Native version of web's DarkInput
 */

import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface DarkInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
}

export function DarkInput({
  value,
  onChangeText,
  placeholder,
  error,
  multiline = false,
  keyboardType = 'default',
}: DarkInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        multiline={multiline}
        keyboardType={keyboardType}
        numberOfLines={multiline ? 4 : 1}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 8,
    padding: 12,
    color: colors.text.primary,
    fontSize: 15,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.error.main,
  },
  errorText: {
    color: colors.error.main,
    fontSize: 12,
    marginTop: 4,
  },
});
