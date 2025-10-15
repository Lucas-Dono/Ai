/**
 * Web Push Notification Service
 * Handles push notification subscriptions and sending
 */

import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// VAPID keys for web push (should be in environment variables)
const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BP_mPzCRBHcG3Z9Vj7nYKqZwX0T5yPnZPnrQPnYKqZwX0T5yPnZPnrQPnYKqZwX0T5yPnZPnrQPnYKqZwX0";
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  "generate-real-vapid-keys-with-web-push-generate-vapid-keys";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

// Configure web push
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * Save push subscription to database
 */
export async function savePushSubscription(
  userId: string,
  subscription: PushSubscription
): Promise<void> {
  try {
    // Store in user metadata
    await prisma.user.update({
      where: { id: userId },
      data: {
        metadata: {
          pushSubscription: subscription as unknown as Prisma.InputJsonValue,
        },
      },
    });

    console.log(`[Push] Subscription saved for user ${userId}`);
  } catch (error) {
    console.error("[Push] Error saving subscription:", error);
    throw error;
  }
}

/**
 * Remove push subscription from database
 */
export async function removePushSubscription(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        metadata: {
          pushSubscription: null,
        },
      },
    });

    console.log(`[Push] Subscription removed for user ${userId}`);
  } catch (error) {
    console.error("[Push] Error removing subscription:", error);
    throw error;
  }
}

/**
 * Get push subscription for a user
 */
export async function getPushSubscription(
  userId: string
): Promise<PushSubscription | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { metadata: true },
    });

    const metadata = user?.metadata as { pushSubscription?: PushSubscription } | null;
    return metadata?.pushSubscription || null;
  } catch (error) {
    console.error("[Push] Error getting subscription:", error);
    return null;
  }
}

/**
 * Send push notification to a user
 */
export async function sendPushNotification(
  userId: string,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const subscription = await getPushSubscription(userId);

    if (!subscription) {
      console.log(`[Push] No subscription found for user ${userId}`);
      return false;
    }

    const pushPayload = JSON.stringify(payload);

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      pushPayload,
      {
        TTL: 86400, // 24 hours
      }
    );

    console.log(`[Push] Notification sent to user ${userId}`);
    return true;
  } catch (error: any) {
    console.error("[Push] Error sending notification:", error);

    // If subscription is invalid/expired, remove it
    if (error.statusCode === 410) {
      await removePushSubscription(userId);
    }

    return false;
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushNotificationToMany(
  userIds: string[],
  payload: NotificationPayload
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  await Promise.all(
    userIds.map(async (userId) => {
      const success = await sendPushNotification(userId, payload);
      if (success) {
        sent++;
      } else {
        failed++;
      }
    })
  );

  return { sent, failed };
}

/**
 * Send notification when agent receives a message
 */
export async function notifyAgentMessage(
  userId: string,
  agentName: string,
  messagePreview: string
): Promise<void> {
  await sendPushNotification(userId, {
    title: `${agentName} replied`,
    body: messagePreview.slice(0, 100),
    icon: "/icons/agent-notification.png",
    badge: "/icons/badge.png",
    tag: "agent-message",
    data: {
      type: "agent-message",
      agentName,
    },
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/icons/view.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  });
}

/**
 * Send notification when user's plan is about to expire
 */
export async function notifySubscriptionExpiring(
  userId: string,
  daysRemaining: number
): Promise<void> {
  await sendPushNotification(userId, {
    title: "Subscription Expiring Soon",
    body: `Your subscription will expire in ${daysRemaining} days. Renew now to keep your agents active.`,
    icon: "/icons/warning.png",
    badge: "/icons/badge.png",
    tag: "subscription-expiring",
    data: {
      type: "subscription-expiring",
      daysRemaining,
    },
    actions: [
      {
        action: "renew",
        title: "Renew Now",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  });
}

/**
 * Send notification when usage limit is approaching
 */
export async function notifyUsageLimitApproaching(
  userId: string,
  resourceType: string,
  percentageUsed: number
): Promise<void> {
  await sendPushNotification(userId, {
    title: "Usage Limit Warning",
    body: `You've used ${percentageUsed}% of your ${resourceType} quota. Consider upgrading your plan.`,
    icon: "/icons/warning.png",
    badge: "/icons/badge.png",
    tag: "usage-warning",
    data: {
      type: "usage-warning",
      resourceType,
      percentageUsed,
    },
    actions: [
      {
        action: "upgrade",
        title: "Upgrade Plan",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  });
}

/**
 * Generate VAPID keys (run once during setup)
 */
export function generateVAPIDKeys() {
  return webpush.generateVAPIDKeys();
}
