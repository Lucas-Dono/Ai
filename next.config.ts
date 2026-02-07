import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // CRÍTICO: Standalone output para Docker deployment
  output: 'standalone',

  // Security headers para proteger contra vulnerabilidades comunes
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    // CSP más estricto en producción, más permisivo en desarrollo
    const cspDirectives = isDev
      ? [
          // Desarrollo: Next.js requiere unsafe-eval para HMR
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://vercel.live",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com data:",
          "img-src 'self' data: blob: https: http:",
          "media-src 'self' data: blob: https:",
          "connect-src 'self' https: http: ws: wss:",
          "frame-src 'self'",
          "worker-src 'self' blob:",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ]
      : [
          // Producción: CSP más estricto (sin unsafe-eval)
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://vercel.live https://va.vercel-scripts.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com data:",
          "img-src 'self' data: blob: https:",
          "media-src 'self' data: blob: https:",
          // connect-src más específico en producción
          "connect-src 'self' wss://*.vercel.app wss://*.railway.app https://*.google.com https://*.googleapis.com https://generativelanguage.googleapis.com https://api.envialosimple.email https://api.mercadopago.com https://api.paddle.com https://*.sentry.io",
          "frame-src 'self'",
          "worker-src 'self' blob:",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          "upgrade-insecure-requests",
        ];

    return [
      {
        // Aplicar a todas las rutas
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          // Strict-Transport-Security solo en producción (HTTPS)
          ...(isDev
            ? []
            : [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ]),
          // Content-Security-Policy
          {
            key: 'Content-Security-Policy',
            value: cspDirectives.join('; '),
          },
        ],
      },
    ];
  },

  // Optimizaciones de memoria y rendimiento
  experimental: {
    // Reducir el uso de memoria en builds grandes
    webpackMemoryOptimizations: true,

    // Optimizar tamaño de chunks para compilación más rápida
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "framer-motion",
      "recharts",
    ],
  },

  // Deshabilitar Sentry en desarrollo para compilaciones más rápidas
  productionBrowserSourceMaps: false,

  // Excluir paquetes con binarios nativos del bundle del servidor
  serverExternalPackages: [
    "sharp",
    "onnxruntime-node",
    "hnswlib-node",
  ],

  // Configuración de Webpack para ignorar módulos nativos en el cliente
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // En el cliente, excluir módulos nativos completamente
      config.resolve.alias = {
        ...config.resolve.alias,
        sharp: false,
        "onnxruntime-node": false,
        "hnswlib-node": false,
        undici: false,
      };

      // Ignorar archivos .node en el cliente
      config.module.rules.push({
        test: /\.node$/,
        use: "null-loader",
      });
    }

    // Marcar paquetes con binarios nativos como externos en el servidor
    if (isServer) {
      // Ignorar módulos con binarios nativos
      config.externals = [
        ...config.externals,
        "llamaindex",
      ];

      // Ignorar archivos .node en el servidor también
      config.module.rules.push({
        test: /\.node$/,
        loader: "node-loader",
      });
    }

    return config;
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Reducir uso de memoria en builds: solo subir sourcemaps en CI
  widenClientFileUpload: process.env.CI ? true : false,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the Sentry project is configured to accept traffic from this origin.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Disabled Vercel-specific features for cloud server deployment
  // automaticVercelMonitors: false,
};

// Make sure adding Sentry options is the last code to run before exporting
// Wrap with next-intl plugin first, then Sentry
// Solo usar Sentry en producción para mejorar performance en desarrollo
const isDev = process.env.NODE_ENV !== "production";
export default isDev
  ? withNextIntl(nextConfig)
  : withSentryConfig(withNextIntl(nextConfig), sentryWebpackPluginOptions);
