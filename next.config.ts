import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Optimizaciones de memoria
  experimental: {
    // Reducir el uso de memoria en builds grandes
    webpackMemoryOptimizations: true,
  },

  // Excluir paquetes con binarios nativos del bundle del servidor
  serverExternalPackages: [
    "sharp",
    "onnxruntime-node",
    "hnswlib-node",
    "node-llama-cpp",
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
        "node-llama-cpp": false,
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
      // Ignorar módulos específicos de node-llama-cpp que causan problemas
      config.externals = [
        ...config.externals,
        "node-llama-cpp",
        "@reflink/reflink",
        "@reflink/reflink-linux-x64-gnu",
        "ipull",
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
export default withSentryConfig(withNextIntl(nextConfig), sentryWebpackPluginOptions);
