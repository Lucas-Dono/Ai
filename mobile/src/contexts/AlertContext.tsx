/**
 * AlertContext - Sistema global de alertas estilizadas
 *
 * Proporciona un sistema centralizado para mostrar alertas no intrusivas
 * en la parte inferior de la pantalla con animaciones suaves.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * Tipos de alerta disponibles
 */
export type AlertType = 'success' | 'error' | 'warning' | 'info';

/**
 * Estructura de una alerta
 */
export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  duration?: number; // Duración en ms antes de auto-descartar (0 = manual)
}

/**
 * Opciones al mostrar una alerta
 */
export interface ShowAlertOptions {
  type?: AlertType;
  duration?: number;
}

/**
 * Contexto de alertas
 */
interface AlertContextType {
  alerts: Alert[];
  showAlert: (message: string, options?: ShowAlertOptions) => string;
  dismissAlert: (id: string) => void;
  dismissAll: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

/**
 * Hook para usar el sistema de alertas
 */
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert debe usarse dentro de AlertProvider');
  }
  return context;
};

/**
 * Props del proveedor
 */
interface AlertProviderProps {
  children: ReactNode;
  maxAlerts?: number; // Máximo de alertas simultáneas (default: 3)
}

/**
 * Proveedor de alertas
 */
export const AlertProvider: React.FC<AlertProviderProps> = ({
  children,
  maxAlerts = 3
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  /**
   * Generar ID único para alerta
   */
  const generateId = useCallback(() => {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Mostrar nueva alerta
   */
  const showAlert = useCallback((
    message: string,
    options?: ShowAlertOptions
  ): string => {
    const id = generateId();
    const newAlert: Alert = {
      id,
      type: options?.type || 'info',
      message,
      duration: options?.duration !== undefined ? options.duration : 3000, // 3s por defecto
    };

    setAlerts(prev => {
      // Limitar cantidad de alertas
      const updated = [...prev, newAlert];
      if (updated.length > maxAlerts) {
        // Remover las más antiguas
        return updated.slice(updated.length - maxAlerts);
      }
      return updated;
    });

    // Auto-descartar si tiene duración
    if (newAlert.duration && newAlert.duration > 0) {
      setTimeout(() => {
        dismissAlert(id);
      }, newAlert.duration);
    }

    return id;
  }, [generateId, maxAlerts]);

  /**
   * Descartar alerta específica
   */
  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  /**
   * Descartar todas las alertas
   */
  const dismissAll = useCallback(() => {
    setAlerts([]);
  }, []);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        showAlert,
        dismissAlert,
        dismissAll,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};
