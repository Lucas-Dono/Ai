import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Excluir paquetes con binarios nativos del bundle del servidor
  serverExternalPackages: [
    "sharp",
    "onnxruntime-node",
    "@xenova/transformers",
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

export default nextConfig;
