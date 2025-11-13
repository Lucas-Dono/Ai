/**
 * Type definitions para next-intl
 *
 * Este archivo define los tipos TypeScript para las traducciones,
 * proporcionando autocompletado y type-safety en todo el proyecto.
 */

import type { Pathnames } from 'next-intl/routing';

// ============================================================================
// LOCALE TYPES
// ============================================================================
export type Locale = 'es' | 'en';

// ============================================================================
// MESSAGE TYPES
// ============================================================================
/**
 * Tipo para los mensajes de traducción
 * Debe coincidir con la estructura de /messages/es.json y /messages/en.json
 */
export type Messages = {
  common: {
    welcome: string;
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    update: string;
    search: string;
    filter: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    close: string;
    confirm: string;
    error: string;
    success: string;
  };
  nav: {
    home: string;
    dashboard: string;
    agents: string;
    worlds: string;
    community: string;
    profile: string;
    settings: string;
    logout: string;
  };
  auth: {
    login: string;
    register: string;
    logout: string;
    email: string;
    password: string;
    forgotPassword: string;
    rememberMe: string;
    loginSuccess: string;
    loginError: string;
    registerSuccess: string;
    registerError: string;
  };
  agents: {
    title: string;
    create: string;
    edit: string;
    delete: string;
    name: string;
    description: string;
    personality: string;
    noAgents: string;
    createFirst: string;
  };
  chat: {
    sendMessage: string;
    typeMessage: string;
    noMessages: string;
    startConversation: string;
  };
  errors: {
    generic: string;
    notFound: string;
    unauthorized: string;
    forbidden: string;
    serverError: string;
  };
};

// ============================================================================
// PATHNAME TYPES
// ============================================================================
/**
 * Tipo para las rutas localizadas
 */
export type LocalizedPathnames = Pathnames<readonly ['es', 'en']>;

// ============================================================================
// NAMESPACE TYPES
// ============================================================================
/**
 * Tipo para los namespaces de traducción disponibles
 */
export type MessageNamespace = keyof Messages;

// ============================================================================
// TYPE AUGMENTATION
// ============================================================================
/**
 * Augment next-intl types para mejorar el autocompletado
 */
declare global {
  interface IntlMessages extends Messages {}
}
