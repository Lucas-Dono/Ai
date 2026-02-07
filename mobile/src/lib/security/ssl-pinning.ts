/**
 * SSL/TLS Certificate Pinning
 *
 * Protección contra ataques Man-in-the-Middle (MITM)
 *
 * Implementación:
 * - Public Key Pinning (más flexible que certificate pinning)
 * - Múltiples pins de backup para rotación de certificados
 * - Validación en cada request HTTPS
 *
 * NOTA: Para producción, necesitarás obtener los hashes SHA-256
 * de las public keys de tu servidor usando:
 *
 * openssl s_client -connect yourdomain.com:443 | \
 * openssl x509 -pubkey -noout | \
 * openssl rsa -pubin -outform der | \
 * openssl dgst -sha256 -binary | \
 * openssl enc -base64
 */

import { Platform } from 'react-native';

interface SSLPinConfig {
  hostname: string;
  pins: string[]; // SHA-256 hashes de las public keys
}

// Configuración de certificados permitidos
const SSL_PIN_CONFIGS: SSLPinConfig[] = [
  {
    // Producción
    hostname: 'yourdomain.com',
    pins: [
      // Pin principal (certificado actual)
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
      // Pin de backup (certificado de rotación)
      'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=',
      // Pin del CA (Let's Encrypt, Cloudflare, etc.)
      'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC=',
    ],
  },
  {
    // Desarrollo/Staging (opcional)
    hostname: 'staging.yourdomain.com',
    pins: [
      'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD=',
    ],
  },
];

export class SSLPinningService {
  private static enabled = __DEV__ ? false : true; // Deshabilitar en desarrollo

  /**
   * Habilitar/deshabilitar SSL pinning
   * SOLO usar para desarrollo/testing
   */
  static setEnabled(enabled: boolean): void {
    if (__DEV__) {
      this.enabled = enabled;
      console.log(`[SSLPinning] ${enabled ? 'Enabled' : 'Disabled'}`);
    } else {
      console.warn('[SSLPinning] Cannot disable in production');
    }
  }

  /**
   * Verificar si un hostname tiene pinning configurado
   */
  static isPinned(hostname: string): boolean {
    return SSL_PIN_CONFIGS.some((config) => config.hostname === hostname);
  }

  /**
   * Obtener configuración de pins para un hostname
   */
  static getPinConfig(hostname: string): SSLPinConfig | undefined {
    return SSL_PIN_CONFIGS.find((config) => config.hostname === hostname);
  }

  /**
   * Validar certificado (llamado por interceptor de Axios)
   *
   * NOTA: La validación real del certificado debe hacerse
   * a nivel nativo. Esta función es más bien un placeholder
   * para logging y control.
   *
   * Para implementación completa con react-native-ssl-pinning:
   * https://github.com/MaxToyberman/react-native-ssl-pinning
   */
  static async validateCertificate(
    hostname: string,
    certificateHash?: string
  ): Promise<boolean> {
    if (!this.enabled) {
      console.log('[SSLPinning] Validation skipped (disabled)');
      return true;
    }

    const config = this.getPinConfig(hostname);

    if (!config) {
      // Hostname no configurado para pinning
      console.log(`[SSLPinning] No pinning configured for ${hostname}`);
      return true;
    }

    if (!certificateHash) {
      console.warn(`[SSLPinning] ⚠️ No certificate hash provided for ${hostname}`);
      return false;
    }

    // Verificar si el hash está en la lista de pins permitidos
    const isValid = config.pins.includes(certificateHash);

    if (!isValid) {
      console.error(`[SSLPinning] ❌ Certificate validation failed for ${hostname}`);
      console.error(`[SSLPinning] Expected one of:`, config.pins);
      console.error(`[SSLPinning] Got:`, certificateHash);
      return false;
    }

    console.log(`[SSLPinning] ✅ Certificate validated for ${hostname}`);
    return true;
  }

  /**
   * Obtener instrucciones para configurar pins
   */
  static getSetupInstructions(): string {
    return `
SSL Certificate Pinning Setup:

1. Obtener el hash SHA-256 de la public key de tu servidor:

   openssl s_client -connect yourdomain.com:443 | \\
   openssl x509 -pubkey -noout | \\
   openssl rsa -pubin -outform der | \\
   openssl dgst -sha256 -binary | \\
   openssl enc -base64

2. Agregar el hash a SSL_PIN_CONFIGS en ssl-pinning.ts

3. Agregar pins de backup (certificado de rotación)

4. Para implementación nativa completa, usar react-native-ssl-pinning:
   https://github.com/MaxToyberman/react-native-ssl-pinning

5. Configurar pinning en native code (iOS y Android)

IMPORTANTE:
- Siempre tener 2-3 pins (actual + backups)
- Actualizar pins antes de que expire el certificado
- No commitear pins a repositorios públicos
- Usar variables de entorno para pins en CI/CD
`;
  }

  /**
   * Logging de evento de seguridad
   */
  static logSecurityEvent(
    event: 'validation_success' | 'validation_failure' | 'pinning_bypassed',
    hostname: string,
    details?: Record<string, unknown>
  ): void {
    const logEntry = {
      event,
      hostname,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      enabled: this.enabled,
      ...details,
    };

    if (event === 'validation_failure') {
      console.error('[SSLPinning] Security event:', logEntry);
    } else {
      console.log('[SSLPinning] Security event:', logEntry);
    }

    // TODO: Enviar a backend para análisis de seguridad
  }
}

/**
 * IMPLEMENTACIÓN NATIVA RECOMENDADA (iOS y Android)
 *
 * Para implementación completa de SSL pinning, necesitas:
 *
 * iOS (AppDelegate.m):
 * ```objective-c
 * #import <TrustKit/TrustKit.h>
 *
 * - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
 *   NSDictionary *trustKitConfig = @{
 *     kTSKSwizzleNetworkDelegates: @YES,
 *     kTSKPinnedDomains: @{
 *       @"yourdomain.com": @{
 *         kTSKPublicKeyHashes: @[
 *           @"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
 *           @"BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB="
 *         ]
 *       }
 *     }
 *   };
 *   [TrustKit initSharedInstanceWithConfiguration:trustKitConfig];
 * }
 * ```
 *
 * Android (NetworkSecurityConfig.xml):
 * ```xml
 * <network-security-config>
 *   <domain-config>
 *     <domain includeSubdomains="true">yourdomain.com</domain>
 *     <pin-set>
 *       <pin digest="SHA-256">AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=</pin>
 *       <pin digest="SHA-256">BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=</pin>
 *     </pin-set>
 *   </domain-config>
 * </network-security-config>
 * ```
 */
