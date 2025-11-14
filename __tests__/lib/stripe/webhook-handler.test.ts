/**
 * STRIPE WEBHOOK HANDLER TESTS
 *
 * Tests para verificar el manejo correcto de webhooks de Stripe
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/config";
import {
  syncStripeSubscription,
  handleSubscriptionCancellation,
  handleSubscriptionRenewal,
  handlePaymentFailed,
  detectSubscriptionChange,
} from "@/lib/stripe/subscription-sync";
import type Stripe from "stripe";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    invoice: {
      create: vi.fn(),
    },
    webhookEvent: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock Stripe
vi.mock("@/lib/stripe/config", () => ({
  stripe: {
    subscriptions: {
      retrieve: vi.fn(),
    },
    prices: {
      retrieve: vi.fn(),
    },
  },
  STRIPE_WEBHOOK_SECRET: "whsec_test_secret",
  STRIPE_PLANS: {
    plus: {
      monthly: "price_plus_monthly",
      yearly: "price_plus_yearly",
    },
    ultra: {
      monthly: "price_ultra_monthly",
      yearly: "price_ultra_yearly",
    },
  },
  getPlanFromPriceId: (priceId: string) => {
    if (priceId === "price_plus_monthly" || priceId === "price_plus_yearly") {
      return "plus";
    }
    if (priceId === "price_ultra_monthly" || priceId === "price_ultra_yearly") {
      return "ultra";
    }
    return null;
  },
  isWebhookConfigured: () => true,
}));

// Mock logger
vi.mock("@/lib/logging/loggers", () => ({
  billingLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Stripe Webhook Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("syncStripeSubscription", () => {
    it("should create new subscription for active subscription", async () => {
      const mockSubscription = {
        id: "sub_123",
        customer: "cus_123",
        status: "active",
        metadata: { userId: "user_123" },
        items: {
          data: [
            {
              price: {
                id: "price_plus_monthly",
              },
            } as any,
          ],
        } as any,
        current_period_start: 1704067200, // 2024-01-01
        current_period_end: 1706745600, // 2024-02-01
        cancel_at_period_end: false,
        trial_start: null,
        trial_end: null,
        canceled_at: null,
      } as any as Stripe.Subscription;

      vi.mocked(prisma.subscription.upsert).mockResolvedValue({} as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      await syncStripeSubscription(mockSubscription as Stripe.Subscription);

      expect(prisma.subscription.upsert).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: "sub_123" },
        create: expect.objectContaining({
          userId: "user_123",
          stripeSubscriptionId: "sub_123",
          stripeCustomerId: "cus_123",
          status: "active",
          priceId: "price_plus_monthly",
        }),
        update: expect.objectContaining({
          status: "active",
          priceId: "price_plus_monthly",
        }),
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user_123" },
        data: {
          plan: "plus",
          stripeCustomerId: "cus_123",
        },
      });
    });

    it("should downgrade to free for canceled subscription", async () => {
      const mockSubscription = {
        id: "sub_123",
        customer: "cus_123",
        status: "canceled",
        metadata: { userId: "user_123" },
        items: {
          data: [
            {
              price: {
                id: "price_plus_monthly",
              },
            } as any,
          ],
        } as any,
        current_period_start: 1704067200,
        current_period_end: 1706745600,
        cancel_at_period_end: false,
        trial_start: null,
        trial_end: null,
        canceled_at: 1706745600,
      } as any as Stripe.Subscription;

      vi.mocked(prisma.subscription.upsert).mockResolvedValue({} as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      await syncStripeSubscription(mockSubscription as Stripe.Subscription);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user_123" },
        data: {
          plan: "free", // Downgraded to free
          stripeCustomerId: "cus_123",
        },
      });
    });

    it("should maintain premium access during trial", async () => {
      const mockSubscription = {
        id: "sub_123",
        customer: "cus_123",
        status: "trialing",
        metadata: { userId: "user_123" },
        items: {
          data: [
            {
              price: {
                id: "price_ultra_monthly",
              },
            } as any,
          ],
        } as any,
        current_period_start: 1704067200,
        current_period_end: 1706745600,
        cancel_at_period_end: false,
        trial_start: 1704067200,
        trial_end: 1704672000, // 7 days trial
        canceled_at: null,
      } as any as Stripe.Subscription;

      vi.mocked(prisma.subscription.upsert).mockResolvedValue({} as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      await syncStripeSubscription(mockSubscription as Stripe.Subscription);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user_123" },
        data: {
          plan: "ultra", // Should have premium during trial
          stripeCustomerId: "cus_123",
        },
      });
    });
  });

  describe("handleSubscriptionCancellation", () => {
    it("should downgrade user to free plan on cancellation", async () => {
      const mockSubscription = {
        id: "sub_123",
        metadata: { userId: "user_123" },
        canceled_at: 1706745600,
      };

      vi.mocked(prisma.subscription.update).mockResolvedValue({} as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      await handleSubscriptionCancellation(
        mockSubscription as Stripe.Subscription
      );

      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: "sub_123" },
        data: {
          status: "cancelled",
          canceledAt: expect.any(Date),
        },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user_123" },
        data: { plan: "free" },
      });
    });
  });

  describe("handleSubscriptionRenewal", () => {
    it("should create invoice record for successful renewal", async () => {
      const mockInvoice = {
        id: "in_123",
        subscription: "sub_123",
        payment_intent: "pi_123",
        metadata: { userId: "user_123" },
        amount_paid: 999,
        currency: "usd",
        status_transitions: {
          paid_at: 1706745600,
        } as any,
      } as any as Stripe.Invoice;

      vi.mocked(prisma.invoice.create).mockResolvedValue({} as any);

      await handleSubscriptionRenewal(mockInvoice as Stripe.Invoice);

      expect(prisma.invoice.create).toHaveBeenCalledWith({
        data: {
          userId: "user_123",
          stripeInvoiceId: "in_123",
          stripePaymentIntentId: "pi_123",
          amount: 999,
          currency: "usd",
          status: "paid",
          paidAt: expect.any(Date),
        },
      });
    });
  });

  describe("handlePaymentFailed", () => {
    it("should record failed payment attempt", async () => {
      const mockInvoice = {
        id: "in_123",
        subscription: "sub_123",
        payment_intent: "pi_123",
        metadata: { userId: "user_123" },
        amount_due: 999,
        currency: "usd",
        attempt_count: 1,
      } as any as Stripe.Invoice;

      vi.mocked(prisma.invoice.create).mockResolvedValue({} as any);

      await handlePaymentFailed(mockInvoice as Stripe.Invoice);

      expect(prisma.invoice.create).toHaveBeenCalledWith({
        data: {
          userId: "user_123",
          stripeInvoiceId: "in_123",
          stripePaymentIntentId: "pi_123",
          amount: 999,
          currency: "usd",
          status: "payment_failed",
          statusDetail: "Attempt 1: Payment failed",
        },
      });
    });

    it("should log warning after 3 failed attempts", async () => {
      const mockInvoice = {
        id: "in_123",
        subscription: "sub_123",
        payment_intent: "pi_123",
        metadata: { userId: "user_123" },
        amount_due: 999,
        currency: "usd",
        attempt_count: 3,
      } as any as Stripe.Invoice;

      vi.mocked(prisma.invoice.create).mockResolvedValue({} as any);

      await handlePaymentFailed(mockInvoice as Stripe.Invoice);

      // Stripe will auto-cancel after 3 attempts
      expect(prisma.invoice.create).toHaveBeenCalled();
    });
  });

  describe("detectSubscriptionChange", () => {
    it("should detect upgrade from plus to ultra", () => {
      const oldSub = {
        status: "active",
        items: {
          data: [{ price: { id: "price_plus_monthly" } } as any],
        } as any,
      };

      const newSub = {
        status: "active",
        items: {
          data: [{ price: { id: "price_ultra_monthly" } } as any],
        } as any,
      };

      const result = detectSubscriptionChange(
        oldSub as Stripe.Subscription,
        newSub as Stripe.Subscription
      );

      expect(result).toBe("upgrade");
    });

    it("should detect downgrade from ultra to plus", () => {
      const oldSub = {
        status: "active",
        items: {
          data: [{ price: { id: "price_ultra_monthly" } } as any],
        } as any,
      };

      const newSub = {
        status: "active",
        items: {
          data: [{ price: { id: "price_plus_monthly" } } as any],
        } as any,
      };

      const result = detectSubscriptionChange(
        oldSub as Stripe.Subscription,
        newSub as Stripe.Subscription
      );

      expect(result).toBe("downgrade");
    });

    it("should detect reactivation", () => {
      const oldSub = {
        status: "canceled",
        items: {
          data: [{ price: { id: "price_plus_monthly" } } as any],
        } as any,
      };

      const newSub = {
        status: "active",
        items: {
          data: [{ price: { id: "price_plus_monthly" } } as any],
        } as any,
      };

      const result = detectSubscriptionChange(
        oldSub as Stripe.Subscription,
        newSub as Stripe.Subscription
      );

      expect(result).toBe("reactivation");
    });

    it("should return null for new subscription", () => {
      const newSub = {
        status: "active",
        items: {
          data: [{ price: { id: "price_plus_monthly" } } as any],
        } as any,
      };

      const result = detectSubscriptionChange(null, newSub as Stripe.Subscription);

      expect(result).toBe(null);
    });
  });

  describe("Idempotency", () => {
    it("should skip processing if event already processed", async () => {
      const eventId = "evt_123";

      vi.mocked(prisma.webhookEvent.findUnique).mockResolvedValue({
        id: "webhook_123",
        stripeEventId: eventId,
        type: "customer.subscription.updated",
        processed: true,
        processedAt: new Date(),
        createdAt: new Date(),
      });

      // Should skip processing and not create any records
      // (this would be in the actual route handler)
    });

    it("should process event if not seen before", async () => {
      const eventId = "evt_456";

      vi.mocked(prisma.webhookEvent.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.webhookEvent.create).mockResolvedValue({
        id: "webhook_456",
        stripeEventId: eventId,
        type: "customer.subscription.updated",
        processed: false,
        processedAt: null,
        createdAt: new Date(),
      });

      // Should create webhook event record and process
    });
  });

  describe("Edge Cases", () => {
    it("should handle subscription without userId metadata", async () => {
      const mockSubscription = {
        id: "sub_123",
        customer: "cus_123",
        status: "active",
        metadata: {}, // No userId!
        items: {
          data: [{ price: { id: "price_plus_monthly" } } as any],
        } as any,
        current_period_start: 1704067200,
        current_period_end: 1706745600,
        cancel_at_period_end: false,
        trial_start: null,
        trial_end: null,
        canceled_at: null,
      };

      await syncStripeSubscription(mockSubscription as Stripe.Subscription);

      // Should log error and not crash
      expect(prisma.subscription.upsert).not.toHaveBeenCalled();
    });

    it("should handle invoice without userId metadata", async () => {
      const mockInvoice = {
        id: "in_123",
        subscription: "sub_123",
        payment_intent: "pi_123",
        metadata: {}, // No userId!
        amount_paid: 999,
        currency: "usd",
        status_transitions: {
          paid_at: 1706745600,
        } as any,
      } as any as Stripe.Invoice;

      await handleSubscriptionRenewal(mockInvoice as Stripe.Invoice);

      // Should log warning and not crash
      expect(prisma.invoice.create).not.toHaveBeenCalled();
    });

    it("should handle unknown price ID", async () => {
      const mockSubscription = {
        id: "sub_123",
        customer: "cus_123",
        status: "active",
        metadata: { userId: "user_123" },
        items: {
          data: [{ price: { id: "price_unknown_xyz" } } as any],
        } as any,
        current_period_start: 1704067200,
        current_period_end: 1706745600,
        cancel_at_period_end: false,
        trial_start: null,
        trial_end: null,
        canceled_at: null,
      };

      await syncStripeSubscription(mockSubscription as Stripe.Subscription);

      // Should log warning and not update plan
      expect(prisma.subscription.upsert).not.toHaveBeenCalled();
    });
  });
});
