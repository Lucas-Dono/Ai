# Analytics Tracking - Usage Examples

Ejemplos completos de implementación del sistema de tracking de analytics.

## Table of Contents

1. [Landing Page Tracking](#landing-page-tracking)
2. [Demo Chat Tracking](#demo-chat-tracking)
3. [API Route Tracking](#api-route-tracking)
4. [Component-Level Tracking](#component-level-tracking)
5. [Server Component Tracking](#server-component-tracking)
6. [Custom Hooks](#custom-hooks)

---

## Landing Page Tracking

### Hero Section Component

```typescript
'use client';

import { useEffect } from 'react';
import { trackEvent, LandingEventType } from '@/lib/analytics/track-client';

export function HeroSection() {
  // Track page view on mount
  useEffect(() => {
    trackEvent({
      eventType: LandingEventType.PAGE_VIEW,
      metadata: {
        path: window.location.pathname,
      },
    });
  }, []);

  // Track CTA clicks
  const handlePrimaryCTA = () => {
    trackEvent({
      eventType: LandingEventType.CTA_PRIMARY,
      metadata: {
        ctaLocation: 'hero',
        ctaText: 'Go to Dashboard',
      },
    });

    // Navigate
    window.location.href = '/dashboard';
  };

  const handleSecondaryCTA = () => {
    trackEvent({
      eventType: LandingEventType.CTA_SECONDARY,
      metadata: {
        ctaLocation: 'hero',
        ctaText: 'View Demo',
      },
    });

    // Scroll to demo
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero">
      <h1>Welcome to Our App</h1>
      <p>Create amazing AI companions</p>

      <button onClick={handlePrimaryCTA}>
        Go to Dashboard
      </button>

      <button onClick={handleSecondaryCTA}>
        View Demo
      </button>
    </section>
  );
}
```

---

## Demo Chat Tracking

### Landing Demo Chat Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { trackEvent, LandingEventType } from '@/lib/analytics/track-client';

const MAX_DEMO_MESSAGES = 3;

export function LandingDemoChat() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const handleSendMessage = async (content: string) => {
    // Track demo start on first message
    if (!hasStarted) {
      trackEvent({
        eventType: LandingEventType.DEMO_START,
      });
      setHasStarted(true);
    }

    // Track each message
    trackEvent({
      eventType: LandingEventType.DEMO_MESSAGE,
      metadata: {
        messageCount: messageCount + 1,
        messageLength: content.length,
      },
    });

    // Add user message
    setMessages([...messages, { role: 'user', content }]);
    setMessageCount(messageCount + 1);

    // Check if limit reached
    if (messageCount + 1 >= MAX_DEMO_MESSAGES) {
      trackEvent({
        eventType: LandingEventType.DEMO_LIMIT_REACHED,
        metadata: {
          messageCount: messageCount + 1,
        },
      });
    }

    // Get AI response
    const response = await fetchDemoResponse(content);
    setMessages([...messages, { role: 'user', content }, { role: 'assistant', content: response }]);
  };

  const handleSignupClick = () => {
    trackEvent({
      eventType: LandingEventType.DEMO_SIGNUP,
      metadata: {
        messageCount,
        demoCompleted: messageCount >= MAX_DEMO_MESSAGES,
      },
    });

    // Navigate to signup
    window.location.href = '/signup';
  };

  return (
    <div className="demo-chat">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            {msg.content}
          </div>
        ))}
      </div>

      {messageCount < MAX_DEMO_MESSAGES ? (
        <MessageInput onSend={handleSendMessage} />
      ) : (
        <div className="limit-reached">
          <p>You've reached the demo limit!</p>
          <button onClick={handleSignupClick}>
            Sign up to continue
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## API Route Tracking

### Signup Route

```typescript
// app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { trackSignup } from '@/lib/analytics/track-server';
import { createUser } from '@/lib/db/users';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { email, password, name, referralSource, fromDemo } = data;

    // Create user
    const user = await createUser({
      email,
      password,
      name,
    });

    // Track signup (fire-and-forget)
    trackSignup(user.id, {
      signupMethod: 'email',
      referralSource,
      fromDemo: fromDemo || false,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Signup failed' },
      { status: 500 }
    );
  }
}
```

### Create Agent Route

```typescript
// app/api/agents/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { trackFirstAgent } from '@/lib/analytics/track-server';
import { createAgent } from '@/lib/db/agents';

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();

  // Create agent
  const agent = await createAgent({
    userId: user.id,
    name: data.name,
    tier: data.tier,
    // ... other fields
  });

  // Check if this is the user's first agent
  const agentCount = await prisma.agent.count({
    where: { userId: user.id },
  });

  if (agentCount === 1) {
    // Track first agent creation
    const signupDate = user.createdAt;
    const timeSinceSignup = (Date.now() - signupDate.getTime()) / 1000;

    trackFirstAgent(user.id, {
      agentId: agent.id,
      agentTier: agent.tier,
      timeSinceSignup,
    });
  }

  return NextResponse.json({ agent });
}
```

### Upgrade Route

```typescript
// app/api/billing/upgrade/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { trackPlanUpgrade } from '@/lib/analytics/track-server';
import { upgradePlan } from '@/lib/billing';

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { newPlan } = await req.json();
  const oldPlan = user.plan;

  // Process upgrade
  const result = await upgradePlan(user.id, newPlan);

  // Track upgrade
  const signupDate = user.createdAt;
  const daysSinceSignup = Math.floor((Date.now() - signupDate.getTime()) / (1000 * 60 * 60 * 24));

  trackPlanUpgrade(user.id, {
    oldPlan: oldPlan as any,
    newPlan: newPlan as any,
    amount: result.amount,
    daysSinceSignup,
    triggerType: req.headers.get('x-trigger-type') || 'manual',
  });

  return NextResponse.json({ success: true, ...result });
}
```

---

## Component-Level Tracking

### Scroll Depth Tracker

```typescript
'use client';

import { useEffect } from 'react';
import { createScrollDepthTracker } from '@/lib/analytics/track-client';

export function LandingPage() {
  useEffect(() => {
    // Create scroll tracker
    const tracker = createScrollDepthTracker((depth) => {
      console.log(`User scrolled to ${depth}%`);
    });

    // Cleanup on unmount
    return () => tracker.cleanup();
  }, []);

  return (
    <div className="landing-page">
      {/* Very long content */}
      <section id="hero">...</section>
      <section id="features">...</section>
      <section id="pricing">...</section>
      <section id="footer">...</section>
    </div>
  );
}
```

### Feature Click Tracking

```typescript
'use client';

import { trackEvent, LandingEventType } from '@/lib/analytics/track-client';

interface Feature {
  name: string;
  category: string;
  description: string;
}

export function FeaturesGrid({ features }: { features: Feature[] }) {
  const handleFeatureClick = (feature: Feature) => {
    trackEvent({
      eventType: LandingEventType.FEATURE_CLICK,
      metadata: {
        featureName: feature.name,
        featureCategory: feature.category,
      },
    });
  };

  return (
    <div className="features-grid">
      {features.map((feature) => (
        <div
          key={feature.name}
          onClick={() => handleFeatureClick(feature)}
          className="feature-card"
        >
          <h3>{feature.name}</h3>
          <p>{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Plan Selection Tracking

```typescript
'use client';

import { trackEvent, LandingEventType } from '@/lib/analytics/track-client';

interface Plan {
  name: 'free' | 'plus' | 'ultra';
  price: number;
}

export function PricingTable({ plans }: { plans: Plan[] }) {
  const handlePlanSelect = (plan: Plan) => {
    trackEvent({
      eventType: LandingEventType.PLAN_SELECT,
      metadata: {
        planName: plan.name,
        planPrice: plan.price,
      },
    });

    // Navigate to signup with plan pre-selected
    window.location.href = `/signup?plan=${plan.name}`;
  };

  return (
    <div className="pricing-table">
      {plans.map((plan) => (
        <div key={plan.name} className="plan-card">
          <h3>{plan.name}</h3>
          <p>${plan.price}/month</p>
          <button onClick={() => handlePlanSelect(plan)}>
            Select Plan
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Server Component Tracking

### First Message Tracking

```typescript
// app/api/messages/send/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { trackFirstMessage } from '@/lib/analytics/track-server';
import { sendMessage } from '@/lib/chat';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { agentId, content } = await req.json();

  // Send message
  const message = await sendMessage({
    userId: user.id,
    agentId,
    content,
  });

  // Check if this is the user's first message ever
  const messageCount = await prisma.message.count({
    where: { userId: user.id },
  });

  if (messageCount === 1) {
    // Track first message
    const signupDate = user.createdAt;
    const timeToFirstMessage = (Date.now() - signupDate.getTime()) / 1000;

    trackFirstMessage(user.id, {
      agentId,
      timeToFirstMessage,
    });
  }

  return NextResponse.json({ message });
}
```

### Limit Reached Tracking

```typescript
// app/api/messages/send/route.ts (continued)

import { trackLimitReached } from '@/lib/analytics/track-server';

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user has reached their limit
  if (user.plan === 'free' && user.messageCount >= FREE_MESSAGE_LIMIT) {
    // Track limit reached
    trackLimitReached(user.id, {
      limitReached: 'message_limit',
      currentPlan: 'free',
    });

    return NextResponse.json(
      {
        error: 'Message limit reached',
        upgrade: true,
      },
      { status: 403 }
    );
  }

  // Continue with message sending...
}
```

---

## Custom Hooks

### useAnalyticsPageView Hook

```typescript
// hooks/useAnalyticsPageView.ts

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent, LandingEventType } from '@/lib/analytics/track-client';

export function useAnalyticsPageView() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent({
      eventType: LandingEventType.PAGE_VIEW,
      metadata: {
        path: pathname,
      },
    });
  }, [pathname]);
}

// Usage in layout or page
export default function LandingLayout({ children }) {
  useAnalyticsPageView();
  return <>{children}</>;
}
```

### useAnalyticsScrollDepth Hook

```typescript
// hooks/useAnalyticsScrollDepth.ts

'use client';

import { useEffect } from 'react';
import { createScrollDepthTracker } from '@/lib/analytics/track-client';

export function useAnalyticsScrollDepth(
  onDepthReached?: (depth: number) => void
) {
  useEffect(() => {
    const tracker = createScrollDepthTracker(onDepthReached);
    return () => tracker.cleanup();
  }, [onDepthReached]);
}

// Usage
export function LandingPage() {
  useAnalyticsScrollDepth((depth) => {
    console.log(`Scroll depth: ${depth}%`);
  });

  return <div>...</div>;
}
```

### useAnalyticsEvent Hook

```typescript
// hooks/useAnalyticsEvent.ts

'use client';

import { useCallback } from 'react';
import { trackEvent } from '@/lib/analytics/track-client';
import type { TrackEventParams } from '@/lib/analytics/types';

export function useAnalyticsEvent() {
  return useCallback((params: TrackEventParams) => {
    trackEvent(params);
  }, []);
}

// Usage
export function MyComponent() {
  const track = useAnalyticsEvent();

  const handleClick = () => {
    track({
      eventType: 'landing.cta_primary',
      metadata: { ctaLocation: 'hero' },
    });
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

---

## Complete Integration Example

### Full Landing Page with Analytics

```typescript
'use client';

import { useEffect, useState } from 'react';
import {
  trackEvent,
  LandingEventType,
  createScrollDepthTracker,
} from '@/lib/analytics/track-client';

export default function LandingPage() {
  const [demoMessages, setDemoMessages] = useState(0);
  const MAX_DEMO = 3;

  // Track page view on mount
  useEffect(() => {
    trackEvent({ eventType: LandingEventType.PAGE_VIEW });

    // Setup scroll tracking
    const tracker = createScrollDepthTracker();
    return () => tracker.cleanup();
  }, []);

  // Hero CTA
  const handleGetStarted = () => {
    trackEvent({
      eventType: LandingEventType.CTA_PRIMARY,
      metadata: { ctaLocation: 'hero', ctaText: 'Get Started' },
    });
    window.location.href = '/dashboard';
  };

  // Demo interaction
  const handleDemoStart = () => {
    if (demoMessages === 0) {
      trackEvent({ eventType: LandingEventType.DEMO_START });
    }
  };

  const handleDemoMessage = (message: string) => {
    trackEvent({
      eventType: LandingEventType.DEMO_MESSAGE,
      metadata: {
        messageCount: demoMessages + 1,
        messageLength: message.length,
      },
    });

    setDemoMessages(demoMessages + 1);

    if (demoMessages + 1 >= MAX_DEMO) {
      trackEvent({
        eventType: LandingEventType.DEMO_LIMIT_REACHED,
        metadata: { messageCount: demoMessages + 1 },
      });
    }
  };

  // Feature click
  const handleFeatureClick = (feature: string) => {
    trackEvent({
      eventType: LandingEventType.FEATURE_CLICK,
      metadata: { featureName: feature },
    });
  };

  // Plan selection
  const handlePlanSelect = (plan: string, price: number) => {
    trackEvent({
      eventType: LandingEventType.PLAN_SELECT,
      metadata: { planName: plan, planPrice: price },
    });
    window.location.href = `/signup?plan=${plan}`;
  };

  return (
    <div className="landing-page">
      {/* Hero */}
      <section className="hero">
        <h1>Create Your AI Companion</h1>
        <button onClick={handleGetStarted}>Get Started</button>
      </section>

      {/* Demo */}
      <section className="demo">
        <DemoChat
          onStart={handleDemoStart}
          onMessage={handleDemoMessage}
          messageCount={demoMessages}
          maxMessages={MAX_DEMO}
        />
      </section>

      {/* Features */}
      <section className="features">
        {features.map((feature) => (
          <div
            key={feature.name}
            onClick={() => handleFeatureClick(feature.name)}
          >
            <h3>{feature.name}</h3>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section className="pricing">
        {plans.map((plan) => (
          <div key={plan.name}>
            <h3>{plan.name}</h3>
            <p>${plan.price}/mo</p>
            <button onClick={() => handlePlanSelect(plan.name, plan.price)}>
              Select
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
```

---

## Debugging

### Check Current Analytics State

```typescript
import { getAnalyticsDebugInfo } from '@/lib/analytics/track-client';

// In browser console or component
console.log(getAnalyticsDebugInfo());
```

### Clear Analytics Data

```typescript
import { clearAnalyticsData } from '@/lib/analytics/track-client';

// Useful for testing
clearAnalyticsData();
```

### Monitor Network Requests

Open DevTools > Network tab, filter by "track" to see all analytics requests.

---

## Performance Tips

1. **Fire-and-forget**: Don't await `trackEvent()` unless necessary
2. **Batch events**: Use `trackEventsBatch()` for multiple events
3. **Throttle scroll**: Scroll tracking is already throttled
4. **Lazy load**: Import analytics functions only when needed

---

## Common Patterns

### Track Button Click

```typescript
<button
  onClick={() => {
    trackEvent({
      eventType: LandingEventType.CTA_PRIMARY,
      metadata: { ctaLocation: 'hero' },
    });
    handleAction();
  }}
>
  Click Me
</button>
```

### Track Form Submit

```typescript
const handleSubmit = async (data) => {
  trackEvent({
    eventType: LandingEventType.DEMO_SIGNUP,
    metadata: { fromDemo: true },
  });

  await submitForm(data);
};
```

### Track Route Change

```typescript
useEffect(() => {
  trackEvent({
    eventType: LandingEventType.PAGE_VIEW,
    metadata: { path: window.location.pathname },
  });
}, [pathname]);
```

---

## Next Steps

1. Add more event types as needed
2. Create analytics dashboard to visualize data
3. Set up alerts for critical metrics
4. Implement A/B testing framework
5. Add revenue attribution

For more information, see:
- `README.md` - Full documentation
- `types.ts` - All available event types
- `test-tracking.ts` - Testing guide
