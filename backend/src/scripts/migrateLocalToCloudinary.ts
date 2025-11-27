// backend/src/scripts/migrateLocalToCloudinary.ts
import dotenv from "dotenv";
dotenv.config();


import fs from "fs";
import path from "path";
import cloudinary from "../lib/cloudinary"; // <- correct relative path
import { UploadApiResponse } from "cloudinary";

// NOTE: This script runs in Node (ts-node or compiled). Ensure env vars are loaded (e.g. via cross-env or dotenv).

console.log("Cloudinary envs at runtime:",
  {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? "set" : "MISSING",
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? "set" : "MISSING",
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? "set" : "MISSING",
    CLOUDINARY_URL: process.env.CLOUDINARY_URL ? "set" : "MISSING",
  }
);

async function uploadFileToCloudinary(localPath: string, folder = "vidhatha/uploads"): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      localPath,
      { folder, resource_type: "image", use_filename: true, unique_filename: false },
      (err, result) => {
        if (err) return reject(err);
        if (!result) return reject(new Error("Empty result from Cloudinary"));
        resolve(result);
      }
    );
  });
}

async function main() {
  try {
    const uploadsDir = path.resolve(__dirname, "../../uploads"); // backend/uploads (adjust if your uploads dir is elsewhere)
    if (!fs.existsSync(uploadsDir)) {
      console.error("Uploads directory not found:", uploadsDir);
      process.exit(1);
    }

    const files = fs.readdirSync(uploadsDir).filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext);
    });

    console.log(`Found ${files.length} image(s) in ${uploadsDir}`);

    for (const filename of files) {
      const localPath = path.join(uploadsDir, filename);
      try {
        console.log("Uploading:", filename);
        const result = await uploadFileToCloudinary(localPath);
        console.log("Uploaded:", filename, "->", result.secure_url);

        // Optionally: update DB records here:
        // e.g. await updateProgramsImageUrlInDB(localPath, result.secure_url, result.public_id);
        // The mapping strategy depends on how file names are referenced in DB (e.g., /uploads/<filename>).
      } catch (err: any) {
        console.error("Failed to upload", filename, ":", err.message || err);
      }
    }

    console.log("Migration complete.");
    process.exit(0);
  } catch (err: any) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  // If you use dotenv, load here:
  // import dotenv from "dotenv"; dotenv.config({ path: path.resolve(__dirname, "../../.env") });
  main();
}
