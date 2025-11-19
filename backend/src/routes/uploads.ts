// backend/src/routes/uploads.ts
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

// Local upload directory (dev). Ensure /uploads exists at project root.
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

/**
 * POST /api/uploads
 * - admin only (requireAuth + requireAdmin)
 * - field: `file`
 * - returns { ok: true, url, filename }
 *
 * Note: For production you should replace this with Cloudinary / S3 upload and return external URL.
 */
router.post("/", requireAuth, requireAdmin, upload.single("file"), async (req, res) => {
  try {
    const f = req.file;
    if (!f) return res.status(400).json({ error: "no file uploaded" });

    // In dev: return URL to static file (server must serve /uploads)
    const urlPath = `/uploads/${encodeURIComponent(f.filename)}`;

    return res.json({ ok: true, filename: f.filename, url: urlPath });
  } catch (err) {
    console.error("upload error:", err);
    return res.status(500).json({ error: "upload failed" });
  }
});

export default router;
