/**
 * Sistema de colores de la aplicación
 */

export const colors = {
  // Colores primarios
  primary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6', // Principal
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },

  // Colores secundarios
  secondary: {
    50: '#FDF4FF',
    100: '#FAE8FF',
    200: '#F5D0FE',
    300: '#F0ABFC',
    400: '#E879F9',
    500: '#D946EF',
    600: '#C026D3',
    700: '#A21CAF',
    800: '#86198F',
    900: '#701A75',
  },

  // Colores neutros (grises)
  neutral: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
  },

  // Estados
  success: {
    light: '#86EFAC',
    main: '#22C55E',
    dark: '#16A34A',
  },

  error: {
    light: '#FCA5A5',
    main: '#EF4444',
    dark: '#DC2626',
  },

  warning: {
    light: '#FCD34D',
    main: '#F59E0B',
    dark: '#D97706',
  },

  info: {
    light: '#7DD3FC',
    main: '#0EA5E9',
    dark: '#0284C7',
  },

  // Backgrounds
  background: {
    primary: '#0F172A',   // Fondo principal oscuro
    secondary: '#1E293B', // Fondo secundario
    tertiary: '#334155',  // Fondo terciario
    card: '#1E293B',      // Fondo de cards
    elevated: '#334155',  // Fondo elevado
  },

  // Texto
  text: {
    primary: '#F1F5F9',   // Texto principal (claro)
    secondary: '#CBD5E1', // Texto secundario
    tertiary: '#94A3B8',  // Texto terciario
    disabled: '#64748B',  // Texto deshabilitado
  },

  // Bordes
  border: {
    light: '#334155',
    main: '#475569',
    dark: '#1E293B',
  },

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Transparente
  transparent: 'transparent',
};

// Gradientes
export const gradients = {
  primary: ['#8B5CF6', '#D946EF'],
  secondary: ['#D946EF', '#F97316'],
  dark: ['#0F172A', '#1E293B'],
  purple: ['#6366F1', '#8B5CF6', '#D946EF'],
  sunset: ['#F59E0B', '#F97316', '#EF4444'],
};
