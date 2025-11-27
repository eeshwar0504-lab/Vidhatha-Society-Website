// backend/src/routes/cloudinary-sign.ts
import express, { Request, Response } from "express";
import crypto from "crypto";

const router = express.Router();

/**
 * POST /api/cloudinary/sign
 * Body: { folder?: string }
 * Response: { api_key, cloud_name, timestamp, signature }
 */
router.post("/sign", (req: Request, res: Response) => {
  try {
    const { folder = "vidhatha/uploads" } = req.body || {};
    const timestamp = Math.floor(Date.now() / 1000);

    // Build paramsToSign in lexicographic order - keep consistent with client
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHmac("sha1", process.env.CLOUDINARY_API_SECRET || "")
      .update(paramsToSign)
      .digest("hex");

    return res.json({
      ok: true,
      timestamp,
      signature,
      api_key: process.env.CLOUDINARY_API_KEY || "",
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
    });
  } catch (err: any) {
    console.error("cloudinary sign error:", err);
    return res.status(500).json({ ok: false, error: err?.message || "Sign failed" });
  }
});

export default router;
