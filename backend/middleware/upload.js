import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { env } from "../config/env.js";

// ── Ensure uploads directory exists
const uploadsDir = path.resolve(env.UPLOADS_DIR || "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Sub-directories for organisation
const DIRS = {
  thumbnails: path.join(uploadsDir, "thumbnails"),
  videos: path.join(uploadsDir, "videos"),
  documents: path.join(uploadsDir, "documents"),
};

Object.values(DIRS).forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ── Dynamic destination — routes each file to the correct sub-folder
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, DIRS.thumbnails);
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, DIRS.videos);
    } else {
      cb(null, DIRS.documents);
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

// ── Strict file-type filter
function fileFilter(_req, file, cb) {
  const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const videoTypes = ["video/mp4", "video/webm", "video/quicktime"];
  const docTypes   = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-zip"
  ];
  const audioTypes = [
    "audio/webm",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/m4a",
    "audio/mpeg",
    "audio/x-m4a",
    "audio/aac",
    "audio/flac",
    "audio/mp4"
  ];

  const allowed = [...imageTypes, ...videoTypes, ...docTypes, ...audioTypes];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error(`File type '${file.mimetype}' is not allowed`), {
        statusCode: 415,
      }),
      false
    );
  }
}

// ── Base uploader (used directly for multi-field or generic routes)
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB for images; overridden per route if needed
});

// ── Course thumbnail uploader — images only, 5 MB max
export const uploadThumbnail = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        Object.assign(
          new Error("Thumbnail must be a JPEG, PNG, or WebP image"),
          { statusCode: 415 }
        ),
        false
      );
    }
  },
});

// ── Helper: delete a file from disk by its filename key
export function deleteUploadedFile(filename) {
  if (!filename) return;
  // Search all sub-dirs
  for (const dir of Object.values(DIRS)) {
    const fullPath = path.join(dir, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlink(fullPath, (err) => {
        if (err) console.error(`[upload] Failed to delete file: ${fullPath}`, err.message);
      });
      return;
    }
  }
}

// ── Build public thumbnail URL from filename key
export function buildFileUrl(req, filename, subdir = "thumbnails") {
  if (!filename) return "";
  const protocol = req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}/uploads/${subdir}/${filename}`;
}

export { DIRS };