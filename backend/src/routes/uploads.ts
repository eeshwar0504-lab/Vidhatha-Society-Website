import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`)
});
const upload = multer({ storage });

/**
 * POST /api/uploads
 * Form field: file
 * Returns { ok: true, url }
 */
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file required" });
  const url = `/uploads/${req.file.filename}`;
  return res.json({ ok: true, url });
});

export default router;
