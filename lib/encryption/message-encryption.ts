/**
 * MESSAGE ENCRYPTION SERVICE
 *
 * Encripta y desencripta mensajes usando AES-256-GCM
 * - Autenticación integrada (GCM mode)
 * - IV único por mensaje (previene ataques de replay)
 * - Sin dependencias externas (usa crypto nativo de Node.js)
 *
 * IMPORTANTE: La clave MESSAGE_ENCRYPTION_KEY debe ser:
 * - 32 bytes (64 caracteres hex) para AES-256
 * - Almacenada de forma segura en .env
 * - Rotada cada 6 meses
 * - NUNCA commiteada a Git
 */

import crypto from 'crypto';

// Configuración
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Obtener clave de encriptación desde variables de entorno
 */
function getEncryptionKey(): Buffer {
  const key = process.env.MESSAGE_ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      'MESSAGE_ENCRYPTION_KEY no está configurada en .env. ' +
      'Genera una clave con: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }

  if (key.length !== 64) {
    throw new Error(
      `MESSAGE_ENCRYPTION_KEY debe tener 64 caracteres hex (32 bytes), tiene ${key.length}`
    );
  }

  return Buffer.from(key, 'hex');
}

/**
 * Resultado de la encriptación
 */
export interface EncryptionResult {
  encrypted: string;   // Contenido encriptado en hex
  iv: string;          // Initialization Vector en hex
  authTag: string;     // Authentication Tag en hex
}

/**
 * Encriptar mensaje
 *
 * @param plaintext - Texto plano a encriptar
 * @returns Objeto con contenido encriptado, IV y authTag
 *
 * @example
 * const { encrypted, iv, authTag } = encryptMessage('Hola mundo');
 * // Guardar los 3 valores en la base de datos
 */
export function encryptMessage(plaintext: string): EncryptionResult {
  try {
    // Generar IV aleatorio único para este mensaje
    const iv = crypto.randomBytes(IV_LENGTH);

    // Crear cipher
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

    // Encriptar
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Obtener authentication tag (GCM mode)
    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  } catch (error) {
    console.error('[ENCRYPTION] Error encriptando mensaje:', error);
    // Re-throw el error original si viene de getEncryptionKey() para preservar el mensaje específico
    if (error instanceof Error && (error.message.includes('MESSAGE_ENCRYPTION_KEY') || error.message.includes('debe tener'))) {
      throw error;
    }
    throw new Error('Error al encriptar mensaje');
  }
}

/**
 * Desencriptar mensaje
 *
 * @param encrypted - Contenido encriptado en hex
 * @param iv - Initialization Vector en hex
 * @param authTag - Authentication Tag en hex
 * @returns Texto plano desencriptado
 *
 * @example
 * const plaintext = decryptMessage(encrypted, iv, authTag);
 */
export function decryptMessage(
  encrypted: string,
  iv: string,
  authTag: string
): string {
  try {
    // Crear decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      getEncryptionKey(),
      Buffer.from(iv, 'hex')
    );

    // Configurar authentication tag
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    // Desencriptar
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('[ENCRYPTION] Error desencriptando mensaje:', error);

    // Si falla la autenticación, el mensaje fue modificado
    if (error instanceof Error && error.message.includes('Unsupported state')) {
      throw new Error('Mensaje corrupto o modificado (fallo de autenticación)');
    }

    throw new Error('Error al desencriptar mensaje');
  }
}

/**
 * Verificar si un mensaje está encriptado
 * (Tiene los campos iv y authTag)
 */
export function isMessageEncrypted(message: {
  content: string;
  iv?: string | null;
  authTag?: string | null;
}): boolean {
  return !!(message.iv && message.authTag);
}

/**
 * Encriptar mensaje solo si no está ya encriptado
 * Útil para migración gradual
 */
export function encryptMessageIfNeeded(
  content: string,
  iv?: string | null,
  authTag?: string | null
): EncryptionResult {
  // Si ya tiene iv y authTag, ya está encriptado
  if (iv && authTag) {
    return {
      encrypted: content,
      iv,
      authTag,
    };
  }

  // Si no, encriptar
  return encryptMessage(content);
}

/**
 * Desencriptar mensaje solo si está encriptado
 * Útil para migración gradual (soporta mensajes legacy sin encriptar)
 */
export function decryptMessageIfNeeded(
  content: string,
  iv?: string | null,
  authTag?: string | null
): string {
  // Si tiene iv y authTag, está encriptado -> desencriptar
  if (iv && authTag) {
    return decryptMessage(content, iv, authTag);
  }

  // Si no, es texto plano (legacy)
  return content;
}

/**
 * Generar nueva clave de encriptación
 * Solo para rotación de claves
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Re-encriptar mensaje con nueva clave
 * Útil para rotación de claves
 */
export function reEncryptMessage(
  oldEncrypted: string,
  oldIv: string,
  oldAuthTag: string,
  newKey: string
): EncryptionResult {
  // Desencriptar con clave antigua
  const plaintext = decryptMessage(oldEncrypted, oldIv, oldAuthTag);

  // Temporalmente cambiar la clave
  const originalKey = process.env.MESSAGE_ENCRYPTION_KEY;
  process.env.MESSAGE_ENCRYPTION_KEY = newKey;

  try {
    // Encriptar con clave nueva
    const result = encryptMessage(plaintext);
    return result;
  } finally {
    // Restaurar clave original
    process.env.MESSAGE_ENCRYPTION_KEY = originalKey;
  }
}
