/**
 * Código compartido entre web y mobile
 * @creador-ia/shared
 */

// Exportar esquemas de validación
export * from './schemas';

// Exportar tipos
export * from './types';

// Exportar utilidades (solo las compatibles con React Native)
export { cn } from './utils';

// Exportar cliente API
export * from './api/client';
export * from './api/endpoints';
