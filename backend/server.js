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

app.disable("x-powered-by");

// CORS
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body Parser
app.use(express.json({ limit: env.JSON_LIMIT }));
app.use(express.urlencoded({ extended: true }));

// Logger
app.use(requestLogger);

// Health Route
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend Running Successfully",
  });
});

// API Routes
app.use("/api", rootRouter);

// Error Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// HTTP Server
const server = http.createServer(app);

// Socket
initSocket(server);

// Database + Server Start
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