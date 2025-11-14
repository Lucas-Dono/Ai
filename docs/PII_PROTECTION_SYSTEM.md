# PII PROTECTION SYSTEM

**Task**: 0.4 - PII Detection
**Status**: ✅ Implemented
**Compliance**: GDPR, CCPA, COPPA

## 📋 Table of Contents

1. [Overview](#overview)
2. [What is PII?](#what-is-pii)
3. [System Architecture](#system-architecture)
4. [Detection Patterns](#detection-patterns)
5. [Implementation Guide](#implementation-guide)
6. [Integration Examples](#integration-examples)
7. [Privacy Best Practices](#privacy-best-practices)
8. [Testing](#testing)
9. [Compliance](#compliance)
10. [FAQ](#faq)

---

## Overview

The PII Protection System automatically detects and sanitizes **Personally Identifiable Information (PII)** from user messages and AI responses to protect privacy and comply with regulations.

### Key Features

✅ **Automatic Detection**: Detects 11+ types of PII using regex patterns + validation
✅ **Smart Sanitization**: Redacts PII while preserving message context
✅ **Context-Aware**: Different rules for chat vs. profiles vs. stories
✅ **Severity Levels**: Critical, High, Medium, Low classification
✅ **Audit Logging**: Tracks all PII detections for compliance
✅ **User Warnings**: Alerts users when PII is detected and redacted
✅ **Format Preservation**: Option to show last 4 digits of SSN/cards

### Privacy Principle

**"Privacy by Default"** - We assume users don't intend to share sensitive information in chats and automatically protect them by redacting PII.

---

## What is PII?

**Personally Identifiable Information (PII)** is any data that could identify a specific individual.

### Critical PII (Severity: Critical)

**Financial**
- Social Security Number (SSN): `123-45-6789`
- Credit Card Numbers: `4532015112830366`
- Bank Account Numbers: `123456789012`
- Routing Numbers

**Government IDs**
- Passport Numbers: `A12345678`
- Medical Record Numbers: `MRN: 12345678`

### High PII (Severity: High)

**Contact**
- Phone Numbers: `(555) 123-4567`
- Physical Addresses: `123 Main Street Apt 5B`

**Personal**
- Date of Birth: `01/15/1990`
- Driver's License Numbers

### Medium PII (Severity: Medium)

**Digital**
- Email Addresses: `user@example.com`
- IP Addresses: `192.0.2.1`

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  USER MESSAGE                        │
│          "My SSN is 123-45-6789"                    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              PII SANITIZER                           │
│  lib/pii/sanitizer.ts                               │
│                                                      │
│  1. Pattern Matching (Regex)                        │
│  2. Validation (Luhn, format checks)                │
│  3. False Positive Filtering                        │
│  4. Context-Aware Processing                        │
│  5. Redaction                                        │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              SANITIZED OUTPUT                        │
│     "My [SSN REDACTED] for verification"            │
│                                                      │
│     + Warning: "⚠️ ALERTA: Detectamos              │
│       información personal sensible..."             │
└─────────────────────────────────────────────────────┘
```

### Components

1. **Detection Patterns** (`lib/pii/detection-patterns.ts`)
   - Regex patterns for each PII type
   - Validators (Luhn algorithm, format checks)
   - False positive filters
   - Context definitions

2. **Sanitizer Service** (`lib/pii/sanitizer.ts`)
   - Main sanitization logic
   - Context-aware processing
   - Logging and audit
   - Warning generation

3. **Tests** (`lib/pii/__tests__/sanitizer.test.ts`)
   - 100+ test cases
   - Real-world scenarios
   - Edge cases and false positives

---

## Detection Patterns

### Social Security Number (SSN)

**Pattern**: `XXX-XX-XXXX` or `XXXXXXXXX`

**Regex**: `/\b(?!000|666|9\d{2})\d{3}-?(?!00)\d{2}-?(?!0000)\d{4}\b/g`

**Validation**:
- ✅ Length: 9 digits
- ✅ NOT starting with 000, 666, or 900-999
- ✅ NOT all zeros
- ❌ False positives: 111-11-1111, 123-45-6789 (example)

**Examples**:
```typescript
"My SSN is 123-45-6789"       → "My [SSN REDACTED]"
"SSN: 123456789"              → "SSN: [SSN REDACTED]"
"SSN: 000-12-3456" (invalid)  → No change (invalid prefix)
```

---

### Credit Card Numbers

**Pattern**: Visa, MasterCard, Amex, Discover

**Regex**: `/\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g`

**Validation**: Luhn algorithm check

**Examples**:
```typescript
"Card: 4532015112830366"      → "Card: [CREDIT CARD REDACTED]"
"Visa: 5425233430109903"      → "Visa: [CREDIT CARD REDACTED]"

// With format preservation
"Card: 4532015112830366"      → "Card: **** **** **** 0366"
```

**Luhn Algorithm**:
```typescript
// Validates credit card checksum
function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}
```

---

### Phone Numbers

**Pattern**: US and International formats

**Regex**: `/\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g`

**Examples**:
```typescript
"Call me at (555) 123-4567"   → "Call me at [PHONE REDACTED]"
"Phone: 555-123-4567"         → "Phone: [PHONE REDACTED]"
"+1 555 123 4567"             → "[PHONE REDACTED]"
"+44 20 1234 5678"            → "[PHONE REDACTED]"

// With format preservation
"(555) 123-4567"              → "(555) XXX-XXXX"
```

---

### Email Addresses

**Pattern**: Standard email format

**Regex**: `/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g`

**Context-Aware**: Only flagged in chat messages, NOT in user profiles

**Examples**:
```typescript
// In CHAT context
"Email me at user@example.com" → "Email me at [EMAIL REDACTED]"

// In PROFILE context (allowed)
"Email: user@example.com"      → No change
```

---

### Physical Addresses

**Pattern**: US street addresses

**Regex**: `/\b\d{1,5}\s+(?:[A-Z][a-z]+\s+){1,3}(?:Street|St|Avenue|Ave|...)\b/gi`

**Examples**:
```typescript
"I live at 123 Main Street"           → "I live at [ADDRESS REDACTED]"
"Address: 456 Oak Avenue Apt 2B"      → "Address: [ADDRESS REDACTED]"
"789 Elm Road Suite 100"              → "[ADDRESS REDACTED]"
```

---

### IP Addresses

**Pattern**: IPv4 and IPv6

**Regex**: IPv4: `/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g`

**Validation**: Excludes localhost and private IPs

**Examples**:
```typescript
"Server: 192.0.2.1"           → "Server: [IP REDACTED]"
"Local: 127.0.0.1"            → No change (localhost excluded)
"Internal: 10.0.0.1"          → No change (private IP)
```

---

### Date of Birth

**Pattern**: Multiple formats

**Regex**: `/\b(?:0?[1-9]|1[0-2])[\/\-](?:0?[1-9]|[12][0-9]|3[01])[\/\-](?:19|20)\d{2}\b/g`

**Context-Aware**: Allowed in stories, blocked in chat

**Examples**:
```typescript
// In CHAT context
"Born on 01/15/1990"          → "Born on [DOB REDACTED]"

// In STORY context (allowed)
"The character was born 01/15/1990" → No change
```

---

## Implementation Guide

### Basic Usage

```typescript
import { piiSanitizer, PII_CONTEXTS } from "@/lib/pii/sanitizer";

// Sanitize user message
const userMessage = "My SSN is 123-45-6789";
const result = await piiSanitizer.sanitize(userMessage, {
  context: PII_CONTEXTS.CHAT_MESSAGE
});

if (result.containsPII) {
  console.warn("PII detected:", result.detections);

  // Use sanitized version
  console.log("Sanitized:", result.sanitized);
  // → "My [SSN REDACTED]"

  // Show warning to user
  console.log("Warning:", result.summary);
}
```

### Context-Aware Sanitization

```typescript
import { PII_CONTEXTS } from "@/lib/pii/detection-patterns";

// Different contexts
const chatContext = PII_CONTEXTS.CHAT_MESSAGE;
// Blocks: emails, phones, addresses, SSN, cards, etc.

const profileContext = PII_CONTEXTS.USER_PROFILE;
// Allows: user's own email and phone

const storyContext = PII_CONTEXTS.STORY_CONTENT;
// Allows: dates in narrative (character birthdates)

const strictContext = PII_CONTEXTS.STRICT_COMPLIANCE;
// Blocks: everything, maximum privacy

// Use context
const result = await piiSanitizer.sanitize(text, {
  context: chatContext
});
```

### Format Preservation

```typescript
// Show last 4 digits of sensitive data
const result = await piiSanitizer.sanitize(
  "My SSN is 123-45-6789 and card 4532015112830366",
  {
    preserveFormat: true
  }
);

console.log(result.sanitized);
// → "My SSN is XXX-XX-6789 and card **** **** **** 0366"
```

### With User Warnings

```typescript
import { sanitizeWithAlert } from "@/lib/pii/sanitizer";

const { text, alert, hasPII } = await sanitizeWithAlert(
  "My SSN is 123-45-6789",
  PII_CONTEXTS.CHAT_MESSAGE
);

if (hasPII) {
  // Show alert to user
  console.log(alert);
  // → "⚠️ ALERTA: Detectamos información personal sensible (número de seguro social).
  //    Esta información ha sido redactada por tu seguridad..."
}
```

---

## Integration Examples

### API Route Integration

**File**: `app/api/agents/[id]/message/route.ts`

```typescript
import { piiSanitizer, PII_CONTEXTS } from "@/lib/pii/sanitizer";

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  // STEP 1: Sanitize user input before processing
  const inputResult = await piiSanitizer.sanitize(message, {
    context: PII_CONTEXTS.CHAT_MESSAGE,
    logDetections: true, // Log for compliance
  });

  if (inputResult.containsPII) {
    console.warn(`[PII] User input contained PII:`, inputResult.summary);

    // Use sanitized version for processing
    message = inputResult.sanitized;

    // Optionally warn user
    // return NextResponse.json({
    //   warning: "We detected and removed personal information from your message for your safety."
    // });
  }

  // STEP 2: Generate AI response
  const aiResponse = await generateResponse(message);

  // STEP 3: Sanitize AI output (in case AI leaked PII)
  const outputResult = await piiSanitizer.sanitize(aiResponse, {
    context: PII_CONTEXTS.CHAT_MESSAGE,
  });

  if (outputResult.containsPII) {
    console.error(`[PII CRITICAL] AI response contained PII!`, outputResult.summary);

    // Use sanitized AI response
    aiResponse = outputResult.sanitized;
  }

  return NextResponse.json({
    response: aiResponse,
    piiDetected: inputResult.containsPII || outputResult.containsPII,
  });
}
```

### Chat Component with PII Alerts

```typescript
"use client";

import { useState } from "react";
import { sanitizeWithAlert } from "@/lib/pii/sanitizer";
import { AlertTriangle } from "lucide-react";

export function ChatWithPIIProtection() {
  const [showPIIAlert, setShowPIIAlert] = useState(false);
  const [piiWarning, setPIIWarning] = useState("");

  const sendMessage = async (message: string) => {
    // Check for PII before sending
    const { text, alert, hasPII } = await sanitizeWithAlert(message);

    if (hasPII) {
      // Show warning to user
      setPIIWarning(alert || "");
      setShowPIIAlert(true);

      // Send sanitized message
      await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: text }),
      });
    } else {
      // Send original message
      await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message }),
      });
    }
  };

  return (
    <div>
      {/* PII Alert Banner */}
      {showPIIAlert && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-500">Información Personal Detectada</p>
              <p className="text-sm text-muted-foreground">{piiWarning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat UI */}
      {/* ... */}
    </div>
  );
}
```

### Backend Logging & Compliance

```typescript
import { piiSanitizer } from "@/lib/pii/sanitizer";

// Process messages
async function processMessages() {
  // ... process messages with PII detection

  // Export logs for compliance audit
  const complianceReport = piiSanitizer.exportLogs();

  console.log("PII Detection Report:");
  console.log("Total Detections:", complianceReport.totalDetections);
  console.log("By Severity:", complianceReport.bySeverity);
  console.log("By Type:", complianceReport.byType);

  // Sample output:
  // {
  //   timestamp: 2024-01-15T10:30:00.000Z,
  //   totalDetections: 47,
  //   bySeverity: { critical: 5, high: 15, medium: 27 },
  //   byType: { SSN: 5, PHONE: 15, EMAIL: 27 }
  // }

  // Save to database for compliance
  await prisma.piiAuditLog.create({
    data: {
      timestamp: complianceReport.timestamp,
      totalDetections: complianceReport.totalDetections,
      summary: complianceReport,
    },
  });
}
```

---

## Privacy Best Practices

### 1. Input Sanitization

**Always sanitize user input** before:
- Storing in database
- Sending to AI models
- Displaying to other users
- Logging

```typescript
// ✅ GOOD
const sanitized = await sanitizeText(userInput);
await prisma.message.create({ content: sanitized });

// ❌ BAD
await prisma.message.create({ content: userInput }); // Stores PII!
```

### 2. Output Verification

**Always verify AI outputs** for accidental PII leakage:

```typescript
// ✅ GOOD
const aiResponse = await generateAIResponse(prompt);
const sanitized = await sanitizeText(aiResponse);
return sanitized;

// ❌ BAD
return await generateAIResponse(prompt); // May leak PII!
```

### 3. Context-Appropriate Detection

Use the right context:

```typescript
// ✅ GOOD - Different contexts
const chatResult = await sanitize(text, { context: PII_CONTEXTS.CHAT_MESSAGE });
const profileResult = await sanitize(text, { context: PII_CONTEXTS.USER_PROFILE });

// ❌ BAD - One-size-fits-all
const result = await sanitize(text); // Uses default, may be too strict/loose
```

### 4. User Education

Inform users about PII protection:

```typescript
if (result.containsPII) {
  return {
    message: "⚠️ Por tu seguridad, hemos eliminado información personal de tu mensaje. " +
             "Recuerda: NUNCA compartas SSN, números de tarjeta, o información bancaria en chats.",
    sanitized: result.sanitized,
  };
}
```

### 5. Compliance Logging

Maintain audit logs for compliance:

```typescript
if (result.detections.some(d => d.severity === "critical")) {
  await prisma.securityLog.create({
    data: {
      userId: user.id,
      event: "CRITICAL_PII_DETECTED",
      details: {
        types: result.detections.map(d => d.type),
        severity: "critical",
      },
    },
  });
}
```

---

## Testing

### Running Tests

```bash
# Run all PII tests
npm test lib/pii/__tests__/sanitizer.test.ts

# Run with coverage
npm test -- --coverage lib/pii
```

### Test Coverage

- ✅ 100+ test cases
- ✅ All PII types (SSN, credit cards, phone, email, etc.)
- ✅ Multiple formats and edge cases
- ✅ Context-aware detection
- ✅ False positive filtering
- ✅ Format preservation
- ✅ Real-world scenarios
- ✅ Validation algorithms (Luhn, etc.)

### Example Test Cases

```typescript
describe("PII Detection", () => {
  it("should detect and redact SSN", async () => {
    const text = "My SSN is 123-45-6789";
    const result = await sanitizer.sanitize(text);

    expect(result.containsPII).toBe(true);
    expect(result.sanitized).toContain("[SSN REDACTED]");
    expect(result.detections[0].severity).toBe("critical");
  });

  it("should NOT detect invalid SSN", async () => {
    const text = "SSN: 000-12-3456"; // Invalid prefix
    const result = await sanitizer.sanitize(text);

    expect(result.containsPII).toBe(false);
  });

  it("should validate credit cards with Luhn", async () => {
    const text = "Card: 4532015112830367"; // Wrong checksum
    const result = await sanitizer.sanitize(text);

    expect(result.containsPII).toBe(false); // Fails Luhn check
  });
});
```

---

## Compliance

### GDPR (General Data Protection Regulation)

**Article 5**: Data minimization - Only collect necessary data
**Article 17**: Right to erasure - Users can request deletion
**Article 32**: Security measures - Appropriate technical safeguards

**How we comply**:
- ✅ Automatic PII detection and redaction
- ✅ User can't accidentally share PII in chats
- ✅ Audit logs for data processing activities
- ✅ Data minimization by default

### CCPA (California Consumer Privacy Act)

**1798.100**: Right to know what data is collected
**1798.105**: Right to delete personal data
**1798.130**: Notice at collection

**How we comply**:
- ✅ Clear privacy notices
- ✅ PII detection prevents accidental collection
- ✅ Audit trail of PII detections
- ✅ User control over data

### COPPA (Children's Online Privacy Protection Act)

**§ 312.2**: Requires parental consent for collecting PII from children under 13

**How we comply**:
- ✅ Age verification (Task 0.1) prevents users under 13
- ✅ Extra PII protection for 13-17 year olds
- ✅ No collection of PII from minors

### Industry Best Practices

- ✅ **Privacy by Design**: Built-in from the start
- ✅ **Privacy by Default**: Most restrictive settings
- ✅ **Data Minimization**: Only collect what's needed
- ✅ **Purpose Limitation**: Use data only for stated purpose
- ✅ **Storage Limitation**: Don't keep data longer than needed

---

## FAQ

### Q: Why do we need PII detection in a chat app?

**A**: Users may accidentally share sensitive information (SSN, credit cards, addresses) in casual conversation. Auto-detection protects them from:
- Identity theft
- Financial fraud
- Privacy violations
- Compliance issues

### Q: Won't this annoy users by being too strict?

**A**: We use **context-aware detection**:
- In **chat messages**: Strict (block everything)
- In **user profiles**: Allow emails and phones (user's own)
- In **stories**: Allow dates and names (fictional characters)

### Q: What if the AI generates PII by accident?

**A**: We sanitize **both** user input AND AI output:
```typescript
// User input → Sanitize → AI processing → AI output → Sanitize → User
```

### Q: Can users override the PII detection?

**A**: No. PII protection is **mandatory** because:
1. Legal compliance (GDPR, CCPA)
2. User safety (prevent identity theft)
3. Platform liability (we could be sued for data leaks)

### Q: What about false positives?

**A**: We minimize false positives using:
- ✅ Validation algorithms (Luhn for credit cards)
- ✅ False positive filters (e.g., skip 111-11-1111)
- ✅ Context awareness (allow emails in profiles)
- ✅ Smart patterns (exclude localhost IPs)

### Q: How do I test PII detection?

**A**: Use **fake but valid** test data:
```typescript
// ✅ GOOD - Valid format but fake
const testSSN = "123-45-6789"; // Passes validation but is example SSN

// ❌ BAD - Use real PII
const realSSN = "MyActualSSN"; // NEVER use real data in tests!
```

### Q: What PII types are detected?

**A**: 11 types:
- Critical: SSN, credit cards, bank accounts, passports, medical records
- High: Phone, addresses, DOB, driver's licenses
- Medium: Email, IP addresses

### Q: Can I add custom PII patterns?

**A**: Yes! Add to `lib/pii/detection-patterns.ts`:
```typescript
export const CUSTOM_PATTERN: PIIPattern = {
  type: PIIType.CUSTOM,
  name: "Custom ID",
  regex: /your-regex-here/g,
  redactionTemplate: "[CUSTOM REDACTED]",
  severity: "high",
  examples: ["example"],
};
```

### Q: How do I handle PII in logs?

**A**: **NEVER** log full PII:
```typescript
// ✅ GOOD
console.log("PII detected:", {
  type: detection.type,
  severity: detection.severity,
  preview: match.substring(0, 3) + "***", // Only first 3 chars
});

// ❌ BAD
console.log("Found SSN:", fullSSN); // Leaks PII in logs!
```

### Q: What about international PII?

**A**: Currently supports:
- ✅ US: SSN, phone, addresses
- ✅ International: Phone (+country code), email, IP
- ⚠️ Limited: EU national IDs, UK NI numbers

To add more, extend `detection-patterns.ts`.

---

## Summary

### ✅ What We Built

1. **PII Detection Patterns** - 11+ types with validation
2. **Smart Sanitization** - Context-aware redaction
3. **User Warnings** - Alert users when PII is detected
4. **Audit Logging** - Compliance tracking
5. **Comprehensive Tests** - 100+ test cases

### 🔒 Privacy Protection

- **Automatic**: No user action required
- **Mandatory**: Cannot be disabled
- **Context-Aware**: Smart about what to block
- **Transparent**: Users know when PII is redacted

### 📊 Compliance

- ✅ GDPR compliant (data minimization, security)
- ✅ CCPA compliant (privacy notices, user control)
- ✅ COPPA compliant (no PII from minors)
- ✅ Audit trail for data processing

### 🚀 Next Steps

After completing Task 0.4 (PII Detection), proceed to:
- **Task 0.5**: Content Policy Page
- **Task 0.6**: E2E Testing for Phase 0

---

**Questions?** Check the [FAQ](#faq) or review the code in `lib/pii/`.
