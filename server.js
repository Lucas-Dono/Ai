/**
 * Custom Next.js Server with Socket.IO Integration
 * This server wraps Next.js with Socket.IO for real-time features
 */

// Load environment variables from .env file
// Use override: true to prioritize .env over system environment variables
require("dotenv").config({ override: true });

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({
  dev,
  hostname,
  port,
  // Habilitar Turbopack en desarrollo para compilaciones mucho más rápidas
  turbo: dev,
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  // Initialize Socket.IO only after Next.js is ready
  // We import dynamically to ensure the module is transpiled
  if (process.env.ENABLE_WEBSOCKETS !== "false") {
    import("./lib/socket/server.mjs").then((module) => {
      const { initSocketServer } = module;
      initSocketServer(server);
      console.log("[Server] WebSocket support enabled");
    }).catch((err) => {
      console.error("[Server] Failed to initialize Socket.IO:", err);
      console.log("[Server] Starting without WebSocket support");
    });
  }

  // Initialize Cron Jobs for World Management
  // NOTA: Los cron jobs solo funcionan en producción cuando los archivos están compilados
  // En desarrollo, Next.js no compila archivos fuera de app/pages/api
  if (process.env.ENABLE_CRON_JOBS === "true" && process.env.NODE_ENV === "production") {
    import("./lib/worlds/jobs/index.js").then((module) => {
      const { cronManager } = module;
      cronManager.initialize().then(() => {
        console.log("[Server] Cron jobs initialized for world management");
      }).catch((err) => {
        console.error("[Server] Failed to initialize cron jobs:", err);
      });
    }).catch((err) => {
      console.error("[Server] Failed to load cron manager:", err);
      console.log("[Server] Continuing without cron jobs");
    });
  } else {
    console.log("[Server] Cron jobs disabled (set ENABLE_CRON_JOBS=true in production to enable)");
  }

  server.listen(port, () => {
    console.log(`[Server] Ready on http://${hostname}:${port}`);
  });
});
