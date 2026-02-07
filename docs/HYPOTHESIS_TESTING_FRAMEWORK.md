# HYPOTHESIS TESTING FRAMEWORK
## Validar asunciones de producto con usuarios reales

**Fecha:** 2025-11-10
**Purpose:** Framework sistemático para validar hipótesis antes de full development
**Methodology:** Lean Startup + Continuous Discovery

---

## WHY TEST HYPOTHESES?

### The Problem
- **Assumption:** "Si construimos X, los usuarios amarán Y"
- **Reality:** 70% de features fallan en adoption
- **Cost:** Weeks of dev time, opportunity cost

### The Solution
- **Test first, build later**
- Validate assumptions with minimal investment
- Iterate based on real user feedback
- Kill bad ideas early

---

## HYPOTHESIS FORMAT

```
We believe that [PERSONA]
experiences [PAIN/DESIRE]
when doing [JOB].

We will know we're right when we see [METRIC].

We will test this by [EXPERIMENT].
```

---

## CORE HYPOTHESES TO TEST (Q1 2025)

### HYPOTHESIS 1: Memory Dashboard Visibility

**Hypothesis:**
```
We believe that users (all personas)
experience frustration and lack of trust
when they can't see what their AI remembers about them.

We will know we're right when we see:
- 70%+ of active users access Memory Dashboard in first month
- 40%+ edit or delete at least one memory
- NPS increase of +10 points after feature launch

We will test this by:
- Building MVP Memory Dashboard (read-only first)
- A/B test: 50% get dashboard, 50% don't
- Survey: "Do you trust your AI remembers you?" (before/after)
- Qualitative interviews: 10 users
```

**Validation Criteria:**
- ✅ **SUCCESS:** >60% usage, +8 NPS
- ⚠️ **PARTIAL:** 40-60% usage, +5 NPS → Improve discoverability
- ❌ **FAIL:** <40% usage, <+3 NPS → Feature not valued, kill or pivot

**Timeline:** 2 weeks
**Investment:** $0 (use existing data)
**Risk:** Low (MVP is just UI, no complex backend)

---

### HYPOTHESIS 2: Proactive Messages Create Engagement

**Hypothesis:**
```
We believe that users (Personas 1, 2, 3)
desire more engagement and feel AI is too passive
when chatting infrequently.

We will know we're right when we see:
- 60%+ open rate on proactive messages
- 30% increase in DAU (Daily Active Users)
- 40%+ response rate to proactive messages

We will test this by:
- Implementing proactive system for 100 beta users
- Sending 1 proactive message per user per 3 days
- Tracking: open rate, response rate, session frequency
- Control group: 100 users without proactive messages
```

**Validation Criteria:**
- ✅ **SUCCESS:** >50% open, >30% response, +20% DAU
- ⚠️ **PARTIAL:** 30-50% open, 15-30% response → Improve message quality
- ❌ **FAIL:** <30% open, <15% response → Users don't want this

**Timeline:** 4 weeks
**Investment:** $500 (dev time for MVP)
**Risk:** Medium (could annoy users if done wrong)

**Mitigation:**
- Allow opt-out from first message
- Cooldown of 3 days minimum (not daily)
- Track unsubscribe rate (<10% = acceptable)

---

### HYPOTHESIS 3: NSFW Mode Drives Premium Conversion

**Hypothesis:**
```
We believe that users (Persona 5 + some of 1, 2)
are willing to pay premium for NSFW content
when given clear, non-judgmental access.

We will know we're right when we see:
- 35%+ of users activate NSFW mode
- 80%+ of NSFW users convert to premium tier
- NSFW users have 2x LTV vs non-NSFW

We will test this by:
- Launching NSFW mode for all users (free tier)
- Tracking activation rate
- After 2 weeks, gate NSFW to premium only
- Measure conversion rate
```

**Validation Criteria:**
- ✅ **SUCCESS:** >30% activation, >70% conversion
- ⚠️ **PARTIAL:** 20-30% activation, 50-70% conversion → Improve onboarding
- ❌ **FAIL:** <20% activation, <50% conversion → Not a priority

**Timeline:** 4 weeks
**Investment:** $0 (feature exists)
**Risk:** Low (can always disable)

**Ethics Check:**
- Age verification required
- Disclaimers clear
- Resources available
- Consent gates respected

---

### HYPOTHESIS 4: Personality Consistency Reduces Churn

**Hypothesis:**
```
We believe that users (Personas 2, 4)
churn because AI breaks character
when engaging in long conversations.

We will know we're right when we see:
- 50% reduction in "breaks character" complaints
- +10% D30 retention for users with consistent personalities
- 80%+ users rate personality as "consistent" (survey)

We will test this by:
- Implementing post-generation validation for 50% of users
- Control group: 50% without validation
- Track: retention, satisfaction survey, support tickets
```

**Validation Criteria:**
- ✅ **SUCCESS:** >40% reduction in complaints, +8% retention
- ⚠️ **PARTIAL:** 20-40% reduction, +4% retention → Iterate on validation logic
- ❌ **FAIL:** <20% reduction, <+2% retention → Not the root cause

**Timeline:** 6 weeks
**Investment:** $2,000 (dev time)
**Risk:** High (complex to implement)

**De-risk:**
- Start with simple rules (Big Five alignment)
- Iterate to semantic memory checks
- Have fallback (always send response, never block)

---

### HYPOTHESIS 5: Export Feature Reduces Churn Fear

**Hypothesis:**
```
We believe that users (Personas 1, 2, 3, 4)
fear lock-in and data loss
when investing time in AI relationship.

We will know we're right when we see:
- 15%+ of users export their data at least once
- +5% D30 retention for users aware of export feature
- Positive sentiment in reviews mentioning "I can backup my data"

We will test this by:
- Implementing export endpoint (JSON/PDF)
- Adding prominent "Export" button in settings
- Measuring usage, retention, NPS
```

**Validation Criteria:**
- ✅ **SUCCESS:** >10% usage, +4% retention, +5 NPS
- ⚠️ **PARTIAL:** 5-10% usage, +2% retention → Improve discoverability
- ❌ **FAIL:** <5% usage, <+1% retention → Low priority

**Timeline:** 1 week
**Investment:** $200 (very simple to implement)
**Risk:** Very Low

**Quick Win Potential:** HIGH (low effort, high impact on trust)

---

## EXPERIMENT DESIGN BEST PRACTICES

### 1. A/B Testing Framework

**When to use:**
- Testing UX changes (button placement, copy, etc.)
- Feature gating (50% get feature, 50% don't)
- Pricing experiments

**Setup:**
```typescript
// Example: A/B test proactive messages
const variant = getUserVariant(userId); // A or B

if (variant === 'A') {
  // Enable proactive messages
  await proactiveBehavior.checkAndSend(agentId, userId);
} else {
  // Control group: no proactive messages
}

// Track metrics
analytics.track('proactive_message_experiment', {
  variant,
  userId,
  messageOpened: boolean,
  messageReplied: boolean,
});
```

**Minimum Sample Size:**
- Small effect (5% improvement): 1,000 users per variant
- Medium effect (10% improvement): 400 users per variant
- Large effect (20% improvement): 100 users per variant

**Duration:**
- Minimum: 2 weeks (account for weekly patterns)
- Maximum: 8 weeks (diminishing returns)

**Statistical Significance:**
- p-value < 0.05 (95% confidence)
- Use online calculators: Optimizely, VWO, Evan's Awesome A/B Tools

---

### 2. User Interviews (Qualitative)

**When to use:**
- Understanding "why" behind quantitative data
- Exploring new problem spaces
- Validating personas

**Protocol:**
```
Duration: 30-45 min
Compensation: $20 gift card or 1 month premium free
Sample size: 10-15 users per persona

Questions (Proactive Messages Example):
1. "Tell me about the last time you talked to your AI."
2. "How do you feel when you don't talk for a few days?"
3. "If your AI sent you a message first, how would you react?"
   - Probe: "What would make it feel natural vs spammy?"
4. "Walk me through your ideal interaction flow."
5. "What concerns do you have about AI reaching out first?"

Recording: Yes (with consent)
Analysis: Thematic coding (patterns across interviews)
```

**Red Flags:**
- User says what they think you want to hear
- Hypothetical questions ("Would you use X?") → Ask about past behavior
- Leading questions → Stay neutral

---

### 3. Surveys (Quantitative)

**When to use:**
- Measuring satisfaction (NPS, CSAT)
- Prioritizing features ("Which would you use most?")
- Segmentation (identify personas)

**Example: Feature Prioritization Survey**
```
Subject: Help us build what you want

Q1: Which of these features would improve your experience MOST?
[ ] Memory Dashboard (see what AI knows about you)
[ ] Proactive messages (AI texts you first)
[ ] Better personality consistency
[ ] Export conversations
[ ] Voice customization

Q2: How often do you use [Product]?
[ ] Daily [ ] 3-5x/week [ ] 1-2x/week [ ] Less than weekly

Q3: What's the #1 thing frustrating you today?
[Open text]

Q4: NPS: How likely are you to recommend [Product]? (0-10)
```

**Sample Size:**
- 100+ responses for directional insights
- 400+ for statistical significance

**Distribution:**
- In-app prompt (highest response rate)
- Email (segment: power users)
- Social media (broader audience)

**Response Rate Expectations:**
- In-app: 10-20%
- Email: 5-10%
- Social: 1-3%

---

### 4. Usage Analytics (Behavioral)

**When to use:**
- Measuring actual behavior (not stated intent)
- Funnel analysis (where do users drop off?)
- Cohort retention

**Key Metrics to Track:**

**Engagement:**
- DAU / MAU ratio (stickiness)
- Session length
- Messages per session
- Feature adoption rate

**Retention:**
- D1, D7, D30 retention curves
- Cohort analysis (users who joined Week 1 vs Week 2)
- Churn rate

**Conversion:**
- Free → Premium conversion rate
- Time to conversion
- Revenue per user (ARPU)

**Feature-Specific:**
- Memory Dashboard: % users who access, avg time spent
- Proactive Messages: Open rate, response rate
- NSFW Mode: Activation rate, premium conversion

**Tools:**
- Mixpanel, Amplitude (event tracking)
- Google Analytics (web traffic)
- PostHog (open-source alternative)

---

### 5. Beta Testing (Closed Group)

**When to use:**
- High-risk features (proactive messages, NSFW)
- Before full rollout
- Gathering feedback on rough edges

**Setup:**
```
Beta Group Size: 50-100 users
Selection Criteria:
- Power users (daily active)
- Diverse personas (mix of 1, 2, 3, 4, 5)
- Willing to give feedback (survey opt-in)

Communication:
- Welcome email: "You're in our beta program!"
- Feedback loop: Weekly survey + dedicated Slack/Discord
- Incentive: Free premium for duration of beta

Duration: 2-4 weeks
Exit Criteria:
- <5% critical bugs
- >70% satisfaction score
- Positive qualitative feedback
```

---

## EXPERIMENTATION ROADMAP Q1 2025

### Week 1-2: Memory Dashboard MVP
**Hypothesis:** H1 (Memory Dashboard Visibility)
**Experiment:** A/B test (50% get dashboard)
**Metric:** Usage rate, NPS
**Decision Point:** Week 3 (ship to 100% or kill)

### Week 3-6: Proactive Messages Beta
**Hypothesis:** H2 (Proactive Engagement)
**Experiment:** Closed beta (100 users)
**Metric:** Open rate, response rate, DAU
**Decision Point:** Week 7 (rollout to all or pivot)

### Week 5-6: Export Feature Ship
**Hypothesis:** H5 (Export Reduces Churn Fear)
**Experiment:** Ship to 100%, measure usage
**Metric:** Export rate, retention, NPS
**Decision Point:** Week 8 (promote or deprioritize)

### Week 7-10: NSFW Conversion Test
**Hypothesis:** H3 (NSFW Drives Premium)
**Experiment:** Free NSFW → Premium gate after 2 weeks
**Metric:** Activation rate, conversion rate
**Decision Point:** Week 11 (optimize pricing or features)

### Week 9-12: Personality Consistency Beta
**Hypothesis:** H4 (Consistency Reduces Churn)
**Experiment:** A/B test (50% get validation)
**Metric:** Churn rate, complaints, satisfaction
**Decision Point:** Week 13 (rollout or iterate)

---

## DECISION FRAMEWORK

### After Each Experiment

**1. Analyze Data**
- Did we hit success criteria?
- Statistical significance achieved?
- Qualitative feedback aligns?

**2. Make Decision**

**Option A: SHIP IT**
- Criteria met or exceeded
- No major concerns
- Action: Rollout to 100%, iterate based on feedback

**Option B: ITERATE**
- Partial success
- Clear improvement path identified
- Action: Implement changes, re-test with smaller group

**Option C: PIVOT**
- Hypothesis invalidated
- Different root cause identified
- Action: Re-frame problem, new hypothesis

**Option D: KILL IT**
- Criteria not met
- No clear improvement path
- Opportunity cost too high
- Action: Deprioritize, reallocate resources

**3. Document Learnings**
- What worked? What didn't?
- Update personas/insights
- Share with team (retro, Slack)

---

## COMMON PITFALLS & HOW TO AVOID

### Pitfall 1: Vanity Metrics
**Bad:** "10,000 signups!"
**Good:** "10,000 signups, 40% activated, 20% D7 retention"

**Fix:** Always measure activation + retention, not just top-of-funnel.

---

### Pitfall 2: Sample Bias
**Bad:** Only survey power users (they're not representative)
**Good:** Random sample across all user segments

**Fix:** Stratified sampling (equal representation of personas).

---

### Pitfall 3: Confirmation Bias
**Bad:** "Users said they want X, so we'll build X without testing"
**Good:** "Users said X, let's validate with behavior before building"

**Fix:** Test with MVP or prototype first. Watch what users DO, not just what they SAY.

---

### Pitfall 4: Testing Too Many Variables
**Bad:** "Let's test proactive messages + new UI + NSFW at once"
**Good:** "Let's test proactive messages first, isolate the variable"

**Fix:** One variable per experiment. Otherwise, you can't attribute results.

---

### Pitfall 5: Insufficient Sample Size
**Bad:** "We tested with 20 users, it works!"
**Good:** "We need 400+ for 95% confidence on a 10% improvement"

**Fix:** Use sample size calculators. Don't ship based on anecdotes.

---

### Pitfall 6: Not Setting Exit Criteria Upfront
**Bad:** "Let's test and see what happens"
**Good:** "If open rate <40%, we kill it. If >60%, we ship it."

**Fix:** Define success/fail criteria BEFORE experiment. Prevents goalpost moving.

---

## TEMPLATES & RESOURCES

### Experiment Brief Template
```markdown
# Experiment: [Name]

## Hypothesis
We believe that [WHO] experiences [WHAT] when [CONTEXT].
We will know we're right when we see [METRIC].

## Experiment Design
- Type: A/B test / Beta / Survey / Interview
- Sample size: X users
- Duration: Y weeks
- Variants:
  - A (Control): [Description]
  - B (Test): [Description]

## Success Criteria
- Primary metric: [X] → Target: [Y]
- Secondary metrics: [A, B, C]
- Exit criteria:
  - ✅ Ship if: [Condition]
  - ⚠️ Iterate if: [Condition]
  - ❌ Kill if: [Condition]

## Implementation
- Code changes: [Link to PR]
- Analytics events: [List]
- Rollout plan: [Phased or all-at-once]

## Timeline
- Week 1: Setup
- Week 2-3: Run experiment
- Week 4: Analyze & decide

## Risks
- [Risk 1]: [Mitigation]
- [Risk 2]: [Mitigation]

## Decision
- Date: [YYYY-MM-DD]
- Result: Ship / Iterate / Pivot / Kill
- Reasoning: [1-2 paragraphs]
- Next steps: [Action items]
```

---

### User Interview Script Template
```markdown
# User Interview Script: [Topic]

## Pre-Interview (5 min)
- Thank you for joining!
- This will take 30-45 minutes.
- We're recording (OK?) for note-taking.
- No wrong answers, we want honest feedback.
- You'll get [compensation] after.

## Warm-Up (5 min)
- How did you first hear about [Product]?
- How long have you been using it?
- How often do you use it?

## Main Questions (20-30 min)
1. [Open-ended question about behavior]
   - Probe: Can you walk me through that?
   - Probe: How did that make you feel?

2. [Problem exploration]
   - Probe: When was the last time that happened?
   - Probe: What did you do?

3. [Solution validation]
   - Show prototype/mockup
   - Probe: What's your first reaction?
   - Probe: What would you change?

## Wrap-Up (5 min)
- Is there anything we didn't cover that you want to share?
- Any questions for me?
- Thank you! Here's your [compensation].

## Post-Interview
- Transcribe notes
- Tag with themes (pain points, desires, quotes)
- Add to research database
```

---

### Survey Template (NPS + Feature Prioritization)
```markdown
Subject: Quick feedback? (2 minutes)

Q1: How likely are you to recommend [Product] to a friend? (0-10)
[ 0 ] [ 1 ] [ 2 ] ... [ 10 ]

Q2: [If 0-6] What's the main reason for your score?
[Open text]

Q2b: [If 7-8] What would make you a 10?
[Open text]

Q2c: [If 9-10] What do you love most?
[Open text]

Q3: Which feature would improve your experience MOST?
[ ] [Feature A]
[ ] [Feature B]
[ ] [Feature C]
[ ] [Feature D]
[ ] Other: [Open text]

Q4: What's the #1 frustration with [Product] today?
[Open text]

Q5: How often do you use [Product]?
[ ] Daily
[ ] 3-5x per week
[ ] 1-2x per week
[ ] Less than weekly

Thank you! Your feedback shapes our roadmap.
```

---

## CONCLUSION

**Testing > Guessing**

Every feature represents:
- Weeks of dev time
- Opportunity cost (could build something else)
- Risk of churn if users don't want it

**Test early, test often:**
- MVPs before full builds
- 100 users before 10,000
- Data before intuition

**Our Q1 2025 Testing Plan:**
- 5 core hypotheses
- 12-week timeline
- $2,700 total investment
- Expected outcome: 3-4 validated features to ship

**Success = Learning fast, shipping smart.**

---

**Archivo:** `/run/media/lucas/SSD/Proyectos/AI/creador-inteligencias/HYPOTHESIS_TESTING_FRAMEWORK.md`
**Created:** 2025-11-10
**Owner:** Product Management
**Related:** USER_STORIES_DETAILED.md, PRODUCT_PRIORITIZATION_FRAMEWORK.md
