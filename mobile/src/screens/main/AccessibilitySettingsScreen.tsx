/**
 * Pantalla de configuración de accesibilidad visual
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from '../../navigation/types';
import { useAccessibilityContext } from '../../contexts/AccessibilityContext';
import { colors, spacing, typography, borderRadius } from '../../theme';
import type { ColorBlindMode, FontSize, LineSpacing } from '../../hooks/useAccessibility';

type AccessibilitySettingsScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList>;
};

export default function AccessibilitySettingsScreen({ navigation }: AccessibilitySettingsScreenProps) {
  const { settings, updateSettings, resetSettings, getAdjustedColor } = useAccessibilityContext();

  const colorBlindModes: { value: ColorBlindMode; label: string; description: string }[] = [
    { value: 'none', label: 'Sin filtro', description: 'Visión normal de colores' },
    { value: 'protanopia', label: 'Protanopia', description: 'Deficiencia de rojo (1% de hombres)' },
    { value: 'deuteranopia', label: 'Deuteranopia', description: 'Deficiencia de verde (1% de hombres)' },
    { value: 'tritanopia', label: 'Tritanopia', description: 'Deficiencia de azul (raro)' },
    { value: 'achromatopsia', label: 'Acromatopsia', description: 'Visión monocromática (muy raro)' },
  ];

  const fontSizes: { value: FontSize; label: string; example: string }[] = [
    { value: 'normal', label: 'Normal', example: '16sp base' },
    { value: 'large', label: 'Grande', example: '18sp base (+12.5%)' },
    { value: 'extra-large', label: 'Muy grande', example: '20sp base (+25%)' },
  ];

  const lineSpacings: { value: LineSpacing; label: string; description: string }[] = [
    { value: 'normal', label: 'Normal', description: '1.5x' },
    { value: 'comfortable', label: 'Cómodo', description: '1.75x' },
    { value: 'spacious', label: 'Espacioso', description: '2x' },
  ];

  const handleReset = () => {
    Alert.alert(
      'Restablecer configuración',
      '¿Estás seguro de que quieres volver a los valores predeterminados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: () => {
            resetSettings();
            Alert.alert('Configuración restablecida');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={getAdjustedColor(colors.text.primary)} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: getAdjustedColor(colors.text.primary) }]}>
          Accesibilidad Visual
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filtros de daltonismo */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="eye-outline" size={20} color={getAdjustedColor(colors.primary[400])} />
          <Text style={[styles.sectionTitle, { color: getAdjustedColor(colors.text.secondary) }]}>
            Filtros de Daltonismo
          </Text>
        </View>
        <Text style={[styles.sectionDescription, { color: getAdjustedColor(colors.text.tertiary) }]}>
          Ajusta los colores para diferentes tipos de deficiencias visuales
        </Text>

        {colorBlindModes.map((mode) => (
          <TouchableOpacity
            key={mode.value}
            style={[
              styles.optionCard,
              settings.colorBlindMode === mode.value && styles.optionCardSelected,
              { backgroundColor: getAdjustedColor(colors.background.card) }
            ]}
            onPress={() => updateSettings({ colorBlindMode: mode.value })}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionLeft}>
                <Text style={[styles.optionLabel, { color: getAdjustedColor(colors.text.primary) }]}>
                  {mode.label}
                </Text>
                <Text style={[styles.optionDescription, { color: getAdjustedColor(colors.text.tertiary) }]}>
                  {mode.description}
                </Text>
              </View>
              {settings.colorBlindMode === mode.value && (
                <Ionicons name="checkmark-circle" size={24} color={getAdjustedColor(colors.primary[400])} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Alto contraste */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="contrast-outline" size={20} color={getAdjustedColor(colors.primary[400])} />
          <Text style={[styles.sectionTitle, { color: getAdjustedColor(colors.text.secondary) }]}>
            Contraste y Claridad
          </Text>
        </View>
        <Text style={[styles.sectionDescription, { color: getAdjustedColor(colors.text.tertiary) }]}>
          Mejora la legibilidad con mayor contraste
        </Text>

        <View style={[styles.optionCard, { backgroundColor: getAdjustedColor(colors.background.card) }]}>
          <View style={styles.optionContent}>
            <View style={styles.optionLeft}>
              <Text style={[styles.optionLabel, { color: getAdjustedColor(colors.text.primary) }]}>
                Modo alto contraste
              </Text>
              <Text style={[styles.optionDescription, { color: getAdjustedColor(colors.text.tertiary) }]}>
                Aumenta el contraste para mejor legibilidad
              </Text>
            </View>
            <Switch
              value={settings.highContrast}
              onValueChange={(value) => updateSettings({ highContrast: value })}
              trackColor={{ false: colors.border.light, true: getAdjustedColor(colors.primary[500]) }}
              thumbColor={getAdjustedColor(colors.text.primary)}
            />
          </View>
        </View>
      </View>

      {/* Tamaño de fuente */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="text-outline" size={20} color={getAdjustedColor(colors.primary[400])} />
          <Text style={[styles.sectionTitle, { color: getAdjustedColor(colors.text.secondary) }]}>
            Tamaño de Texto
          </Text>
        </View>
        <Text style={[styles.sectionDescription, { color: getAdjustedColor(colors.text.tertiary) }]}>
          Ajusta el tamaño del texto para mejor legibilidad
        </Text>

        {fontSizes.map((size) => (
          <TouchableOpacity
            key={size.value}
            style={[
              styles.optionCard,
              settings.fontSize === size.value && styles.optionCardSelected,
              { backgroundColor: getAdjustedColor(colors.background.card) }
            ]}
            onPress={() => updateSettings({ fontSize: size.value })}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionLeft}>
                <Text style={[styles.optionLabel, { color: getAdjustedColor(colors.text.primary) }]}>
                  {size.label}
                </Text>
                <Text style={[styles.optionDescription, { color: getAdjustedColor(colors.text.tertiary) }]}>
                  {size.example}
                </Text>
              </View>
              {settings.fontSize === size.value && (
                <Ionicons name="checkmark-circle" size={24} color={getAdjustedColor(colors.primary[400])} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Espaciado de líneas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="reorder-four-outline" size={20} color={getAdjustedColor(colors.primary[400])} />
          <Text style={[styles.sectionTitle, { color: getAdjustedColor(colors.text.secondary) }]}>
            Espaciado de Líneas
          </Text>
        </View>
        <Text style={[styles.sectionDescription, { color: getAdjustedColor(colors.text.tertiary) }]}>
          Aumenta el espacio entre líneas
        </Text>

        {lineSpacings.map((spacing) => (
          <TouchableOpacity
            key={spacing.value}
            style={[
              styles.optionCard,
              settings.lineSpacing === spacing.value && styles.optionCardSelected,
              { backgroundColor: getAdjustedColor(colors.background.card) }
            ]}
            onPress={() => updateSettings({ lineSpacing: spacing.value })}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionLeft}>
                <Text style={[styles.optionLabel, { color: getAdjustedColor(colors.text.primary) }]}>
                  {spacing.label}
                </Text>
                <Text style={[styles.optionDescription, { color: getAdjustedColor(colors.text.tertiary) }]}>
                  {spacing.description}
                </Text>
              </View>
              {settings.lineSpacing === spacing.value && (
                <Ionicons name="checkmark-circle" size={24} color={getAdjustedColor(colors.primary[400])} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reducción de movimiento */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flash-outline" size={20} color={getAdjustedColor(colors.primary[400])} />
          <Text style={[styles.sectionTitle, { color: getAdjustedColor(colors.text.secondary) }]}>
            Animaciones
          </Text>
        </View>
        <Text style={[styles.sectionDescription, { color: getAdjustedColor(colors.text.tertiary) }]}>
          Reduce o elimina animaciones
        </Text>

        <View style={[styles.optionCard, { backgroundColor: getAdjustedColor(colors.background.card) }]}>
          <View style={styles.optionContent}>
            <View style={styles.optionLeft}>
              <Text style={[styles.optionLabel, { color: getAdjustedColor(colors.text.primary) }]}>
                Reducir movimiento
              </Text>
              <Text style={[styles.optionDescription, { color: getAdjustedColor(colors.text.tertiary) }]}>
                Minimiza las animaciones y transiciones
              </Text>
            </View>
            <Switch
              value={settings.reduceMotion}
              onValueChange={(value) => updateSettings({ reduceMotion: value })}
              trackColor={{ false: colors.border.light, true: getAdjustedColor(colors.primary[500]) }}
              thumbColor={getAdjustedColor(colors.text.primary)}
            />
          </View>
        </View>
      </View>

      {/* Restablecer */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: getAdjustedColor(colors.error.main) }]}
          onPress={handleReset}
        >
          <Ionicons name="refresh-outline" size={20} color={getAdjustedColor(colors.error.main)} />
          <Text style={[styles.resetButtonText, { color: getAdjustedColor(colors.error.main) }]}>
            Restablecer configuración
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  placeholder: {
    width: 40,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  optionCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary[400],
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  optionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs / 2,
  },
  optionDescription: {
    fontSize: typography.fontSize.xs,
    lineHeight: 16,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  resetButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  bottomPadding: {
    height: spacing.xl * 2,
  },
});
