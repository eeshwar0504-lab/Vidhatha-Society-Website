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
  const mimetype = (file.mimetype || "").toLowerCase();
  const ext = path.extname(file.originalname || "").toLowerCase();

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

/**
 * New: POST /api/uploads/single
 * - Accepts common field names: "image", "file", "upload"
 * - Returns multiple keys: url, fileUrl, path, location, filename
 * - Normalizes to absolute url if BACKEND_BASE_URL is present
 * - Keeps same RBAC (requires uploads:create)
 */
router.post("/single", requireAuth, requirePermission("uploads:create"), (req: Request, res: Response) => {
  // accept fields image|file|upload
  const multi = multer().fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
    { name: "upload", maxCount: 1 },
  ]);

  // Use the same storage & filter but via upload.fields wrapper
  // We need to call the storage-aware uploader; create an uploader using same storage+filter
  const uploader = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }).fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
    { name: "upload", maxCount: 1 },
  ]);

  uploader(req as any, res as any, (err: any) => {
    try {
      if (err) {
        console.error("❌ upload.single (multi-field) error:", err);
        const message = err?.message || "upload failed";
        return res.status(400).json({ ok: false, error: message });
      }

      const files = (req as any).files || {};
      let f: Express.Multer.File | undefined;

      if (files.image && files.image[0]) f = files.image[0];
      else if (files.file && files.file[0]) f = files.file[0];
      else if (files.upload && files.upload[0]) f = files.upload[0];

      if (!f) {
        return res.status(400).json({ ok: false, error: "No file uploaded (accepted fields: image, file, upload)" });
      }

      // Build path and absolute URL if possible
      const relPath = `/uploads/${encodeURIComponent(f.filename)}`;
      const base = (process.env.BACKEND_BASE_URL || "").replace(/\/$/, "");
      const url = base ? `${base}${relPath}` : relPath;

      return res.json({
        ok: true,
        filename: f.filename,
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        // provide many keys so older frontends will find what they expect
        url,
        fileUrl: url,
        location: url,
        path: relPath,
      });
    } catch (ex) {
      console.error("❌ unexpected error in /single:", ex);
      return res.status(500).json({ ok: false, error: "Internal server error" });
    }
  });
});

export default router;
