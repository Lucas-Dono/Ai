/**
 * Sistema de diseño completo de la aplicación
 */

import { colors, gradients } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

/**
 * Colores simplificados para acceso directo
 * Útil cuando no necesitas todas las variantes numeradas
 *
 * Ejemplo:
 * - En lugar de: colors.primary[500]
 * - Usa: simpleColors.primary
 */
export const simpleColors = {
  primary: colors.primary[500],
  primaryLight: colors.primary[400],
  primaryDark: colors.primary[600],

  secondary: colors.secondary[500],
  secondaryLight: colors.secondary[400],
  secondaryDark: colors.secondary[600],

  success: colors.success.main,
  successLight: colors.success.light,
  successDark: colors.success.dark,

  warning: colors.warning.main,
  warningLight: colors.warning.light,
  warningDark: colors.warning.dark,

  error: colors.error.main,
  errorLight: colors.error.light,
  errorDark: colors.error.dark,

  info: colors.info.main,
  infoLight: colors.info.light,
  infoDark: colors.info.dark,

  // Colores neutros
  background: colors.background.primary,
  backgroundSecondary: colors.background.secondary,
  surface: colors.background.elevated,

  text: colors.text.primary,
  textSecondary: colors.text.secondary,
  textTertiary: colors.text.tertiary,
};

export const theme = {
  colors,
  simpleColors,
  gradients,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export { colors, gradients, typography, spacing, borderRadius, shadows };
