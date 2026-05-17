/**
 * Production-style Express server bootstrap.
 * - Keeps wiring minimal
 * - Loads env/config
 * - Mounts routes
 */

import express from "express";
import cors from "cors";
import http from "http";

import { env } from "./config/env.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

import { rootRouter } from "./routes/index.js";

export function createServer() {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(express.json({ limit: env.JSON_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: env.JSON_LIMIT }));

  app.use(requestLogger);

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api", rootRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  const server = http.createServer(app);
  return server;
}

// If started directly: `node backend/server.js`
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createServer();
  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[backend] listening on port ${env.PORT}`);
  });
}

