// backend/src/routes/uploads-cloudinary.ts
import express, { Request, Response } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../lib/cloudinary";
import { requireAuth, requirePermission } from "../middleware/auth"; // adjust path if needed

const router = express.Router();

/**
 * Use params as a function returning `any` to avoid strict typing issues
 * with different versions of @types for multer-storage-cloudinary.
 */
const storage = new CloudinaryStorage({
  cloudinary,
  params: (_req: Request, _file: Express.Multer.File) =>
    ({
      folder: "vidhatha/uploads",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      transformation: [{ width: 1600, crop: "limit" }],
      resource_type: "image",
    } as any),
});

const upload = multer({ storage });

/**
 * Only augment Express.Multer.File with additional Cloudinary fields.
 * Do NOT redeclare fields that are already present on Express.Multer.File
 * (like `path` or `filename`) with a different optional/required signature.
 */
type CloudinaryFile = Express.Multer.File & {
  secure_url?: string;
  url?: string;
  public_id?: string;
  // any other cloudinary-specific fields you expect:
  // e.g. bytes?: number; width?: number; height?: number;
};

/**
 * Helper to extract a best-effort url from the uploaded file.
 */
function extractUrl(file?: CloudinaryFile | null): string | null {
  if (!file) return null;
  // Cloudinary-backed multer storage adapters sometimes put the CDN url on different props
  return (file.secure_url as string) || (file.url as string) || (file.path as string) || null;
}

/**
 * POST /api/uploads
 * Accepts FormData field "file"
 */
router.post(
  "/",
  requireAuth,
  requirePermission("uploads:create"),
  upload.single("file"),
  (req: Request & { file?: CloudinaryFile }, res: Response) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ ok: false, error: "No file uploaded" });

      const url = extractUrl(file);
      return res.json({
        ok: true,
        // Multer normally provides `filename`, cloudinary adapter may provide `public_id`
        filename: file.filename ?? file.originalname ?? file.public_id ?? null,
        url,
        fileUrl: url,
        public_id: file.public_id ?? null,
        provider: "cloudinary",
      });
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      return res.status(500).json({ ok: false, error: err?.message || "Upload failed" });
    }
  }
);

/**
 * Backwards-compatibility: accept FormData field "image" at /single
 */
router.post(
  "/single",
  requireAuth,
  requirePermission("uploads:create"),
  upload.single("image"),
  (req: Request & { file?: CloudinaryFile }, res: Response) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ ok: false, error: "No file uploaded" });

      const url = extractUrl(file);
      return res.json({
        ok: true,
        filename: file.filename ?? file.originalname ?? file.public_id ?? null,
        url,
        fileUrl: url,
        public_id: file.public_id ?? null,
        provider: "cloudinary",
      });
    } catch (err: any) {
      console.error("Cloudinary upload error (single):", err);
      return res.status(500).json({ ok: false, error: err?.message || "Upload failed" });
    }
  }
);

export default router;
