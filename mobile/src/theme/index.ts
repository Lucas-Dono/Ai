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

  success: colors.success[500],
  successLight: colors.success[400],
  successDark: colors.success[600],

  warning: colors.warning[500],
  warningLight: colors.warning[400],
  warningDark: colors.warning[600],

  error: colors.error[500],
  errorLight: colors.error[400],
  errorDark: colors.error[600],

  info: colors.info[500],
  infoLight: colors.info[400],
  infoDark: colors.info[600],

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
