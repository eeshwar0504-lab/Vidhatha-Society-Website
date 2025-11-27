// backend/src/lib/cloudinary.ts
import dotenv from "dotenv";
dotenv.config(); // <-- ensure .env is loaded for scripts (ts-node, migrations)

import { v2 as cloudinaryV2, UploadApiOptions, UploadApiResponse } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
const apiKey = process.env.CLOUDINARY_API_KEY || "";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

// Optionally accept CLOUDINARY_URL if you set that instead:
// e.g. CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
const cloudinaryUrl = process.env.CLOUDINARY_URL || "";

if (!cloudName && cloudinaryUrl) {
  // If CLOUDINARY_URL is present, cloudinary SDK can parse it automatically.
  // But we'll still console.log for debugging.
  // eslint-disable-next-line no-console
  console.info("Using CLOUDINARY_URL for configuration");
}

cloudinaryV2.config({
  cloud_name: cloudName || undefined,
  api_key: apiKey || undefined,
  api_secret: apiSecret || undefined,
  secure: true,
});

if (!cloudName || !apiKey || !apiSecret) {
  // eslint-disable-next-line no-console
  console.warn("⚠️ Cloudinary: missing CLOUDINARY_* env vars. Uploads will fail.");
}

export default cloudinaryV2;

export async function uploadFile(
  filePathOrBuffer: string | Buffer,
  options?: UploadApiOptions
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    cloudinaryV2.uploader.upload(
      filePathOrBuffer as any,
      options || {},
      (err, result) => {
        if (err) return reject(err);
        if (!result) return reject(new Error("No result from Cloudinary upload"));
        resolve(result);
      }
    );
  });
}

export async function destroy(publicId: string) {
  return new Promise((resolve, reject) => {
    cloudinaryV2.uploader.destroy(publicId, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}
