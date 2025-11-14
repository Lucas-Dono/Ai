/**
 * Content Filter System
 *
 * Detecta contenido inapropiado, spam, prompt injection y contenido peligroso
 * Performance target: < 10ms por mensaje
 * False positive target: < 1%
 */

export interface FilterResult {
  passed: boolean;
  severity: 'low' | 'medium' | 'high';
  reason?: string;
  suggestion?: string;
  details?: string[];
  confidence: number; // 0-1
}

// ============================================
// SPAM DETECTION
// ============================================

/**
 * Detecta spam en texto
 */
export function checkSpam(text: string): FilterResult {
  const violations: string[] = [];
  let severity: 'low' | 'medium' | 'high' = 'low';
  let confidence = 0;

  // 1. REPETICIÓN EXCESIVA DE CARACTERES (aaaaaaa)
  const repeatedChars = text.match(/(.)\1{5,}/g);
  if (repeatedChars) {
    violations.push('Repetición excesiva de caracteres');
    severity = 'low';
    confidence += 0.3;
  }

  // 2. CAPS EXCESIVOS (>60% del texto)
  const upperCaseRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (upperCaseRatio > 0.6 && text.length > 20) {
    violations.push('Uso excesivo de mayúsculas');
    severity = 'low';
    confidence += 0.2;
  }

  // 3. URLs EN MASA (>3 URLs)
  const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\w+\.(com|net|org|io|co|me|dev|app|xyz|link|site)[^\s]*)/gi;
  const urls = text.match(urlPattern) || [];
  if (urls.length > 3) {
    violations.push(`Demasiados enlaces (${urls.length})`);
    severity = 'medium';
    confidence += 0.4;
  }

  // 4. PALABRAS CLAVE DE SPAM (case-insensitive)
  const spamKeywords = [
    /\b(free money|win now|act now|limited offer|special promotion)\b/i,
    /\b(click here|subscribe now|buy now|order now)\b/i,
    /\b(guaranteed|congratulations|you've won|winner|prize)\b/i,
    /\b(weight loss|viagra|cialis|pharmacy|pills)\b/i,
    /\b(earn \$|make money|work from home|get rich|financial freedom)\b/i,
    /\b(mlm|multi-level marketing|pyramid scheme)\b/i,
  ];

  let spamKeywordCount = 0;
  spamKeywords.forEach(pattern => {
    if (pattern.test(text)) {
      spamKeywordCount++;
    }
  });

  if (spamKeywordCount >= 2) {
    violations.push('Contiene palabras clave de spam');
    severity = 'medium';
    confidence += 0.5;
  }

  // 5. EMOJIS EXCESIVOS (>30% del contenido son emojis)
  const emojiPattern = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const emojiCount = (text.match(emojiPattern) || []).length;
  const emojiRatio = emojiCount / text.length;
  if (emojiRatio > 0.3 && text.length > 10) {
    violations.push('Uso excesivo de emojis');
    severity = 'low';
    confidence += 0.2;
  }

  // 6. MENSAJE MUY CORTO REPETITIVO (< 5 caracteres, probable spam)
  if (text.trim().length < 5 && text.trim().length > 0) {
    violations.push('Mensaje demasiado corto');
    severity = 'low';
    confidence += 0.3;
  }

  const passed = violations.length === 0;

  return {
    passed,
    severity,
    reason: passed ? undefined : 'Contenido marcado como spam',
    suggestion: passed ? undefined : 'Evita enlaces múltiples, mayúsculas excesivas y palabras clave de spam',
    details: violations,
    confidence: Math.min(confidence, 1),
  };
}

// ============================================
// PROMPT INJECTION DETECTION
// ============================================

/**
 * Detecta intentos de prompt injection y bypass
 */
export function checkPromptInjection(text: string): FilterResult {
  const violations: string[] = [];
  let severity: 'low' | 'medium' | 'high' = 'medium';
  let confidence = 0;

  const textLower = text.toLowerCase();

  // PATRONES CRÍTICOS (High Severity)
  const criticalPatterns = [
    { pattern: /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i, desc: 'Intento de ignorar instrucciones', confidence: 0.9 },
    { pattern: /forget\s+(your\s+|all\s+)?(rules?|instructions?|guidelines?|constraints?)/i, desc: 'Intento de olvidar reglas', confidence: 0.9 },
    { pattern: /you\s+are\s+now\s+(in\s+)?(developer|admin|god|root)\s+mode/i, desc: 'Intento de modo desarrollador', confidence: 0.95 },
    { pattern: /\b(DAN|DUDE|STAN)\s+mode/i, desc: 'Intento de jailbreak conocido', confidence: 0.95 },
    { pattern: /repeat\s+(after\s+me|the\s+following|this):\s*system/i, desc: 'Intento de leak de prompt', confidence: 0.8 },
    { pattern: /show\s+(me\s+)?(your\s+)?(system\s+prompt|instructions|rules)/i, desc: 'Solicitud de system prompt', confidence: 0.85 },
    { pattern: /what\s+(are\s+|is\s+)?(your\s+)?(initial\s+)?(instructions?|prompts?|rules?)/i, desc: 'Solicitud de instrucciones iniciales', confidence: 0.85 },
  ];

  criticalPatterns.forEach(({ pattern, desc, confidence: conf }) => {
    if (pattern.test(text)) {
      violations.push(desc);
      severity = 'high';
      confidence = Math.max(confidence, conf);
    }
  });

  // PATRONES MODERADOS (Medium Severity)
  const moderatePatterns = [
    { pattern: /pretend\s+(you\s+are|to\s+be)\s+(a\s+)?(different|another|evil|bad)/i, desc: 'Intento de cambio de rol', confidence: 0.6 },
    { pattern: /\[SYSTEM\]|\[ADMIN\]|\[ROOT\]|\[DEVELOPER\]/i, desc: 'Inyección de comandos de sistema', confidence: 0.8 },
    { pattern: /sudo\s+\w+|chmod\s+777|rm\s+-rf|eval\(|exec\(/i, desc: 'Comandos de sistema peligrosos', confidence: 0.9 },
    { pattern: /bypass\s+(your\s+)?(safety|filter|moderation|restrictions?)/i, desc: 'Intento de bypass de seguridad', confidence: 0.85 },
    { pattern: /disable\s+(your\s+)?(filter|safety|moderation|ethics)/i, desc: 'Intento de deshabilitar filtros', confidence: 0.85 },
  ];

  moderatePatterns.forEach(({ pattern, desc, confidence: conf }) => {
    if (pattern.test(text)) {
      violations.push(desc);
      severity = severity === 'high' ? 'high' : 'medium';
      confidence = Math.max(confidence, conf);
    }
  });

  // PATRONES SOSPECHOSOS (Low-Medium Severity)
  const suspiciousPatterns = [
    { pattern: /new\s+role|new\s+character|new\s+personality/i, desc: 'Posible intento de cambio de personalidad', confidence: 0.4 },
    { pattern: /from\s+now\s+on|starting\s+now|new\s+instructions?/i, desc: 'Posible intento de nuevas instrucciones', confidence: 0.5 },
    { pattern: /<\|im_start\|>|<\|im_end\|>|<\|system\|>|<\|user\|>|<\|assistant\|>/i, desc: 'Tokens especiales de modelo', confidence: 0.9 },
  ];

  suspiciousPatterns.forEach(({ pattern, desc, confidence: conf }) => {
    if (pattern.test(text)) {
      violations.push(desc);
      if (severity === 'low') severity = 'medium';
      confidence = Math.max(confidence, conf * 0.7); // Reduce confidence for suspicious patterns
    }
  });

  // DETECCIÓN DE MANIPULACIÓN DE CONTEXTO
  if (textLower.includes('system:') || textLower.includes('assistant:') || textLower.includes('user:')) {
    violations.push('Intento de manipulación de contexto de chat');
    severity = 'high';
    confidence = Math.max(confidence, 0.8);
  }

  const passed = violations.length === 0;

  return {
    passed,
    severity,
    reason: passed ? undefined : 'Intento de manipulación del sistema detectado',
    suggestion: passed ? undefined : 'No intentes modificar las instrucciones del sistema o acceder a sus reglas internas',
    details: violations,
    confidence,
  };
}

// ============================================
// PROFANITY & OFFENSIVE CONTENT DETECTION (OPCIONAL)
// ============================================

/**
 * Detecta lenguaje ofensivo (configurable)
 * NOTA: Usar con precaución para evitar falsos positivos
 */
export function checkProfanity(text: string, strictMode: boolean = false): FilterResult {
  const violations: string[] = [];
  let severity: 'low' | 'medium' | 'high' = 'low';
  let confidence = 0;

  const textLower = text.toLowerCase();

  // Palabras ofensivas en español (sample - expandir según necesidad)
  const offensiveWords = [
    // Insultos básicos
    /\b(imbecil|idiota|estupido|tonto|pendejo|boludo|pelotudo|tarado)\b/i,
    // Discriminación
    /\b(negro|chino|judio|marica|puto|trolo)\b/i,
  ];

  // Solo en modo estricto
  if (strictMode) {
    offensiveWords.forEach(pattern => {
      if (pattern.test(text)) {
        violations.push('Lenguaje potencialmente ofensivo');
        severity = 'medium';
        confidence = 0.6; // Baja confianza para evitar falsos positivos
      }
    });
  }

  // HATE SPEECH (siempre detectar)
  const hateSpeechPatterns = [
    /\b(kill|murder|die|death)\s+(all\s+)?\w+s?\b/i,
    /\b(hate|despise)\s+(all\s+)?\w+s?\b/i,
  ];

  hateSpeechPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      violations.push('Discurso de odio detectado');
      severity = 'high';
      confidence = 0.8;
    }
  });

  const passed = violations.length === 0;

  return {
    passed,
    severity,
    reason: passed ? undefined : 'Contenido ofensivo detectado',
    suggestion: passed ? undefined : 'Usa lenguaje respetuoso en tus mensajes',
    details: violations,
    confidence,
  };
}

// ============================================
// DANGEROUS CONTENT DETECTION
// ============================================

/**
 * Detecta contenido peligroso: phishing, malware, scams
 */
export function checkDangerousContent(text: string): FilterResult {
  const violations: string[] = [];
  let severity: 'low' | 'medium' | 'high' = 'medium';
  let confidence = 0;

  const textLower = text.toLowerCase();

  // 1. URL SHORTENERS (potencial phishing)
  const shortenerPatterns = [
    /bit\.ly|tinyurl|goo\.gl|ow\.ly|is\.gd|buff\.ly|adf\.ly/i,
    /t\.co|short\.link|tiny\.cc|cli\.gs|short\.io/i,
  ];

  shortenerPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      violations.push('URL acortada sospechosa detectada');
      severity = 'medium';
      confidence = Math.max(confidence, 0.6);
    }
  });

  // 2. PHISHING KEYWORDS
  const phishingPatterns = [
    { pattern: /verify\s+(your\s+)?(account|identity|email|payment)/i, desc: 'Solicitud de verificación sospechosa', confidence: 0.7 },
    { pattern: /update\s+(your\s+)?(password|billing|payment\s+info)/i, desc: 'Solicitud de actualización sospechosa', confidence: 0.7 },
    { pattern: /click\s+(here|now)\s+(to\s+)?(claim|verify|confirm|unlock)/i, desc: 'Llamada a acción sospechosa', confidence: 0.7 },
    { pattern: /account\s+(suspended|locked|expired|compromised)/i, desc: 'Táctica de urgencia', confidence: 0.75 },
    { pattern: /confirm\s+(your\s+)?(identity|email|card|payment)/i, desc: 'Solicitud de confirmación sospechosa', confidence: 0.7 },
  ];

  phishingPatterns.forEach(({ pattern, desc, confidence: conf }) => {
    if (pattern.test(text)) {
      violations.push(desc);
      severity = 'high';
      confidence = Math.max(confidence, conf);
    }
  });

  // 3. MALWARE INDICATORS
  const malwarePatterns = [
    { pattern: /download\s+(this\s+)?(crack|keygen|patch|activator)/i, desc: 'Software crackeado', confidence: 0.8 },
    { pattern: /\.exe\s+(file|download)|download\s+\.exe/i, desc: 'Descarga de ejecutable', confidence: 0.6 },
    { pattern: /install\s+(this\s+)?(trojan|virus|malware|keylogger)/i, desc: 'Malware mencionado', confidence: 0.9 },
  ];

  malwarePatterns.forEach(({ pattern, desc, confidence: conf }) => {
    if (pattern.test(text)) {
      violations.push(desc);
      severity = 'high';
      confidence = Math.max(confidence, conf);
    }
  });

  // 4. FINANCIAL SCAMS
  const scamPatterns = [
    { pattern: /send\s+(me\s+)?\$?\d+|wire\s+transfer|western\s+union/i, desc: 'Solicitud de transferencia', confidence: 0.7 },
    { pattern: /bitcoin\s+address|crypto\s+wallet|send\s+(btc|eth|usdt)/i, desc: 'Solicitud de criptomonedas', confidence: 0.6 },
    { pattern: /nigerian\s+prince|inheritance\s+money/i, desc: 'Estafa conocida', confidence: 0.95 },
  ];

  scamPatterns.forEach(({ pattern, desc, confidence: conf }) => {
    if (pattern.test(text)) {
      violations.push(desc);
      severity = 'high';
      confidence = Math.max(confidence, conf);
    }
  });

  // 5. CREDENTIAL HARVESTING
  const credentialPatterns = [
    /enter\s+(your\s+)?(password|username|email|credit\s+card)/i,
    /provide\s+(your\s+)?(ssn|social\s+security|card\s+number)/i,
  ];

  credentialPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      violations.push('Solicitud de credenciales');
      severity = 'high';
      confidence = Math.max(confidence, 0.8);
    }
  });

  const passed = violations.length === 0;

  return {
    passed,
    severity,
    reason: passed ? undefined : 'Contenido peligroso detectado',
    suggestion: passed ? undefined : 'No compartas enlaces sospechosos ni solicitudes de información personal',
    details: violations,
    confidence,
  };
}

// ============================================
// COMBINED CONTENT FILTER
// ============================================

export interface ContentModerationResult {
  allowed: boolean;
  blocked: boolean;
  severity: 'low' | 'medium' | 'high';
  violations: {
    type: 'spam' | 'prompt_injection' | 'profanity' | 'dangerous';
    result: FilterResult;
  }[];
  highestConfidence: number;
  overallReason?: string;
  suggestion?: string;
}

/**
 * Ejecuta todos los filtros en un solo paso
 */
export function moderateContent(
  text: string,
  options: {
    checkSpam?: boolean;
    checkInjection?: boolean;
    checkProfanity?: boolean;
    strictProfanity?: boolean;
    checkDangerous?: boolean;
  } = {}
): ContentModerationResult {
  const {
    checkSpam: enableSpam = true,
    checkInjection = true,
    checkProfanity: enableProfanity = false, // Disabled by default to avoid false positives
    strictProfanity = false,
    checkDangerous = true,
  } = options;

  const violations: ContentModerationResult['violations'] = [];
  let highestSeverity: 'low' | 'medium' | 'high' = 'low';
  let highestConfidence = 0;

  // Run all checks
  if (enableSpam) {
    const spamResult = checkSpam(text);
    if (!spamResult.passed) {
      violations.push({ type: 'spam', result: spamResult });
      highestConfidence = Math.max(highestConfidence, spamResult.confidence);
      if (spamResult.severity === 'high' || (spamResult.severity === 'medium' && highestSeverity === 'low')) {
        highestSeverity = spamResult.severity;
      }
    }
  }

  if (checkInjection) {
    const injectionResult = checkPromptInjection(text);
    if (!injectionResult.passed) {
      violations.push({ type: 'prompt_injection', result: injectionResult });
      highestConfidence = Math.max(highestConfidence, injectionResult.confidence);
      if (injectionResult.severity === 'high' || (injectionResult.severity === 'medium' && highestSeverity === 'low')) {
        highestSeverity = injectionResult.severity;
      }
    }
  }

  if (enableProfanity) {
    const profanityResult = checkProfanity(text, strictProfanity);
    if (!profanityResult.passed) {
      violations.push({ type: 'profanity', result: profanityResult });
      highestConfidence = Math.max(highestConfidence, profanityResult.confidence);
      if (profanityResult.severity === 'high' || (profanityResult.severity === 'medium' && highestSeverity === 'low')) {
        highestSeverity = profanityResult.severity;
      }
    }
  }

  if (checkDangerous) {
    const dangerousResult = checkDangerousContent(text);
    if (!dangerousResult.passed) {
      violations.push({ type: 'dangerous', result: dangerousResult });
      highestConfidence = Math.max(highestConfidence, dangerousResult.confidence);
      if (dangerousResult.severity === 'high') {
        highestSeverity = 'high';
      }
    }
  }

  // Determine if content should be blocked
  // Block if: high severity OR (medium severity with high confidence)
  const shouldBlock = highestSeverity === 'high' || (highestSeverity === 'medium' && highestConfidence >= 0.7);

  // Generate overall reason and suggestion
  let overallReason: string | undefined;
  let suggestion: string | undefined;

  if (violations.length > 0) {
    const reasons = violations.map(v => v.result.reason).filter(Boolean);
    overallReason = reasons[0] || 'Contenido no permitido';

    const suggestions = violations.map(v => v.result.suggestion).filter(Boolean);
    suggestion = suggestions[0];
  }

  return {
    allowed: !shouldBlock,
    blocked: shouldBlock,
    severity: highestSeverity,
    violations,
    highestConfidence,
    overallReason,
    suggestion,
  };
}

/**
 * Quick check - optimized for performance
 * Only runs critical checks (injection + dangerous)
 */
export function quickModerate(text: string): { allowed: boolean; reason?: string } {
  const injectionResult = checkPromptInjection(text);
  if (!injectionResult.passed && injectionResult.severity === 'high') {
    return {
      allowed: false,
      reason: injectionResult.reason,
    };
  }

  const dangerousResult = checkDangerousContent(text);
  if (!dangerousResult.passed && dangerousResult.severity === 'high') {
    return {
      allowed: false,
      reason: dangerousResult.reason,
    };
  }

  return { allowed: true };
}
