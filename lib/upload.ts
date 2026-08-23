// lib/upload.ts — Multer configuration for Next.js API Routes
// Disable Next.js default body parser per route to use multer

import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

const uploadsDir = path.resolve(process.env.UPLOADS_DIR || "uploads");

// Ensure upload directories exist
const DIRS = {
  thumbnails: path.join(uploadsDir, "thumbnails"),
  videos: path.join(uploadsDir, "videos"),
  documents: path.join(uploadsDir, "documents"),
};

Object.values(DIRS).forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ── Dynamic storage routing
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, DIRS.thumbnails);
    else if (file.mimetype.startsWith("video/")) cb(null, DIRS.videos);
    else cb(null, DIRS.documents);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

// ── Strict file-type filter
function fileFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-zip-compressed",
    "audio/webm",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/mpeg",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type '${file.mimetype}' is not allowed`));
  }
}

// ── General uploader (10MB)
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ── Thumbnail uploader — images only, 5MB max
export const uploadThumbnail = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Thumbnail must be a JPEG, PNG, or WebP image"));
  },
});

// ── Delete file from disk by filename
export function deleteUploadedFile(filename: string): void {
  if (!filename) return;
  for (const dir of Object.values(DIRS)) {
    const fullPath = path.join(dir, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlink(fullPath, (err) => {
        if (err)
          console.error(
            `[upload] Failed to delete file: ${fullPath}`,
            err.message,
          );
      });
      return;
    }
  }
}

// ── Build public URL for uploaded file
export function buildFileUrl(
  filename: string,
  subdir: keyof typeof DIRS = "thumbnails",
): string {
  if (!filename) return "";
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "")
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");
  return `${baseUrl}/api/uploads/${subdir}/${filename}`;
}

export { DIRS };
