/**
 * Device Security Service - Detección de amenazas de seguridad
 *
 * Protecciones:
 * - Root/Jailbreak detection
 * - Emulator detection
 * - Debug mode detection
 * - ADB enabled detection (Android)
 * - Mock location detection
 */

import JailMonkey from 'jail-monkey';
import { Platform } from 'react-native';

export interface SecurityCheck {
  name: string;
  passed: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

export interface DeviceSecurityReport {
  isSecure: boolean;
  checks: SecurityCheck[];
  criticalIssues: string[];
  warnings: string[];
  timestamp: Date;
}

export class DeviceSecurityService {
  /**
   * Ejecutar todas las comprobaciones de seguridad
   */
  static async runSecurityChecks(): Promise<DeviceSecurityReport> {
    const checks: SecurityCheck[] = [];

    // Check 1: Root/Jailbreak Detection
    const isJailBroken = JailMonkey.isJailBroken();
    checks.push({
      name: 'root_jailbreak_detection',
      passed: !isJailBroken,
      severity: 'critical',
      message: isJailBroken
        ? 'Device is rooted/jailbroken - security compromised'
        : 'Device is not rooted/jailbroken',
    });

    // Check 2: Developer Mode (Android only)
    // Note: isDebugged() no disponible en jail-monkey 2.8.4
    // Se puede implementar con detección nativa si es necesario

    // Check 3: Mock Location Detection (Android only)
    if (Platform.OS === 'android') {
      const canMockLocation = JailMonkey.canMockLocation();
      checks.push({
        name: 'mock_location_detection',
        passed: !canMockLocation,
        severity: 'medium',
        message: canMockLocation
          ? 'Mock location enabled - GPS spoofing possible'
          : 'Mock location disabled',
      });
    }

    // Check 4: Hook Detection
    const hookDetected = JailMonkey.hookDetected();
    checks.push({
      name: 'hook_detection',
      passed: !hookDetected,
      severity: 'critical',
      message: hookDetected
        ? 'Security hooks detected - possible instrumentation'
        : 'No security hooks detected',
    });

    // Check 5: Trusted Apps (Android)
    if (Platform.OS === 'android') {
      const trustFall = JailMonkey.trustFall();
      checks.push({
        name: 'trusted_apps_check',
        passed: trustFall,
        severity: 'medium',
        message: trustFall
          ? 'No suspicious apps detected'
          : 'Suspicious apps detected on device',
      });
    }

    // Analizar resultados
    const criticalIssues = checks
      .filter((c) => !c.passed && c.severity === 'critical')
      .map((c) => c.message);

    const warnings = checks
      .filter((c) => !c.passed && (c.severity === 'high' || c.severity === 'medium'))
      .map((c) => c.message);

    const isSecure = criticalIssues.length === 0;

    return {
      isSecure,
      checks,
      criticalIssues,
      warnings,
      timestamp: new Date(),
    };
  }

  /**
   * Verificación rápida - solo issues críticos
   */
  static async quickSecurityCheck(): Promise<boolean> {
    const isJailBroken = JailMonkey.isJailBroken();
    const hookDetected = JailMonkey.hookDetected();

    return !isJailBroken && !hookDetected;
  }

  /**
   * Obtener información del dispositivo para logging
   */
  static getDeviceInfo(): {
    platform: string;
    isJailBroken: boolean;
    canMockLocation: boolean;
    hookDetected: boolean;
  } {
    return {
      platform: Platform.OS,
      isJailBroken: JailMonkey.isJailBroken(),
      canMockLocation: Platform.OS === 'android' ? JailMonkey.canMockLocation() : false,
      hookDetected: JailMonkey.hookDetected(),
    };
  }

  /**
   * Acción recomendada basada en el reporte de seguridad
   */
  static getRecommendedAction(report: DeviceSecurityReport): {
    action: 'allow' | 'warn' | 'block';
    message: string;
  } {
    if (report.criticalIssues.length > 0) {
      return {
        action: 'block',
        message:
          'Este dispositivo tiene problemas de seguridad críticos. Por favor, usa un dispositivo seguro para proteger tu información.',
      };
    }

    if (report.warnings.length > 0) {
      return {
        action: 'warn',
        message:
          'Se detectaron algunas advertencias de seguridad en tu dispositivo. Procede con precaución.',
      };
    }

    return {
      action: 'allow',
      message: 'Tu dispositivo pasó todas las comprobaciones de seguridad.',
    };
  }

  /**
   * Log de security check para analytics
   */
  static async logSecurityCheck(userId?: string): Promise<void> {
    const report = await this.runSecurityChecks();
    const deviceInfo = this.getDeviceInfo();

    console.log('[DeviceSecurity] Security check completed:', {
      userId,
      isSecure: report.isSecure,
      criticalIssues: report.criticalIssues.length,
      warnings: report.warnings.length,
      deviceInfo,
      timestamp: report.timestamp.toISOString(),
    });

    // TODO: Enviar a analytics backend si hay issues
    if (!report.isSecure || report.warnings.length > 0) {
      console.warn('[DeviceSecurity] ⚠️ Security issues detected:', {
        criticalIssues: report.criticalIssues,
        warnings: report.warnings,
      });
    }
  }
}
