import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Excluir paquetes con binarios nativos del bundle del servidor
  serverExternalPackages: [
    "sharp",
    "onnxruntime-node",
    "@xenova/transformers",
  ],

  // Configuración de Webpack para ignorar módulos nativos en el cliente
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // En el cliente, excluir módulos nativos completamente
      config.resolve.alias = {
        ...config.resolve.alias,
        sharp: false,
        "onnxruntime-node": false,
      };

      // Ignorar archivos .node en el cliente
      config.module.rules.push({
        test: /\.node$/,
        use: "null-loader",
      });
    }

    // Marcar paquetes con binarios nativos como externos en el servidor
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "sharp": "commonjs sharp",
        "onnxruntime-node": "commonjs onnxruntime-node",
      });
    }

    return config;
  },
};

export default nextConfig;
