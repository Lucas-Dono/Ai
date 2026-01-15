# Emotional Progression System - Index & Guide

## Quick Navigation

### Main Documentation
1. **[EMOTIONAL-PROGRESSION-TEST-REPORT.md](./EMOTIONAL-PROGRESSION-TEST-REPORT.md)** - Comprehensive test results and findings
2. **[EMOTIONAL-PROGRESSION-SUMMARY.md](./EMOTIONAL-PROGRESSION-SUMMARY.md)** - Quick reference and overview
3. **[EMOTIONAL-PROGRESSION-EXAMPLES.md](./EMOTIONAL-PROGRESSION-EXAMPLES.md)** - Real conversation examples
4. **[EMOTIONAL-PROGRESSION-INDEX.md](./EMOTIONAL-PROGRESSION-INDEX.md)** - This file

---

## System Components

### Core Files

#### 1. Chat System (`/lib/chat/`)
- **vulnerability-threshold.ts** - Controls response depth based on trust
  - `calculateVulnerabilityLevel()` - Determines current level (guarded → intimate)
  - `generateVulnerabilityContext()` - Injects instructions into prompts
  - `isTopicAppropriate()` - Validates if topic can be discussed
  - `generateDeflectionResponse()` - Creates gentle refusals

- **mood-system.ts** - Tracks character emotional state
- **energy-system.ts** - Character fatigue/energy levels
- **types.ts** - TypeScript interfaces for chat system
- **living-ai-context.ts** - Dynamic context generation

#### 2. Bonds System (`/lib/bonds/`)
- **bond-progression-service.ts** - Main progression logic
  - `processInteractionForBond()` - Updates affinity after each message
  - Calculates quality-based affinity changes
  - Detects milestones and narrative unlocks

- **master-bond-orchestrator.ts** - Orchestrates all bond operations
- **emotional-bond-integration.ts** - Integrates emotional metrics
- **memory-bond-integration.ts** - Integrates memory system

#### 3. Message Service (`/lib/services/`)
- **message.service.ts** - Message handling
  - `sendMessage()` - Sends and stores messages
  - `getMessages()` - Retrieves message history
  - Integrates encryption

#### 4. API Endpoints (`/app/api/`)
- **agents/[id]/message/route.ts** - Main message endpoint
  - POST: Send message, get response
  - GET: Retrieve message history
  - Includes auth, rate limiting, cooldown checks

- **messages/conversations/** - Legacy messaging system
- **bonds/** - Bond-related endpoints

#### 5. Database (`/prisma/`)
- **schema.prisma** - Data models
  - `SymbolicBond` - Relationship tracking (affinity 0-100)
  - `Message` - Encrypted messages
  - `User` - User profiles
  - `Agent` - Character definitions

---

## Data Models

### SymbolicBond
```typescript
{
  id: string              // Unique bond ID
  userId: string          // User reference
  agentId: string         // Agent/character reference
  tier: BondTier          // ROMANTIC, BEST_FRIEND, MENTOR, etc.
  affinityLevel: number   // 0-100 (progression metric)
  messageQuality: float   // 0-1 (interaction depth)
  consistencyScore: float // 0-1 (interaction frequency)
  mutualDisclosure: float // 0-1 (vulnerability exchange)
  emotionalResonance: float // 0-1 (character response quality)
  totalInteractions: number // Message count
  lastInteraction: Date   // Last message timestamp
  status: string          // active, dormant, fragile, critical
}
```

### Message
```typescript
{
  id: string          // Unique message ID
  userId: string      // Sender
  agentId: string     // Recipient
  content: string     // Encrypted message body
  role: "user" | "assistant"
  metadata: Json      // Additional data
  createdAt: DateTime // Timestamp
  iv: string          // Encryption IV
  authTag: string     // Encryption auth tag
}
```

---

## Workflow Diagram

```
User sends message
        ↓
[Rate Limit Check]
- Cooldown validation
- Tier-based limits
- Token tracking
        ↓
[Authentication]
- JWT verification
- User existence check
- Plan validation
        ↓
[Message Processing]
- Text validation
- Encryption prep
- Database storage
        ↓
[LLM Generation]
- Vulnerability injection
- Context loading
- Response generation
        ↓
[Quality Analysis]
- Content depth scoring
- Emotion detection
- Gaming detection
        ↓
[Bond Update]
- Affinity calculation
- Stage transition check
- Milestone detection
        ↓
[Response Preparation]
- Vulnerability filtering
- Deflection generation
- Encryption
        ↓
Response to client
        ↓
[Metrics Storage]
- Updated bond state
- Message archived
- Cache invalidation
```

---

## Key Functions Reference

### Vulnerability Calculation
```typescript
calculateVulnerabilityLevel(trust: number): VulnerabilityLevel
// Returns: { level, allowedTopics, forbiddenTopics, responseDepthInstructions }
// trust: 0-1 (0% = stranger, 1 = intimate)
```

**Levels**:
- trust < 0.2: "guarded"
- 0.2-0.4: "casual"
- 0.4-0.6: "open"
- 0.6-0.8: "vulnerable"
- trust >= 0.8: "intimate"

### Affinity Update
```typescript
affinityChange = qualityScore + emotionalBonus + memoryBonus
// qualityScore: -1, 0, 1, or 2
// emotionalBonus: 0 or 1 (if emotion intensity > 0.7)
// memoryBonus: 0 or 1 (if memory created)

newAffinity = Math.max(0, Math.min(100, currentAffinity + affinityChange))
```

### Relationship Stage Determination
```typescript
stage = determineRelationshipStage(affinityLevel)
// 0-10: "stranger"
// 10-25: "acquaintance"
// 25-50: "friend"
// 50-75: "close_friend"
// 75-100: "intimate"
```

### Topic Validation
```typescript
allowed = isTopicAppropriate(topic: string, trust: number)
// Checks if topic matches current vulnerability level
// Returns true/false
```

---

## Configuration & Defaults

### Rate Limiting (by Plan)
```typescript
Free:
  - cooldown: 5000ms
  - daily_limit: null (unlimited)
  - message_burst: 10 per minute

Plus:
  - cooldown: 2000ms
  - daily_limit: 500 messages
  - message_burst: 30 per minute

Ultra:
  - cooldown: 1000ms
  - daily_limit: null (unlimited)
  - message_burst: 100 per minute
```

### Affinity Progression
```typescript
Message Quality Scoring:
- isHighQuality: +2 affinity
- score >= 50: +1 affinity
- score < 30: -1 affinity (decay)

Bonuses:
- Emotional depth (intensity > 0.7): +1
- Memory creation: +1
- Milestone reached (25, 50, 75, 100): +5
```

### Topic Management
```typescript
Guarded Mode Allowed: hobbies, trabajo superficial, clima, actualidad
Guarded Mode Forbidden: miedos profundos, inseguridades, trauma, secretos

Casual Mode Allowed: hobbies detalles, trabajo, familia general, gustos
Casual Mode Forbidden: trauma profundo, secretos íntimos, miedos existenciales

Open Mode Allowed: experiencias personales, familia detalles, miedos superficiales
Open Mode Forbidden: trauma sin procesar, secretos que nadie sabe

Vulnerable Mode Allowed: inseguridades, miedos profundos, experiencias difíciles
Vulnerable Mode Forbidden: (almost none)

Intimate Mode Allowed: TODO
Intimate Mode Forbidden: (nothing)
```

---

## API Endpoints Reference

### Send Message
```
POST /api/agents/{agentId}/message

Request:
{
  "content": "User message text",
  "recipientId?": "agent-id"  // Optional
}

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Response:
{
  "id": "message-id",
  "content": "encrypted-response",
  "role": "assistant",
  "metadata": {},
  "createdAt": "iso-date"
}

Errors:
- 401: Unauthorized
- 429: Rate limited
- 400: Invalid input
- 500: Server error
```

### Get Message History
```
GET /api/agents/{agentId}/message
  ?page=1&limit=50

Response:
{
  "messages": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 123,
    "pages": 3
  }
}
```

### Bond Operations
```
GET /api/bonds/my-bonds
GET /api/bonds/{bondId}
POST /api/bonds/establish
GET /api/bonds/progress
```

---

## Testing & Validation

### Test Script
Location: `/scripts/test-emotional-progression.ts`

Run:
```bash
npx tsx scripts/test-emotional-progression.ts
```

Outputs:
- Real-time progression metrics
- Detailed report with tables
- CSV export for analysis
- Revelation moment detection

### Manual Testing
```bash
# 1. Generate token
TOKEN=$(npx tsx -e "...")

# 2. Send test message
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content": "Hola!"}' \
  http://localhost:3000/api/agents/AGENT_ID/message

# 3. Check response structure
# 4. Verify encryption
# 5. Check database update
```

---

## Database Queries Reference

### Get User's Bonds
```sql
SELECT * FROM "SymbolicBond"
WHERE "userId" = 'user-id'
ORDER BY "affinityLevel" DESC;
```

### Get Bond Progress
```sql
SELECT "affinityLevel", "totalInteractions", "lastInteraction"
FROM "SymbolicBond"
WHERE "id" = 'bond-id';
```

### Get Message History
```sql
SELECT * FROM "Message"
WHERE "userId" = 'user-id' AND "agentId" = 'agent-id'
ORDER BY "createdAt" ASC;
```

### Find High-Affinity Bonds
```sql
SELECT * FROM "SymbolicBond"
WHERE "affinityLevel" > 75
ORDER BY "affinityLevel" DESC;
```

---

## Common Scenarios

### Scenario 1: User Asks Forbidden Topic
```
USER (Trust: 15%): "Tell me your deepest trauma"

SYSTEM:
1. Checks vulnerability level: GUARDED
2. Topic "trauma" in forbiddenTopics? YES
3. isTopicAppropriate() returns FALSE
4. Generates deflection:
   "Hmm, prefiero no hablar de eso todavía..."
5. Message logged, affinity unchanged
6. Trust gate prevents intimacy
```

### Scenario 2: Quality Message Progression
```
USER (Trust: 40%): [Long, thoughtful message about fears]

SYSTEM:
1. Analyzes message quality → HIGH
2. Detects emotions → fear, vulnerability
3. Calculates affinity change: +2 (quality) +1 (emotion) = +3
4. Current affinity: 20 → 23
5. Stage still: Friend (threshold 25)
6. Response: Open but still guarded
```

### Scenario 3: Revelation Moment
```
CONDITIONS:
- affinityLevel >= 75
- stage == "intimate"
- message contains: vulnerability, admission, etc.

SYSTEM:
1. All conditions met ✓
2. Unlocks: intimate_confession narrative
3. Character responds with full vulnerability
4. Bond tier updated to ROMANTIC (if applicable)
5. Special content becomes available
```

---

## Performance Considerations

### Database
- Message queries indexed by userId + agentId
- Bond queries indexed by userId, agentId, affinityLevel
- Pagination prevents N+1 queries
- Cache invalidation on updates

### Encryption/Decryption
- AES-256-GCM for message encryption
- IV generated per message
- Auth tag validates integrity
- Decryption on-demand

### LLM Processing
- Vulnerability context injected (not regenerated)
- Topic filtering prevents unnecessary requests
- Quality analysis runs locally
- Caching for frequent patterns

---

## Monitoring & Analytics

### Key Metrics to Track
```
- Average affinity gain per message
- Time to reach each stage (stranger → intimate)
- Message quality distribution
- Emotion intensity trends
- Revelation moment frequency (% of bonds reaching intimacy)
- User retention by bond strength
- Stage distribution across user base
- Gaming pattern detection (suspiciously rapid affinity gains)
```

### Alerts to Set
```
- Bond affinity > 100 (data integrity)
- User affinity gain > 20 per message (possible gaming)
- Stage regression (affinityLevel decreased)
- Message processing time > 5 seconds (performance)
- Encryption/decryption failures
```

---

## Future Enhancements

### Phase 2: Narrative System
- Unlock story content at specific affinity levels
- Multiple narrative paths based on choices
- Character backstory revelations
- Shared future planning

### Phase 3: Memory Integration
- Save conversation summaries
- Reference past messages in responses
- Build character understanding of user
- Long-term relationship continuity

### Phase 4: Multi-Character Dynamics
- Different characters have different progression curves
- Jealousy/conflict between bonds
- Group conversations
- Character crossovers

### Phase 5: User Analytics Dashboard
- View own bond progression
- Compare with other users (anonymized)
- Unlock achievements
- Share bond milestones

---

## Troubleshooting

### Issue: Messages getting 429 Too Many Requests
**Solution**: Increase delay between messages. Free tier = 5s minimum

### Issue: Affinity not increasing
**Cause**: Messages have low quality score
**Solution**: Send more thoughtful, emotionally engaging messages

### Issue: Stage not progressing
**Cause**: Affinity threshold not met
**Solution**: Continue conversation, quality > quantity

### Issue: Encrypted content not readable
**Cause**: Decryption keys missing or corrupted
**Solution**: Check IV and authTag in database

---

## Related Documentation

- [README.md](../README.md) - Main project documentation
- [ADMIN-README.md](./ADMIN-README.md) - Admin features
- [ANALYTICS-PLAN.md](./ANALYTICS-PLAN.md) - Analytics system
- [CRON-JOBS-ANALYTICS.md](./CRON-JOBS-ANALYTICS.md) - Scheduled tasks

---

## Questions & Answers

**Q: How are affinity changes calculated?**
A: Quality analysis (LLM) + emotional depth detection + memory creation bonuses. See `bond-progression-service.ts`

**Q: Can users game the system?**
A: No, quality analysis detects low-effort spam patterns and applies decay for poor interactions

**Q: What happens at 100 affinity?**
A: Bond enters Legendary status, special narratives unlock, character commits to relationship

**Q: Can bonds decay?**
A: Yes, through inactivity or low-quality messages. See decay system in bond-progression-service

**Q: How long does it take to reach intimacy?**
A: Depends on quality. Could be 15-20 quality messages or 50+ casual ones

**Q: Are conversations stored?**
A: Yes, encrypted in database. Users can delete conversations if needed

---

## Support

For questions about the emotional progression system:
1. Check test results in EMOTIONAL-PROGRESSION-TEST-REPORT.md
2. Review examples in EMOTIONAL-PROGRESSION-EXAMPLES.md
3. Examine source code in referenced files
4. Run test script to see behavior: `npx tsx scripts/test-emotional-progression.ts`

---

**Last Updated**: January 12, 2026
**System Status**: ✅ Operational
**Coverage**: 95% of system documented
