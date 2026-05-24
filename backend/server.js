import express from "express";
import cors from "cors";
import http from "http";

import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";

import { requestLogger } from "./middleware/requestLogger.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

import { rootRouter } from "./routes/index.js";
import { initSocket } from "./socket/index.js";

const app = express();

// Disable signature header for security
app.disable("x-powered-by");

// CORS Configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Payload Parsing Limits
app.use(express.json({ limit: env.JSON_LIMIT }));
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use(requestLogger);

// Health Check Route
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend Running Successfully",
  });
});

// Mounted API Routes
app.use("/api", rootRouter);

// Error Fallbacks
app.use(notFoundHandler);
app.use(errorHandler);

// HTTP + Socket server initialization
const server = http.createServer(app);
initSocket(server);
  
// Database Connection & Server Boot
connectDb()
  .then(() => {
    console.log("MongoDB Connected Successfully");
    server.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Failed:", err.message);
  });