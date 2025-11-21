// lib/uploadHelper.ts
import api from "./api";
import type { AxiosProgressEvent } from "axios";

export async function uploadImage(file: File): Promise<string | null> {
  if (!file) return null;

  try {
    const fd = new FormData();
    fd.append("image", file); // MUST be "image" (backend requirement)

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    console.info("Uploading image to:", (api.defaults.baseURL ?? "") + "/api/uploads/single");

    const res = await api.post("/api/uploads/single", fd, {
      headers,
      onUploadProgress: (e: AxiosProgressEvent) => {
        if (e.total) {
          const pct = Math.round((e.loaded * 100) / e.total);
          console.debug(`Upload progress: ${pct}%`);
        }
      },
    });

    const url =
      res?.data?.url ||
      res?.data?.fileUrl ||
      res?.data?.data?.url ||
      res?.data?.result?.secure_url ||
      null;

    if (!url) {
      console.error("Upload successful but no URL returned:", res?.data);
      return null;
    }

    return url;
  } catch (err: any) {
    console.error("Upload error:", err);
    return null;
  }
}
