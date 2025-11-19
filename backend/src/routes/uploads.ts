// backend/src/routes/uploads.ts

import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { requireAuth, requirePermission } from "../middleware/auth";

/**
 * ✔ Secure file upload route
 * ✔ Enforces MIME whitelist
 * ✔ Prevents path traversal
 * ✔ Sanitizes filenames
 * ✔ RBAC: uploads:create
 */

const router = Router();

// ---------------------
//  Upload Directory
// ---------------------
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ---------------------
//  Allowed MIME Types
// ---------------------
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

// Dangerous extensions to block (even if MIME spoofed)
const BLOCKED_EXT = new Set([
  ".exe",
  ".sh",
  ".bat",
  ".cmd",
  ".js",
  ".ts",
  ".php",
  ".py",
  ".html",
  ".svg", // SVG can contain malicious JS
]);

/**
 * Generate safe filename
 */
function safeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();

  // block malicious extensions
  if (BLOCKED_EXT.has(ext)) {
    return "blocked_" + Date.now() + ".dat";
  }

  const random = crypto.randomBytes(12).toString("hex");
  return `${Date.now()}-${random}${ext}`;
}

// ---------------------
//   Multer Storage
// ---------------------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const name = safeFilename(file.originalname);
    cb(null, name);
  },
});

// ---------------------
//   File Filter
// ---------------------
const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const mimetype = file.mimetype.toLowerCase();
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_MIME.has(mimetype)) {
    console.warn("❌ Upload rejected (mime):", mimetype);
    return cb(new Error("Invalid or unsupported file type"));
  }

  if (BLOCKED_EXT.has(ext)) {
    console.warn("❌ Upload rejected (extension):", ext);
    return cb(new Error("File type not allowed"));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ---------------------
//   POST /api/uploads
// ---------------------
router.post(
  "/",
  requireAuth,
  requirePermission("uploads:create"), // 🔥 RBAC permission
  upload.single("file"),
  (req: Request, res: Response) => {
    try {
      const f = req.file;
      if (!f) return res.status(400).json({ error: "no file uploaded" });

      const fileUrl = `/uploads/${encodeURIComponent(f.filename)}`;

      return res.json({
        ok: true,
        filename: f.filename,
        url: fileUrl,
        mimetype: f.mimetype,
        size: f.size,
      });
    } catch (err) {
      console.error("❌ upload error:", err);
      return res.status(500).json({ error: "upload failed" });
    }
  }
);

export default router;
