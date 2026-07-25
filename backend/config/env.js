import dotenv from "dotenv";

dotenv.config();

function required(name, fallback) {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === "") {
    throw new Error(`Missing env var: ${name}`);
  }
  return v;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 5000),

  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:5173",

  JSON_LIMIT: process.env.JSON_LIMIT ?? "1mb",

  MONGODB_URI: required("MONGODB_URI", undefined),

  JWT_SECRET: required("JWT_SECRET", undefined),

  UPLOADS_DIR: process.env.UPLOADS_DIR ?? "uploads",
};
