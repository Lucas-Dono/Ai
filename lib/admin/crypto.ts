/**
 * Utilidades de Cifrado para Sistema Admin
 * Cifra secretos TOTP y otros datos sensibles
 */

import crypto from 'crypto';

// Algoritmo de cifrado (AES-256-GCM - más seguro que AES-256-CBC)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // Para AES, el IV es de 16 bytes
const AUTH_TAG_LENGTH = 16; // Tag de autenticación GCM
const SALT_LENGTH = 64; // Salt para derivación de clave

/**
 * Obtiene la clave maestra desde variables de entorno
 * IMPORTANTE: Esta clave debe estar en .env y NUNCA en el código
 */
function getMasterKey(): string {
  const key = process.env.ADMIN_MASTER_KEY;

  if (!key) {
    throw new Error(
      'ADMIN_MASTER_KEY no está configurada. ' +
      'Genera una con: openssl rand -hex 32'
    );
  }

  if (key.length < 64) {
    throw new Error(
      'ADMIN_MASTER_KEY debe tener al menos 64 caracteres (32 bytes hex). ' +
      'Genera una nueva con: openssl rand -hex 32'
    );
  }

  return key;
}

/**
 * Deriva una clave de cifrado desde la clave maestra usando PBKDF2
 * Esto agrega una capa extra de seguridad
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    masterKey,
    salt,
    100000, // 100,000 iteraciones (recomendado por OWASP)
    32, // 32 bytes = 256 bits
    'sha512'
  );
}

/**
 * Cifra un string usando AES-256-GCM
 *
 * @param text - Texto plano a cifrar
 * @returns String cifrado en formato: salt:iv:authTag:encrypted (todo en base64)
 */
export function encrypt(text: string): string {
  try {
    const masterKey = getMasterKey();

    // 1. Generar salt aleatorio
    const salt = crypto.randomBytes(SALT_LENGTH);

    // 2. Derivar clave de cifrado
    const key = deriveKey(masterKey, salt);

    // 3. Generar IV aleatorio
    const iv = crypto.randomBytes(IV_LENGTH);

    // 4. Crear cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // 5. Cifrar
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // 6. Obtener authentication tag (GCM mode)
    const authTag = cipher.getAuthTag();

    // 7. Retornar todo junto separado por ':'
    // Formato: salt:iv:authTag:encrypted
    return [
      salt.toString('base64'),
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted
    ].join(':');

  } catch (error) {
    console.error('Error cifrando:', error);
    throw new Error('Error al cifrar datos sensibles');
  }
}

/**
 * Descifra un string cifrado con encrypt()
 *
 * @param encryptedText - String cifrado en formato: salt:iv:authTag:encrypted
 * @returns Texto plano descifrado
 */
export function decrypt(encryptedText: string): string {
  try {
    const masterKey = getMasterKey();

    // 1. Separar componentes
    const parts = encryptedText.split(':');
    if (parts.length !== 4) {
      throw new Error('Formato de datos cifrados inválido');
    }

    const [saltB64, ivB64, authTagB64, encrypted] = parts;

    // 2. Convertir de base64 a Buffer
    const salt = Buffer.from(saltB64, 'base64');
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');

    // 3. Derivar la misma clave de cifrado
    const key = deriveKey(masterKey, salt);

    // 4. Crear decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // 5. Descifrar
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;

  } catch (error) {
    console.error('Error descifrando:', error);
    throw new Error('Error al descifrar datos sensibles');
  }
}

/**
 * Genera un hash seguro de un string usando SHA-256
 * Útil para fingerprints de certificados
 */
export function hash(text: string): string {
  return crypto
    .createHash('sha256')
    .update(text)
    .digest('hex');
}

/**
 * Genera bytes aleatorios criptográficamente seguros
 * Útil para generar tokens, serials, etc.
 */
export function randomBytes(length: number): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Compara dos strings de forma segura contra timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  return crypto.timingSafeEqual(bufferA, bufferB);
}

/**
 * Genera una clave maestra nueva
 * Ejecutar: node -e "console.log(require('./lib/admin/crypto').generateMasterKey())"
 */
export function generateMasterKey(): string {
  return crypto.randomBytes(32).toString('hex');
}
