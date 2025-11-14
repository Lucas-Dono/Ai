/**
 * Servicio de Checkout para Paddle
 *
 * Maneja creación de transacciones y gestión de suscripciones
 */

import { getPaddleClient, getPaddlePriceId } from "./config";
import { billingLogger as log } from "@/lib/logging/loggers";
import type {
  CreateTransactionRequest,
  Transaction,
  Subscription,
} from "@paddle/paddle-node-sdk";

/**
 * Crea un checkout de Paddle para una suscripción
 */
export async function createPaddleCheckout(params: {
  userId: string;
  userEmail: string;
  planId: string; // "plus" | "ultra"
  interval?: "month" | "year";
  successUrl?: string;
  cancelUrl?: string;
}) {
  const paddle = getPaddleClient();

  const { userId, userEmail, planId, interval = "month", successUrl, cancelUrl } = params;

  log.info(
    {
      userId,
      planId,
      interval,
    },
    "Creating Paddle checkout"
  );

  try {
    const priceId = getPaddlePriceId(planId, interval);

    const transactionRequest: CreateTransactionRequest = {
      items: [
        {
          priceId: priceId,
          quantity: 1,
        },
      ],
      customData: {
        userId: userId,
        planId: planId,
        interval: interval,
      },
      customerEmail: userEmail,
      returnUrl: successUrl || `${process.env.APP_URL}/dashboard/billing?success=true`,
    };

    const transaction = await paddle.transactions.create(transactionRequest);

    const checkoutUrl = transaction.data?.checkoutUrl;

    if (!checkoutUrl) {
      throw new Error("No checkout URL returned from Paddle");
    }

    log.info(
      {
        userId,
        planId,
        transactionId: transaction.data?.id,
        checkoutUrl,
      },
      "Paddle checkout created successfully"
    );

    return {
      checkoutUrl,
      transactionId: transaction.data?.id,
    };
  } catch (error: any) {
    log.error(
      {
        err: error,
        userId,
        planId,
      },
      "Error creating Paddle checkout"
    );
    throw error;
  }
}

/**
 * Obtiene información de una suscripción de Paddle
 */
export async function getPaddleSubscription(subscriptionId: string) {
  const paddle = getPaddleClient();

  log.debug({ subscriptionId }, "Fetching Paddle subscription");

  try {
    const subscription = await paddle.subscriptions.get(subscriptionId);

    return subscription.data;
  } catch (error: any) {
    log.error(
      {
        err: error,
        subscriptionId,
      },
      "Error fetching Paddle subscription"
    );
    throw error;
  }
}

/**
 * Cancela una suscripción de Paddle
 */
export async function cancelPaddleSubscription(subscriptionId: string) {
  const paddle = getPaddleClient();

  log.info({ subscriptionId }, "Cancelling Paddle subscription");

  try {
    const subscription = await paddle.subscriptions.cancel(subscriptionId, {
      effectiveFrom: "next_billing_period", // Cancelar al final del período
    });

    log.info({ subscriptionId }, "Paddle subscription cancelled successfully");

    return subscription.data;
  } catch (error: any) {
    log.error(
      {
        err: error,
        subscriptionId,
      },
      "Error cancelling Paddle subscription"
    );
    throw error;
  }
}

/**
 * Reactiva una suscripción cancelada de Paddle
 */
export async function reactivatePaddleSubscription(subscriptionId: string) {
  const paddle = getPaddleClient();

  log.info({ subscriptionId }, "Reactivating Paddle subscription");

  try {
    const subscription = await paddle.subscriptions.resume(subscriptionId, {
      effectiveFrom: "immediately",
    });

    log.info({ subscriptionId }, "Paddle subscription reactivated successfully");

    return subscription.data;
  } catch (error: any) {
    log.error(
      {
        err: error,
        subscriptionId,
      },
      "Error reactivating Paddle subscription"
    );
    throw error;
  }
}

/**
 * Actualiza una suscripción de Paddle (cambio de plan, etc)
 */
export async function updatePaddleSubscription(
  subscriptionId: string,
  updates: {
    priceId?: string;
    quantity?: number;
  }
) {
  const paddle = getPaddleClient();

  log.info({ subscriptionId, updates }, "Updating Paddle subscription");

  try {
    const subscription = await paddle.subscriptions.update(subscriptionId, {
      items: updates.priceId
        ? [
            {
              priceId: updates.priceId,
              quantity: updates.quantity || 1,
            },
          ]
        : undefined,
    });

    log.info({ subscriptionId }, "Paddle subscription updated successfully");

    return subscription.data;
  } catch (error: any) {
    log.error(
      {
        err: error,
        subscriptionId,
      },
      "Error updating Paddle subscription"
    );
    throw error;
  }
}
