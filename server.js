/**
 * Custom Next.js Server with Socket.IO Integration
 * This server wraps Next.js with Socket.IO for real-time features
 */

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
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
    import("./lib/socket/server.js").then((module) => {
      const { initSocketServer } = module;
      initSocketServer(server);
      console.log("[Server] WebSocket support enabled");
    }).catch((err) => {
      console.error("[Server] Failed to initialize Socket.IO:", err);
      console.log("[Server] Starting without WebSocket support");
    });
  }

  server.listen(port, () => {
    console.log(`[Server] Ready on http://${hostname}:${port}`);
  });
});
