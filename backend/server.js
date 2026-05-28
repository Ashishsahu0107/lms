import express from "express";
import cors from "cors";
import http from "http";
import compression from "compression";

import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";

import { requestLogger } from "./middleware/requestLogger.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

import { rootRouter } from "./routes/index.js";
import { initSocket } from "./socket/index.js";

const app = express();

// Enable Gzip payload compression
app.use(compression());

// Disable signature header for security
app.disable("x-powered-by");

// CORS Configuration
const allowedOrigins = [env.CORS_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isLocal = origin.startsWith("http://localhost:") || 
                    origin.startsWith("http://127.0.0.1:") || 
                    /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):/i.test(origin);
    if (isLocal || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

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