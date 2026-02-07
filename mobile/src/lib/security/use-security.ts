/**
 * React Hook para Security Manager
 */

import { useState, useEffect } from 'react';
import { SecurityManager } from './security-manager';
import type { DeviceSecurityReport } from './device-security';
import type { SecurityInitResult } from './security-manager';

interface UseSecurityResult {
  isSecure: boolean;
  isLoading: boolean;
  report: DeviceSecurityReport | null;
  warnings: string[];
  blockedReason: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook para verificar seguridad del dispositivo
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isSecure, warnings, blockedReason } = useSecurity();
 *
 *   if (blockedReason) {
 *     return <SecurityBlockedScreen reason={blockedReason} />;
 *   }
 *
 *   return <MyApp />;
 * }
 * ```
 */
export function useSecurity(userId?: string): UseSecurityResult {
  const [state, setState] = useState<{
    isSecure: boolean;
    isLoading: boolean;
    report: DeviceSecurityReport | null;
    warnings: string[];
    blockedReason: string | null;
  }>({
    isSecure: true,
    isLoading: true,
    report: null,
    warnings: [],
    blockedReason: null,
  });

  const runSecurityCheck = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const result: SecurityInitResult = await SecurityManager.initialize(userId);

      setState({
        isSecure: result.success,
        isLoading: false,
        report: result.securityReport || null,
        warnings: result.warnings,
        blockedReason: result.blockedReason || null,
      });
    } catch (error) {
      console.error('[useSecurity] Error during security check:', error);
      setState({
        isSecure: true, // Fail open en caso de error
        isLoading: false,
        report: null,
        warnings: ['Error al verificar seguridad del dispositivo'],
        blockedReason: null,
      });
    }
  };

  useEffect(() => {
    runSecurityCheck();
  }, [userId]);

  return {
    ...state,
    refresh: runSecurityCheck,
  };
}

/**
 * Hook simple para verificar si el dispositivo es seguro
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isSecure = useIsSecureDevice();
 *
 *   if (!isSecure) {
 *     return <WarningMessage />;
 *   }
 *
 *   return <SecureContent />;
 * }
 * ```
 */
export function useIsSecureDevice(): boolean {
  const [isSecure, setIsSecure] = useState(true);

  useEffect(() => {
    SecurityManager.quickCheck().then(setIsSecure);
  }, []);

  return isSecure;
}
