// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  integrations: [
    // Prisma integration for database query monitoring
    Sentry.prismaIntegration(),
  ],

  // Ignore specific errors
  ignoreErrors: [
    // Prisma known issues
    "PrismaClientKnownRequestError",
    // Network timeouts that are expected
    "ETIMEDOUT",
    "ECONNRESET",
    // Rate limit errors (we handle these separately)
    "Rate limit exceeded",
  ],

  // BeforeSend to scrub PII and add context
  beforeSend(event, hint) {
    // Scrub sensitive data
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers["authorization"];
        delete event.request.headers["cookie"];
        delete event.request.headers["x-api-key"];
      }

      // Remove sensitive data from body
      if (event.request.data) {
        try {
          const data = typeof event.request.data === 'string'
            ? JSON.parse(event.request.data)
            : event.request.data;
          if (data.password) delete data.password;
          if (data.token) delete data.token;
          if (data.apiKey) delete data.apiKey;
          event.request.data = typeof event.request.data === 'string'
            ? JSON.stringify(data)
            : data;
        } catch (e) {
          // Not JSON, leave as is
        }
      }
    }

    // Add server context
    if (event.contexts) {
      event.contexts.runtime = {
        name: "node",
        version: process.version,
      };
      event.contexts.server = {
        memory_usage: process.memoryUsage(),
        uptime: process.uptime(),
      };
    }

    return event;
  },

  // Traces sampler for more granular control
  tracesSampler(samplingContext: any) {
    // Don't trace health checks
    if (samplingContext.request?.url?.includes("/api/health")) {
      return 0;
    }

    // Always trace errors
    if (samplingContext.transactionContext?.op === "http.server") {
      return 1.0;
    }

    // Default sampling rate
    return process.env.NODE_ENV === "production" ? 0.1 : 1.0;
  },
});
