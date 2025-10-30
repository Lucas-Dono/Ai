/**
 * Simple toast hook for notifications
 */

type ToastProps = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function useToast() {
  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    // Implementación simple usando alert por ahora
    // En producción, esto debería usar un sistema de toasts real
    if (typeof window !== 'undefined') {
      const message = description ? `${title}\n${description}` : title;

      if (variant === 'destructive') {
        console.error(message);
      } else {
        console.log(message);
      }

      // Mostrar notificación visual simple
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: description });
      } else {
        // Fallback a alert para esta versión básica
        // TODO: Implementar un sistema de toasts visual más elegante
        alert(message);
      }
    }
  };

  return { toast };
}
