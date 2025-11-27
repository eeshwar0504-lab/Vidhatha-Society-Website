// backend/src/utils/cloudinaryDelete.ts
import cloudinary from "../lib/cloudinary";

export async function deleteCloudinaryImage(publicId: string) {
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    // Typical res: { result: 'ok' } or { result: 'not found' }
    return res;
  } catch (err) {
    console.error("cloudinary destroy error:", err);
    throw err;
  }
}
