/**
 * Security Manager - Orquestador central de seguridad
 *
 * Integra todas las protecciones de seguridad:
 * - Device security checks
 * - SSL pinning
 * - Runtime integrity
 * - Security events logging
 */

import { DeviceSecurityService } from './device-security';
import { SSLPinningService } from './ssl-pinning';
import type { DeviceSecurityReport } from './device-security';

export interface SecurityConfiguration {
  enableDeviceChecks: boolean;
  enableSSLPinning: boolean;
  blockInsecureDevices: boolean;
  logSecurityEvents: boolean;
}

export interface SecurityInitResult {
  success: boolean;
  securityReport?: DeviceSecurityReport;
  blockedReason?: string;
  warnings: string[];
}

export class SecurityManager {
  private static config: SecurityConfiguration = {
    enableDeviceChecks: !__DEV__, // Deshabilitar en desarrollo
    enableSSLPinning: !__DEV__,
    blockInsecureDevices: !__DEV__,
    logSecurityEvents: true,
  };

  /**
   * Configurar opciones de seguridad
   */
  static configure(config: Partial<SecurityConfiguration>): void {
    this.config = { ...this.config, ...config };
    console.log('[SecurityManager] Configuration updated:', this.config);

    // Aplicar configuración a servicios
    SSLPinningService.setEnabled(this.config.enableSSLPinning);
  }

  /**
   * Inicialización de seguridad al inicio de la app
   */
  static async initialize(userId?: string): Promise<SecurityInitResult> {
    console.log('[SecurityManager] 🔐 Initializing security...');

    const warnings: string[] = [];

    // 1. Device Security Checks
    if (this.config.enableDeviceChecks) {
      const report = await DeviceSecurityService.runSecurityChecks();
      const recommendation = DeviceSecurityService.getRecommendedAction(report);

      // Log security check
      if (this.config.logSecurityEvents) {
        await DeviceSecurityService.logSecurityCheck(userId);
      }

      // Bloquear dispositivos inseguros si está configurado
      if (this.config.blockInsecureDevices && recommendation.action === 'block') {
        return {
          success: false,
          securityReport: report,
          blockedReason: recommendation.message,
          warnings: report.warnings,
        };
      }

      // Agregar warnings
      if (report.warnings.length > 0) {
        warnings.push(...report.warnings);
      }

      console.log('[SecurityManager] ✅ Device security check completed');
    }

    // 2. SSL Pinning Setup
    if (this.config.enableSSLPinning) {
      console.log('[SecurityManager] 🔒 SSL Pinning enabled');
      if (__DEV__) {
        console.warn(
          '[SecurityManager] ⚠️ SSL Pinning is disabled in development mode'
        );
        console.log(SSLPinningService.getSetupInstructions());
      }
    }

    console.log('[SecurityManager] ✅ Security initialization complete');

    return {
      success: true,
      warnings,
    };
  }

  /**
   * Verificación de seguridad rápida (sin bloquear UI)
   */
  static async quickCheck(): Promise<boolean> {
    if (!this.config.enableDeviceChecks) {
      return true;
    }

    return await DeviceSecurityService.quickSecurityCheck();
  }

  /**
   * Reporte completo de seguridad
   */
  static async getSecurityReport(): Promise<DeviceSecurityReport> {
    return await DeviceSecurityService.runSecurityChecks();
  }

  /**
   * Verificar si la app está en un dispositivo seguro
   */
  static async isSecureDevice(): Promise<boolean> {
    const report = await this.getSecurityReport();
    return report.isSecure;
  }

  /**
   * Log de evento de seguridad
   */
  static logEvent(
    event: string,
    severity: 'info' | 'warning' | 'error' | 'critical',
    details?: Record<string, unknown>
  ): void {
    if (!this.config.logSecurityEvents) {
      return;
    }

    const logEntry = {
      event,
      severity,
      timestamp: new Date().toISOString(),
      ...details,
    };

    switch (severity) {
      case 'critical':
      case 'error':
        console.error('[SecurityManager]', logEntry);
        break;
      case 'warning':
        console.warn('[SecurityManager]', logEntry);
        break;
      default:
        console.log('[SecurityManager]', logEntry);
    }

    // TODO: Enviar a backend analytics
  }

  /**
   * Obtener configuración actual
   */
  static getConfiguration(): SecurityConfiguration {
    return { ...this.config };
  }

  /**
   * Deshabilitar seguridad (SOLO para desarrollo/testing)
   */
  static disableAll(): void {
    if (!__DEV__) {
      console.error('[SecurityManager] Cannot disable security in production!');
      return;
    }

    this.configure({
      enableDeviceChecks: false,
      enableSSLPinning: false,
      blockInsecureDevices: false,
      logSecurityEvents: true,
    });

    console.warn('[SecurityManager] ⚠️ ALL SECURITY DISABLED (development only)');
  }
}
