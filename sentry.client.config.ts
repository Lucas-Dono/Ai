// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
    Sentry.feedbackIntegration({
      // Additional SDK configuration goes in here, for example:
      colorScheme: "system",
      showBranding: false,
      triggerLabel: "Reportar un error",
      formTitle: "Reportar un problema",
      submitButtonLabel: "Enviar reporte",
      cancelButtonLabel: "Cancelar",
      confirmButtonLabel: "Confirmar",
      addScreenshotButtonLabel: "Agregar captura de pantalla",
      removeScreenshotButtonLabel: "Eliminar captura",
      nameLabel: "Nombre",
      namePlaceholder: "Tu nombre",
      emailLabel: "Email",
      emailPlaceholder: "tu@email.com",
      messageLabel: "Descripción del problema",
      messagePlaceholder: "¿Qué sucedió? ¿Qué esperabas que sucediera?",
      isRequiredLabel: "(requerido)",
      successMessageText: "¡Gracias por tu reporte! Lo revisaremos pronto.",
    }),
  ],

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  // Ignore specific errors
  ignoreErrors: [
    // Random plugins/extensions
    "top.GLOBALS",
    // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    // Facebook borked
    "fb_xd_fragment",
    // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to
    // reduce this. (thanks @acdha)
    // See http://stackoverflow.com/questions/4113268
    "bmi_SafeAddOnload",
    "EBCallBackMessageReceived",
    // Chrome extensions
    "Extension context invalidated",
    // Network errors
    "NetworkError",
    "Network request failed",
    "Failed to fetch",
    "Load failed",
    // Abort errors
    "AbortError",
    "The operation was aborted",
  ],

  // Beforebreadcrumb to filter sensitive data
  beforeBreadcrumb(breadcrumb) {
    // Don't send breadcrumbs for auth endpoints
    if (breadcrumb.category === "fetch" && breadcrumb.data?.url) {
      const url = breadcrumb.data.url;
      if (url.includes("/api/auth") || url.includes("password")) {
        return null;
      }
    }
    return breadcrumb;
  },

  // BeforeSend to scrub PII
  beforeSend(event, hint) {
    // Scrub sensitive data
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers["Authorization"];
        delete event.request.headers["Cookie"];
      }
      // Remove sensitive query params
      if (event.request.url) {
        try {
          const url = new URL(event.request.url);
          url.searchParams.delete("token");
          url.searchParams.delete("password");
          url.searchParams.delete("api_key");
          event.request.url = url.toString();
        } catch (e) {
          // Invalid URL, skip
        }
      }
    }

    return event;
  },
});
