'use client';

/**
 * Global Error Handler para Next.js
 *
 * Este componente captura errores no manejados en toda la aplicación
 * y previene la exposición de información sensible en producción.
 *
 * Referencias:
 * - Next.js Error Handling: https://nextjs.org/docs/app/building-your-application/routing/error-handling
 * - OWASP: https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html
 */

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error en desarrollo o a servicio de monitoring
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error caught:', error);
    } else {
      // En producción, enviar a servicio de monitoring (Sentry, DataDog, etc.)
      // NO loguear el stack trace completo
      console.error('Application error occurred:', {
        message: error.message,
        digest: error.digest,
        timestamp: new Date().toISOString(),
      });
    }
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{
            maxWidth: '600px',
            textAlign: 'center',
          }}>
            <h1 style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              color: '#dc2626',
            }}>
              Oops!
            </h1>
            <h2 style={{
              fontSize: '1.5rem',
              marginBottom: '2rem',
              color: '#374151',
            }}>
              Algo salió mal
            </h2>
            <p style={{
              fontSize: '1rem',
              marginBottom: '2rem',
              color: '#6b7280',
            }}>
              {process.env.NODE_ENV === 'development'
                ? `Error: ${error.message}`
                : 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde.'}
            </p>
            {error.digest && (
              <p style={{
                fontSize: '0.875rem',
                marginBottom: '2rem',
                color: '#9ca3af',
                fontFamily: 'monospace',
              }}>
                Error ID: {error.digest}
              </p>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => reset()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Intentar de nuevo
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Volver al inicio
              </button>
            </div>
          </div>

          {/* Solo mostrar stack trace en desarrollo */}
          {process.env.NODE_ENV === 'development' && error.stack && (
            <details style={{
              marginTop: '3rem',
              maxWidth: '800px',
              width: '100%',
            }}>
              <summary style={{
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '0.5rem',
              }}>
                Stack Trace (solo en desarrollo)
              </summary>
              <pre style={{
                backgroundColor: '#1f2937',
                color: '#f9fafb',
                padding: '1rem',
                borderRadius: '0.5rem',
                overflow: 'auto',
                fontSize: '0.75rem',
                textAlign: 'left',
              }}>
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
