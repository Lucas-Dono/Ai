/**
 * Ejemplo de cómo usar el sistema de accesibilidad en componentes
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAccessibilityContext } from './src/contexts/AccessibilityContext';
import { colors, spacing, typography } from './src/theme';

export function AccessibleComponentExample() {
  const {
    settings,
    fontSizeMultiplier,
    lineHeightMultiplier,
    getAdjustedColor,
  } = useAccessibilityContext();

  return (
    <View style={[
      styles.container,
      { backgroundColor: getAdjustedColor(colors.background.primary) }
    ]}>
      {/* Título con tamaño ajustable */}
      <Text
        style={[
          styles.title,
          {
            fontSize: typography.fontSize.xl * fontSizeMultiplier,
            lineHeight: 28 * lineHeightMultiplier,
            color: getAdjustedColor(colors.text.primary),
          }
        ]}
      >
        Componente Accesible
      </Text>

      {/* Descripción con espaciado ajustable */}
      <Text
        style={[
          styles.description,
          {
            fontSize: typography.fontSize.base * fontSizeMultiplier,
            lineHeight: 20 * lineHeightMultiplier,
            color: getAdjustedColor(colors.text.secondary),
          }
        ]}
      >
        Este componente se adapta automáticamente a las preferencias de
        accesibilidad del usuario, incluyendo tamaño de fuente, espaciado
        de líneas y filtros de color para daltonismo.
      </Text>

      {/* Card con colores ajustados */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: getAdjustedColor(colors.background.card),
            borderColor: settings.highContrast
              ? getAdjustedColor(colors.text.primary)
              : getAdjustedColor(colors.border.light),
            borderWidth: settings.highContrast ? 2 : 1,
          }
        ]}
      >
        <Text
          style={[
            styles.cardTitle,
            {
              fontSize: typography.fontSize.base * fontSizeMultiplier,
              color: getAdjustedColor(colors.text.primary),
            }
          ]}
        >
          Información Importante
        </Text>
        <Text
          style={[
            styles.cardText,
            {
              fontSize: typography.fontSize.sm * fontSizeMultiplier,
              lineHeight: 18 * lineHeightMultiplier,
              color: getAdjustedColor(colors.text.tertiary),
            }
          ]}
        >
          Los colores y tamaños se ajustan según tus preferencias.
        </Text>
      </View>

      {/* Botón con colores accesibles */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: getAdjustedColor(colors.primary[500]),
          }
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            {
              fontSize: typography.fontSize.base * fontSizeMultiplier,
              color: getAdjustedColor(colors.text.primary),
            }
          ]}
        >
          Acción Principal
        </Text>
      </TouchableOpacity>

      {/* Indicador del estado actual */}
      <View style={styles.statusContainer}>
        <Text
          style={[
            styles.statusLabel,
            {
              fontSize: typography.fontSize.xs * fontSizeMultiplier,
              color: getAdjustedColor(colors.text.tertiary),
            }
          ]}
        >
          Estado de Accesibilidad:
        </Text>
        <Text
          style={[
            styles.statusValue,
            {
              fontSize: typography.fontSize.xs * fontSizeMultiplier,
              color: getAdjustedColor(colors.primary[400]),
            }
          ]}
        >
          {settings.colorBlindMode !== 'none' && `Filtro: ${settings.colorBlindMode} • `}
          {settings.highContrast && 'Alto contraste • '}
          Fuente: {settings.fontSize} •
          Espaciado: {settings.lineSpacing}
          {settings.reduceMotion && ' • Movimiento reducido'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },
  description: {
    marginBottom: spacing.xl,
  },
  card: {
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  cardText: {
    // lineHeight se aplica dinámicamente
  },
  button: {
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  buttonText: {
    fontWeight: typography.fontWeight.semibold,
  },
  statusContainer: {
    padding: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  statusLabel: {
    marginBottom: spacing.xs / 2,
  },
  statusValue: {
    fontWeight: typography.fontWeight.medium,
  },
});

/**
 * GUÍA RÁPIDA DE USO:
 *
 * 1. Importar el contexto:
 *    import { useAccessibilityContext } from '../contexts/AccessibilityContext';
 *
 * 2. Obtener las funciones:
 *    const { fontSizeMultiplier, getAdjustedColor } = useAccessibilityContext();
 *
 * 3. Aplicar a estilos:
 *    - fontSize: baseFontSize * fontSizeMultiplier
 *    - lineHeight: baseLineHeight * lineHeightMultiplier
 *    - color: getAdjustedColor(originalColor)
 *
 * 4. Considerar alto contraste:
 *    - Aumentar grosor de bordes cuando settings.highContrast === true
 *    - Usar colores más contrastantes
 *
 * 5. Reducir animaciones:
 *    - Deshabilitar/reducir animaciones cuando settings.reduceMotion === true
 *
 * IMPORTANTE:
 * - Siempre multiplicar tamaños de fuente explícitamente
 * - Pasar todos los colores por getAdjustedColor()
 * - Verificar alto contraste para ajustar bordes
 * - Respetar reduceMotion para animaciones
 */
