import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import compression from "compression";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import xss from "xss-clean";
import mongoSanitize from "mongo-sanitize";

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

// Secure HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Prevent Cross-Site Scripting (XSS)
app.use(xss());

// Prevent MongoDB Operator Injection (Mongo Sanitization)
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize(req.body);
  if (req.query) req.query = mongoSanitize(req.query);
  if (req.params) req.params = mongoSanitize(req.params);
  next();
});

// Rate limiting configurations
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 200, // Limit each IP to 200 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use("/api", limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // Limit each IP to 30 requests per 15 minutes for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication attempts, please try again in 15 minutes.",
  },
});
app.use("/api/auth", authLimiter);

// CORS Configuration
const allowedOrigins = [
  env.CORS_ORIGIN,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isLocal =
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):/i.test(
        origin,
      );
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

// Static file serving — uploaded thumbnails, documents etc.
app.use(
  "/uploads",
  express.static(path.resolve(process.env.UPLOADS_DIR || "uploads")),
);

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
